"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminShell({ children }) {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const router = useRouter();

  // ============================================
  // LOGOUT
  // ============================================

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem("access_token");
    localStorage.removeItem("current_user");
    localStorage.removeItem("user_role");

    // Clear session storage
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("current_user");
    sessionStorage.removeItem("user_role");

    // Clear parent-specific stored login if present
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
    <div className="flex min-h-screen bg-white">

      {/* Sidebar */}
      <AdminSidebar
        open={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
        onLogout={handleLogout}
      />

      {/* Main Section */}
      <div className="min-w-0 flex-1 bg-white">

        {/* Header */}
        <AdminHeader
          onMenuClick={() =>
            setSidebarOpen(true)
          }
          onLogout={handleLogout}
        />

        {/* Dashboard / Page Content */}
        <main className="min-h-[calc(100vh-76px)] bg-white p-4 md:p-6 lg:p-8">
          {children}
        </main>

      </div>
    </div>
  );
}