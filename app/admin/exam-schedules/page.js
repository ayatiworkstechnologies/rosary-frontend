"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarClock,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import AdminShell from "@/components/admin/AdminShell";

import {
  createAdminExamSchedule,
  deleteAdminExamSchedule,
  getAdminExamSchedules,
  updateAdminExamSchedule,
} from "@/lib/admin-exam-schedules";


// ======================================================
// API
// ======================================================

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "/backend/api/v1";

const EXAMS_API =
  `${API_URL}/admin/exams`;

const CLASSES_API =
  `${API_URL}/admin/classes`;


// ======================================================
// EMPTY FORM
// ======================================================

const EMPTY_FORM = {
  exam_id: "",
  class_id: "",
  subject: "",
  exam_date: "",
  start_time: "",
  end_time: "",
  room: "",
  instructions: "",
};


// ======================================================
// COMPONENT
// ======================================================

export default function AdminExamSchedulesPage() {
  const [
    schedules,
    setSchedules,
  ] = useState([]);

  const [
    exams,
    setExams,
  ] = useState([]);

  const [
    classes,
    setClasses,
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
    examFilter,
    setExamFilter,
  ] = useState("");

  const [
    classFilter,
    setClassFilter,
  ] = useState("");

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    editingSchedule,
    setEditingSchedule,
  ] = useState(null);

  const [
    form,
    setForm,
  ] = useState({
    ...EMPTY_FORM,
  });


  // ======================================================
  // NORMALIZE ARRAY
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
  // LOAD EXAMS + CLASSES
  // ======================================================

  useEffect(() => {
    let cancelled = false;

    const loadLookups =
      async () => {
        try {
          const [
            examData,
            classData,
          ] =
            await Promise.all([
              fetchJson(
                EXAMS_API
              ),

              fetchJson(
                CLASSES_API
              ),
            ]);

          if (cancelled) {
            return;
          }

          setExams(
            normalizeArray(
              examData,
              ["exams"]
            )
          );

          setClasses(
            normalizeArray(
              classData,
              ["classes"]
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
                "Unable to load exams or classes."
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
  // LOAD SCHEDULES
  // ======================================================

  const loadSchedules =
    async () => {
      try {
        setLoading(true);
        setError("");

        const filters = {};

        if (examFilter) {
          filters.exam_id =
            examFilter;
        }

        if (classFilter) {
          filters.class_id =
            classFilter;
        }

        if (search.trim()) {
          filters.subject =
            search.trim();
        }

        const data =
          await getAdminExamSchedules(
            filters
          );

        setSchedules(
          normalizeArray(
            data,
            ["schedules"]
          )
        );
      } catch (err) {
        console.error(
          "Schedule loading error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load exam schedules."
        );

        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };


  // ======================================================
  // AUTO FILTER
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

            if (examFilter) {
              filters.exam_id =
                examFilter;
            }

            if (classFilter) {
              filters.class_id =
                classFilter;
            }

            if (
              search.trim()
            ) {
              filters.subject =
                search.trim();
            }

            const data =
              await getAdminExamSchedules(
                filters
              );

            if (cancelled) {
              return;
            }

            setSchedules(
              normalizeArray(
                data,
                ["schedules"]
              )
            );
          } catch (err) {
            if (
              !cancelled
            ) {
              setError(
                err?.message ||
                  "Unable to load exam schedules."
              );

              setSchedules([]);
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
    examFilter,
    classFilter,
  ]);


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
  // ACTIVE CLASSES
  // ======================================================

  const classOptions =
    useMemo(() => {
      return classes.filter(
        (item) =>
          item.is_active !== false
      );
    }, [classes]);


  // ======================================================
  // CLASS NAME
  // ======================================================

  const getClassName = (
    item
  ) => {
    if (!item) {
      return "-";
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
      `Class ${item.id}`
    );
  };


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
  // ADD
  // ======================================================

  const openAddModal = () => {
    setEditingSchedule(null);

    setForm({
      ...EMPTY_FORM,
    });

    setError("");
    setSuccess("");

    setModalOpen(true);
  };


  // ======================================================
  // EDIT
  // ======================================================

  const openEditModal = (
    item
  ) => {
    setEditingSchedule(
      item
    );

    setForm({
      exam_id:
        String(
          item.exam_id ?? ""
        ),

      class_id:
        String(
          item.class_id ?? ""
        ),

      subject:
        item.subject || "",

      exam_date:
        item.exam_date || "",

      start_time:
        item.start_time
          ? item.start_time.slice(
              0,
              5
            )
          : "",

      end_time:
        item.end_time
          ? item.end_time.slice(
              0,
              5
            )
          : "",

      room:
        item.room || "",

      instructions:
        item.instructions ||
        "",
    });

    setError("");
    setSuccess("");

    setModalOpen(true);
  };


  // ======================================================
  // CLOSE
  // ======================================================

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);

    setEditingSchedule(
      null
    );

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

      if (!form.exam_id) {
        setError(
          "Please select an exam."
        );

        return;
      }

      if (!form.class_id) {
        setError(
          "Please select a class."
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

      if (!form.exam_date) {
        setError(
          "Exam date is required."
        );

        return;
      }

      if (!form.start_time) {
        setError(
          "Start time is required."
        );

        return;
      }

      if (!form.end_time) {
        setError(
          "End time is required."
        );

        return;
      }

      if (
        form.end_time <=
        form.start_time
      ) {
        setError(
          "End time must be after start time."
        );

        return;
      }

      const payload = {
        exam_id:
          Number(
            form.exam_id
          ),

        class_id:
          Number(
            form.class_id
          ),

        subject:
          form.subject.trim(),

        exam_date:
          form.exam_date,

        start_time:
          `${form.start_time}:00`,

        end_time:
          `${form.end_time}:00`,

        room:
          form.room.trim()
            ? form.room.trim()
            : null,

        instructions:
          form.instructions.trim()
            ? form.instructions.trim()
            : null,
      };

      try {
        setSaving(true);

        if (
          editingSchedule
        ) {
          await updateAdminExamSchedule(
            editingSchedule.id,
            payload
          );

          setSuccess(
            "Exam schedule updated successfully."
          );
        } else {
          await createAdminExamSchedule(
            payload
          );

          setSuccess(
            "Exam schedule added successfully."
          );
        }

        setModalOpen(false);

        setEditingSchedule(
          null
        );

        setForm({
          ...EMPTY_FORM,
        });

        await loadSchedules();
      } catch (err) {
        console.error(
          "Save schedule error:",
          err
        );

        setError(
          err?.message ||
            "Unable to save exam schedule."
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
          `Delete ${item.subject} exam schedule?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setError("");
        setSuccess("");

        await deleteAdminExamSchedule(
          item.id
        );

        setSuccess(
          "Exam schedule deleted successfully."
        );

        await loadSchedules();
      } catch (err) {
        setError(
          err?.message ||
            "Unable to delete schedule."
        );
      }
    };


  // ======================================================
  // FORMAT DATE
  // ======================================================

  const formatDate = (
    value
  ) => {
    if (!value) {
      return "-";
    }

    return new Date(
      `${value}T00:00:00`
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };


  // ======================================================
  // FORMAT TIME
  // ======================================================

  const formatTime = (
    value
  ) => {
    if (!value) {
      return "-";
    }

    const [
      hours,
      minutes,
    ] = value.split(":");

    const date =
      new Date();

    date.setHours(
      Number(hours),
      Number(minutes),
      0
    );

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };


  // ======================================================
  // RENDER
  // ======================================================

  return (
    <AdminShell>

      <div className="mx-auto max-w-[1500px]">


        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Exam Schedule
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage class-wise subject
              examination dates, times
              and rooms.
            </p>

          </div>


          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0075FF] px-5 text-sm font-semibold text-white transition hover:bg-[#0066de]"
          >

            <Plus size={18} />

            Add Schedule

          </button>

        </div>


        {/* SUCCESS */}

        {success && (

          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {success}
          </div>

        )}


        {/* ERROR */}

        {error &&
          !modalOpen && (

            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>

          )}


        {/* FILTERS */}

        <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">

          <div className="grid gap-3 lg:grid-cols-[2fr_1fr_1fr]">


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
                placeholder="Search subject..."
                className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-[#0075FF]"
              />

            </div>


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
                    {getClassName(
                      item
                    )}
                  </option>

                )
              )}

            </select>

          </div>

        </div>


        {/* TABLE */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {loading ? (

            <div className="flex min-h-[320px] flex-col items-center justify-center gap-3">

              <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-[#0075FF]" />

              <p className="text-sm text-slate-500">
                Loading schedules...
              </p>

            </div>

          ) : schedules.length === 0 ? (

            <div className="flex min-h-[350px] flex-col items-center justify-center p-8 text-center">

              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0075FF]">

                <CalendarClock
                  size={26}
                />

              </div>

              <h3 className="text-base font-bold text-slate-900">
                No schedules found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Create your first exam
                schedule.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1200px]">

                <thead>

                  <tr className="border-b border-slate-200 bg-slate-50">

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                      Exam
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                      Class
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                      Subject
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                      Date
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                      Time
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                      Room
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase text-slate-500">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {schedules.map(
                    (item) => (

                      <tr
                        key={item.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >


                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0075FF]">

                              <CalendarClock
                                size={19}
                              />

                            </div>

                            <div>

                              <p className="text-sm font-semibold text-slate-900">
                                {item.exam_name}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {item.academic_year}
                              </p>

                            </div>

                          </div>

                        </td>


                        <td className="px-5 py-4 text-sm text-slate-600">
                          {item.class_name}
                        </td>


                        <td className="px-5 py-4">

                          <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
                            {item.subject}
                          </span>

                        </td>


                        <td className="px-5 py-4 text-sm text-slate-600">
                          {formatDate(
                            item.exam_date
                          )}
                        </td>


                        <td className="px-5 py-4 text-sm text-slate-600">

                          {formatTime(
                            item.start_time
                          )}

                          {" - "}

                          {formatTime(
                            item.end_time
                          )}

                        </td>


                        <td className="px-5 py-4 text-sm text-slate-600">
                          {item.room || "-"}
                        </td>


                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  item
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-blue-50 hover:text-[#0075FF]"
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
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
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


      {/* MODAL */}

      {modalOpen && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">

          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">


            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">

              <div>

                <h2 className="text-lg font-bold text-slate-900">

                  {editingSchedule
                    ? "Edit Exam Schedule"
                    : "Add Exam Schedule"}

                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Set exam, class, subject,
                  date and time.
                </p>

              </div>


              <button
                type="button"
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500"
              >
                <X size={18} />
              </button>

            </div>


            <form
              onSubmit={handleSubmit}
              className="p-6"
            >


              {error && (

                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>

              )}


              <div className="grid gap-5 md:grid-cols-2">


                {/* EXAM */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Exam *
                  </label>

                  <select
                    name="exam_id"
                    value={form.exam_id}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3"
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
                        </option>

                      )
                    )}

                  </select>

                </div>


                {/* CLASS */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Class *
                  </label>

                  <select
                    name="class_id"
                    value={form.class_id}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3"
                  >

                    <option value="">
                      Select Class
                    </option>

                    {classOptions.map(
                      (item) => (

                        <option
                          key={item.id}
                          value={item.id}
                        >
                          {getClassName(
                            item
                          )}
                        </option>

                      )
                    )}

                  </select>

                </div>


                {/* SUBJECT */}

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Subject *
                  </label>

                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="Mathematics"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3"
                  />

                </div>


                {/* DATE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Exam Date *
                  </label>

                  <input
                    type="date"
                    name="exam_date"
                    value={form.exam_date}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3"
                  />

                </div>


                {/* ROOM */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Room
                  </label>

                  <input
                    type="text"
                    name="room"
                    value={form.room}
                    onChange={handleChange}
                    placeholder="Room 101"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3"
                  />

                </div>


                {/* START */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Start Time *
                  </label>

                  <input
                    type="time"
                    name="start_time"
                    value={form.start_time}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3"
                  />

                </div>


                {/* END */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    End Time *
                  </label>

                  <input
                    type="time"
                    name="end_time"
                    value={form.end_time}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3"
                  />

                </div>


                {/* INSTRUCTIONS */}

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Instructions
                  </label>

                  <textarea
                    name="instructions"
                    value={
                      form.instructions
                    }
                    onChange={handleChange}
                    rows={4}
                    placeholder="Enter exam instructions..."
                    className="w-full resize-none rounded-xl border border-slate-200 px-3 py-3"
                  />

                </div>

              </div>


              <div className="mt-7 flex justify-end gap-3 border-t border-slate-100 pt-5">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600"
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0075FF] px-5 text-sm font-semibold text-white disabled:opacity-50"
                >

                  {saving ? (
                    "Saving..."
                  ) : (
                    <>

                      {editingSchedule ? (
                        <Pencil
                          size={17}
                        />
                      ) : (
                        <Plus
                          size={17}
                        />
                      )}

                      {editingSchedule
                        ? "Update Schedule"
                        : "Save Schedule"}

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