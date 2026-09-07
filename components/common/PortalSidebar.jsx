"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

import LogoutButton from "@/components/common/LogoutButton";

export default function PortalSidebar({
  navItems,
  mobileOpen,
  onClose,
}) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && (
        <button
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-[230px] flex-col
          bg-[#065A97]
          transition-transform duration-300
          lg:translate-x-0
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* LOGO */}
        <div className="relative flex h-[110px] items-center justify-center border-b border-white/10 px-5">

          <div className="text-center">
            <div className="relative mx-auto h-14 w-fit">
              <Image
                src="/logo/rosary-logo.png"
                alt="Rosary School"
                width={160}
                height={56}
                className="h-14 w-auto object-contain"
              />

              <Image
                src="/logo/rosary-logo.png"
                alt=""
                aria-hidden="true"
                width={160}
                height={56}
                className="pointer-events-none absolute inset-0 h-14 w-auto object-contain brightness-0 invert [clip-path:inset(0_0_0_31%)]"
              />
            </div>
          </div>

          <button
            onClick={onClose}
            className="absolute right-3 top-3 text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex min-h-0 flex-1 flex-col overflow-hidden py-2">
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
                className={`
                  flex min-h-0 max-h-[52px] flex-1 items-center gap-3
                  px-5
                  text-sm font-medium
                  transition
                  ${
                    active
                      ? "bg-[#0075FF] text-white"
                      : "text-white hover:bg-white/10"
                  }
                `}
              >
                <Icon size={18} className="shrink-0 text-white" />

                <span className="whitespace-nowrap text-white">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-white/10 bg-[#065A97] p-4">
          <LogoutButton variant="sidebar" />
        </div>
      </aside>
    </>
  );
}
