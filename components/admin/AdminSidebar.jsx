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
  FileDown,
  ClipboardList,
  BarChart3,
  UserCog,
  X,
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
    icon: FileDown,
  },
  {
    name: "Exams",
    href: "/admin/exams",
    icon: ClipboardList,
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
}) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50
          h-screen w-[280px]
          border-r border-gray-200
          bg-white
          transition-transform duration-300
          lg:static lg:translate-x-0
          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-gray-100 px-6">
          <div>
            <h1 className="text-xl font-bold text-[#0075FF]">
              Rosary
            </h1>

            <p className="text-xs text-gray-500">
              Admin Portal
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="h-[calc(100vh-76px)] overflow-y-auto px-4 py-5">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Administration
          </p>

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
                    flex items-center gap-3
                    rounded-xl px-3 py-3
                    text-sm font-medium
                    transition-all
                    ${
                      active
                        ? "bg-[#0075FF] text-white shadow-sm"
                        : "text-gray-600 hover:bg-blue-50 hover:text-[#0075FF]"
                    }
                  `}
                >
                  <Icon size={19} />

                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}