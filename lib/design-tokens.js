// =========================================================
// ROSARY SCHOOL PORTAL — DESIGN TOKENS
// Single source of truth for colors, spacing, radius,
// typography, and shadows. Import this instead of hardcoding
// hex values inside components.
// =========================================================

export const colors = {
  // Brand
  primary: "#0075FF",
  primaryHover: "#005FD1",
  primaryActive: "#0047A8",
  primarySoft: "#EAF4FF",

  // Semantic
  success: "#16A34A",
  successSoft: "#DCF7DF",
  warning: "#F59E0B",
  warningSoft: "#FEF3C7",
  error: "#DC2626",
  errorSoft: "#FEE2E2",
  info: "#0075FF",

  // Surfaces
  surface: "#FFFFFF",
  surfaceHover: "#F7F9FC",
  surfaceMuted: "#F1F5F9",

  // Text
  textPrimary: "#0B3A67",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  textInverse: "#FFFFFF",

  // Borders
  border: "#E5EDF5",
  borderStrong: "#D1DCE8",
  borderFocus: "#0075FF",

  // Sidebar / header chrome
  sidebarBg: "#0B6C9F",
  sidebarBgTeacher: "#065A97",
  sidebarText: "#FFFFFF",
  sidebarTextMuted: "rgba(255,255,255,0.65)",
  sidebarActiveBg: "#1184F5",
};

export const radius = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "20px",
  full: "9999px",
};

export const shadow = {
  sm: "0 1px 2px rgba(15, 23, 42, 0.05)",
  md: "0 4px 6px rgba(15, 23, 42, 0.06)",
  lg: "0 10px 25px rgba(15, 23, 42, 0.08)",
  xl: "0 20px 40px rgba(15, 23, 42, 0.10)",
};

export const typography = {
  fontFamily:
    'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  monoFamily:
    '"SF Mono", "Fira Code", "Cascadia Code", Menlo, Consolas, monospace',
};

// Tailwind class helpers — keep these small and consistent so
// components can compose without re-typing hex strings.
export const cn = (...parts) => parts.filter(Boolean).join(" ");

export const focusRing =
  "focus:outline-none focus:ring-2 focus:ring-[#0075FF]/20 focus:border-[#0075FF]";

export const inputBase =
  "w-full rounded-xl border border-[#E5EDF5] bg-white px-4 py-2.5 text-sm text-[#0B3A67] transition placeholder:text-[#94A3B8] " +
  focusRing;

export const selectBase =
  "w-full appearance-none rounded-xl border border-[#E5EDF5] bg-white px-4 py-2.5 pr-10 text-sm font-medium text-[#0B3A67] transition disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 " +
  focusRing;

export const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#0075FF] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#005FD1] focus:outline-none focus:ring-2 focus:ring-[#0075FF]/30 disabled:cursor-not-allowed disabled:opacity-50";

export const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[#E5EDF5] bg-white px-5 py-2.5 text-sm font-semibold text-[#0B3A67] transition hover:bg-[#F7F9FC] focus:outline-none focus:ring-2 focus:ring-[#0075FF]/20 disabled:cursor-not-allowed disabled:opacity-50";

export const buttonDanger =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#DC2626] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#B91C1C] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/30 disabled:cursor-not-allowed disabled:opacity-50";

export const cardBase =
  "rounded-2xl border border-[#E5EDF5] bg-white shadow-sm";

export const tableHead =
  "px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#64748B] bg-[#F7F9FC]";

export const tableCell = "px-5 py-4 text-sm text-[#0B3A67]";

export const tableRowHover = "transition hover:bg-[#F7F9FC]";

export const breadcrumbActive = "text-[#64748B]";