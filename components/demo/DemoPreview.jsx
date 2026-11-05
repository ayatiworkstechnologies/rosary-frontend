"use client";

// =========================================================
// ROSARY SCHOOL PORTAL — DEMO PREVIEW PRIMITIVES
// ---------------------------------------------------------
// Shared building blocks for clearly-labelled demo preview
// content. Every demo panel is READ-ONLY by design: none of
// these components accept onClick handlers that call the
// backend, and they render only when NEXT_PUBLIC_DEMO_PREVIEW
// is explicitly "true" at build time.
//
// Never route real API responses through these components and
// never pass demo data into services/* functions.
// =========================================================

import {
  CheckCircle2,
  Clock3,
  Info,
  Palette,
} from "lucide-react";

import {
  DEMO_PREVIEW_ENABLED,
  DEMO_PREVIEW_NOTICE,
} from "@/lib/demo-preview";

// ---------------------------------------------------------
// Money / date formatting (demo-only usage)
// ---------------------------------------------------------

export function demoMoney(value) {
  return new Intl.NumberFormat(
    "en-IN",

    {
      style: "currency",

      currency: "INR",

      maximumFractionDigits: 0,
    }
  ).format(
    Number(value || 0)
  );
}

function demoDate(
  value
) {
  if (!value) {
    return "--";
  }

  const date = new Date(
    `${value}T00:00:00`
  );

  return date.toLocaleDateString(
    "en-IN",

    {
      day: "2-digit",

      month: "short",

      year: "numeric",
    }
  );
}

// ---------------------------------------------------------
// DemoSection — the mandatory labelled wrapper
// ---------------------------------------------------------

export function DemoSection({
  title,
  description,
  margin = "mt-6",
  children,
}) {
  if (!DEMO_PREVIEW_ENABLED) {
    return null;
  }

  return (
    <section
      className={`
        ${margin}
        rounded-2xl
        border-2
        border-dashed
        border-[#9EC5FF]
        bg-[#F5FAFF]
        p-4
      `}
    >
      <div
        className="
          flex
          flex-wrap
          items-center
          justify-between
          gap-2
          rounded-xl
          bg-[#0075FF]
          px-4
          py-2.5
        "
      >
        <span
          className="
            flex
            items-center
            gap-2
            text-[11px]
            font-bold
            uppercase
            tracking-wider
            text-white
          "
        >
          <Palette
            size={14}
          />

          {DEMO_PREVIEW_NOTICE}
        </span>
      </div>

      {description && (
        <p
          className="
            mt-3
            px-1
            text-xs
            text-slate-500
          "
        >
          {description}
        </p>
      )}

      {children}

      <p
        className="
          mt-3
          flex
          items-center
          gap-1.5
          px-1
          text-[10px]
          text-slate-400
        "
      >
        <Info
          size={11}
        />

        Read-only demo
        content — never
        sent to the backend
        or saved anywhere.
      </p>
    </section>
  );
}

// ---------------------------------------------------------
// DemoStat — summary card used by fee/dashboard previews
// ---------------------------------------------------------

export function DemoStat({
  label,
  value,
  tone = "blue",
}) {
  const tones = {
    blue: "text-[#0075FF]",
    green: "text-green-600",
    orange: "text-orange-600",
    red: "text-red-500",
  };

  const icon = {
    blue: Palette,
    green: CheckCircle2,
    orange: Clock3,
    red: Clock3,
  }[tone];

  const Icon =
    icon;

  return (
    <div
      className="
        rounded-xl
        border
        border-[#E4EDF7]
        bg-white
        p-4
        text-center
        shadow-sm
      "
    >
      <Icon
        size={16}
        className={`
          mx-auto
          ${tones[tone]}
        `}
      />

      <p
        className="
          mt-2
          text-[11px]
          text-slate-500
        "
      >
        {label}
      </p>

      <p
        className={`
          mt-1
          text-lg
          font-bold
          ${tones[tone]}
        `}
      >
        {value}
      </p>
    </div>
  );
}

// ---------------------------------------------------------
// DemoBadge — status pill
// ---------------------------------------------------------

export function DemoBadge({
  status,
}) {
  const styles = {
    Paid: "bg-green-50 text-green-600",
    Present: "bg-green-50 text-green-600",
    Absent: "bg-red-50 text-red-500",
    Late: "bg-orange-50 text-orange-600",
    Partial: "bg-blue-50 text-blue-600",
    Pending: "bg-orange-50 text-orange-600",
    Overdue: "bg-red-50 text-red-500",
    Published: "bg-green-50 text-green-600",
    Upcoming: "bg-blue-50 text-blue-600",
    Meeting: "bg-blue-50 text-blue-600",
    Holiday: "bg-red-50 text-red-500",
    Event: "bg-blue-50 text-blue-600",
    Exam: "bg-orange-50 text-orange-600",
  };

  return (
    <span
      className={`
        rounded-full
        px-3
        py-1
        text-[10px]
        font-bold
        ${styles[status] || "bg-slate-100 text-slate-500"}
      `}
    >
      {status}
    </span>
  );
}

// ---------------------------------------------------------
// DemoTable — responsive minimal table
// ---------------------------------------------------------

export function DemoTable({
  columns,
  rows,
}) {
  return (
    <div
      className="
        overflow-x-auto
        rounded-xl
        border
        border-[#E4EDF7]
        bg-white
        shadow-sm
      "
    >
      <table
        className="
          w-full
          min-w-[640px]
          text-left
          text-sm
        "
      >
        <thead>
          <tr
            className="
              bg-[#F7F9FC]
              text-[11px]
              font-semibold
              uppercase
              tracking-wide
              text-[#64748B]
            "
          >
            {columns.map(
              (column) => (
                <th
                  key={
                    column
                  }
                  className="
                    px-4
                    py-3
                  "
                >
                  {column}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map(
            (row, index) => (
              <tr
                key={index}
                className="
                  border-t
                  border-[#EDF3FA]
                "
              >
                {row.map(
                  (cell, cellIndex) => (
                    <td
                      key={
                        cellIndex
                      }
                      className={`
                        px-4
                        py-3
                        text-xs
                        ${
                          cellIndex === 0
                            ? "font-semibold text-[#0B3A67]"
                            : "text-slate-600"
                        }
                      `}
                    >
                      {cell}
                    </td>
                  )
                )}
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------
// DemoCard — small content card (homework, circular, event)
// ---------------------------------------------------------

export function DemoCard({
  title,
  meta,
  description,
  badge,
}) {
  return (
    <article
      className="
        rounded-xl
        border
        border-[#E4EDF7]
        bg-white
        p-4
        shadow-sm
      "
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-3
        "
      >
        <h3
          className="
            text-sm
            font-bold
            text-[#0B3A67]
          "
        >
          {title}
        </h3>
        {badge && (
          <DemoBadge
            status={badge}
          />
        )}
      </div>
      {description && (
        <p
          className="
            mt-2
            line-clamp-2
            text-xs
            text-slate-500
          "
        >
          {description}
        </p>
      )}
      <p
        className="
          mt-2
          text-[11px]
          text-slate-400
        "
      >
        {meta}
      </p>
    </article>
  );
}

export {
  demoDate,
};
