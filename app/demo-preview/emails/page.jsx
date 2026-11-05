"use client";

// =========================================================
// DEMO PREVIEW HUB — /demo-preview/emails
// ---------------------------------------------------------
// Client-demonstration preview of the future automatic
// notification EMAILS. Strictly dev-only:
// - renders nothing (notFound()) unless the build explicitly
//   sets NEXT_PUBLIC_DEMO_PREVIEW=true;
// - fictional sample content, no personal data;
// - no SMTP, no dispatch, no recipient resolution, no
//   database event records.
// =========================================================

import { useState } from "react";
import { Mail, FileText } from "lucide-react";
import { notFound } from "next/navigation";

import { DEMO_PREVIEW_ENABLED } from "@/lib/demo-preview";
import { DEMO_EMAIL_TEMPLATES } from "@/components/demo/emailTemplates";

export default function DemoEmailsPage() {
  if (!DEMO_PREVIEW_ENABLED) {
    notFound();
  }

  const [templateId, setTemplateId] = useState(DEMO_EMAIL_TEMPLATES[0].id);
  const [showText, setShowText] = useState(false);

  const template = DEMO_EMAIL_TEMPLATES.find((item) => item.id === templateId);

  return (
    <div className="min-h-screen bg-[#F5FAFF] px-4 py-8">
      <div className="mx-auto max-w-[1100px]">
        {/* LABELLED HEADER */}
        <div className="rounded-2xl bg-[#0075FF] px-6 py-4 text-white shadow">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            <Mail size={15} />
            DEMO PREVIEW — Illustrative content, not official school records.
          </p>
          <h1 className="mt-2 text-xl font-bold">Notification Email Previews</h1>
          <p className="mt-1 text-xs text-white/80">
            Fictional sample email designs for the future automatic notification system.
            No SMTP connection exists in this phase — nothing here is ever sent.
          </p>
        </div>

        {/* TEMPLATE SELECTOR */}
        <div className="mt-6 flex flex-wrap gap-2">
          {DEMO_EMAIL_TEMPLATES.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setTemplateId(item.id);
                setShowText(false);
              }}
              className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                item.id === templateId
                  ? "bg-[#0075FF] text-white shadow"
                  : "border border-[#C7DBF2] bg-white text-[#0B3A67] hover:bg-[#EAF4FF]"
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* TEMPLATE META */}
        <div className="mt-4 rounded-xl border border-[#C7DBF2] bg-white px-4 py-3 text-sm shadow-sm">
          <p className="font-bold text-[#0B3A67]">{template.name}</p>
          <p className="mt-1 text-xs text-slate-500">
            <span className="font-semibold text-[#0075FF]">Subject:</span>{" "}
            {template.subject}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            <span className="font-semibold text-[#0075FF]">Intended future recipients:</span>{" "}
            {template.recipientGroup} (fictional; no real recipient involved)
          </p>
        </div>

        {/* HTML / TEXT TOGGLE */}
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => setShowText(false)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ${
              !showText ? "bg-[#0075FF] text-white" : "bg-white text-slate-500 border border-[#E4EDF7]"
            }`}
          >
            <Mail size={13} /> HTML Preview
          </button>
          <button
            onClick={() => setShowText(true)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ${
              showText ? "bg-[#0075FF] text-white" : "bg-white text-slate-500 border border-[#E4EDF7]"
            }`}
          >
            <FileText size={13} /> Plain-Text Version
          </button>
        </div>

        {/* PREVIEW SURFACE */}
        {showText ? (
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-xl border border-[#C7DBF2] bg-white p-5 text-xs leading-6 text-slate-600 shadow-sm">
            {template.text}
          </pre>
        ) : (
          <iframe
            key={template.id}
            title={`Sample email — ${template.name}`}
            sandbox=""
            className="mt-3 h-[720px] w-full rounded-xl border border-[#C7DBF2] bg-white shadow-sm"
            srcDoc={template.html}
          />
        )}
      </div>
    </div>
  );
}
