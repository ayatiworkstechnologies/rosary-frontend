"use client";

import { useMemo, useState } from "react";

import {
  Search,
  Users,
  UserCheck,
  UserX,
  ChevronDown,
  Eye,
} from "lucide-react";

const studentsData = [
  {
    id: 1,
    admissionNo: "ROS001",
    name: "Ashvik R",
    rollNo: "01",
    className: "VIII - A",
    gender: "Male",
    attendance: "94%",
    status: "Active",
  },
  {
    id: 2,
    admissionNo: "ROS002",
    name: "Aaradhya S",
    rollNo: "02",
    className: "VIII - A",
    gender: "Female",
    attendance: "96%",
    status: "Active",
  },
  {
    id: 3,
    admissionNo: "ROS003",
    name: "Aditya Kumar",
    rollNo: "03",
    className: "VIII - A",
    gender: "Male",
    attendance: "89%",
    status: "Active",
  },
  {
    id: 4,
    admissionNo: "ROS004",
    name: "Harini K",
    rollNo: "04",
    className: "VIII - A",
    gender: "Female",
    attendance: "92%",
    status: "Active",
  },
  {
    id: 5,
    admissionNo: "ROS005",
    name: "Joshua M",
    rollNo: "05",
    className: "VIII - A",
    gender: "Male",
    attendance: "85%",
    status: "Active",
  },
];

export default function TeacherStudentsPage() {
  const [selectedClass, setSelectedClass] =
    useState("VIII - A");

  const [search, setSearch] = useState("");

  const filteredStudents = useMemo(() => {
    return studentsData.filter((student) => {
      const matchesClass =
        student.className === selectedClass;

      const searchValue =
        search.trim().toLowerCase();

      const matchesSearch =
        !searchValue ||
        student.name
          .toLowerCase()
          .includes(searchValue) ||
        student.admissionNo
          .toLowerCase()
          .includes(searchValue) ||
        student.rollNo
          .toLowerCase()
          .includes(searchValue);

      return matchesClass && matchesSearch;
    });
  }, [selectedClass, search]);

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
        <div className="relative w-full sm:w-[220px]">
          <select
            value={selectedClass}
            onChange={(event) =>
              setSelectedClass(event.target.value)
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
              focus:border-[#0075FF]
              focus:ring-2
              focus:ring-[#0075FF]/10
            "
          >
            <option>VIII - A</option>
            <option>VIII - B</option>
            <option>IX - A</option>
            <option>IX - B</option>
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
          value="38"
          icon={Users}
          iconClass="bg-[#EAF4FF] text-[#0075FF]"
        />

        <SummaryCard
          title="Present Today"
          value="35"
          icon={UserCheck}
          iconClass="bg-green-100 text-green-600"
        />

        <SummaryCard
          title="Absent Today"
          value="3"
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
              {selectedClass} •{" "}
              {filteredStudents.length} students shown
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
                setSearch(event.target.value)
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
            DESKTOP TABLE
        ========================================== */}
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
                      <span
                        className={`
                          font-semibold
                          ${
                            parseInt(
                              student.attendance
                            ) >= 90
                              ? "text-green-600"
                              : "text-orange-500"
                          }
                        `}
                      >
                        {student.attendance}
                      </span>
                    </TableData>

                    <TableData>
                      <span
                        className="
                          rounded-full
                          bg-green-50
                          px-3
                          py-1
                          text-xs
                          font-semibold
                          text-green-600
                        "
                      >
                        {student.status}
                      </span>
                    </TableData>

                    <TableData align="right">
                      <button
                        type="button"
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

        {/* =========================================
            MOBILE STUDENT CARDS
        ========================================== */}
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
                    label="Attendance"
                    value={student.attendance}
                  />
                </div>
              </div>
            )
          )}
        </div>

        {/* EMPTY STATE */}
        {filteredStudents.length === 0 && (
          <div className="py-14 text-center">
            <Users
              size={36}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-3 font-semibold text-slate-700">
              No students found
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Try another student name or class.
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
  const initials = student.name
    .split(" ")
    .map((name) => name[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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