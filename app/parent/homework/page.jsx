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
  Download,
  FileText,
  Loader2,
  Search,
  UserRound,
} from "lucide-react";

import {
  useSearchParams,
} from "next/navigation";

import {
  getParentChildren,
  getParentChildHomework,
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

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}


// =========================================================
// MAIN PAGE
// =========================================================

export default function ParentHomeworkPage() {
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
    homework,
    setHomework,
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
    statusFilter,
    setStatusFilter,
  ] = useState("");

  const [
    initialLoading,
    setInitialLoading,
  ] = useState(true);

  const [
    homeworkLoading,
    setHomeworkLoading,
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


          // -----------------------------------------------
          // Child coming from URL
          // -----------------------------------------------

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
          }

          // -----------------------------------------------
          // Otherwise first child
          // -----------------------------------------------

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
  // LOAD HOMEWORK
  // =======================================================

  useEffect(() => {
    if (
      !selectedStudentId
    ) {
      return;
    }

    const loadHomework =
      async () => {
        try {
          setHomeworkLoading(
            true
          );

          setError("");

          const data =
            await getParentChildHomework(
              selectedStudentId
            );

          setHomework(
            Array.isArray(
              data?.homework
            )
              ? data.homework
              : []
          );

          setStudentInfo(
            {
              student_name:
                data.student_name,

              admission_no:
                data.admission_no,

              class_name:
                data.class_name,
            }
          );

        } catch (err) {
          console.error(
            "Parent homework:",
            err
          );

          setHomework([]);

          setStudentInfo(
            null
          );

          setError(
            err?.response
              ?.data
              ?.detail ||
            "Unable to load homework."
          );

        } finally {
          setHomeworkLoading(
            false
          );
        }
      };

    loadHomework();

  }, [
    selectedStudentId,
  ]);


  // =======================================================
  // SEARCH + STATUS FILTER
  // =======================================================

  const filteredHomework =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      return homework.filter(
        (item) => {
          const matchesSearch =
            !value ||
            item.title
              ?.toLowerCase()
              .includes(value) ||
            item.subject
              ?.toLowerCase()
              .includes(value) ||
            item.description
              ?.toLowerCase()
              .includes(value);

          const matchesStatus =
            !statusFilter ||
            item.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );

    }, [
      homework,
      search,
      statusFilter,
    ]);


  // =======================================================
  // COUNTS
  // =======================================================

  const activeCount =
    homework.filter(
      (item) =>
        item.status ===
        "ACTIVE"
    ).length;

  const upcomingCount =
    homework.filter(
      (item) =>
        item.status ===
        "UPCOMING"
    ).length;

  const overdueCount =
    homework.filter(
      (item) =>
        item.status ===
        "OVERDUE"
    ).length;


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

          <p
            className="
              mt-3
              text-sm
              text-slate-500
            "
          >
            Loading homework...
          </p>

        </div>
      </div>
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
          Homework
        </h1>

        <p
          className="
            mt-1
            text-sm
            text-slate-500
          "
        >
          View your child&apos;s
          homework and assignments.
        </p>

      </div>


      {/* =========================================
          CHILD SELECTOR
      ========================================== */}

      <section
        className="
          mt-6
          rounded-2xl
          border
          border-[#E4EDF7]
          bg-white
          p-4
          shadow-sm
        "
      >

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


        <div
          className="
            relative
            max-w-[420px]
          "
        >

          <select
            value={
              selectedStudentId
            }
            onChange={(
              event
            ) => {
              setSelectedStudentId(
                event.target.value
              );

              setSearch("");
              setStatusFilter("");
            }}
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
                  {
                    child.class_name
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
          LOADING
      ========================================== */}

      {homeworkLoading && (
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

          Loading homework...

        </div>
      )}


      {!homeworkLoading &&
        studentInfo && (
        <>

          {/* =========================================
              CHILD INFORMATION
          ========================================== */}

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
                    studentInfo.class_name
                  }

                  {" • "}

                  {
                    studentInfo.admission_no
                  }
                </p>

              </div>

            </div>

          </section>


          {/* =========================================
              SUMMARY
          ========================================== */}

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
              title="Total Homework"
              value={
                homework.length
              }
              icon={BookOpen}
              iconClass="
                bg-[#EAF4FF]
                text-[#0075FF]
              "
            />

            <SummaryCard
              title="Active"
              value={
                activeCount
              }
              icon={
                FileText
              }
              iconClass="
                bg-green-100
                text-green-600
              "
            />

            <SummaryCard
              title="Upcoming"
              value={
                upcomingCount
              }
              icon={
                CalendarDays
              }
              iconClass="
                bg-purple-100
                text-purple-600
              "
            />

            <SummaryCard
              title="Overdue"
              value={
                overdueCount
              }
              icon={
                CalendarDays
              }
              iconClass="
                bg-red-100
                text-red-500
              "
            />

          </section>


          {/* =========================================
              SEARCH / FILTER
          ========================================== */}

          <section
            className="
              mt-5
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
            "
          >

            <div
              className="
                flex
                flex-1
                items-center
                rounded-xl
                border
                border-[#DCE8F5]
                px-3
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
                placeholder="Search homework..."
                className="
                  w-full
                  bg-transparent
                  px-3
                  py-3
                  text-sm
                  outline-none
                "
              />

            </div>


            <select
              value={
                statusFilter
              }
              onChange={(
                event
              ) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="
                rounded-xl
                border
                border-[#DCE8F5]
                bg-white
                px-4
                py-3
                text-sm
                font-medium
                text-[#0B3A67]
                outline-none
                focus:border-[#0075FF]
                sm:w-[200px]
              "
            >

              <option value="">
                All Homework
              </option>

              <option value="ACTIVE">
                Active
              </option>

              <option value="UPCOMING">
                Upcoming
              </option>

              <option value="OVERDUE">
                Overdue
              </option>

            </select>

          </section>


          {/* =========================================
              HOMEWORK CARDS
          ========================================== */}

          {filteredHomework.length >
          0 ? (
            <section
              className="
                mt-5
                grid
                gap-4
                md:grid-cols-2
                xl:grid-cols-3
              "
            >

              {filteredHomework.map(
                (item) => (
                  <HomeworkCard
                    key={item.id}
                    item={item}
                  />
                )
              )}

            </section>
          ) : (
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

              <BookOpen
                size={40}
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
                No homework found
              </h3>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-400
                "
              >
                Homework assigned by teachers
                will appear here.
              </p>

            </div>
          )}

        </>
      )}

    </div>
  );
}


// =========================================================
// HOMEWORK CARD
// =========================================================

function HomeworkCard({
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
        transition
        hover:border-[#0075FF]/30
        hover:shadow-md
      "
    >

      {/* TOP */}

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
            items-center
            justify-center
            rounded-xl
            bg-[#EAF4FF]
            text-[#0075FF]
          "
        >

          <BookOpen
            size={20}
          />

        </div>


        <StatusBadge
          status={
            item.status
          }
        />

      </div>


      {/* SUBJECT */}

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
        {item.subject}
      </p>


      {/* TITLE */}

      <h2
        className="
          mt-1
          text-base
          font-bold
          text-[#0B3A67]
        "
      >
        {item.title}
      </h2>


      {/* DESCRIPTION */}

      {item.description && (
        <p
          className="
            mt-2
            text-sm
            leading-6
            text-slate-500
          "
        >
          {item.description}
        </p>
      )}


      {/* DETAILS */}

      <div
        className="
          mt-4
          space-y-2
          border-t
          border-slate-100
          pt-4
        "
      >

        <InfoRow
          icon={
            CalendarDays
          }
          label="Assigned"
          value={
            formatDate(
              item.assigned_date
            )
          }
        />


        <InfoRow
          icon={
            CalendarDays
          }
          label="Due"
          value={
            formatDate(
              item.due_date
            )
          }
        />


        <InfoRow
          icon={
            UserRound
          }
          label="Teacher"
          value={
            item.teacher_name ||
            "Teacher"
          }
        />

      </div>


      {/* ATTACHMENT */}

      {item.attachment_url && (
        <div
          className="
            mt-4
            border-t
            border-slate-100
            pt-4
          "
        >

          <a
            href={
              item.attachment_url
            }
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-[#0075FF]
              px-4
              py-2.5
              text-xs
              font-semibold
              text-white
              transition
              hover:bg-[#0065DD]
            "
          >

            <Download
              size={15}
            />

            View Attachment

          </a>

        </div>
      )}

    </article>
  );
}


// =========================================================
// STATUS
// =========================================================

function StatusBadge({
  status,
}) {
  const styles = {
    ACTIVE:
      "bg-green-50 text-green-600",

    UPCOMING:
      "bg-purple-50 text-purple-600",

    OVERDUE:
      "bg-red-50 text-red-500",
  };


  return (
    <span
      className={`
        rounded-full
        px-3
        py-1
        text-[10px]
        font-bold
        ${styles[status] ||
          "bg-slate-100 text-slate-500"}
      `}
    >
      {status}
    </span>
  );
}


// =========================================================
// INFO
// =========================================================

function InfoRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-2
      "
    >

      <Icon
        size={14}
        className="
          shrink-0
          text-[#0075FF]
        "
      />

      <span
        className="
          text-[11px]
          text-slate-400
        "
      >
        {label}:
      </span>

      <span
        className="
          text-[11px]
          font-semibold
          text-slate-600
        "
      >
        {value}
      </span>

    </div>
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