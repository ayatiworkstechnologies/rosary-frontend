import AuthGuard from "@/components/auth/AuthGuard";

export default function TeacherLayout({
  children,
}) {
  return (
    <AuthGuard allowedRole="TEACHER">
      {children}
    </AuthGuard>
  );
}