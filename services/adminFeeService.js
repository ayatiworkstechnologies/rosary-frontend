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
// GET ALL FEES
// ======================================================

export async function getAdminFees(
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

  if (params.student_id) {
    searchParams.set(
      "student_id",
      String(params.student_id)
    );
  }

  if (params.class_id) {
    searchParams.set(
      "class_id",
      String(params.class_id)
    );
  }

  if (params.academic_year) {
    searchParams.set(
      "academic_year",
      params.academic_year
    );
  }

  if (params.fee_type) {
    searchParams.set(
      "fee_type",
      params.fee_type
    );
  }

  if (params.payment_status) {
    searchParams.set(
      "payment_status",
      params.payment_status
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
    `${API_URL}/admin/fees${
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
    "Unable to load fees"
  );
}


// ======================================================
// GET SINGLE FEE
// ======================================================

export async function getAdminFee(id) {
  const response = await fetch(
    `${API_URL}/admin/fees/${id}`,
    {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
    }
  );

  return handleResponse(
    response,
    "Unable to load fee"
  );
}


// ======================================================
// CREATE
// ======================================================

export async function createAdminFee(
  data
) {
  const response = await fetch(
    `${API_URL}/admin/fees`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );

  return handleResponse(
    response,
    "Unable to create fee"
  );
}


// ======================================================
// UPDATE DETAILS
// ======================================================

export async function updateAdminFee(
  id,
  data
) {
  const response = await fetch(
    `${API_URL}/admin/fees/${id}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );

  return handleResponse(
    response,
    "Unable to update fee"
  );
}


// ======================================================
// UPDATE PAYMENT
// ======================================================

export async function updateAdminFeePayment(
  id,
  data
) {
  const response = await fetch(
    `${API_URL}/admin/fees/${id}/payment`,
    {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );

  return handleResponse(
    response,
    "Unable to update payment"
  );
}


// ======================================================
// ACTIVATE / DEACTIVATE
// ======================================================

export async function updateAdminFeeStatus(
  id,
  isActive
) {
  const response = await fetch(
    `${API_URL}/admin/fees/${id}/status`,
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
    "Unable to update fee status"
  );
}