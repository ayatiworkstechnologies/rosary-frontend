"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminShell({
  children,
}) {
  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);

  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "current_user"
    );

    localStorage.removeItem(
      "user_role"
    );

    sessionStorage.removeItem(
      "access_token"
    );

    sessionStorage.removeItem(
      "current_user"
    );

    sessionStorage.removeItem(
      "user_role"
    );

    localStorage.removeItem(
      "parent_login_admission_no"
    );

    sessionStorage.removeItem(
      "parent_login_admission_no"
    );

    setSidebarOpen(false);

    router.replace("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      {/* Sidebar */}
      <AdminSidebar
        open={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
        onLogout={handleLogout}
      />

      {/* Main Area */}
      <div
        className="
          min-h-screen
          lg:ml-[280px]
        "
      >
        {/* Header */}
        <AdminHeader
          onMenuClick={() =>
            setSidebarOpen(true)
          }
          onLogout={
            handleLogout
          }
        />

        {/* Page Content */}
        <main
          className="
            min-h-screen
            bg-[#F7F9FC]
            pt-[76px]
          "
        >
          <div
            className="
              mx-auto
              w-full
              max-w-[1700px]
              p-4
              sm:p-5
              md:p-6
              lg:p-7
              xl:p-8
            "
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}