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
      {/* =========================================
          MOBILE OVERLAY
      ========================================== */}

      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* =========================================
          SIDEBAR
      ========================================== */}

      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-[280px] flex-col
          bg-[#08679F]
          text-white
          transition-transform duration-300
          lg:static lg:translate-x-0
          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* =========================================
            SIDEBAR HEADER
        ========================================== */}

        <div
          className="
            flex h-[76px] shrink-0
            items-center justify-between
            border-b border-white/10
            px-6
          "
        >
          <div>
            <h1 className="text-xl font-bold text-white">
              Rosary
            </h1>

            <p className="mt-0.5 text-xs text-white/70">
              Admin Portal
            </p>
          </div>

          {/* Mobile Close */}
          <button
            type="button"
            onClick={onClose}
            className="
              flex h-9 w-9
              items-center justify-center
              rounded-lg
              text-white
              transition
              hover:bg-white/10
              lg:hidden
            "
            aria-label="Close sidebar"
          >
            <X size={21} />
          </button>
        </div>

        {/* =========================================
            NAVIGATION
        ========================================== */}

        <nav
          className="
            min-h-0 flex-1
            overflow-y-auto
            py-3
          "
        >
          <div>
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
                    flex min-h-[52px]
                    items-center gap-4
                    px-7
                    text-[16px]
                    font-medium
                    transition-all
                    duration-200

                    ${
                      active
                        ? "bg-[#087EF5] text-white"
                        : "text-white hover:bg-white/10"
                    }
                  `}
                >
                  <Icon
                    size={23}
                    strokeWidth={2}
                    className="shrink-0"
                  />

                  <span>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* =========================================
            LOGOUT
        ========================================== */}

        <div
          className="
            shrink-0
            border-t border-white/10
            bg-[#08679F]
            px-7 py-5
          "
        >
          <button
            type="button"
            onClick={onLogout}
            className="
              flex w-full
              items-center gap-4
              text-[16px]
              font-medium
              text-white
              transition
              hover:opacity-80
            "
          >
            {/* Logout Circle */}
            <div
              className="
                flex h-10 w-10
                shrink-0
                items-center justify-center
                rounded-full
                border border-white/40
                bg-[#064C78]
              "
            >
              <LogOut
                size={20}
                strokeWidth={2}
              />
            </div>

            <span>
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}