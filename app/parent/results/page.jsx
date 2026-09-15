"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Award,
  BookOpen,
  ChevronDown,
  GraduationCap,
  Loader2,
  School,
  TrendingUp,
  UserRound,
} from "lucide-react";

import {
  useSearchParams,
} from "next/navigation";

import {
  getParentChildren,
  getParentChildResultExams,
  getParentChildResults,
} from "@/services/parentService";


// =========================================================
// MAIN PAGE
// =========================================================

export default function ParentResultsPage() {
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
    exams,
    setExams,
  ] = useState([]);


  const [
    selectedExamId,
    setSelectedExamId,
  ] = useState("");


  const [
    resultData,
    setResultData,
  ] = useState(null);


  const [
    initialLoading,
    setInitialLoading,
  ] = useState(true);


  const [
    examsLoading,
    setExamsLoading,
  ] = useState(false);


  const [
    resultsLoading,
    setResultsLoading,
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
                String(
                  child.id
                ) ===
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

  }, [
    requestedStudentId,
  ]);


  // =======================================================
  // LOAD EXAMS
  // =======================================================

  useEffect(() => {
    if (
      !selectedStudentId
    ) {
      return;
    }


    const loadExams =
      async () => {

        try {

          setExamsLoading(
            true
          );

          setError("");

          setResultData(
            null
          );

          setSelectedExamId(
            ""
          );


          const data =
            await getParentChildResultExams(
              selectedStudentId
            );


          const examList =
            Array.isArray(
              data?.exams
            )
              ? data.exams
              : [];


          setExams(
            examList
          );


          if (
            examList.length > 0
          ) {

            setSelectedExamId(
              String(
                examList[0].id
              )
            );

          }

        } catch (err) {

          console.error(
            "Load exams:",
            err
          );


          setExams([]);

          setResultData(
            null
          );


          setError(
            err?.response
              ?.data
              ?.detail ||
            "Unable to load examinations."
          );

        } finally {

          setExamsLoading(
            false
          );

        }
      };


    loadExams();

  }, [
    selectedStudentId,
  ]);


  // =======================================================
  // LOAD RESULTS
  // =======================================================

  useEffect(() => {
    if (
      !selectedStudentId ||
      !selectedExamId
    ) {
      return;
    }


    const loadResults =
      async () => {

        try {

          setResultsLoading(
            true
          );

          setError("");


          const data =
            await getParentChildResults(
              selectedStudentId,
              selectedExamId
            );


          setResultData(
            data
          );

        } catch (err) {

          console.error(
            "Parent results:",
            err
          );


          setResultData(
            null
          );


          setError(
            err?.response
              ?.data
              ?.detail ||
            "Unable to load results."
          );

        } finally {

          setResultsLoading(
            false
          );

        }
      };


    loadResults();

  }, [
    selectedStudentId,
    selectedExamId,
  ]);


  // =======================================================
  // LOADING
  // =======================================================

  if (initialLoading) {
    return (
      <LoadingScreen
        text="Loading academic results..."
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

      {/* HEADER */}

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
          View your child&apos;s
          examination marks, grades
          and performance.
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

        <SelectField
          label="Select Child"
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
          disabled={
            children.length ===
            0
          }
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

        </SelectField>


        {/* EXAM */}

        <SelectField
          label="Select Examination"
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
          disabled={
            examsLoading ||
            exams.length === 0
          }
        >

          {examsLoading ? (
            <option value="">
              Loading examinations...
            </option>
          ) : exams.length ===
            0 ? (
            <option value="">
              No results available
            </option>
          ) : (
            exams.map(
              (exam) => (
                <option
                  key={exam.id}
                  value={exam.id}
                >
                  {exam.name}
                  {" - "}
                  {exam.academic_year}
                </option>
              )
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


      {/* RESULTS LOADING */}

      {resultsLoading && (
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

          Loading examination results...

        </div>
      )}


      {/* NO EXAMS */}

      {!examsLoading &&
        exams.length === 0 &&
        selectedStudentId &&
        !error && (
        <EmptyResults />
      )}


      {/* RESULT */}

      {!resultsLoading &&
        resultData && (
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
                flex-col
                gap-4
                sm:flex-row
                sm:items-center
                sm:justify-between
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
                      resultData.student_name
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
                      resultData.name ||
                      "--"
                    }

                    {" • "}

                    {
                      resultData.admission_no
                    }
                  </p>

                </div>

              </div>


              <div
                className="
                  rounded-xl
                  bg-[#F8FBFF]
                  px-4
                  py-3
                  sm:text-right
                "
              >

                <p
                  className="
                    text-[10px]
                    uppercase
                    tracking-wide
                    text-slate-400
                  "
                >
                  Examination
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    font-bold
                    text-[#0B3A67]
                  "
                >
                  {
                    resultData.exam_name
                  }
                </p>

                <p
                  className="
                    mt-1
                    text-[10px]
                    text-slate-400
                  "
                >
                  {
                    resultData.academic_year
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
              title="Subjects"
              value={
                resultData.total_subjects
              }
              icon={
                BookOpen
              }
              iconClass="
                bg-[#EAF4FF]
                text-[#0075FF]
              "
            />

            <SummaryCard
              title="Marks"
              value={
                `${formatNumber(
                  resultData.total_obtained_marks
                )}/${formatNumber(
                  resultData.total_max_marks
                )}`
              }
              icon={
                GraduationCap
              }
              iconClass="
                bg-purple-100
                text-purple-600
              "
            />

            <SummaryCard
              title="Percentage"
              value={
                `${formatNumber(
                  resultData.overall_percentage
                )}%`
              }
              icon={
                TrendingUp
              }
              iconClass="
                bg-green-100
                text-green-600
              "
            />

            <SummaryCard
              title="Overall Grade"
              value={
                resultData.overall_grade
              }
              icon={Award}
              iconClass="
                bg-orange-100
                text-orange-600
              "
            />

          </section>


          {/* SUBJECT RESULTS */}

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

            <div
              className="
                border-b
                border-[#E4EDF7]
                p-4
              "
            >

              <h2
                className="
                  font-bold
                  text-[#0B3A67]
                "
              >
                Subject Results
              </h2>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-400
                "
              >
                Subject-wise marks and grades
              </p>

            </div>


            {/* DESKTOP */}

            <div
              className="
                hidden
                overflow-x-auto
                md:block
              "
            >

              <table
                className="
                  w-full
                  min-w-[800px]
                "
              >

                <thead
                  className="
                    bg-[#F8FBFF]
                  "
                >

                  <tr>

                    <TableHeader>
                      Subject
                    </TableHeader>

                    <TableHeader>
                      Max Marks
                    </TableHeader>

                    <TableHeader>
                      Obtained
                    </TableHeader>

                    <TableHeader>
                      Percentage
                    </TableHeader>

                    <TableHeader>
                      Grade
                    </TableHeader>

                    <TableHeader>
                      Remarks
                    </TableHeader>

                  </tr>

                </thead>


                <tbody
                  className="
                    divide-y
                    divide-slate-100
                  "
                >

                  {resultData.results.map(
                    (item) => (
                      <tr
                        key={item.id}
                        className="
                          transition
                          hover:bg-[#F8FBFF]
                        "
                      >

                        <TableCell>
                          <span
                            className="
                              font-semibold
                              text-[#0B3A67]
                            "
                          >
                            {item.subject}
                          </span>
                        </TableCell>

                        <TableCell>
                          {
                            formatNumber(
                              item.max_marks
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
                              formatNumber(
                                item.obtained_marks
                              )
                            }
                          </span>
                        </TableCell>

                        <TableCell>
                          {
                            formatNumber(
                              item.percentage
                            )
                          }%
                        </TableCell>

                        <TableCell>

                          <GradeBadge
                            grade={
                              item.grade
                            }
                          />

                        </TableCell>

                        <TableCell>
                          {
                            item.remarks ||
                            "--"
                          }
                        </TableCell>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>


            {/* MOBILE */}

            <div
              className="
                divide-y
                divide-slate-100
                md:hidden
              "
            >

              {resultData.results.map(
                (item) => (
                  <ResultCard
                    key={item.id}
                    item={item}
                  />
                )
              )}

            </div>

          </section>

        </>
      )}

    </div>
  );
}


// =========================================================
// FORMAT NUMBER
// =========================================================

function formatNumber(
  value
) {
  const number =
    Number(value);

  if (
    Number.isNaN(number)
  ) {
    return "0";
  }

  if (
    Number.isInteger(number)
  ) {
    return number.toString();
  }

  return number.toFixed(
    2
  );
}


// =========================================================
// SELECT FIELD
// =========================================================

function SelectField({
  label,
  value,
  onChange,
  disabled,
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


      <div
        className="
          relative
        "
      >

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
// RESULT CARD MOBILE
// =========================================================

function ResultCard({
  item,
}) {
  return (
    <article
      className="
        p-4
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

        <div>

          <p
            className="
              text-sm
              font-bold
              text-[#0B3A67]
            "
          >
            {item.subject}
          </p>

          <p
            className="
              mt-1
              text-xs
              text-slate-400
            "
          >
            {
              formatNumber(
                item.obtained_marks
              )
            }

            {" / "}

            {
              formatNumber(
                item.max_marks
              )
            }

            {" marks"}
          </p>

        </div>


        <GradeBadge
          grade={item.grade}
        />

      </div>


      <div
        className="
          mt-4
          grid
          grid-cols-2
          gap-3
        "
      >

        <MobileInfo
          label="Percentage"
          value={
            `${formatNumber(
              item.percentage
            )}%`
          }
        />

        <MobileInfo
          label="Grade"
          value={
            item.grade ||
            "--"
          }
        />

      </div>


      {item.remarks && (
        <div
          className="
            mt-3
            rounded-xl
            bg-[#F8FBFF]
            p-3
          "
        >

          <p
            className="
              text-[10px]
              uppercase
              tracking-wide
              text-slate-400
            "
          >
            Remarks
          </p>

          <p
            className="
              mt-1
              text-xs
              text-slate-600
            "
          >
            {item.remarks}
          </p>

        </div>
      )}

    </article>
  );
}


// =========================================================
// GRADE BADGE
// =========================================================

function GradeBadge({
  grade,
}) {
  let classes =
    "bg-slate-100 text-slate-600";


  if (
    grade === "A+" ||
    grade === "A"
  ) {

    classes =
      "bg-green-50 text-green-600";

  } else if (
    grade === "B+" ||
    grade === "B"
  ) {

    classes =
      "bg-blue-50 text-blue-600";

  } else if (
    grade === "C" ||
    grade === "D"
  ) {

    classes =
      "bg-orange-50 text-orange-600";

  } else if (
    grade === "F"
  ) {

    classes =
      "bg-red-50 text-red-500";

  }


  return (
    <span
      className={`
        inline-flex
        min-w-[42px]
        items-center
        justify-center
        rounded-lg
        px-2.5
        py-1.5
        text-xs
        font-bold
        ${classes}
      `}
    >
      {grade || "--"}
    </span>
  );
}


// =========================================================
// MOBILE INFO
// =========================================================

function MobileInfo({
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

      <p
        className="
          text-[10px]
          text-slate-400
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          text-sm
          font-bold
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
        text-sm
        text-slate-500
      "
    >
      {children}
    </td>
  );
}


// =========================================================
// SUMMARY
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


      <div
        className="
          min-w-0
        "
      >

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
            truncate
            text-lg
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
// EMPTY
// =========================================================

function EmptyResults() {
  return (
    <div
      className="
        mt-5
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
        No academic results
      </h3>

      <p
        className="
          mt-1
          text-sm
          text-slate-400
        "
      >
        Results published by teachers
        will appear here.
      </p>

    </div>
  );
}


// =========================================================
// LOADING SCREEN
// =========================================================

function LoadingScreen({
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

      <div
        className="
          text-center
        "
      >

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