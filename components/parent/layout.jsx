import AuthGuard from "@/components/auth/AuthGuard";

export default function ParentLayout({
  children,
}) {
  return (
    <AuthGuard allowedRole="PARENT">
      {children}
    </AuthGuard>
  );
}