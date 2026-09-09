"use client";

import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  NotebookPen,
  GraduationCap,
  CalendarDays,
  Megaphone,
  WalletCards,
  Download,
  Home,
  UserCircle,
} from "lucide-react";

import AuthGuard from "@/components/auth/AuthGuard";
import MobileBottomNav from "@/components/common/MobileBottomNav";
import PortalShell from "@/components/common/PortalShell";

const parentNavigation = [
  {
    label: "Dashboard",
    href: "/parent/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "My Children",
    href: "/parent/children",
    icon: Users,
  },
  {
    label: "Attendance",
    href: "/parent/attendance",
    icon: CalendarCheck,
  },
  {
    label: "Homework",
    href: "/parent/homework",
    icon: NotebookPen,
  },
  {
    label: "Academic Results",
    href: "/parent/results",
    icon: GraduationCap,
  },
  {
    label: "Exam Schedule",
    href: "/parent/exam-schedule",
    icon: CalendarDays,
  },
  {
    label: "Circulars",
    href: "/parent/circulars",
    icon: Megaphone,
  },
  {
    label: "Fee Information",
    href: "/parent/fees",
    icon: WalletCards,
  },
  {
    label: "School Calendar",
    href: "/parent/calendar",
    icon: CalendarDays,
  },
  {
    label: "Download Forms",
    href: "/parent/downloads",
    icon: Download,
  },
  {
    label: "Profile",
    href: "/parent/profile",
    icon: UserCircle,
  },
];

const parentBottomNavigation = [
  { label: "Home", href: "/parent/dashboard", icon: Home },
  { label: "My Child", href: "/parent/children", icon: Users },
  { label: "Attendance", href: "/parent/attendance", icon: CalendarCheck },
  { label: "Profile", href: "/parent/profile", icon: UserCircle },
];

export default function ParentLayout({
  children,
}) {
  return (
    <AuthGuard allowedRole="PARENT">

      <PortalShell
        portalName="Parent Portal"
        navItems={parentNavigation}
      >
        {children}
      </PortalShell>

      <MobileBottomNav items={parentBottomNavigation} />

    </AuthGuard>
  );
}
