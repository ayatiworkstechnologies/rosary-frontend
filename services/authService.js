import api from "@/services/api";

export async function loginUser(payload) {
  const response = await api.post("/auth/login", payload);

  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get("/auth/me");

  return response.data;
}

export function logoutUser() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("access_token");
  localStorage.removeItem("current_user");
  localStorage.removeItem("user_role");

  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("current_user");
  sessionStorage.removeItem("user_role");
}