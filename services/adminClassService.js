const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "/backend/api/v1";

function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    sessionStorage.getItem("access_token") ||
    localStorage.getItem("access_token")
  );
}

function getHeaders() {
  const token = getToken();

  return {
    "Content-Type": "application/json",

    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
  };
}

async function handleResponse(
  response,
  fallbackMessage
) {
  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.detail || fallbackMessage
    );
  }

  return data;
}

// GET ALL CLASSES

// =========================================================
// GET ADMIN CLASSES
// Default: All classes for existing dropdowns
// Optional: Paginated classes for listing page
// =========================================================

export async function getAdminClasses(options = {}) {
  const {
    page = 1,
    page_size = 25,
    search = "",
    paginated = false,
  } = options;

  const params = new URLSearchParams();

  if (paginated) {
    params.set("page", String(page));
    params.set("page_size", String(page_size));

    if (search.trim()) {
      params.set("search", search.trim());
    }
  } else {
    // Preserve existing dropdown functionality
    params.set("all", "true");
  }

  const response = await fetch(
    `${API_URL}/admin/classes?${params.toString()}`,
    {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
    }
  );

  return handleResponse(
    response,
    "Unable to load classes"
  );
}


// GET SINGLE CLASS
export async function getAdminClass(id) {
  const response = await fetch(
    `${API_URL}/admin/classes/${id}`,
    {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
    }
  );

  return handleResponse(
    response,
    "Unable to load class"
  );
}

// CREATE CLASS
export async function createAdminClass(data) {
  const response = await fetch(
    `${API_URL}/admin/classes`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );

  return handleResponse(
    response,
    "Unable to create class"
  );
}

// UPDATE CLASS
export async function updateAdminClass(
  id,
  data
) {
  const response = await fetch(
    `${API_URL}/admin/classes/${id}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );

  return handleResponse(
    response,
    "Unable to update class"
  );
}

// ACTIVATE / DEACTIVATE
export async function updateAdminClassStatus(
  id,
  isActive
) {
  const response = await fetch(
    `${API_URL}/admin/classes/${id}/status`,
    {
      method: "PATCH",
      headers: getHeaders(),

      body: JSON.stringify({
        is_active: isActive,
      }),
    }
  );

  return handleResponse(
    response,
    "Unable to update class status"
  );
}