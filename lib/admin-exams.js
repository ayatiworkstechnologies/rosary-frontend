const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "/backend/api/v1";

const BASE_URL =
  `${API_URL}/admin/exams`;


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
    let message =
      fallbackMessage;

    if (data?.detail) {
      message =
        typeof data.detail === "string"
          ? data.detail
          : JSON.stringify(
              data.detail
            );
    }

    throw new Error(message);
  }

  return data;
}


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
      }
    );

  return handleResponse(
    response,
    "Failed to load exams"
  );
}


export async function getAdminExam(
  id
) {
  const response =
    await fetch(
      `${BASE_URL}/${id}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

  return handleResponse(
    response,
    "Failed to load exam"
  );
}


export async function createAdminExam(
  payload
) {
  const response =
    await fetch(
      BASE_URL,
      {
        method: "POST",

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
    response,
    "Failed to create exam"
  );
}


export async function updateAdminExam(
  id,
  payload
) {
  const response =
    await fetch(
      `${BASE_URL}/${id}`,
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
    response,
    "Failed to update exam"
  );
}


export async function updateAdminExamStatus(
  id,
  isActive
) {
  const response =
    await fetch(
      `${BASE_URL}/${id}/status`,
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
    response,
    "Failed to update exam status"
  );
}


export async function deleteAdminExam(
  id
) {
  const response =
    await fetch(
      `${BASE_URL}/${id}`,
      {
        method: "DELETE",
      }
    );

  return handleResponse(
    response,
    "Failed to delete exam"
  );
}