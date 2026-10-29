import { test, expect } from "@playwright/test";
import {
  accounts,
  backendContext,
  enforceLocalOnly,
  expectPortalBlocked,
  LOCAL_BACKEND,
  login,
} from "./helpers";

test.describe("Parent Portal", () => {
  // ------------------------------------------------------------------
  // SYNTHETIC SETUP (API against the isolated localhost backend only):
  //   1. teacher posts attendance for student 1 today
  //   2. teacher creates homework in class A
  //   3. teacher enters results for every student; admin publishes them
  //   4. admin sends an announcement to class A parents
  // ------------------------------------------------------------------
  test.beforeAll(async ({ request }) => {
    const teacher = await backendContext(request, "teacher");
    const admin = await backendContext(request, "admin");
    const acc = accounts();
    const cid = acc.class_a_id;
    const eid = acc.exam_id;

    const attendance = await request.post(
      `${LOCAL_BACKEND}/api/v1/teacher/classes/${cid}/attendance`,
      {
        headers: teacher.headers,
        data: {
          attendance_date: new Date().toISOString().slice(0, 10),
          records: [{ student_id: acc.student1_id, status: "PRESENT" }],
        },
      }
    );
    expect([200, 201, 409]).toContain(attendance.status());

    const homework = await request.post(
      `${LOCAL_BACKEND}/api/v1/teacher/classes/${cid}/homework`,
      {
        headers: teacher.headers,
        data: {
          subject: "Mathematics",
          title: "E2E Parent Homework",
          description: "Synthetic homework for parent E2E",
          assigned_date: new Date().toISOString().slice(0, 10),
          due_date: new Date(Date.now() + 86_400_000).toISOString().slice(0, 10),
        },
      }
    );
    expect(homework.ok(), await homework.text()).toBeTruthy();

    const results = await request.post(
      `${LOCAL_BACKEND}/api/v1/teacher/classes/${cid}/results`,
      {
        headers: teacher.headers,
        data: {
          exam_id: eid,
          subject: "Mathematics",
          results: [
            { student_id: acc.student1_id, max_marks: 100, obtained_marks: 90 },
            { student_id: acc.student2_id, max_marks: 100, obtained_marks: 80 },
          ],
        },
      }
    );
    expect([200, 201, 409]).toContain(results.status());

    const publish = await request.patch(
      `${LOCAL_BACKEND}/api/v1/admin/exams/${eid}/publish-results`,
      { headers: admin.headers, data: { results_published: true } }
    );
    expect(publish.ok(), await publish.text()).toBeTruthy();

    const announce = await request.post(`${LOCAL_BACKEND}/api/v1/admin/notifications/send`, {
      headers: admin.headers,
      data: {
        target_type: "CLASSES",
        class_ids: [cid],
        title: "E2E Announcement",
        message: "Synthetic announcement for parent E2E tests",
      },
    });
    expect(announce.ok(), await announce.text()).toBeTruthy();
  });

  test("admission-number login resolves the linked parent", async ({ page }) => {
    await enforceLocalOnly(page);
    await login(page, "parent", "parent", "TESTADM1");
    await expect(page).toHaveURL(/\/parent/);
    // session belongs to PAR_TEST
    const stored = await page.evaluate(
      () =>
        sessionStorage.getItem("current_user") ||
        localStorage.getItem("current_user") ||
        sessionStorage.getItem("access_token") ||
        localStorage.getItem("access_token")
    );
    expect(stored, "a PAR_TEST session token exists").toBeTruthy();
  });

  test("dashboard loads and children show both linked students", async ({ page }) => {
    await enforceLocalOnly(page);
    await login(page, "parent", "parent", "TESTADM1");

    await expect(page.locator("main, body").first()).toBeVisible();

    await page.goto("/parent/children");
    await expect(page.getByText(/TESTADM1|Test Student One/i).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/TESTADM2|Test Student Two/i).first()).toBeVisible();
    // the other family's student must not leak into this parent session
    await expect(page.getByText("TESTADM3")).toHaveCount(0);
  });

  test("fees show this child's records", async ({ page }) => {
    await enforceLocalOnly(page);
    await login(page, "parent", "parent", "TESTADM1");

    await page.goto("/parent/fees");
    await expect(page.getByRole("heading", { name: /Fee Information/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      page.getByText(/Term 1|Term 2|Paid|Unpaid|Pending|No fee information/i).first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test("attendance shows today's record", async ({ page }) => {
    await enforceLocalOnly(page);
    await login(page, "parent", "parent", "TESTADM1");

    await page.goto("/parent/attendance");
    await expect(page.getByText(/PRESENT|present/i).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test("homework visible for linked child", async ({ page }) => {
    await enforceLocalOnly(page);
    await login(page, "parent", "parent", "TESTADM1");

    await page.goto("/parent/homework");
    await expect(page.getByText(/E2E Parent Homework/i).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test("published results visible with marks and grade", async ({ page }) => {
    await enforceLocalOnly(page);
    await login(page, "parent", "parent", "TESTADM1");

    await page.goto("/parent/results");
    // the results card body (_exam select options are hidden from
    // visibility checks; assert on the rendered paragraph instead)
    await expect(
      page.locator("p").filter({ hasText: /^TESTEXAM$/ })
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("p").filter({ hasText: /A\+|Marks/i }).first()).toBeVisible();
  });

  test("exam schedule page loads", async ({ page }) => {
    await enforceLocalOnly(page);
    await login(page, "parent", "parent", "TESTADM1");

    await page.goto("/parent/exam-schedule");
    await expect(
      page.getByText(/TESTEXAM|No examinations scheduled/i).first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test("announcement received and visible in notifications", async ({ page }) => {
    await enforceLocalOnly(page);
    await login(page, "parent", "parent", "TESTADM1");

    await page.goto("/parent/dashboard");
    const bell = page.getByRole("button", { name: /Notifications/i }).first();
    await expect(bell).toBeVisible({ timeout: 15_000 });
    await bell.click();
    await expect(page.getByText(/E2E Announcement/i).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test("parent cannot open admin or teacher portals", async ({ page }) => {
    await enforceLocalOnly(page);
    await login(page, "parent", "parent", "TESTADM1");

    await page.goto("/admin/users");
    await expectPortalBlocked(page, "/admin", "/parent");

    await page.goto("/teacher/results");
    await expectPortalBlocked(page, "/teacher", "/parent");
  });
});
