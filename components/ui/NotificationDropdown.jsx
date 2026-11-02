"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/design-tokens";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  getStaffNotifications,
  getStaffUnreadNotificationCount,
  markStaffNotificationAsRead,
} from "@/services/notificationService";

/**
 * Notification bell + dropdown for the shared AppHeader.
 *
 * Two backends serve the same UI:
 *  - source="parent": GET/PATCH /notifications (get_current_parent).
 *  - source="staff":  GET/PATCH /api/v1/staff/notifications
 *    (get_current_staff; teacher + admin only, scoped to the
 *    caller's own user_id).
 *
 * Parent endpoints are never called by staff portals and vice versa,
 * so no portal can read another role's rows.
 */
const EMPTY_COPY = {
  parent: {
    title: "No notifications yet",
    body: "School announcements and homework alerts will appear here.",
  },
  staff: {
    title: "No notifications yet",
    body: "Exam schedules, results updates and circulars will appear here.",
  },
};

export default function NotificationDropdown({ source = "parent" }) {
  const router = useRouter();

  const normalizedSource = source === "staff" || source === "admin" || source === "teacher" ? "staff" : "parent";

  const listNotifications =
    normalizedSource === "staff" ? getStaffNotifications : getNotifications;
  const getUnreadCount =
    normalizedSource === "staff"
      ? getStaffUnreadNotificationCount
      : getUnreadNotificationCount;
  const markAsRead =
    normalizedSource === "staff"
      ? markStaffNotificationAsRead
      : markNotificationAsRead;
  const emptyCopy = EMPTY_COPY[normalizedSource] || EMPTY_COPY.parent;

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const containerRef = useRef(null);

  function extractItems(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
  }

  // Real unread badge on first paint of every parent page.
  useEffect(() => {
    let active = true;

    let intervalId = null;
    async function loadCount() {
      try {
        const data = await getUnreadCount();
        if (active) setUnreadCount(data?.unread_count ?? 0);
      } catch {
        // The bell still opens and shows the list; the badge simply
        // stays at its last known value until the dropdown refreshes.
      }
    }

    loadCount();
    intervalId = setInterval(loadCount, 60_000);

    return () => {
      active = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // Close on outside click / Escape while the dropdown is open.
  useEffect(() => {
    if (!open) return;

    function handleOutsideClick(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  async function loadNotifications() {
    setLoading(true);
    setError("");

    try {
      const [items, countData] = await Promise.all([
        listNotifications(),
        getUnreadCount(),
      ]);

      const list = extractItems(items);
      // Newest first regardless of backend ordering.
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setNotifications(list);
      setUnreadCount(countData?.unread_count ?? 0);
    } catch {
      setError("Unable to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBellClick() {
    if (open) {
      setOpen(false);
      return;
    }

    setOpen(true);
    await loadNotifications();
  }

  async function handleNotificationClick(notification) {
    if (processingId !== null) return;

    setProcessingId(notification.id);
    setError("");

    try {
      if (!notification.is_read) {
        await markAsRead(notification.id);

        setNotifications((previous) =>
          previous.map((item) =>
            item.id === notification.id
              ? { ...item, is_read: true }
              : item
          )
        );

        const countData = await getUnreadCount();
        setUnreadCount(countData?.unread_count ?? 0);
      }

      setOpen(false);

      // Internal Portal links only - never navigate off-site.
      const link = notification.link;
      if (
        typeof link === "string" &&
        (link.startsWith("/parent/") ||
          link.startsWith("/teacher/") ||
          link.startsWith("/admin/")) &&
        !link.startsWith("//")
      ) {
        router.push(link);
      }
    } catch {
      setError("Unable to update notification. Please try again.");
    } finally {
      setProcessingId(null);
    }
  }

  function formatDate(value) {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={handleBellClick}
        aria-label={
          unreadCount > 0
            ? `Notifications: ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5EDF5] transition",
          open
            ? "border-[#0075FF] text-[#0075FF]"
            : "text-[#64748B] hover:bg-[#F7F9FC]"
        )}
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute right-[8px] top-[8px] flex h-4 min-w-4 items-center justify-center rounded-full bg-[#DC2626] px-1 text-[9px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-[calc(100vw-3rem)] overflow-hidden rounded-xl border border-[#E5EDF5] bg-white shadow-xl sm:w-[380px]"
          role="dialog"
          aria-label="Notifications"
        >
          {/* Dropdown header */}
          <div className="flex items-center justify-between border-b border-[#E5EDF5] px-4 py-3">
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-[#0B3A67]">
                Notifications
              </h3>
              <p className="text-xs text-[#64748B]">
                {unreadCount} unread
              </p>
            </div>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF3FF]">
              <Bell size={16} className="text-[#0075FF]" />
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-[#64748B]">
              <Loader2 size={18} className="animate-spin" />
              Loading notifications...
            </div>
          ) : (
            <>
              {error && (
                <div
                  role="alert"
                  className="border-b border-red-100 bg-[#FEF2F2] px-4 py-3 text-xs text-[#DC2626]"
                >
                  {error}
                </div>
              )}

              {notifications.length === 0 && !error ? (
                <div className="px-4 py-10 text-center">
                  <CheckCheck
                    size={30}
                    className="mx-auto mb-3 text-[#9CA3AF]"
                  />
                  <p className="text-sm font-semibold text-[#0B3A67]">
                    {emptyCopy.title}
                  </p>
                  <p className="mt-1 text-xs text-[#64748B]">
                    {emptyCopy.body}
                  </p>
                </div>
              ) : (
                <div className="max-h-[360px] overflow-y-auto">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => handleNotificationClick(notification)}
                      disabled={processingId !== null}
                      className={cn(
                        "block w-full border-b border-[#F1F5F9] px-4 py-3 text-left transition hover:bg-[#F7F9FC] disabled:cursor-wait",
                        notification.is_read ? "bg-white" : "bg-[#F5F9FF]"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {/* Unread dot */}
                        <span className="pt-[7px]">
                          <span
                            className={cn(
                              "block h-2 w-2 rounded-full",
                              notification.is_read
                                ? "bg-[#D8E2EE]"
                                : "bg-[#0075FF]"
                            )}
                          />
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-[#0B3A67]">
                            {notification.title}
                          </p>
                          <p className="mt-1 line-clamp-3 text-xs leading-5 text-[#475569]">
                            {notification.message}
                          </p>
                          <p className="mt-2 text-[11px] text-[#94A3B8]">
                            {formatDate(notification.created_at)}
                          </p>
                        </div>

                        {processingId === notification.id && (
                          <Loader2
                            size={15}
                            className="mt-1 shrink-0 animate-spin text-[#0075FF]"
                          />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
