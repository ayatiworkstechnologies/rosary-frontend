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
      data?.detail ||
        data?.message ||
        fallbackMessage
    );
  }

  return data;
}


// GET ALL
export async function getAdminCirculars(
  params = {}
) {
  const searchParams =
    new URLSearchParams();

  if (params.search) {
    searchParams.set(
      "search",
      params.search
    );
  }

  if (params.category) {
    searchParams.set(
      "category",
      params.category
    );
  }

  if (params.audience) {
    searchParams.set(
      "audience",
      params.audience
    );
  }

  if (
    params.is_active !== undefined &&
    params.is_active !== null &&
    params.is_active !== ""
  ) {
    searchParams.set(
      "is_active",
      String(params.is_active)
    );
  }

  const query =
    searchParams.toString();

  const response = await fetch(
    `${API_URL}/admin/circulars${
      query ? `?${query}` : ""
    }`,
    {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
    }
  );

  return handleResponse(
    response,
    "Unable to load circulars"
  );
}


// GET SINGLE
export async function getAdminCircular(
  id
) {
  const response = await fetch(
    `${API_URL}/admin/circulars/${id}`,
    {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
    }
  );

  return handleResponse(
    response,
    "Unable to load circular"
  );
}


// CREATE
export async function createAdminCircular(
  data
) {
  const response = await fetch(
    `${API_URL}/admin/circulars`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );

  return handleResponse(
    response,
    "Unable to create circular"
  );
}


// UPDATE
export async function updateAdminCircular(
  id,
  data
) {
  const response = await fetch(
    `${API_URL}/admin/circulars/${id}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );

  return handleResponse(
    response,
    "Unable to update circular"
  );
}


// STATUS
export async function updateAdminCircularStatus(
  id,
  isActive
) {
  const response = await fetch(
    `${API_URL}/admin/circulars/${id}/status`,
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
    "Unable to update circular status"
  );
}


// DELETE
export async function deleteAdminCircular(
  id
) {
  const response = await fetch(
    `${API_URL}/admin/circulars/${id}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );

  return handleResponse(
    response,
    "Unable to delete circular"
  );
}