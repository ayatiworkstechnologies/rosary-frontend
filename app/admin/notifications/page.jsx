
"use client";

import { useEffect, useState } from "react";
import api from "../../../services/api";

const emptyForm = {
  target_type: "ALL_PARENTS",
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
        const [statusResponse, historyResponse] = await Promise.all([
          api.get("/admin/notifications/email-status"),
          api.get("/admin/notifications/email-batches", {
            params: { page: 1, page_size: 10 },
          }),
        ]);
        setEmailStatus(statusResponse.data);
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
      (!emailStatus?.enabled || !emailStatus?.provider_ready)
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

      const historyResponse = await api.get(
        "/admin/notifications/email-batches",
        { params: { page: 1, page_size: 10 } }
      );
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

        <form
          onSubmit={requestSend}
          className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-7"
        >
          <section>
            <label className={labelStyle}>
              Select Recipients
            </label>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {[
                ["ALL_PARENTS", "All Parents"],
                ["CLASSES", "Selected Classes"],
                ["STUDENTS", "Selected Students"],
                ["INDIVIDUAL_PARENT", "Individual Parent"],
              ].map(([value, label]) => (
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

          <section className="grid gap-5 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
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
              <div className="space-y-2">
                <label className="flex items-center gap-3 text-sm text-slate-700">
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
                  In-app Parent Portal notification
                </label>
                <label className="flex items-center gap-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.send_email}
                    disabled={
                      !emailStatus?.enabled ||
                      !emailStatus?.provider_ready
                    }
                    onChange={(event) => {
                      setForm((previous) => ({
                        ...previous,
                        send_email: event.target.checked,
                      }));
                      setSendRequestKey("");
                    }}
                    className="h-4 w-4 accent-blue-600"
                  />
                  Email verified, enabled parents
                </label>
                {emailStatus &&
                  (!emailStatus.enabled || !emailStatus.provider_ready) && (
                    <p className="text-xs text-amber-700">
                      Email remains disabled until the approved provider and
                      production environment are configured.
                    </p>
                  )}
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
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-white p-3">
                  <p className="text-xs text-slate-500">Linked parents</p>
                  <p className="text-xl font-bold text-[#0B3A67]">
                    {recipientCount.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-emerald-50 p-3">
                  <p className="text-xs text-emerald-700">Email eligible</p>
                  <p className="text-xl font-bold text-emerald-800">
                    {previewData.email_recipient_count.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-amber-50 p-3">
                  <p className="text-xs text-amber-700">Missing / invalid</p>
                  <p className="text-xl font-bold text-amber-800">
                    {(
                      previewData.missing_email_count +
                      previewData.invalid_email_count
                    ).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-violet-50 p-3">
                  <p className="text-xs text-violet-700">
                    Unverified / opted out
                  </p>
                  <p className="text-xl font-bold text-violet-800">
                    {(
                      previewData.unverified_email_count +
                      previewData.opted_out_count
                    ).toLocaleString()}
                  </p>
                </div>
                {previewData.deduplicated_email_count > 0 && (
                  <p className="text-xs text-slate-600 sm:col-span-2 lg:col-span-4">
                    {previewData.deduplicated_email_count} duplicate email
                    address(es) were removed, including sibling-linked
                    accounts.
                  </p>
                )}
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
              Email requests are idempotent and enter the durable delivery
              queue. Confirm the recipient preview and school authorization
              before continuing.
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
