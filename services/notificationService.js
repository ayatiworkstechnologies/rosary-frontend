
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
