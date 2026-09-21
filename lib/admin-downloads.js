const API_BASE_URL =
  process.env.NEXT_PUBLIC_ROSARY_API_URL ||
  "http://127.0.0.1:8000";

const BASE_URL =
  `${API_BASE_URL}/api/v1/admin/downloads`;


// ======================================================
// COMMON ERROR HANDLER
// ======================================================

async function handleResponse(response, fallbackMessage) {
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    console.error(
      "Downloads API Error:",
      response.status,
      data
    );

    let message = fallbackMessage;

    if (data?.detail) {
      message =
        typeof data.detail === "string"
          ? data.detail
          : JSON.stringify(data.detail);
    }

    throw new Error(message);
  }

  return data;
}


// ======================================================
// GET ALL DOWNLOADS
// ======================================================

export async function getAdminDownloads(filters = {}) {
  const params = new URLSearchParams();

  if (filters.search?.trim()) {
    params.append(
      "search",
      filters.search.trim()
    );
  }

  if (filters.category) {
    params.append(
      "category",
      filters.category
    );
  }

  if (filters.audience) {
    params.append(
      "audience",
      filters.audience
    );
  }

  if (
    filters.class_id !== undefined &&
    filters.class_id !== null &&
    filters.class_id !== ""
  ) {
    params.append(
      "class_id",
      String(filters.class_id)
    );
  }

  if (
    filters.is_active !== undefined &&
    filters.is_active !== null
  ) {
    params.append(
      "is_active",
      String(filters.is_active)
    );
  }

  const query = params.toString();

  const url = query
    ? `${BASE_URL}?${query}`
    : BASE_URL;

  console.log(
    "GET Downloads URL:",
    url
  );

  const response = await fetch(
    url,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  return handleResponse(
    response,
    "Failed to load downloads"
  );
}


// ======================================================
// GET SINGLE DOWNLOAD
// ======================================================

export async function getAdminDownload(id) {
  const response = await fetch(
    `${BASE_URL}/${id}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  return handleResponse(
    response,
    "Failed to load download"
  );
}


// ======================================================
// CREATE DOWNLOAD
// ======================================================

export async function createAdminDownload(formData) {
  const response = await fetch(
    BASE_URL,
    {
      method: "POST",
      body: formData,
    }
  );

  // Do NOT manually add Content-Type.
  // Browser will set multipart/form-data automatically.

  return handleResponse(
    response,
    "Failed to create download"
  );
}


// ======================================================
// UPDATE DOWNLOAD
// ======================================================

export async function updateAdminDownload(
  id,
  formData
) {
  const response = await fetch(
    `${BASE_URL}/${id}`,
    {
      method: "PUT",
      body: formData,
    }
  );

  return handleResponse(
    response,
    "Failed to update download"
  );
}


// ======================================================
// ACTIVE / INACTIVE
// ======================================================

export async function updateAdminDownloadStatus(
  id,
  isActive
) {
  const response = await fetch(
    `${BASE_URL}/${id}/status?is_active=${encodeURIComponent(
      String(isActive)
    )}`,
    {
      method: "PATCH",
    }
  );

  return handleResponse(
    response,
    "Failed to update download status"
  );
}


// ======================================================
// DELETE DOWNLOAD
// ======================================================

export async function deleteAdminDownload(id) {
  const response = await fetch(
    `${BASE_URL}/${id}`,
    {
      method: "DELETE",
    }
  );

  return handleResponse(
    response,
    "Failed to delete download"
  );
}