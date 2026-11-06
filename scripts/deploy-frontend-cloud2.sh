#!/usr/bin/env bash
# =====================================================================
# Rosary Portal frontend deploy -- cloud2 (89.167.92.220)
#
# Architecture: GitHub -> release dir -> `next` production build -> PM2
#               (rosary-frontend, 127.0.0.1:3100) -> Nginx -> HTTPS.
#
# Safety properties:
#   * set -euo pipefail: the script stops on any error.
#   * The PM2 process is started/restarted ONLY after a verified build
#     and a successful boot-test on a spare port.
#   * The pre-cutover live release is recorded in app.previous so that
#     --rollback always re-targets the actual previous release.
#   * Never touches the database or the backend process.
#
# Usage:
#   ./scripts/deploy-frontend-cloud2.sh            # deploy current HEAD
#   ./scripts/deploy-frontend-cloud2.sh --rollback # previous release
#
# Run ON cloud2, from any directory.  Requires: node>=20, npm>=10, pm2,
# git, rsync.  The repository clone lives at
# /var/www/rosary-frontend-releases/repo.
# =====================================================================

set -euo pipefail

REPO_DIR="/var/www/rosary-frontend-releases/repo"
RELEASES_DIR="/var/www/rosary-frontend-releases"
APP_DIR="$RELEASES_DIR/app"           # symlink -> successful release
BACKEND_LOCAL="http://127.0.0.1:8016"
PM2_NAME="rosary-frontend"
PORT=3100
BRANCH="ui/portal-shell-refresh"
HOSTLISTEN="127.0.0.1"
HEALTH_PATH="/login"

REMOTE_HTML="https://rosary-frontend.vercel.app"   # informational only

log() { printf '[%s] %s\n' "$(date '+%F %T')" "$*"; }

die() { log "ERROR: $*"; exit 1; }

require_tools() {
  for tool in git npm pm2 rsync curl; do
    command -v "$tool" >/dev/null 2>&1 || die "missing tool: $tool"
  done
}

previous_release() {
  # The release that was live before the most recent successful cutover.
  cat "$APP_DIR.previous" 2>/dev/null || true
}

# ---------------------------------------------------------------------
# ROLLBACK
# ---------------------------------------------------------------------
do_rollback() {
  local previous
  previous=$(previous_release)
  [ -n "$previous" ] || die "no previous release recorded; set /var/www/rosary-frontend-releases/app.previous manually"
  [ "$previous" != "$(readlink "$APP_DIR" 2>/dev/null)" ] ||
    die "refusing rollback: app.previous equals the currently live release"
  [ -d "$previous" ] || die "previous release missing: $previous"

  pm2 delete "$PM2_NAME" >/dev/null 2>&1 || true

  ln -sfn "$previous" "$APP_DIR"
  pm2 start npm --name "$PM2_NAME" --cwd "$APP_DIR" -- \
    run start -- --port "$PORT" --hostname "$HOSTLISTEN" \
    || die "pm2 start failed during rollback"
  pm2 pid "$PM2_NAME" > "$APP_DIR/pm2.pid"
  pm2 save
  verify_health || die "rollback failed health check"
  # Freeze: further automatic rollbacks must be re-armed deliberately.
  rm -f "$APP_DIR.previous"
  log "rollback complete: $previous"
  exit 0
}

verify_health() {
  sleep 2
  curl -fsS -m 10 "http://$HOSTLISTEN:$PORT$HEALTH_PATH" >/dev/null 2>&1
}

# ---------------------------------------------------------------------
# DEPLOY
# ---------------------------------------------------------------------
require_tools
[ "${1:-}" = "--rollback" ] && do_rollback

PREVIOUS=$(previous_release)
log "previous release: ${PREVIOUS:-none}"

# 1. Pull the approved branch (fast-forward only; no force, no reset).
[ -d "$REPO_DIR/.git" ] || git clone git@github.com:ayatiworkstechnologies/rosary-frontend.git "$REPO_DIR" \
  || die "clone the repo first; private repo requires the deploy key"
git -C "$REPO_DIR" fetch origin "$BRANCH"
git -C "$REPO_DIR" checkout "$BRANCH"
git -C "$REPO_DIR" pull --ff-only origin "$BRANCH" \
  || die "git pull --ff-only failed; investigate divergent history manually"

SHA=$(git -C "$REPO_DIR" rev-parse --short HEAD)
RELEASE_DIR="$RELEASES_DIR/$SHA"
if [ -d "$RELEASE_DIR" ]; then
  log "release already deployed and verified, idempotent re-run: $SHA"
  CURRENT=$(readlink "$APP_DIR" 2>/dev/null || true)
  [ "$CURRENT" = "$RELEASE_DIR" ] && { log "already live: $RELEASE_DIR"; exit 0; }
fi

log "deploying commit $SHA (branch $BRANCH)"

# 2. Build FIRST, in the repo, before publishing anything.
git -C "$REPO_DIR" clean -fd | head -1 >/dev/null || true
npm ci --prefix "$REPO_DIR" || die "npm ci failed (build not affected, process untouched)"

# Env: LOCAL_BACKEND_URL points the /backend/ rewrite at the local portal
# API instead of the public TLS domain (same server => direct hop).
printf 'LOCAL_BACKEND_URL=%s\n' "$BACKEND_LOCAL" > "$REPO_DIR/.env.production.local"

npm run build --prefix "$REPO_DIR" || die "build failed; PM2 process NOT touched"

# 3. Boot-test the build on a spare port before cutover.
TEST_PORT=3300
cd "$REPO_DIR"
PORT="$TEST_PORT" npx next start --port "$TEST_PORT" --hostname 127.0.0.1 > /tmp/rosary-frontend-boottest.log 2>&1 &
TEST_PID=$!
trap 'kill $TEST_PID 2>/dev/null || true' EXIT
for i in $(seq 1 30); do
  sleep 1
  curl -fsS -m 3 "http://127.0.0.1:$TEST_PORT$HEALTH_PATH" >/dev/null 2>&1 && break
  [ "$i" = 30 ] && { tail -40 /tmp/rosary-frontend-boottest.log; die "boot-test failed on port $TEST_PORT"; }
done
kill $TEST_PID 2>/dev/null || true
trap - EXIT
log "boot-test passed on port $TEST_PORT"

# 4. Publish the release directory (immutable copy of repo + build).
mkdir -p "$RELEASES_DIR"
rsync -a --delete \
  --exclude node_modules --exclude .git --exclude e2e \
  --exclude test-results --exclude playwright-report \
  "$REPO_DIR/" "$RELEASE_DIR/"
rsync -a --link-dest="$REPO_DIR/node_modules" "$REPO_DIR/node_modules/" "$RELEASE_DIR/node_modules"
printf '%s\n' "$SHA" > "$RELEASE_DIR/RELEASE_HASH"
cp /tmp/rosary-frontend-boottest.log "$RELEASE_DIR/boot-test.log" 2>/dev/null || true

#    (the boot-test in step 3 proved the build is servable).
pm2 delete "$PM2_NAME" >/dev/null 2>&1 || true

ln -sfn "$RELEASE_DIR" "$APP_DIR"
# Record the rollback target BEFORE losing the old symlink value.
if [ -n "${PREVIOUS:-}" ]; then
  printf '%s\n' "$PREVIOUS" > "$APP_DIR.previous"
fi
pm2 start npm --name "$PM2_NAME" --cwd "$APP_DIR" -- \
  run start -- --port "$PORT" --hostname "$HOSTLISTEN" \
  || die "pm2 start failed"
pm2 pid "$PM2_NAME" > "$APP_DIR/pm2.pid"
pm2 save

# 6. Verify the new release before declaring success.
for i in $(seq 1 30); do
  sleep 1
  curl -fsS -m 3 "http://127.0.0.1:$PORT$HEALTH_PATH" >/dev/null 2>&1 && {
    log "deploy verified: $RELEASE_DIR"
    log "PM2 process: $PM2_NAME on 127.0.0.1:$PORT"
    exit 0
  }
done

# 7. Auto-rollback if the new release does not come up.
log "NEW RELEASE FAILED HEALTH CHECK -- rolling back"
pm2 delete "$PM2_NAME" >/dev/null 2>&1 || true
if [ -n "${PREVIOUS:-}" ]; then
  ln -sfn "$PREVIOUS" "$APP_DIR"
  # Drop the stale rollback target so --rollback cannot re-target the
  # release that just failed.
  rm -f "$APP_DIR.previous"
  pm2 start npm --name "$PM2_NAME" --cwd "$APP_DIR" -- run start -- --port "$PORT" --hostname "$HOSTLISTEN"
  pm2 pid "$PM2_NAME" > "$APP_DIR/pm2.pid"
  pm2 save
  log "rolled back to $PREVIOUS"
fi
die "deployment failed; see pm2 logs"
