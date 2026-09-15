"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  ChevronDown,
  Clock3,
  GraduationCap,
  Loader2,
  MapPin,
  PartyPopper,
  Search,
  Users,
} from "lucide-react";

import {
  getParentChildren,
  getParentSchoolCalendar,
} from "@/services/parentService";


// =========================================================
// DATE
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
// DAY
// =========================================================

function getDay(value) {
  if (!value) {
    return "--";
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
// MONTH
// =========================================================

function getMonth(value) {
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
// TIME
// =========================================================

function formatTime(value) {
  if (!value) {
    return null;
  }

  const parts =
    String(value).split(":");

  if (parts.length < 2) {
    return value;
  }

  const hour =
    Number(parts[0]);

  const minute =
    Number(parts[1]);

  const date =
    new Date();

  date.setHours(
    hour,
    minute,
    0,
    0
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
// PAGE
// =========================================================

export default function ParentCalendarPage() {

  const [
    children,
    setChildren,
  ] = useState([]);


  const [
    selectedStudentId,
    setSelectedStudentId,
  ] = useState("");


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
    initialLoading,
    setInitialLoading,
  ] = useState(true);


  const [
    calendarLoading,
    setCalendarLoading,
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


        setChildren(
          Array.isArray(
            data?.children
          )
            ? data.children
            : []
        );


      } catch (err) {

        console.error(
          "Calendar children:",
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
  // LOAD EVENTS
  // =======================================================

  useEffect(() => {
    let cancelled =
      false;


    async function loadEvents() {
      try {

        setCalendarLoading(
          true
        );


        const data =
          await getParentSchoolCalendar(
            {
              studentId:
                selectedStudentId,

              eventType,

              search,
            }
          );


        if (cancelled) {
          return;
        }


        setEvents(
          Array.isArray(
            data?.events
          )
            ? data.events
            : []
        );


        setError("");


      } catch (err) {

        console.error(
          "Parent calendar:",
          err
        );


        if (cancelled) {
          return;
        }


        setEvents([]);


        setError(
          err?.response
            ?.data
            ?.detail ||
          "Unable to load school calendar."
        );


      } finally {

        if (!cancelled) {
          setCalendarLoading(
            false
          );
        }

      }
    }


    const timer =
      setTimeout(
        loadEvents,
        250
      );


    return () => {

      cancelled = true;

      clearTimeout(
        timer
      );

    };

  }, [
    selectedStudentId,
    eventType,
    search,
  ]);


  // =======================================================
  // COUNTS
  // =======================================================

  const holidayCount =
    useMemo(
      () =>
        events.filter(
          (item) =>
            item.event_type ===
            "HOLIDAY"
        ).length,
      [
        events,
      ]
    );


  const academicCount =
    useMemo(
      () =>
        events.filter(
          (item) =>
            item.event_type ===
              "ACADEMIC" ||
            item.event_type ===
              "EXAM"
        ).length,
      [
        events,
      ]
    );


  if (initialLoading) {
    return (
      <LoadingState
        text="Loading school calendar..."
      />
    );
  }


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
          School Calendar
        </h1>


        <p
          className="
            mt-1
            text-sm
            text-slate-500
          "
        >
          View school events,
          holidays and important dates.
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
            text-orange-600
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

        <div
          className="
            flex
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


        <SelectField
          value={
            eventType
          }
          onChange={(
            event
          ) =>
            setEventType(
              event.target.value
            )
          }
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

      {calendarLoading && (
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
          "
        >

          <Loader2
            size={20}
            className="
              animate-spin
              text-[#0075FF]
            "
          />

          <span
            className="
              text-sm
              text-slate-500
            "
          >
            Loading events...
          </span>

        </div>
      )}


      {/* EVENTS */}

      {!calendarLoading &&
        events.length > 0 && (
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
              divide-y
              divide-slate-100
            "
          >

            {events.map(
              (item) => (
                <EventRow
                  key={
                    item.id
                  }
                  item={
                    item
                  }
                />
              )
            )}

          </div>

        </section>
      )}


      {!calendarLoading &&
        events.length === 0 &&
        !error && (
        <EmptyCalendar />
      )}

    </div>
  );
}


// =========================================================
// EVENT ROW
// =========================================================

function EventRow({
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

        <span
          className="
            text-xl
            font-bold
          "
        >
          {
            getDay(
              item.start_date
            )
          }
        </span>


        <span
          className="
            text-[10px]
            font-semibold
            uppercase
          "
        >
          {
            getMonth(
              item.start_date
            )
          }
        </span>

      </div>


      {/* CONTENT */}

      <div
        className="
          min-w-0
          flex-1
        "
      >

        <div
          className="
            flex
            flex-wrap
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
              icon={
                MapPin
              }
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
        ${
          styles[type] ||
          "bg-slate-100 text-slate-500"
        }
      `}
    >
      {type}
    </span>
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

function Meta({
  icon: Icon,
  value,
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-1.5
      "
    >

      <Icon
        size={13}
        className="
          text-[#0075FF]
        "
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

function EmptyCalendar() {
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

      <CalendarDays
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
        No calendar events
      </h3>


      <p
        className="
          mt-1
          text-sm
          text-slate-400
        "
      >
        School events and important
        dates will appear here.
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