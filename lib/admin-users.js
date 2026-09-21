const API_BASE_URL =
  process.env.NEXT_PUBLIC_ROSARY_API_URL ||
  "http://127.0.0.1:8000";

const BASE_URL =
  `${API_BASE_URL}/api/v1/admin/users`;


// ======================================================
// HANDLE RESPONSE
// ======================================================

async function handleResponse(response) {
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
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
    filters.is_active !== undefined
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
    await fetch(BASE_URL, {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body:
        JSON.stringify(
          payload
        ),
    });

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

        headers: {
          "Content-Type":
            "application/json",
        },

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
// STATUS
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

        headers: {
          "Content-Type":
            "application/json",
        },

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

        headers: {
          "Content-Type":
            "application/json",
        },

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
      }
    );

  return handleResponse(
    response
  );
}