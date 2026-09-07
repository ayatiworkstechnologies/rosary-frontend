"use client";

import { useState } from "react";

import PortalSidebar from "@/components/common/PortalSidebar";
import PortalHeader from "@/components/common/PortalHeader";

export default function PortalShell({
  children,
  portalName,
  navItems,
}) {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  return (
    <div className="min-h-screen bg-[#F6FAFF]">

      <PortalSidebar
        navItems={navItems}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="min-h-screen lg:pl-[230px]">

        <PortalHeader
          portalName={portalName}
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="px-4 pb-24 pt-5 sm:px-6 lg:px-7 lg:pb-8">
          {children}
        </main>

      </div>

    </div>
  );
}