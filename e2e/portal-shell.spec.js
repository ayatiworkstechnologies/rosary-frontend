import { test, expect } from "@playwright/test";
import { enforceLocalOnly, login } from "./helpers";

const portals = [
  { account: "admin", role: "admin" },
  { account: "teacher", role: "teacher" },
  {
    account: "parent",
    role: "parent",
    usernameOrAdmission: "TESTADM1",
  },
];

for (const portal of portals) {
  test(`${portal.role} shell shows the school brand, content and a fitted sidebar`, async ({
    page,
  }) => {
    await enforceLocalOnly(page);
    await page.setViewportSize({ width: 1440, height: 640 });
    await login(
      page,
      portal.account,
      portal.role,
      portal.usernameOrAdmission
    );

    const sidebar = page.locator("aside");
    const navigation = sidebar.locator("nav");
    const logo = sidebar.getByRole("img", {
      name: "Rosary Matriculation Higher Secondary School",
    });

    await expect(sidebar).toBeVisible();
    await expect(logo).toBeVisible();
    await expect
      .poll(() => logo.evaluate((image) => image.complete && image.naturalWidth > 0))
      .toBeTruthy();

    const navigationFits = await navigation.evaluate(
      (element) => element.scrollHeight <= element.clientHeight
    );
    expect(navigationFits, `${portal.role} navigation fits without scrolling`).toBeTruthy();

    const links = navigation.getByRole("link");
    expect(await links.count()).toBeGreaterThan(0);
    for (const link of await links.all()) {
      await expect(link).toBeVisible();
    }

    await expect
      .poll(async () => (await page.locator("main").innerText()).trim().length)
      .toBeGreaterThan(20);
  });
}
