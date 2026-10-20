"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  School,
  GraduationCap,
  Users,
  UserRound,
  Megaphone,
  CalendarDays,
  WalletCards,
  ClipboardList,
  BarChart3,
  UserCog,
  X,
  FolderDown,
  LogOut,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Classes",
    href: "/admin/classes",
    icon: School,
  },
  {
    name: "Students",
    href: "/admin/students",
    icon: GraduationCap,
  },
  {
    name: "Teachers",
    href: "/admin/teachers",
    icon: Users,
  },
  {
    name: "Parent Linking",
    href: "/admin/parent-linking",
    icon: UserRound,
  },
  {
    name: "Circulars",
    href: "/admin/circulars",
    icon: Megaphone,
  },
  {
    name: "School Calendar",
    href: "/admin/calendar",
    icon: CalendarDays,
  },
  {
    name: "Fees",
    href: "/admin/fees",
    icon: WalletCards,
  },
  {
    name: "Download Forms",
    href: "/admin/downloads",
    icon: FolderDown,
  },
  {
    name: "Exams",
    href: "/admin/exams",
    icon: ClipboardList,
  },
  {
    name: "Exam Schedule",
    href: "/admin/exam-schedules",
    icon: CalendarDays,
  },
  {
    name: "Results",
    href: "/admin/results",
    icon: BarChart3,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: UserCog,
  },
];

export default function AdminSidebar({
  open,
  onClose,
  onLogout,
}) {
  const pathname = usePathname();

  return (
    <>
      {/* MOBILE OVERLAY */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-[260px] flex-col
          bg-[#0B6C9F]
          text-white
          transition-transform duration-300
          ease-in-out
          lg:translate-x-0
          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* BRAND */}
        <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-white/10 px-5">
          <div>
            <h1 className="text-[22px] font-bold leading-none text-white">
              Rosary
            </h1>

            <p className="mt-2 text-[12px] font-medium text-white/65">
              Admin Portal
            </p>
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

        {/* MENU */}
        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              const active =
                pathname === item.href ||
                pathname.startsWith(
                  `${item.href}/`
                );

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex h-[46px]
                    items-center gap-3
                    rounded-xl
                    px-4
                    text-[15px]
                    font-medium
                    transition-all duration-200

                    ${
                      active
                        ? "bg-[#1184F5] text-white shadow-sm"
                        : "text-white/90 hover:bg-white/10 hover:text-white"
                    }
                  `}
                >
                  <Icon
                    size={20}
                    strokeWidth={2}
                    className="shrink-0"
                  />

                  <span className="truncate">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* LOGOUT */}
        <div className="shrink-0 border-t border-white/10 bg-[#0B6C9F] p-3">
          <button
            type="button"
            onClick={onLogout}
            className="
              flex h-[46px]
              w-full
              items-center gap-3
              rounded-xl
              px-4
              text-[15px]
              font-medium
              text-white
              transition
              hover:bg-white/10
            "
          >
            <LogOut
              size={19}
              strokeWidth={2}
              className="shrink-0"
            />

            <span>
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}