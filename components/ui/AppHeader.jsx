"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/design-tokens";
import NotificationDropdown from "@/components/ui/NotificationDropdown";
import { getPortalTheme } from "@/lib/portal-theme";

const portalLabels = {
  admin: "Admin Portal",
  teacher: "Teacher Portal",
  parent: "Parent Portal",
};

export default function AppHeader({
  portal = "admin",
  title,
  subtitle,
  onMenuClick,
  user,
  onLogout,
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const theme = getPortalTheme(portal);

  const initials = user?.name
    ?.split(" ")
    .filter(Boolean)
    .map((item) => item[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-40 h-[76px] border-b bg-white/92 shadow-[0_8px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl lg:left-[272px]"
      )}
      style={{ borderColor: theme.border }}
    >
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-5 md:px-6 lg:px-7 xl:px-8">
        {/* Left */}
        <div className="flex min-w-0 items-center gap-4">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E5EDF5] text-[#64748B] transition hover:bg-[#F7F9FC] lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={21} />
          </button>

          <div className="relative h-10 w-[108px] shrink-0 sm:hidden">
            <Image
              src="/logo/rosary-logo.png"
              alt="Rosary School"
              fill
              sizes="108px"
              className="object-contain"
              priority
            />
          </div>

          <div className="hidden min-w-0 sm:block">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full shadow-[0_0_0_5px_var(--portal-accent-soft)]"
                style={{ backgroundColor: theme.accent }}
              />
              <h2 className="truncate text-lg font-extrabold tracking-[-0.01em] text-[#10233F]">
                {title || portalLabels[portal] || "Portal"}
              </h2>
            </div>
            {subtitle && (
              <p className="mt-0.5 truncate pl-[18px] text-xs font-medium text-[#64748B]">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Notifications */}
          <div className="relative">
            {/*
             * Role-scoped in-app notification inboxes:
             *  - parent: GET/PATCH /notifications (parent-only)
             *  - staff : GET/PATCH /api/v1/staff/notifications
             *            (teacher + admin only, user-scoped rows)
             * Each portal renders a self-contained bell + dropdown
             * that fetches real notifications, shows the unread badge
             * and supports mark-as-read. No role ever calls another
             * role's endpoints.
             */}
            <NotificationDropdown source={portal} />
          </div>

          {/* User profile */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((previous) => !previous)}
              className="flex items-center gap-3 rounded-2xl border px-1.5 py-1 transition hover:bg-white"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.accentSoft,
              }}
              aria-expanded={profileOpen}
              aria-haspopup="true"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold text-white shadow-sm"
                style={{ backgroundColor: theme.accent }}
              >
                {initials}
              </div>
              <div className="hidden text-left lg:block">
                <p className="text-sm font-bold leading-5 text-[#10233F]">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-[#64748B]">
                  {theme.shortLabel}
                </p>
              </div>
              <ChevronDown
                size={16}
                className="hidden text-[#64748B] lg:block"
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[200px] overflow-hidden rounded-xl border border-[#E5EDF5] bg-white shadow-lg">
                <div className="border-b border-[#E5EDF5] px-4 py-3">
                  <p className="truncate text-sm font-semibold text-[#0B3A67]">
                    {user?.name || "User"}
                  </p>
                  <p className="truncate text-xs text-[#64748B]">
                    {user?.email || ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-[#DC2626] transition hover:bg-[#FEE2E2]"
                >
                  <X size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
