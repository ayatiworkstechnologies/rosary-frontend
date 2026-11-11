
import axios from "axios";
import { API_BASE_URL } from "@/services/api";

// Keep notifications on the same environment-selected backend as the main
// API. For example:
//   http://localhost:8000/api/v1 -> http://localhost:8000/notifications
//   /backend/api/v1             -> /backend/notifications
const normalizedApiBaseUrl = API_BASE_URL.replace(/\/+$/, "");
const backendRootUrl = normalizedApiBaseUrl.replace(/\/api\/v1$/i, "");

const notificationApi = axios.create({
  baseURL: `${backendRootUrl}/notifications`,
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
// TEACHER/ADMIN only, scoped to the caller's own user_id.
// ------------------------------------------------------------------
const staffNotificationApi = axios.create({
  baseURL: `${normalizedApiBaseUrl}/staff/notifications`,
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
