"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  Award,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  ChevronDown,
  CircleAlert,
  Clock3,
  GraduationCap,
  Loader2,
  Megaphone,
  ReceiptIndianRupee,
  TrendingUp,
  UserRound,
  WalletCards,
} from "lucide-react";

import {
  getParentChildren,
  getParentDashboard,
} from "@/services/parentService";


// =========================================================
// MONEY
// =========================================================

function formatMoney(value) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  ).format(
    Number(value || 0)
  );
}


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
// TIME
// =========================================================

function formatTime(value) {
  if (!value) {
    return "--";
  }

  const [
    hour,
    minute,
  ] = String(
    value
  ).split(":");

  const date =
    new Date();

  date.setHours(
    Number(hour),
    Number(minute),
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

export default function ParentDashboardPage() {
  const [
    children,
    setChildren,
  ] = useState([]);

  const [
    selectedStudentId,
    setSelectedStudentId,
  ] = useState("");

  const [
    dashboard,
    setDashboard,
  ] = useState(null);

  const [
    initialLoading,
    setInitialLoading,
  ] = useState(true);

  const [
    dashboardLoading,
    setDashboardLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  // =======================================================
  // LOAD CHILDREN
  // =======================================================

  useEffect(() => {
    let cancelled = false;


    async function loadChildren() {
      try {
        const data =
          await getParentChildren();


        if (cancelled) {
          return;
        }


        const list =
          Array.isArray(
            data?.children
          )
            ? data.children
            : [];


        setChildren(
          list
        );


        if (
          list.length > 0
        ) {
          setSelectedStudentId(
            String(
              list[0].id
            )
          );
        }

      } catch (err) {
        console.error(
          "Dashboard children:",
          err
        );


        if (!cancelled) {
          setError(
            err?.response
              ?.data
              ?.detail ||
            "Unable to load children."
          );
        }

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
  // LOAD DASHBOARD
  // =======================================================

  useEffect(() => {
    if (!selectedStudentId) {
      return;
    }


    let cancelled = false;


    async function loadDashboard() {
      try {
        setDashboardLoading(
          true
        );


        const data =
          await getParentDashboard(
            selectedStudentId
          );


        if (cancelled) {
          return;
        }


        setDashboard(
          data
        );

        setError("");

      } catch (err) {
        console.error(
          "Parent dashboard:",
          err
        );


        if (!cancelled) {
          setDashboard(
            null
          );

          setError(
            err?.response
              ?.data
              ?.detail ||
            "Unable to load dashboard."
          );
        }

      } finally {
        if (!cancelled) {
          setDashboardLoading(
            false
          );
        }
      }
    }


    loadDashboard();


    return () => {
      cancelled = true;
    };

  }, [
    selectedStudentId,
  ]);


  // =======================================================
  // CHILD CHANGE
  // =======================================================

  function handleChildChange(
    event
  ) {
    setDashboard(
      null
    );

    setError("");

    setSelectedStudentId(
      event.target.value
    );
  }


  // =======================================================
  // INITIAL LOAD
  // =======================================================

  if (initialLoading) {
    return (
      <LoadingState
        text="Loading dashboard..."
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

      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-end
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
            Parent Dashboard
          </h1>


          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            {dashboard
              ? `Welcome back, ${dashboard.parent_name}.`
              : "View your child's latest school information."}
          </p>

        </div>


        {/* CHILD */}

        {children.length > 0 && (
          <div
            className="
              w-full
              sm:w-[300px]
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
              "
            >

              <select
                value={
                  selectedStudentId
                }
                onChange={
                  handleChildChange
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

          </div>
        )}

      </div>


      {/* ERROR */}

      {error && (
        <div
          className="
            mt-5
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


      {/* NO CHILD */}

      {!error &&
        children.length === 0 && (
        <EmptyChildren />
      )}


      {/* LOADING */}

      {dashboardLoading && (
        <div
          className="
            mt-6
            flex
            items-center
            justify-center
            gap-3
            rounded-2xl
            border
            border-[#E4EDF7]
            bg-white
            py-16
          "
        >

          <Loader2
            size={22}
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
            Loading student dashboard...
          </span>

        </div>
      )}


      {!dashboardLoading &&
        dashboard && (
        <>

          {/* =====================================
              STUDENT HERO
          ====================================== */}

          <section
            className="
              mt-6
              overflow-hidden
              rounded-2xl
              bg-gradient-to-r
              from-[#0075FF]
              to-[#0B3A67]
              p-5
              text-white
              shadow-sm
              sm:p-6
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
                  gap-4
                "
              >

                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-white/15
                  "
                >
                  <UserRound
                    size={27}
                  />
                </div>


                <div>

                  <h2
                    className="
                      text-xl
                      font-bold
                    "
                  >
                    {
                      dashboard.student_name
                    }
                  </h2>


                  <p
                    className="
                      mt-1
                      text-sm
                      text-white/75
                    "
                  >
                    {
                      dashboard.class_name ||
                      "--"
                    }

                    {" • "}

                    {
                      dashboard.admission_no
                    }
                  </p>

                </div>

              </div>


              <div
                className="
                  rounded-xl
                  bg-white/10
                  px-4
                  py-3
                "
              >

                <p
                  className="
                    text-[10px]
                    uppercase
                    tracking-wide
                    text-white/60
                  "
                >
                  Academic Year
                </p>


                <p
                  className="
                    mt-1
                    font-semibold
                  "
                >
                  {
                    dashboard.academic_year ||
                    "--"
                  }
                </p>

              </div>

            </div>

          </section>


          {/* =====================================
              MAIN SUMMARY
          ====================================== */}

          <section
            className="
              mt-5
              grid
              grid-cols-2
              gap-3
              xl:grid-cols-4
            "
          >

            <DashboardCard
              title="Attendance"
              value={
                `${dashboard.attendance.attendance_percentage}%`
              }
              description={
                `${dashboard.attendance.present_count} present`
              }
              icon={
                CalendarCheck
              }
              href="/parent/attendance"
              iconClass="
                bg-green-100
                text-green-600
              "
            />


            <DashboardCard
              title="Active Homework"
              value={
                dashboard.active_homework
              }
              description={
                `${dashboard.overdue_homework} overdue`
              }
              icon={
                BookOpen
              }
              href="/parent/homework"
              iconClass="
                bg-[#EAF4FF]
                text-[#0075FF]
              "
            />


            <DashboardCard
              title="Latest Result"
              value={
                dashboard.latest_result
                  ? `${dashboard.latest_result.percentage}%`
                  : "--"
              }
              description={
                dashboard.latest_result
                  ? `Grade ${dashboard.latest_result.grade}`
                  : "No result"
              }
              icon={
                Award
              }
              href="/parent/results"
              iconClass="
                bg-purple-100
                text-purple-600
              "
            />


            <DashboardCard
              title="Pending Fee"
              value={
                formatMoney(
                  dashboard.fees.total_pending
                )
              }
              description={
                dashboard.fees.overdue_amount >
                  0
                  ? `${formatMoney(
                      dashboard.fees.overdue_amount
                    )} overdue`
                  : "No overdue amount"
              }
              icon={
                WalletCards
              }
              href="/parent/fees"
              iconClass="
                bg-orange-100
                text-orange-600
              "
            />

          </section>


          {/* =====================================
              UPCOMING EXAM + FEE
          ====================================== */}

          <section
            className="
              mt-5
              grid
              gap-5
              lg:grid-cols-2
            "
          >

            {/* EXAM */}

            <Panel
              title="Upcoming Examination"
              icon={
                GraduationCap
              }
              link="/parent/exam-schedule"
            >

              {dashboard.upcoming_exam ? (

                <div
                  className="
                    rounded-xl
                    bg-[#F8FBFF]
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
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wide
                          text-[#0075FF]
                        "
                      >
                        {
                          dashboard
                            .upcoming_exam
                            .exam_name
                        }
                      </p>


                      <h3
                        className="
                          mt-1
                          font-bold
                          text-[#0B3A67]
                        "
                      >
                        {
                          dashboard
                            .upcoming_exam
                            .subject
                        }
                      </h3>

                    </div>


                    <GraduationCap
                      size={22}
                      className="
                        text-[#0075FF]
                      "
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

                    <SmallInfo
                      title="Date"
                      value={
                        formatDate(
                          dashboard
                            .upcoming_exam
                            .exam_date
                        )
                      }
                    />


                    <SmallInfo
                      title="Time"
                      value={
                        formatTime(
                          dashboard
                            .upcoming_exam
                            .start_time
                        )
                      }
                    />


                    <SmallInfo
                      title="Room"
                      value={
                        dashboard
                          .upcoming_exam
                          .room ||
                        "--"
                      }
                    />

                  </div>

                </div>

              ) : (

                <EmptyMini
                  text="No upcoming examinations."
                />

              )}

            </Panel>


            {/* FEES */}

            <Panel
              title="Fee Summary"
              icon={
                ReceiptIndianRupee
              }
              link="/parent/fees"
            >

              <div
                className="
                  grid
                  grid-cols-2
                  gap-3
                "
              >

                <SmallInfo
                  title="Total Fee"
                  value={
                    formatMoney(
                      dashboard
                        .fees
                        .total_fee
                    )
                  }
                />


                <SmallInfo
                  title="Paid"
                  value={
                    formatMoney(
                      dashboard
                        .fees
                        .total_paid
                    )
                  }
                />


                <SmallInfo
                  title="Pending"
                  value={
                    formatMoney(
                      dashboard
                        .fees
                        .total_pending
                    )
                  }
                />


                <SmallInfo
                  title="Overdue"
                  value={
                    formatMoney(
                      dashboard
                        .fees
                        .overdue_amount
                    )
                  }
                />

              </div>

            </Panel>

          </section>


          {/* =====================================
              CIRCULARS + EVENTS
          ====================================== */}

          <section
            className="
              mt-5
              grid
              gap-5
              lg:grid-cols-2
            "
          >

            {/* CIRCULARS */}

            <Panel
              title="Latest Circulars"
              icon={
                Megaphone
              }
              link="/parent/circulars"
            >

              {dashboard
                .latest_circulars
                .length > 0 ? (

                <div
                  className="
                    divide-y
                    divide-slate-100
                  "
                >

                  {dashboard
                    .latest_circulars
                    .map(
                      (item) => (
                        <CircularRow
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

              ) : (

                <EmptyMini
                  text="No circulars available."
                />

              )}

            </Panel>


            {/* EVENTS */}

            <Panel
              title="Upcoming Events"
              icon={
                CalendarDays
              }
              link="/parent/calendar"
            >

              {dashboard
                .upcoming_events
                .length > 0 ? (

                <div
                  className="
                    divide-y
                    divide-slate-100
                  "
                >

                  {dashboard
                    .upcoming_events
                    .map(
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

              ) : (

                <EmptyMini
                  text="No upcoming events."
                />

              )}

            </Panel>

          </section>

        </>
      )}

    </div>
  );
}


// =========================================================
// DASHBOARD CARD
// =========================================================

function DashboardCard({
  title,
  value,
  description,
  icon: Icon,
  href,
  iconClass,
}) {
  return (
    <Link
      href={href}
      className="
        rounded-2xl
        border
        border-[#E4EDF7]
        bg-white
        p-4
        shadow-sm
        transition
        hover:-translate-y-0.5
        hover:border-[#0075FF]/30
        hover:shadow-md
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

        <div
          className={`
            flex
            h-11
            w-11
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


        <TrendingUp
          size={17}
          className="
            text-slate-300
          "
        />

      </div>


      <p
        className="
          mt-4
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


      <p
        className="
          mt-1
          text-[11px]
          text-slate-400
        "
      >
        {description}
      </p>

    </Link>
  );
}


// =========================================================
// PANEL
// =========================================================

function Panel({
  title,
  icon: Icon,
  link,
  children,
}) {
  return (
    <section
      className="
        rounded-2xl
        border
        border-[#E4EDF7]
        bg-white
        p-5
        shadow-sm
      "
    >

      <div
        className="
          mb-4
          flex
          items-center
          justify-between
          gap-3
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
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              bg-[#EAF4FF]
              text-[#0075FF]
            "
          >
            <Icon
              size={17}
            />
          </div>


          <h2
            className="
              font-bold
              text-[#0B3A67]
            "
          >
            {title}
          </h2>

        </div>


        <Link
          href={link}
          className="
            text-xs
            font-semibold
            text-[#0075FF]
            hover:underline
          "
        >
          View All
        </Link>

      </div>


      {children}

    </section>
  );
}


// =========================================================
// SMALL INFO
// =========================================================

function SmallInfo({
  title,
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
          uppercase
          tracking-wide
          text-slate-400
        "
      >
        {title}
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
// CIRCULAR
// =========================================================

function CircularRow({
  item,
}) {
  return (
    <div
      className="
        flex
        gap-3
        py-3
        first:pt-0
        last:pb-0
      "
    >

      <div
        className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-[#F8FBFF]
          text-[#0075FF]
        "
      >
        <Megaphone
          size={16}
        />
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
          {item.title}
        </p>


        <p
          className="
            mt-1
            text-[10px]
            text-slate-400
          "
        >
          {item.category}

          {" • "}

          {
            formatDate(
              item.published_date
            )
          }
        </p>

      </div>

    </div>
  );
}


// =========================================================
// EVENT
// =========================================================

function EventRow({
  item,
}) {
  return (
    <div
      className="
        flex
        gap-3
        py-3
        first:pt-0
        last:pb-0
      "
    >

      <div
        className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-[#F8FBFF]
          text-[#0075FF]
        "
      >
        <CalendarDays
          size={16}
        />
      </div>


      <div
        className="
          min-w-0
          flex-1
        "
      >

        <p
          className="
            text-sm
            font-semibold
            text-[#0B3A67]
          "
        >
          {item.title}
        </p>


        <p
          className="
            mt-1
            text-[10px]
            text-slate-400
          "
        >
          {item.event_type}

          {" • "}

          {
            formatDate(
              item.start_date
            )
          }

          {item.location
            ? ` • ${item.location}`
            : ""}
        </p>

      </div>

    </div>
  );
}


// =========================================================
// EMPTY MINI
// =========================================================

function EmptyMini({
  text,
}) {
  return (
    <div
      className="
        rounded-xl
        bg-[#F8FBFF]
        py-10
        text-center
      "
    >

      <CircleAlert
        size={26}
        className="
          mx-auto
          text-slate-300
        "
      />


      <p
        className="
          mt-2
          text-xs
          text-slate-400
        "
      >
        {text}
      </p>

    </div>
  );
}


// =========================================================
// EMPTY CHILDREN
// =========================================================

function EmptyChildren() {
  return (
    <div
      className="
        mt-6
        rounded-2xl
        border
        border-[#E4EDF7]
        bg-white
        py-16
        text-center
      "
    >

      <UserRound
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
        No children linked
      </h3>


      <p
        className="
          mt-1
          text-sm
          text-slate-400
        "
      >
        Contact the school administrator
        to link your child.
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