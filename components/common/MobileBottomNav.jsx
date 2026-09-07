"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileBottomNav({
  items = [],
}) {
  const pathname = usePathname();

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
        border-slate-200
        bg-white
        shadow-[0_-4px_20px_rgba(15,23,42,0.06)]
        lg:hidden
      "
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
                ${
                  active
                    ? "font-semibold text-[#0075FF]"
                    : "text-slate-500"
                }
              `}
            >
              {Icon && <Icon size={19} />}

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