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


// GET PARENTS
export async function getAdminParents() {
  const response = await fetch(
    `${API_URL}/admin/parents`,
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


// GET ALL LINKS
export async function getAdminParentLinks() {
  const response = await fetch(
    `${API_URL}/admin/parent-links`,
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


// GET SINGLE LINK
export async function getAdminParentLink(id) {
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


// CREATE LINK
export async function createAdminParentLink(
  data
) {
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


// UPDATE LINK
export async function updateAdminParentLink(
  id,
  data
) {
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


// DELETE / UNLINK
export async function deleteAdminParentLink(
  id
) {
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