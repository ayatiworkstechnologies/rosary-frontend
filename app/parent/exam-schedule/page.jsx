"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  Clock3,
  GraduationCap,
  Loader2,
  MapPin,
  Search,
  UserRound,
} from "lucide-react";

import {
  getParentChildren,
  getParentChildExamSchedule,
} from "@/services/parentService";


// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(value) {
  if (!value) {
    return "--";
  }

  const date = new Date(
    `${value}T00:00:00`
  );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
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

  const parts =
    String(value).split(":");

  if (parts.length < 2) {
    return value;
  }

  const hour =
    Number(parts[0]);

  const minute =
    Number(parts[1]);

  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute)
  ) {
    return value;
  }

  const date = new Date();

  date.setHours(
    hour,
    minute,
    0,
    0
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
// MAIN PAGE
// =========================================================

export default function ParentExamSchedulePage() {

  // =======================================================
  // STATE
  // =======================================================

  const [
    children,
    setChildren,
  ] = useState([]);

  const [
    selectedStudentId,
    setSelectedStudentId,
  ] = useState("");

  const [
    exams,
    setExams,
  ] = useState([]);

  const [
    selectedExamId,
    setSelectedExamId,
  ] = useState("");

  const [
    schedules,
    setSchedules,
  ] = useState([]);

  const [
    studentInfo,
    setStudentInfo,
  ] = useState(null);

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
    error,
    setError,
  ] = useState("");


  // =======================================================
  // LOAD CHILDREN
  // =======================================================

  useEffect(() => {
    let cancelled = false;


    async function loadChildren() {
      try {
        const data =
          await getParentChildren();


        if (cancelled) {
          return;
        }


        const childList =
          Array.isArray(
            data?.children
          )
            ? data.children
            : [];


        setChildren(
          childList
        );


        // ================================================
        // READ ?student=1 FROM URL
        // ================================================

        let requestedStudentId =
          "";


        if (
          typeof window !==
          "undefined"
        ) {
          const params =
            new URLSearchParams(
              window.location.search
            );

          requestedStudentId =
            params.get("student") ||
            "";
        }


        // ================================================
        // VALIDATE URL CHILD
        // ================================================

        const requestedChild =
          childList.find(
            (child) =>
              String(child.id) ===
              String(
                requestedStudentId
              )
          );


        if (requestedChild) {
          setSelectedStudentId(
            String(
              requestedChild.id
            )
          );
        }

        else if (
          childList.length > 0
        ) {
          setSelectedStudentId(
            String(
              childList[0].id
            )
          );
        }

      } catch (err) {
        console.error(
          "Load children error:",
          err
        );


        if (cancelled) {
          return;
        }


        setError(
          err?.response
            ?.data
            ?.detail ||
          err?.message ||
          "Unable to load children."
        );

      } finally {
        if (!cancelled) {
          setInitialLoading(
            false
          );
        }
      }
    }


    loadChildren();


    return () => {
      cancelled = true;
    };

  }, []);


  // =======================================================
  // LOAD EXAM SCHEDULE
  // =======================================================

  useEffect(() => {

    // =====================================================
    // IMPORTANT FIX
    //
    // DON'T DO:
    //
    // setSchedules([])
    // setExams([])
    // setStudentInfo(null)
    //
    // directly here.
    // =====================================================

    if (!selectedStudentId) {
      return;
    }


    let cancelled = false;


    async function loadSchedule() {
      try {
        setScheduleLoading(
          true
        );


        const data =
          await getParentChildExamSchedule(
            selectedStudentId,
            selectedExamId
          );


        if (cancelled) {
          return;
        }


        const scheduleList =
          Array.isArray(
            data?.schedules
          )
            ? data.schedules
            : [];


        const examList =
          Array.isArray(
            data?.exams
          )
            ? data.exams
            : [];


        setSchedules(
          scheduleList
        );


        setExams(
          examList
        );


        setStudentInfo({
          student_name:
            data?.student_name ||
            "",

          admission_no:
            data?.admission_no ||
            "",

          name:
            data?.name ||
            "",
        });


        setError("");

      } catch (err) {
        console.error(
          "Exam schedule error:",
          err
        );


        if (cancelled) {
          return;
        }


        setSchedules([]);

        setStudentInfo(
          null
        );


        setError(
          err?.response
            ?.data
            ?.detail ||
          err?.message ||
          "Unable to load exam schedule."
        );

      } finally {
        if (!cancelled) {
          setScheduleLoading(
            false
          );
        }
      }
    }


    loadSchedule();


    return () => {
      cancelled = true;
    };

  }, [
    selectedStudentId,
    selectedExamId,
  ]);


  // =======================================================
  // CHILD CHANGE
  // =======================================================

  function handleChildChange(
    event
  ) {
    const studentId =
      event.target.value;


    // =====================================================
    // RESET HERE
    //
    // This is an event handler, so setState is correct.
    // =====================================================

    setSelectedExamId("");

    setSchedules([]);

    setExams([]);

    setStudentInfo(null);

    setSearch("");

    setError("");


    setSelectedStudentId(
      studentId
    );
  }


  // =======================================================
  // EXAM CHANGE
  // =======================================================

  function handleExamChange(
    event
  ) {
    const examId =
      event.target.value;


    setSelectedExamId(
      examId
    );

    setSearch("");

    setError("");
  }


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
        (item) => {
          const subject =
            item?.subject
              ?.toLowerCase() ||
            "";

          const examName =
            item?.exam_name
              ?.toLowerCase() ||
            "";

          const room =
            item?.room
              ?.toLowerCase() ||
            "";

          const instructions =
            item?.instructions
              ?.toLowerCase() ||
            "";


          return (
            subject.includes(
              value
            ) ||
            examName.includes(
              value
            ) ||
            room.includes(
              value
            ) ||
            instructions.includes(
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
  // INITIAL LOADING
  // =======================================================

  if (initialLoading) {
    return (
      <LoadingState
        text="Loading exam schedule..."
      />
    );
  }


  // =======================================================
  // UI
  // =======================================================

  return (
    <div
      className="
        mx-auto
        max-w-[1400px]
      "
    >

      {/* =========================================
          HEADER
      ========================================== */}

      <div>
        <h1
          className="
            text-2xl
            font-bold
            text-[#0B3A67]
          "
        >
          Exam Schedule
        </h1>


        <p
          className="
            mt-1
            text-sm
            text-slate-500
          "
        >
          View your child&apos;s
          examination timetable and
          instructions.
        </p>
      </div>


      {/* =========================================
          ERROR
      ========================================== */}

      {error && (
        <div
          className="
            mt-5
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


      {/* =========================================
          NO CHILDREN
      ========================================== */}

      {!error &&
        children.length ===
          0 && (
        <EmptyChildren />
      )}


      {/* =========================================
          FILTERS
      ========================================== */}

      {children.length > 0 && (
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

          {/* CHILD */}

          <SelectField
            label="Select Child"
            value={
              selectedStudentId
            }
            onChange={
              handleChildChange
            }
            disabled={
              scheduleLoading
            }
          >

            {children.map(
              (child) => (
                <option
                  key={
                    child.id
                  }
                  value={
                    child.id
                  }
                >
                  {
                    child.full_name
                  }

                  {" - "}

                  {
                    child.name ||
                    "No Class"
                  }
                </option>
              )
            )}

          </SelectField>


          {/* EXAM */}

          <SelectField
            label="Select Examination"
            value={
              selectedExamId
            }
            onChange={
              handleExamChange
            }
            disabled={
              scheduleLoading ||
              exams.length === 0
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
                  {
                    exam.name
                  }

                  {" - "}

                  {
                    exam.academic_year
                  }
                </option>
              )
            )}

          </SelectField>

        </section>
      )}


      {/* =========================================
          LOADING
      ========================================== */}

      {scheduleLoading && (
        <div
          className="
            mt-5
            flex
            items-center
            justify-center
            gap-3
            rounded-2xl
            border
            border-[#E4EDF7]
            bg-white
            py-14
            text-sm
            text-slate-500
          "
        >
          <Loader2
            size={20}
            className="
              animate-spin
              text-[#0075FF]
            "
          />

          Loading examination timetable...
        </div>
      )}


      {/* =========================================
          STUDENT + SCHEDULE
      ========================================== */}

      {!scheduleLoading &&
        studentInfo && (
        <>

          {/* STUDENT */}

          <section
            className="
              mt-5
              rounded-2xl
              border
              border-[#E4EDF7]
              bg-white
              p-4
              shadow-sm
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
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
                <UserRound
                  size={21}
                />
              </div>


              <div>
                <h2
                  className="
                    font-bold
                    text-[#0B3A67]
                  "
                >
                  {
                    studentInfo.student_name
                  }
                </h2>


                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-400
                  "
                >
                  {
                    studentInfo.name ||
                    "--"
                  }

                  {" • "}

                  {
                    studentInfo.admission_no ||
                    "--"
                  }
                </p>
              </div>
            </div>
          </section>


          {/* SEARCH */}

          <section
            className="
              mt-4
              flex
              flex-col
              gap-3
              rounded-2xl
              border
              border-[#E4EDF7]
              bg-white
              p-4
              shadow-sm
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div>
              <h2
                className="
                  font-bold
                  text-[#0B3A67]
                "
              >
                Examination Timetable
              </h2>


              <p
                className="
                  mt-1
                  text-xs
                  text-slate-400
                "
              >
                {
                  filteredSchedules.length
                } schedule(s)
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
                focus-within:border-[#0075FF]
                sm:w-[300px]
              "
            >
              <Search
                size={17}
                className="
                  shrink-0
                  text-slate-400
                "
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
          </section>


          {/* =====================================
              RESULTS
          ====================================== */}

          {filteredSchedules.length >
          0 ? (
            <>

              {/* DESKTOP */}

              <section
                className="
                  mt-4
                  hidden
                  overflow-hidden
                  rounded-2xl
                  border
                  border-[#E4EDF7]
                  bg-white
                  shadow-sm
                  md:block
                "
              >
                <div
                  className="
                    overflow-x-auto
                  "
                >
                  <table
                    className="
                      w-full
                      min-w-[950px]
                    "
                  >
                    <thead
                      className="
                        bg-[#F8FBFF]
                      "
                    >
                      <tr>
                        <TableHeader>
                          Date
                        </TableHeader>

                        <TableHeader>
                          Subject
                        </TableHeader>

                        <TableHeader>
                          Examination
                        </TableHeader>

                        <TableHeader>
                          Start
                        </TableHeader>

                        <TableHeader>
                          End
                        </TableHeader>

                        <TableHeader>
                          Room
                        </TableHeader>

                        <TableHeader>
                          Instructions
                        </TableHeader>
                      </tr>
                    </thead>


                    <tbody
                      className="
                        divide-y
                        divide-slate-100
                      "
                    >
                      {filteredSchedules.map(
                        (item) => (
                          <tr
                            key={
                              item.id
                            }
                            className="
                              transition
                              hover:bg-[#F8FBFF]
                            "
                          >
                            <TableCell>
                              {
                                formatDate(
                                  item.exam_date
                                )
                              }
                            </TableCell>


                            <TableCell>
                              <span
                                className="
                                  font-semibold
                                  text-[#0B3A67]
                                "
                              >
                                {
                                  item.subject
                                }
                              </span>
                            </TableCell>


                            <TableCell>
                              {
                                item.exam_name
                              }
                            </TableCell>


                            <TableCell>
                              {
                                formatTime(
                                  item.start_time
                                )
                              }
                            </TableCell>


                            <TableCell>
                              {
                                formatTime(
                                  item.end_time
                                )
                              }
                            </TableCell>


                            <TableCell>
                              {
                                item.room ||
                                "--"
                              }
                            </TableCell>


                            <TableCell>
                              <div
                                className="
                                  max-w-[220px]
                                "
                              >
                                {
                                  item.instructions ||
                                  "--"
                                }
                              </div>
                            </TableCell>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </section>


              {/* MOBILE */}

              <section
                className="
                  mt-4
                  grid
                  gap-4
                  md:hidden
                "
              >
                {filteredSchedules.map(
                  (item) => (
                    <ExamCard
                      key={
                        item.id
                      }
                      item={
                        item
                      }
                    />
                  )
                )}
              </section>

            </>
          ) : (
            <EmptySchedule />
          )}

        </>
      )}

    </div>
  );
}


// =========================================================
// EXAM CARD
// =========================================================

function ExamCard({
  item,
}) {
  return (
    <article
      className="
        rounded-2xl
        border
        border-[#E4EDF7]
        bg-white
        p-5
        shadow-sm
      "
    >

      <div
        className="
          flex
          items-start
          justify-between
          gap-3
        "
      >

        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-[#EAF4FF]
            text-[#0075FF]
          "
        >
          <GraduationCap
            size={20}
          />
        </div>


        <span
          className="
            max-w-[200px]
            truncate
            rounded-full
            bg-[#EAF4FF]
            px-3
            py-1
            text-[10px]
            font-semibold
            text-[#0075FF]
          "
        >
          {
            item.exam_name
          }
        </span>

      </div>


      <p
        className="
          mt-4
          text-xs
          font-semibold
          uppercase
          tracking-wide
          text-[#0075FF]
        "
      >
        Subject
      </p>


      <h2
        className="
          mt-1
          text-lg
          font-bold
          text-[#0B3A67]
        "
      >
        {
          item.subject
        }
      </h2>


      <div
        className="
          mt-4
          grid
          grid-cols-1
          gap-3
          sm:grid-cols-2
        "
      >
        <InfoBox
          icon={CalendarDays}
          label="Date"
          value={
            formatDate(
              item.exam_date
            )
          }
        />


        <InfoBox
          icon={Clock3}
          label="Time"
          value={
            `${formatTime(
              item.start_time
            )} - ${formatTime(
              item.end_time
            )}`
          }
        />


        <InfoBox
          icon={MapPin}
          label="Room"
          value={
            item.room ||
            "--"
          }
        />


        <InfoBox
          icon={BookOpen}
          label="Examination"
          value={
            item.exam_name
          }
        />
      </div>


      {item.instructions && (
        <div
          className="
            mt-4
            rounded-xl
            bg-[#F8FBFF]
            p-3
          "
        >
          <p
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-wide
              text-slate-400
            "
          >
            Instructions
          </p>

          <p
            className="
              mt-1
              text-xs
              leading-5
              text-slate-600
            "
          >
            {
              item.instructions
            }
          </p>
        </div>
      )}

    </article>
  );
}


// =========================================================
// SELECT
// =========================================================

function SelectField({
  label,
  value,
  onChange,
  disabled = false,
  children,
}) {
  return (
    <div>

      <label
        className="
          mb-2
          block
          text-xs
          font-semibold
          text-[#0B3A67]
        "
      >
        {label}
      </label>


      <div className="relative">

        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
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
            disabled:cursor-not-allowed
            disabled:bg-slate-50
            disabled:text-slate-400
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
// INFO
// =========================================================

function InfoBox({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div
      className="
        min-w-0
        rounded-xl
        bg-[#F8FBFF]
        p-3
      "
    >

      <div
        className="
          flex
          items-center
          gap-1.5
        "
      >
        <Icon
          size={13}
          className="
            shrink-0
            text-[#0075FF]
          "
        />


        <p
          className="
            text-[10px]
            text-slate-400
          "
        >
          {label}
        </p>
      </div>


      <p
        className="
          mt-1
          break-words
          text-xs
          font-semibold
          text-[#0B3A67]
        "
      >
        {value}
      </p>

    </div>
  );
}


// =========================================================
// TABLE
// =========================================================

function TableHeader({
  children,
}) {
  return (
    <th
      className="
        whitespace-nowrap
        px-4
        py-3
        text-left
        text-[10px]
        font-semibold
        uppercase
        tracking-wide
        text-slate-400
      "
    >
      {children}
    </th>
  );
}


function TableCell({
  children,
}) {
  return (
    <td
      className="
        px-4
        py-4
        align-top
        text-sm
        text-slate-500
      "
    >
      {children}
    </td>
  );
}


// =========================================================
// EMPTY SCHEDULE
// =========================================================

function EmptySchedule() {
  return (
    <div
      className="
        mt-4
        rounded-2xl
        border
        border-[#E4EDF7]
        bg-white
        py-16
        text-center
        shadow-sm
      "
    >
      <GraduationCap
        size={42}
        className="
          mx-auto
          text-slate-300
        "
      />


      <h3
        className="
          mt-3
          font-semibold
          text-[#0B3A67]
        "
      >
        No examinations scheduled
      </h3>


      <p
        className="
          mt-1
          text-sm
          text-slate-400
        "
      >
        Examination dates and
        timings will appear here.
      </p>
    </div>
  );
}


// =========================================================
// EMPTY CHILDREN
// =========================================================

function EmptyChildren() {
  return (
    <div
      className="
        mt-6
        rounded-2xl
        border
        border-[#E4EDF7]
        bg-white
        py-16
        text-center
        shadow-sm
      "
    >
      <UserRound
        size={42}
        className="
          mx-auto
          text-slate-300
        "
      />


      <h3
        className="
          mt-3
          font-semibold
          text-[#0B3A67]
        "
      >
        No children linked
      </h3>


      <p
        className="
          mt-1
          text-sm
          text-slate-400
        "
      >
        Please contact the school
        administrator to link your child.
      </p>
    </div>
  );
}


// =========================================================
// LOADING
// =========================================================

function LoadingState({
  text,
}) {
  return (
    <div
      className="
        flex
        min-h-[450px]
        items-center
        justify-center
      "
    >
      <div className="text-center">

        <Loader2
          size={32}
          className="
            mx-auto
            animate-spin
            text-[#0075FF]
          "
        />


        <p
          className="
            mt-3
            text-sm
            text-slate-500
          "
        >
          {text}
        </p>

      </div>
    </div>
  );
}