"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Search,
  UserCheck,
  UserX,
  Users,
  XCircle,
} from "lucide-react";

import {
  getParentChildren,
  getParentChildAttendance,
} from "@/services/parentService";

import {
  useSearchParams,
} from "next/navigation";

// =========================================================
// CURRENT MONTH
// =========================================================

function getCurrentMonth() {
  const now = new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}`;
}


// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(
  value
) {
  if (!value) {
    return "--";
  }

  const date = new Date(
    `${value}T00:00:00`
  );

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
// MAIN PAGE
// =========================================================

export default function ParentAttendancePage() {
  const searchParams =
  useSearchParams();

const requestedStudentId =
  searchParams.get(
    "student"
  );

  const [
    children,
    setChildren,
  ] = useState([]);

  const [
    selectedStudentId,
    setSelectedStudentId,
  ] = useState("");

  const [
    selectedMonth,
    setSelectedMonth,
  ] = useState(
    getCurrentMonth()
  );

  const [
    attendance,
    setAttendance,
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
    attendanceLoading,
    setAttendanceLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  // =======================================================
  // LOAD CHILDREN
  // =======================================================

  useEffect(() => {
    const loadChildren =
      async () => {
        try {
          setInitialLoading(
            true
          );

          setError("");

          const data =
            await getParentChildren();

          const childList =
            Array.isArray(
              data?.children
            )
              ? data.children
              : [];

          setChildren(
            childList
          );

          if (
            requestedStudentId &&
            childList.some(
              (child) =>
                String(child.id) ===
                String(
                  requestedStudentId
                )
            )
          ) {
            setSelectedStudentId(
              String(
                requestedStudentId
              )
            );
          } else if (
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
            "Load children:",
            err
          );

          setError(
            err?.response
              ?.data
              ?.detail ||
            "Unable to load children."
          );

        } finally {
          setInitialLoading(
            false
          );
        }
      };

    loadChildren();

  }, []);


  // =======================================================
  // LOAD ATTENDANCE
  // =======================================================

  useEffect(() => {
    if (
      !selectedStudentId ||
      !selectedMonth
    ) {
      return;
    }

    const [
      year,
      month,
    ] = selectedMonth.split(
      "-"
    );

    const loadAttendance =
      async () => {
        try {
          setAttendanceLoading(
            true
          );

          setError("");

          const data =
            await getParentChildAttendance(
              selectedStudentId,
              Number(year),
              Number(month)
            );

          setAttendance(
            data
          );

        } catch (err) {
          console.error(
            "Parent attendance:",
            err
          );

          setAttendance(
            null
          );

          setError(
            err?.response
              ?.data
              ?.detail ||
            "Unable to load attendance."
          );

        } finally {
          setAttendanceLoading(
            false
          );
        }
      };

    loadAttendance();

  }, [
    selectedStudentId,
    selectedMonth,
  ]);


  // =======================================================
  // FILTER HISTORY
  // =======================================================

  const filteredRecords =
    useMemo(() => {
      const records =
        attendance?.records ||
        [];

      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return records;
      }

      return records.filter(
        (item) =>
          item.status
            ?.toLowerCase()
            .includes(value) ||

          item.remarks
            ?.toLowerCase()
            .includes(value) ||

          item.attendance_date
            ?.includes(value)
      );

    }, [
      attendance,
      search,
    ]);


  // =======================================================
  // INITIAL LOADING
  // =======================================================

  if (initialLoading) {
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

          <p className="mt-3 text-sm text-slate-500">
            Loading attendance...
          </p>

        </div>
      </div>
    );
  }


  // =======================================================
  // UI
  // =======================================================

  return (
    <div className="mx-auto max-w-[1400px]">

      {/* HEADER */}

      <div>

        <h1 className="text-2xl font-bold text-[#0B3A67]">
          Attendance
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View your child&apos;s monthly
          attendance and daily history.
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

        {/* CHILD */}

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
            Select Child
          </label>

          <div className="relative">

            <select
              value={
                selectedStudentId
              }
              onChange={(
                event
              ) =>
                setSelectedStudentId(
                  event.target.value
                )
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

              {children.length ===
                0 && (
                <option value="">
                  No children linked
                </option>
              )}

              {children.map(
                (child) => (
                  <option
                    key={child.id}
                    value={child.id}
                  >
                    {child.full_name}
                    {" - "}
                    {child.name}
                  </option>
                )
              )}

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


        {/* MONTH */}

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
            Select Month
          </label>

          <input
            type="month"
            value={
              selectedMonth
            }
            onChange={(
              event
            ) =>
              setSelectedMonth(
                event.target.value
              )
            }
            className="
              w-full
              rounded-xl
              border
              border-[#DCE8F5]
              bg-white
              px-4
              py-3
              text-sm
              font-semibold
              text-[#0B3A67]
              outline-none
              focus:border-[#0075FF]
            "
          />

        </div>

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


      {/* ATTENDANCE LOADING */}

      {attendanceLoading && (
        <div
          className="
            mt-5
            flex
            items-center
            justify-center
            gap-2
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

          Loading monthly attendance...

        </div>
      )}


      {!attendanceLoading &&
        attendance && (
        <>

          {/* CHILD INFO */}

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
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#EAF4FF]
                  text-[#0075FF]
                "
              >
                <Users
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
                    attendance.student_name
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
                    attendance.name ||
                    "--"
                  }
                  {" • "}
                  {
                    attendance.admission_no
                  }
                </p>

              </div>

            </div>

          </section>


          {/* SUMMARY */}

          <section
            className="
              mt-4
              grid
              grid-cols-2
              gap-3
              lg:grid-cols-4
            "
          >

            <SummaryCard
              title="Marked Days"
              value={
                attendance.total_marked_days
              }
              icon={
                CalendarCheck
              }
              iconClass="
                bg-[#EAF4FF]
                text-[#0075FF]
              "
            />

            <SummaryCard
              title="Present"
              value={
                attendance.present_count
              }
              icon={
                UserCheck
              }
              iconClass="
                bg-green-100
                text-green-600
              "
            />

            <SummaryCard
              title="Absent"
              value={
                attendance.absent_count
              }
              icon={
                UserX
              }
              iconClass="
                bg-red-100
                text-red-500
              "
            />

            <SummaryCard
              title="Attendance"
              value={`${attendance.attendance_percentage}%`}
              icon={
                CheckCircle2
              }
              iconClass="
                bg-purple-100
                text-purple-600
              "
            />

          </section>


          {/* HISTORY */}

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

            {/* HEADER */}

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

                <h2
                  className="
                    font-bold
                    text-[#0B3A67]
                  "
                >
                  Attendance History
                </h2>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-400
                  "
                >
                  {
                    filteredRecords.length
                  } record(s)
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
                  sm:w-[280px]
                "
              >

                <Search
                  size={17}
                  className="
                    text-slate-400
                  "
                />

                <input
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
                  placeholder="Search attendance..."
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


            {/* RECORDS */}

            {filteredRecords.length >
            0 ? (
              <div
                className="
                  divide-y
                  divide-slate-100
                "
              >

                {filteredRecords.map(
                  (record) => (
                    <AttendanceRow
                      key={
                        record.attendance_date
                      }
                      record={
                        record
                      }
                    />
                  )
                )}

              </div>
            ) : (
              <div
                className="
                  py-14
                  text-center
                "
              >

                <CalendarCheck
                  size={36}
                  className="
                    mx-auto
                    text-slate-300
                  "
                />

                <p
                  className="
                    mt-3
                    text-sm
                    text-slate-400
                  "
                >
                  No attendance records
                  available for this month.
                </p>

              </div>
            )}

          </section>

        </>
      )}

    </div>
  );
}


// =========================================================
// ATTENDANCE ROW
// =========================================================

function AttendanceRow({
  record,
}) {
  const present =
    record.status ===
    "PRESENT";


  return (
    <div
      className="
        flex
        items-center
        gap-4
        p-4
      "
    >

      <div
        className={`
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl

          ${
            present
              ? "bg-green-50 text-green-600"
              : "bg-red-50 text-red-500"
          }
        `}
      >

        {present ? (
          <CheckCircle2
            size={19}
          />
        ) : (
          <XCircle
            size={19}
          />
        )}

      </div>


      <div
        className="
          min-w-0
          flex-1
        "
      >

        <p
          className="
            text-sm
            font-semibold
            text-[#0B3A67]
          "
        >
          {
            formatDate(
              record.attendance_date
            )
          }
        </p>

        {record.remarks && (
          <p
            className="
              mt-1
              text-xs
              text-slate-400
            "
          >
            {record.remarks}
          </p>
        )}

      </div>


      <span
        className={`
          rounded-full
          px-3
          py-1.5
          text-[10px]
          font-bold

          ${
            present
              ? "bg-green-50 text-green-600"
              : "bg-red-50 text-red-500"
          }
        `}
      >
        {present
          ? "PRESENT"
          : "ABSENT"}
      </span>

    </div>
  );
}


// =========================================================
// SUMMARY CARD
// =========================================================

function SummaryCard({
  title,
  value,
  icon: Icon,
  iconClass,
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-3
        rounded-2xl
        border
        border-[#E4EDF7]
        bg-white
        p-4
        shadow-sm
      "
    >

      <div
        className={`
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-xl
          ${iconClass}
        `}
      >

        <Icon
          size={20}
        />

      </div>


      <div>

        <p
          className="
            text-[11px]
            text-slate-500
          "
        >
          {title}
        </p>

        <p
          className="
            mt-1
            text-xl
            font-bold
            text-[#0B3A67]
          "
        >
          {value}
        </p>

      </div>

    </div>
  );
}