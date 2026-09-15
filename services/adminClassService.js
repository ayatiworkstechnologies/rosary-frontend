const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000/api/v1";

function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("access_token");
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
export async function getAdminClasses() {
  const response = await fetch(
    `${API_URL}/admin/classes`,
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