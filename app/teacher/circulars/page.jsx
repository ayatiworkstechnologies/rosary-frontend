"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  Download,
  FileText,
  Loader2,
  Megaphone,
  Search,
  Tag,
  Users,
} from "lucide-react";

import {
  getTeacherCirculars,
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
    }
  );
}


// =========================================================
// MAIN PAGE
// =========================================================

export default function TeacherCircularsPage() {
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
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  // =======================================================
  // LOAD CIRCULARS
  // =======================================================

  useEffect(() => {
    const loadCirculars =
      async () => {
        try {
          setLoading(true);

          setError("");

          const data =
            await getTeacherCirculars(
              {
                category,
                search,
              }
            );

          setCirculars(
            Array.isArray(
              data?.circulars
            )
              ? data.circulars
              : []
          );

        } catch (err) {
          console.error(
            "Circular error:",
            err
          );

          setCirculars([]);

          setError(
            err?.response
              ?.data
              ?.detail ||
            "Unable to load circulars."
          );

        } finally {
          setLoading(false);
        }
      };


    const timeout =
      setTimeout(
        loadCirculars,
        300
      );


    return () => {
      clearTimeout(
        timeout
      );
    };

  }, [
    category,
    search,
  ]);


  // =======================================================
  // CATEGORY COUNTS
  // =======================================================

  const categoryCounts =
    useMemo(() => {
      return circulars.reduce(
        (
          result,
          item
        ) => {
          const key =
            item.category ||
            "General";

          result[key] =
            (
              result[key] ||
              0
            ) + 1;

          return result;
        },
        {}
      );

    }, [
      circulars,
    ]);


  // =======================================================
  // UI
  // =======================================================

  return (
    <div className="mx-auto max-w-[1400px]">

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


      {/* =========================================
          SUMMARY
      ========================================== */}

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
          icon={Megaphone}
          iconClass="
            bg-[#EAF4FF]
            text-[#0075FF]
          "
        />

        <SummaryCard
          title="Academic"
          value={
            categoryCounts[
              "Academic"
            ] || 0
          }
          icon={FileText}
          iconClass="
            bg-purple-100
            text-purple-600
          "
        />

        <SummaryCard
          title="General Updates"
          value={
            circulars.length -
            (
              categoryCounts[
                "Academic"
              ] || 0
            )
          }
          icon={Users}
          iconClass="
            bg-green-100
            text-green-600
          "
        />

      </section>


      {/* =========================================
          FILTERS
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

        {/* SEARCH */}

        <div
          className="
            flex
            flex-1
            items-center
            rounded-xl
            border
            border-[#DCE8F5]
            px-3
            transition
            focus-within:border-[#0075FF]
            focus-within:ring-2
            focus-within:ring-[#0075FF]/10
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


        {/* CATEGORY */}

        <select
          value={category}
          onChange={(
            event
          ) =>
            setCategory(
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
            sm:w-[220px]
          "
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

        </select>

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

      {loading && (
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
            py-16
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


      {/* =========================================
          CIRCULAR LIST
      ========================================== */}

      {!loading &&
        circulars.length >
          0 && (
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
                key={item.id}
                item={item}
              />
            )
          )}

        </section>
      )}


      {/* =========================================
          EMPTY
      ========================================== */}

      {!loading &&
        circulars.length ===
          0 && (
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
            Published circulars will
            appear here.
          </p>

        </div>
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
          {item.category}
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
          icon={Tag}
          value={
            item.audience ===
              "CLASS"
              ? (
                  item.name ||
                  "Class"
                )
              : formatAudience(
                  item.audience
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
// AUDIENCE TEXT
// =========================================================

function formatAudience(
  audience
) {
  switch (audience) {
    case "ALL":
      return "Everyone";

    case "TEACHER":
      return "Teachers";

    case "PARENT":
      return "Parents";

    case "CLASS":
      return "Class";

    default:
      return audience || "--";
  }
}


// =========================================================
// META BADGE
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
        <Icon size={21} />
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