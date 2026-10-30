"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  getAdminDashboardStats,
} from "@/services/adminService";

import {
  getAdminCirculars,
} from "@/services/adminCircularService";

import {
  getAdminCalendarEvents,
} from "@/services/adminCalendarService";

import {
  GraduationCap,
  Users,
  UserRound,
  School,
  Megaphone,
  ArrowUpRight,
  Plus,
  UserPlus,
  ClipboardPlus,
  RefreshCw,
  AlertCircle,
  MapPin,
  Clock3,
  CalendarClock,
} from "lucide-react";

function formatDayMonth(value) {
  if (!value) return null;

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;

  return {
    day: date.toLocaleDateString("en-IN", { day: "2-digit" }),
    month: date
      .toLocaleDateString("en-IN", { month: "short" })
      .toUpperCase(),
  };
}

function formatDisplayDate(value) {
  if (!value) return "";

  const date = new Date(
    value.includes("T") ? value : `${value}T00:00:00`
  );
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTimeRange(start, end) {
  if (!start) return "";

  return end ? `${start} - ${end}` : start;
}

export default function AdminDashboardPage() {
  const [dashboardStats, setDashboardStats] = useState({
    total_students: 0,
    total_teachers: 0,
    total_parents: 0,
    total_classes: 0,
  });

  const [recentCirculars, setRecentCirculars] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [secondaryLoading, setSecondaryLoading] = useState(true);
  const [error, setError] = useState("");
  const [secondaryError, setSecondaryError] = useState("");

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminDashboardStats();

      setDashboardStats({
        total_students:
          response?.data?.total_students ?? 0,

        total_teachers:
          response?.data?.total_teachers ?? 0,

        total_parents:
          response?.data?.total_parents ?? 0,

        total_classes:
          response?.data?.total_classes ?? 0,
      });
    } catch (error) {
      console.error(
        "Dashboard loading error:",
        error
      );

      setError(
        error?.message ||
          "Unable to load dashboard statistics."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadRecentCircularsAndEvents = async () => {
    try {
      setSecondaryLoading(true);
      setSecondaryError("");

      const [circularResponse, eventsResponse] =
        await Promise.all([
          getAdminCirculars({ is_active: true }),
          getAdminCalendarEvents({ is_active: true }),
        ]);

      const circularList = Array.isArray(
        circularResponse?.data
      )
        ? circularResponse.data
        : [];

      setRecentCirculars(
        [...circularList]
          .sort(
            (a, b) =>
              new Date(b.published_date || b.created_at) -
              new Date(a.published_date || a.created_at)
          )
          .slice(0, 4)
      );

      const eventList = Array.isArray(eventsResponse?.data)
        ? eventsResponse.data
        : [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      setUpcomingEvents(
        eventList
          .filter((event) => {
            const start = new Date(
              `${event.start_date}T00:00:00`
            );
            return !Number.isNaN(start.getTime()) && start >= today;
          })
          .sort(
            (a, b) =>
              new Date(`${a.start_date}T00:00:00`) -
              new Date(`${b.start_date}T00:00:00`)
          )
          .slice(0, 4)
      );
    } catch (error) {
      console.error(
        "Dashboard activity loading error:",
        error
      );

      setSecondaryError(
        error?.message ||
          "Unable to load recent circulars and events."
      );
    } finally {
      setSecondaryLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadDashboardStats();
      void loadRecentCircularsAndEvents();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const stats = [
    {
      title: "Total Students",
      value: dashboardStats.total_students,
      description: "Registered students",
      icon: GraduationCap,
    },
    {
      title: "Total Teachers",
      value: dashboardStats.total_teachers,
      description: "Teaching staff",
      icon: Users,
    },
    {
      title: "Total Parents",
      value: dashboardStats.total_parents,
      description: "Registered parents",
      icon: UserRound,
    },
    {
      title: "Total Classes",
      value: dashboardStats.total_classes,
      description: "Active school classes",
      icon: School,
    },
  ];

  return (
    <>
      {/* Greeting */}
      <section className="mb-7">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-[#0B3A67] md:text-[28px]">
              Welcome back, Admin 👋
            </h1>

            <p className="mt-1.5 text-sm text-[#64748B]">
              Manage Rosary School&apos;s students,
              teachers, parents, academics and
              communication.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">

            <button
              onClick={() => {
                void loadDashboardStats();
                void loadRecentCircularsAndEvents();
              }}
              disabled={loading || secondaryLoading}
              className="
                inline-flex h-11 items-center
                justify-center gap-2 rounded-xl
                border border-[#E5EDF5] bg-white
                px-4 text-sm font-semibold
                text-[#475569] transition
                hover:border-[#CBD9EA] hover:bg-[#F7F9FC]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              <RefreshCw
                size={16}
                className={
                  loading || secondaryLoading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

            <Link
              href="/admin/students/add"
              className="
                inline-flex h-11 items-center
                justify-center gap-2 rounded-xl
                bg-[#0075FF] px-5 text-sm font-semibold
                text-white shadow-sm
                transition hover:bg-[#0067DF]
              "
            >
              <Plus size={18} />

              Add Student
            </Link>

          </div>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-[#FEF2F2] px-4 py-3">

          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0 text-[#DC2626]"
          />

          <div>
            <p className="text-sm font-semibold text-[#DC2626]">
              Unable to load dashboard
            </p>

            <p className="mt-0.5 text-xs text-[#B91C1C]">
              {error}
            </p>
          </div>

        </div>
      )}

      {/* Statistics */}
      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="
                rounded-2xl border
                border-[#E8EEF6] bg-white
                p-5 shadow-[0_1px_2px_rgba(11,58,103,0.05)] transition
                duration-200 hover:-translate-y-0.5
                hover:border-[#D4E3F5] hover:shadow-[0_6px_20px_rgba(11,58,103,0.08)]
              "
            >
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-[13px] font-medium text-[#64748B]">
                    {stat.title}
                  </p>

                  {loading ? (
                    <div className="mt-3 h-9 w-20 animate-pulse rounded-lg bg-[#E8EEF6]" />
                  ) : (
                    <h3 className="mt-3 text-[30px] font-bold leading-9 tabular-nums text-[#0B3A67]">
                      {Number(
                        stat.value
                      ).toLocaleString()}
                    </h3>
                  )}

                  <p className="mt-1.5 text-xs text-[#94A3B8]">
                    {stat.description}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF3FF] text-[#0075FF]">
                  <Icon size={22} />
                </div>

              </div>
            </div>
          );
        })}

      </section>

      {/* Quick Actions */}
      <section className="mb-8">

        <div className="mb-4">
          <h2 className="text-[17px] font-bold text-[#0B3A67]">
            Quick Actions
          </h2>

          <p className="mt-0.5 text-sm text-[#64748B]">
            Common administration tasks
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {[
            {
              href: "/admin/students/add",
              icon: UserPlus,
              title: "Add Student",
              description: "Create student profile",
            },
            {
              href: "/admin/teachers/add",
              icon: Users,
              title: "Add Teacher",
              description: "Create teacher profile",
            },
            {
              href: "/admin/circulars/add",
              icon: Megaphone,
              title: "Add Circular",
              description: "Publish announcement",
            },
            {
              href: "/admin/exams/add",
              icon: ClipboardPlus,
              title: "Create Exam",
              description: "Schedule examination",
            },
          ].map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.href}
                href={action.href}
                className="
                  group flex items-center gap-4 rounded-2xl border
                  border-[#E8EEF6] bg-white p-5
                  shadow-[0_1px_2px_rgba(11,58,103,0.05)] transition
                  duration-200 hover:border-[#BEDAFA] hover:bg-[#FBFDFF]
                  hover:shadow-[0_6px_20px_rgba(0,117,255,0.08)]
                "
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF3FF] text-[#0075FF] transition group-hover:bg-[#0075FF] group-hover:text-white">
                  <Icon size={20} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-[#0B3A67]">
                    {action.title}
                  </h3>

                  <p className="mt-0.5 truncate text-xs text-[#64748B]">
                    {action.description}
                  </p>
                </div>
              </Link>
            );
          })}

        </div>
      </section>

      {/* Circulars + Events */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {secondaryError && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-[#FEF2F2] px-4 py-3 xl:col-span-2">

            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0 text-[#DC2626]"
            />

            <div>
              <p className="text-sm font-semibold text-[#DC2626]">
                Unable to load recent activity
              </p>

              <p className="mt-0.5 text-xs text-[#B91C1C]">
                {secondaryError}
              </p>
            </div>

          </div>
        )}

        {/* Recent Circulars */}
        <div className="rounded-2xl border border-[#E8EEF6] bg-white shadow-[0_1px_2px_rgba(11,58,103,0.05)]">

          <div className="flex items-center justify-between border-b border-[#EDF2F9] p-5">
            <div>
              <h2 className="text-[17px] font-bold text-[#0B3A67]">
                Recent Circulars
              </h2>

              <p className="mt-0.5 text-sm text-[#64748B]">
                Latest school announcements
              </p>
            </div>

            <Link
              href="/admin/circulars"
              className="flex shrink-0 items-center gap-1 text-sm font-semibold text-[#0075FF] transition hover:opacity-80"
            >
              View All

              <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="divide-y divide-[#F1F5F9]">

            {secondaryLoading ? (
              [0, 1, 2].map((row) => (
                <div key={row} className="flex items-center gap-4 p-5">
                  <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-[#EDF2F9]" />
                  <div className="flex-1">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-[#EDF2F9]" />
                    <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-[#F5F8FC]" />
                  </div>
                </div>
              ))
            ) : recentCirculars.length === 0 ? (
              <div className="flex flex-col items-center px-5 py-10 text-center">
                <Megaphone size={26} className="mb-3 text-[#9CA3AF]" />

                <p className="text-sm font-semibold text-[#0B3A67]">
                  No circulars yet
                </p>

                <p className="mt-1 text-xs text-[#64748B]">
                  Published announcements will appear here.
                </p>
              </div>
            ) : (
              recentCirculars.map((circular) => (
                <Link
                  key={circular.id}
                  href="/admin/circulars"
                  className="flex items-start gap-4 p-5 transition hover:bg-[#FAFCFF]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF3FF] text-[#0075FF]">
                    <Megaphone size={19} />
                  </div>

                  <div className="min-w-0 flex-1">

                    <h3 className="truncate text-sm font-semibold text-[#0B3A67]">
                      {circular.title}
                    </h3>

                    <p className="mt-0.5 truncate text-xs text-[#64748B]">
                      {circular.description}
                    </p>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#94A3B8]">
                      <span>
                        {formatDisplayDate(
                          circular.published_date || circular.created_at
                        )}
                      </span>

                      {circular.audience && (
                        <>
                          <span aria-hidden="true">•</span>

                          <span>
                            {circular.audience.toLowerCase() === "all"
                              ? "All"
                              : `${circular.audience} audience`}
                          </span>
                        </>
                      )}
                    </div>

                  </div>
                </Link>
              ))
            )}

          </div>
        </div>

        {/* Events */}
        <div className="rounded-2xl border border-[#E8EEF6] bg-white shadow-[0_1px_2px_rgba(11,58,103,0.05)]">

          <div className="flex items-center justify-between border-b border-[#EDF2F9] p-5">

            <div>
              <h2 className="text-[17px] font-bold text-[#0B3A67]">
                Upcoming Events
              </h2>

              <p className="mt-0.5 text-sm text-[#64748B]">
                School calendar
              </p>
            </div>

            <Link
              href="/admin/calendar"
              className="flex shrink-0 items-center gap-1 text-sm font-semibold text-[#0075FF] transition hover:opacity-80"
            >
              View Calendar

              <ArrowUpRight size={16} />
            </Link>

          </div>

          <div className="divide-y divide-[#F1F5F9]">

            {secondaryLoading ? (
              [0, 1, 2].map((row) => (
                <div key={row} className="flex items-center gap-4 p-5">
                  <div className="h-11 w-14 shrink-0 animate-pulse rounded-xl bg-[#EDF2F9]" />
                  <div className="flex-1">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-[#EDF2F9]" />
                    <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-[#F5F8FC]" />
                  </div>
                </div>
              ))
            ) : upcomingEvents.length === 0 ? (
              <div className="flex flex-col items-center px-5 py-10 text-center">
                <CalendarClock size={26} className="mb-3 text-[#9CA3AF]" />

                <p className="text-sm font-semibold text-[#0B3A67]">
                  No upcoming events
                </p>

                <p className="mt-1 text-xs text-[#64748B]">
                  Scheduled events will appear here.
                </p>
              </div>
            ) : (
              upcomingEvents.map((event) => {
                const dayMonth = formatDayMonth(event.start_date);

                return (
                  <Link
                    key={event.id}
                    href="/admin/calendar"
                    className="flex items-center gap-4 p-5 transition hover:bg-[#FAFCFF]"
                  >

                    <div className="w-14 shrink-0 overflow-hidden rounded-xl border border-[#E2ECF8] text-center">
                      <div className="bg-[#0075FF] py-1 text-[10px] font-bold uppercase text-white">
                        {dayMonth ? dayMonth.month : "—"}
                      </div>

                      <div className="py-1.5 text-lg font-bold tabular-nums text-[#0B3A67]">
                        {dayMonth ? dayMonth.day : "·"}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-[#0B3A67]">
                        {event.title}
                      </h3>

                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#64748B]">
                        {event.start_time && (
                          <span className="inline-flex items-center gap-1">
                            <Clock3 size={13} />

                            {formatTimeRange(
                              event.start_time,
                              event.end_time
                            )}
                          </span>
                        )}

                        {event.location && (
                          <span className="inline-flex items-start gap-1">
                            <MapPin size={13} className="mt-0.5 shrink-0" />

                            <span className="truncate">
                              {event.location}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                  </Link>
                );
              })
            )}

          </div>
        </div>

      </section>
    </>
  );
}
