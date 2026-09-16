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

// GET ALL STUDENTS
export async function getAdminStudents(
  params = {}
) {
  const query = new URLSearchParams();

  if (params.search) {
    query.set("search", params.search);
  }

  if (params.class_id) {
    query.set(
      "class_id",
      params.class_id
    );
  }

  if (
    params.is_active !== undefined &&
    params.is_active !== ""
  ) {
    query.set(
      "is_active",
      params.is_active
    );
  }

  const queryString =
    query.toString();

  const url = queryString
    ? `${API_URL}/admin/students?${queryString}`
    : `${API_URL}/admin/students`;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
    cache: "no-store",
  });

  return handleResponse(
    response,
    "Unable to load students"
  );
}

// GET SINGLE STUDENT
export async function getAdminStudent(id) {
  const response = await fetch(
    `${API_URL}/admin/students/${id}`,
    {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
    }
  );

  return handleResponse(
    response,
    "Unable to load student"
  );
}

// CREATE
export async function createAdminStudent(
  data
) {
  const response = await fetch(
    `${API_URL}/admin/students`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );

  return handleResponse(
    response,
    "Unable to create student"
  );
}

// UPDATE
export async function updateAdminStudent(
  id,
  data
) {
  const response = await fetch(
    `${API_URL}/admin/students/${id}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );

  return handleResponse(
    response,
    "Unable to update student"
  );
}

// ACTIVATE / DEACTIVATE
export async function updateAdminStudentStatus(
  id,
  isActive
) {
  const response = await fetch(
    `${API_URL}/admin/students/${id}/status`,
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
    "Unable to update student status"
  );
}