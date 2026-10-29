const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "/backend/api/v1";

const BASE_URL =
  `${API_URL}/admin/exams`;


/* =========================================================
   AUTH TOKEN
========================================================= */

function getAuthToken() {
  if (
    typeof window ===
    "undefined"
  ) {
    return null;
  }

  return (
    sessionStorage.getItem(
      "access_token"
    ) ||
    localStorage.getItem(
      "access_token"
    )
  );
}


/* =========================================================
   COMMON HEADERS
========================================================= */

function getHeaders(
  includeJson = true
) {
  const headers = {};

  if (includeJson) {
    headers[
      "Content-Type"
    ] = "application/json";
  }

  const token =
    getAuthToken();

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  return headers;
}


/* =========================================================
   HANDLE RESPONSE
========================================================= */

async function handleResponse(
  response,
  fallbackMessage
) {
  let data = null;

  try {
    data =
      await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    let message =
      fallbackMessage;

    if (data?.detail) {
      message =
        typeof data.detail ===
        "string"
          ? data.detail
          : JSON.stringify(
              data.detail
            );
    }

    throw new Error(
      message
    );
  }

  return data;
}


/* =========================================================
   GET ALL EXAMS
========================================================= */

export async function getAdminExams(
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

  if (
    filters.academic_year
  ) {
    params.append(
      "academic_year",
      filters.academic_year
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

  if (
    filters.page !==
    undefined
  ) {
    params.append(
      "page",
      String(
        filters.page
      )
    );
  }

  if (
    filters.page_size !==
    undefined
  ) {
    params.append(
      "page_size",
      String(
        filters.page_size
      )
    );
  }

  const query =
    params.toString();

  const url = query
    ? `${BASE_URL}?${query}`
    : BASE_URL;

  const response =
    await fetch(
      url,
      {
        method: "GET",
        cache: "no-store",
        headers:
          getHeaders(false),
      }
    );

  return handleResponse(
    response,
    "Failed to load exams"
  );
}


/* =========================================================
   GET SINGLE EXAM
========================================================= */

export async function getAdminExam(
  id
) {
  const response =
    await fetch(
      `${BASE_URL}/${id}`,
      {
        method: "GET",
        cache: "no-store",
        headers:
          getHeaders(false),
      }
    );

  return handleResponse(
    response,
    "Failed to load exam"
  );
}


/* =========================================================
   CREATE EXAM
========================================================= */

export async function createAdminExam(
  payload
) {
  const response =
    await fetch(
      BASE_URL,
      {
        method: "POST",
        headers:
          getHeaders(true),
        body:
          JSON.stringify(
            payload
          ),
      }
    );

  return handleResponse(
    response,
    "Failed to create exam"
  );
}


/* =========================================================
   UPDATE EXAM
========================================================= */

export async function updateAdminExam(
  id,
  payload
) {
  const response =
    await fetch(
      `${BASE_URL}/${id}`,
      {
        method: "PUT",
        headers:
          getHeaders(true),
        body:
          JSON.stringify(
            payload
          ),
      }
    );

  return handleResponse(
    response,
    "Failed to update exam"
  );
}


/* =========================================================
   ACTIVE / INACTIVE
========================================================= */

export async function updateAdminExamStatus(
  id,
  isActive
) {
  const response =
    await fetch(
      `${BASE_URL}/${id}/status`,
      {
        method: "PATCH",
        headers:
          getHeaders(true),
        body:
          JSON.stringify({
            is_active:
              isActive,
          }),
      }
    );

  return handleResponse(
    response,
    "Failed to update exam status"
  );
}


/* =========================================================
   PUBLISH / UNPUBLISH RESULTS
========================================================= */

export async function updateAdminExamResultsPublishStatus(
  id,
  resultsPublished
) {
  const response =
    await fetch(
      `${BASE_URL}/${id}/publish-results`,
      {
        method: "PATCH",
        headers:
          getHeaders(true),
        body:
          JSON.stringify({
            results_published:
              resultsPublished,
          }),
      }
    );

  return handleResponse(
    response,
    resultsPublished
      ? "Failed to publish exam results"
      : "Failed to unpublish exam results"
  );
}


/* =========================================================
   DELETE EXAM
========================================================= */

export async function deleteAdminExam(
  id
) {
  const response =
    await fetch(
      `${BASE_URL}/${id}`,
      {
        method: "DELETE",
        headers:
          getHeaders(false),
      }
    );

  return handleResponse(
    response,
    "Failed to delete exam"
  );
}