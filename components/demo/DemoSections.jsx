"use client";

// =========================================================
// ROSARY SCHOOL PORTAL — DEMO PREVIEW SECTIONS
// ---------------------------------------------------------
// Ready-made demo panels for each activity module. Every
// section:
// - renders ONLY when NEXT_PUBLIC_DEMO_PREVIEW="true"
//   (hard-gated here, never by API results);
// - is read-only — no event handlers, no service calls, so
//   demo content can never trigger backend writes;
// - uses purely fictional "(Sample)" data from demoData.js;
// - shows the mandatory demo notice via DemoSection.
// =========================================================

import {
  ReceiptText,
} from "lucide-react";

import {
  DemoBadge,
  DemoCard,
  DemoSection,
  DemoStat,
  DemoTable,
  demoMoney,
} from "./DemoPreview";

import {
  DEMO_ATTENDANCE_SUMMARY,
  DEMO_CALENDAR_EVENTS,
  DEMO_CIRCULARS,
  DEMO_DOWNLOADS,
  DEMO_EXAM_SCHEDULE_ROWS,
  DEMO_FEES,
  DEMO_HOMEWORK,
  DEMO_NOTIFICATIONS,
  DEMO_RESULT_ROWS,
  DEMO_RESULTS_EXAM,
} from "./demoData";

import { DEMO_PREVIEW_ENABLED } from "@/lib/demo-preview";

// ---------------------------------------------------------
// ATTENDANCE
// ---------------------------------------------------------

export function DemoAttendance({ portal = "parent" }) {
  if (!DEMO_PREVIEW_ENABLED) {
    return null;
  }

  const summary = DEMO_ATTENDANCE_SUMMARY;

  const who =
    portal === "teacher"
      ? "Class attendance summary"
      : "Monthly attendance";

  return (
    <DemoSection
      title={`Sample ${who} (Illustrative)`}
      description="Shows how monthly attendance analytics and daily status history will look once real attendance records exist."
    >
      <div
        className="
          grid
          grid-cols-2
          gap-3
          sm:grid-cols-4
        "
      >
        <DemoStat
          label="Attendance %"
          value={summary.percentage}
          tone="green"
        />

        <DemoStat
          label="Present"
          value={`${summary.presentDays}/${summary.workingDays} days`}
          tone="blue"
        />

        <DemoStat
          label="Late"
          value={`${summary.lateDays} day`}
          tone="orange"
        />

        <DemoStat
          label="Absent"
          value={`${summary.absentDays} day`}
          tone="red"
        />
      </div>

      <div
        className="
          mt-4
        "
      >
        <DemoTable
          columns={[
            "Date",

            `Class — ${summary.classLabel}`,

            "Status",
          ]}
          rows={[
            ...summary.recent.map(
              (row) => [
                row.date,
                row.date === summary.recent[0].date
                  ? "Attendance marked by the class teacher (sample)"
                  : "Marked by the class teacher (sample)",
                <DemoBadge
                  key={row.status}
                  status={row.status}
                />,
              ]
            ),
          ]}
        />
      </div>
    </DemoSection>
  );
}

// ---------------------------------------------------------
// HOMEWORK
// ---------------------------------------------------------

export function DemoHomework({ portal = "parent" }) {
  if (!DEMO_PREVIEW_ENABLED) {
    return null;
  }

  const title =
    portal === "teacher"
      ? "Sample Homework Board (Illustrative)"
      : "Sample Homework Entries (Illustrative)";

  return (
    <DemoSection
      title={title}
      description="Shows how assigned homework cards will appear. Real homework will list here from the actual API."
    >
      <div
        className="
          grid
          gap-3
          md:grid-cols-2
          xl:grid-cols-3
        "
      >
        {DEMO_HOMEWORK.map(
          (item) => (
            <DemoCard
              key={item.title}
              title={item.title}
              description={item.description}
              badge="Pending"
              meta={`${item.subject} • ${item.assigned} • ${item.due}`}
            />
          )
        )}
      </div>
    </DemoSection>
  );
}

// ---------------------------------------------------------
// RESULTS
// ---------------------------------------------------------

export function DemoResults({ portal = "parent" }) {
  if (!DEMO_PREVIEW_ENABLED) {
    return null;
  }

  const title =
    portal === "admin"
      ? "Sample Result Register (Illustrative)"
      : `Sample Published Results — ${DEMO_RESULTS_EXAM}`;

  return (
    <DemoSection
      title={title}
      description="Marks and grades are fictional. Real published results will be read from the live API only."
    >
      <DemoTable
        columns={[
          "Student",

          "Class",

          "Subject",

          "Marks",

          "Percentage",

          "Grade",
        ]}
        rows={DEMO_RESULT_ROWS.map(
          (row) => [
            row.student,
            row.classLabel,
            row.subject,
            row.marks,
            row.percentage,
            <DemoBadge
              key={row.grade}
              status="Published"
            />,
          ]
        )}
      />
    </DemoSection>
  );
}

// ---------------------------------------------------------
// EXAM SCHEDULE
// ---------------------------------------------------------

export function DemoExamSchedule({ portal = "parent" }) {
  if (!DEMO_PREVIEW_ENABLED) {
    return null;
  }

  const title =
    portal === "teacher"
      ? "Sample Exam Timetable (Illustrative)"
      : "Sample Examination Timetable (Illustrative)";

  return (
    <DemoSection
      title={title}
      description="Illustrative timetable entries only. The real exam schedule will appear here from the API."
    >
      <DemoTable
        columns={[
          "Exam",
          "Class",
          "Subject",
          "Date",
          "Time",
          "Room",
        ]}
        rows={DEMO_EXAM_SCHEDULE_ROWS.map(
          (row) => [
            row.exam,
            row.classLabel,
            row.subject,
            row.date,
            row.time,
            row.room,
          ]
        )}
      />
    </DemoSection>
  );
}

// ---------------------------------------------------------
// CIRCULARS
// ---------------------------------------------------------

export function DemoCirculars() {
  if (!DEMO_PREVIEW_ENABLED) {
    return null;
  }

  return (
    <DemoSection
      title="Sample Circulars (Illustrative)"
      description="These circulars are fictional and stored only in the browser bundle — they do not exist in any database."
    >
      <div
        className="
          grid
          gap-3
          md:grid-cols-2
          xl:grid-cols-3
        "
      >
        {DEMO_CIRCULARS.map(
          (item) => (
            <DemoCard
              key={item.title}
              title={item.title}
              description={item.description}
              meta={`${item.category} • Audience: ${item.audience} • ${item.date}`}
            />
          )
        )}
      </div>
    </DemoSection>
  );
}

// ---------------------------------------------------------
// SCHOOL CALENDAR
// ---------------------------------------------------------

export function DemoCalendar() {
  if (!DEMO_PREVIEW_ENABLED) {
    return null;
  }

  return (
    <DemoSection
      title="Sample Calendar Events (Illustrative)"
      description="Fictional events that demonstrate the event cards, type badges and date layout."
    >
      <div
        className="
          grid
          gap-3
          md:grid-cols-2
          xl:grid-cols-3
        "
      >
        {DEMO_CALENDAR_EVENTS.map(
          (item) => (
            <DemoCard
              key={item.title}
              title={item.title}
              description={item.description}
              badge={
                item.type
              }
              meta={`${item.date} • ${item.location}`}
            />
          )
        )}
      </div>
    </DemoSection>
  );
}

// ---------------------------------------------------------
// NOTIFICATION SAMPLES (in-app preview)
// ---------------------------------------------------------

export function DemoNotifications() {
  if (!DEMO_PREVIEW_ENABLED) {
    return null;
  }

  return (
    <DemoSection
      title="Sample Notifications (Illustrative)"
      description="How each notification type will appear in the in-app inbox once real events occur."
    >
      <div
        className="
          space-y-2.5
        "
      >
        {DEMO_NOTIFICATIONS.map(
          (item) => (
            <div
              key={item.type}
              className="
                flex
                items-start
                justify-between
                gap-3
                rounded-xl
                border
                border-[#E4EDF7]
                bg-white
                px-4
                py-3
                shadow-sm
              "
            >
              <div
                className="
                  min-w-0
                "
              >
                <p
                  className="
                    text-sm
                    font-bold
                    text-[#0B3A67]
                  "
                >
                  {item.title}
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-500
                  "
                >
                  {item.message}
                </p>
              </div>

              <span
                className="
                  shrink-0
                  text-[10px]
                  text-slate-400
                "
              >
                {item.when}
              </span>
            </div>
          )
        )}
      </div>
    </DemoSection>
  );
}

// ---------------------------------------------------------
// DOWNLOADS (admin)
// ---------------------------------------------------------

export function DemoDownloads() {
  if (!DEMO_PREVIEW_ENABLED) {
    return null;
  }

  return (
    <DemoSection
      title="Sample Downloadable Forms (Illustrative)"
      description="Fictional form cards showing the downloads layout."
    >
      <div
        className="
          grid
          gap-3
          md:grid-cols-2
          xl:grid-cols-3
        "
      >
        {DEMO_DOWNLOADS.map(
          (item) => (
            <DemoCard
              key={item.title}
              title={item.title}
              meta={`${item.category} • Audience: ${item.audience} • ${item.date}`}
            />
          )
        )}
      </div>
    </DemoSection>
  );
}

// ---------------------------------------------------------
// RECEIPT PREVIEW (sample)
// ---------------------------------------------------------

function DemoReceipt({
  fee,
  installment,
}) {
  return (
    <div
      className="
        w-full
        max-w-sm
        rounded-2xl
        border
        border-dashed
        border-[#C7DBF2]
        bg-white
        p-5
        shadow-sm
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-[#EDF3FA]
          pb-3
        "
      >
        <p
          className="
            text-sm
            font-bold
            text-[#0B3A67]
          "
        >
          Receipt (Sample)
        </p>

        <ReceiptText
          size={18}
          className="text-[#0075FF]"
        />
      </div>

      <div
        className="
          mt-3
          space-y-2
          text-xs
        "
      >
        <ReceiptRow label="Receipt No" value={installment.receipt} />

        <ReceiptRow
          label="Student"
          value={`${fee.student.name} — ${fee.student.admission}`}
        />

        <ReceiptRow label="Fee" value={installment.title} />

        <ReceiptRow label="Amount" value={demoMoney(installment.amount)} />

        <ReceiptRow
          label="Paid On"
          value={demoDate(installment.paidDate)}
        />

        <ReceiptRow label="Mode" value={installment.mode} />
      </div>

      <p
        className="
          mt-4
          rounded-lg
          bg-[#FEF3C7]
          px-3
          py-2
          text-[10px]
          font-bold
          text-amber-700
        "
      >
        DEMO SAMPLE — Not an official receipt. No payment has been recorded.
      </p>
    </div>
  );
}

function ReceiptRow({
  label,
  value,
}) {
  return (
    <div
      className="
        flex
        justify-between
        gap-3
      "
    >
      <span className="text-slate-400">{label}</span>

      <span className="text-right font-semibold text-slate-600">
        {value || "--"}
      </span>
    </div>
  );
}

// ---------------------------------------------------------
// PARENT FEES — HIGH PRIORITY POLISHED PREVIEW
// ---------------------------------------------------------

export function DemoParentFees() {
  if (!DEMO_PREVIEW_ENABLED) {
    return null;
  }

  const fee = DEMO_FEES;

  return (
    <DemoSection
      title="Sample Fee Statement (Illustrative)"
      description={`Fictional fee statement for ${fee.academicYear}. Real fee data is read from the Fees API only and never mixes with these amounts.`}
    >
      {/* SUMMARY CARDS */}

      <div
        className="
          grid
          grid-cols-1
          gap-3
          sm:grid-cols-3
        "
      >
        <DemoStat
          label="Total Fee"
          value={demoMoney(fee.total)}
          tone="blue"
        />

        <DemoStat
          label="Paid"
          value={demoMoney(fee.paid)}
          tone="green"
        />

        <DemoStat
          label="Pending"
          value={demoMoney(fee.pending)}
          tone="orange"
        />
      </div>

      {/* INSTALLMENT TABLE */}

      <div
        className="
          mt-4
        "
      >
        <DemoTable
          columns={[
            "Installment",
            "Amount",
            "Paid",
            "Balance",
            "Due Date",
            "Status",
            "Receipt",
          ]}
          rows={fee.installments.map(
            (item) => [
              item.title,
              demoMoney(item.amount),
              demoMoney(item.paid),
              demoMoney(item.amount - item.paid),
              demoDate(item.dueDate),
              <DemoBadge
                key={item.status}
                status={item.status}
              />,
              item.receipt || "—",
            ]
          )}
        />
      </div>

      {/* PAYMENT HISTORY + RECEIPT */}

      <div
        className="
          mt-4
          grid
          gap-4
          lg:grid-cols-2
        "
      >
        <div>
          <p
            className="
              mb-2
              text-xs
              font-bold
              text-[#0B3A67]
            "
          >
            Payment History (Sample)
          </p>

          <div className="space-y-2">
            {fee.payments.map(
              (payment) => (
                <div
                  key={payment.receipt}
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    rounded-xl
                    border
                    border-[#E4EDF7]
                    bg-white
                    px-4
                    py-3
                    text-xs
                    shadow-sm
                  "
                >
                  <div>
                    <p className="font-bold text-[#0B3A67]">
                      {demoMoney(payment.amount)}
                    </p>

                    <p className="mt-0.5 text-slate-400">
                      {demoDate(payment.date)} •{" "}
                      {payment.mode}
                    </p>
                  </div>

                  <span className="text-slate-400">
                    {payment.receipt}
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold text-[#0B3A67]">
            Sample Receipt Preview
          </p>

          <DemoReceipt
            fee={fee}
            installment={fee.installments[1]}
          />
        </div>
      </div>
    </DemoSection>
  );
}

// ---------------------------------------------------------
// ADMIN FEES — STRUCTURE / BALANCE PREVIEW
// ---------------------------------------------------------

export function DemoAdminFees() {
  if (!DEMO_PREVIEW_ENABLED) {
    return null;
  }

  const fee = DEMO_FEES;

  return (
    <DemoSection
      title="Sample Fee Collection Preview (Illustrative)"
      description="Demonstrates the fee register columns, balances and a sample receipt. Real collection totals are never affected by this content."
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <DemoStat
          label="Total Fees (Sample)"
          value={demoMoney(fee.total)}
          tone="blue"
        />

        <DemoStat
          label="Collected (Sample)"
          value={demoMoney(fee.paid)}
          tone="green"
        />

        <DemoStat
          label="Outstanding (Sample)"
          value={demoMoney(fee.pending)}
          tone="orange"
        />
      </div>

      <div className="mt-4">
        <DemoTable
          columns={[
            "Student",
            "Installment",
            "Amount",
            "Paid",
            "Balance",
            "Due Date",
            "Status",
            "Receipt",
          ]}
          rows={fee.installments.map(
            (item) => [
              `${fee.student.name} — ${fee.student.classLabel}`,
              item.title,
              demoMoney(item.amount),
              demoMoney(item.paid),
              demoMoney(item.amount - item.paid),
              demoDate(item.dueDate),
              <DemoBadge
                key={item.status}
                status={item.status}
              />,
              item.receipt || "—",
            ]
          )}
        />
      </div>

      <div className="mt-4 flex justify-center">
        <DemoReceipt fee={fee} installment={fee.installments[0]} />
      </div>
    </DemoSection>
  );
}

// ---------------------------------------------------------
// ADMIN DASHBOARD COMPOSITE — activity previews
// ---------------------------------------------------------

export function DemoAdminDashboard() {
  if (!DEMO_PREVIEW_ENABLED) {
    return null;
  }

  const summary = DEMO_ATTENDANCE_SUMMARY;

  return (
    <DemoSection
      title="Activity Modules Preview (Illustrative)"
      description="A fictional look at attendance analytics, homework, the exam timetable and inbox notifications until real records exist."
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <DemoStat
          label="Avg Attendance %"
          value={summary.percentage}
          tone="green"
        />

        <DemoStat
          label="Present Today (Sample)"
          value="38 / 41"
          tone="blue"
        />

        <DemoStat
          label="Homework Due This Week"
          value="6"
          tone="orange"
        />

        <DemoStat
          label="Exams Upcoming"
          value="1"
          tone="red"
        />
      </div>

      <div className="mt-4 border-t border-dashed border-[#9EC5FF] pt-4">
        <p className="mb-2 text-xs font-bold text-[#0B3A67]">
          Sample Homework (Illustrative)
        </p>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {DEMO_HOMEWORK.map(
            (item) => (
              <DemoCard
                key={item.title}
                title={item.title}
                description={item.description}
                meta={`${item.subject} • ${item.due}`}
              />
            )
          )}
        </div>
      </div>

      <div className="mt-4 border-t border-dashed border-[#9EC5FF] pt-4">
        <p className="mb-2 text-xs font-bold text-[#0B3A67]">
          Sample Exam Schedule (Illustrative)
        </p>

        <DemoTable
          columns={[
            "Exam",
            "Class",
            "Subject",
            "Date",
            "Time",
            "Room",
          ]}
          rows={DEMO_EXAM_SCHEDULE_ROWS.map((row) => [
            row.exam,
            row.classLabel,
            row.subject,
            row.date,
            row.time,
            row.room,
          ])}
        />
      </div>

      <div className="mt-4 border-t border-dashed border-[#9EC5FF] pt-4">
        <p className="mb-2 text-xs font-bold text-[#0B3A67]">
          Sample Inbox Notifications (Illustrative)
        </p>

        <div className="space-y-2">
          {DEMO_NOTIFICATIONS.slice(0, 3).map((item) => (
            <div
              key={item.type}
              className="rounded-xl border border-[#E4EDF7] bg-white px-4 py-3 text-xs shadow-sm"
            >
              <p className="font-bold text-[#0B3A67]">{item.title}</p>

              <p className="mt-1 text-slate-500">{item.message}</p>
            </div>
          ))}
        </div>
      </div>
    </DemoSection>
  );
}

// ---------------------------------------------------------
// helpers
// ---------------------------------------------------------

function demoDate(value) {
  if (!value) {
    return "--";
  }

  return new Date(
    `${value}T00:00:00`
  ).toLocaleDateString(
    "en-IN",

    {
      day: "2-digit",

      month: "short",

      year: "numeric",
    }
  );
}
