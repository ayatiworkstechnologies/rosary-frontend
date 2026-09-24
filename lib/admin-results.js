const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "/backend/api/v1";

const BASE_URL =
  `${API_URL}/admin/results`;


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
// GET RESULTS
// ======================================================

export async function getAdminResults(
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

  if (filters.class_id) {
    params.append(
      "class_id",
      filters.class_id
    );
  }

  if (filters.exam_id) {
    params.append(
      "exam_id",
      filters.exam_id
    );
  }

  if (filters.subject) {
    params.append(
      "subject",
      filters.subject
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
// GET SINGLE RESULT
// ======================================================

export async function getAdminResult(
  resultId
) {
  const response =
    await fetch(
      `${BASE_URL}/${resultId}`,
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
// CREATE RESULT
// ======================================================

export async function createAdminResult(
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
// UPDATE RESULT
// ======================================================

export async function updateAdminResult(
  resultId,
  payload
) {
  const response =
    await fetch(
      `${BASE_URL}/${resultId}`,
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
// DELETE RESULT
// ======================================================

export async function deleteAdminResult(
  resultId
) {
  const response =
    await fetch(
      `${BASE_URL}/${resultId}`,
      {
        method: "DELETE",
      }
    );

  return handleResponse(
    response
  );
}