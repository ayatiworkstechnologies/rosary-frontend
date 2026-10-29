import { test, expect } from "@playwright/test";
import {
  accounts,
  autoDialog,
  backendContext,
  enforceLocalOnly,
  expectPortalBlocked,
  login,
} from "./helpers";

test.describe("Teacher Portal", () => {
  test.beforeEach(async ({ page }) => {
    await enforceLocalOnly(page);
    await login(page, "teacher", "teacher");
    await expect(page).toHaveURL(/\/teacher/);
  });

  test("dashboard loads with assigned classes", async ({ page }) => {
    await expect(page.getByText(/TEST - A|Mathematics/i).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test("student roster: assigned students visible", async ({ page }) => {
    await page.goto("/teacher/students");
    await expect(page.getByText(/TESTADM1|Test Student One/i).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/TESTADM2|Test Student Two/i).first()).toBeVisible();
    // unassigned class students must not leak
    await expect(page.getByText("TESTADM3")).toHaveCount(0);
  });

  test("attendance: choose assigned class and submit", async ({ page }) => {
    await page.goto("/teacher/attendance");

    // pick the assigned class from the class selector if present
    const classSelect = page.locator("select").first();
    await expect(classSelect).toBeVisible({ timeout: 15_000 });
    await classSelect.selectOption({ label: "TEST - A" });

    await expect(page.getByText(/Test Student One|TESTADM1/i).first()).toBeVisible({
      timeout: 15_000,
    });

    const save = page.getByRole("button", { name: /save|submit/i }).first();
    await expect(save).toBeEnabled({ timeout: 15_000 });
    await save.click();
    await expect(page.getByText(/success|saved|marked/i).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test("homework: create and see it listed", async ({ page }) => {
    await page.goto("/teacher/homework");

    await expect(page.getByText(/Assigned Homework/i)).toBeVisible({ timeout: 15_000 });

    // open the Add Homework modal (page auto-selects the first assigned class)
    const openCreate = page.getByRole("button", { name: /Add Homework/i }).first();
    await openCreate.click();

    const form = page.locator("form").filter({ has: page.locator('input[name="title"]') });
    await expect(form).toBeVisible({ timeout: 10_000 });

    await page.locator('input[name="subject"]').first().fill("Mathematics");
    await form.locator('input[name="title"]').fill("E2E Homework Check");
    const desc = page.locator('textarea[name="description"]').first();
    if (await desc.count()) {
      await desc.fill("Created by the automated E2E suite");
    }
    await page.locator('input[name="due_date"]').first().fill(
      new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10)
    );

    await form.locator('button[type="submit"]').click();

    await expect(page.getByText(/Homework added successfully/i)).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText("E2E Homework Check").first()).toBeVisible();
  });

  test("exam schedule: create, edit, delete (full CRUD)", async ({ page }) => {
    await page.goto("/teacher/exam-schedule");

    await expect(page.getByRole("button", { name: /Add Schedule/i })).toBeEnabled({
      timeout: 15_000,
    });

    const messages = autoDialog(page);

    // CREATE - the modal pre-fills the page-selected class, exam and subject
    await page.getByRole("button", { name: /Add Schedule/i }).first().click();
    const modal = page.locator("form").filter({ has: page.locator('input[name="exam_date"]') });
    await expect(modal).toBeVisible({ timeout: 10_000 });

    await modal.locator('select[name="subject"]').selectOption({ label: "Mathematics" });

    // exam date must stay inside the seeded exam window (start: today-7d,
    // end: today+30d) - "yesterday" also proves a past-dated schedule works
    await modal.locator('input[name="exam_date"]').fill(
      new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)
    );
    await modal.locator('input[name="start_time"]').fill("10:00");
    await modal.locator('input[name="end_time"]').fill("11:30");
    await modal.locator('input[name="room"]').fill("E2E-101");

    await modal.getByRole("button", { name: /Save Schedule/i }).click();

    await expect(page.getByText(/Exam schedule created successfully/i)).toBeVisible({
      timeout: 15_000,
    });

    // list shows the new schedule row
    const row = page.getByRole("row").filter({ hasText: "E2E-101" }).first();
    await expect(row).toBeVisible();

    // EDIT - change the room; edit opens the same modal without dialogs
    await row.getByRole("button", { name: /Edit schedule/i }).click();
    const editModal = page.locator("form").filter({ has: page.locator('input[name="exam_date"]') });
    await expect(editModal).toBeVisible();
    await editModal.locator('input[name="room"]').fill("E2E-102");
    await editModal.getByRole("button", { name: /Update Schedule/i }).click();
    await expect(page.getByText(/Exam schedule updated successfully/i)).toBeVisible({
      timeout: 15_000,
    });

    // DELETE - confirm dialog + success alert, handled by autoDialog
    const updatedRow = page.getByRole("row").filter({ hasText: "E2E-102" }).first();
    await expect(updatedRow).toBeVisible();
    await updatedRow.getByRole("button", { name: /delete/i }).click();
    await expect(page.getByText(/Exam schedule deleted successfully/i)).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole("row").filter({ hasText: "E2E-102" })).toHaveCount(0);
  });

  test("results: enter marks and see validation error for over-marks", async ({ page, request }) => {
    await page.goto("/teacher/results");

    // The parent spec publishes TESTEXAM in beforeAll, so the
    // dedicated TESTEXAM2 fixture (results_published=False) is the
    // only exam the teacher can still edit. Select it explicitly
    // to keep the test deterministic regardless of spec order.
    const acc = accounts();
    const ctx = await backendContext(request, "teacher");
    const examSelect = page.locator("select").nth(1);
    await examSelect.selectOption({ value: String(acc.exam2_id) });

    // class, exam and subject default from the teacher's assignments;
    // the marks sheet is a CSS grid where each student row renders
    // exactly two number fields in order: [max marks, obtained marks]
    const markInputs = page.locator('input[type="number"]');
    await expect(markInputs.first()).toBeVisible({ timeout: 15_000 });

    const total = await markInputs.count();
    expect(total, "max + obtained per student").toBeGreaterThanOrEqual(4);
    expect(total % 2).toBe(0);

    const fillObtained = async (value) => {
      for (let i = 1; i < total; i += 2) {
        await markInputs.nth(i).fill(value);
      }
    };

    // pin max marks to 100 so the test is deterministic even if a
    // previous run left other values in the reusable sheet
    for (let i = 0; i < total; i += 2) {
      await markInputs.nth(i).fill("100");
    }

    // invalidate: every student's obtained marks over the 100 max
    await fillObtained("999");
    await page.getByRole("button", { name: /Save Results/i }).click();
    await expect(
      page.getByText(/Obtained marks cannot exceed maximum marks/i).first()
    ).toBeVisible({ timeout: 15_000 });

    // valid marks for every student
    await fillObtained("88");
    await page.getByRole("button", { name: /Save Results/i }).click();
    await expect(page.getByText(/Results saved successfully/i)).toBeVisible({
      timeout: 15_000,
    });

    // reload and verify saved marks persist
    await page.reload();
    await expect(page.locator("select").first()).toBeVisible({ timeout: 15_000 });
    // reload re-defaults to the first exam; re-select TESTEXAM2
    const examSelect2 = page.locator("select").nth(1);
    await examSelect2.selectOption({ value: String(acc.exam2_id) });
    await expect(markInputs.first()).toBeVisible({ timeout: 15_000 });
    for (let i = 1; i < total; i += 2) {
      await expect(markInputs.nth(i)).toHaveValue("88");
    }
  });

  test("teacher cannot open admin portal", async ({ page }) => {
    await page.goto("/admin/users");
    // AuthGuard bounces a teacher back to their own portal
    await expectPortalBlocked(page, "/admin", "/teacher");
  });
});
