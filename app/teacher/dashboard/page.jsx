"use client";

import { useState } from "react";

import {
  Users,
  CalendarCheck,
  NotebookPen,
  GraduationCap,
  CalendarDays,
  Megaphone,
  ChevronDown,
  Clock3,
} from "lucide-react";

import DashboardCard from "@/components/common/DashboardCard";
import QuickCard from "@/components/common/QuickCard";
import useStoredUser from "@/hooks/useStoredUser";

export default function TeacherDashboard() {
  const user = useStoredUser();

  const [selectedClass, setSelectedClass] =
    useState("VIII - A");

  return (
    <div className="mx-auto max-w-[1200px]">

      {/* =====================================
          WELCOME
      ====================================== */}
      <section
        className="
          relative
          overflow-hidden
          rounded-2xl
          border
          border-[#E4EDF7]
          bg-white
          px-5
          py-5
          sm:px-6
        "
      >
        <div className="relative z-10 max-w-lg">

          <p className="text-lg font-bold text-[#0B3A67]">
            Welcome Back,
          </p>

          <h1 className="text-2xl font-bold text-[#0B3A67] sm:text-3xl">
            {user?.name || "Teacher"}! 👋
          </h1>

          <p className="mt-2 text-xs text-slate-500 sm:text-sm">
            Inspire • Educate • Empower
          </p>

        </div>

        {/* Desktop decorative area */}
        <div
          className="
            absolute
            right-0
            top-0
            hidden
            h-full
            w-[42%]
            bg-gradient-to-l
            from-[#EAF4FF]
            to-transparent
            md:block
          "
        />

        <div
          className="
            absolute
            right-8
            top-1/2
            hidden
            -translate-y-1/2
            rounded-2xl
            bg-[#EAF4FF]
            px-5
            py-3
            text-right
            md:block
          "
        >
          <p className="text-xs font-semibold text-[#0075FF]">
            Good Teachers
          </p>

          <p className="mt-1 text-xs text-[#0B3A67]">
            Create Great Futures
          </p>
        </div>

      </section>

      {/* =====================================
          SELECT CLASS
      ====================================== */}
      <section
        className="
          mt-3
          rounded-2xl
          border
          border-[#E4EDF7]
          bg-white
          p-4
          shadow-sm
        "
      >
        <div className="flex items-center gap-3">

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
            <Users size={21} />
          </div>

          <div className="min-w-0 flex-1">

            <label
              htmlFor="teacher-class"
              className="mb-1 block text-xs font-semibold text-[#0B3A67]"
            >
              Select Class
            </label>

            <div className="relative">

              <select
                id="teacher-class"
                value={selectedClass}
                onChange={(event) =>
                  setSelectedClass(event.target.value)
                }
                className="
                  w-full
                  appearance-none
                  rounded-lg
                  border
                  border-[#DCE8F5]
                  bg-white
                  px-3
                  py-2.5
                  pr-10
                  text-sm
                  font-medium
                  text-slate-700
                  outline-none
                  transition
                  focus:border-[#0075FF]
                  focus:ring-2
                  focus:ring-[#0075FF]/10
                "
              >
                <option>VIII - A</option>
                <option>VIII - B</option>
                <option>IX - A</option>
                <option>IX - B</option>
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

          </div>

        </div>
      </section>

      {/* =====================================
          MAIN CARDS
      ====================================== */}
      <section className="mt-3">

        <div
          className="
            grid
            grid-cols-1
            gap-3
            sm:grid-cols-2
          "
        >
          <DashboardCard
            title="Students"
            value="38"
            description="Total students"
            icon={Users}
            href="/teacher/students"
            iconClass="bg-[#EAF4FF] text-[#0075FF]"
          />

          <DashboardCard
            title="Attendance"
            value="Mark Attendance"
            description="Check daily attendance"
            icon={CalendarCheck}
            href="/teacher/attendance"
            iconClass="bg-green-100 text-green-600"
            valueClass="text-[#0B3A67]"
          />

          <DashboardCard
            title="Homework"
            value="Add Homework"
            description="Share assignments"
            icon={NotebookPen}
            href="/teacher/homework"
            iconClass="bg-orange-100 text-orange-500"
            valueClass="text-[#0B3A67]"
          />

          <DashboardCard
            title="Academic Results"
            value="Update Results"
            description="Enter student marks"
            icon={GraduationCap}
            href="/teacher/results"
            iconClass="bg-purple-100 text-purple-500"
            valueClass="text-[#0B3A67]"
          />
        </div>

      </section>

      {/* =====================================
          QUICK ACTIONS
      ====================================== */}
      <section className="mt-3">

        <div
          className="
            grid
            grid-cols-2
            gap-3
            sm:grid-cols-3
          "
        >
          <QuickCard
            title="Exam Schedule"
            icon={CalendarDays}
            href="/teacher/exam-schedule"
            className="bg-blue-100 text-blue-500"
          />

          <QuickCard
            title="Digital Circulars"
            icon={Megaphone}
            href="/teacher/circulars"
            className="bg-rose-100 text-rose-500"
          />

          <QuickCard
            title="School Calendar"
            icon={CalendarDays}
            href="/teacher/calendar"
            className="bg-teal-100 text-teal-600"
          />
        </div>

      </section>

      {/* =====================================
          RECENT ACTIVITIES
      ====================================== */}
      <section
        className="
          mt-3
          rounded-2xl
          border
          border-[#E4EDF7]
          bg-white
          p-4
          shadow-sm
        "
      >

        <div className="mb-3 flex items-center justify-between">

          <div>
            <h2 className="font-bold text-[#0B3A67]">
              Recent Activities
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Your latest classroom activity
            </p>
          </div>

          <button
            type="button"
            className="text-xs font-semibold text-[#0075FF]"
          >
            View All
          </button>

        </div>

        <ActivityItem
          date="01"
          month="Sep"
          title="Homework Added"
          description="Mathematics - Worksheet 5"
          time="10:30 AM"
        />

        <ActivityItem
          date="31"
          month="Aug"
          title="Attendance Marked"
          description="VIII - A (38 students)"
          time="09:15 AM"
        />

        <ActivityItem
          date="28"
          month="Aug"
          title="Results Updated"
          description="Unit Test 2 - Science"
          time="04:20 PM"
        />

      </section>

    </div>
  );
}


/* =========================================
   ACTIVITY ITEM
========================================= */

function ActivityItem({
  date,
  month,
  title,
  description,
  time,
}) {
  return (
    <div
      className="
        flex
        items-start
        gap-3
        border-t
        border-slate-100
        py-3
        first:border-0
      "
    >

      <div
        className="
          flex
          h-12
          w-12
          shrink-0
          flex-col
          items-center
          justify-center
          rounded-lg
          bg-[#EAF4FF]
          text-[#0075FF]
        "
      >
        <span className="text-sm font-bold">
          {date}
        </span>

        <span className="text-[9px]">
          {month}
        </span>
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-sm font-semibold text-[#0B3A67]">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {description}
        </p>

      </div>

      <div
        className="
          hidden
          shrink-0
          items-center
          gap-1
          text-[10px]
          text-slate-400
          sm:flex
        "
      >
        <Clock3 size={11} />

        {time}
      </div>

    </div>
  );
}
