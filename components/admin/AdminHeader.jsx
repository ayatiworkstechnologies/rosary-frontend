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
    <header
      className="
        fixed
        left-0
        right-0
        top-0
        z-40
        h-[76px]
        border-b
        border-gray-200
        bg-white
        lg:left-[280px]
      "
    >
      <div
        className="
          flex
          h-full
          items-center
          justify-between
          gap-4
          px-4
          sm:px-5
          md:px-6
          lg:px-7
          xl:px-8
        "
      >
        {/* Left */}
        <div className="flex min-w-0 items-center gap-4">
          <button
            type="button"
            onClick={
              onMenuClick
            }
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-gray-200
              text-gray-600
              transition
              hover:bg-gray-50
              lg:hidden
            "
            aria-label="Open menu"
          >
            <Menu
              size={21}
            />
          </button>

          <div className="hidden min-w-0 sm:block">
            <h2 className="truncate text-lg font-bold text-gray-900">
              Admin Dashboard
            </h2>

            <p className="truncate text-xs text-gray-500">
              Rosary Matriculation
              Hr. Sec. School
            </p>
          </div>
        </div>

        {/* Search */}
        <div
          className="
            hidden
            min-w-0
            max-w-[560px]
            flex-1
            md:block
          "
        >
          <div className="relative">
            <Search
              size={18}
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-gray-400
              "
            />

            <input
              type="text"
              placeholder="Search administration..."
              className="
                h-11
                w-full
                rounded-xl
                border
                border-gray-200
                bg-gray-50
                pl-11
                pr-4
                text-sm
                text-gray-700
                outline-none
                transition
                placeholder:text-gray-400
                focus:border-[#0075FF]
                focus:bg-white
              "
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="
              relative
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-gray-200
              text-gray-600
              transition
              hover:bg-gray-50
            "
            aria-label="Notifications"
          >
            <Bell
              size={19}
            />

            <span
              className="
                absolute
                right-[8px]
                top-[8px]
                h-2
                w-2
                rounded-full
                bg-red-500
                ring-2
                ring-white
              "
            />
          </button>

          <button
            type="button"
            className="
              flex
              items-center
              gap-3
              rounded-xl
              px-1.5
              py-1
              transition
              hover:bg-gray-50
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-[#0075FF]
                text-sm
                font-bold
                text-white
              "
            >
              A
            </div>

            <div className="hidden text-left lg:block">
              <p className="text-sm font-semibold leading-5 text-gray-900">
                Admin
              </p>

              <p className="text-xs text-gray-500">
                Administrator
              </p>
            </div>

            <ChevronDown
              size={16}
              className="hidden text-gray-400 lg:block"
            />
          </button>
        </div>
      </div>
    </header>
  );
}