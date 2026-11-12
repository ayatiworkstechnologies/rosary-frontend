"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BellOff, CircleAlert, Loader2, ShieldCheck } from "lucide-react";

import { unsubscribeParentEmail } from "@/services/parentEmailService";

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<UnsubscribeCard token="" loading />}>
      <UnsubscribeContent />
    </Suspense>
  );
}

function UnsubscribeContent() {
  const token = useSearchParams().get("token")?.trim() || "";
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(token ? "ready" : "error");
  const [message, setMessage] = useState(
    token ? "" : "This unsubscribe link is incomplete or invalid."
  );

  async function confirmUnsubscribe() {
    if (!token || submitting || status === "success") return;
    setSubmitting(true);
    setMessage("");
    try {
      const response = await unsubscribeParentEmail(token);
      setStatus("success");
      setMessage(response?.message || "Email notifications have been disabled.");
    } catch (error) {
      setStatus("error");
      const detail = error?.response?.data?.detail;
      setMessage(
        typeof detail === "string" && /invalid|expired/i.test(detail)
          ? "This unsubscribe link is invalid or expired."
          : "We could not update the preference. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <UnsubscribeCard
      token={token}
      submitting={submitting}
      status={status}
      message={message}
      onConfirm={confirmUnsubscribe}
    />
  );
}

function UnsubscribeCard({ token, loading = false, submitting = false, status = "ready", message = "", onConfirm }) {
  const success = status === "success";
  const error = status === "error";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F3F7FE] px-4 py-10">
      <section className="w-full max-w-lg rounded-3xl border border-[#D9E7F7] bg-white p-6 text-center shadow-xl sm:p-9">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF4FF] text-[#0075FF]">
          {loading || submitting ? <Loader2 size={32} className="animate-spin" /> : success ? <ShieldCheck size={34} /> : error ? <CircleAlert size={34} /> : <BellOff size={34} />}
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#0075FF]">Rosary School</p>
        <h1 className="mt-2 text-2xl font-bold text-[#0B3A67]">
          {success ? "Preference updated" : error ? "Unable to unsubscribe" : "Stop optional emails?"}
        </h1>
        <p className="mt-4 text-sm leading-6 text-slate-600" aria-live="polite">
          {message || "Confirm to disable optional parent email notifications. Your portal access and in-app notifications will not be affected."}
        </p>
        {!loading && status === "ready" && (
          <button type="button" onClick={onConfirm} disabled={!token || submitting} className="mt-7 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0B3A67] px-5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0075FF] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {submitting ? "Updating..." : "Confirm unsubscribe"}
          </button>
        )}
        <div className="mt-6"><Link href="/login" className="text-sm font-semibold text-[#0075FF] hover:underline">Return to parent login</Link></div>
      </section>
    </main>
  );
}
