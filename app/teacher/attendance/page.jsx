"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarCheck,
  Check,
  ChevronDown,
  Loader2,
  Save,
  Search,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";

import {
  getTeacherAttendance,
  getTeacherClasses,
  saveTeacherAttendance,
} from "@/services/teacherService";


function getToday() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


export default function TeacherAttendancePage() {
  const [classes, setClasses] =
    useState([]);

  const [
    selectedClassId,
    setSelectedClassId,
  ] = useState("");

  const [
    attendanceDate,
    setAttendanceDate,
  ] = useState(getToday());

  const [students, setStudents] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // =========================================
  // LOAD CLASSES
  // =========================================

  useEffect(() => {
    const loadClasses = async () => {
      try {
        setLoading(true);

        const data =
          await getTeacherClasses();

        setClasses(data);

        if (data.length > 0) {
          setSelectedClassId(
            String(data[0].id)
          );
        }

      } catch (error) {
        console.error(error);

        setError(
          error.response?.data?.detail ||
          "Unable to load classes."
        );

      } finally {
        setLoading(false);
      }
    };

    loadClasses();
  }, []);


  // =========================================
  // LOAD ATTENDANCE
  // =========================================

  useEffect(() => {
    if (
      !selectedClassId ||
      !attendanceDate
    ) {
      return;
    }

    const loadAttendance =
      async () => {
        try {
          setLoading(true);
          setError("");
          setSuccess("");

          const data =
            await getTeacherAttendance(
              selectedClassId,
              attendanceDate
            );

          setStudents(
            (data.students || []).map(
              (student) => ({
                ...student,

                status:
                  student.status || null,

                remarks:
                  student.remarks || "",
              })
            )
          );

        } catch (error) {
          console.error(error);

          setStudents([]);

          setError(
            error.response?.data
              ?.detail ||
            "Unable to load attendance."
          );

        } finally {
          setLoading(false);
        }
      };

    loadAttendance();

  }, [
    selectedClassId,
    attendanceDate,
  ]);


  // =========================================
  // FILTER
  // =========================================

  const filteredStudents =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      if (!value) {
        return students;
      }

      return students.filter(
        (student) =>
          student.full_name
            .toLowerCase()
            .includes(value) ||

          student.admission_no
            .toLowerCase()
            .includes(value) ||

          (
            student.roll_no || ""
          )
            .toLowerCase()
            .includes(value)
      );

    }, [
      students,
      search,
    ]);


  // =========================================
  // SUMMARY
  // =========================================

  const presentCount =
    students.filter(
      (student) =>
        student.status === "PRESENT"
    ).length;

  const absentCount =
    students.filter(
      (student) =>
        student.status === "ABSENT"
    ).length;

  const notMarkedCount =
    students.length -
    presentCount -
    absentCount;


  // =========================================
  // CHANGE STATUS
  // =========================================

  const updateStatus = (
    studentId,
    status
  ) => {
    setStudents((previous) =>
      previous.map((student) =>
        student.student_id === studentId
          ? {
              ...student,
              status,
            }
          : student
      )
    );

    setSuccess("");
  };


  // =========================================
  // MARK ALL PRESENT
  // =========================================

  const markAllPresent = () => {
    setStudents((previous) =>
      previous.map((student) => ({
        ...student,
        status: "PRESENT",
      }))
    );

    setSuccess("");
  };


  // =========================================
  // SAVE
  // =========================================

  const handleSave =
    async () => {

      if (!selectedClassId) {
        return;
      }

      if (notMarkedCount > 0) {
        setError(
          `Please mark attendance for all students. ${notMarkedCount} student(s) are not marked.`
        );

        return;
      }

      try {
        setSaving(true);

        setError("");
        setSuccess("");

        const payload = {
          attendance_date:
            attendanceDate,

          records: students.map(
            (student) => ({
              student_id:
                student.student_id,

              status:
                student.status,

              remarks:
                student.remarks || null,
            })
          ),
        };

        const response =
          await saveTeacherAttendance(
            selectedClassId,
            payload
          );

        setSuccess(
          response.message ||
          "Attendance saved successfully."
        );

      } catch (error) {
        console.error(error);

        setError(
          error.response?.data
            ?.detail ||
          "Unable to save attendance."
        );

      } finally {
        setSaving(false);
      }
    };


  return (
    <div className="mx-auto max-w-[1400px]">

      {/* PAGE HEADER */}
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
            Attendance
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Mark and manage daily student attendance.
          </p>

        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={
            saving ||
            loading ||
            students.length === 0
          }
          className="
            flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-[#0075FF]
            px-5
            py-3
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-[#0065DD]
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {saving ? (
            <>
              <Loader2
                size={18}
                className="animate-spin"
              />

              Saving...
            </>
          ) : (
            <>
              <Save size={18} />

              Save Attendance
            </>
          )}

        </button>
      </div>


      {/* FILTER CARD */}
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

        {/* CLASS */}
        <div>

          <label className="mb-2 block text-xs font-semibold text-[#0B3A67]">
            Select Class
          </label>

          <div className="relative">

            <select
              value={selectedClassId}
              onChange={(event) =>
                setSelectedClassId(
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
              {classes.map(
                (schoolClass) => (
                  <option
                    key={schoolClass.id}
                    value={schoolClass.id}
                  >
                    {
                      schoolClass.display_name
                    }
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


        {/* DATE */}
        <div>

          <label className="mb-2 block text-xs font-semibold text-[#0B3A67]">
            Attendance Date
          </label>

          <input
            type="date"
            value={attendanceDate}
            onChange={(event) =>
              setAttendanceDate(
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
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}


      {/* SUCCESS */}
      {success && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-600">

          <Check size={17} />

          {success}

        </div>
      )}


      {/* SUMMARY */}
      <div
        className="
          mt-5
          grid
          grid-cols-2
          gap-3
          lg:grid-cols-4
        "
      >
        <Summary
          title="Total Students"
          value={students.length}
          icon={Users}
          styleClass="bg-[#EAF4FF] text-[#0075FF]"
        />

        <Summary
          title="Present"
          value={presentCount}
          icon={UserCheck}
          styleClass="bg-green-100 text-green-600"
        />

        <Summary
          title="Absent"
          value={absentCount}
          icon={UserX}
          styleClass="bg-red-100 text-red-500"
        />

        <Summary
          title="Not Marked"
          value={notMarkedCount}
          icon={CalendarCheck}
          styleClass="bg-orange-100 text-orange-500"
        />
      </div>


      {/* ATTENDANCE CARD */}
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

          <button
            type="button"
            onClick={markAllPresent}
            disabled={
              loading ||
              students.length === 0
            }
            className="
              rounded-xl
              border
              border-green-200
              bg-green-50
              px-4
              py-2.5
              text-xs
              font-semibold
              text-green-600
              transition
              hover:bg-green-100
            "
          >
            Mark All Present
          </button>


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
                py-2.5
                text-sm
                outline-none
              "
            />

          </div>
        </div>


        {/* LOADING */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-500">

            <Loader2
              size={20}
              className="animate-spin text-[#0075FF]"
            />

            Loading attendance...

          </div>
        )}


        {/* STUDENTS */}
        {!loading && (
          <div className="divide-y divide-slate-100">

            {filteredStudents.map(
              (student) => (
                <StudentAttendanceRow
                  key={student.student_id}
                  student={student}
                  updateStatus={
                    updateStatus
                  }
                />
              )
            )}

          </div>
        )}


        {!loading &&
          filteredStudents.length === 0 && (
            <div className="py-14 text-center text-sm text-slate-400">
              No students found.
            </div>
          )}

      </section>

    </div>
  );
}


/* =========================================
   STUDENT ATTENDANCE ROW
========================================= */

function StudentAttendanceRow({
  student,
  updateStatus,
}) {
  const initials =
    student.full_name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <div
      className="
        flex
        flex-col
        gap-4
        p-4
        sm:flex-row
        sm:items-center
        sm:justify-between
      "
    >

      {/* STUDENT */}
      <div className="flex items-center gap-3">

        <div
          className="
            flex
            h-11
            w-11
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
            {student.full_name}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Roll {student.roll_no || "--"}
            {" • "}
            {student.admission_no}
          </p>

        </div>

      </div>


      {/* ATTENDANCE BUTTONS */}
      <div className="grid grid-cols-2 gap-2 sm:flex">

        <button
          type="button"
          onClick={() =>
            updateStatus(
              student.student_id,
              "PRESENT"
            )
          }
          className={`
            rounded-xl
            border
            px-4
            py-2.5
            text-xs
            font-semibold
            transition

            ${
              student.status ===
              "PRESENT"
                ? "border-green-500 bg-green-500 text-white"
                : "border-green-200 bg-green-50 text-green-600 hover:bg-green-100"
            }
          `}
        >
          Present
        </button>

        <button
          type="button"
          onClick={() =>
            updateStatus(
              student.student_id,
              "ABSENT"
            )
          }
          className={`
            rounded-xl
            border
            px-4
            py-2.5
            text-xs
            font-semibold
            transition

            ${
              student.status ===
              "ABSENT"
                ? "border-red-500 bg-red-500 text-white"
                : "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
            }
          `}
        >
          Absent
        </button>

      </div>

    </div>
  );
}


/* =========================================
   SUMMARY
========================================= */

function Summary({
  title,
  value,
  icon: Icon,
  styleClass,
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
          ${styleClass}
        `}
      >
        <Icon size={20} />
      </div>

      <div>

        <p className="text-[11px] text-slate-500">
          {title}
        </p>

        <p className="mt-1 text-xl font-bold text-[#0B3A67]">
          {value}
        </p>

      </div>

    </div>
  );
}