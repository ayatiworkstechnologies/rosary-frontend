const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "/backend/api/v1";

function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token")
  );
}

function getHeaders() {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token
      ? {
          Authorization: "Bearer " + token,
        }
      : {}),
  };
}

function clearExpiredSession() {
  if (typeof window === "undefined") {
    return;
  }

  const keys = [
    "access_token",
    "current_user",
    "user_role",
    "parent_login_admission_no",
  ];

  for (const key of keys) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
}

async function handleResponse(
  response,
  fallbackMessage
) {
  const data = await response
    .json()
    .catch(() => null);

  if (
    response.status === 401 &&
    typeof window !== "undefined"
  ) {
    clearExpiredSession();
    window.location.replace("/login");

    throw new Error(
      "Your session expired. Please sign in again."
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        data?.message ||
        fallbackMessage
    );
  }

  return data;
}


// ======================================================
// GET PARENTS
// ======================================================

export async function getAdminParents(
  filters = {}
) {
  const params =
    new URLSearchParams();

  if (filters.search) {
    params.set(
      "search",
      filters.search
    );
  }

  if (
    filters.is_active !==
    undefined
  ) {
    params.set(
      "is_active",
      String(
        filters.is_active
      )
    );
  }

  if (filters.page) {
    params.set(
      "page",
      String(
        filters.page
      )
    );
  }

  if (filters.page_size) {
    params.set(
      "page_size",
      String(
        filters.page_size
      )
    );
  }

  const query =
    params.toString();

  const url = query
    ? `${API_URL}/admin/parent-options?${query}`
    : `${API_URL}/admin/parent-options`;

  const response = await fetch(
    url,
    {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
    }
  );

  return handleResponse(
    response,
    "Unable to load parents"
  );
}


// ======================================================
// GET PARENT LINKS
// ======================================================

export async function getAdminParentLinks(
  filters = {}
) {
  const params =
    new URLSearchParams();

  if (filters.search) {
    params.set(
      "search",
      filters.search
    );
  }

  if (filters.class_id) {
    params.set(
      "class_id",
      String(
        filters.class_id
      )
    );
  }

  if (filters.page) {
    params.set(
      "page",
      String(
        filters.page
      )
    );
  }

  if (filters.page_size) {
    params.set(
      "page_size",
      String(
        filters.page_size
      )
    );
  }

  const query =
    params.toString();

  const url = query
    ? `${API_URL}/admin/parent-links?${query}`
    : `${API_URL}/admin/parent-links`;

  const response = await fetch(
    url,
    {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
    }
  );

  return handleResponse(
    response,
    "Unable to load parent links"
  );
}


// ======================================================
// GET SINGLE PARENT LINK
// ======================================================

export async function getAdminParentLink(
  id
) {
  if (!id) {
    throw new Error(
      "Parent link ID is required."
    );
  }

  const response = await fetch(
    `${API_URL}/admin/parent-links/${id}`,
    {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
    }
  );

  return handleResponse(
    response,
    "Unable to load parent link"
  );
}


// ======================================================
// CREATE PARENT LINK
// ======================================================

export async function createAdminParentLink(
  data
) {
  if (!data) {
    throw new Error(
      "Parent link data is required."
    );
  }

  const response = await fetch(
    `${API_URL}/admin/parent-links`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );

  return handleResponse(
    response,
    "Unable to create parent link"
  );
}


// ======================================================
// UPDATE PARENT LINK
// ======================================================

export async function updateAdminParentLink(
  id,
  data
) {
  if (!id) {
    throw new Error(
      "Parent link ID is required."
    );
  }

  if (!data) {
    throw new Error(
      "Parent link data is required."
    );
  }

  const response = await fetch(
    `${API_URL}/admin/parent-links/${id}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );

  return handleResponse(
    response,
    "Unable to update parent link"
  );
}


// ======================================================
// DELETE / UNLINK PARENT
// ======================================================

export async function deleteAdminParentLink(
  id
) {
  if (!id) {
    throw new Error(
      "Parent link ID is required."
    );
  }

  const response = await fetch(
    `${API_URL}/admin/parent-links/${id}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );

  return handleResponse(
    response,
    "Unable to unlink parent"
  );
}
