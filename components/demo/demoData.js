// =========================================================
// ROSARY SCHOOL PORTAL — FICTIONAL DEMO DATASET
// ---------------------------------------------------------
// Purely fictional, client-only sample data used EXCLUSIVELY
// by demo preview panels while the production database has
// no activity records yet (fees, attendance, homework, etc.).
//
// Safety rules honored here:
// - No real student/parent/teacher names or admission
//   numbers. Every name carries a "(Sample)" suffix so the
//   content is unmistakably fictional.
// - Fixed dates around the current academic year.
// - NEVER pass these objects into services/* API calls.
// - Fee amounts are illustration values only (₹48,000 total)
//   and must never appear in finance reporting.
// =========================================================

// ---------------------------------------------------------
// PARENT / TEACHER — ATTENDANCE
// ---------------------------------------------------------

export const DEMO_ATTENDANCE_SUMMARY = {
  month: "October 2026",

  classLabel: "V-A (Sample)",

  workingDays: 23,

  presentDays: 21,

  absentDays: 1,

  lateDays: 1,

  percentage: "91.3%",

  recent: [
    { date: "Fri, 30 Oct 2026", status: "Present" },
    { date: "Thu, 29 Oct 2026", status: "Present" },
    { date: "Wed, 28 Oct 2026", status: "Late" },
    { date: "Tue, 27 Oct 2026", status: "Present" },
    { date: "Mon, 26 Oct 2026", status: "Absent" },
  ],
};

// ---------------------------------------------------------
// HOMEWORK
// ---------------------------------------------------------

export const DEMO_HOMEWORK = [
  {
    title: "Chapter 4: Integers — Worksheet 2 (Sample)",

    subject: "Mathematics (Sample)",

    assigned: "Assigned Mon, 26 Oct 2026",

    due: "Due Fri, 30 Oct 2026",

    description:
      "Solve exercises 4.1 to 4.6 and bring the worksheet to class (sample text).",
  },

  {
    title: "My Favourite Season — Essay (Sample)",

    subject: "English (Sample)",

    assigned: "Assigned Tue, 27 Oct 2026",

    due: "Due Mon, 02 Nov 2026",

    description:
      "Write a ten-line essay with a small drawing on the last page (sample text).",
  },

  {
    title: "Lab Record — Simple Circuits (Sample)",

    subject: "Science (Sample)",

    assigned: "Assigned Wed, 28 Oct 2026",

    due: "Due Wed, 04 Nov 2026",

    description:
      "Complete the observations table and diagram for the circuits experiment (sample text).",
  },
];

// ---------------------------------------------------------
// RESULTS
// ---------------------------------------------------------

export const DEMO_RESULTS_EXAM = "Term 1 Examination (Sample)";

export const DEMO_RESULT_ROWS = [
  {
    student: "Ananya Rao (Sample)",

    classLabel: "V-A (Sample)",

    subject: "Mathematics (Sample)",

    marks: "82 / 100",

    percentage: "82%",

    grade: "A",
  },

  {
    student: "Ananya Rao (Sample)",

    classLabel: "V-A (Sample)",

    subject: "English (Sample)",

    marks: "74 / 100",

    percentage: "74%",

    grade: "B+",
  },

  {
    student: "Ananya Rao (Sample)",

    classLabel: "V-A (Sample)",

    subject: "Science (Sample)",

    marks: "68 / 100",

    percentage: "68%",

    grade: "B",
  },
];

// ---------------------------------------------------------
// EXAM SCHEDULE
// ---------------------------------------------------------

export const DEMO_EXAM_SCHEDULE_ROWS = [
  {
    exam: "Term 2 Examination (Sample)",

    classLabel: "V-A (Sample)",

    subject: "Mathematics (Sample)",

    date: "Mon, 16 Nov 2026",

    time: "09:30 AM – 11:30 AM",

    room: "Room 102",
  },

  {
    exam: "Term 2 Examination (Sample)",

    classLabel: "V-A (Sample)",

    subject: "English (Sample)",

    date: "Wed, 18 Nov 2026",

    time: "09:30 AM – 11:30 AM",

    room: "Room 102",
  },

  {
    exam: "Term 2 Examination (Sample)",

    classLabel: "V-A (Sample)",

    subject: "Science (Sample)",

    date: "Fri, 20 Nov 2026",

    time: "09:30 AM – 11:30 AM",

    room: "Science Lab",
  },
];

// ---------------------------------------------------------
// CIRCULARS
// ---------------------------------------------------------

export const DEMO_CIRCULARS = [
  {
    title: "Annual Sports Day — Participation Circular (Sample)",

    category: "Sports",

    audience: "All",

    date: "Published Tue, 27 Oct 2026",

    description:
      "Students may register for track and field events through the class teacher (sample text).",
  },

  {
    title: "Winter Uniform from 15 November (Sample)",

    category: "General",

    audience: "Parents",

    date: "Published Thu, 29 Oct 2026",

    description:
      "The winter uniform becomes mandatory from mid-November (sample text).",
  },

  {
    title: "Science Exhibition — Project Guidelines (Sample)",

    category: "Academics",

    audience: "Students",

    date: "Published Fri, 30 Oct 2026",

    description:
      "Project teams of four students may register before Friday (sample text).",
  },
];

// ---------------------------------------------------------
// SCHOOL CALENDAR
// ---------------------------------------------------------

export const DEMO_CALENDAR_EVENTS = [
  {
    title: "Parent–Teacher Meeting (Sample)",

    type: "Meeting",

    date: "Sat, 07 Nov 2026",

    location: "Classrooms V-A / V-B",

    description: "Slots of 15 minutes per parent (sample text).",
  },

  {
    title: "Children's Day Celebration (Sample)",

    type: "Event",

    date: "Sat, 14 Nov 2026",

    location: "School Auditorium",

    description: "Cultural programme begins at 9:30 AM (sample text).",
  },

  {
    title: "Term 2 Examinations Begin (Sample)",

    type: "Exam",

    date: "Mon, 16 Nov 2026",

    location: "Exam Halls",

    description: "Timetable will be shared with the class (sample text).",
  },
];

// ---------------------------------------------------------
// FEES — ILLUSTRATIVE STRUCTURE (exact demo amounts below)
// ---------------------------------------------------------

export const DEMO_FEES = {
  academicYear: "2026–2027",

  student: { name: "Sample Student (Demo)", admission: "DEMO-001", classLabel: "V-A (Sample)" },

  total: 48000,

  paid: 30000,

  pending: 18000,

  installments: [
    {
      title: "Term 1 Tuition (Sample)",

      amount: 15000,

      paid: 15000,

      status: "Paid",

      dueDate: "2026-04-10",

      paidDate: "2026-04-08",

      receipt: "DEMO-RCP-2026-001",

      mode: "Online Transfer",
    },

    {
      title: "Term 2 Tuition (Sample)",

      amount: 15000,

      paid: 15000,

      status: "Paid",

      dueDate: "2026-08-10",

      paidDate: "2026-08-08",

      receipt: "DEMO-RCP-2026-002",

      mode: "Cheque",
    },

    {
      title: "Term 3 Tuition (Sample)",

      amount: 18000,

      paid: 0,

      status: "Pending",

      dueDate: "2026-12-10",

      paidDate: null,

      receipt: null,

      mode: null,
    },
  ],

  payments: [
    {
      receipt: "DEMO-RCP-2026-002",

      amount: 15000,

      date: "2026-08-08",

      mode: "Cheque",

      remark: "Collected at the school office (sample).",
    },

    {
      receipt: "DEMO-RCP-2026-001",

      amount: 15000,

      date: "2026-04-08",

      mode: "Online Transfer",

      remark: "Term 1 tuition received in full (sample).",
    },
  ],
};

// ---------------------------------------------------------
// NOTIFICATION SAMPLES (in-app inbox previews)
// ---------------------------------------------------------

export const DEMO_NOTIFICATIONS = [
  {
    title: "New Homework Assigned (Sample)",

    message:
      "Mathematics homework has been assigned for Class V-A. Due date: Fri, 30 Oct 2026 (sample notice).",

    type: "HOMEWORK",

    when: "2 hours ago",
  },

  {
    title: "School Circular Published (Sample)",

    message:
      "Annual Sports Day participation circular is now available in the portal (sample notice).",

    type: "CIRCULAR",

    when: "5 hours ago",
  },

  {
    title: "Exam Schedule Released (Sample)",

    message:
      "The Term 2 examination timetable has been released. Please review the dates (sample notice).",

    type: "EXAM_SCHEDULE",

    when: "Yesterday",
  },

  {
    title: "Results Published (Sample)",

    message:
      "The Term 1 examination results have been published. Open Academic Results to view them (sample notice).",

    type: "RESULTS_PUBLISHED",

    when: "Yesterday",
  },

  {
    title: "Fee Reminder (Sample)",

    message:
      "A reminder for Term 3 tuition which is pending. Kindly contact the school office (sample notice).",

    type: "FEE_REMINDER",

    when: "2 days ago",
  },

  {
    title: "Payment Confirmation (Sample)",

    message:
      "A payment of ₹15,000 has been recorded and receipt DEMO-RCP-2026-002 has been issued (sample notice).",

    type: "PAYMENT_CONFIRMATION",

    when: "3 days ago",
  },
];

// ---------------------------------------------------------
// DOWNLOAD FORMS SAMPLES (admin)
// ---------------------------------------------------------

export const DEMO_DOWNLOADS = [
  {
    title: "Leave Application Form (Sample)",

    category: "Forms",

    audience: "Parents",

    date: "Published Mon, 26 Oct 2026",
  },

  {
    title: "Bus Route Change Request (Sample)",

    category: "Transport",

    audience: "Parents",

    date: "Published Tue, 27 Oct 2026",
  },

  {
    title: "Bonafide Certificate Request (Sample)",

    category: "Certificates",

    audience: "All",

    date: "Published Thu, 29 Oct 2026",
  },
];
