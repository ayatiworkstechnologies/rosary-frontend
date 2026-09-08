import api from "@/services/api";


// =========================================================
// GET MY CHILDREN
// GET /parent/children
// =========================================================

export async function getParentChildren() {
  const response = await api.get(
    "/parent/children"
  );

  return response.data;
}


// =========================================================
// GET ONE CHILD
// GET /parent/children/{studentId}
// =========================================================

export async function getParentChild(
  studentId
) {
  if (!studentId) {
    throw new Error(
      "Student ID is required."
    );
  }

  const response = await api.get(
    `/parent/children/${studentId}`
  );

  return response.data;
}