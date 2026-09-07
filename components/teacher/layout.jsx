"use client";

import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  NotebookPen,
  GraduationCap,
  CalendarDays,
  Megaphone,
  UserCircle,
  Home,
} from "lucide-react";

import AuthGuard from "@/components/auth/AuthGuard";
import PortalShell from "@/components/common/PortalShell";
import MobileBottomNav from "@/components/common/MobileBottomNav";

const teacherNavigation = [
  {
    label: "Dashboard",
    href: "/teacher/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Students",
    href: "/teacher/students",
    icon: Users,
  },
  {
    label: "Attendance",
    href: "/teacher/attendance",
    icon: CalendarCheck,
  },
  {
    label: "Homework",
    href: "/teacher/homework",
    icon: NotebookPen,
  },
  {
    label: "Academic Results",
    href: "/teacher/results",
    icon: GraduationCap,
  },
  {
    label: "Exam Schedule",
    href: "/teacher/exam-schedule",
    icon: CalendarDays,
  },
  {
    label: "Circulars",
    href: "/teacher/circulars",
    icon: Megaphone,
  },
  {
    label: "School Calendar",
    href: "/teacher/calendar",
    icon: CalendarDays,
  },
  {
    label: "Profile",
    href: "/teacher/profile",
    icon: UserCircle,
  },
];

const teacherBottomNavigation = [
  {
    label: "Home",
    href: "/teacher/dashboard",
    icon: Home,
  },
  {
    label: "Students",
    href: "/teacher/students",
    icon: Users,
  },
  {
    label: "Attendance",
    href: "/teacher/attendance",
    icon: CalendarCheck,
  },
  {
    label: "Profile",
    href: "/teacher/profile",
    icon: UserCircle,
  },
];

export default function TeacherLayout({
  children,
}) {
  return (
    <AuthGuard allowedRole="TEACHER">
      <PortalShell
        portalName="Teacher Portal"
        navItems={teacherNavigation}
      >
        {children}
      </PortalShell>

      <MobileBottomNav
        items={teacherBottomNavigation}
      />
    </AuthGuard>
  );
}