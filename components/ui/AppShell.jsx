"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/design-tokens";
import { logoutUser } from "@/services/authService";
import AppSidebar from "@/components/ui/AppSidebar";
import AppHeader from "@/components/ui/AppHeader";

export default function AppShell({
  children,
  portal = "admin",
  navItems = [],
  title,
  subtitle,
  user,
  notificationCount = 0,
  onNotificationClick,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Show the active page's name as the header title, unless the page
  // overrides it via the `title` prop.
  const activeNavItem = navItems.find(
    (item) =>
      pathname === item.href ||
      pathname.startsWith(`${item.href}/`)
  );

  const pageTitle = title || activeNavItem?.label;
  const pageSubtitle = subtitle;

  const handleLogout = () => {
    logoutUser();
    setSidebarOpen(false);
    router.replace("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <AppSidebar
        portal={portal}
        navItems={navItems}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div
        className={cn(
          "min-h-screen transition-[margin] duration-300 lg:ml-[260px]"
        )}
      >
        <AppHeader
          portal={portal}
          title={pageTitle}
          subtitle={pageSubtitle}
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
          notificationCount={notificationCount}
          onNotificationClick={onNotificationClick}
          onLogout={handleLogout}
        />

        <main
          className={cn(
            "bg-[#F7F9FC] pt-[76px]",
            // MobileBottomNav (parent/teacher) is a fixed 68px bar on
            // small screens; pad the scroll body so it never covers.
            portal !== "admin" && "pb-[84px] lg:pb-0"
          )}
        >
          <div className="mx-auto w-full max-w-[1700px] p-4 sm:p-5 md:p-6 lg:p-7 xl:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}