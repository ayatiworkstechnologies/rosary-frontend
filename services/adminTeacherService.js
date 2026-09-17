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


// ======================================================
// TEACHERS
// ======================================================

export async function getAdminTeachers() {
  const response = await fetch(
    `${API_URL}/admin/teachers`,
    {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
    }
  );

  return handleResponse(
    response,
    "Unable to load teachers"
  );
}


export async function getAdminTeacher(id) {
  const response = await fetch(
    `${API_URL}/admin/teachers/${id}`,
    {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
    }
  );

  return handleResponse(
    response,
    "Unable to load teacher"
  );
}


export async function createAdminTeacher(
  data
) {
  const response = await fetch(
    `${API_URL}/admin/teachers`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );

  return handleResponse(
    response,
    "Unable to create teacher"
  );
}


export async function updateAdminTeacher(
  id,
  data
) {
  const response = await fetch(
    `${API_URL}/admin/teachers/${id}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );

  return handleResponse(
    response,
    "Unable to update teacher"
  );
}


export async function updateAdminTeacherStatus(
  id,
  isActive
) {
  const response = await fetch(
    `${API_URL}/admin/teachers/${id}/status`,
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
    "Unable to update teacher status"
  );
}


export async function updateAdminTeacherPassword(
  id,
  password
) {
  const response = await fetch(
    `${API_URL}/admin/teachers/${id}/password`,
    {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({
        password,
      }),
    }
  );

  return handleResponse(
    response,
    "Unable to update teacher password"
  );
}


// ======================================================
// TEACHER CLASSES
// ======================================================

export async function getAdminTeacherClasses(
  teacherId
) {
  const response = await fetch(
    `${API_URL}/admin/teachers/${teacherId}/classes`,
    {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
    }
  );

  return handleResponse(
    response,
    "Unable to load teacher classes"
  );
}


export async function assignAdminTeacherClass(
  teacherId,
  data
) {
  const response = await fetch(
    `${API_URL}/admin/teachers/${teacherId}/classes`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );

  return handleResponse(
    response,
    "Unable to assign class"
  );
}


export async function updateAdminTeacherClass(
  teacherId,
  assignmentId,
  data
) {
  const response = await fetch(
    `${API_URL}/admin/teachers/${teacherId}/classes/${assignmentId}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );

  return handleResponse(
    response,
    "Unable to update class assignment"
  );
}


export async function removeAdminTeacherClass(
  teacherId,
  assignmentId
) {
  const response = await fetch(
    `${API_URL}/admin/teachers/${teacherId}/classes/${assignmentId}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );

  return handleResponse(
    response,
    "Unable to remove class assignment"
  );
}