"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BadgeCheck, CircleAlert, Loader2, MailCheck } from "lucide-react";

import { confirmParentEmailVerification } from "@/services/parentEmailService";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerificationCard status="processing" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() || "";
  const started = useRef(false);
  const [status, setStatus] = useState(token ? "processing" : "error");
  const [message, setMessage] = useState(
    token ? "Confirming your email address..." : "The verification link is incomplete."
  );

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    let active = true;

    confirmParentEmailVerification(token)
      .then(() => {
        if (!active) return;
        setStatus("success");
        setMessage(
          "Your email address is verified. Optional notifications remain off until you enable them in your profile."
        );
      })
      .catch((error) => {
        if (!active) return;
        setStatus("error");
        setMessage(verificationErrorMessage(error));
      });

    return () => {
      active = false;
    };
  }, [token]);

  return <VerificationCard status={status} message={message} />;
}

function VerificationCard({ status, message = "Confirming your email address..." }) {
  const processing = status === "processing";
  const success = status === "success";
  const Icon = processing ? Loader2 : success ? BadgeCheck : CircleAlert;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F3F7FE] px-4 py-10">
      <section className="w-full max-w-lg rounded-3xl border border-[#D9E7F7] bg-white p-6 text-center shadow-xl sm:p-9" aria-live="polite">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF4FF] text-[#0075FF]">
          {processing ? <Icon size={32} className="animate-spin" /> : <Icon size={34} />}
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#0075FF]">Rosary School</p>
        <h1 className="mt-2 text-2xl font-bold text-[#0B3A67]">
          {processing ? "Verifying email" : success ? "Email verified" : "Verification unsuccessful"}
        </h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">{message}</p>
        {!processing && (
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/login" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#CFE0F5] px-5 text-sm font-semibold text-[#0B3A67] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0075FF]">Parent login</Link>
            <Link href="/parent/profile" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0075FF] px-5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0075FF]"><MailCheck size={17} />Open profile</Link>
          </div>
        )}
      </section>
    </main>
  );
}

function verificationErrorMessage(error) {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string" && /invalid|expired/i.test(detail)) {
    return "This verification link is invalid, expired, or has already been used. Request a new link from your parent profile."
  }
  return "We could not verify this email address. Please request a new link from your parent profile."
}
