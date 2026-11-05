
"use client";

import { useEffect, useState } from "react";
import api from "../../../services/api";

const emptyForm = {
  target_type: "ALL_PARENTS",
  class_ids: [],
  parent_user_id: null,
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

  const [loadingClasses, setLoadingClasses] = useState(false);
  const [searching, setSearching] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [sending, setSending] = useState(false);

  const [recipientCount, setRecipientCount] = useState(null);
  const [previewSignature, setPreviewSignature] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const isBulk = form.target_type !== "INDIVIDUAL_PARENT";

  const targetPayload = {
    target_type: form.target_type,
    class_ids:
      form.target_type === "CLASSES" ? form.class_ids : [],
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
    setPreviewSignature("");
    setConfirmOpen(false);
    setConfirmText("");
    setNotice("");
    setError("");
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
  }, []);

  function changeTarget(targetType) {
    setForm((previous) => ({
      ...previous,
      target_type: targetType,
      class_ids: [],
      parent_user_id: null,
    }));

    setSelectedParent(null);
    setParents([]);
    setParentSearch("");
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
  }

  async function previewRecipients() {
    setPreviewing(true);
    setError("");
    setNotice("");
    setRecipientCount(null);
    setPreviewSignature("");

    try {
      validateTarget();

      const response = await api.post(
        "/admin/notifications/preview",
        targetPayload
      );

      setRecipientCount(response.data.recipient_count);
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

      const response = await api.post(
        "/admin/notifications/send",
        {
          ...targetPayload,
          title: form.title.trim(),
          message: form.message.trim(),
        }
      );

      setConfirmOpen(false);
      setConfirmText("");

      setNotice(
        `Notification created for ${response.data.notifications_created} parent account(s).`
      );

      // Clear the form to discourage accidental resubmission.
      setForm(emptyForm);
      setSelectedParent(null);
      setParentSearch("");
      setParents([]);
      setRecipientCount(null);
      setPreviewSignature("");
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

            <div className="grid gap-3 md:grid-cols-3">
              {[
                ["ALL_PARENTS", "All Parents"],
                ["CLASSES", "Selected Classes"],
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
              <p className="mt-4 text-lg font-bold text-[#0B3A67]">
                {recipientCount.toLocaleString()} eligible parent(s)
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
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  title: event.target.value,
                }))
              }
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
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  message: event.target.value,
                }))
              }
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
              You are about to create a notification for{" "}
              <strong>{recipientCount} Parent account(s)</strong>.
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
              This action creates notification records for
              the selected recipients. Repeating the request
              may create duplicate announcements.
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
