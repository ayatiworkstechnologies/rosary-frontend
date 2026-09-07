"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { logoutUser } from "@/services/authService";

export default function LogoutButton({
  variant = "default",
}) {
  const router = useRouter();

  const handleLogout = () => {
    logoutUser();
    router.replace("/login");
  };

  if (variant === "sidebar") {
    return (
      <button
        type="button"
        onClick={handleLogout}
        className="
          flex w-full items-center gap-3
          rounded-lg px-3 py-3
          text-sm font-medium text-white
          transition hover:bg-white/10
        "
      >
        <LogOut size={18} />
        Logout
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex items-center gap-2 text-sm text-red-500"
    >
      <LogOut size={18} />
      Logout
    </button>
  );
}