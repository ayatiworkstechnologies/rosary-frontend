"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import AppShell from "@/components/ui/AppShell";
import useStoredUser from "@/hooks/useStoredUser";
import {
  LayoutDashboard,
  School,
  GraduationCap,
  Users,
  UserRound,
  WalletCards,
  ClipboardList,
  CalendarDays,
  Megaphone,
  UserCog,
  Bell,
  FolderDown,
  BarChart3,
} from "lucide-react";

const adminNav = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Classes", href: "/admin/classes", icon: School },
  { label: "Students", href: "/admin/students", icon: GraduationCap },
  { label: "Teachers", href: "/admin/teachers", icon: Users },
  { label: "Parent Linking", href: "/admin/parent-linking", icon: UserRound },
  { label: "Fees", href: "/admin/fees", icon: WalletCards },
  { label: "Exams", href: "/admin/exams", icon: ClipboardList },
  { label: "Exam Schedule", href: "/admin/exam-schedules", icon: CalendarDays },
  { label: "Results", href: "/admin/results", icon: BarChart3 },
  { label: "Circulars", href: "/admin/circulars", icon: Megaphone },
  { label: "School Calendar", href: "/admin/calendar", icon: CalendarDays },
  { label: "Users", href: "/admin/users", icon: UserCog },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "Download Forms", href: "/admin/downloads", icon: FolderDown },
];

export default function AdminLayout({ children }) {
  const user = useStoredUser();

  return (
    <AuthGuard allowedRole="ADMIN">
      <AppShell portal="admin" navItems={adminNav} user={user}>
        {children}
      </AppShell>
    </AuthGuard>
  );
}