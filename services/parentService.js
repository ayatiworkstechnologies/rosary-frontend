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

// =========================================================
// GET CHILD ATTENDANCE
// GET /parent/children/{studentId}/attendance
// =========================================================

export async function getParentChildAttendance(
  studentId,
  year,
  month
) {
  if (!studentId) {
    throw new Error(
      "Student ID is required."
    );
  }

  if (!year) {
    throw new Error(
      "Year is required."
    );
  }

  if (!month) {
    throw new Error(
      "Month is required."
    );
  }

  const response = await api.get(
    `/parent/children/${studentId}/attendance`,
    {
      params: {
        year,
        month,
      },
    }
  );

  return response.data;
}

// =========================================================
// GET CHILD HOMEWORK
// GET /parent/children/{studentId}/homework
// =========================================================

export async function getParentChildHomework(
  studentId,
  search = ""
) {
  if (!studentId) {
    throw new Error(
      "Student ID is required."
    );
  }

  const params = {};

  if (search.trim()) {
    params.search =
      search.trim();
  }

  const response = await api.get(
    `/parent/children/${studentId}/homework`,
    {
      params,
    }
  );

  return response.data;
}
// =========================================================
// GET CHILD RESULT EXAMS
// GET /parent/children/{studentId}/result-exams
// =========================================================

export async function getParentChildResultExams(
  studentId
) {
  if (!studentId) {
    throw new Error(
      "Student ID is required."
    );
  }

  const response = await api.get(
    `/parent/children/${studentId}/result-exams`
  );

  return response.data;
}


// =========================================================
// GET CHILD RESULTS
// GET /parent/children/{studentId}/results
// =========================================================

export async function getParentChildResults(
  studentId,
  examId
) {
  if (!studentId) {
    throw new Error(
      "Student ID is required."
    );
  }

  if (!examId) {
    throw new Error(
      "Exam ID is required."
    );
  }

  const response = await api.get(
    `/parent/children/${studentId}/results`,
    {
      params: {
        exam_id: examId,
      },
    }
  );

  return response.data;
}

// =========================================================
// GET CHILD EXAM SCHEDULE
// GET /parent/children/{studentId}/exam-schedule
// =========================================================

export async function getParentChildExamSchedule(
  studentId,
  examId = ""
) {
  if (!studentId) {
    throw new Error(
      "Student ID is required."
    );
  }

  const params = {};

  if (examId) {
    params.exam_id =
      examId;
  }

  const response = await api.get(
    `/parent/children/${studentId}/exam-schedule`,
    {
      params,
    }
  );

  return response.data;
}

// =========================================================
// GET PARENT CIRCULARS
// GET /parent/circulars
// =========================================================

export async function getParentCirculars(
  {
    studentId = "",
    category = "",
    search = "",
  } = {}
) {
  const params = {};

  if (studentId) {
    params.student_id =
      studentId;
  }

  if (category) {
    params.category =
      category;
  }

  if (search.trim()) {
    params.search =
      search.trim();
  }

  const response =
    await api.get(
      "/parent/circulars",
      {
        params,
      }
    );

  return response.data;
}
// =========================================================
// GET PARENT SCHOOL CALENDAR
// GET /parent/calendar
// =========================================================

export async function getParentSchoolCalendar(
  {
    studentId = "",
    eventType = "",
    search = "",
  } = {}
) {
  const params = {};


  if (studentId) {
    params.student_id =
      studentId;
  }


  if (eventType) {
    params.event_type =
      eventType;
  }


  if (search.trim()) {
    params.search =
      search.trim();
  }


  const response =
    await api.get(
      "/parent/calendar",
      {
        params,
      }
    );


  return response.data;
}

// =========================================================
// GET CHILD FEE INFORMATION
// GET /parent/children/{studentId}/fees
// =========================================================

export async function getParentChildFees(
  studentId,
  academicYear = ""
) {
  if (!studentId) {
    throw new Error(
      "Student ID is required."
    );
  }

  const params = {};

  if (academicYear) {
    params.academic_year =
      academicYear;
  }

  const response =
    await api.get(
      `/parent/children/${studentId}/fees`,
      {
        params,
      }
    );

  return response.data;
}

// =========================================================
// GET PARENT DOWNLOAD FORMS
// GET /parent/download-forms
// =========================================================

export async function getParentDownloadForms(
  {
    studentId = "",
    category = "",
    search = "",
  } = {}
) {
  const params = {};

  if (studentId) {
    params.student_id =
      studentId;
  }

  if (category) {
    params.category =
      category;
  }

  if (search.trim()) {
    params.search =
      search.trim();
  }

  const response =
    await api.get(
      "/parent/download-forms",
      {
        params,
      }
    );

  return response.data;
}

// =========================================================
// GET PARENT PROFILE
// GET /parent/profile
// =========================================================

export async function getParentProfile() {
  const response =
    await api.get(
      "/parent/profile"
    );

  return response.data;
}

// =========================================================
// GET PARENT DASHBOARD
// GET /parent/dashboard
// =========================================================

export async function getParentDashboard(
  studentId
) {
  if (!studentId) {
    throw new Error(
      "Student ID is required."
    );
  }

  const response =
    await api.get(
      "/parent/dashboard",
      {
        params: {
          student_id:
            studentId,
        },
      }
    );

  return response.data;
}