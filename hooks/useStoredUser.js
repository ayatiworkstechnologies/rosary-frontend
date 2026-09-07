"use client";

import { useMemo, useSyncExternalStore } from "react";

const subscribeToStorage = (onStoreChange) => {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
};

const getStoredUser = () =>
  localStorage.getItem("current_user") ||
  sessionStorage.getItem("current_user");

const getServerUser = () => null;

export default function useStoredUser() {
  const savedUser = useSyncExternalStore(
    subscribeToStorage,
    getStoredUser,
    getServerUser,
  );

  return useMemo(() => {
    if (!savedUser) return null;

    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  }, [savedUser]);
}
