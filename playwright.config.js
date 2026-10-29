import { defineConfig, devices } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(
  fileURLToPath(import.meta.url)
);

// ------------------------------------------------------------------
// PRODUCTION SAFETY
// The E2E stack must never touch the production backend. The local
// backend script (scripts/e2e_server.py in rosary-backend) enforces
// SQLite + port 8017 on its side; here we refuse a config that would
// proxy the frontend to the production server.
// ------------------------------------------------------------------
const backendUrl =
  process.env.E2E_LOCAL_BACKEND_URL || "http://127.0.0.1:8017";

if (/89\.167\.92\.220|:8016/.test(backendUrl)) {
  throw new Error(
    "E2E refuses to run against the production backend (89.167.92.220:8016)"
  );
}

const FRONTEND_PORT = Number(process.env.E2E_FRONTEND_PORT || 3100);

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./test-results",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [
  ["list"],
  ["html", {
    outputFolder: "playwright-report",
    open: "never",
  }],
],

  // No traces/videos: traces would capture login request bodies.
  // Screenshots (dots-only password inputs) on failure only.
  use: {
    baseURL: `http://127.0.0.1:${FRONTEND_PORT}`,
    trace: "off",
    video: "off",
    screenshot: "only-on-failure",
  },

  projects: [
    // Full suite on desktop
    {
      name: "desktop",
      testIgnore: /responsive\.spec\.js/,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    // Responsive verification on tablet + mobile, responsive spec only
    {
      name: "tablet",
      testMatch: /responsive\.spec\.js/,
      use: { ...devices["iPad (gen 7)"] },
    },
    {
      name: "mobile",
      testMatch: /responsive\.spec\.js/,
      use: { ...devices["Pixel 7"] },
    },
  ],

  webServer: [
    {
      // Disposable SQLite backend seeded with synthetic TEST_* data
      command:
        'cmd /c "venv\\Scripts\\python.exe scripts\\e2e_server.py > e2e_data\\server.log 2>&1"',
      cwd: process.env.E2E_BACKEND_CWD || "..\\rosary-backend",
      url: "http://127.0.0.1:8017/health",
      // E2E_REUSE=1 attaches to an already-running local stack (debugging
      // single tests only); normal runs always boot a fresh backend.
      reuseExistingServer: process.env.E2E_REUSE === "1",
      timeout: 120_000,
    },
    {
      command: "npm run build && npm run start -- --port 3100 --hostname 127.0.0.1",
      url: `http://127.0.0.1:${FRONTEND_PORT}/login`,
      reuseExistingServer: process.env.E2E_REUSE === "1",
      timeout: 300_000,
      env: {
        LOCAL_BACKEND_URL: backendUrl,
      },
    },
  ],
});
