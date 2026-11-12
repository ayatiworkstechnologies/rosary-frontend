import api from "@/services/api";

// Get the logged-in parent's email verification and notification status.
export async function getParentEmailPreferences() {
  const response = await api.get(
    "/parent/email-preferences"
  );
  return response.data;
}

// Request a verification email for the parent's registered address.
export async function requestParentEmailVerification() {
  const response = await api.post(
    "/parent/email-preferences/verification/request"
  );
  return response.data;
}

// Confirm ownership using the email verification token.
export async function confirmParentEmailVerification(token) {
  const normalizedToken = typeof token === "string" ? token.trim() : "";
  if (!normalizedToken) {
    throw new Error("Verification token is required.");
  }

  const response = await api.post(
    "/parent/email-preferences/verification/confirm",
    { token: normalizedToken }
  );
  return response.data;
}

// Enable or disable optional parent email notifications.
export async function updateParentEmailPreferences(enabled) {
  if (typeof enabled !== "boolean") {
    throw new Error("Email notification preference must be true or false.");
  }
  const response = await api.patch(
    "/parent/email-preferences",
    { email_notifications_enabled: enabled }
  );
  return response.data;
}

// Unsubscribe using the token supplied in an email link.
export async function unsubscribeParentEmail(token) {
  const normalizedToken = typeof token === "string" ? token.trim() : "";
  if (!normalizedToken) {
    throw new Error("Unsubscribe token is required.");
  }

  const response = await api.post(
    "/parent/email-preferences/unsubscribe",
    null,
    { params: { token: normalizedToken } }
  );
  return response.data;
}
