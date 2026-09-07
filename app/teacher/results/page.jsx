"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Award,
  ChevronDown,
  Loader2,
  Save,
  Search,
  Users,
} from "lucide-react";

import {
  getTeacherClasses,
  getTeacherExams,
  getTeacherResults,
  saveTeacherResults,
} from "@/services/teacherService";


// =========================================================
// GRADE CALCULATION
// Keep this matching backend grading logic
// =========================================================

function calculateGrade(
  obtainedMarks,
  maxMarks
) {
  const obtained = Number(
    obtainedMarks
  );

  const maximum = Number(
    maxMarks
  );

  if (
    Number.isNaN(obtained) ||
    Number.isNaN(maximum) ||
    maximum <= 0 ||
    obtainedMarks === ""
  ) {
    return "--";
  }

  const percentage =
    (obtained / maximum) * 100;

  if (percentage >= 90) {
    return "A+";
  }

  if (percentage >= 80) {
    return "A";
  }

  if (percentage >= 70) {
    return "B+";
  }

  if (percentage >= 60) {
    return "B";
  }

  if (percentage >= 50) {
    return "C";
  }

  if (percentage >= 40) {
    return "D";
  }

  return "F";
}


// =========================================================
// MAIN PAGE
// =========================================================

export default function TeacherResultsPage() {
  const [classes, setClasses] =
    useState([]);

  const [exams, setExams] =
    useState([]);

  const [
    selectedClassId,
    setSelectedClassId,
  ] = useState("");

  const [
    selectedExamId,
    setSelectedExamId,
  ] = useState("");

  const [subject, setSubject] =
    useState("");

  const [students, setStudents] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [initialLoading, setInitialLoading] =
    useState(true);

  const [resultsLoading, setResultsLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // =========================================================
  // LOAD CLASSES + EXAMS
  // =========================================================

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setInitialLoading(true);

        setError("");

        const [
          classData,
          examData,
        ] = await Promise.all([
          getTeacherClasses(),
          getTeacherExams(),
        ]);

        const safeClasses =
          Array.isArray(classData)
            ? classData
            : classData?.classes || [];

        const safeExams =
          Array.isArray(examData)
            ? examData
            : examData?.exams || [];

        setClasses(
          safeClasses
        );

        setExams(
          safeExams
        );

        // -----------------------------------------
        // Default class
        // -----------------------------------------

        if (
          safeClasses.length > 0
        ) {
          const firstClass =
            safeClasses[0];

          setSelectedClassId(
            String(firstClass.id)
          );

          setSubject(
            firstClass.subject || ""
          );
        }

        // -----------------------------------------
        // Default exam
        // -----------------------------------------

        if (
          safeExams.length > 0
        ) {
          setSelectedExamId(
            String(
              safeExams[0].id
            )
          );
        }

      } catch (err) {
        console.error(
          "Initial results data error:",
          err
        );

        setError(
          err?.response?.data?.detail ||
          "Unable to load class and exam information."
        );

      } finally {
        setInitialLoading(false);
      }
    };

    loadInitialData();

  }, []);


  // =========================================================
  // CLASS CHANGE
  // =========================================================

  const handleClassChange = (
    event
  ) => {
    const classId =
      event.target.value;

    setSelectedClassId(
      classId
    );

    setStudents([]);

    setResultsLoading(false);

    setError("");
    setSuccess("");

    const selectedClass =
      classes.find(
        (item) =>
          String(item.id) ===
          String(classId)
      );

    setSubject(
      selectedClass?.subject ||
      ""
    );
  };


  // =========================================================
  // EXAM CHANGE
  // =========================================================

  const handleExamChange = (
    event
  ) => {
    setSelectedExamId(
      event.target.value
    );

    setStudents([]);

    setResultsLoading(false);

    setError("");
    setSuccess("");
  };


  // =========================================================
  // LOAD RESULT SHEET
  // =========================================================

  useEffect(() => {
    if (
      !selectedClassId ||
      !selectedExamId ||
      !subject.trim()
    ) {
      return;
    }

    let cancelled = false;

    const loadResults =
      async () => {
        try {
          setResultsLoading(
            true
          );

          setError("");
          setSuccess("");

          const data =
            await getTeacherResults(
              selectedClassId,
              selectedExamId,
              subject.trim()
            );

          const resultStudents =
            Array.isArray(data)
              ? data
              : Array.isArray(
                  data?.students
                )
              ? data.students
              : [];

          if (!cancelled) {
            setStudents(
              resultStudents.map(
                (student) => ({
                  ...student,

                  max_marks:
                    student.max_marks ??
                    100,

                  obtained_marks:
                    student.obtained_marks ??
                    "",

                  remarks:
                    student.remarks ||
                    "",
                })
              )
            );
          }

        } catch (err) {
          console.error(
            "Load results error:",
            err
          );

          if (!cancelled) {
            setStudents([]);

            setError(
              err?.response?.data?.detail ||
              "Unable to load student results."
            );
          }

        } finally {
          if (!cancelled) {
            setResultsLoading(
              false
            );
          }
        }
      };

    const timeout =
      setTimeout(
        loadResults,
        300
      );

    return () => {
      cancelled = true;

      clearTimeout(
        timeout
      );
    };

  }, [
    selectedClassId,
    selectedExamId,
    subject,
  ]);


  // =========================================================
  // UPDATE STUDENT RESULT
  // =========================================================

  const updateStudent = (
    studentId,
    field,
    value
  ) => {
    setStudents(
      (previous) =>
        previous.map(
          (student) =>
            student.student_id ===
            studentId
              ? {
                  ...student,
                  [field]:
                    value,
                }
              : student
        )
    );

    setError("");
    setSuccess("");
  };


  // =========================================================
  // FILTER STUDENTS
  // =========================================================

  const filteredStudents =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return students;
      }

      return students.filter(
        (student) => {
          const name =
            student.full_name
              ?.toLowerCase() ||
            "";

          const admission =
            student.admission_no
              ?.toLowerCase() ||
            "";

          const roll =
            student.roll_no
              ?.toLowerCase() ||
            "";

          return (
            name.includes(value) ||
            admission.includes(
              value
            ) ||
            roll.includes(value)
          );
        }
      );

    }, [
      students,
      search,
    ]);


  // =========================================================
  // SUMMARY
  // =========================================================

  const completedCount =
    students.filter(
      (student) =>
        student.obtained_marks !==
          "" &&
        student.obtained_marks !==
          null &&
        student.max_marks !==
          "" &&
        student.max_marks !==
          null
    ).length;


  const pendingCount =
    students.length -
    completedCount;


  // =========================================================
  // SAVE RESULTS
  // =========================================================

  const handleSave =
    async () => {
      setError("");
      setSuccess("");

      // -----------------------------------------
      // Basic validation
      // -----------------------------------------

      if (!selectedClassId) {
        setError(
          "Please select a class."
        );

        return;
      }

      if (!selectedExamId) {
        setError(
          "Please select an exam."
        );

        return;
      }

      if (!subject.trim()) {
        setError(
          "Please enter a subject."
        );

        return;
      }

      if (
        students.length === 0
      ) {
        setError(
          "No students available to save."
        );

        return;
      }

      // -----------------------------------------
      // Validate every student
      // -----------------------------------------

      for (
        const student
        of students
      ) {
        if (
          student.max_marks ===
            "" ||
          student.max_marks ===
            null
        ) {
          setError(
            `Enter maximum marks for ${student.full_name}.`
          );

          return;
        }

        if (
          student.obtained_marks ===
            "" ||
          student.obtained_marks ===
            null
        ) {
          setError(
            `Enter obtained marks for ${student.full_name}.`
          );

          return;
        }

        const maxMarks =
          Number(
            student.max_marks
          );

        const obtainedMarks =
          Number(
            student.obtained_marks
          );

        if (
          Number.isNaN(
            maxMarks
          ) ||
          maxMarks <= 0
        ) {
          setError(
            `Maximum marks must be greater than 0 for ${student.full_name}.`
          );

          return;
        }

        if (
          Number.isNaN(
            obtainedMarks
          ) ||
          obtainedMarks < 0
        ) {
          setError(
            `Obtained marks cannot be negative for ${student.full_name}.`
          );

          return;
        }

        if (
          obtainedMarks >
          maxMarks
        ) {
          setError(
            `Obtained marks cannot exceed maximum marks for ${student.full_name}.`
          );

          return;
        }
      }


      // -----------------------------------------
      // Prepare payload
      // -----------------------------------------

      const payload = {
        exam_id:
          Number(
            selectedExamId
          ),

        subject:
          subject.trim(),

        results:
          students.map(
            (student) => ({
              student_id:
                student.student_id,

              max_marks:
                Number(
                  student.max_marks
                ),

              obtained_marks:
                Number(
                  student.obtained_marks
                ),

              remarks:
                student.remarks
                  ?.trim()
                  ? student.remarks.trim()
                  : null,
            })
          ),
      };


      // -----------------------------------------
      // Save
      // -----------------------------------------

      try {
        setSaving(true);

        const response =
          await saveTeacherResults(
            selectedClassId,
            payload
          );

        setSuccess(
          response?.message ||
          "Results saved successfully."
        );


        // -----------------------------------------
        // Reload from backend
        // -----------------------------------------

        const refreshed =
          await getTeacherResults(
            selectedClassId,
            selectedExamId,
            subject.trim()
          );

        const refreshedStudents =
          Array.isArray(refreshed)
            ? refreshed
            : Array.isArray(
                refreshed?.students
              )
            ? refreshed.students
            : [];

        setStudents(
          refreshedStudents.map(
            (student) => ({
              ...student,

              max_marks:
                student.max_marks ??
                100,

              obtained_marks:
                student.obtained_marks ??
                "",

              remarks:
                student.remarks ||
                "",
            })
          )
        );

      } catch (err) {
        console.error(
          "Save results error:",
          err
        );

        setError(
          err?.response?.data?.detail ||
          "Unable to save results."
        );

      } finally {
        setSaving(false);
      }
    };


  // =========================================================
  // INITIAL LOADING
  // =========================================================

  if (initialLoading) {
    return (
      <div
        className="
          flex
          min-h-[500px]
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
            Loading academic results...
          </p>

        </div>
      </div>
    );
  }


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

          <h1
            className="
              text-2xl
              font-bold
              text-[#0B3A67]
            "
          >
            Academic Results
          </h1>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            Enter and manage student examination marks.
          </p>

        </div>


        <button
          type="button"
          onClick={
            handleSave
          }
          disabled={
            saving ||
            resultsLoading ||
            students.length ===
              0
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
            shadow-sm
            shadow-[#0075FF]/20
            transition
            hover:bg-[#0065DD]
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
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
              <Save size={17} />

              Save Results
            </>
          )}

        </button>

      </div>


      {/* =========================================
          FILTERS
      ========================================== */}

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
          md:grid-cols-3
        "
      >

        {/* CLASS */}

        <SelectField
          label="Select Class"
          value={
            selectedClassId
          }
          onChange={
            handleClassChange
          }
          disabled={
            classes.length ===
            0
          }
        >

          {classes.length ===
            0 && (
            <option value="">
              No classes assigned
            </option>
          )}

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


        {/* EXAM */}

        <SelectField
          label="Select Exam"
          value={
            selectedExamId
          }
          onChange={
            handleExamChange
          }
          disabled={
            exams.length === 0
          }
        >

          {exams.length ===
            0 && (
            <option value="">
              No exams available
            </option>
          )}

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


        {/* SUBJECT */}

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
            Subject
          </label>

          <input
            type="text"
            value={subject}
            onChange={(
              event
            ) => {
              setSubject(
                event.target.value
              );

              setStudents(
                []
              );

              setResultsLoading(
                false
              );

              setError("");
              setSuccess("");
            }}
            placeholder="Mathematics"
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
              transition
              focus:border-[#0075FF]
              focus:ring-2
              focus:ring-[#0075FF]/10
            "
          />

        </div>

      </section>


      {/* =========================================
          ERROR
      ========================================== */}

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


      {/* =========================================
          SUCCESS
      ========================================== */}

      {success && (
        <div
          className="
            mt-4
            rounded-xl
            border
            border-green-200
            bg-green-50
            px-4
            py-3
            text-sm
            font-medium
            text-green-600
          "
        >
          {success}
        </div>
      )}


      {/* =========================================
          SUMMARY
      ========================================== */}

      <section
        className="
          mt-5
          grid
          grid-cols-1
          gap-3
          sm:grid-cols-3
        "
      >

        <SummaryCard
          title="Total Students"
          value={
            students.length
          }
          icon={Users}
          iconClass="
            bg-[#EAF4FF]
            text-[#0075FF]
          "
        />

        <SummaryCard
          title="Marks Entered"
          value={
            completedCount
          }
          icon={Award}
          iconClass="
            bg-green-100
            text-green-600
          "
        />

        <SummaryCard
          title="Pending"
          value={
            pendingCount
          }
          icon={Award}
          iconClass="
            bg-orange-100
            text-orange-500
          "
        />

      </section>


      {/* =========================================
          RESULT SHEET
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
              Student Marks
            </h2>

            <p
              className="
                mt-1
                text-xs
                text-slate-400
              "
            >
              {students.length} student(s)
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
              size={17}
              className="shrink-0 text-slate-400"
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
              placeholder="Search student..."
              className="
                w-full
                bg-transparent
                px-3
                py-2.5
                text-sm
                text-slate-700
                outline-none
                placeholder:text-slate-400
              "
            />

          </div>

        </div>


        {/* COLUMN HEADER DESKTOP */}

        {!resultsLoading &&
          students.length >
            0 && (
          <div
            className="
              hidden
              grid-cols-[1.5fr_130px_130px_90px_1fr]
              gap-4
              border-b
              border-slate-100
              bg-[#F8FBFF]
              px-4
              py-3
              lg:grid
            "
          >

            <ColumnTitle>
              Student
            </ColumnTitle>

            <ColumnTitle>
              Max Marks
            </ColumnTitle>

            <ColumnTitle>
              Obtained
            </ColumnTitle>

            <ColumnTitle>
              Grade
            </ColumnTitle>

            <ColumnTitle>
              Remarks
            </ColumnTitle>

          </div>
        )}


        {/* LOADING */}

        {resultsLoading && (
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

            Loading results...

          </div>
        )}


        {/* STUDENTS */}

        {!resultsLoading &&
          filteredStudents.length >
            0 && (
          <div
            className="
              divide-y
              divide-slate-100
            "
          >

            {filteredStudents.map(
              (student) => (
                <ResultRow
                  key={
                    student.student_id
                  }
                  student={
                    student
                  }
                  updateStudent={
                    updateStudent
                  }
                />
              )
            )}

          </div>
        )}


        {/* EMPTY */}

        {!resultsLoading &&
          students.length ===
            0 && (
          <div
            className="
              py-16
              text-center
            "
          >

            <Award
              size={38}
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
              No result data
            </h3>

            <p
              className="
                mt-1
                text-sm
                text-slate-400
              "
            >
              Select a valid class,
              exam and subject.
            </p>

          </div>
        )}


        {!resultsLoading &&
          students.length >
            0 &&
          filteredStudents.length ===
            0 && (
          <div
            className="
              py-14
              text-center
              text-sm
              text-slate-400
            "
          >
            No students match your search.
          </div>
        )}

      </section>

    </div>
  );
}


// =========================================================
// RESULT ROW
// =========================================================

function ResultRow({
  student,
  updateStudent,
}) {
  const grade =
    calculateGrade(
      student.obtained_marks,
      student.max_marks
    );

  const initials =
    student.full_name
      ?.split(" ")
      .filter(Boolean)
      .map(
        (item) =>
          item[0]
      )
      .slice(0, 2)
      .join("")
      .toUpperCase() ||
    "ST";


  const obtained =
    Number(
      student.obtained_marks
    );

  const maximum =
    Number(
      student.max_marks
    );


  const marksInvalid =
    student.obtained_marks !==
      "" &&
    student.max_marks !==
      "" &&
    (
      Number.isNaN(obtained) ||
      Number.isNaN(maximum) ||
      obtained < 0 ||
      maximum <= 0 ||
      obtained > maximum
    );


  return (
    <div
      className="
        grid
        gap-4
        p-4
        lg:grid-cols-[1.5fr_130px_130px_90px_1fr]
        lg:items-center
      "
    >

      {/* STUDENT */}

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

        <div
          className="
            min-w-0
          "
        >

          <p
            className="
              truncate
              text-sm
              font-semibold
              text-[#0B3A67]
            "
          >
            {
              student.full_name
            }
          </p>

          <p
            className="
              mt-1
              text-xs
              text-slate-400
            "
          >
            Roll{" "}
            {
              student.roll_no ||
              "--"
            }
            {" • "}
            {
              student.admission_no
            }
          </p>

        </div>

      </div>


      {/* MAX MARKS */}

      <MarksInput
        label="Max Marks"
        value={
          student.max_marks
        }
        onChange={(value) =>
          updateStudent(
            student.student_id,
            "max_marks",
            value
          )
        }
      />


      {/* OBTAINED MARKS */}

      <MarksInput
        label="Obtained Marks"
        value={
          student.obtained_marks
        }
        error={
          marksInvalid
        }
        onChange={(value) =>
          updateStudent(
            student.student_id,
            "obtained_marks",
            value
          )
        }
      />


      {/* GRADE */}

      <div>

        <p
          className="
            mb-1
            text-[10px]
            font-medium
            uppercase
            tracking-wide
            text-slate-400
            lg:hidden
          "
        >
          Grade
        </p>

        <div
          className={`
            flex
            h-[42px]
            items-center
            justify-center
            rounded-xl
            px-3
            text-sm
            font-bold

            ${
              grade === "F"
                ? "bg-red-50 text-red-500"
                : grade === "--"
                ? "bg-slate-100 text-slate-400"
                : "bg-[#EAF4FF] text-[#0075FF]"
            }
          `}
        >
          {grade}
        </div>

      </div>


      {/* REMARKS */}

      <div>

        <p
          className="
            mb-1
            text-[10px]
            font-medium
            uppercase
            tracking-wide
            text-slate-400
            lg:hidden
          "
        >
          Remarks
        </p>

        <input
          type="text"
          value={
            student.remarks ||
            ""
          }
          onChange={(
            event
          ) =>
            updateStudent(
              student.student_id,
              "remarks",
              event.target.value
            )
          }
          placeholder="Enter remarks"
          className="
            w-full
            rounded-xl
            border
            border-[#DCE8F5]
            bg-white
            px-3
            py-2.5
            text-sm
            text-slate-700
            outline-none
            transition
            placeholder:text-slate-400
            focus:border-[#0075FF]
            focus:ring-2
            focus:ring-[#0075FF]/10
          "
        />

      </div>


      {/* MOBILE ERROR */}

      {marksInvalid && (
        <div
          className="
            text-xs
            font-medium
            text-red-500
            lg:col-span-5
          "
        >
          Obtained marks cannot exceed maximum marks.
        </div>
      )}

    </div>
  );
}


// =========================================================
// MARKS INPUT
// =========================================================

function MarksInput({
  label,
  value,
  onChange,
  error = false,
}) {
  return (
    <div>

      <p
        className="
          mb-1
          text-[10px]
          font-medium
          uppercase
          tracking-wide
          text-slate-400
          lg:hidden
        "
      >
        {label}
      </p>

      <input
        type="number"
        min="0"
        step="0.01"
        value={
          value ?? ""
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        className={`
          w-full
          rounded-xl
          border
          bg-white
          px-3
          py-2.5
          text-sm
          font-semibold
          text-[#0B3A67]
          outline-none
          transition

          ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              : "border-[#DCE8F5] focus:border-[#0075FF] focus:ring-2 focus:ring-[#0075FF]/10"
          }
        `}
      />

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
  disabled = false,
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

      <div
        className="
          relative
        "
      >

        <select
          value={value}
          onChange={
            onChange
          }
          disabled={
            disabled
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
        <Icon
          size={22}
        />
      </div>

      <div>

        <p
          className="
            text-xs
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


// =========================================================
// DESKTOP COLUMN TITLE
// =========================================================

function ColumnTitle({
  children,
}) {
  return (
    <p
      className="
        text-[11px]
        font-semibold
        uppercase
        tracking-wide
        text-slate-500
      "
    >
      {children}
    </p>
  );
}
