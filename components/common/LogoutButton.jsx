"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  logoutUser,
} from "@/services/authService";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    logoutUser();

    router.replace("/login");
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
    >
      <LogOut size={18} />

      Logout
    </button>
  );
}