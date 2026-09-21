const API_BASE_URL =
  process.env.NEXT_PUBLIC_ROSARY_API_URL ||
  "http://127.0.0.1:8000";

const BASE_URL =
  `${API_BASE_URL}/api/v1/admin/exam-schedules`;


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
// GET ALL
// ======================================================

export async function getAdminExamSchedules(
  filters = {}
) {
  const params =
    new URLSearchParams();

  if (filters.exam_id) {
    params.append(
      "exam_id",
      filters.exam_id
    );
  }

  if (filters.class_id) {
    params.append(
      "class_id",
      filters.class_id
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
// GET ONE
// ======================================================

export async function getAdminExamSchedule(
  scheduleId
) {
  const response =
    await fetch(
      `${BASE_URL}/${scheduleId}`,
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
// CREATE
// ======================================================

export async function createAdminExamSchedule(
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
// UPDATE
// ======================================================

export async function updateAdminExamSchedule(
  scheduleId,
  payload
) {
  const response =
    await fetch(
      `${BASE_URL}/${scheduleId}`,
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
// DELETE
// ======================================================

export async function deleteAdminExamSchedule(
  scheduleId
) {
  const response =
    await fetch(
      `${BASE_URL}/${scheduleId}`,
      {
        method: "DELETE",
      }
    );

  return handleResponse(
    response
  );
}