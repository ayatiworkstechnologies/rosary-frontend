# Rosary Portal frontend cut-over runbook — cloud2

Status: **APPROVED TOOLING, AWAITING GREEN LIGHT.** Do not execute without
explicit approval and authorized root/sudo access.

Branch: `ui/portal-shell-refresh` (deploy SHA recorded in each
`/var/www/rosary-frontend-releases/<sha>/RELEASE_HASH`).

Preserved by this run: Vercel portal deployment, marketing/CMS app on
port 8017, portal API on 127.0.0.1:8016, database `rosary_portal`.

## 0. Required access

| Need | Current state |
|---|---|
| devteam SSH | OK (`ssh -i ~/.ssh/cloud2-devteam-20261027 devteam@89.167.92.220`) |
| GitHub HTTPS clone | OK (verified from server) |
| Passwordless `sudo` | **BLOCKED** — required for nginx install/reload, `pm2 startup`, certbot |
| DNS `portal.rosarychennai.com` | **MISSING** — must point (A → 89.167.92.220) before certbot |

## 1. Pre-deployment checklist

- [ ] Approval from the release owner recorded.
- [ ] Root/sudo access handed to the operator (temporary).
- [ ] DNS record created and resolving: `dig +short portal.rosarychennai.com`.
- [ ] Branch tip reviewed and approved on GitHub:
      `git log origin/ui/portal-shell-refresh -1`.
- [ ] Backend healthy: `curl https://www.api.rosarychennai.com/health`.
- [ ] DM database backup taken and checksummed (frontend cutover touches no
      data, but keep a fresh backup per policy):
      `sudo mysqldump --single-transaction rosary_portal > ~/rosary-db-backups/pre_frontend_cutover_$(date +%F).sql && sha256sum ...`
- [ ] `pm2` present for devteam and old states dumped: `pm2 save`.
- [ ] Confirm ports free: `sudo ss -ltnp | grep -E ':3100|:3300'` (must be empty).
- [ ] Copy `ops/nginx-rosary-portal.conf.example` reviewed with the operator.

## 2. Deployment commands (run ON cloud2 as devteam)

```bash
# 1. Prepare repo clone once (devteam can do this without sudo)
mkdir -p /var/www/rosary-frontend-releases
git clone https://github.com/ayatiworkstechnologies/rosary-frontend.git \
  /var/www/rosary-frontend-releases/repo

# 2. Run the prepared, stop-on-error deploy script
#    (clone, fetch, ff-only pull, npm ci, build, boot-test :3300,
#     publish release dir, PM2 start @127.0.0.1:3100, health gate,
#     auto-rollback on failure)
bash /var/www/rosary-frontend-releases/repo/scripts/deploy-frontend-cloud2.sh
```

The script refuses to touch the running frontend unless build + boot-test
pass, never restarts the frontend after a failed build, and records
`RELEASE_HASH` and the pre-cutover target (`app.previous`).

## 3. DNS + nginx (requires authorized root)

```bash
# A. certificate
sudo certbot --nginx -d portal.rosarychennai.com

# B. install the final server block (from the committed example),
#    DELETE the temporary port-80 block only, then:
sudo nginx -t && sudo systemctl reload nginx
```

Vercel can stay pointing at the same backend; migrate or retire it later
once the cloud2 frontend is verified in production.

## 4. Post-deployment verification

```bash
# Locally on server
pm2 status                          # rosary-frontend online, 127.0.0.1:3100
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3100/login   # 200
curl -sS https://www.api.rosarychennai.com/health                        # healthy
curl -sS -o /dev/null -w '%{http_code}\n' https://portal.rosarychennai.com/login  # 200

# From ops workstation
curl.exe -sS -o NUL -w "%{http_code}\n" https://portal.rosarychennai.com/login
```

Role smoke tests (browser, approved test accounts only):
- Admin login → dashboard stats load.
- Teacher login → classes load; attendance + homework save.
- Parent login via **admission number** → children, fees, results load.
- Logout clears auth state and redirects.

Log review: `pm2 logs rosary-frontend --lines 100 --nostream`.

## 5. Rollback

```bash
# Automatic (built into the deploy script) — runs when the health gate fails.

# Manual:
bash /var/www/rosary-frontend-releases/repo/scripts/deploy-frontend-cloud2.sh --rollback
# Or, as a last resort:
ln -sfn /var/www/rosary-frontend-releases/<previous-sha> /var/www/rosary-frontend-releases/app
pm2 delete rosary-frontend ; pm2 start npm --name rosary-frontend \
  --cwd /var/www/rosary-frontend-releases/app -- run start -- --port 3100 --hostname 127.0.0.1
pm2 save
```

Vercel fallback: if cloud2 frontend must be abandoned entirely, restore
Vercel as the portal origin (it was never taken down) and remove the
portal nginx site.

## 6. Persistence

```bash
sudo pm2 startup systemd -u devteam --hp /home/devteam   # once, root
pm2 save                                                  # after each change
```
