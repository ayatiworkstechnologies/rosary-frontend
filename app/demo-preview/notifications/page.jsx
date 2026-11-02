"use client";

// =========================================================
// DEMO PREVIEW HUB — /demo-preview/notifications
// ---------------------------------------------------------
// Client-demonstration preview of the in-app notification
// types and future email notification coverage. Strictly
// dev-only:
// - notFound() unless NEXT_PUBLIC_DEMO_PREVIEW=true;
// - read-only fictional samples; no API calls of any kind;
// - the real NotificationDropdown keeps polling the live
//   API exactly as before — this page never feeds it.
// =========================================================

import Link from "next/link";
import { BellRing, Mail } from "lucide-react";
import { notFound } from "next/navigation";

import { DEMO_PREVIEW_ENABLED } from "@/lib/demo-preview";
import { DemoNotifications } from "@/components/demo/DemoSections";

export default function DemoNotificationsPage() {
  if (!DEMO_PREVIEW_ENABLED) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F5FAFF] px-4 py-8">
      <div className="mx-auto max-w-[1100px]">
        {/* LABELLED HEADER */}
        <div className="rounded-2xl bg-[#0075FF] px-6 py-4 text-white shadow">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            <BellRing size={15} />
            DEMO PREVIEW — Illustrative content, not official school records.
          </p>
          <h1 className="mt-2 text-xl font-bold">Notification Previews</h1>
          <p className="mt-1 text-xs text-white/80">
            Fictional in-app notification samples for every planned event type. The live notification
            bell is untouched and keeps reading the real API.
          </p>
        </div>

        <DemoNotifications />

        <div className="mt-6 rounded-2xl border-2 border-dashed border-[#9EC5FF] bg-white p-5 text-sm shadow-sm">
          <p className="font-bold text-[#0B3A67]">Related email previews</p>
          <p className="mt-1 text-xs text-slate-500">
            The planned HTML + plain-text email templates for these events are also available as
            clearly labelled, fictional read-only samples:
          </p>
          <Link
            href="/demo-preview/emails"
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#0075FF] px-4 py-2 text-xs font-bold text-white shadow transition hover:bg-[#005FD1]"
          >
            <Mail size={14} />
            Open Email Template Previews
          </Link>
        </div>
      </div>
    </div>
  );
}
