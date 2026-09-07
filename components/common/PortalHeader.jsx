"use client";

import {
  Bell,
  ChevronDown,
  Menu,
} from "lucide-react";

import useStoredUser from "@/hooks/useStoredUser";

export default function PortalHeader({
  portalName,
  onMenuClick,
}) {
  const user = useStoredUser();

  const initials =
    user?.name
      ?.split(" ")
      .map((item) => item[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  return (
    <header
      className="
        sticky top-0 z-30
        flex h-[66px] items-center justify-between
        border-b border-[#E4EDF7]
        bg-white px-4
        md:px-6
        lg:justify-end lg:px-8
      "
    >
      {/* MOBILE LEFT */}
      <div className="flex items-center gap-3 lg:hidden">

        <button
          onClick={onMenuClick}
          className="text-[#0075FF]"
        >
          <Menu size={24} />
        </button>

        <h1 className="font-semibold text-[#0B3A67]">
          {portalName}
        </h1>

      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">

        <button className="relative text-[#0B3A67]">
          <Bell size={21} />

          <span
            className="
              absolute -right-1 -top-1
              flex h-4 w-4
              items-center justify-center
              rounded-full
              bg-red-500
              text-[9px] text-white
            "
          >
            1
          </span>
        </button>

        <div className="flex items-center gap-2">

          <div
            className="
              flex h-9 w-9
              items-center justify-center
              rounded-full
              bg-[#0075FF]
              text-xs font-bold
              text-white
            "
          >
            {initials}
          </div>

          <span className="hidden text-sm font-semibold text-[#0B3A67] sm:block">
            {user?.name || "User"}
          </span>

          <ChevronDown size={14} className="hidden text-[#0B3A67] sm:block" />

        </div>

      </div>
    </header>
  );
}
