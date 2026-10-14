"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useSearchParams } from "next/navigation";

import {
  Search,
  Users,
  UserCheck,
  UserX,
  ChevronDown,
  Eye,
} from "lucide-react";

import api from "@/services/api";


export default function TeacherStudentsPage() {
  const searchParams = useSearchParams();

  const [assignedClasses, setAssignedClasses] =
    useState([]);

  const [selectedClassId, setSelectedClassId] =
    useState("");

  const [students, setStudents] =
    useState([]);

  const [totalStudents, setTotalStudents] =
    useState(0);

  const [search, setSearch] =
    useState("");

  const [classesLoading, setClassesLoading] =
    useState(true);

  const [studentsLoading, setStudentsLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  // =========================================================
  // LOAD TEACHER ASSIGNED CLASSES
  // =========================================================

  useEffect(() => {
    const loadClasses = async () => {
      try {
        setClassesLoading(true);
        setError("");

        const response = await api.get(
          "/teacher/classes"
        );

        const classes = Array.isArray(response.data)
          ? response.data
          : [];

        setAssignedClasses(classes);

        const queryClassId =
          searchParams.get("class_id");

        const queryClassExists =
          classes.some(
            (item) =>
              String(item.id) ===
              String(queryClassId)
          );

        if (
          queryClassId &&
          queryClassExists
        ) {
          setSelectedClassId(
            String(queryClassId)
          );
        } else if (classes.length > 0) {
          setSelectedClassId(
            String(classes[0].id)
          );
        }
      } catch (err) {
        console.error(
          "Failed to load teacher classes:",
          err
        );

        setAssignedClasses([]);
        setError(
          "Unable to load assigned classes."
        );
      } finally {
        setClassesLoading(false);
      }
    };

    loadClasses();
  }, [searchParams]);


  // =========================================================
  // LOAD STUDENTS FOR SELECTED CLASS
  // =========================================================

  useEffect(() => {
    if (!selectedClassId) {
      return;
    }

    const loadStudents = async () => {
      try {
        setStudentsLoading(true);
        setError("");

        const response = await api.get(
          `/teacher/classes/${selectedClassId}/students`
        );

        const rows =
          Array.isArray(
            response.data?.students
          )
            ? response.data.students
            : [];

        const formattedStudents =
          rows.map((student) => ({
            id: student.id,

            admissionNo:
              student.admission_no || "—",

            name:
              student.full_name || "—",

            rollNo:
              student.roll_no || "—",

            className:
              student.class_name || "—",

            gender:
              student.gender || "—",

            status:
              student.status || "Active",

            // Attendance API is not connected
            // on this page yet.
            attendance: "—",
          }));

        setStudents(
          formattedStudents
        );

        setTotalStudents(
          response.data?.total ??
            formattedStudents.length
        );
      } catch (err) {
        console.error(
          "Failed to load students:",
          err
        );

        setStudents([]);
        setTotalStudents(0);

        setError(
          "Unable to load students."
        );
      } finally {
        setStudentsLoading(false);
      }
    };

    loadStudents();
  }, [selectedClassId]);


  // =========================================================
  // SELECTED CLASS
  // =========================================================

  const selectedClass =
    assignedClasses.find(
      (item) =>
        String(item.id) ===
        String(selectedClassId)
    );


  // =========================================================
  // SEARCH FILTER
  // =========================================================

  const filteredStudents =
    useMemo(() => {
      const searchValue =
        search.trim().toLowerCase();

      return students.filter(
        (student) => {
          if (!searchValue) {
            return true;
          }

          return (
            student.name
              .toLowerCase()
              .includes(searchValue) ||

            student.admissionNo
              .toLowerCase()
              .includes(searchValue) ||

            student.rollNo
              .toLowerCase()
              .includes(searchValue)
          );
        }
      );
    }, [students, search]);


  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="mx-auto max-w-[1400px]">

      {/* =========================================
          PAGE HEADER
      ========================================== */}

      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>

          <h1 className="text-2xl font-bold text-[#0B3A67]">
            Students
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View students assigned to your class.
          </p>

        </div>


        {/* CLASS SELECTOR */}

        <div className="relative w-full sm:w-[260px]">

          <select
            value={selectedClassId}
            onChange={(event) => {
              setSelectedClassId(
                event.target.value
              );

              setSearch("");
            }}
            disabled={
              classesLoading ||
              assignedClasses.length === 0
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
              transition
              disabled:cursor-not-allowed
              disabled:bg-slate-50
              disabled:text-slate-400
              focus:border-[#0075FF]
              focus:ring-2
              focus:ring-[#0075FF]/10
            "
          >

            {classesLoading ? (
              <option value="">
                Loading classes...
              </option>
            ) : assignedClasses.length === 0 ? (
              <option value="">
                No assigned classes
              </option>
            ) : (
              assignedClasses.map(
                (item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.display_name}
                    {item.subject
                      ? ` - ${item.subject}`
                      : ""}
                  </option>
                )
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


      {/* =========================================
          ERROR
      ========================================== */}

      {error && (
        <div
          className="
            mt-4
            rounded-xl
            border
            border-red-100
            bg-red-50
            px-4
            py-3
            text-sm
            font-medium
            text-red-600
          "
        >
          {error}
        </div>
      )}


      {/* =========================================
          SUMMARY CARDS
      ========================================== */}

      <div
        className="
          mt-6
          grid
          grid-cols-1
          gap-3
          sm:grid-cols-3
        "
      >

        <SummaryCard
          title="Total Students"
          value={
            studentsLoading
              ? "..."
              : totalStudents
          }
          icon={Users}
          iconClass="bg-[#EAF4FF] text-[#0075FF]"
        />


        <SummaryCard
          title="Present Today"
          value="—"
          icon={UserCheck}
          iconClass="bg-green-100 text-green-600"
        />


        <SummaryCard
          title="Absent Today"
          value="—"
          icon={UserX}
          iconClass="bg-red-100 text-red-500"
        />

      </div>


      {/* =========================================
          STUDENT LIST
      ========================================== */}

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
              Class Students
            </h2>


            <p className="mt-1 text-xs text-slate-400">

              {selectedClass
                ? selectedClass.display_name
                : "No class selected"}

              {" • "}

              {studentsLoading
                ? "Loading..."
                : `${filteredStudents.length} students shown`}

            </p>

          </div>


          {/* SEARCH */}

          <div
            className="
              flex
              w-full
              items-center
              rounded-xl
              border
              border-[#DCE8F5]
              bg-white
              px-3
              transition
              focus-within:border-[#0075FF]
              focus-within:ring-2
              focus-within:ring-[#0075FF]/10
              sm:w-[300px]
            "
          >

            <Search
              size={18}
              className="shrink-0 text-slate-400"
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
              className="
                w-full
                bg-transparent
                px-3
                py-3
                text-sm
                text-slate-700
                outline-none
                placeholder:text-slate-400
              "
            />

          </div>

        </div>


        {/* =========================================
            LOADING
        ========================================== */}

        {studentsLoading && (
          <div className="py-14 text-center">

            <div
              className="
                mx-auto
                h-7
                w-7
                animate-spin
                rounded-full
                border-2
                border-slate-200
                border-t-[#0075FF]
              "
            />

            <p className="mt-3 text-sm text-slate-400">
              Loading students...
            </p>

          </div>
        )}


        {/* =========================================
            DESKTOP TABLE
        ========================================== */}

        {!studentsLoading && (
          <div className="hidden overflow-x-auto md:block">

            <table className="w-full min-w-[850px]">

              <thead className="bg-[#F8FBFF]">

                <tr>

                  <TableHead>
                    Roll No.
                  </TableHead>

                  <TableHead>
                    Student
                  </TableHead>

                  <TableHead>
                    Admission No.
                  </TableHead>

                  <TableHead>
                    Gender
                  </TableHead>

                  <TableHead>
                    Attendance
                  </TableHead>

                  <TableHead>
                    Status
                  </TableHead>

                  <TableHead align="right">
                    Action
                  </TableHead>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-100">

                {filteredStudents.map(
                  (student) => (

                    <tr
                      key={student.id}
                      className="
                        transition
                        hover:bg-[#F8FBFF]
                      "
                    >

                      <TableData>
                        {student.rollNo}
                      </TableData>


                      <TableData>

                        <StudentInfo
                          student={student}
                        />

                      </TableData>


                      <TableData>
                        {student.admissionNo}
                      </TableData>


                      <TableData>
                        {student.gender}
                      </TableData>


                      <TableData>

                        <span className="font-semibold text-slate-400">
                          {student.attendance}
                        </span>

                      </TableData>


                      <TableData>

                        <StatusBadge
                          status={student.status}
                        />

                      </TableData>


                      <TableData align="right">

                        <button
                          type="button"
                          title="View student"
                          className="
                            inline-flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-[#DCE8F5]
                            text-[#0075FF]
                            transition
                            hover:border-[#0075FF]
                            hover:bg-[#EAF4FF]
                          "
                        >
                          <Eye size={17} />
                        </button>

                      </TableData>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>
        )}


        {/* =========================================
            MOBILE STUDENT CARDS
        ========================================== */}

        {!studentsLoading && (
          <div className="divide-y divide-slate-100 md:hidden">

            {filteredStudents.map(
              (student) => (

                <div
                  key={student.id}
                  className="p-4"
                >

                  <div className="flex items-start justify-between gap-3">

                    <StudentInfo
                      student={student}
                    />


                    <button
                      type="button"
                      title="View student"
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-[#EAF4FF]
                        text-[#0075FF]
                      "
                    >
                      <Eye size={17} />
                    </button>

                  </div>


                  <div
                    className="
                      mt-4
                      grid
                      grid-cols-3
                      gap-2
                    "
                  >

                    <MobileInfo
                      label="Roll No."
                      value={student.rollNo}
                    />


                    <MobileInfo
                      label="Admission"
                      value={student.admissionNo}
                    />


                    <MobileInfo
                      label="Gender"
                      value={student.gender}
                    />

                  </div>


                  <div className="mt-3">

                    <StatusBadge
                      status={student.status}
                    />

                  </div>

                </div>

              )
            )}

          </div>
        )}


        {/* =========================================
            EMPTY STATE
        ========================================== */}

        {!studentsLoading &&
          filteredStudents.length === 0 && (

            <div className="py-14 text-center">

              <Users
                size={36}
                className="mx-auto text-slate-300"
              />


              <h3 className="mt-3 font-semibold text-slate-700">
                No students found
              </h3>


              <p className="mt-1 text-sm text-slate-400">

                {search
                  ? "Try another student name, admission number, or roll number."
                  : "No students are available for this class."}

              </p>

            </div>

          )}

      </section>

    </div>
  );
}


/* =========================================
   SUMMARY CARD
========================================= */

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
        gap-4
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
          h-12
          w-12
          shrink-0
          items-center
          justify-center
          rounded-xl
          ${iconClass}
        `}
      >
        <Icon size={22} />
      </div>


      <div>

        <p className="text-xs text-slate-500">
          {title}
        </p>

        <p className="mt-1 text-xl font-bold text-[#0B3A67]">
          {value}
        </p>

      </div>

    </div>
  );
}


/* =========================================
   STUDENT INFO
========================================= */

function StudentInfo({
  student,
}) {
  const initials =
    student.name &&
    student.name !== "—"
      ? student.name
          .split(" ")
          .filter(Boolean)
          .map((name) => name[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "ST";

  return (
    <div className="flex items-center gap-3">

      <div
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-[#EAF4FF]
          text-xs
          font-bold
          text-[#0075FF]
        "
      >
        {initials}
      </div>


      <div>

        <p className="text-sm font-semibold text-[#0B3A67]">
          {student.name}
        </p>

        <p className="mt-0.5 text-xs text-slate-400">
          {student.className}
        </p>

      </div>

    </div>
  );
}


/* =========================================
   STATUS BADGE
========================================= */

function StatusBadge({
  status,
}) {
  const active =
    String(status).toLowerCase() ===
    "active";

  return (
    <span
      className={`
        inline-flex
        rounded-full
        px-3
        py-1
        text-xs
        font-semibold

        ${
          active
            ? "bg-green-50 text-green-600"
            : "bg-slate-100 text-slate-500"
        }
      `}
    >
      {status}
    </span>
  );
}


/* =========================================
   TABLE COMPONENTS
========================================= */

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
          align === "right"
            ? "text-right"
            : "text-left"
        }
      `}
    >
      {children}
    </th>
  );
}


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
          align === "right"
            ? "text-right"
            : "text-left"
        }
      `}
    >
      {children}
    </td>
  );
}


/* =========================================
   MOBILE INFO
========================================= */

function MobileInfo({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-[#F8FBFF] p-2.5">

      <p className="text-[10px] text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-semibold text-[#0B3A67]">
        {value}
      </p>

    </div>
  );
}