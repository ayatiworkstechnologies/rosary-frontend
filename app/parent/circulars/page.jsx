"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  ChevronDown,
  Download,
  FileText,
  Loader2,
  Megaphone,
  Search,
  Tag,
  UserRound,
  Users,
} from "lucide-react";

import {
  getParentChildren,
  getParentCirculars,
} from "@/services/parentService";


// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(value) {
  if (!value) {
    return "--";
  }

  const date =
    new Date(
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
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}


// =========================================================
// MAIN PAGE
// =========================================================

export default function ParentCircularsPage() {

  const [
    children,
    setChildren,
  ] = useState([]);

  const [
    selectedStudentId,
    setSelectedStudentId,
  ] = useState("");

  const [
    circulars,
    setCirculars,
  ] = useState([]);

  const [
    category,
    setCategory,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    initialLoading,
    setInitialLoading,
  ] = useState(true);

  const [
    circularLoading,
    setCircularLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  // =======================================================
  // LOAD CHILDREN
  // =======================================================

  useEffect(() => {
    let cancelled =
      false;


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


      } catch (err) {

        console.error(
          "Load children:",
          err
        );


        if (cancelled) {
          return;
        }


        setError(
          err?.response
            ?.data
            ?.detail ||
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
  // LOAD CIRCULARS
  // =======================================================

  useEffect(() => {
    let cancelled =
      false;


    async function loadCirculars() {
      try {

        setCircularLoading(
          true
        );


        const data =
          await getParentCirculars(
            {
              studentId:
                selectedStudentId,

              category,

              search,
            }
          );


        if (cancelled) {
          return;
        }


        setCirculars(
          Array.isArray(
            data?.circulars
          )
            ? data.circulars
            : []
        );


        setError("");


      } catch (err) {

        console.error(
          "Parent circulars:",
          err
        );


        if (cancelled) {
          return;
        }


        setCirculars([]);


        setError(
          err?.response
            ?.data
            ?.detail ||
          "Unable to load circulars."
        );


      } finally {

        if (!cancelled) {
          setCircularLoading(
            false
          );
        }

      }
    }


    const timer =
      setTimeout(
        loadCirculars,
        300
      );


    return () => {

      cancelled = true;

      clearTimeout(
        timer
      );

    };

  }, [
    selectedStudentId,
    category,
    search,
  ]);


  // =======================================================
  // COUNTS
  // =======================================================

  const academicCount =
    useMemo(
      () =>
        circulars.filter(
          (item) =>
            item.category ===
            "Academic"
        ).length,
      [
        circulars,
      ]
    );


  const meetingCount =
    useMemo(
      () =>
        circulars.filter(
          (item) =>
            item.category ===
            "Meeting"
        ).length,
      [
        circulars,
      ]
    );


  // =======================================================
  // INITIAL LOADING
  // =======================================================

  if (initialLoading) {
    return (
      <LoadingState
        text="Loading circulars..."
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
          Circulars
        </h1>


        <p
          className="
            mt-1
            text-sm
            text-slate-500
          "
        >
          View school announcements,
          notices and important updates.
        </p>

      </div>


      {/* SUMMARY */}

      <section
        className="
          mt-6
          grid
          grid-cols-1
          gap-3
          sm:grid-cols-3
        "
      >

        <SummaryCard
          title="Total Circulars"
          value={
            circulars.length
          }
          icon={
            Megaphone
          }
          iconClass="
            bg-[#EAF4FF]
            text-[#0075FF]
          "
        />


        <SummaryCard
          title="Academic"
          value={
            academicCount
          }
          icon={
            FileText
          }
          iconClass="
            bg-purple-100
            text-purple-600
          "
        />


        <SummaryCard
          title="Meetings"
          value={
            meetingCount
          }
          icon={
            Users
          }
          iconClass="
            bg-green-100
            text-green-600
          "
        />

      </section>


      {/* FILTERS */}

      <section
        className="
          mt-5
          grid
          gap-3
          rounded-2xl
          border
          border-[#E4EDF7]
          bg-white
          p-4
          shadow-sm
          lg:grid-cols-[1fr_220px_220px]
        "
      >

        {/* SEARCH */}

        <div
          className="
            flex
            items-center
            rounded-xl
            border
            border-[#DCE8F5]
            px-3
            focus-within:border-[#0075FF]
          "
        >

          <Search
            size={17}
            className="
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
            placeholder="Search circulars..."
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


        {/* CHILD */}

        <SelectField
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
        >

          <option value="">
            All Children
          </option>


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
                  child.name
                }
              </option>
            )
          )}

        </SelectField>


        {/* CATEGORY */}

        <SelectField
          value={
            category
          }
          onChange={(
            event
          ) =>
            setCategory(
              event.target.value
            )
          }
        >

          <option value="">
            All Categories
          </option>

          <option value="Academic">
            Academic
          </option>

          <option value="Meeting">
            Meeting
          </option>

          <option value="Holiday">
            Holiday
          </option>

          <option value="General">
            General
          </option>

          <option value="Event">
            Event
          </option>

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


      {/* LOADING */}

      {circularLoading && (
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

          Loading circulars...

        </div>
      )}


      {/* CIRCULARS */}

      {!circularLoading &&
        circulars.length > 0 && (
        <section
          className="
            mt-5
            grid
            gap-4
            lg:grid-cols-2
          "
        >

          {circulars.map(
            (item) => (
              <CircularCard
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
      )}


      {/* EMPTY */}

      {!circularLoading &&
        circulars.length ===
          0 &&
        !error && (
        <EmptyCirculars />
      )}

    </div>
  );
}


// =========================================================
// CIRCULAR CARD
// =========================================================

function CircularCard({
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
          gap-4
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

          <Megaphone
            size={20}
          />

        </div>


        <span
          className="
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
            item.category
          }
        </span>

      </div>


      {/* TITLE */}

      <h2
        className="
          mt-4
          text-base
          font-bold
          text-[#0B3A67]
        "
      >
        {
          item.title
        }
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
          {
            item.description
          }
        </p>
      )}


      {/* META */}

      <div
        className="
          mt-4
          flex
          flex-wrap
          gap-2
        "
      >

        <MetaBadge
          icon={
            CalendarDays
          }
          value={
            formatDate(
              item.published_date
            )
          }
        />


        <MetaBadge
          icon={
            Tag
          }
          value={
            getAudienceText(
              item
            )
          }
        />

      </div>


      {/* ATTACHMENT */}

      {item.attachment_url && (
        <div
          className="
            mt-5
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
// AUDIENCE
// =========================================================

function getAudienceText(
  item
) {
  if (
    item.audience ===
    "CLASS"
  ) {
    return (
      item.name ||
      "Class"
    );
  }

  if (
    item.audience ===
    "PARENT"
  ) {
    return "Parents";
  }

  if (
    item.audience ===
    "ALL"
  ) {
    return "Everyone";
  }

  return (
    item.audience ||
    "--"
  );
}


// =========================================================
// SELECT
// =========================================================

function SelectField({
  value,
  onChange,
  children,
}) {
  return (
    <div
      className="
        relative
      "
    >

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
  );
}


// =========================================================
// META
// =========================================================

function MetaBadge({
  icon: Icon,
  value,
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-1.5
        rounded-lg
        bg-[#F8FBFF]
        px-2.5
        py-2
      "
    >

      <Icon
        size={13}
        className="
          text-[#0075FF]
        "
      />

      <span
        className="
          text-[11px]
          font-medium
          text-slate-500
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
          size={21}
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
// EMPTY
// =========================================================

function EmptyCirculars() {
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

      <Megaphone
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
        No circulars found
      </h3>


      <p
        className="
          mt-1
          text-sm
          text-slate-400
        "
      >
        School circulars and
        announcements will appear here.
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