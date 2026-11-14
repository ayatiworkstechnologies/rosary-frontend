
"use client";

import { useEffect, useState } from "react";
import api from "../../../services/api";

const emptyForm = {
  target_type: "INDIVIDUAL_PARENT",
  class_ids: [],
  student_ids: [],
  parent_user_id: null,
  category: "GENERAL",
  send_in_app: true,
  send_email: false,
  title: "",
  message: "",
};

function getItems(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.classes)) return data.classes;
  if (Array.isArray(data?.users)) return data.users;
  return [];
}

function getError(error) {
  const detail = error?.response?.data?.detail;

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item.msg || "Invalid input")
      .join(", ");
  }

  return error?.message || "Something went wrong";
}

const inputStyle =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

const labelStyle =
  "mb-2 block text-sm font-semibold text-slate-700";

const targetLabels = {
  ALL_PARENTS: "All Parents",
  CLASSES: "Selected Classes",
  STUDENTS: "Selected Students",
  INDIVIDUAL_PARENT: "Individual Parent",
};

const categoryLabels = {
  GENERAL: "General announcement",
  CIRCULAR: "Circular announcement",
  IMPORTANT: "Important school update",
  FEE_REMINDER: "Fee reminder",
};

export default function AdminNotificationsPage() {
  const [form, setForm] = useState(emptyForm);
  const [classes, setClasses] = useState([]);
  const [parentSearch, setParentSearch] = useState("");
  const [parents, setParents] = useState([]);
  const [selectedParent, setSelectedParent] = useState(null);
  const [studentSearch, setStudentSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [emailStatus, setEmailStatus] = useState(null);
  const [emailMetrics, setEmailMetrics] = useState(null);
  const [history, setHistory] = useState([]);

  const [loadingClasses, setLoadingClasses] = useState(false);
  const [searching, setSearching] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [sending, setSending] = useState(false);

  const [recipientCount, setRecipientCount] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [previewSignature, setPreviewSignature] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [sendRequestKey, setSendRequestKey] = useState("");

  const isBulk = form.target_type !== "INDIVIDUAL_PARENT";

  const targetPayload = {
    target_type: form.target_type,
    class_ids:
      form.target_type === "CLASSES" ? form.class_ids : [],
    student_ids:
      form.target_type === "STUDENTS" ? form.student_ids : [],
    parent_user_id:
      form.target_type === "INDIVIDUAL_PARENT"
        ? form.parent_user_id
        : null,
  };

  const signature = JSON.stringify(targetPayload);

  const previewIsCurrent =
    recipientCount !== null &&
    previewSignature === signature;

  const optionalEmailAvailable = Boolean(
    emailStatus?.enabled && emailStatus?.provider_ready
  );

  const operationalCategories = Object.entries(
    emailStatus?.automatic_categories || {}
  ).filter(([, policy]) => policy.operational_enabled);

  function recipientSelectionSummary() {
    if (form.target_type === "INDIVIDUAL_PARENT") {
      return selectedParent
        ? `${selectedParent.name} (${selectedParent.username})`
        : "Individual Parent";
    }
    if (form.target_type === "CLASSES") {
      const selected = classes
        .filter((item) => form.class_ids.includes(Number(item.id)))
        .map((item) => `${item.name} - ${item.section}`);
      return selected.length > 0 ? selected.join(", ") : "Selected Classes";
    }
    if (form.target_type === "STUDENTS") {
      return selectedStudents.length > 0
        ? selectedStudents.map((student) => student.full_name).join(", ")
        : "Selected Students";
    }
    return targetLabels[form.target_type];
  }

  function resetPreview() {
    setRecipientCount(null);
    setPreviewData(null);
    setPreviewSignature("");
    setConfirmOpen(false);
    setConfirmText("");
    setNotice("");
    setError("");
    setSendRequestKey("");
  }

  useEffect(() => {
    async function loadClasses() {
      setLoadingClasses(true);

      try {
        const response = await api.get("/admin/classes");
        setClasses(getItems(response.data));
      } catch (err) {
        setError(
          `Unable to load classes: ${getError(err)}`
        );
      } finally {
        setLoadingClasses(false);
      }
    }

    loadClasses();

    async function loadEmailData() {
      try {
        const [statusResponse, metricsResponse, historyResponse] = await Promise.all([
          api.get("/admin/notifications/email-status"),
          api.get("/admin/notifications/email-metrics"),
          api.get("/admin/notifications/email-batches", {
            params: { page: 1, page_size: 10 },
          }),
        ]);
        setEmailStatus(statusResponse.data);
        setEmailMetrics(metricsResponse.data);
        setHistory(getItems(historyResponse.data));
      } catch (err) {
        setError(`Unable to load email status: ${getError(err)}`);
      }
    }

    loadEmailData();
  }, []);

  function changeTarget(targetType) {
    setForm((previous) => ({
      ...previous,
      target_type: targetType,
      class_ids: [],
      student_ids: [],
      parent_user_id: null,
    }));

    setSelectedParent(null);
    setParents([]);
    setParentSearch("");
    setStudentSearch("");
    setStudents([]);
    setSelectedStudents([]);
    resetPreview();
  }

  function toggleClass(classId) {
    setForm((previous) => ({
      ...previous,
      class_ids: previous.class_ids.includes(classId)
        ? previous.class_ids.filter((id) => id !== classId)
        : [...previous.class_ids, classId],
    }));

    resetPreview();
  }

  async function searchParents() {
    const search = parentSearch.trim();

    if (search.length < 2) {
      setError("Enter at least 2 characters to search.");
      return;
    }

    setSearching(true);
    setError("");
    setParents([]);

    try {
      const response = await api.get("/admin/users", {
        params: {
          role: "PARENT",
          search,
          is_active: true,
        },
      });

      const results = getItems(response.data).filter(
        (user) =>
          String(user.role).toUpperCase() === "PARENT" &&
          user.is_active !== false
      );

      setParents(results);
    } catch (err) {
      setError(getError(err));
    } finally {
      setSearching(false);
    }
  }

  function chooseParent(parent) {
    setSelectedParent(parent);
    setForm((previous) => ({
      ...previous,
      parent_user_id: Number(parent.id),
    }));
    setParents([]);
    resetPreview();
  }

  async function searchStudents() {
    const search = studentSearch.trim();

    if (search.length < 2) {
      setError("Enter at least 2 characters to search students.");
      return;
    }

    setSearching(true);
    setError("");

    try {
      const response = await api.get("/admin/students", {
        params: {
          search,
          is_active: true,
          page: 1,
          page_size: 25,
        },
      });
      setStudents(getItems(response.data));
    } catch (err) {
      setError(getError(err));
    } finally {
      setSearching(false);
    }
  }

  function toggleStudent(student) {
    const studentId = Number(student.id);
    const selected = form.student_ids.includes(studentId);

    setForm((previous) => ({
      ...previous,
      student_ids: selected
        ? previous.student_ids.filter((id) => id !== studentId)
        : [...previous.student_ids, studentId],
    }));
    setSelectedStudents((previous) =>
      selected
        ? previous.filter((item) => Number(item.id) !== studentId)
        : [...previous, student]
    );
    resetPreview();
  }

  function validateTarget() {
    if (
      form.target_type === "CLASSES" &&
      form.class_ids.length === 0
    ) {
      throw new Error("Select at least one class.");
    }

    if (
      form.target_type === "INDIVIDUAL_PARENT" &&
      !form.parent_user_id
    ) {
      throw new Error("Select a Parent account.");
    }

    if (
      form.target_type === "STUDENTS" &&
      form.student_ids.length === 0
    ) {
      throw new Error("Select at least one student.");
    }

    if (!form.send_in_app && !form.send_email) {
      throw new Error("Select at least one delivery channel.");
    }

    if (
      form.send_email &&
      !optionalEmailAvailable
    ) {
      throw new Error("Parent email delivery is not configured yet.");
    }

    if (
      form.category === "FEE_REMINDER" &&
      !["STUDENTS", "INDIVIDUAL_PARENT"].includes(form.target_type)
    ) {
      throw new Error(
        "Fee reminders must target selected students or one parent."
      );
    }
  }

  async function previewRecipients() {
    setPreviewing(true);
    setError("");
    setNotice("");
    setRecipientCount(null);
    setPreviewData(null);
    setPreviewSignature("");

    try {
      validateTarget();

      const response = await api.post(
        "/admin/notifications/preview",
        targetPayload
      );

      setRecipientCount(response.data.recipient_count);
      setPreviewData(response.data);
      setPreviewSignature(signature);
    } catch (err) {
      setError(getError(err));
    } finally {
      setPreviewing(false);
    }
  }

  function requestSend(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    try {
      validateTarget();

      if (!previewIsCurrent || recipientCount < 1) {
        throw new Error(
          "Preview eligible recipients before sending."
        );
      }

      if (form.title.trim().length < 3) {
        throw new Error(
          "Notification title must contain at least 3 characters."
        );
      }

      if (form.message.trim().length < 3) {
        throw new Error(
          "Notification message must contain at least 3 characters."
        );
      }

      setConfirmText("");
      setConfirmOpen(true);
    } catch (err) {
      setError(getError(err));
    }
  }

  async function sendNotification() {
    if (
      sending ||
      !previewIsCurrent ||
      recipientCount < 1 ||
      (isBulk && confirmText !== "SEND")
    ) {
      return;
    }

    setSending(true);
    setError("");

    try {
      // Recheck the count immediately before sending.
      const check = await api.post(
        "/admin/notifications/preview",
        targetPayload
      );

      const latestCount = check.data.recipient_count;

      if (latestCount !== recipientCount) {
        setRecipientCount(latestCount);
        setPreviewSignature(signature);
        setConfirmOpen(false);

        throw new Error(
          `Recipient count changed to ${latestCount}. Review and confirm again.`
        );
      }

      if (
        form.send_email &&
        check.data.email_recipient_count !==
          previewData?.email_recipient_count
      ) {
        setPreviewData(check.data);
        setConfirmOpen(false);
        throw new Error(
          "Eligible email recipient count changed. Review and confirm again."
        );
      }

      const requestKey = sendRequestKey || crypto.randomUUID();
      if (!sendRequestKey) setSendRequestKey(requestKey);

      const response = await api.post(
        "/admin/notifications/send",
        {
          ...targetPayload,
          category: form.category,
          send_in_app: form.send_in_app,
          send_email: form.send_email,
          idempotency_key: requestKey,
          confirmed_email_recipient_count: form.send_email
            ? previewData.email_recipient_count
            : null,
          title: form.title.trim(),
          message: form.message.trim(),
        }
      );

      setConfirmOpen(false);
      setConfirmText("");

      setNotice(
        `${response.data.notifications_created} in-app notification(s) created; ${response.data.email_queued} email(s) queued.`
      );

      // Clear the form to discourage accidental resubmission.
      setForm(emptyForm);
      setSelectedParent(null);
      setParentSearch("");
      setParents([]);
      setStudents([]);
      setSelectedStudents([]);
      setStudentSearch("");
      setRecipientCount(null);
      setPreviewData(null);
      setPreviewSignature("");
      setSendRequestKey("");

      const [metricsResponse, historyResponse] = await Promise.all([
        api.get("/admin/notifications/email-metrics"),
        api.get("/admin/notifications/email-batches", {
          params: { page: 1, page_size: 10 },
        }),
      ]);
      setEmailMetrics(metricsResponse.data);
      setHistory(getItems(historyResponse.data));
    } catch (err) {
      setError(getError(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0B3A67] md:text-3xl">
            Admin Notifications
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Send announcements to Parent Portal accounts.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
          >
            {notice}
          </div>
        )}

        {emailMetrics && (
          <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
            <div>
              <h2 className="text-lg font-bold text-[#0B3A67]">
                Email Delivery Health
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Aggregate queue activity. Recipient addresses remain masked.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                ["Notifications", emailMetrics.total_notifications_created],
                ["Queued", emailMetrics.total_queued || 0],
                ["Sent", emailMetrics.total_sent || 0],
                ["Failed", emailMetrics.total_failed || 0],
                ["Retries", emailMetrics.total_retried || 0],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {label}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-[#0B3A67]">
                    {value || 0}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-500">
              Last worker activity: {emailMetrics.last_worker_activity
                ? new Date(emailMetrics.last_worker_activity).toLocaleString()
                : "No delivery attempts recorded"}
            </p>

            {emailMetrics.recent_failures?.length > 0 && (
              <div className="rounded-lg border border-red-100 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-800">
                  Recent delivery failures
                </p>
                <ul className="mt-2 space-y-2 text-xs text-red-700">
                  {emailMetrics.recent_failures.slice(0, 5).map((failure) => (
                    <li key={failure.delivery_id}>
                      {failure.email} · batch {failure.batch_id} · {failure.reason || "Unknown provider error"}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {emailStatus && (
          <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#0B3A67]">
                  Automatic Email Policy
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Manual Admin emails remain optional and only include verified,
                  opted-in parents. Operational eligibility applies only to
                  separately approved automatic categories.
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  emailStatus.operational_master_enabled
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                Operational policy {emailStatus.operational_master_enabled
                  ? "enabled"
                  : "disabled"}
              </span>
            </div>

            <p
              role="status"
              className={`rounded-lg border p-3 text-xs ${
                emailStatus.delivery_mode === "available"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : emailStatus.delivery_mode === "test"
                    ? "border-blue-200 bg-blue-50 text-blue-800"
                    : "border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              {emailStatus.delivery_status_message}
            </p>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(emailStatus.automatic_categories || {}).map(
                ([category, policy]) => (
                  <div
                    key={category}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs"
                  >
                    <span className="font-semibold text-slate-700">
                      {category.replaceAll("_", " ")}
                    </span>
                    <span className="text-slate-500">
                      {policy.operational_enabled
                        ? "Operational approved"
                        : policy.automatic_enabled
                          ? "Optional only"
                          : "Disabled"}
                    </span>
                  </div>
                )
              )}
            </div>
          </section>
        )}

        <form
          onSubmit={requestSend}
          className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-7"
        >
          <section>
            <label className={labelStyle}>
              Select Recipients
            </label>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {Object.entries(targetLabels).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => changeTarget(value)}
                  className={`rounded-lg border px-4 py-4 text-sm font-medium transition ${
                    form.target_type === value
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          {form.target_type === "CLASSES" && (
            <section>
              <label className={labelStyle}>
                Choose Classes
              </label>

              {loadingClasses ? (
                <p className="text-sm text-slate-500">
                  Loading classes...
                </p>
              ) : classes.length === 0 ? (
                <p className="text-sm text-amber-700">
                  No classes available. Check the Admin Classes API.
                </p>
              ) : (
                <div className="grid max-h-64 grid-cols-2 gap-3 overflow-y-auto rounded-lg border border-slate-200 p-4 md:grid-cols-4">
                  {classes
                    .filter((item) => item.is_active !== false)
                    .map((item) => (
                      <label
                        key={item.id}
                        className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
                      >
                        <input
                          type="checkbox"
                          checked={form.class_ids.includes(
                            Number(item.id)
                          )}
                          onChange={() =>
                            toggleClass(Number(item.id))
                          }
                          className="h-4 w-4 accent-blue-600"
                        />
                        <span>
                          {item.name} - {item.section}
                        </span>
                      </label>
                    ))}
                </div>
              )}
            </section>
          )}

          {form.target_type === "INDIVIDUAL_PARENT" && (
            <section className="space-y-3">
              <label className={labelStyle}>
                Search Parent
              </label>

              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  className={inputStyle}
                  value={parentSearch}
                  onChange={(event) =>
                    setParentSearch(event.target.value)
                  }
                  placeholder="Parent name or username"
                />

                <button
                  type="button"
                  onClick={searchParents}
                  disabled={searching}
                  className="rounded-lg bg-slate-800 px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
                >
                  {searching ? "Searching..." : "Search"}
                </button>
              </div>

              {parents.length > 0 && (
                <div className="max-h-60 overflow-y-auto rounded-lg border border-slate-200">
                  {parents.map((parent) => (
                    <button
                      key={parent.id}
                      type="button"
                      onClick={() => chooseParent(parent)}
                      className="block w-full border-b border-slate-100 px-4 py-3 text-left text-sm hover:bg-slate-50"
                    >
                      <span className="font-medium">
                        {parent.name}
                      </span>
                      <span className="ml-2 text-slate-500">
                        ({parent.username})
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {selectedParent && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                  Selected: {selectedParent.name} (
                  {selectedParent.username})
                </div>
              )}
            </section>
          )}

          {form.target_type === "STUDENTS" && (
            <section className="space-y-3">
              <label className={labelStyle}>
                Search Students
              </label>

              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  className={inputStyle}
                  value={studentSearch}
                  onChange={(event) =>
                    setStudentSearch(event.target.value)
                  }
                  placeholder="Student name or admission number"
                />
                <button
                  type="button"
                  onClick={searchStudents}
                  disabled={searching}
                  className="rounded-lg bg-slate-800 px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
                >
                  {searching ? "Searching..." : "Search"}
                </button>
              </div>

              {students.length > 0 && (
                <div className="max-h-60 overflow-y-auto rounded-lg border border-slate-200">
                  {students.map((student) => (
                    <label
                      key={student.id}
                      className="flex cursor-pointer items-center gap-3 border-b border-slate-100 px-4 py-3 text-sm hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={form.student_ids.includes(
                          Number(student.id)
                        )}
                        onChange={() => toggleStudent(student)}
                        className="h-4 w-4 accent-blue-600"
                      />
                      <span>
                        <strong>{student.full_name}</strong>{" "}
                        <span className="text-slate-500">
                          ({student.admission_no})
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {selectedStudents.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedStudents.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => toggleStudent(student)}
                      className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800"
                    >
                      {student.full_name} (remove)
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          <section className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div>
              <label htmlFor="notification-category" className={labelStyle}>
                Notification Type
              </label>
              <select
                id="notification-category"
                className={inputStyle}
                value={form.category}
                onChange={(event) => {
                  setForm((previous) => ({
                    ...previous,
                    category: event.target.value,
                  }));
                  resetPreview();
                }}
              >
                <option value="GENERAL">General announcement</option>
                <option value="CIRCULAR">Circular announcement</option>
                <option value="IMPORTANT">Important school update</option>
                <option
                  value="FEE_REMINDER"
                  disabled={!emailStatus?.fee_reminders_enabled}
                >
                  Fee reminder
                </option>
              </select>
            </div>

            <div>
              <span className={labelStyle}>Delivery Channels</span>
              <div className="grid gap-3 md:grid-cols-3">
                <label className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
                  <span className="flex items-center gap-3 font-semibold">
                    <input
                      type="checkbox"
                      checked={form.send_in_app}
                      onChange={(event) => {
                        setForm((previous) => ({
                          ...previous,
                          send_in_app: event.target.checked,
                        }));
                        setSendRequestKey("");
                      }}
                      className="h-4 w-4 accent-blue-600"
                    />
                    In-app
                  </span>
                  <span className="mt-2 block text-xs font-normal leading-5 text-slate-500">
                    Parent Portal notification. This remains available even when
                    email delivery is disabled.
                  </span>
                </label>
                <label
                  className={`rounded-lg border bg-white p-4 text-sm ${
                    optionalEmailAvailable
                      ? "border-slate-200 text-slate-700"
                      : "border-slate-200 text-slate-400"
                  }`}
                >
                  <span className="flex items-center gap-3 font-semibold">
                    <input
                      type="checkbox"
                      checked={form.send_email}
                      disabled={!optionalEmailAvailable}
                      onChange={(event) => {
                        setForm((previous) => ({
                          ...previous,
                          send_email: event.target.checked,
                        }));
                        setSendRequestKey("");
                      }}
                      className="h-4 w-4 accent-blue-600"
                    />
                    Optional Email
                  </span>
                  <span className="mt-2 block text-xs font-normal leading-5">
                    Verified, opted-in parents only.
                    {!optionalEmailAvailable && emailStatus
                      ? ` ${emailStatus.delivery_status_message}`
                      : ""}
                  </span>
                </label>
                <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
                  <span className="flex items-center gap-3 font-semibold">
                    <input
                      type="checkbox"
                      checked={false}
                      disabled
                      aria-label="Operational Email"
                      className="h-4 w-4 accent-blue-600"
                    />
                    Operational Email
                  </span>
                  <span className="mt-2 block text-xs font-normal leading-5 text-slate-500">
                    Automatic only; never selectable for a manual Admin message.
                    {operationalCategories.length > 0
                      ? ` Approved categories: ${operationalCategories
                          .map(([category]) => category.replaceAll("_", " "))
                          .join(", ")}.`
                      : " No categories are currently approved."}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Recipient Preview
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Count eligible Parent accounts before sending.
                </p>
              </div>

              <button
                type="button"
                onClick={previewRecipients}
                disabled={previewing || sending}
                className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50"
              >
                {previewing ? "Checking..." : "Preview Recipients"}
              </button>
            </div>

            {previewIsCurrent && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                <div className="rounded-lg bg-white p-3">
                  <p className="text-xs text-slate-500">In-app eligible</p>
                  <p className="text-xl font-bold text-[#0B3A67]">
                    {recipientCount.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-emerald-50 p-3">
                  <p className="text-xs text-emerald-700">Optional eligible</p>
                  <p className="text-xl font-bold text-emerald-800">
                    {previewData.email_recipient_count.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-amber-50 p-3">
                  <p className="text-xs text-amber-700">Optional excluded</p>
                  <p className="text-xl font-bold text-amber-800">
                    {previewData.excluded_email_recipient_count.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-violet-50 p-3">
                  <p className="text-xs text-violet-700">Verified eligible</p>
                  <p className="text-xl font-bold text-violet-800">
                    {previewData.verified_email_recipient_count.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="text-xs text-blue-700">Unverified</p>
                  <p className="text-xl font-bold text-blue-800">
                    {previewData.unverified_email_count.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-sky-50 p-3">
                  <p className="text-xs text-sky-700">Operational ready</p>
                  <p className="text-xl font-bold text-sky-800">
                    {(previewData.operational_email_recipient_count || 0).toLocaleString()}
                  </p>
                </div>
                <p className="text-xs text-slate-600 sm:col-span-2 lg:col-span-6">
                  Excluded optional email: {previewData.missing_email_count} missing,{" "}
                  {previewData.invalid_email_count} invalid,{" "}
                  {previewData.unverified_email_count} unverified,{" "}
                  {previewData.opted_out_count} opted out,{" "}
                  {previewData.suppressed_email_count || 0} suppressed,{" "}
                  {previewData.test_filtered_count || 0} test-filtered, and{" "}
                  {previewData.deduplicated_email_count} duplicate address(es).
                  Operational readiness is informational and does not authorize
                  manual operational delivery;{" "}
                  {previewData.operational_unverified_email_count || 0}{" "}
                  address-ready recipient(s) are unverified.
                </p>
              </div>
            )}
            {form.target_type !== "INDIVIDUAL_PARENT" && (
              <p className="mt-3 text-xs text-slate-600">
                Bulk and class announcements must not contain private marks,
                attendance, payment details, or other student-specific data.
              </p>
            )}
          </section>

          <section>
            <label htmlFor="notification-title" className={labelStyle}>
              Notification Title
            </label>

            <input
              id="notification-title"
              className={inputStyle}
              maxLength={200}
              required
              value={form.title}
              onChange={(event) => {
                setForm((previous) => ({
                  ...previous,
                  title: event.target.value,
                }));
                setSendRequestKey("");
              }}
              placeholder="Enter notification title"
            />
          </section>

          <section>
            <label htmlFor="notification-message" className={labelStyle}>
              Notification Message
            </label>

            <textarea
              id="notification-message"
              rows={6}
              maxLength={5000}
              required
              className={inputStyle}
              value={form.message}
              onChange={(event) => {
                setForm((previous) => ({
                  ...previous,
                  message: event.target.value,
                }));
                setSendRequestKey("");
              }}
              placeholder="Write your announcement..."
            />

            <p className="mt-1 text-right text-xs text-slate-500">
              {form.message.length} / 5000
            </p>
          </section>

          <div className="flex justify-end border-t border-slate-100 pt-5">
            <button
              type="submit"
              disabled={
                sending ||
                !previewIsCurrent ||
                recipientCount < 1
              }
              className="rounded-lg bg-blue-700 px-7 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Review & Send Notification
            </button>
          </div>
        </form>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[#0B3A67]">
              Delivery History
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Recent in-app and queued email batches. Email delivery is
              processed independently of parent login sessions.
            </p>
          </div>

          {history.length === 0 ? (
            <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
              No notification batches have been created yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-3">Notification</th>
                    <th className="px-3 py-3">Channels</th>
                    <th className="px-3 py-3">Email status</th>
                    <th className="px-3 py-3">State</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((batch) => (
                    <tr key={batch.id} className="border-b border-slate-100">
                      <td className="px-3 py-3">
                        <p className="font-semibold text-slate-800">
                          {batch.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {batch.category} · {batch.parent_recipient_count}{" "}
                          parent(s)
                        </p>
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {[
                          batch.send_in_app ? "In-app" : null,
                          batch.send_email ? "Email" : null,
                        ]
                          .filter(Boolean)
                          .join(" + ")}
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-600">
                        {batch.send_email
                          ? `${batch.delivery_counts?.SENT || 0} sent, ${
                              batch.delivery_counts?.FAILED || 0
                            } failed, ${
                              (batch.delivery_counts?.QUEUED || 0) +
                              (batch.delivery_counts?.RETRY || 0) +
                              (batch.delivery_counts?.PROCESSING || 0)
                            } pending`
                          : "Not requested"}
                      </td>
                      <td className="px-3 py-3">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {batch.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-notification-title"
            className="w-full max-w-lg space-y-4 rounded-xl bg-white p-6 shadow-xl"
          >
            <h2
              id="confirm-notification-title"
              className="text-xl font-bold text-[#0B3A67]"
            >
              Confirm Notification
            </h2>

            <p className="text-sm text-slate-600">
              You are about to notify{" "}
              <strong>{recipientCount} Parent account(s)</strong>
              {form.send_email && (
                <>
                  {" "}and queue email for{" "}
                  <strong>{previewData?.email_recipient_count || 0}</strong>{" "}
                  verified recipient(s)
                </>
              )}
              .
            </p>

            <dl className="grid gap-3 rounded-lg border border-slate-200 p-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Recipient selection
                </dt>
                <dd className="mt-1 text-slate-800">
                  {recipientSelectionSummary()}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Category
                </dt>
                <dd className="mt-1 text-slate-800">
                  {categoryLabels[form.category]}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Selected channels
                </dt>
                <dd className="mt-1 text-slate-800">
                  {[
                    form.send_in_app ? "In-app" : null,
                    form.send_email ? "Optional Email" : null,
                  ].filter(Boolean).join(" + ")}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email availability
                </dt>
                <dd className="mt-1 text-slate-800">
                  Optional Email:{" "}
                  {optionalEmailAvailable ? "available" : "unavailable"};
                  Operational Email: automatic approved categories only
                </dd>
              </div>
            </dl>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="font-semibold text-[#0B3A67]">
                {form.title}
              </p>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-600">
                {form.message}
              </p>
            </div>

            {isBulk && (
              <div>
                <label className={labelStyle}>
                  Type SEND to confirm bulk delivery
                </label>

                <input
                  className={inputStyle}
                  value={confirmText}
                  onChange={(event) =>
                    setConfirmText(event.target.value)
                  }
                  placeholder="SEND"
                  autoComplete="off"
                />
              </div>
            )}

            <p className="text-xs text-amber-700">
              Confirm the recipient selection, category, delivery channels, and
              message before continuing. Optional email requests are idempotent
              and enter the durable delivery queue.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={sending}
                onClick={() => setConfirmOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  sending ||
                  (isBulk && confirmText !== "SEND")
                }
                onClick={sendNotification}
                className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {sending ? "Sending..." : "Confirm Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
