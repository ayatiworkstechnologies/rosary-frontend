"use client";

import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/design-tokens";
import NotificationDropdown from "@/components/ui/NotificationDropdown";

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
  notificationCount = 0,
  onNotificationClick,
  notificationSlot,
  onLogout,
}) {
  const [profileOpen, setProfileOpen] = useState(false);

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
        "fixed left-0 right-0 top-0 z-40 h-[76px] border-b border-[#E5EDF5] bg-white lg:left-[260px]"
      )}
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

          <div className="hidden min-w-0 sm:block">
            <h2 className="truncate text-lg font-bold text-[#0B3A67]">
              {title || portalLabels[portal] || "Portal"}
            </h2>
            {subtitle && (
              <p className="truncate text-xs text-[#64748B]">{subtitle}</p>
            )}
          </div>

          <span className="min-w-0 truncate text-base font-bold text-[#0B3A67] sm:hidden">
            {portalLabels[portal] || "Portal"}
          </span>
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
              className="flex items-center gap-3 rounded-xl px-1.5 py-1 transition hover:bg-[#F7F9FC]"
              aria-expanded={profileOpen}
              aria-haspopup="true"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0075FF] text-sm font-bold text-white">
                {initials}
              </div>
              <div className="hidden text-left lg:block">
                <p className="text-sm font-semibold leading-5 text-[#0B3A67]">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-[#64748B]">
                  {user?.role || "User"}
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