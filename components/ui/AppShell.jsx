"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/design-tokens";
import { logoutUser } from "@/services/authService";
import AppSidebar from "@/components/ui/AppSidebar";
import AppHeader from "@/components/ui/AppHeader";
import { getPortalTheme } from "@/lib/portal-theme";

export default function AppShell({
  children,
  portal = "admin",
  navItems = [],
  title,
  subtitle,
  user,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const theme = getPortalTheme(portal);

  // Show the active page's name as the header title, unless the page
  // overrides it via the `title` prop.
  const activeNavItem = navItems.find(
    (item) =>
      pathname === item.href ||
      pathname.startsWith(`${item.href}/`)
  );

  const pageTitle = title || activeNavItem?.label;
  const pageSubtitle = subtitle || theme.tagline;

  const handleLogout = () => {
    logoutUser();
    setSidebarOpen(false);
    router.replace("/login");
    router.refresh();
  };

  return (
    <div
      className="portal-canvas min-h-screen text-[#10233F]"
      style={{
        "--portal-accent": theme.accent,
        "--portal-accent-strong": theme.accentStrong,
        "--portal-accent-soft": theme.accentSoft,
        "--portal-surface": theme.surface,
        "--portal-border": theme.border,
      }}
    >
      <AppSidebar
        portal={portal}
        navItems={navItems}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
        user={user}
      />

      <div
        className={cn(
          "min-h-screen transition-[margin] duration-300 lg:ml-[272px]"
        )}
      >
        <AppHeader
          portal={portal}
          title={pageTitle}
          subtitle={pageSubtitle}
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
          onLogout={handleLogout}
        />

        <main
          className={cn(
            "portal-content-layer min-h-screen pt-[76px]",
            // MobileBottomNav (parent/teacher) is a fixed 68px bar on
            // small screens; pad the scroll body so it never covers.
            portal !== "admin" && "pb-[84px] lg:pb-0"
          )}
        >
          <div className="relative z-10 mx-auto w-full max-w-[1700px] p-4 sm:p-5 md:p-6 lg:p-7 xl:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
