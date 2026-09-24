"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Award,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import AdminShell from "@/components/admin/AdminShell";

import {
  createAdminResult,
  deleteAdminResult,
  getAdminResults,
  updateAdminResult,
} from "@/lib/admin-results";


// ======================================================
// API
// ======================================================

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "/backend/api/v1";

const STUDENTS_API =
  `${API_URL}/api/v1/admin/students`;

const CLASSES_API =
  `${API_URL}/api/v1/admin/classes`;

const EXAMS_API =
  `${API_URL}/admin/exams`;


// ======================================================
// EMPTY FORM
// ======================================================

const EMPTY_FORM = {
  student_id: "",
  exam_id: "",
  subject: "",
  max_marks: "100",
  obtained_marks: "",
  remarks: "",
};


// ======================================================
// COMPONENT
// ======================================================

export default function AdminResultsPage() {
  const [
    results,
    setResults,
  ] = useState([]);

  const [
    students,
    setStudents,
  ] = useState([]);

  const [
    classes,
    setClasses,
  ] = useState([]);

  const [
    exams,
    setExams,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    classFilter,
    setClassFilter,
  ] = useState("");

  const [
    examFilter,
    setExamFilter,
  ] = useState("");

  const [
    subjectFilter,
    setSubjectFilter,
  ] = useState("");

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    editingResult,
    setEditingResult,
  ] = useState(null);

  const [
    form,
    setForm,
  ] = useState({
    ...EMPTY_FORM,
  });


  // ======================================================
  // NORMALIZE API ARRAY
  // ======================================================

  const normalizeArray = (
    data,
    keys = []
  ) => {
    if (Array.isArray(data)) {
      return data;
    }

    for (const key of keys) {
      if (
        Array.isArray(
          data?.[key]
        )
      ) {
        return data[key];
      }
    }

    if (
      Array.isArray(
        data?.items
      )
    ) {
      return data.items;
    }

    return [];
  };


  // ======================================================
  // FETCH JSON
  // ======================================================

  const fetchJson = async (
    url
  ) => {
    const response =
      await fetch(
        url,
        {
          method: "GET",
          cache: "no-store",
        }
      );

    let data = null;

    try {
      data =
        await response.json();
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
  };


  // ======================================================
  // LOAD LOOKUP DATA
  // ======================================================

  useEffect(() => {
    let cancelled = false;

    const loadLookups =
      async () => {
        try {
          const [
            studentsData,
            classesData,
            examsData,
          ] =
            await Promise.all([
              fetchJson(
                STUDENTS_API
              ),

              fetchJson(
                CLASSES_API
              ),

              fetchJson(
                EXAMS_API
              ),
            ]);

          if (cancelled) {
            return;
          }

          setStudents(
            normalizeArray(
              studentsData,
              ["students"]
            )
          );

          setClasses(
            normalizeArray(
              classesData,
              ["classes"]
            )
          );

          setExams(
            normalizeArray(
              examsData,
              ["exams"]
            )
          );
        } catch (err) {
          console.error(
            "Lookup loading error:",
            err
          );

          if (!cancelled) {
            setError(
              err?.message ||
                "Unable to load students, classes or exams."
            );
          }
        }
      };

    loadLookups();

    return () => {
      cancelled = true;
    };
  }, []);


  // ======================================================
  // BUILD FILTERS
  // ======================================================

  const buildFilters = () => {
    const filters = {};

    if (search.trim()) {
      filters.search =
        search.trim();
    }

    if (classFilter) {
      filters.class_id =
        classFilter;
    }

    if (examFilter) {
      filters.exam_id =
        examFilter;
    }

    if (subjectFilter) {
      filters.subject =
        subjectFilter;
    }

    return filters;
  };


  // ======================================================
  // LOAD RESULTS
  // ======================================================

  const loadResults =
    async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getAdminResults(
            buildFilters()
          );

        setResults(
          normalizeArray(
            data,
            ["results"]
          )
        );
      } catch (err) {
        console.error(
          "Result loading error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load results."
        );

        setResults([]);
      } finally {
        setLoading(false);
      }
    };


  // ======================================================
  // AUTO LOAD WHEN FILTER CHANGES
  // ======================================================

  useEffect(() => {
    let cancelled = false;

    const timer =
      setTimeout(
        async () => {
          try {
            setLoading(true);
            setError("");

            const filters = {};

            if (
              search.trim()
            ) {
              filters.search =
                search.trim();
            }

            if (
              classFilter
            ) {
              filters.class_id =
                classFilter;
            }

            if (
              examFilter
            ) {
              filters.exam_id =
                examFilter;
            }

            if (
              subjectFilter
            ) {
              filters.subject =
                subjectFilter;
            }

            const data =
              await getAdminResults(
                filters
              );

            if (cancelled) {
              return;
            }

            setResults(
              normalizeArray(
                data,
                ["results"]
              )
            );
          } catch (err) {
            console.error(
              "Result loading error:",
              err
            );

            if (
              !cancelled
            ) {
              setError(
                err?.message ||
                  "Unable to load results."
              );

              setResults([]);
            }
          } finally {
            if (
              !cancelled
            ) {
              setLoading(
                false
              );
            }
          }
        },
        300
      );

    return () => {
      cancelled = true;

      clearTimeout(
        timer
      );
    };
  }, [
    search,
    classFilter,
    examFilter,
    subjectFilter,
  ]);


  // ======================================================
  // SUBJECT OPTIONS
  // ======================================================

  const subjects =
    useMemo(() => {
      const values =
        results
          .map(
            (item) =>
              item.subject
          )
          .filter(Boolean);

      return [
        ...new Set(values),
      ].sort();
    }, [results]);


  // ======================================================
  // ACTIVE STUDENTS
  // ======================================================

  const studentOptions =
    useMemo(() => {
      return students
        .filter(
          (student) =>
            student.is_active !==
            false
        )
        .sort(
          (a, b) =>
            (
              a.full_name ||
              ""
            ).localeCompare(
              b.full_name ||
                ""
            )
        );
    }, [students]);


  // ======================================================
  // ACTIVE EXAMS
  // ======================================================

  const examOptions =
    useMemo(() => {
      return exams.filter(
        (exam) =>
          exam.is_active !== false
      );
    }, [exams]);


  // ======================================================
  // CLASS NAME
  // ======================================================

  const getClassName = (
    classId
  ) => {
    if (!classId) {
      return "-";
    }

    const item =
      classes.find(
        (schoolClass) =>
          Number(
            schoolClass.id
          ) ===
          Number(classId)
      );

    if (!item) {
      return `Class ${classId}`;
    }

    if (
      item.name &&
      item.section
    ) {
      return `${item.name} - ${item.section}`;
    }

    return (
      item.name ||
      item.class_name ||
      item.display_name ||
      `Class ${classId}`
    );
  };


  // ======================================================
  // SELECTED STUDENT
  // ======================================================

  const selectedStudent =
    useMemo(() => {
      if (!form.student_id) {
        return null;
      }

      return (
        students.find(
          (student) =>
            Number(
              student.id
            ) ===
            Number(
              form.student_id
            )
        ) || null
      );
    }, [
      students,
      form.student_id,
    ]);


  // ======================================================
  // FORM CHANGE
  // ======================================================

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };


  // ======================================================
  // OPEN ADD
  // ======================================================

  const openAddModal = () => {
    setEditingResult(null);

    setForm({
      ...EMPTY_FORM,
    });

    setError("");
    setSuccess("");

    setModalOpen(true);
  };


  // ======================================================
  // OPEN EDIT
  // ======================================================

  const openEditModal = (
    item
  ) => {
    setEditingResult(item);

    setForm({
      student_id:
        String(
          item.student_id ??
            ""
        ),

      exam_id:
        String(
          item.exam_id ??
            ""
        ),

      subject:
        item.subject || "",

      max_marks:
        String(
          item.max_marks ??
            ""
        ),

      obtained_marks:
        String(
          item.obtained_marks ??
            ""
        ),

      remarks:
        item.remarks || "",
    });

    setError("");
    setSuccess("");

    setModalOpen(true);
  };


  // ======================================================
  // CLOSE MODAL
  // ======================================================

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);

    setEditingResult(null);

    setError("");

    setForm({
      ...EMPTY_FORM,
    });
  };


  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");
      setSuccess("");

      if (
        !form.student_id
      ) {
        setError(
          "Please select a student."
        );

        return;
      }

      if (
        !form.exam_id
      ) {
        setError(
          "Please select an exam."
        );

        return;
      }

      if (
        !form.subject.trim()
      ) {
        setError(
          "Subject is required."
        );

        return;
      }

      const maxMarks =
        Number(
          form.max_marks
        );

      const obtainedMarks =
        Number(
          form.obtained_marks
        );

      if (
        !Number.isFinite(
          maxMarks
        ) ||
        maxMarks <= 0
      ) {
        setError(
          "Maximum marks must be greater than zero."
        );

        return;
      }

      if (
        !Number.isFinite(
          obtainedMarks
        ) ||
        obtainedMarks < 0
      ) {
        setError(
          "Obtained marks cannot be negative."
        );

        return;
      }

      if (
        obtainedMarks >
        maxMarks
      ) {
        setError(
          "Obtained marks cannot exceed maximum marks."
        );

        return;
      }

      const payload = {
        student_id:
          Number(
            form.student_id
          ),

        exam_id:
          Number(
            form.exam_id
          ),

        subject:
          form.subject.trim(),

        max_marks:
          maxMarks,

        obtained_marks:
          obtainedMarks,

        remarks:
          form.remarks.trim()
            ? form.remarks.trim()
            : null,
      };

      try {
        setSaving(true);

        if (
          editingResult
        ) {
          await updateAdminResult(
            editingResult.id,
            payload
          );

          setSuccess(
            "Result updated successfully."
          );
        } else {
          await createAdminResult(
            payload
          );

          setSuccess(
            "Result added successfully."
          );
        }

        setModalOpen(false);

        setEditingResult(
          null
        );

        setForm({
          ...EMPTY_FORM,
        });

        await loadResults();
      } catch (err) {
        console.error(
          "Result save error:",
          err
        );

        setError(
          err?.message ||
            "Unable to save result."
        );
      } finally {
        setSaving(false);
      }
    };


  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete =
    async (item) => {
      const confirmed =
        window.confirm(
          `Are you sure you want to delete ${item.student_name}'s ${item.subject} result?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setError("");
        setSuccess("");

        await deleteAdminResult(
          item.id
        );

        setSuccess(
          "Result deleted successfully."
        );

        await loadResults();
      } catch (err) {
        console.error(
          "Result delete error:",
          err
        );

        setError(
          err?.message ||
            "Unable to delete result."
        );
      }
    };


  // ======================================================
  // GRADE STYLE
  // ======================================================

  const getGradeStyle = (
    grade
  ) => {
    switch (grade) {
      case "A+":
        return (
          "bg-emerald-50 " +
          "text-emerald-700"
        );

      case "A":
        return (
          "bg-green-50 " +
          "text-green-700"
        );

      case "B+":
        return (
          "bg-blue-50 " +
          "text-blue-700"
        );

      case "B":
        return (
          "bg-sky-50 " +
          "text-sky-700"
        );

      case "C":
        return (
          "bg-amber-50 " +
          "text-amber-700"
        );

      case "D":
        return (
          "bg-orange-50 " +
          "text-orange-700"
        );

      case "F":
        return (
          "bg-red-50 " +
          "text-red-700"
        );

      default:
        return (
          "bg-slate-100 " +
          "text-slate-600"
        );
    }
  };


  // ======================================================
  // RENDER
  // ======================================================

  return (
    <AdminShell>

      <div className="mx-auto max-w-[1500px]">


        {/* ============================================= */}
        {/* HEADER */}
        {/* ============================================= */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Results
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage student examination
              results, marks and grades.
            </p>

          </div>


          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0075FF] px-5 text-sm font-semibold text-white transition hover:bg-[#0066de]"
          >

            <Plus size={18} />

            Add Result

          </button>

        </div>


        {/* ============================================= */}
        {/* SUCCESS */}
        {/* ============================================= */}

        {success && (

          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">

            {success}

          </div>

        )}


        {/* ============================================= */}
        {/* ERROR */}
        {/* ============================================= */}

        {error &&
          !modalOpen && (

            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">

              {error}

            </div>

          )}


        {/* ============================================= */}
        {/* FILTERS */}
        {/* ============================================= */}

        <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">

          <div className="grid gap-3 lg:grid-cols-[2fr_1fr_1fr_1fr]">


            {/* SEARCH */}

            <div className="relative">

              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search student..."
                className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#0075FF]"
              />

            </div>


            {/* CLASS */}

            <select
              value={classFilter}
              onChange={(event) =>
                setClassFilter(
                  event.target.value
                )
              }
              className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#0075FF]"
            >

              <option value="">
                All Classes
              </option>

              {classes.map(
                (item) => (

                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                    {item.section
                      ? ` - ${item.section}`
                      : ""}
                  </option>

                )
              )}

            </select>


            {/* EXAM */}

            <select
              value={examFilter}
              onChange={(event) =>
                setExamFilter(
                  event.target.value
                )
              }
              className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#0075FF]"
            >

              <option value="">
                All Exams
              </option>

              {exams.map(
                (exam) => (

                  <option
                    key={exam.id}
                    value={exam.id}
                  >
                    {exam.name}
                  </option>

                )
              )}

            </select>


            {/* SUBJECT */}

            <select
              value={
                subjectFilter
              }
              onChange={(event) =>
                setSubjectFilter(
                  event.target.value
                )
              }
              className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#0075FF]"
            >

              <option value="">
                All Subjects
              </option>

              {subjects.map(
                (subject) => (

                  <option
                    key={subject}
                    value={subject}
                  >
                    {subject}
                  </option>

                )
              )}

            </select>

          </div>

        </div>


        {/* ============================================= */}
        {/* TABLE */}
        {/* ============================================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {loading ? (

            <div className="flex min-h-[320px] flex-col items-center justify-center gap-3">

              <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-[#0075FF]" />

              <p className="text-sm text-slate-500">
                Loading results...
              </p>

            </div>

          ) : results.length === 0 ? (

            <div className="flex min-h-[350px] flex-col items-center justify-center p-8 text-center">

              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0075FF]">

                <Award size={26} />

              </div>


              <h3 className="text-base font-bold text-slate-900">
                No results found
              </h3>


              <p className="mt-1 text-sm text-slate-500">
                No student results match
                your current filters.
              </p>


              <button
                type="button"
                onClick={openAddModal}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0075FF] px-4 py-2.5 text-sm font-semibold text-white"
              >

                <Plus size={17} />

                Add Result

              </button>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1200px]">

                <thead>

                  <tr className="border-b border-slate-200 bg-slate-50">


                    <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                      Student
                    </th>


                    <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                      Class
                    </th>


                    <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                      Exam
                    </th>


                    <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                      Subject
                    </th>


                    <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                      Marks
                    </th>


                    <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                      Percentage
                    </th>


                    <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                      Grade
                    </th>


                    <th className="px-5 py-4 text-right text-xs font-bold uppercase text-slate-500">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {results.map(
                    (item) => (

                      <tr
                        key={item.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >


                        {/* STUDENT */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0075FF]">

                              <Award
                                size={19}
                              />

                            </div>


                            <div className="min-w-0">

                              <p className="max-w-[220px] truncate text-sm font-semibold text-slate-900">

                                {item.student_name}

                              </p>


                              <p className="mt-1 text-xs text-slate-500">

                                {item.admission_no}

                                {item.roll_no
                                  ? ` • Roll ${item.roll_no}`
                                  : ""}

                              </p>

                            </div>

                          </div>

                        </td>


                        {/* CLASS */}

                        <td className="px-5 py-4 text-sm text-slate-600">

                          {item.class_name ||
                            getClassName(
                              item.class_id
                            )}

                        </td>


                        {/* EXAM */}

                        <td className="px-5 py-4">

                          <p className="text-sm font-medium text-slate-700">

                            {item.exam_name}

                          </p>


                          <p className="mt-1 text-xs text-slate-400">

                            {
                              item.academic_year
                            }

                          </p>

                        </td>


                        {/* SUBJECT */}

                        <td className="px-5 py-4">

                          <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700">

                            {item.subject}

                          </span>

                        </td>


                        {/* MARKS */}

                        <td className="px-5 py-4 text-sm font-semibold text-slate-700">

                          {Number(
                            item.obtained_marks
                          )}

                          <span className="font-normal text-slate-400">
                            {" "}
                            /{" "}
                            {Number(
                              item.max_marks
                            )}
                          </span>

                        </td>


                        {/* PERCENTAGE */}

                        <td className="px-5 py-4 text-sm text-slate-600">

                          {Number(
                            item.percentage ??
                              0
                          ).toFixed(2)}
                          %

                        </td>


                        {/* GRADE */}

                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex min-w-[42px] justify-center rounded-full px-3 py-1.5 text-xs font-bold ${getGradeStyle(
                              item.grade
                            )}`}
                          >

                            {item.grade ||
                              "-"}

                          </span>

                        </td>


                        {/* ACTIONS */}

                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-2">


                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  item
                                )
                              }
                              title="Edit"
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0075FF]"
                            >

                              <Pencil
                                size={16}
                              />

                            </button>


                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  item
                                )
                              }
                              title="Delete"
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            >

                              <Trash2
                                size={16}
                              />

                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>


      {/* ================================================= */}
      {/* ADD / EDIT MODAL */}
      {/* ================================================= */}

      {modalOpen && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">

          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">


            {/* ========================================= */}
            {/* MODAL HEADER */}
            {/* ========================================= */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 md:px-6">

              <div>

                <h2 className="text-lg font-bold text-slate-900">

                  {editingResult
                    ? "Edit Result"
                    : "Add Result"}

                </h2>


                <p className="mt-1 text-xs text-slate-500">

                  {editingResult
                    ? "Update the student's examination result."
                    : "Enter marks for a student examination."}

                </p>

              </div>


              <button
                type="button"
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              >

                <X size={18} />

              </button>

            </div>


            {/* ========================================= */}
            {/* FORM */}
            {/* ========================================= */}

            <form
              onSubmit={
                handleSubmit
              }
              className="p-5 md:p-6"
            >


              {error && (

                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                  {error}

                </div>

              )}


              <div className="grid gap-5 md:grid-cols-2">


                {/* STUDENT */}

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-semibold text-slate-700">

                    Student

                    <span className="text-red-500">
                      *
                    </span>

                  </label>


                  <select
                    name="student_id"
                    value={
                      form.student_id
                    }
                    onChange={
                      handleChange
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-[#0075FF]"
                  >

                    <option value="">
                      Select Student
                    </option>

                    {studentOptions.map(
                      (student) => (

                        <option
                          key={
                            student.id
                          }
                          value={
                            student.id
                          }
                        >

                          {student.full_name}

                          {" — "}

                          {
                            student.admission_no
                          }

                          {student.class_id
                            ? ` — ${getClassName(
                                student.class_id
                              )}`
                            : ""}

                        </option>

                      )
                    )}

                  </select>


                  {selectedStudent && (

                    <p className="mt-2 text-xs text-slate-500">

                      Class:{" "}

                      <span className="font-semibold text-slate-700">

                        {getClassName(
                          selectedStudent.class_id
                        )}

                      </span>

                    </p>

                  )}

                </div>


                {/* EXAM */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">

                    Exam

                    <span className="text-red-500">
                      *
                    </span>

                  </label>


                  <select
                    name="exam_id"
                    value={
                      form.exam_id
                    }
                    onChange={
                      handleChange
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-[#0075FF]"
                  >

                    <option value="">
                      Select Exam
                    </option>

                    {examOptions.map(
                      (exam) => (

                        <option
                          key={exam.id}
                          value={exam.id}
                        >

                          {exam.name}

                          {exam.academic_year
                            ? ` — ${exam.academic_year}`
                            : ""}

                        </option>

                      )
                    )}

                  </select>

                </div>


                {/* SUBJECT */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">

                    Subject

                    <span className="text-red-500">
                      *
                    </span>

                  </label>


                  <input
                    type="text"
                    name="subject"
                    value={
                      form.subject
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Mathematics"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-[#0075FF] focus:ring-2 focus:ring-blue-100"
                  />

                </div>


                {/* MAX MARKS */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">

                    Maximum Marks

                    <span className="text-red-500">
                      *
                    </span>

                  </label>


                  <input
                    type="number"
                    name="max_marks"
                    value={
                      form.max_marks
                    }
                    onChange={
                      handleChange
                    }
                    min="0.01"
                    step="0.01"
                    placeholder="100"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-[#0075FF] focus:ring-2 focus:ring-blue-100"
                  />

                </div>


                {/* OBTAINED MARKS */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">

                    Obtained Marks

                    <span className="text-red-500">
                      *
                    </span>

                  </label>


                  <input
                    type="number"
                    name="obtained_marks"
                    value={
                      form.obtained_marks
                    }
                    onChange={
                      handleChange
                    }
                    min="0"
                    max={
                      form.max_marks ||
                      undefined
                    }
                    step="0.01"
                    placeholder="85"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-[#0075FF] focus:ring-2 focus:ring-blue-100"
                  />

                </div>


                {/* GRADE INFO */}

                <div className="md:col-span-2 rounded-xl border border-blue-100 bg-blue-50/60 p-4">

                  <p className="text-sm font-semibold text-slate-700">
                    Grade Calculation
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Grade is calculated
                    automatically from obtained
                    marks and maximum marks when
                    the result is saved.
                  </p>

                </div>


                {/* REMARKS */}

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Remarks
                  </label>


                  <textarea
                    name="remarks"
                    value={
                      form.remarks
                    }
                    onChange={
                      handleChange
                    }
                    rows={4}
                    placeholder="Optional remarks..."
                    className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none transition focus:border-[#0075FF] focus:ring-2 focus:ring-blue-100"
                  />

                </div>

              </div>


              {/* ========================================= */}
              {/* BUTTONS */}
              {/* ========================================= */}

              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">


                <button
                  type="button"
                  disabled={saving}
                  onClick={
                    closeModal
                  }
                  className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >

                  Cancel

                </button>


                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0075FF] px-5 text-sm font-semibold text-white transition hover:bg-[#0066de] disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {saving ? (
                    <>

                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      Saving...

                    </>
                  ) : (
                    <>

                      {editingResult ? (
                        <Pencil
                          size={17}
                        />
                      ) : (
                        <Plus
                          size={17}
                        />
                      )}

                      {editingResult
                        ? "Update Result"
                        : "Save Result"}

                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </AdminShell>
  );
}