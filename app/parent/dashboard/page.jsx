"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Users } from "lucide-react";
import LogoutButton from "@/components/common/LogoutButton";

const subscribeToStorage = (onStoreChange) => {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
};

const getStoredUser = () =>
  localStorage.getItem("current_user") ||
  sessionStorage.getItem("current_user");

const getServerUser = () => null;

export default function ParentDashboard() {
  const savedUser = useSyncExternalStore(
    subscribeToStorage,
    getStoredUser,
    getServerUser,
  );
  const user = useMemo(() => {
    if (!savedUser) return null;

    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  }, [savedUser]);

  return (
    <main className="min-h-screen bg-[#F5F9FF] p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4">

            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF4FF] text-[#0075FF]">
                <Users size={28} />
              </div>

              <div>
                <p className="text-sm font-semibold text-[#0075FF]">
                  Parent Portal
                </p>

                <h1 className="mt-1 text-2xl font-bold text-slate-900">
                  Welcome, {user?.name || "Parent"}{" "}
                  <span aria-hidden="true">{"\u{1F44B}"}</span>
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Rosary School Parent Dashboard
                </p>
              </div>
            </div>

            <LogoutButton />

          </div>
        </div>
      </div>
    </main>
  );
}
