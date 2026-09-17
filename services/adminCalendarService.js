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


// GET ALL EVENTS
export async function getAdminCalendarEvents(
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

  if (params.event_type) {
    searchParams.set(
      "event_type",
      params.event_type
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
    `${API_URL}/admin/calendar${
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
    "Unable to load school events"
  );
}


// GET SINGLE EVENT
export async function getAdminCalendarEvent(
  id
) {
  const response = await fetch(
    `${API_URL}/admin/calendar/${id}`,
    {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
    }
  );

  return handleResponse(
    response,
    "Unable to load school event"
  );
}


// CREATE EVENT
export async function createAdminCalendarEvent(
  data
) {
  const response = await fetch(
    `${API_URL}/admin/calendar`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );

  return handleResponse(
    response,
    "Unable to create school event"
  );
}


// UPDATE EVENT
export async function updateAdminCalendarEvent(
  id,
  data
) {
  const response = await fetch(
    `${API_URL}/admin/calendar/${id}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );

  return handleResponse(
    response,
    "Unable to update school event"
  );
}


// STATUS
export async function updateAdminCalendarEventStatus(
  id,
  isActive
) {
  const response = await fetch(
    `${API_URL}/admin/calendar/${id}/status`,
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
    "Unable to update event status"
  );
}


// DELETE
export async function deleteAdminCalendarEvent(
  id
) {
  const response = await fetch(
    `${API_URL}/admin/calendar/${id}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );

  return handleResponse(
    response,
    "Unable to delete school event"
  );
}