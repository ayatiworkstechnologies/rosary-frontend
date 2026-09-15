"use client";

import {
  Bell,
  Menu,
  Search,
  ChevronDown,
} from "lucide-react";

export default function AdminHeader({
  onMenuClick,
}) {
  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 lg:hidden"
        >
          <Menu size={21} />
        </button>

        <div className="hidden sm:block">
          <h2 className="text-lg font-semibold text-gray-900">
            Admin Dashboard
          </h2>

          <p className="text-xs text-gray-500">
            Rosary Matriculation Hr. Sec. School
          </p>
        </div>
      </div>

      <div className="mx-6 hidden max-w-md flex-1 md:block">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search administration..."
            className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm outline-none transition focus:border-[#0075FF] focus:bg-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">
          <Bell size={19} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <button className="flex items-center gap-3 rounded-xl p-1.5 hover:bg-gray-50">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0075FF] text-sm font-semibold text-white">
            A
          </div>

          <div className="hidden text-left md:block">
            <p className="text-sm font-semibold text-gray-800">
              Admin
            </p>

            <p className="text-xs text-gray-500">
              Administrator
            </p>
          </div>

          <ChevronDown
            size={16}
            className="hidden text-gray-500 md:block"
          />
        </button>
      </div>
    </header>
  );
}