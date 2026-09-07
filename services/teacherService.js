import api from "@/services/api";


// =========================================================
// GET TEACHER CLASSES
// GET /api/v1/teacher/classes
// =========================================================
export async function getTeacherClasses() {
  const response = await api.get(
    "/teacher/classes"
  );

  return response.data;
}


// =========================================================
// GET STUDENTS FOR A CLASS
// GET /api/v1/teacher/classes/{classId}/students
// Optional search query
// =========================================================
export async function getTeacherStudents(
  classId,
  search = ""
) {
  if (!classId) {
    throw new Error(
      "Class ID is required."
    );
  }

  const params = {};

  if (search.trim()) {
    params.search = search.trim();
  }

  const response = await api.get(
    `/teacher/classes/${classId}/students`,
    {
      params,
    }
  );

  return response.data;
}


// =========================================================
// GET ATTENDANCE FOR A CLASS + DATE
// GET /api/v1/teacher/classes/{classId}/attendance
// =========================================================
export async function getTeacherAttendance(
  classId,
  attendanceDate
) {
  if (!classId) {
    throw new Error(
      "Class ID is required."
    );
  }

  if (!attendanceDate) {
    throw new Error(
      "Attendance date is required."
    );
  }

  const response = await api.get(
    `/teacher/classes/${classId}/attendance`,
    {
      params: {
        attendance_date: attendanceDate,
      },
    }
  );

  return response.data;
}


// =========================================================
// SAVE ATTENDANCE
// POST /api/v1/teacher/classes/{classId}/attendance
// =========================================================
export async function saveTeacherAttendance(
  classId,
  payload
) {
  if (!classId) {
    throw new Error(
      "Class ID is required."
    );
  }

  if (!payload) {
    throw new Error(
      "Attendance payload is required."
    );
  }

  const response = await api.post(
    `/teacher/classes/${classId}/attendance`,
    payload
  );

  return response.data;
}

// =========================================================
// GET HOMEWORK
// GET /teacher/classes/{classId}/homework
// =========================================================

export async function getTeacherHomework(
  classId
) {
  if (!classId) {
    throw new Error(
      "Class ID is required."
    );
  }

  const response = await api.get(
    `/teacher/classes/${classId}/homework`
  );

  return response.data;
}


// =========================================================
// CREATE HOMEWORK
// POST /teacher/classes/{classId}/homework
// =========================================================

export async function createTeacherHomework(
  classId,
  payload
) {
  if (!classId) {
    throw new Error(
      "Class ID is required."
    );
  }

  if (!payload) {
    throw new Error(
      "Homework data is required."
    );
  }

  const response = await api.post(
    `/teacher/classes/${classId}/homework`,
    payload
  );

  return response.data;
}

// =========================================================
// GET TEACHER EXAMS
// =========================================================

export async function getTeacherExams() {
  const response = await api.get(
    "/teacher/exams"
  );

  return response.data;
}


// =========================================================
// GET CLASS RESULTS
// =========================================================

export async function getTeacherResults(
  classId,
  examId,
  subject
) {
  if (!classId) {
    throw new Error(
      "Class ID is required."
    );
  }

  if (!examId) {
    throw new Error(
      "Exam ID is required."
    );
  }

  if (!subject) {
    throw new Error(
      "Subject is required."
    );
  }

  const response = await api.get(
    `/teacher/classes/${classId}/results`,
    {
      params: {
        exam_id: examId,
        subject,
      },
    }
  );

  return response.data;
}


// =========================================================
// SAVE CLASS RESULTS
// =========================================================

export async function saveTeacherResults(
  classId,
  payload
) {
  if (!classId) {
    throw new Error(
      "Class ID is required."
    );
  }

  if (!payload) {
    throw new Error(
      "Result data is required."
    );
  }

  const response = await api.post(
    `/teacher/classes/${classId}/results`,
    payload
  );

  return response.data;
}