const API_BASE_URL =
  process.env.NEXT_PUBLIC_ROSARY_API_URL ||
  "http://127.0.0.1:8000";

const BASE_URL =
  `${API_BASE_URL}/api/v1/admin/users`;


// ======================================================
// GET ACCESS TOKEN
// ======================================================

function getAccessToken() {
  if (
    typeof window === "undefined"
  ) {
    return null;
  }

  return localStorage.getItem(
    "access_token"
  );
}


// ======================================================
// AUTH HEADERS
// ======================================================

function getAuthHeaders(
  includeJson = false
) {
  const token =
    getAccessToken();

  const headers = {};

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  if (includeJson) {
    headers["Content-Type"] =
      "application/json";
  }

  return headers;
}


// ======================================================
// HANDLE RESPONSE
// ======================================================

async function handleResponse(
  response
) {
  let data = null;

  try {
    data =
      await response.json();
  } catch {
    data = null;
  }

  if (
    response.status === 401
  ) {
    if (
      typeof window !==
      "undefined"
    ) {
      localStorage.removeItem(
        "access_token"
      );

      localStorage.removeItem(
        "user"
      );
    }

    throw new Error(
      "Your login session has expired. Please login again."
    );
  }

  if (
    response.status === 403
  ) {
    throw new Error(
      data?.detail ||
        "You do not have permission to perform this action."
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        `Request failed (${response.status})`
    );
  }

  return data;
}


// ======================================================
// GET USERS
// ======================================================

export async function getAdminUsers(
  filters = {}
) {
  const params =
    new URLSearchParams();

  if (filters.search) {
    params.append(
      "search",
      filters.search
    );
  }

  if (filters.role) {
    params.append(
      "role",
      filters.role
    );
  }

  if (
    filters.is_active !==
    undefined
  ) {
    params.append(
      "is_active",
      String(
        filters.is_active
      )
    );
  }

  const query =
    params.toString();

  const url = query
    ? `${BASE_URL}?${query}`
    : BASE_URL;

  const response =
    await fetch(url, {
      method: "GET",
      headers:
        getAuthHeaders(),
      cache: "no-store",
    });

  return handleResponse(
    response
  );
}


// ======================================================
// GET SINGLE USER
// ======================================================

export async function getAdminUser(
  userId
) {
  const response =
    await fetch(
      `${BASE_URL}/${userId}`,
      {
        method: "GET",
        headers:
          getAuthHeaders(),
        cache: "no-store",
      }
    );

  return handleResponse(
    response
  );
}


// ======================================================
// CREATE USER
// ======================================================

export async function createAdminUser(
  payload
) {
  const response =
    await fetch(
      BASE_URL,
      {
        method: "POST",

        headers:
          getAuthHeaders(
            true
          ),

        body:
          JSON.stringify(
            payload
          ),
      }
    );

  return handleResponse(
    response
  );
}


// ======================================================
// UPDATE USER
// ======================================================

export async function updateAdminUser(
  userId,
  payload
) {
  const response =
    await fetch(
      `${BASE_URL}/${userId}`,
      {
        method: "PUT",

        headers:
          getAuthHeaders(
            true
          ),

        body:
          JSON.stringify(
            payload
          ),
      }
    );

  return handleResponse(
    response
  );
}


// ======================================================
// UPDATE STATUS
// ======================================================

export async function updateAdminUserStatus(
  userId,
  isActive
) {
  const response =
    await fetch(
      `${BASE_URL}/${userId}/status`,
      {
        method: "PATCH",

        headers:
          getAuthHeaders(
            true
          ),

        body:
          JSON.stringify({
            is_active:
              isActive,
          }),
      }
    );

  return handleResponse(
    response
  );
}


// ======================================================
// RESET PASSWORD
// ======================================================

export async function resetAdminUserPassword(
  userId,
  newPassword
) {
  const response =
    await fetch(
      `${BASE_URL}/${userId}/password`,
      {
        method: "PATCH",

        headers:
          getAuthHeaders(
            true
          ),

        body:
          JSON.stringify({
            new_password:
              newPassword,
          }),
      }
    );

  return handleResponse(
    response
  );
}


// ======================================================
// DELETE USER
// ======================================================

export async function deleteAdminUser(
  userId
) {
  const response =
    await fetch(
      `${BASE_URL}/${userId}`,
      {
        method: "DELETE",

        headers:
          getAuthHeaders(),
      }
    );

  return handleResponse(
    response
  );
}