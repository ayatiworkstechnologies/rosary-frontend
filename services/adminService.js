const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000/api/v1";

export async function getAdminDashboardStats() {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;

    const response = await fetch(
      `${API_URL}/admin/dashboard/stats`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",

          ...(token && {
            Authorization: `Bearer ${token}`,
          }),
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => null);

      throw new Error(
        errorData?.detail ||
          "Failed to load dashboard statistics"
      );
    }

    return await response.json();
  } catch (error) {
    console.error(
      "Admin dashboard API error:",
      error
    );

    throw error;
  }
}