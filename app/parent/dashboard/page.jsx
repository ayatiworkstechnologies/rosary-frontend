"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  CalendarDays,
  ChevronDown,
  Download,
  GraduationCap,
  Megaphone,
  NotebookPen,
  Quote,
  School,
  Users,
  WalletCards,
} from "lucide-react";

import DashboardCard from "@/components/common/DashboardCard";
import QuickCard from "@/components/common/QuickCard";
import useStoredUser from "@/hooks/useStoredUser";

const circulars = [
  {
    date: "01",
    month: "Sep",
    title: "Parent-Teacher Meeting",
    description: "PTM will be held on 5th September 2026.",
  },
  {
    date: "28",
    month: "Aug",
    title: "Quarterly Examination Timetable",
    description: "Timetable for Classes VI to XII is available.",
  },
  {
    date: "26",
    month: "Aug",
    title: "Holiday Announcement",
    description: "School will remain closed on 29th August.",
  },
];

export default function ParentDashboard() {
  const user = useStoredUser();
  const [selectedChild, setSelectedChild] = useState("Ashvik R");

  return (
    <div className="mx-auto max-w-[1200px]">
      <section className="relative overflow-hidden rounded-2xl border border-[#E4EDF7] bg-white px-5 py-5 sm:px-6">
        <div className="relative z-10 max-w-lg">
          <p className="text-lg font-bold text-[#0B3A67]">Welcome Back,</p>
          <h1 className="text-2xl font-bold text-[#0B3A67] sm:text-3xl">
            {user?.name || "Parent"}! <span aria-hidden="true">👋</span>
          </h1>
          <p className="mt-2 text-xs text-slate-500 sm:text-sm">
            Stay connected with your child’s progress
          </p>
        </div>

        <div className="absolute inset-y-0 right-0 hidden w-[42%] bg-gradient-to-l from-[#DDEEFF] to-transparent md:block" />
        <div className="absolute right-8 top-1/2 hidden -translate-y-1/2 items-center gap-3 text-right md:flex">
          <div>
            <p className="text-xs font-semibold text-[#0B3A67]">Learning Today</p>
            <p className="text-[11px] text-[#0075FF]">for a Better Tomorrow</p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/80 text-[#0075FF] shadow-sm">
            <School size={34} />
          </div>
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-[#E4EDF7] bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF4FF] text-[#0075FF]">
            <Users size={21} />
          </div>

          <div className="min-w-0 flex-1">
            <label htmlFor="parent-child" className="mb-1 block text-xs font-semibold text-[#0B3A67]">
              Select Child
            </label>
            <div className="relative">
              <select
                id="parent-child"
                value={selectedChild}
                onChange={(event) => setSelectedChild(event.target.value)}
                className="w-full appearance-none rounded-lg border border-[#DCE8F5] bg-white px-3 py-2.5 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-[#0075FF] focus:ring-2 focus:ring-[#0075FF]/10"
              >
                <option>Ashvik R</option>
                <option>John Peter</option>
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#0075FF]" />
            </div>
            <p className="mt-1 text-[10px] text-slate-400">Grade VIII - A</p>
          </div>
        </div>
      </section>

      <section className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DashboardCard
          title="Attendance"
          value="92%"
          description="Present this month"
          icon={CalendarCheck}
          href="/parent/attendance"
          iconClass="bg-green-100 text-green-600"
          valueClass="text-green-600"
        />
        <DashboardCard
          title="Academic Results"
          value="View Results"
          description="Check performance"
          icon={GraduationCap}
          href="/parent/results"
          iconClass="bg-blue-100 text-blue-500"
        />
        <DashboardCard
          title="Homework"
          value="5 Pending"
          description="View assignments"
          icon={NotebookPen}
          href="/parent/homework"
          iconClass="bg-orange-100 text-orange-500"
          valueClass="text-orange-500"
        />
        <DashboardCard
          title="Exam Schedule"
          value="View Exams"
          description="Upcoming exams"
          icon={CalendarDays}
          href="/parent/exam-schedule"
          iconClass="bg-purple-100 text-purple-500"
        />
      </section>

      <section className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <QuickCard title="Digital Circulars" icon={Megaphone} href="/parent/circulars" className="bg-rose-100 text-rose-500" />
        <QuickCard title="Fee Information" icon={WalletCards} href="/parent/fees" className="bg-teal-100 text-teal-600" />
        <QuickCard title="School Calendar" icon={CalendarDays} href="/parent/calendar" className="bg-amber-100 text-amber-500" />
        <QuickCard title="Download Forms" icon={Download} href="/parent/downloads" className="bg-blue-100 text-blue-500" />
      </section>

      <section className="mt-3 rounded-2xl border border-[#E4EDF7] bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-[#0B3A67]">Latest Circulars</h2>
          <Link href="/parent/circulars" className="text-xs font-semibold text-[#0075FF]">View All</Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_170px]">
          <div className="divide-y divide-slate-100">
            {circulars.map((circular) => (
              <Link key={circular.title} href="/parent/circulars" className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-[#EAF4FF] text-[#0075FF]">
                  <span className="text-sm font-bold">{circular.date}</span>
                  <span className="text-[9px]">{circular.month}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#0B3A67]">{circular.title}</p>
                  <p className="mt-1 truncate text-xs text-slate-400">{circular.description}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex min-h-36 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-[#F4F9FF] to-[#E2F0FF] p-4 text-center">
            <Quote size={24} className="text-[#0075FF]/50" />
            <p className="mt-3 text-sm font-semibold italic leading-5 text-[#0B3A67]">
              Together for a Brighter Future
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
