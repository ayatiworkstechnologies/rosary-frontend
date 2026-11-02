// =========================================================
// ROSARY SCHOOL PORTAL — SAMPLE EMAIL TEMPLATES (PREVIEW ONLY)
// ---------------------------------------------------------
// These templates PREVIEW how future automatic notification
// emails will look. They are NOT connected to any SMTP
// transport in this phase — no recipient resolution, no
// dispatch, no database event records.
//
// Rules encoded here:
// - Fictional "(Sample)" content only; no personal data.
// - Sample sender/recipient addresses use example.com /
//   example.invalid (RFC-reserved, cannot deliver).
// - Rosary branding: primary #0075FF.
// - Each template provides responsive HTML + plain text.
// =========================================================

const DEMO_SCHOOL_FOOTER_HTML = `
  <tr>
    <td style="padding:18px 32px;border-top:1px solid #E5EDF5;">
      <p style="margin:0;color:#64748B;font-size:12px;line-height:18px;">
        Rosary School &middot; Sample School Office &middot; office@example.com &middot; +91 00000 00000
      </p>
      <p style="margin:8px 0 0;color:#94A3B8;font-size:11px;line-height:16px;">
        This is a sample preview generated for demonstration purposes. It was not sent by any mail server.
      </p>
    </td>
  </tr>
`;

function brandHead() {
  return `
    <tr>
      <td style="background:#0075FF;padding:20px 32px;">
        <p style="margin:0;color:#ffffff;font-size:18px;font-weight:bold;letter-spacing:1px;">
          ROSARY SCHOOL
        </p>
        <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:12px;">
          Parent &amp; Staff Communication Portal
        </p>
      </td>
    </tr>
  `;
}

function body(args) {
  return `
    <tr>
      <td style="padding:28px 32px;">
        <h1 style="margin:0 0 12px;color:#0B3A67;font-size:20px;line-height:28px;">
          ${args.heading}
        </h1>
        <p style="margin:0 0 12px;color:#334155;font-size:14px;line-height:22px;">
          ${args.greeting}
        </p>
        ${args.blocks
          .map(
            (block) =>
              `<p style="margin:0 0 12px;color:#334155;font-size:14px;line-height:22px;">${block}</p>`
          )
          .join("")}
        ${args.callout
          ? `<div style="margin:0 0 12px;background:#EAF4FF;border-radius:10px;padding:14px 16px;color:#0047A8;font-size:13px;line-height:20px;"><strong>${args.callout.title}</strong><br/>${args.callout.text}</div>`
          : ""
        }
        <p style="margin:0;color:#64748B;font-size:12px;line-height:18px;">
          Log in to the Rosary School portal for complete, up-to-date information.
        </p>
      </td>
    </tr>
  `;
}

function wrap(args) {
  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:24px 12px;background:#F5FAFF;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #E5EDF5;border-radius:14px;font-family:Segoe UI,Arial,sans-serif;border-collapse:separate;">
      ${brandHead()}
      ${body(args)}
      ${DEMO_SCHOOL_FOOTER_HTML}
    </table>
    <p style="max-width:600px;margin:10px auto 0;color:#9EC5FF;font-size:11px;text-align:center;">
      SAMPLE PREVIEW — fictional content, no delivery attempted.
    </p>
  </body>
</html>`;
}

// ---------------------------------------------------------
// Template definitions
// ---------------------------------------------------------

export const DEMO_EMAIL_TEMPLATES = [
  {
    id: "circular",

    name: "School Circular (Sample)",

    recipientGroup: "Parents + Teachers",

    subject:
      "[Rosary School Sample] New Circular: Annual Sports Day Participation",

    html: wrap({
      heading: "New School Circular",

      greeting: "Dear Parent,",

      blocks: [
        "A new circular <strong>“Annual Sports Day — Participation Circular (Sample)”</strong> has been published for all students.",

        "You can read the full circular in the portal under Circulars.",
      ],

      callout: {
        title: "Category: Sports (Sample)",

        text: "Published on Tue, 27 Oct 2026 — sample wording for preview purposes.",
      },
    }),

    text: `ROSARY SCHOOL — SAMPLE EMAIL PREVIEW (fictional content)

Subject: [Rosary School Sample] New Circular: Annual Sports Day Participation

Dear Parent,

A new circular "Annual Sports Day — Participation Circular (Sample)" has been published for all students.

Category: Sports (Sample) — Published Tue, 27 Oct 2026.

Log in to the Rosary School portal for complete details.

Rosary School · Sample School Office · office@example.com
This is a sample preview; no email was sent.`,
  },

  {
    id: "homework",

    name: "Homework Assigned (Sample)",

    recipientGroup: "Parents of the class",

    subject: "[Rosary School Sample] New Homework for Class V-A",

    html: wrap({
      heading: "New Homework Assigned",

      greeting: "Dear Parent,",

      blocks: [
        "A new homework has been assigned to <strong>Class V-A (Sample)</strong>:",

        "<strong>Mathematics — Chapter 4: Integers, Worksheet 2 (Sample)</strong> — due <strong>Fri, 30 Oct 2026</strong>.",
      ],

      callout: {
        title: "Sample entry",

        text: "Homework details shown in the preview are fictional.",
      },
    }),

    text: `ROSARY SCHOOL — SAMPLE EMAIL PREVIEW (fictional content)

Subject: [Rosary School Sample] New Homework for Class V-A

Dear Parent,

New homework: Mathematics — Chapter 4: Integers, Worksheet 2 (Sample). Due Fri, 30 Oct 2026.

Open the portal to view the full description.

Rosary School · Sample School Office · office@example.com
This is a sample preview; no email was sent.`,
  },

  {
    id: "exam-schedule",

    name: "Exam Schedule Released (Sample)",

    recipientGroup: "Parents + assigned Teachers",

    subject: "[Rosary School Sample] Examination Timetable Released for Term 2",

    html: wrap({
      heading: "Examination Timetable Released",

      greeting: "Dear Parent,",

      blocks: [
        "The <strong>Term 2 Examination (Sample)</strong> timetable has been released. First exam: <strong>Mathematics — Mon, 16 Nov 2026, 9:30 AM (Sample)</strong>.",

        "Please ensure your child reaches the exam room on time.",
      ],

      callout: {
        title: "View full timetable",

        text: "Exam Schedules section in the portal lists every subject, date and room.",
      },
    }),

    text: `ROSARY SCHOOL — SAMPLE EMAIL PREVIEW (fictional content)

Subject: [Rosary School Sample] Examination Timetable Released for Term 2

Dear Parent,

The Term 2 Examination (Sample) timetable has been released. First exam: Mathematics — Mon, 16 Nov 2026, 9:30 AM (Sample).

Open Exam Schedules in the portal for the full timetable.

Rosary School · Sample School Office · office@example.com
This is a sample preview; no email was sent.`,
  },

  {
    id: "results-published",

    name: "Results Published (Sample)",

    recipientGroup: "Parents (published exams only)",

    subject:
      "[Rosary School Sample] Term 1 Examination Results Are Now Available",

    html: wrap({
      heading: "Examination Results Published",

      greeting: "Dear Parent,",

      blocks: [
        "The results of the <strong>Term 1 Examination (Sample)</strong> have been published.",

        "You can now view subject-wise marks and grades in the portal under Academic Results.",
      ],

      callout: {
        title: "Safe wording notice",

        text: "Marks and grades for every student are shared only with that student's own linked parents.",
      },
    }),

    text: `ROSARY SCHOOL — SAMPLE EMAIL PREVIEW (fictional content)

Subject: [Rosary School Sample] Term 1 Examination Results Are Now Available

Dear Parent,

The results of the Term 1 Examination (Sample) have been published. Open Academic Results in the portal to view subject-wise marks and grades.

Rosary School · Sample School Office · office@example.com
This is a sample preview; no email was sent.`,
  },

  {
    id: "fee-reminder",

    name: "Fee Reminder (Sample)",

    recipientGroup: "Parents with pending fees",

    subject: "[Rosary School Sample] Fee Payment Reminder — Term 3 Tuition",

    html: wrap({
      heading: "Fee Payment Reminder",

      greeting: "Dear Parent,",

      blocks: [
        "This is a gentle reminder about the pending <strong>Term 3 Tuition (Sample)</strong> installment.",

        "Amount pending: <strong>₹18,000</strong> — due <strong>Thu, 10 Dec 2026</strong>.",
      ],

      callout: {
        title: "Sample amounts",

        text: "Amounts shown are fictional. Payments are handled only through the school office.",
      },
    }),

    text: `ROSARY SCHOOL — SAMPLE EMAIL PREVIEW (fictional content)

Subject: [Rosary School Sample] Fee Payment Reminder — Term 3 Tuition

Dear Parent,

This is a gentle reminder about the pending Term 3 Tuition (Sample) installment. Amount pending: INR 18,000 — due Thu, 10 Dec 2026.

Kindly contact the school office for payments and receipts.

Rosary School · Sample School Office · office@example.com
This is a sample preview; no email was sent.`,
  },

  {
    id: "payment-confirmation",

    name: "Payment Confirmation (Sample)",

    recipientGroup: "Paying parent",

    subject:
      "[Rosary School Sample] Payment Received — Receipt DEMO-RCP-2026-002",

    html: wrap({
      heading: "Payment Confirmation",

      greeting: "Dear Parent,",

      blocks: [
        "We have recorded your fee payment. A receipt has been issued on behalf of the school office.",

        "<strong>Receipt:</strong> DEMO-RCP-2026-002 — <strong>₹15,000</strong> — Term 2 Tuition (Sample) — <strong>Sat, 08 Aug 2026</strong>.",
      ],

      callout: {
        title: "Balance (sample)",

        text: "Term 3 tuition of ₹18,000 remains pending — due Thu, 10 Dec 2026 (fictional values).",
      },
    }),

    text: `ROSARY SCHOOL — SAMPLE EMAIL PREVIEW (fictional content)

Subject: [Rosary School Sample] Payment Received — Receipt DEMO-RCP-2026-002

Dear Parent,

We have recorded your fee payment. Receipt DEMO-RCP-2026-002 — INR 15,000 — Term 2 Tuition (Sample) — Sat, 08 Aug 2026.

Balance: Term 3 tuition of INR 18,000 remains pending (fictional values).

Rosary School · Sample School Office · office@example.com
This is a sample preview; no email was sent.`,
  },
];
