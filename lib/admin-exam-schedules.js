import api from "@/services/api";


// ======================================================
// GET ALL
// ======================================================

export async function getAdminExamSchedules(
  filters = {}
) {
  const params = {};

  if (filters.exam_id) {
    params.exam_id =
      filters.exam_id;
  }

  if (filters.class_id) {
    params.class_id =
      filters.class_id;
  }

  if (filters.subject) {
    params.subject =
      filters.subject;
  }

  const response =
    await api.get(
      "/admin/exam-schedules",
      {
        params,
      }
    );

  return response.data;
}


// ======================================================
// GET ONE
// ======================================================

export async function getAdminExamSchedule(
  scheduleId
) {
  if (!scheduleId) {
    throw new Error(
      "Schedule ID is required."
    );
  }

  const response =
    await api.get(
      `/admin/exam-schedules/${scheduleId}`
    );

  return response.data;
}


// ======================================================
// CREATE
// ======================================================

export async function createAdminExamSchedule(
  payload
) {
  if (!payload) {
    throw new Error(
      "Exam schedule data is required."
    );
  }

  const response =
    await api.post(
      "/admin/exam-schedules",
      payload
    );

  return response.data;
}


// ======================================================
// UPDATE
// ======================================================

export async function updateAdminExamSchedule(
  scheduleId,
  payload
) {
  if (!scheduleId) {
    throw new Error(
      "Schedule ID is required."
    );
  }

  if (!payload) {
    throw new Error(
      "Exam schedule data is required."
    );
  }

  const response =
    await api.put(
      `/admin/exam-schedules/${scheduleId}`,
      payload
    );

  return response.data;
}


// ======================================================
// DELETE
// ======================================================

export async function deleteAdminExamSchedule(
  scheduleId
) {
  if (!scheduleId) {
    throw new Error(
      "Schedule ID is required."
    );
  }

  const response =
    await api.delete(
      `/admin/exam-schedules/${scheduleId}`
    );

  return response.data;
}