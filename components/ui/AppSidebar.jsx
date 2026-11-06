"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, LogOut } from "lucide-react";
import { cn } from "@/lib/design-tokens";
import { getPortalTheme } from "@/lib/portal-theme";

export default function AppSidebar({
  portal = "admin",
  navItems = [],
  open = false,
  onClose,
  onLogout,
  user,
  width = 272,
}) {
  const pathname = usePathname();
  const theme = getPortalTheme(portal);

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
        className={cn(
          "fixed left-0 top-0 z-50 flex h-dvh flex-col overflow-hidden text-white shadow-[16px_0_45px_rgba(15,23,42,0.14)] transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
        style={{
          width,
          background: `linear-gradient(165deg, ${theme.sidebarStart} 0%, ${theme.sidebarEnd} 100%)`,
        }}
      >
        {/* Brand */}
        <div className="portal-sidebar-brand flex h-[104px] shrink-0 items-center gap-2 border-b border-white/10 px-4 py-3 max-[700px]:h-[88px] max-[700px]:py-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex h-[58px] items-center rounded-2xl bg-white px-3 shadow-[0_10px_24px_rgba(0,0,0,0.14)] max-[700px]:h-[50px]">
              <Image
                src="/logo/rosary-logo.png"
                alt="Rosary Matriculation Higher Secondary School"
                width={220}
                height={81}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <p className="truncate px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/75">
              {theme.label}
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

        {/* Navigation */}
        <nav className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 py-2">
          <div className="flex min-h-0 flex-1 flex-col">
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
                    "portal-nav-link flex min-h-[30px] max-h-[42px] flex-1 items-center gap-3 rounded-xl px-3.5 text-[13px] font-semibold transition-all duration-200",
                    active
                      ? "bg-white text-[#10233F] shadow-[0_8px_20px_rgba(0,0,0,0.14)]"
                      : "text-white/78 hover:bg-white/12 hover:text-white"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {Icon && (
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                        active ? "text-white" : "bg-white/10 text-white"
                      )}
                      style={active ? { backgroundColor: theme.accent } : undefined}
                    >
                      <Icon size={16} strokeWidth={2.2} />
                    </span>
                  )}
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
        <div className="portal-sidebar-footer shrink-0 border-t border-white/10 bg-black/10 p-2.5">
          <button
            type="button"
            onClick={onLogout}
            className="flex h-[42px] w-full items-center gap-3 rounded-xl px-3 text-[13px] font-semibold text-white transition hover:bg-white/10"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10">
              <LogOut size={16} strokeWidth={2.2} />
            </span>
            <span className="min-w-0 flex-1 truncate text-left">
              Logout{user?.name ? ` · ${user.name}` : ""}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
