"use client";

import { useSearchParams } from "next/navigation";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  ChevronDown,
  Clock3,
  GraduationCap,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  createTeacherExamSchedule,
  deleteTeacherExamSchedule,
  getTeacherClasses,
  getTeacherExams,
  getTeacherExamSchedule,
  updateTeacherExamSchedule,
} from "@/services/teacherService";


// =========================================================
// CONSTANTS
// =========================================================

const EMPTY_FORM = {
  class_id: "",
  exam_id: "",
  subject: "",
  exam_date: "",
  start_time: "",
  end_time: "",
  room: "",
  instructions: "",
};


const inputClass = `
  h-11
  w-full
  rounded-xl
  border
  border-[#DCE8F5]
  bg-white
  px-4
  text-sm
  text-[#0B3A67]
  outline-none
  transition
  focus:border-[#0075FF]
  focus:ring-2
  focus:ring-blue-100
  disabled:cursor-not-allowed
  disabled:bg-slate-50
  disabled:text-slate-500
`;


// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(dateString) {
  if (!dateString) {
    return "--";
  }

  const date = new Date(
    `${dateString}T00:00:00`
  );

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      weekday: "short",
    }
  );
}


// =========================================================
// FORMAT TIME
// =========================================================

function formatTime(value) {
  if (!value) {
    return "--";
  }

  const cleanValue =
    String(value).slice(
      0,
      5
    );

  const [
    hours,
    minutes,
  ] = cleanValue.split(":");

  const date =
    new Date();

  date.setHours(
    Number(hours)
  );

  date.setMinutes(
    Number(minutes)
  );

  return date.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  );
}


// =========================================================
// ERROR MESSAGE
// =========================================================

function getErrorMessage(
  error,
  fallback
) {
  const detail =
    error?.response
      ?.data?.detail;

  if (
    typeof detail ===
    "string"
  ) {
    return detail;
  }

  if (
    Array.isArray(detail)
  ) {
    return detail
      .map(
        (item) =>
          item?.msg ||
          JSON.stringify(
            item
          )
      )
      .join(", ");
  }

  return (
    error?.message ||
    fallback
  );
}


// =========================================================
// PAGE
// =========================================================

export default function TeacherExamSchedulePage() {
  const searchParams =
    useSearchParams();


  // =======================================================
  // STATE
  // =======================================================

  const [
    classes,
    setClasses,
  ] = useState([]);

  const [
    exams,
    setExams,
  ] = useState([]);

  const [
    selectedClassId,
    setSelectedClassId,
  ] = useState("");

  const [
    selectedExamId,
    setSelectedExamId,
  ] = useState("");

  const [
    schedules,
    setSchedules,
  ] = useState([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    initialLoading,
    setInitialLoading,
  ] = useState(true);

  const [
    scheduleLoading,
    setScheduleLoading,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
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

  const [
    refreshKey,
    setRefreshKey,
  ] = useState(0);


  // =======================================================
  // UNIQUE CLASSES
  // =======================================================

  const uniqueClasses =
    useMemo(() => {
      const map =
        new Map();

      classes.forEach(
        (item) => {
          const classId =
            item?.id ??
            item?.class_id;

          if (
            classId ===
              undefined ||
            classId ===
              null
          ) {
            return;
          }

          const key =
            String(
              classId
            );

          if (
            !map.has(key)
          ) {
            map.set(
              key,
              {
                ...item,
                id: classId,
              }
            );
          }
        }
      );

      return Array.from(
        map.values()
      );
    }, [classes]);


  // =======================================================
  // SELECTED CLASS SUBJECTS
  // =======================================================

  const subjectsForSelectedClass =
    useMemo(() => {
      if (
        !selectedClassId
      ) {
        return [];
      }

      const values = [];

      classes
        .filter(
          (item) =>
            String(
              item?.id ??
                item?.class_id
            ) ===
            String(
              selectedClassId
            )
        )
        .forEach(
          (item) => {
            if (
              item?.subject
            ) {
              values.push(
                String(
                  item.subject
                ).trim()
              );
            }

            if (
              Array.isArray(
                item?.subjects
              )
            ) {
              item.subjects.forEach(
                (subject) => {
                  if (
                    typeof subject ===
                    "string"
                  ) {
                    values.push(
                      subject.trim()
                    );
                  } else if (
                    subject?.name
                  ) {
                    values.push(
                      String(
                        subject.name
                      ).trim()
                    );
                  }
                }
              );
            }
          }
        );

      return [
        ...new Set(
          values.filter(
            Boolean
          )
        ),
      ].sort(
        (a, b) =>
          a.localeCompare(b)
      );

    }, [
      classes,
      selectedClassId,
    ]);


  // =======================================================
  // MODAL SUBJECTS
  // =======================================================

  const modalSubjects =
    useMemo(() => {
      if (
        !form.class_id
      ) {
        return [];
      }

      const values = [];

      classes
        .filter(
          (item) =>
            String(
              item?.id ??
                item?.class_id
            ) ===
            String(
              form.class_id
            )
        )
        .forEach(
          (item) => {
            if (
              item?.subject
            ) {
              values.push(
                String(
                  item.subject
                ).trim()
              );
            }

            if (
              Array.isArray(
                item?.subjects
              )
            ) {
              item.subjects.forEach(
                (subject) => {
                  if (
                    typeof subject ===
                    "string"
                  ) {
                    values.push(
                      subject.trim()
                    );
                  } else if (
                    subject?.name
                  ) {
                    values.push(
                      String(
                        subject.name
                      ).trim()
                    );
                  }
                }
              );
            }
          }
        );

      if (
        editingSchedule
          ?.subject
      ) {
        values.push(
          editingSchedule
            .subject
        );
      }

      return [
        ...new Set(
          values.filter(
            Boolean
          )
        ),
      ].sort(
        (a, b) =>
          a.localeCompare(b)
      );

    }, [
      classes,
      form.class_id,
      editingSchedule,
    ]);


  // =======================================================
  // INITIAL DATA
  // =======================================================

  useEffect(() => {
    let cancelled =
      false;

    async function fetchInitialData() {
      try {
        const [
          classData,
          examData,
        ] =
          await Promise.all([
            getTeacherClasses(),
            getTeacherExams(),
          ]);

        if (
          cancelled
        ) {
          return;
        }

        const safeClasses =
          Array.isArray(
            classData
          )
            ? classData
            : [];

        const safeExams =
          Array.isArray(
            examData
          )
            ? examData
            : [];

        setClasses(
          safeClasses
        );

        setExams(
          safeExams
        );


        // -----------------------------------------------
        // CLASS FROM URL
        // -----------------------------------------------

        const queryClassId =
          searchParams.get(
            "class_id"
          );

        const availableIds =
          safeClasses.map(
            (item) =>
              String(
                item?.id ??
                  item?.class_id
              )
          );

        if (
          queryClassId &&
          availableIds.includes(
            String(
              queryClassId
            )
          )
        ) {
          setSelectedClassId(
            String(
              queryClassId
            )
          );

        } else if (
          safeClasses.length >
          0
        ) {
          setSelectedClassId(
            String(
              safeClasses[0]
                ?.id ??
                safeClasses[0]
                  ?.class_id
            )
          );
        }


        // -----------------------------------------------
        // DEFAULT EXAM
        // -----------------------------------------------

        if (
          safeExams.length >
          0
        ) {
          setSelectedExamId(
            String(
              safeExams[0].id
            )
          );
        }

        setError("");

      } catch (err) {
        if (
          cancelled
        ) {
          return;
        }

        console.error(
          "Initial data error:",
          err
        );

        setError(
          getErrorMessage(
            err,
            "Unable to load exam schedule filters."
          )
        );

      } finally {
        if (
          !cancelled
        ) {
          setInitialLoading(
            false
          );
        }
      }
    }

    fetchInitialData();

    return () => {
      cancelled =
        true;
    };

  }, [searchParams]);


  // =======================================================
  // LOAD SCHEDULE
  //
  // IMPORTANT:
  // No loadSchedule() helper.
  // No synchronous setSchedules() in effect body.
  // =======================================================

  useEffect(() => {
    if (
      !selectedClassId
    ) {
      return;
    }

    let cancelled =
      false;

    async function fetchSchedule() {
      try {
        // This is inside async execution,
        // not directly in the effect body.
        setScheduleLoading(
          true
        );

        const data =
          await getTeacherExamSchedule(
            {
              classId:
                selectedClassId,

              examId:
                selectedExamId,
            }
          );

        if (
          cancelled
        ) {
          return;
        }

        const safeSchedules =
          Array.isArray(
            data?.schedules
          )
            ? data.schedules
            : [];

        setSchedules(
          safeSchedules
        );

        setError("");

      } catch (err) {
        if (
          cancelled
        ) {
          return;
        }

        console.error(
          "Schedule loading error:",
          err
        );

        setSchedules([]);

        setError(
          getErrorMessage(
            err,
            "Unable to load exam schedule."
          )
        );

      } finally {
        if (
          !cancelled
        ) {
          setScheduleLoading(
            false
          );
        }
      }
    }

    fetchSchedule();

    return () => {
      cancelled =
        true;
    };

  }, [
    selectedClassId,
    selectedExamId,
    refreshKey,
  ]);


  // =======================================================
  // FILTER SCHEDULE
  // =======================================================

  const filteredSchedules =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (
        !value
      ) {
        return schedules;
      }

      return schedules.filter(
        (item) => {
          const subject =
            String(
              item?.subject ||
                ""
            ).toLowerCase();

          const examName =
            String(
              item?.exam_name ||
                ""
            ).toLowerCase();

          const className =
            String(
              item?.name ||
                item?.class_name ||
                ""
            ).toLowerCase();

          const room =
            String(
              item?.room ||
                ""
            ).toLowerCase();

          return (
            subject.includes(
              value
            ) ||
            examName.includes(
              value
            ) ||
            className.includes(
              value
            ) ||
            room.includes(
              value
            )
          );
        }
      );

    }, [
      schedules,
      search,
    ]);


  // =======================================================
  // ADD MODAL
  // =======================================================

  function openAddModal() {
    setEditingSchedule(
      null
    );

    setError("");
    setSuccess("");

    const defaultSubject =
      subjectsForSelectedClass
        .length === 1
        ? subjectsForSelectedClass[
            0
          ]
        : "";

    setForm({
      ...EMPTY_FORM,

      class_id:
        selectedClassId,

      exam_id:
        selectedExamId,

      subject:
        defaultSubject,
    });

    setModalOpen(
      true
    );
  }


  // =======================================================
  // EDIT MODAL
  // =======================================================

  function openEditModal(
    item
  ) {
    setEditingSchedule(
      item
    );

    setError("");
    setSuccess("");

    setForm({
      class_id:
        String(
          item?.class_id ??
            selectedClassId
        ),

      exam_id:
        String(
          item?.exam_id ??
            selectedExamId
        ),

      subject:
        item?.subject ||
        "",

      exam_date:
        item?.exam_date ||
        "",

      start_time:
        item?.start_time
          ? String(
              item.start_time
            ).slice(
              0,
              5
            )
          : "",

      end_time:
        item?.end_time
          ? String(
              item.end_time
            ).slice(
              0,
              5
            )
          : "",

      room:
        item?.room ||
        "",

      instructions:
        item?.instructions ||
        "",
    });

    setModalOpen(
      true
    );
  }


  // =======================================================
  // CLOSE MODAL
  // =======================================================

  function closeModal() {
    if (
      saving
    ) {
      return;
    }

    setModalOpen(
      false
    );

    setEditingSchedule(
      null
    );

    setForm({
      ...EMPTY_FORM,
    });

    setError("");
  }


  // =======================================================
  // FORM CHANGE
  // =======================================================

  function handleFormChange(
    event
  ) {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (previous) => ({
        ...previous,
        [name]:
          value,
      })
    );
  }


  // =======================================================
  // CLASS CHANGE INSIDE MODAL
  // =======================================================

  function handleModalClassChange(
    event
  ) {
    const classId =
      event.target.value;

    const values = [];

    classes
      .filter(
        (item) =>
          String(
            item?.id ??
              item?.class_id
          ) ===
          String(
            classId
          )
      )
      .forEach(
        (item) => {
          if (
            item?.subject
          ) {
            values.push(
              String(
                item.subject
              ).trim()
            );
          }

          if (
            Array.isArray(
              item?.subjects
            )
          ) {
            item.subjects.forEach(
              (subject) => {
                if (
                  typeof subject ===
                  "string"
                ) {
                  values.push(
                    subject.trim()
                  );
                } else if (
                  subject?.name
                ) {
                  values.push(
                    String(
                      subject.name
                    ).trim()
                  );
                }
              }
            );
          }
        }
      );

    const uniqueSubjects =
      [
        ...new Set(
          values.filter(
            Boolean
          )
        ),
      ];

    setForm(
      (previous) => ({
        ...previous,

        class_id:
          classId,

        subject:
          uniqueSubjects
            .length === 1
            ? uniqueSubjects[
                0
              ]
            : "",
      })
    );
  }


  // =======================================================
  // SAVE
  // =======================================================

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");


    // -----------------------------------------------
    // VALIDATION
    // -----------------------------------------------

    if (
      !form.class_id
    ) {
      setError(
        "Class is required."
      );

      return;
    }

    if (
      !form.exam_id
    ) {
      setError(
        "Examination is required."
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

    if (
      !form.exam_date
    ) {
      setError(
        "Exam date is required."
      );

      return;
    }

    if (
      !form.start_time
    ) {
      setError(
        "Start time is required."
      );

      return;
    }

    if (
      !form.end_time
    ) {
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


    // -----------------------------------------------
    // CREATE PAYLOAD
    // -----------------------------------------------

    const createPayload = {
      class_id:
        Number(
          form.class_id
        ),

      exam_id:
        Number(
          form.exam_id
        ),

      subject:
        form.subject.trim(),

      exam_date:
        form.exam_date,

      start_time:
        form.start_time,

      end_time:
        form.end_time,

      room:
        form.room.trim(),

      instructions:
        form.instructions.trim(),
    };


    // -----------------------------------------------
    // UPDATE PAYLOAD
    // -----------------------------------------------

    const updatePayload = {
      exam_date:
        form.exam_date,

      start_time:
        form.start_time,

      end_time:
        form.end_time,

      room:
        form.room.trim(),

      instructions:
        form.instructions.trim(),
    };


    try {
      setSaving(
        true
      );


      if (
        editingSchedule
      ) {
        await updateTeacherExamSchedule(
          editingSchedule.id,
          updatePayload
        );

        setSuccess(
          "Exam schedule updated successfully."
        );

      } else {
        await createTeacherExamSchedule(
          createPayload
        );

        setSuccess(
          "Exam schedule created successfully."
        );
      }


      setModalOpen(
        false
      );

      setEditingSchedule(
        null
      );

      setForm({
        ...EMPTY_FORM,
      });


      // -----------------------------------------------
      // REFRESH SCHEDULE
      // -----------------------------------------------

      setRefreshKey(
        (previous) =>
          previous + 1
      );

    } catch (err) {
      console.error(
        "Schedule save error:",
        err
      );

      setError(
        getErrorMessage(
          err,
          editingSchedule
            ? "Unable to update exam schedule."
            : "Unable to create exam schedule."
        )
      );

    } finally {
      setSaving(
        false
      );
    }
  }


  // =======================================================
  // DELETE
  // =======================================================

  async function handleDelete(
    item
  ) {
    const confirmed =
      window.confirm(
        `Delete ${item.subject} schedule for ${item.exam_name}?`
      );

    if (
      !confirmed
    ) {
      return;
    }

    try {
      setDeletingId(
        item.id
      );

      setError("");
      setSuccess("");

      await deleteTeacherExamSchedule(
        item.id
      );

      setSuccess(
        "Exam schedule deleted successfully."
      );

      setRefreshKey(
        (previous) =>
          previous + 1
      );

    } catch (err) {
      console.error(
        "Schedule delete error:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Unable to delete exam schedule."
        )
      );

    } finally {
      setDeletingId(
        null
      );
    }
  }


  // =======================================================
  // LOADING
  // =======================================================

  const loading =
    initialLoading ||
    scheduleLoading;


  // =======================================================
  // UI
  // =======================================================

  return (
    <div className="mx-auto max-w-[1400px]">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <h1 className="text-2xl font-bold text-[#0B3A67]">
            Exam Schedule
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create and manage examination
            schedules for your assigned
            classes and subjects.
          </p>

        </div>


        <button
          type="button"
          onClick={
            openAddModal
          }
          disabled={
            !selectedClassId ||
            exams.length === 0
          }
          className="
            inline-flex
            h-11
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-[#0075FF]
            px-5
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-[#0066dd]
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >

          <Plus
            size={18}
          />

          Add Schedule

        </button>

      </div>


      {/* ================================================= */}
      {/* SUCCESS */}
      {/* ================================================= */}

      {success && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {success}
        </div>
      )}


      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error &&
        !modalOpen && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}


      {/* ================================================= */}
      {/* FILTERS */}
      {/* ================================================= */}

      <section
        className="
          mt-6
          grid
          gap-4
          rounded-2xl
          border
          border-[#E4EDF7]
          bg-white
          p-4
          shadow-sm
          md:grid-cols-2
        "
      >

        <SelectField
          label="Class"
          value={
            selectedClassId
          }
          onChange={(
            event
          ) => {
            setSelectedClassId(
              event.target.value
            );

            setSearch("");
          }}
        >

          {uniqueClasses.map(
            (item) => (
              <option
                key={
                  item.id
                }
                value={
                  item.id
                }
              >
                {
                  item.display_name ||
                  item.class_name ||
                  item.name
                }
              </option>
            )
          )}

        </SelectField>


        <SelectField
          label="Examination"
          value={
            selectedExamId
          }
          onChange={(
            event
          ) =>
            setSelectedExamId(
              event.target.value
            )
          }
        >

          <option value="">
            All Examinations
          </option>

          {exams.map(
            (exam) => (
              <option
                key={
                  exam.id
                }
                value={
                  exam.id
                }
              >
                {exam.name}
              </option>
            )
          )}

        </SelectField>

      </section>


      {/* ================================================= */}
      {/* LIST */}
      {/* ================================================= */}

      <section
        className="
          mt-5
          overflow-hidden
          rounded-2xl
          border
          border-[#E4EDF7]
          bg-white
          shadow-sm
        "
      >

        {/* =============================================== */}
        {/* LIST HEADER */}
        {/* =============================================== */}

        <div className="flex flex-col gap-4 border-b border-[#E4EDF7] p-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h2 className="font-bold text-[#0B3A67]">
              Examination Timetable
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {schedules.length} scheduled
              examination(s)
            </p>

          </div>


          <div className="flex w-full items-center rounded-xl border border-[#DCE8F5] px-3 sm:w-[300px]">

            <Search
              size={17}
              className="text-slate-400"
            />

            <input
              type="text"
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search subject..."
              className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
            />

          </div>

        </div>


        {/* =============================================== */}
        {/* LOADING */}
        {/* =============================================== */}

        {loading && (
          <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-500">

            <Loader2
              size={20}
              className="animate-spin text-[#0075FF]"
            />

            Loading exam schedule...

          </div>
        )}


        {/* =============================================== */}
        {/* DESKTOP */}
        {/* =============================================== */}

        {!loading &&
          filteredSchedules.length >
            0 && (

          <div className="hidden overflow-x-auto md:block">

            <table className="w-full min-w-[1100px]">

              <thead className="bg-[#F8FBFF]">

                <tr>

                  <TableHead>
                    Date
                  </TableHead>

                  <TableHead>
                    Subject
                  </TableHead>

                  <TableHead>
                    Class
                  </TableHead>

                  <TableHead>
                    Start Time
                  </TableHead>

                  <TableHead>
                    End Time
                  </TableHead>

                  <TableHead>
                    Room
                  </TableHead>

                  <TableHead>
                    Instructions
                  </TableHead>

                  <TableHead align="right">
                    Actions
                  </TableHead>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-100">

                {filteredSchedules.map(
                  (item) => (

                    <tr
                      key={
                        item.id
                      }
                      className="transition hover:bg-[#F8FBFF]"
                    >

                      <TableData>

                        <div className="flex items-center gap-2">

                          <CalendarDays
                            size={16}
                            className="text-[#0075FF]"
                          />

                          {formatDate(
                            item.exam_date
                          )}

                        </div>

                      </TableData>


                      <TableData>

                        <div>

                          <p className="font-semibold text-[#0B3A67]">
                            {item.subject}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {item.exam_name}
                          </p>

                        </div>

                      </TableData>


                      <TableData>
                        {
                          item.name ||
                          item.class_name ||
                          "--"
                        }
                      </TableData>


                      <TableData>
                        {formatTime(
                          item.start_time
                        )}
                      </TableData>


                      <TableData>
                        {formatTime(
                          item.end_time
                        )}
                      </TableData>


                      <TableData>
                        {
                          item.room ||
                          "--"
                        }
                      </TableData>


                      <TableData>

                        <p className="max-w-[220px] truncate">
                          {
                            item.instructions ||
                            "--"
                          }
                        </p>

                      </TableData>


                      <TableData align="right">

                        <div className="flex justify-end gap-2">

                          {/* EDIT */}

                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                item
                              )
                            }
                            title="Edit schedule"
                            className="
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-lg
                              border
                              border-slate-200
                              text-slate-500
                              transition
                              hover:border-blue-200
                              hover:bg-blue-50
                              hover:text-[#0075FF]
                            "
                          >

                            <Pencil
                              size={16}
                            />

                          </button>


                          {/* DELETE */}

                          <button
                            type="button"
                            disabled={
                              deletingId ===
                              item.id
                            }
                            onClick={() =>
                              handleDelete(
                                item
                              )
                            }
                            title="Delete schedule"
                            className="
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-lg
                              border
                              border-slate-200
                              text-slate-500
                              transition
                              hover:border-red-200
                              hover:bg-red-50
                              hover:text-red-600
                              disabled:cursor-not-allowed
                              disabled:opacity-50
                            "
                          >

                            {deletingId ===
                            item.id ? (

                              <Loader2
                                size={16}
                                className="animate-spin"
                              />

                            ) : (

                              <Trash2
                                size={16}
                              />

                            )}

                          </button>

                        </div>

                      </TableData>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}


        {/* =============================================== */}
        {/* MOBILE */}
        {/* =============================================== */}

        {!loading &&
          filteredSchedules.length >
            0 && (

          <div className="divide-y divide-slate-100 md:hidden">

            {filteredSchedules.map(
              (item) => (

                <ExamCard
                  key={
                    item.id
                  }
                  item={
                    item
                  }
                  deleting={
                    deletingId ===
                    item.id
                  }
                  onEdit={() =>
                    openEditModal(
                      item
                    )
                  }
                  onDelete={() =>
                    handleDelete(
                      item
                    )
                  }
                />

              )
            )}

          </div>

        )}


        {/* =============================================== */}
        {/* EMPTY */}
        {/* =============================================== */}

        {!loading &&
          filteredSchedules.length ===
            0 && (

          <div className="py-16 text-center">

            <GraduationCap
              size={38}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-3 font-semibold text-[#0B3A67]">
              No exams scheduled
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              No examination schedule is
              available for this selection.
            </p>


            <button
              type="button"
              onClick={
                openAddModal
              }
              disabled={
                !selectedClassId
              }
              className="
                mt-5
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-[#0075FF]
                px-4
                py-2.5
                text-sm
                font-semibold
                text-white
                disabled:opacity-50
              "
            >

              <Plus
                size={17}
              />

              Add Schedule

            </button>

          </div>

        )}

      </section>


      {/* ================================================= */}
      {/* MODAL */}
      {/* ================================================= */}

      {modalOpen && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">

          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* =========================================== */}
            {/* HEADER */}
            {/* =========================================== */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 md:px-6">

              <div>

                <h2 className="text-lg font-bold text-[#0B3A67]">

                  {editingSchedule
                    ? "Edit Exam Schedule"
                    : "Add Exam Schedule"}

                </h2>

                <p className="mt-1 text-xs text-slate-500">

                  {editingSchedule
                    ? "Update date, time, room or instructions."
                    : "Schedule your assigned subject examination."}

                </p>

              </div>


              <button
                type="button"
                disabled={
                  saving
                }
                onClick={
                  closeModal
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-50"
              >

                <X
                  size={18}
                />

              </button>

            </div>


            {/* =========================================== */}
            {/* FORM */}
            {/* =========================================== */}

            <form
              onSubmit={
                handleSubmit
              }
              className="p-5 md:p-6"
            >

              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}


              <div className="grid gap-5 md:grid-cols-2">

                {/* CLASS */}

                <FormField
                  label="Class"
                  required
                >

                  <select
                    name="class_id"
                    value={
                      form.class_id
                    }
                    disabled={
                      Boolean(
                        editingSchedule
                      )
                    }
                    onChange={
                      handleModalClassChange
                    }
                    className={
                      inputClass
                    }
                  >

                    <option value="">
                      Select Class
                    </option>

                    {uniqueClasses.map(
                      (item) => (

                        <option
                          key={
                            item.id
                          }
                          value={
                            item.id
                          }
                        >
                          {
                            item.display_name ||
                            item.class_name ||
                            item.name
                          }
                        </option>

                      )
                    )}

                  </select>

                </FormField>


                {/* EXAM */}

                <FormField
                  label="Examination"
                  required
                >

                  <select
                    name="exam_id"
                    value={
                      form.exam_id
                    }
                    disabled={
                      Boolean(
                        editingSchedule
                      )
                    }
                    onChange={
                      handleFormChange
                    }
                    className={
                      inputClass
                    }
                  >

                    <option value="">
                      Select Examination
                    </option>

                    {exams.map(
                      (exam) => (

                        <option
                          key={
                            exam.id
                          }
                          value={
                            exam.id
                          }
                        >
                          {exam.name}
                        </option>

                      )
                    )}

                  </select>

                </FormField>


                {/* SUBJECT */}

                <div className="md:col-span-2">

                  <FormField
                    label="Subject"
                    required
                  >

                    <select
                      name="subject"
                      value={
                        form.subject
                      }
                      disabled={
                        Boolean(
                          editingSchedule
                        )
                      }
                      onChange={
                        handleFormChange
                      }
                      className={
                        inputClass
                      }
                    >

                      <option value="">
                        Select Subject
                      </option>

                      {modalSubjects.map(
                        (subject) => (

                          <option
                            key={
                              subject
                            }
                            value={
                              subject
                            }
                          >
                            {subject}
                          </option>

                        )
                      )}

                    </select>

                  </FormField>


                  {!editingSchedule &&
                    form.class_id &&
                    modalSubjects.length ===
                      0 && (

                    <p className="mt-2 text-xs text-amber-600">
                      No subject assignment
                      found for this class.
                    </p>

                  )}

                </div>


                {/* DATE */}

                <FormField
                  label="Exam Date"
                  required
                >

                  <input
                    type="date"
                    name="exam_date"
                    value={
                      form.exam_date
                    }
                    onChange={
                      handleFormChange
                    }
                    className={
                      inputClass
                    }
                  />

                </FormField>


                {/* ROOM */}

                <FormField
                  label="Room"
                >

                  <input
                    type="text"
                    name="room"
                    value={
                      form.room
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="VI-B / Hall 1"
                    className={
                      inputClass
                    }
                  />

                </FormField>


                {/* START */}

                <FormField
                  label="Start Time"
                  required
                >

                  <input
                    type="time"
                    name="start_time"
                    value={
                      form.start_time
                    }
                    onChange={
                      handleFormChange
                    }
                    className={
                      inputClass
                    }
                  />

                </FormField>


                {/* END */}

                <FormField
                  label="End Time"
                  required
                >

                  <input
                    type="time"
                    name="end_time"
                    value={
                      form.end_time
                    }
                    min={
                      form.start_time ||
                      undefined
                    }
                    onChange={
                      handleFormChange
                    }
                    className={
                      inputClass
                    }
                  />

                </FormField>


                {/* INSTRUCTIONS */}

                <div className="md:col-span-2">

                  <FormField
                    label="Instructions"
                  >

                    <textarea
                      name="instructions"
                      value={
                        form.instructions
                      }
                      onChange={
                        handleFormChange
                      }
                      rows={4}
                      placeholder="Enter examination instructions..."
                      className="
                        w-full
                        resize-none
                        rounded-xl
                        border
                        border-[#DCE8F5]
                        px-4
                        py-3
                        text-sm
                        text-[#0B3A67]
                        outline-none
                        transition
                        focus:border-[#0075FF]
                        focus:ring-2
                        focus:ring-blue-100
                      "
                    />

                  </FormField>

                </div>

              </div>


              {/* ========================================= */}
              {/* BUTTONS */}
              {/* ========================================= */}

              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  disabled={
                    saving
                  }
                  onClick={
                    closeModal
                  }
                  className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0075FF] px-5 text-sm font-semibold text-white hover:bg-[#0066dd] disabled:opacity-50"
                >

                  {saving ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />

                      Saving...
                    </>
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

    </div>
  );
}


// =========================================================
// MOBILE CARD
// =========================================================

function ExamCard({
  item,
  deleting,
  onEdit,
  onDelete,
}) {
  return (
    <div className="p-4">

      <div className="flex items-start gap-3">

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EAF4FF] text-[#0075FF]">

          <CalendarDays
            size={21}
          />

        </div>


        <div className="min-w-0 flex-1">

          <p className="text-xs font-semibold uppercase text-[#0075FF]">
            {item.exam_name}
          </p>

          <h3 className="mt-1 font-bold text-[#0B3A67]">
            {item.subject}
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            {
              item.name ||
              item.class_name ||
              "--"
            }
          </p>

        </div>


        <div className="flex gap-1">

          <button
            type="button"
            onClick={
              onEdit
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#0075FF]"
          >

            <Pencil
              size={15}
            />

          </button>


          <button
            type="button"
            disabled={
              deleting
            }
            onClick={
              onDelete
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 disabled:opacity-50"
          >

            {deleting ? (

              <Loader2
                size={15}
                className="animate-spin"
              />

            ) : (

              <Trash2
                size={15}
              />

            )}

          </button>

        </div>

      </div>


      <div className="mt-4 grid grid-cols-2 gap-2">

        <InfoBox
          icon={
            CalendarDays
          }
          label="Date"
          value={formatDate(
            item.exam_date
          )}
        />

        <InfoBox
          icon={
            Clock3
          }
          label="Time"
          value={`${formatTime(
            item.start_time
          )} - ${formatTime(
            item.end_time
          )}`}
        />

      </div>


      {item.room && (

        <div className="mt-3">

          <InfoBox
            icon={
              MapPin
            }
            label="Room"
            value={
              item.room
            }
          />

        </div>

      )}


      {item.instructions && (

        <div className="mt-3 rounded-xl bg-[#F8FBFF] p-3">

          <p className="text-[10px] font-semibold uppercase text-slate-400">
            Instructions
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-600">
            {
              item.instructions
            }
          </p>

        </div>

      )}

    </div>
  );
}


// =========================================================
// INFO BOX
// =========================================================

function InfoBox({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-[#F8FBFF] p-3">

      <div className="flex items-center gap-1.5">

        <Icon
          size={13}
          className="text-[#0075FF]"
        />

        <p className="text-[10px] text-slate-400">
          {label}
        </p>

      </div>

      <p className="mt-1 text-xs font-semibold text-[#0B3A67]">
        {value}
      </p>

    </div>
  );
}


// =========================================================
// SELECT FIELD
// =========================================================

function SelectField({
  label,
  value,
  onChange,
  children,
}) {
  return (
    <div>

      <label className="mb-2 block text-xs font-semibold text-[#0B3A67]">
        {label}
      </label>

      <div className="relative">

        <select
          value={
            value
          }
          onChange={
            onChange
          }
          className="
            w-full
            appearance-none
            rounded-xl
            border
            border-[#DCE8F5]
            bg-white
            px-4
            py-3
            pr-10
            text-sm
            font-semibold
            text-[#0B3A67]
            outline-none
            focus:border-[#0075FF]
          "
        >

          {children}

        </select>

        <ChevronDown
          size={17}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#0075FF]"
        />

      </div>

    </div>
  );
}


// =========================================================
// FORM FIELD
// =========================================================

function FormField({
  label,
  required = false,
  children,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-[#0B3A67]">

        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}

      </label>

      {children}

    </div>
  );
}


// =========================================================
// TABLE HEAD
// =========================================================

function TableHead({
  children,
  align = "left",
}) {
  return (
    <th
      className={`
        px-5
        py-4
        text-xs
        font-semibold
        uppercase
        tracking-wide
        text-slate-500
        ${
          align ===
          "right"
            ? "text-right"
            : "text-left"
        }
      `}
    >
      {children}
    </th>
  );
}


// =========================================================
// TABLE DATA
// =========================================================

function TableData({
  children,
  align = "left",
}) {
  return (
    <td
      className={`
        px-5
        py-4
        text-sm
        text-slate-600
        ${
          align ===
          "right"
            ? "text-right"
            : "text-left"
        }
      `}
    >
      {children}
    </td>
  );
}