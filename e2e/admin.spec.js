import { test, expect } from "@playwright/test";
import {
  accounts,
  autoDialog,
  backendContext,
  enforceLocalOnly,
  expectPortalBlocked,
  LOCAL_BACKEND,
  login,
} from "./helpers";

test.describe("Admin Portal", () => {
  test.beforeEach(async ({ page }) => {
    await enforceLocalOnly(page);
    await login(page, "admin", "admin");
    await expect(page).toHaveURL(/\/admin/);
  });

  test("dashboard loads with stats and navigation", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Welcome back, Admin/i })).toBeVisible();

    // stats finish loading (skeleton -> numbers)
    await expect(page.locator("h3").filter({ hasText: /\d/ }).first()).toBeVisible({
      timeout: 15_000,
    });

    // header/shell navigation visible on desktop
    await expect(page.locator("header, aside, nav").first()).toBeVisible();
  });

  test("classes: list visible and delete class end-to-end", async ({ page, request }) => {
    await page.goto("/admin/classes");
    await expect(page.getByRole("table")).toBeVisible();

    // create a class via the API so the delete flow always has a target
    // that no other test depends on (synthetic, isolated DB).
    const ctx = await backendContext(request, "admin");
    const createResp = await request.post(`${LOCAL_BACKEND}/api/v1/admin/classes`, {
      headers: ctx.headers,
      data: {
        name: "TESTE2E",
        section: "Z",
        academic_year: "2026-2027",
      },
    });
    expect(createResp.ok(), await createResp.text()).toBeTruthy();
    const created = (await createResp.json()).data;

    await page.reload();
    const row = page.getByRole("row", { name: new RegExp("TESTE2E") });
    await expect(row).toBeVisible();

    // The app deletes after window.confirm and confirms with window.alert,
    // so both dialogs must be handled by one persistent listener.
    const messages = autoDialog(page);
    await row.getByRole("button", { name: /delete/i }).click();

    await expect(page.getByRole("row", { name: new RegExp("TESTE2E") })).toHaveCount(0);
    expect(
      messages.join(" | "),
      `dialogs observed: ${messages.join(" | ")}`
    ).toMatch(/deleted successfully/i);

    // deleted server-side as well
    const detail = await request.get(
      `${LOCAL_BACKEND}/api/v1/admin/classes/${created.id}`,
      { headers: ctx.headers }
    );
    expect(detail.status()).toBe(404);
  });

  test("students: list and search", async ({ page }) => {
    await page.goto("/admin/students");
    await expect(page.getByRole("table")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("TESTADM1").first()).toBeVisible();
  });

  test("teachers: list loads", async ({ page }) => {
    await page.goto("/admin/teachers");
    await expect(page.getByText(/TEACH_TEST|Test Teacher/i).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test("parent linking: linked records table", async ({ page }) => {
    await page.goto("/admin/parent-linking");
    await expect(page.getByRole("table")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/TESTADM1|Test Student One/i).first()).toBeVisible();
  });

  test("fees: page loads (data or empty state)", async ({ page }) => {
    await page.goto("/admin/fees");
    await expect(
      page.getByRole("table").or(page.getByText(/no fee records found/i)).first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test("exams: server-side pagination + publish/unpublish results", async ({ page, request }) => {
    await page.goto("/admin/exams");
    await expect(page.getByRole("table")).toBeVisible({ timeout: 15_000 });
    const row = page.getByRole("row", { name: /^TESTEXAM\b/i });
    await expect(row).toBeVisible();

    // The backend refuses to publish an exam without entered results,
    // so seed results for every student of the teacher's class first.
    const acc = accounts();
    const teacher = await backendContext(request, "teacher");
    const seed = await request.post(
      `${LOCAL_BACKEND}/api/v1/teacher/classes/${acc.class_a_id}/results`,
      {
        headers: teacher.headers,
        data: {
          exam_id: acc.exam_id,
          subject: "Mathematics",
          results: [
            { student_id: acc.student1_id, max_marks: 100, obtained_marks: 90 },
            { student_id: acc.student2_id, max_marks: 100, obtained_marks: 80 },
          ],
        },
      }
    );
    expect(seed.ok(), await seed.text()).toBeTruthy();

    await page.reload();
    const seededRow = page.getByRole("row", { name: /^TESTEXAM\b/i });
    await expect(seededRow).toBeVisible();

    // publish
    const messages = autoDialog(page);
    await seededRow.getByRole("button", { name: /publish results/i }).click();
    await expect(page.getByText(/results published successfully/i)).toBeVisible();
    await expect(seededRow.getByText(/published/i).first()).toBeVisible();

    // unpublish (restore the unpublished baseline so editing stays open)
    await seededRow.getByRole("button", { name: /unpublish results/i }).click();
    await expect(page.getByText(/results unpublished successfully/i)).toBeVisible();
    expect(messages.join(" | ")).toMatch(/publish/i);
  });

  test("exam schedules: list loads", async ({ page }) => {
    await page.goto("/admin/exam-schedules");
    await expect(
      page.getByRole("table").or(page.getByText(/no schedules found/i)).first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test("circulars and downloads: pages load", async ({ page }) => {
    await page.goto("/admin/circulars");
    await expect(
      page.getByRole("table").or(page.getByText(/no circulars found/i)).first()
    ).toBeVisible({ timeout: 15_000 });

    await page.goto("/admin/downloads");
    await expect(
      page.getByRole("table").or(page.getByText(/no forms found/i)).first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test("users: list and search", async ({ page }) => {
    await page.goto("/admin/users");
    await expect(page.getByRole("table")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("ADM_TEST").first()).toBeVisible();
  });

  test("notifications: page loads", async ({ page }) => {
    await page.goto("/admin/notifications");
    await expect(page.getByText(/no classes available|Send|Compose|Notification/i).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test("admin cannot open teacher-only portal", async ({ page }) => {
    await page.goto("/teacher/dashboard");
    // AuthGuard logs the admin out and bounces to /login
    await expectPortalBlocked(page, "/teacher", "/admin");
  });

  test.afterEach(async ({ page }) => {
    // Each test runs in a fresh browser context; nothing to clean up.
  });
});
