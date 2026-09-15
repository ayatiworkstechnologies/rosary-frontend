"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BookOpen,
  CalendarDays,
  Clock3,
  GraduationCap,
  Loader2,
  MapPin,
  PartyPopper,
  Search,
  Users,
} from "lucide-react";

import {
  getTeacherSchoolCalendar,
} from "@/services/teacherService";


// =========================================================
// DATE
// =========================================================

function formatDate(
  value
) {
  if (!value) {
    return "--";
  }

  const date =
    new Date(
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
// MONTH
// =========================================================

function formatMonth(
  value
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(
      `${value}T00:00:00`
    );

  return date.toLocaleDateString(
    "en-IN",
    {
      month: "short",
    }
  );
}


// =========================================================
// DAY
// =========================================================

function getDay(
  value
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(
      `${value}T00:00:00`
    );

  return String(
    date.getDate()
  ).padStart(
    2,
    "0"
  );
}


// =========================================================
// TIME
// =========================================================

function formatTime(
  value
) {
  if (!value) {
    return null;
  }

  const [
    hour,
    minute,
  ] = value.split(":");

  const date =
    new Date();

  date.setHours(
    Number(hour)
  );

  date.setMinutes(
    Number(minute)
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
// MAIN
// =========================================================

export default function TeacherCalendarPage() {
  const [
    events,
    setEvents,
  ] = useState([]);

  const [
    eventType,
    setEventType,
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
  // LOAD EVENTS
  // =======================================================

  useEffect(() => {
    const loadEvents =
      async () => {
        try {

          setLoading(true);

          setError("");

          const data =
            await getTeacherSchoolCalendar(
              {
                eventType,
              }
            );

          setEvents(
            Array.isArray(
              data?.events
            )
              ? data.events
              : []
          );

        } catch (err) {

          console.error(
            "Calendar error:",
            err
          );

          setEvents([]);

          setError(
            err?.response
              ?.data
              ?.detail ||
            "Unable to load school calendar."
          );

        } finally {

          setLoading(false);

        }
      };


    loadEvents();

  }, [
    eventType,
  ]);


  // =======================================================
  // SEARCH
  // =======================================================

  const filteredEvents =
    useMemo(() => {

      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return events;
      }

      return events.filter(
        (item) => {

          const title =
            item.title
              ?.toLowerCase() ||
            "";

          const description =
            item.description
              ?.toLowerCase() ||
            "";

          const location =
            item.location
              ?.toLowerCase() ||
            "";

          return (
            title.includes(
              value
            ) ||
            description.includes(
              value
            ) ||
            location.includes(
              value
            )
          );
        }
      );

    }, [
      events,
      search,
    ]);


  // =======================================================
  // COUNTS
  // =======================================================

  const holidayCount =
    events.filter(
      (item) =>
        item.event_type ===
        "HOLIDAY"
    ).length;


  const academicCount =
    events.filter(
      (item) =>
        item.event_type ===
          "ACADEMIC" ||
        item.event_type ===
          "EXAM"
    ).length;


  // =======================================================
  // UI
  // =======================================================

  return (
    <div className="mx-auto max-w-[1400px]">

      {/* HEADER */}

      <div>

        <h1 className="text-2xl font-bold text-[#0B3A67]">
          School Calendar
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View school events, academic dates,
          meetings and holidays.
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
          title="Total Events"
          value={
            events.length
          }
          icon={
            CalendarDays
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
            GraduationCap
          }
          iconClass="
            bg-purple-100
            text-purple-600
          "
        />

        <SummaryCard
          title="Holidays"
          value={
            holidayCount
          }
          icon={
            PartyPopper
          }
          iconClass="
            bg-orange-100
            text-orange-500
          "
        />

      </section>


      {/* FILTER */}

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
            placeholder="Search events..."
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
          value={eventType}
          onChange={(
            event
          ) =>
            setEventType(
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
            All Events
          </option>

          <option value="EVENT">
            Events
          </option>

          <option value="ACADEMIC">
            Academic
          </option>

          <option value="EXAM">
            Exams
          </option>

          <option value="MEETING">
            Meetings
          </option>

          <option value="HOLIDAY">
            Holidays
          </option>

        </select>

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

          Loading school calendar...

        </div>
      )}


      {/* EVENTS */}

      {!loading &&
        filteredEvents.length >
          0 && (
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

            <h2 className="font-bold text-[#0B3A67]">
              Upcoming Events
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {filteredEvents.length} event(s)
            </p>

          </div>


          <div className="divide-y divide-slate-100">

            {filteredEvents.map(
              (item) => (
                <CalendarEvent
                  key={item.id}
                  item={item}
                />
              )
            )}

          </div>

        </section>
      )}


      {/* EMPTY */}

      {!loading &&
        filteredEvents.length ===
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
          "
        >

          <CalendarDays
            size={40}
            className="mx-auto text-slate-300"
          />

          <h3 className="mt-3 font-semibold text-[#0B3A67]">
            No calendar events
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            School events will appear here.
          </p>

        </div>
      )}

    </div>
  );
}


// =========================================================
// EVENT ROW
// =========================================================

function CalendarEvent({
  item,
}) {
  const startTime =
    formatTime(
      item.start_time
    );

  const endTime =
    formatTime(
      item.end_time
    );

  return (
    <article
      className="
        flex
        flex-col
        gap-4
        p-4
        transition
        hover:bg-[#F8FBFF]
        sm:flex-row
        sm:items-start
      "
    >

      {/* DATE */}

      <div
        className="
          flex
          h-[68px]
          w-[68px]
          shrink-0
          flex-col
          items-center
          justify-center
          rounded-xl
          bg-[#EAF4FF]
          text-[#0075FF]
        "
      >

        <span className="text-xl font-bold">
          {
            getDay(
              item.start_date
            )
          }
        </span>

        <span className="text-[10px] font-semibold uppercase">
          {
            formatMonth(
              item.start_date
            )
          }
        </span>

      </div>


      {/* DETAILS */}

      <div className="min-w-0 flex-1">

        <div
          className="
            flex
            flex-wrap
            items-center
            gap-2
          "
        >

          <EventBadge
            type={
              item.event_type
            }
          />

          {item.audience ===
            "CLASS" &&
            item.name && (
            <span
              className="
                rounded-full
                bg-slate-100
                px-2.5
                py-1
                text-[10px]
                font-semibold
                text-slate-500
              "
            >
              {
                item.name
              }
            </span>
          )}

        </div>


        <h2
          className="
            mt-2
            font-bold
            text-[#0B3A67]
          "
        >
          {item.title}
        </h2>


        {item.description && (
          <p
            className="
              mt-1
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


        <div
          className="
            mt-3
            flex
            flex-wrap
            gap-3
            text-xs
            text-slate-500
          "
        >

          <Meta
            icon={
              CalendarDays
            }
            value={
              item.end_date &&
              item.end_date !==
                item.start_date
                ? `${formatDate(
                    item.start_date
                  )} - ${formatDate(
                    item.end_date
                  )}`
                : formatDate(
                    item.start_date
                  )
            }
          />


          {startTime && (
            <Meta
              icon={
                Clock3
              }
              value={
                endTime
                  ? `${startTime} - ${endTime}`
                  : startTime
              }
            />
          )}


          {item.location && (
            <Meta
              icon={MapPin}
              value={
                item.location
              }
            />
          )}

        </div>

      </div>

    </article>
  );
}


// =========================================================
// EVENT BADGE
// =========================================================

function EventBadge({
  type,
}) {
  const styles = {
    EVENT:
      "bg-blue-50 text-blue-600",

    ACADEMIC:
      "bg-purple-50 text-purple-600",

    EXAM:
      "bg-indigo-50 text-indigo-600",

    MEETING:
      "bg-green-50 text-green-600",

    HOLIDAY:
      "bg-orange-50 text-orange-600",
  };


  return (
    <span
      className={`
        rounded-full
        px-2.5
        py-1
        text-[10px]
        font-semibold
        ${styles[type] ||
          "bg-slate-100 text-slate-500"}
      `}
    >
      {type}
    </span>
  );
}


// =========================================================
// META
// =========================================================

function Meta({
  icon: Icon,
  value,
}) {
  return (
    <div className="flex items-center gap-1.5">

      <Icon
        size={13}
        className="text-[#0075FF]"
      />

      {value}

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