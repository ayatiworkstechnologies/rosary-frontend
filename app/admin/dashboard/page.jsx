"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import AdminShell from "@/components/admin/AdminShell";
import { getAdminDashboardStats } from "@/services/adminService";

import {
  GraduationCap,
  Users,
  UserRound,
  School,
  Megaphone,
  CalendarDays,
  ArrowUpRight,
  Plus,
  UserPlus,
  ClipboardPlus,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

const circulars = [
  {
    title: "Quarterly Examination Schedule",
    date: "15 Sep 2026",
    audience: "Parents & Students",
  },
  {
    title: "Parent Teacher Meeting",
    date: "12 Sep 2026",
    audience: "Parents",
  },
  {
    title: "School Holiday Announcement",
    date: "10 Sep 2026",
    audience: "All",
  },
];

const events = [
  {
    day: "18",
    month: "SEP",
    title: "Parent Teacher Meeting",
    time: "10:00 AM",
  },
  {
    day: "22",
    month: "SEP",
    title: "Inter School Competition",
    time: "09:00 AM",
  },
  {
    day: "27",
    month: "SEP",
    title: "Annual Sports Practice",
    time: "08:30 AM",
  },
];

export default function AdminDashboardPage() {
  const [dashboardStats, setDashboardStats] = useState({
    total_students: 0,
    total_teachers: 0,
    total_parents: 0,
    total_classes: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  useEffect(() => {
    loadDashboardStats();
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
    <AdminShell>
      {/* Welcome */}
      <section className="mb-7">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Welcome back, Admin 👋
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage Rosary School&apos;s students,
              teachers, parents, academics and
              communication.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">

            <button
              onClick={loadDashboardStats}
              disabled={loading}
              className="
                inline-flex h-11 items-center
                justify-center gap-2 rounded-xl
                border border-gray-200 bg-white
                px-4 text-sm font-semibold
                text-gray-600 transition
                hover:bg-gray-50
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              <RefreshCw
                size={17}
                className={
                  loading ? "animate-spin" : ""
                }
              />

              Refresh
            </button>

            <Link
              href="/admin/students/add"
              className="
                inline-flex h-11 items-center
                justify-center gap-2 rounded-xl
                bg-[#0075FF] px-5
                text-sm font-semibold text-white
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
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0 text-red-500"
          />

          <div>
            <p className="text-sm font-semibold text-red-700">
              Unable to load dashboard
            </p>

            <p className="mt-0.5 text-xs text-red-600">
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
                border-gray-100 bg-white
                p-5 shadow-sm transition
                hover:-translate-y-0.5
                hover:shadow-md
              "
            >
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </p>

                  {loading ? (
                    <div className="mt-3 h-9 w-20 animate-pulse rounded-lg bg-gray-200" />
                  ) : (
                    <h3 className="mt-3 text-3xl font-bold text-gray-900">
                      {Number(
                        stat.value
                      ).toLocaleString()}
                    </h3>
                  )}

                  <p className="mt-1 text-xs text-gray-400">
                    {stat.description}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#0075FF]">
                  <Icon size={23} />
                </div>

              </div>
            </div>
          );
        })}

      </section>

      {/* Quick Actions */}
      <section className="mb-8">

        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            Quick Actions
          </h2>

          <p className="text-sm text-gray-500">
            Common administration tasks
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <Link
            href="/admin/students/add"
            className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-blue-100 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0075FF]">
              <UserPlus size={21} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-800">
                Add Student
              </h3>

              <p className="text-xs text-gray-500">
                Create student profile
              </p>
            </div>
          </Link>

          <Link
            href="/admin/teachers/add"
            className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-blue-100 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0075FF]">
              <Users size={21} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-800">
                Add Teacher
              </h3>

              <p className="text-xs text-gray-500">
                Create teacher profile
              </p>
            </div>
          </Link>

          <Link
            href="/admin/circulars/add"
            className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-blue-100 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0075FF]">
              <Megaphone size={21} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-800">
                Add Circular
              </h3>

              <p className="text-xs text-gray-500">
                Publish announcement
              </p>
            </div>
          </Link>

          <Link
            href="/admin/exams/add"
            className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-blue-100 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0075FF]">
              <ClipboardPlus size={21} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-800">
                Create Exam
              </h3>

              <p className="text-xs text-gray-500">
                Schedule examination
              </p>
            </div>
          </Link>

        </div>
      </section>

      {/* Circulars + Events */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* Recent Circulars */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-gray-100 p-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Recent Circulars
              </h2>

              <p className="text-sm text-gray-500">
                Latest school announcements
              </p>
            </div>

            <Link
              href="/admin/circulars"
              className="flex items-center gap-1 text-sm font-semibold text-[#0075FF]"
            >
              View All

              <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="divide-y divide-gray-100">

            {circulars.map((circular) => (
              <div
                key={circular.title}
                className="flex items-start gap-4 p-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0075FF]">
                  <Megaphone size={20} />
                </div>

                <div className="min-w-0 flex-1">

                  <h3 className="truncate text-sm font-semibold text-gray-800">
                    {circular.title}
                  </h3>

                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span>{circular.date}</span>

                    <span>•</span>

                    <span>
                      {circular.audience}
                    </span>
                  </div>

                </div>
              </div>
            ))}

          </div>
        </div>

        {/* Events */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-gray-100 p-5">

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Upcoming Events
              </h2>

              <p className="text-sm text-gray-500">
                School calendar
              </p>
            </div>

            <Link
              href="/admin/calendar"
              className="flex items-center gap-1 text-sm font-semibold text-[#0075FF]"
            >
              View Calendar

              <ArrowUpRight size={16} />
            </Link>

          </div>

          <div className="divide-y divide-gray-100">

            {events.map((event) => (
              <div
                key={`${event.day}-${event.title}`}
                className="flex items-center gap-4 p-5"
              >

                <div className="w-14 shrink-0 overflow-hidden rounded-xl border border-blue-100 text-center">

                  <div className="bg-[#0075FF] py-1 text-[10px] font-bold text-white">
                    {event.month}
                  </div>

                  <div className="py-1.5 text-lg font-bold text-gray-800">
                    {event.day}
                  </div>

                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    {event.title}
                  </h3>

                  <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                    <CalendarDays size={13} />

                    {event.time}
                  </div>
                </div>

              </div>
            ))}

          </div>
        </div>

      </section>
    </AdminShell>
  );
}