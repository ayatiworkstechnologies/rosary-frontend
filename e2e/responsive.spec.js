import { test, expect } from "@playwright/test";
import { backendContext, enforceLocalOnly, login } from "./helpers";

/**
 * Responsive + quality verification across tablet and mobile
 * (runs in the "tablet" and "mobile" projects - see config).
 * Desktop is exercised by the other specs at 1440x900.
 */
test.describe("Responsive layout verification", () => {
  async function noHorizontalOverflow(page) {
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      const tolerance = 2; // px
      return doc.scrollWidth - doc.clientWidth;
    });
    expect(
      overflow,
      `horizontal overflow of ${overflow}px on ${page.url()}`
    ).toBeLessThanOrEqual(2);
  }

  test("parent portal: dashboard + children usable on small screens", async ({ page }) => {
    await enforceLocalOnly(page);
    await login(page, "parent", "parent", "TESTADM1");
    await expect(page).toHaveURL(/\/parent/);

    await expect(page.locator("body")).toBeVisible();
    await noHorizontalOverflow(page);

    // navigation reachable (mobile menu button or visible nav)
    const nav = page.locator("nav, aside, header").first();
    if (await nav.count()) {
      const visible = await nav.isVisible();
      if (!visible) {
        const burger = page.locator(
          'button[aria-label*="menu" i], button[aria-label*="nav" i]'
        );
        await expect(burger.first()).toBeVisible();
      }
    }

    await page.goto("/parent/children");
    await expect(page.getByText(/TESTADM1|Test Student One/i).first()).toBeVisible({
      timeout: 15_000,
    });
    await noHorizontalOverflow(page);
  });

  test("teacher portal: attendance usable on small screens", async ({ page }) => {
    await enforceLocalOnly(page);
    await login(page, "teacher", "teacher");
    await expect(page).toHaveURL(/\/teacher/);

    await page.goto("/teacher/attendance");
    await expect(page.locator("main, body").first()).toBeVisible();
    await noHorizontalOverflow(page);
  });

  test("login page renders correctly on small screens", async ({ page }) => {
    await enforceLocalOnly(page);
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "ROSARY" })).toBeVisible();
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await noHorizontalOverflow(page);
  });
});
