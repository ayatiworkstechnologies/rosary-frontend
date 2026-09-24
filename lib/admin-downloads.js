const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "/backend/api/v1";

const DOWNLOAD_API =
  `${API_URL}/admin/downloads`;


// ======================================================
// RESPONSE HANDLER
// ======================================================

async function handleResponse(
  response,
  fallbackMessage
) {
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    console.error(
      "Admin Downloads API Error:",
      {
        status: response.status,
        data,
      }
    );

    throw new Error(
      data?.detail ||
        data?.message ||
        fallbackMessage
    );
  }

  return data;
}


// ======================================================
// OPTIONAL AUTH HEADERS
// ======================================================

function getAuthHeaders() {
  if (
    typeof window === "undefined"
  ) {
    return {};
  }

  const token =
    localStorage.getItem(
      "access_token"
    );

  if (!token) {
    return {};
  }

  return {
    Authorization:
      `Bearer ${token}`,
  };
}


// ======================================================
// GET DOWNLOADS
// ======================================================

export async function getAdminDownloads(
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

  if (filters.category) {
    params.set(
      "category",
      filters.category
    );
  }

  if (filters.audience) {
    params.set(
      "audience",
      filters.audience
    );
  }

  if (
    filters.is_active !==
      undefined &&
    filters.is_active !== null
  ) {
    params.set(
      "is_active",
      String(
        filters.is_active
      )
    );
  }

  const query =
    params.toString();

  const url =
    query
      ? `${DOWNLOAD_API}?${query}`
      : DOWNLOAD_API;

  const response =
    await fetch(
      url,
      {
        method: "GET",

        headers: {
          ...getAuthHeaders(),
        },

        cache: "no-store",
      }
    );

  return handleResponse(
    response,
    "Unable to load download forms."
  );
}


// ======================================================
// CREATE DOWNLOAD
// ======================================================

export async function createAdminDownload(
  formData
) {
  const response =
    await fetch(
      DOWNLOAD_API,
      {
        method: "POST",

        headers: {
          ...getAuthHeaders(),
        },

        body: formData,
      }
    );

  return handleResponse(
    response,
    "Unable to create download form."
  );
}


// ======================================================
// UPDATE DOWNLOAD
// ======================================================

export async function updateAdminDownload(
  id,
  formData
) {
  const response =
    await fetch(
      `${DOWNLOAD_API}/${id}`,
      {
        method: "PUT",

        headers: {
          ...getAuthHeaders(),
        },

        body: formData,
      }
    );

  return handleResponse(
    response,
    "Unable to update download form."
  );
}


// ======================================================
// UPDATE STATUS
// ======================================================

export async function updateAdminDownloadStatus(
  id,
  isActive
) {
  const response =
    await fetch(
      `${DOWNLOAD_API}/${id}/status`,
      {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",

          ...getAuthHeaders(),
        },

        body: JSON.stringify({
          is_active: isActive,
        }),
      }
    );

  return handleResponse(
    response,
    "Unable to update download status."
  );
}


// ======================================================
// DELETE DOWNLOAD
// ======================================================

export async function deleteAdminDownload(
  id
) {
  const response =
    await fetch(
      `${DOWNLOAD_API}/${id}`,
      {
        method: "DELETE",

        headers: {
          ...getAuthHeaders(),
        },
      }
    );

  return handleResponse(
    response,
    "Unable to delete download form."
  );
}