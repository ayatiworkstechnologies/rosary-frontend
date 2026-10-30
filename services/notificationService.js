
import axios from "axios";

// Notification endpoints are outside /api/v1.
// Use the existing Next.js backend proxy.
const notificationApi = axios.create({
  baseURL: "/backend/notifications",
  timeout: 15000,
});

// Attach the logged-in user's JWT token.
notificationApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token =
      sessionStorage.getItem("access_token") ||
      localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// Get all Parent notifications
export async function getNotifications() {
  const response = await notificationApi.get("");
  return response.data;
}

// Get unread notification count
export async function getUnreadNotificationCount() {
  const response = await notificationApi.get("/unread-count");
  return response.data;
}

// Mark a notification as read
export async function markNotificationAsRead(notificationId) {
  const response = await notificationApi.patch(
    `/${notificationId}/read`
  );
  return response.data;
}

// ------------------------------------------------------------------
// Staff (Admin + Teacher) notification inbox.
//
// New backend router: /api/v1/staff/notifications - role-guarded for
// TEACHER/ADMIN only, scoped to the caller's own user_id. Parent
// endpoints stay on "/backend/notifications" and remain parent-only.
// ------------------------------------------------------------------
const staffNotificationApi = axios.create({
  baseURL: "/backend/api/v1/staff/notifications",
  timeout: 15000,
});

staffNotificationApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token =
      sessionStorage.getItem("access_token") ||
      localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// Get all staff notifications
export async function getStaffNotifications() {
  const response = await staffNotificationApi.get("");
  return response.data;
}

// Get unread staff notification count
export async function getStaffUnreadNotificationCount() {
  const response = await staffNotificationApi.get("/unread-count");
  return response.data;
}

// Mark a staff notification as read
export async function markStaffNotificationAsRead(notificationId) {
  const response = await staffNotificationApi.patch(
    `/${notificationId}/read`
  );
  return response.data;
}
