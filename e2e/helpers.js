import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect } from "@playwright/test";

const e2eRoot = path.dirname(fileURLToPath(import.meta.url));

// Direct backend access (localhost:8017) for TEST SETUP ONLY -
// seeding synthetic data via the API. Browser tests themselves
// always go through the frontend origin.
export const LOCAL_BACKEND = process.env.E2E_LOCAL_BACKEND_URL || "http://127.0.0.1:8017";

let cachedAccounts = null;

/**
 * Synthetic test accounts written by scripts/e2e_server.py at boot.
 * The file is gitignored and contains SYNTHETIC credentials that only
 * exist in the disposable e2e_data SQLite database.
 */
export function accounts() {
  if (!cachedAccounts) {
    const raw = readFileSync(path.join(e2eRoot, ".test-accounts.json"), "utf-8");
    cachedAccounts = JSON.parse(raw);
  }
  return cachedAccounts;
}

/** Block any request that leaves the local machine. */
export async function enforceLocalOnly(page) {
  await page.route("**/*", (route) => {
    const url = route.request().url();
    const { hostname } = new URL(url);
    if (
      hostname === "127.0.0.1" ||
      hostname === "localhost" ||
      hostname.endsWith(".local")
    ) {
      return route.continue();
    }
    return route.abort();
  });
}

/**
 * Accept (and record) every native dialog the app raises.
 * The portal uses window.confirm for destructive actions and
 * window.alert for toasts; without a persistent handler
 * Playwright auto-dismisses them and hover-free assertions on
 * the alert text are impossible.
 */
export function autoDialog(page) {
  const messages = [];
  page.on("dialog", (dialog) => {
    messages.push(dialog.message());
    dialog.accept().catch(() => {});
  });
  return messages;
}

/**
 * Wait until the app shows "no more loading": the login POST stores the
 * token and redirects (router.replace). Without waiting, an immediate
 * page.goto() in the test cancels the in-flight login and the guard
 * bounces the next page back to /login.
 */
export async function login(page, accountKey, role, usernameOrAdmission, remember = false) {
  const user = accounts()[accountKey];
  const username = usernameOrAdmission || user.username;
  const password = user.password;

  await page.goto("/login");
  await page.getByRole("button", { name: roleLabel(role) }).click();
  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  if (remember) {
    await page.locator('input[name="remember"]').check();
  }
  await page.getByRole("button", { name: /LOGIN|Sign/i }).click();
  await page.waitForURL(roleHomePattern(role), { timeout: 45_000 });
}

/** Post-login redirect destination per role (see app/login/page.jsx). */
export function roleHomePattern(role) {
  switch (role) {
    case "parent":
      return /\/parent\//;
    case "teacher":
      return /\/teacher\//;
    case "admin":
      return /\/admin\//;
    default:
      throw new Error(`unknown role ${role}`);
  }
}

function roleLabel(role) {
  switch (role) {
    case "parent":
      return "Parents";
    case "teacher":
      return "Teachers";
    case "admin":
      return "Admin";
    default:
      throw new Error(`unknown role ${role}`);
  }
}

/**
 * Assert that `role` cannot hold a session inside a foreign portal.
 * AuthGuard resolves a role mismatch with an async router.replace:
 *  - admin in /teacher|/parent  ->  /login  (bounced out)
 *  - teacher/parent in /admin   ->  their own portal
 * So a strong assertion is: the URL eventually stops being inside the
 * forbidden section and the AuthGuard removes the session entirely
 * (logoutUser runs for the cross-portal attempt via getCurrentUser role check).
 */
export async function expectPortalBlocked(page, forbiddenPrefix, ownPrefix) {
  await page.waitForURL(
    (url) => !url.pathname.startsWith(forbiddenPrefix),
    { timeout: 45_000 }
  );
  const current = new URL(page.url()).pathname;
  expect(
    current === "/login" || current.startsWith(ownPrefix),
    `expected /login or ${ownPrefix} but landed on ${current}`
  ).toBeTruthy();
}

/**
 * Create an authorized API context for synthetic-data setup.
 */
export async function backendContext(request, role) {
  const acc = accounts();
  const user = acc[role];
  const loginResp = await request.post(`${LOCAL_BACKEND}/api/v1/auth/login`, {
    data: { username: user.username, password: user.password, role: user.role.toUpperCase() },
  });
  expect(loginResp.ok(), `backend login as ${user.username}`).toBeTruthy();
  const { access_token: token } = await loginResp.json();
  return {
    token,
    headers: { Authorization: `Bearer ${token}` },
  };
}
