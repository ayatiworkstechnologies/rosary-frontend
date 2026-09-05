"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import {
  getCurrentUser,
  logoutUser,
} from "@/services/authService";

export default function AuthGuard({
  children,
  allowedRole,
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token =
          localStorage.getItem("access_token") ||
          sessionStorage.getItem("access_token");

        // No token
        if (!token) {
          router.replace("/login");
          return;
        }

        // Check token with backend
        const user = await getCurrentUser();

        if (!user) {
          logoutUser();
          router.replace("/login");
          return;
        }

        const currentRole =
          user.role?.toUpperCase();

        // Role protection
        if (
          allowedRole &&
          currentRole !== allowedRole
        ) {
          if (currentRole === "PARENT") {
            router.replace(
              "/parent/dashboard"
            );
            return;
          }

          if (currentRole === "TEACHER") {
            router.replace(
              "/teacher/dashboard"
            );
            return;
          }

          logoutUser();
          router.replace("/login");
          return;
        }

        setAuthorized(true);

      } catch (error) {
        console.error(
          "Authentication error:",
          error
        );

        logoutUser();

        router.replace("/login");

      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, [allowedRole, router]);

  // Loading screen
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F9FF]">
        <div className="text-center">

          <Loader2
            size={38}
            className="mx-auto animate-spin text-[#0075FF]"
          />

          <p className="mt-4 text-sm text-slate-500">
            Checking your account...
          </p>

        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return children;
}