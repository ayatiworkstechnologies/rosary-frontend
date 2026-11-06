"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getPortalTheme } from "@/lib/portal-theme";

export default function MobileBottomNav({
  items = [],
  portal = "parent",
}) {
  const pathname = usePathname();
  const theme = getPortalTheme(portal);

  return (
    <nav
      className="
        fixed
        bottom-0
        left-0
        right-0
        z-40
        h-[68px]
        border-t
        bg-white/95
        backdrop-blur-xl
        shadow-[0_-4px_20px_rgba(15,23,42,0.06)]
        lg:hidden
      "
      style={{ borderColor: theme.border }}
    >
      <div
        className="grid h-full"
        style={{
          gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
        }}
      >
        {items.map((item) => {
          const Icon = item.icon;

          if (!item.href) {
            return null;
          }

          const active =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex
                flex-col
                items-center
                justify-center
                gap-1
                text-[10px]
                transition
                ${active ? "font-bold" : "text-slate-500"}
              `}
              style={active ? { color: theme.accent } : undefined}
            >
              {Icon && (
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-xl"
                  style={active ? { backgroundColor: theme.accentSoft } : undefined}
                >
                  <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                </span>
              )}

              <span>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
