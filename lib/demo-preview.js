// =========================================================
// ROSARY SCHOOL PORTAL — DEMO PREVIEW GATE
// ---------------------------------------------------------
// Demo preview mode is a FRONTEND-ONLY presentation aid for
// client demonstrations. It never writes to any backend
// endpoint and never persists anything.
//
// Safety rules:
// - Disabled by default. It only activates when the build
//   environment explicitly sets NEXT_PUBLIC_DEMO_PREVIEW=true.
// - It never activates automatically because an API returns
//   an empty array or an error (this module holds no logic
//   tied to API results).
// - Production deployments must simply not set the flag.
//   The flag is inlined at build time (NEXT_PUBLIC_*), so a
//   production build without the variable can never render
//   demo content, regardless of anything the user does.
//
// Enable locally:
//   set NEXT_PUBLIC_DEMO_PREVIEW=true   (Windows)
//   export NEXT_PUBLIC_DEMO_PREVIEW=true (Linux/macOS)
//   npm run dev
// =========================================================

export const DEMO_PREVIEW_ENABLED =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_DEMO_PREVIEW === "true";

// Exact copy required on every demo section.
export const DEMO_PREVIEW_NOTICE =
  "DEMO PREVIEW — Illustrative content, not official school records.";

// Public URLs of the dev-only preview hub pages.
export const DEMO_EMAILS_URL = "/demo-preview/emails";
export const DEMO_NOTIFICATIONS_URL = "/demo-preview/notifications";
