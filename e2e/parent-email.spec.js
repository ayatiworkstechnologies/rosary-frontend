import { test, expect } from "@playwright/test";
import { enforceLocalOnly, login } from "./helpers";

const preferencesPath = /\/backend\/api\/v1\/parent\/email-preferences/;

function preferenceState(overrides = {}) {
  return {
    email: "parent@example.com",
    email_verified_at: null,
    email_notifications_enabled: false,
    verification_required: true,
    ...overrides,
  };
}

test.describe("Parent email verification and preferences", () => {
  test("unverified parent requests verification without duplicate submission", async ({ page }) => {
    await enforceLocalOnly(page);
    await login(page, "parent", "parent", "TESTADM1");
    let verificationRequests = 0;

    await page.route(preferencesPath, async (route) => {
      const request = route.request();
      if (request.url().includes("/verification/request")) {
        verificationRequests += 1;
        await new Promise((resolve) => setTimeout(resolve, 100));
        return route.fulfill({ status: 200, json: { message: "Verification email sent" } });
      }
      if (request.method() === "GET") {
        return route.fulfill({ status: 200, json: preferenceState() });
      }
      return route.fallback();
    });

    await page.goto("/parent/profile");
    await expect(page.getByText("Email Notifications & Verification")).toBeVisible();
    await expect(page.getByText("Unverified", { exact: true })).toBeVisible();
    await expect(page.getByRole("switch", { name: /Optional email notifications/i })).toBeDisabled();
    const send = page.getByRole("button", { name: /Send verification email/i });
    await send.dblclick();
    await expect(page.getByText(/Verification email sent/i)).toBeVisible();
    expect(verificationRequests).toBe(1);
  });

  test("verified parent preference saves confirmed backend state", async ({ page }) => {
    await enforceLocalOnly(page);
    await login(page, "parent", "parent", "TESTADM1");
    let enabled = false;
    await page.route(preferencesPath, async (route) => {
      const request = route.request();
      if (request.method() === "PATCH") {
        enabled = request.postDataJSON().email_notifications_enabled;
        return route.fulfill({ status: 200, json: preferenceState({ email_verified_at: "2026-11-12T10:00:00Z", email_notifications_enabled: enabled, verification_required: false }) });
      }
      if (request.method() === "GET") {
        return route.fulfill({ status: 200, json: preferenceState({ email_verified_at: "2026-11-12T10:00:00Z", email_notifications_enabled: enabled, verification_required: false }) });
      }
      return route.fallback();
    });

    await page.goto("/parent/profile");
    const toggle = page.getByRole("switch", { name: /Optional email notifications/i });
    await expect(toggle).toBeEnabled();
    await toggle.click();
    await expect(toggle).toBeChecked();
    await expect(page.getByText(/Email notifications have been enabled/i)).toBeVisible();
  });

  test("no-email and API-error states remain safe and actionable", async ({ page }) => {
    await enforceLocalOnly(page);
    await login(page, "parent", "parent", "TESTADM1");
    await page.route(preferencesPath, (route) =>
      route.fulfill({ status: 200, json: preferenceState({ email: null, verification_required: false }) })
    );
    await page.goto("/parent/profile");
    await expect(page.getByText("No email address registered")).toBeVisible();
    await expect(page.getByText(/Ask the school office/i)).toBeVisible();

    await page.unroute(preferencesPath);
    await page.route(preferencesPath, (route) =>
      route.fulfill({ status: 503, json: { detail: "Email verification is temporarily unavailable" } })
    );
    await page.reload();
    await expect(page.getByText("Email verification is temporarily unavailable")).toBeVisible();
  });

  test("verification page confirms once and handles invalid token", async ({ page }) => {
    await enforceLocalOnly(page);
    let confirmations = 0;
    await page.route("**/backend/api/v1/parent/email-preferences/verification/confirm", (route) => {
      confirmations += 1;
      return route.fulfill({ status: 200, json: preferenceState({ email_verified_at: "2026-11-12T10:00:00Z", verification_required: false }) });
    });
    await page.goto("/verify-email?token=synthetic-valid-token");
    await expect(page.getByRole("heading", { name: "Email verified" })).toBeVisible();
    expect(confirmations).toBe(1);

    await page.unroute("**/backend/api/v1/parent/email-preferences/verification/confirm");
    await page.route("**/backend/api/v1/parent/email-preferences/verification/confirm", (route) =>
      route.fulfill({ status: 400, json: { detail: "Verification token is invalid or expired" } })
    );
    await page.goto("/verify-email?token=synthetic-expired-token");
    await expect(page.getByRole("heading", { name: "Verification unsuccessful" })).toBeVisible();
    await expect(page.getByText(/invalid, expired, or has already been used/i)).toBeVisible();
  });

  test("unsubscribe requires confirmation and reports invalid token", async ({ page }) => {
    await enforceLocalOnly(page);
    let unsubscribeCalls = 0;
    await page.route("**/backend/api/v1/parent/email-preferences/unsubscribe**", (route) => {
      unsubscribeCalls += 1;
      return route.fulfill({ status: 200, json: { message: "Email notifications have been disabled" } });
    });
    await page.goto("/unsubscribe?token=synthetic-unsubscribe-token");
    expect(unsubscribeCalls).toBe(0);
    await page.getByRole("button", { name: "Confirm unsubscribe" }).click();
    await expect(page.getByRole("heading", { name: "Preference updated" })).toBeVisible();
    expect(unsubscribeCalls).toBe(1);

    await page.unroute("**/backend/api/v1/parent/email-preferences/unsubscribe**");
    await page.route("**/backend/api/v1/parent/email-preferences/unsubscribe**", (route) =>
      route.fulfill({ status: 400, json: { detail: "Unsubscribe token is invalid or expired" } })
    );
    await page.goto("/unsubscribe?token=synthetic-invalid-token");
    await page.getByRole("button", { name: "Confirm unsubscribe" }).click();
    await expect(page.getByRole("heading", { name: "Unable to unsubscribe" })).toBeVisible();
  });
});
