"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  Users,
  CalendarCheck,
  NotebookPen,
  GraduationCap,
  CalendarDays,
  Megaphone,
  ChevronDown,
  Clock3,
  RefreshCw,
  AlertCircle,
  BookOpenCheck,
} from "lucide-react";

import useStoredUser from "@/hooks/useStoredUser";
import api from "@/services/api";
import { getTeacherHomework } from "@/services/teacherService";

export default function TeacherDashboard() {
  const user = useStoredUser();

  const [assignedClasses, setAssignedClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [studentCount, setStudentCount] = useState(0);

  const [recentHomework, setRecentHomework] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState("");

  const [classesLoading, setClassesLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);

  const [error, setError] = useState("");

  // =========================================================
  // LOAD ASSIGNED CLASSES
  // =========================================================

  useEffect(() => {
    const loadAssignedClasses = async () => {
      try {
        setClassesLoading(true);
        setError("");

        const response = await api.get(
          "/teacher/classes"
        );

        const classes = Array.isArray(response.data)
          ? response.data
          : response.data?.classes || [];

        setAssignedClasses(classes);

        if (classes.length > 0) {
          setSelectedClassId(
            String(classes[0].id)
          );
        } else {
          setSelectedClassId("");
          setStudentCount(0);
        }
      } catch (err) {
        console.error(
          "Failed to load teacher classes:",
          err
        );

        setAssignedClasses([]);
        setSelectedClassId("");
        setStudentCount(0);

        setError(
          "Unable to load assigned classes."
        );
      } finally {
        setClassesLoading(false);
      }
    };

    loadAssignedClasses();
  }, []);

  // =========================================================
  // LOAD STUDENT COUNT FOR SELECTED CLASS
  // =========================================================

  useEffect(() => {
    if (!selectedClassId) {
      return;
    }

    const loadStudents = async () => {
      try {
        setStudentsLoading(true);
        setError("");

        const response = await api.get(
          `/teacher/classes/${selectedClassId}/students`
        );

        const total =
          response.data?.total ??
          response.data?.students?.length ??
          0;

        setStudentCount(total);
      } catch (err) {
        console.error(
          "Failed to load class students:",
          err
        );

        setStudentCount(0);

        setError(
          "Unable to load students for this class."
        );
      } finally {
        setStudentsLoading(false);
      }
    };

    loadStudents();
  }, [selectedClassId]);

  // =========================================================
  // LOAD RECENT HOMEWORK (REAL BACKEND DATA)
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const loadRecentHomework = async () => {
      if (!selectedClassId) {
        setRecentHomework([]);
        setActivityLoading(false);
        return;
      }

      try {
        setActivityLoading(true);
        setActivityError("");

        const data = await getTeacherHomework(
          selectedClassId
        );

        if (cancelled) {
          return;
        }

        const list = Array.isArray(data)
          ? data
          : data?.homework || [];

        setRecentHomework(
          list
            .slice()
            .sort(
              (a, b) =>
                new Date(b.assigned_date || b.created_at) -
                new Date(a.assigned_date || a.created_at)
            )
            .slice(0, 4)
        );
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load recent homework:",
          err
        );

        setRecentHomework([]);

        setActivityError(
          err?.response?.data?.detail ||
            "Unable to load recent homework."
        );
      } finally {
        if (!cancelled) {
          setActivityLoading(false);
        }
      }
    };

    void loadRecentHomework();

    return () => {
      cancelled = true;
    };
  }, [selectedClassId]);

  // =========================================================
  // SELECTED CLASS
  // =========================================================

  const selectedClass = assignedClasses.find(
    (item) =>
      String(item.id) ===
      String(selectedClassId)
  );

  function formatShortDate(value) {
    if (!value) return null;

    const date = new Date(
      value.includes("T") ? value : `${value}T00:00:00`
    );

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return {
      day: date.toLocaleDateString("en-IN", { day: "2-digit" }),
      month: date.toLocaleDateString("en-IN", { month: "short" }),
      weekday: date.toLocaleDateString("en-IN", { weekday: "long" }),
      full: date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      raw: date,
    };
  }

  return (
    <>
      {/* Welcome */}
      <section className="mb-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>
            <p className="text-sm font-medium text-[#64748B]">
              Welcome back,
            </p>

            <h1 className="text-[22px] font-bold tracking-tight text-[#0B3A67] md:text-[28px]">
              {user?.name || "Teacher"}! 👋
            </h1>

            <p className="mt-1.5 text-sm text-[#64748B]">
              {selectedClass
                ? `${selectedClass.display_name}${
                    selectedClass.subject
                      ? ` • ${selectedClass.subject}`
                      : ""
                  }`
                : "Inspire • Educate • Empower"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="
              inline-flex h-11 shrink-0 items-center
              justify-center gap-2 rounded-xl
              border border-[#E5EDF5] bg-white
              px-4 text-sm font-semibold
              text-[#475569] transition
              hover:border-[#CBD9EA] hover:bg-[#F7F9FC]
            "
          >
            <RefreshCw size={16} />
            Refresh
          </button>

        </div>
      </section>

      {/* Select class */}
      <section className="mb-4 rounded-2xl border border-[#E8EEF6] bg-white p-4 shadow-[0_1px_2px_rgba(11,58,103,0.05)] sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF3FF] text-[#0075FF]">
            <Users size={20} />
          </div>

          <div className="min-w-0 flex-1">

            <label
              htmlFor="teacher-class"
              className="mb-1 block text-xs font-semibold text-[#0B3A67]"
            >
              Select Class
            </label>

            <div className="relative max-w-md">

              <select
                id="teacher-class"
                value={selectedClassId}
                onChange={(event) =>
                  setSelectedClassId(
                    event.target.value
                  )
                }
                disabled={
                  classesLoading ||
                  assignedClasses.length === 0
                }
                className="
                  w-full
                  appearance-none
                  rounded-lg
                  border
                  border-[#D6E3F3]
                  bg-white
                  px-3
                  py-2.5
                  pr-10
                  text-sm
                  font-medium
                  text-[#334155]
                  outline-none
                  transition
                  hover:border-[#C3D6EC]
                  focus:border-[#0075FF]
                  focus:ring-2
                  focus:ring-[#0075FF]/10
                  disabled:cursor-not-allowed
                  disabled:bg-[#F7F9FC]
                  disabled:text-[#94A3B8]
                "
              >
                {classesLoading ? (
                  <option value="">
                    Loading assigned classes...
                  </option>
                ) : assignedClasses.length === 0 ? (
                  <option value="">
                    No assigned classes
                  </option>
                ) : (
                  assignedClasses.map(
                    (item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.display_name}
                        {item.subject
                          ? ` - ${item.subject}`
                          : ""}
                      </option>
                    )
                  )
                )}
              </select>

              <ChevronDown
                size={16}
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

            {selectedClass && (
              <p className="mt-1.5 text-[11px] text-[#64748B]">
                Assigned Subject:{" "}
                <span className="font-medium text-[#334155]">
                  {selectedClass.subject || "—"}
                </span>
              </p>
            )}

          </div>

        </div>

        {error && (
          <p className="mt-3 text-xs font-medium text-[#DC2626]">
            {error}
          </p>
        )}

      </section>

      {/* Main cards */}
      <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {[
          {
            title: "Students",
            value:
              studentsLoading
                ? null
                : Number(studentCount).toLocaleString(),
            description:
              selectedClass
                ? `Enrolled in ${selectedClass.display_name}`
                : "Select a class",
            icon: Users,
            href:
              selectedClassId
                ? `/teacher/students?class_id=${selectedClassId}`
                : "/teacher/students",
            tile: "bg-[#EAF3FF] text-[#0075FF]",
          },
          {
            title: "Attendance",
            value: "Mark",
            description:
              selectedClass
                ? `Daily attendance for ${selectedClass.display_name}`
                : "Daily class attendance",
            icon: CalendarCheck,
            href:
              selectedClassId
                ? `/teacher/attendance?class_id=${selectedClassId}`
                : "/teacher/attendance",
            tile: "bg-emerald-50 text-emerald-600",
          },
          {
            title: "Homework",
            value: "Add new",
            description:
              selectedClass
                ? `Assignments for ${selectedClass.display_name}`
                : "Create assignments",
            icon: NotebookPen,
            href:
              selectedClassId
                ? `/teacher/homework?class_id=${selectedClassId}`
                : "/teacher/homework",
            tile: "bg-amber-50 text-amber-600",
          },
          {
            title: "Academic Results",
            value: "Update",
            description:
              selectedClass
                ? `Marks for ${selectedClass.display_name}`
                : "Enter student marks",
            icon: GraduationCap,
            href:
              selectedClassId
                ? `/teacher/results?class_id=${selectedClassId}`
                : "/teacher/results",
            tile: "bg-violet-50 text-violet-600",
          },
        ].map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.title}
              href={card.href}
              className="
                rounded-2xl border
                border-[#E8EEF6] bg-white
                p-5 shadow-[0_1px_2px_rgba(11,58,103,0.05)] transition
                duration-200 hover:-translate-y-0.5
                hover:border-[#D4E3F5] hover:shadow-[0_6px_20px_rgba(11,58,103,0.08)]
              "
            >
              <div className="flex items-start justify-between gap-3">

                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-[#64748B]">
                    {card.title}
                  </p>

                  {card.value === null ? (
                    <div className="mt-3 h-9 w-20 animate-pulse rounded-lg bg-[#EDF2F9]" />
                  ) : (
                    <h3 className="mt-3 truncate text-2xl font-bold leading-8 text-[#0B3A67]">
                      {card.value}
                    </h3>
                  )}

                  <p className="mt-1.5 truncate text-xs text-[#94A3B8]">
                    {card.description}
                  </p>
                </div>

                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.tile}`}>
                  <Icon size={20} />
                </div>

              </div>
            </Link>
          );
        })}

      </section>

      {/* Quick actions */}
      <section className="mb-5">

        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[17px] font-bold text-[#0B3A67]">
            Quick Actions
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

          {[
            {
              href: "/teacher/exam-schedule",
              icon: CalendarDays,
              title: "Exam Schedule",
              description: "Manage exam schedule",
              tile: "bg-[#EAF3FF] text-[#0075FF]",
            },
            {
              href: "/teacher/circulars",
              icon: Megaphone,
              title: "Digital Circulars",
              description: "Read school circulars",
              tile: "bg-rose-50 text-rose-600",
            },
            {
              href: "/teacher/calendar",
              icon: CalendarDays,
              title: "School Calendar",
              description: "Upcoming events",
              tile: "bg-teal-50 text-teal-600",
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
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${action.tile} group-hover:bg-[#0075FF] group-hover:text-white`}>
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

      {/* Recent homework */}
      <section className="rounded-2xl border border-[#E8EEF6] bg-white shadow-[0_1px_2px_rgba(11,58,103,0.05)]">

        <div className="flex items-center justify-between border-b border-[#EDF2F9] p-5">
          <div>
            <h2 className="text-[17px] font-bold text-[#0B3A67]">
              Recent Homework
            </h2>

            <p className="mt-0.5 text-sm text-[#64748B]">
              {selectedClass
                ? `Latest assignments for ${selectedClass.display_name}`
                : "Latest classroom activity"}
            </p>
          </div>

          <Link
            href={
              selectedClassId
                ? `/teacher/homework?class_id=${selectedClassId}`
                : "/teacher/homework"
            }
            className="flex shrink-0 items-center gap-1 text-sm font-semibold text-[#0075FF] transition hover:opacity-80"
          >
            Manage

            <ChevronDown size={15} className="rotate-[-90deg]" />
          </Link>
        </div>

        <div className="divide-y divide-[#F1F5F9]">

          {activityLoading ? (
            [0, 1, 2].map((row) => (
              <div key={row} className="flex items-center gap-4 p-5">
                <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-[#EDF2F9]" />
                <div className="flex-1">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-[#EDF2F9]" />
                  <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-[#F5F8FC]" />
                </div>
              </div>
            ))
          ) : activityError ? (
            <div className="flex items-start gap-3 p-5">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0 text-[#DC2626]"
              />
              <div>
                <p className="text-sm font-semibold text-[#0B3A67]">
                  Unable to load homework
                </p>
                <p className="mt-0.5 text-xs text-[#B91C1C]">
                  {activityError}
                </p>
              </div>
            </div>
          ) : recentHomework.length === 0 ? (
            <div className="flex flex-col items-center px-5 py-10 text-center">
              <BookOpenCheck
                size={26}
                className="mb-3 text-[#9CA3AF]"
              />

              <p className="text-sm font-semibold text-[#0B3A67]">
                No homework yet
              </p>

              <p className="mt-1 text-xs text-[#64748B]">
                Assignments you create will appear here.
              </p>
            </div>
          ) : (
            recentHomework.map((homework) => {
              const assigned = formatShortDate(homework.assigned_date);

              return (
                <Link
                  key={homework.id}
                  href={
                    selectedClassId
                      ? `/teacher/homework?class_id=${selectedClassId}`
                      : "/teacher/homework"
                  }
                  className="flex items-start gap-4 p-5 transition hover:bg-[#FAFCFF]"
                >
                  <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-[#EAF3FF] text-[#0075FF]">
                    <span className="text-sm font-bold leading-none">
                      {assigned?.day ?? homework.assigned_date?.slice(-2)}
                    </span>

                    <span className="mt-0.5 text-[9px] uppercase">
                      {assigned?.month ?? "—"}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="truncate text-sm font-semibold text-[#0B3A67]">
                      {homework.title}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-[#64748B]">
                      {homework.description}
                    </p>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#94A3B8]">
                      {homework.subject && (
                        <span>{homework.subject}</span>
                      )}

                      {homework.due_date && (
                        <span className="inline-flex items-center gap-1">
                          <Clock3 size={12} />

                          Due {formatShortDate(homework.due_date)?.full}
                        </span>
                      )}
                    </div>

                  </div>
                </Link>
              );
            })
          )}

        </div>
      </section>
    </>
  );
}
