"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, LogOut } from "lucide-react";
import { cn } from "@/lib/design-tokens";

// One consistent premium tone across every portal: deep navy surface
// with the primary blue (#0075FF) as the active-item highlight.
const portalTone = {
  admin: {
    bg: "bg-[#0B3A67]",
    activeBg: "bg-[#0075FF]",
    textMuted: "text-white/60",
    label: "Admin Portal",
  },
  teacher: {
    bg: "bg-[#0B3A67]",
    activeBg: "bg-[#0075FF]",
    textMuted: "text-white/60",
    label: "Teacher Portal",
  },
  parent: {
    bg: "bg-[#0B3A67]",
    activeBg: "bg-[#0075FF]",
    textMuted: "text-white/60",
    label: "Parent Portal",
  },
};

export default function AppSidebar({
  portal = "admin",
  navItems = [],
  open = false,
  onClose,
  onLogout,
  width = 260,
}) {
  const pathname = usePathname();
  const tone = portalTone[portal] || portalTone.admin;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        style={{ width }}
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col text-white transition-transform duration-300 ease-in-out",
          tone.bg,
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        {/* Brand */}
        <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11">
              <Image
                src="/logo/rosary-logo.png"
                alt="Rosary School"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-[20px] font-bold leading-none text-white">
                Rosary
              </h1>
              <p
                className={cn(
                  "mt-1 truncate text-[11px] font-medium",
                  tone.textMuted
                )}
              >
                {tone.label}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white transition hover:bg-white/10 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex h-[46px] items-center gap-3 rounded-xl px-4 text-[15px] font-medium transition-all duration-200",
                    active
                      ? cn("shadow-sm", tone.activeBg, "text-white")
                      : cn("hover:bg-white/10", tone.textMuted, "hover:text-white")
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {Icon && <Icon size={20} strokeWidth={2} className="shrink-0" />}
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#DC2626] px-1 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer / Logout */}
        <div className="shrink-0 border-t border-white/10 p-3">
          <button
            type="button"
            onClick={onLogout}
            className="flex h-[46px] w-full items-center gap-3 rounded-xl px-4 text-[15px] font-medium text-white transition hover:bg-white/10"
          >
            <LogOut size={19} strokeWidth={2} className="shrink-0" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}