"use client";

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
  Search,
} from "lucide-react";

import {
  getTeacherClasses,
  getTeacherExams,
  getTeacherExamSchedule,
} from "@/services/teacherService";


// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(
  dateString
) {
  if (!dateString) {
    return "--";
  }

  const date =
    new Date(
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

function formatTime(
  value
) {
  if (!value) {
    return "--";
  }

  const [
    hours,
    minutes,
  ] = value.split(":");

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
// PAGE
// =========================================================

export default function TeacherExamSchedulePage() {
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
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  // =======================================================
  // INITIAL DATA
  // =======================================================

  useEffect(() => {
    const loadInitial =
      async () => {
        try {
          setLoading(
            true
          );

          setError("");

          const [
            classData,
            examData,
          ] =
            await Promise.all([
              getTeacherClasses(),
              getTeacherExams(),
            ]);

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


          if (
            safeClasses.length >
            0
          ) {
            setSelectedClassId(
              String(
                safeClasses[0].id
              )
            );
          }


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

        } catch (err) {
          console.error(
            err
          );

          setError(
            err?.response
              ?.data
              ?.detail ||
            "Unable to load schedule filters."
          );

        } finally {
          setLoading(
            false
          );
        }
      };

    loadInitial();

  }, []);


  // =======================================================
  // LOAD SCHEDULE
  // =======================================================

  useEffect(() => {
    if (
      !selectedClassId
    ) {
      return;
    }

    const loadSchedule =
      async () => {
        try {
          setLoading(
            true
          );

          setError("");

          const data =
            await getTeacherExamSchedule(
              {
                classId:
                  selectedClassId,

                examId:
                  selectedExamId,
              }
            );

          setSchedules(
            Array.isArray(
              data?.schedules
            )
              ? data.schedules
              : []
          );

        } catch (err) {
          console.error(
            err
          );

          setSchedules([]);

          setError(
            err?.response
              ?.data
              ?.detail ||
            "Unable to load exam schedule."
          );

        } finally {
          setLoading(
            false
          );
        }
      };

    loadSchedule();

  }, [
    selectedClassId,
    selectedExamId,
  ]);


  // =======================================================
  // SEARCH
  // =======================================================

  const filteredSchedules =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return schedules;
      }

      return schedules.filter(
        (item) =>
          item.subject
            ?.toLowerCase()
            .includes(value) ||

          item.exam_name
            ?.toLowerCase()
            .includes(value) ||

          item.class_name
            ?.toLowerCase()
            .includes(value)
      );

    }, [
      schedules,
      search,
    ]);


  // =======================================================
  // UI
  // =======================================================

  return (
    <div className="mx-auto max-w-[1400px]">

      {/* HEADER */}

      <div>
        <h1 className="text-2xl font-bold text-[#0B3A67]">
          Exam Schedule
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View upcoming examination dates and timings.
        </p>
      </div>


      {/* FILTERS */}

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
          ) =>
            setSelectedClassId(
              event.target.value
            )
          }
        >

          {classes.map(
            (item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {
                  item.display_name
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
                key={exam.id}
                value={exam.id}
              >
                {exam.name}
              </option>
            )
          )}

        </SelectField>

      </section>


      {/* ERROR */}

      {error && (
        <div
          className="
            mt-4
            rounded-xl
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-sm
            text-red-600
          "
        >
          {error}
        </div>
      )}


      {/* LIST CARD */}

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

        {/* LIST HEADER */}

        <div
          className="
            flex
            flex-col
            gap-4
            border-b
            border-[#E4EDF7]
            p-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          <div>

            <h2 className="font-bold text-[#0B3A67]">
              Examination Timetable
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {schedules.length} scheduled examination(s)
            </p>

          </div>


          <div
            className="
              flex
              w-full
              items-center
              rounded-xl
              border
              border-[#DCE8F5]
              px-3
              sm:w-[300px]
            "
          >

            <Search
              size={17}
              className="text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(
                event
              ) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search subject..."
              className="
                w-full
                bg-transparent
                px-3
                py-2.5
                text-sm
                outline-none
              "
            />

          </div>

        </div>


        {/* LOADING */}

        {loading && (
          <div
            className="
              flex
              items-center
              justify-center
              gap-3
              py-16
              text-sm
              text-slate-500
            "
          >

            <Loader2
              size={20}
              className="animate-spin text-[#0075FF]"
            />

            Loading exam schedule...

          </div>
        )}


        {/* DESKTOP TABLE */}

        {!loading &&
          filteredSchedules.length >
            0 && (
          <div className="hidden overflow-x-auto md:block">

            <table className="w-full min-w-[900px]">

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

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-100">

                {filteredSchedules.map(
                  (item) => (
                    <tr
                      key={item.id}
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
                            {
                              item.subject
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {
                              item.exam_name
                            }
                          </p>

                        </div>

                      </TableData>


                      <TableData>
                        {
                          item.class_name
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

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}


        {/* MOBILE */}

        {!loading &&
          filteredSchedules.length >
            0 && (
          <div className="divide-y divide-slate-100 md:hidden">

            {filteredSchedules.map(
              (item) => (
                <ExamCard
                  key={item.id}
                  item={item}
                />
              )
            )}

          </div>
        )}


        {/* EMPTY */}

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
              No examination schedule is available for this selection.
            </p>

          </div>
        )}

      </section>

    </div>
  );
}


// =========================================================
// MOBILE CARD
// =========================================================

function ExamCard({
  item,
}) {
  return (
    <div className="p-4">

      <div className="flex items-start justify-between gap-3">

        <div
          className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-[#EAF4FF]
            text-[#0075FF]
          "
        >
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
            {item.class_name}
          </p>

        </div>

      </div>


      <div
        className="
          mt-4
          grid
          grid-cols-2
          gap-2
        "
      >

        <InfoBox
          icon={CalendarDays}
          label="Date"
          value={formatDate(
            item.exam_date
          )}
        />

        <InfoBox
          icon={Clock3}
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
            icon={MapPin}
            label="Room"
            value={item.room}
          />

        </div>
      )}


      {item.instructions && (
        <div
          className="
            mt-3
            rounded-xl
            bg-[#F8FBFF]
            p-3
          "
        >

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
    <div
      className="
        rounded-xl
        bg-[#F8FBFF]
        p-3
      "
    >

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
// SELECT
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
          value={value}
          onChange={onChange}
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
          className="
            pointer-events-none
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            text-[#0075FF]
          "
        />

      </div>

    </div>
  );
}


// =========================================================
// TABLE
// =========================================================

function TableHead({
  children,
}) {
  return (
    <th
      className="
        px-5
        py-4
        text-left
        text-xs
        font-semibold
        uppercase
        tracking-wide
        text-slate-500
      "
    >
      {children}
    </th>
  );
}


function TableData({
  children,
}) {
  return (
    <td
      className="
        px-5
        py-4
        text-sm
        text-slate-600
      "
    >
      {children}
    </td>
  );
}