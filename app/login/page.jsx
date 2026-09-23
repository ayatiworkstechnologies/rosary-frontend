"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { loginUser } from "@/services/authService";

import {
  User,
  LockKeyhole,
  Eye,
  EyeOff,
  GraduationCap,
  Users,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";


// =========================================================
// ROLE DETAILS
// =========================================================

const ROLE_DETAILS = {
  parent: {
    label: "Parents",
    usernameLabel: "User ID / Admission Number",
    usernamePlaceholder: "Enter User ID / Admission No.",
    emptyMessage: "Please enter User ID / Admission Number.",
  },

  teacher: {
    label: "Teachers",
    usernameLabel: "Teacher ID / Email",
    usernamePlaceholder: "Enter Teacher ID / Email",
    emptyMessage: "Please enter Teacher ID / Email.",
  },

  admin: {
    label: "Admin",
    usernameLabel: "Admin Username",
    usernamePlaceholder: "Enter Admin Username",
    emptyMessage: "Please enter Admin Username.",
  },
};


export default function LoginPage() {
  const router = useRouter();

  const [role, setRole] =
    useState("parent");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [form, setForm] =
    useState({
      username: "",
      password: "",
      remember: true,
    });


  // =========================================================
  // CURRENT ROLE DETAILS
  // =========================================================

  const currentRole =
    ROLE_DETAILS[role];


  // =========================================================
  // INPUT CHANGE
  // =========================================================

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
      checked,
      type,
    } = event.target;

    setForm((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    if (error) {
      setError("");
    }
  };


  // =========================================================
  // CHANGE ROLE
  // =========================================================

  const handleRoleChange = (
    selectedRole
  ) => {
    setRole(selectedRole);

    setError("");

    setShowPassword(false);

    setForm((previous) => ({
      ...previous,

      username: "",
      password: "",
    }));
  };


  // =========================================================
  // LOGIN
  // =========================================================

  const handleLogin = async (
    event
  ) => {
    event.preventDefault();

    // ---------------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------------

    if (!form.username.trim()) {
      setError(
        currentRole.emptyMessage
      );

      return;
    }

    if (!form.password.trim()) {
      setError(
        "Please enter your password."
      );

      return;
    }

    try {
      setLoading(true);
      setError("");

      // -------------------------------------------------------
      // REQUEST PAYLOAD
      // -------------------------------------------------------

      const payload = {
        username:
          form.username.trim(),

        password:
          form.password,

        role:
          role.toUpperCase(),
      };

      console.log(
        "Login payload:",
        {
          username:
            payload.username,

          role:
            payload.role,
        }
      );

      // -------------------------------------------------------
      // LOGIN API
      // -------------------------------------------------------

      const response =
        await loginUser(
          payload
        );

      console.log(
        "Login response:",
        response
      );

      if (
        !response?.access_token
      ) {
        throw new Error(
          "Access token not received."
        );
      }

      if (!response?.user) {
        throw new Error(
          "User information not received."
        );
      }


      // ======================================================
      // CHECK SELECTED ROLE
      // ======================================================

      const userRole =
        response.user.role
          ?.toUpperCase();

      const selectedRole =
        role.toUpperCase();

      if (
        userRole !==
        selectedRole
      ) {
        setError(
          `This account is not registered as a ${role}.`
        );

        return;
      }


      // ======================================================
      // STORE LOGIN DATA
      // ======================================================

      if (form.remember) {

        // -----------------------------------------------------
        // LOCAL STORAGE
        // -----------------------------------------------------

        localStorage.setItem(
          "access_token",
          response.access_token
        );

        localStorage.setItem(
          "current_user",
          JSON.stringify(
            response.user
          )
        );

        localStorage.setItem(
          "user_role",
          userRole
        );


        // Remove session login
        sessionStorage.removeItem(
          "access_token"
        );

        sessionStorage.removeItem(
          "current_user"
        );

        sessionStorage.removeItem(
          "user_role"
        );

      } else {

        // -----------------------------------------------------
        // SESSION STORAGE
        // -----------------------------------------------------

        sessionStorage.setItem(
          "access_token",
          response.access_token
        );

        sessionStorage.setItem(
          "current_user",
          JSON.stringify(
            response.user
          )
        );

        sessionStorage.setItem(
          "user_role",
          userRole
        );


        // Remove persistent login
        localStorage.removeItem(
          "access_token"
        );

        localStorage.removeItem(
          "current_user"
        );

        localStorage.removeItem(
          "user_role"
        );
      }


      // ======================================================
      // REDIRECT BASED ON ROLE
      // ======================================================

      if (
        userRole === "ADMIN"
      ) {
        router.replace(
          "/admin/dashboard"
        );

        return;
      }


      if (
        userRole === "PARENT"
      ) {
        router.replace(
          "/parent/dashboard"
        );

        return;
      }


      if (
        userRole === "TEACHER"
      ) {
        router.replace(
          "/teacher/dashboard"
        );

        return;
      }


      setError(
        "Your account role is not supported."
      );

    } catch (err) {
      console.error(
        "Login error:",
        err
      );

      const apiError =
        err?.response?.data
          ?.detail ||
        err?.response?.data
          ?.message ||
        err?.message ||
        "Unable to login. Please try again.";

      setError(apiError);

    } finally {
      setLoading(false);
    }
  };


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <main className="min-h-screen bg-[#F5F9FF] lg:grid lg:grid-cols-2">


      {/* =====================================================
          LEFT SIDE
      ====================================================== */}

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-5 py-10 sm:px-8">


        {/* DECORATION */}

        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#0075FF]/5" />

        <div className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-[#0075FF]/10" />


        <div className="relative z-10 w-full max-w-[480px]">


          {/* =================================================
              LOGO
          ================================================== */}

          <div className="mb-8 text-center">

            <Image
              src="/logo/rosary-logo.png"
              alt="Rosary School"
              width={1500}
              height={500}
              priority
              className="mx-auto mb-4 h-24 w-auto object-contain"
            />


            <h1 className="text-2xl font-bold text-[#0F3B78]">
              ROSARY
            </h1>


            <p className="text-sm font-semibold tracking-wide text-[#0075FF]">

              MATRICULATION HR SEC SCHOOL

            </p>

          </div>


          {/* =================================================
              LOGIN CARD
          ================================================== */}

          <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.10)] sm:p-8">


            <div className="mb-7 text-center">

              <h2 className="text-2xl font-bold text-slate-900">

                Login to Your Portal

              </h2>


              <p className="mt-2 text-sm text-slate-500">

                Access your Rosary School portal

              </p>

            </div>


            {/* =================================================
                ROLE SELECTION
            ================================================== */}

            <div className="mb-7 grid grid-cols-3 gap-2 sm:gap-3">


              {/* PARENT */}

              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  handleRoleChange(
                    "parent"
                  )
                }
                className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-semibold transition duration-200 sm:gap-2 sm:px-4 sm:text-sm ${
                  role === "parent"
                    ? "border-[#0075FF] bg-[#EAF4FF] text-[#0075FF] shadow-sm"
                    : "border-slate-200 bg-white text-slate-500 hover:border-[#0075FF]/40 hover:bg-[#F8FBFF]"
                }`}
              >

                <Users
                  size={18}
                />

                Parents

              </button>


              {/* TEACHER */}

              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  handleRoleChange(
                    "teacher"
                  )
                }
                className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-semibold transition duration-200 sm:gap-2 sm:px-4 sm:text-sm ${
                  role === "teacher"
                    ? "border-[#0075FF] bg-[#EAF4FF] text-[#0075FF] shadow-sm"
                    : "border-slate-200 bg-white text-slate-500 hover:border-[#0075FF]/40 hover:bg-[#F8FBFF]"
                }`}
              >

                <GraduationCap
                  size={18}
                />

                Teachers

              </button>


              {/* ADMIN */}

              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  handleRoleChange(
                    "admin"
                  )
                }
                className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-semibold transition duration-200 sm:gap-2 sm:px-4 sm:text-sm ${
                  role === "admin"
                    ? "border-[#0075FF] bg-[#EAF4FF] text-[#0075FF] shadow-sm"
                    : "border-slate-200 bg-white text-slate-500 hover:border-[#0075FF]/40 hover:bg-[#F8FBFF]"
                }`}
              >

                <ShieldCheck
                  size={18}
                />

                Admin

              </button>

            </div>


            {/* =================================================
                LOGIN FORM
            ================================================== */}

            <form
              onSubmit={
                handleLogin
              }
            >


              {/* =================================================
                  USERNAME
              ================================================== */}

              <div className="mb-4">

                <label className="mb-2 block text-sm font-medium text-slate-700">

                  {
                    currentRole.usernameLabel
                  }

                </label>


                <div className="flex items-center rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-[#0075FF] focus-within:ring-4 focus-within:ring-[#0075FF]/10">

                  {role === "admin" ? (

                    <ShieldCheck
                      size={19}
                      className="shrink-0 text-slate-400"
                    />

                  ) : (

                    <User
                      size={19}
                      className="shrink-0 text-slate-400"
                    />

                  )}


                  <input
                    type="text"
                    name="username"
                    value={
                      form.username
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      loading
                    }
                    autoComplete="username"
                    placeholder={
                      currentRole.usernamePlaceholder
                    }
                    className="w-full bg-transparent px-3 py-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-70"
                  />

                </div>

              </div>


              {/* =================================================
                  PASSWORD
              ================================================== */}

              <div className="mb-4">

                <label className="mb-2 block text-sm font-medium text-slate-700">

                  Password

                </label>


                <div className="flex items-center rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-[#0075FF] focus-within:ring-4 focus-within:ring-[#0075FF]/10">


                  <LockKeyhole
                    size={19}
                    className="shrink-0 text-slate-400"
                  />


                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={
                      form.password
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      loading
                    }
                    autoComplete="current-password"
                    placeholder="Enter password"
                    className="w-full bg-transparent px-3 py-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-70"
                  />


                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      setShowPassword(
                        (previous) =>
                          !previous
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="text-slate-400 transition hover:text-[#0075FF]"
                  >

                    {showPassword ? (

                      <EyeOff
                        size={19}
                      />

                    ) : (

                      <Eye
                        size={19}
                      />

                    )}

                  </button>

                </div>

              </div>


              {/* =================================================
                  REMEMBER + FORGOT
              ================================================== */}

              <div className="mb-6 flex items-center justify-between gap-3">


                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">

                  <input
                    type="checkbox"
                    name="remember"
                    checked={
                      form.remember
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      loading
                    }
                    className="h-4 w-4 accent-[#0075FF]"
                  />

                  Remember Me

                </label>


                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    router.push(
                      "/forgot-password"
                    )
                  }
                  className="text-sm font-semibold text-[#0075FF] transition hover:text-[#005FCC]"
                >

                  Forgot Password?

                </button>

              </div>


              {/* =================================================
                  ERROR
              ================================================== */}

              {error && (

                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">


                  <AlertCircle
                    size={19}
                    className="mt-0.5 shrink-0 text-red-500"
                  />


                  <p className="text-sm leading-5 text-red-600">

                    {error}

                  </p>

                </div>

              )}


              {/* =================================================
                  LOGIN BUTTON
              ================================================== */}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0075FF] px-5 py-4 text-sm font-bold text-white shadow-lg shadow-[#0075FF]/20 transition duration-300 hover:bg-[#005FCC] disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading ? (

                  <>

                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    LOGGING IN...

                  </>

                ) : (

                  role === "admin"
                    ? "LOGIN AS ADMIN"
                    : "LOGIN"

                )}

              </button>

            </form>


            {/* =================================================
                FIRST TIME USER
            ================================================== */}

            {role !== "admin" && (

              <div className="mt-6 text-center">

                <p className="text-sm text-slate-500">

                  First Time User?{" "}

                  <button
                    type="button"
                    className="font-semibold text-[#0075FF] transition hover:text-[#005FCC]"
                  >

                    Click Here

                  </button>

                </p>

              </div>

            )}

          </div>


          {/* FOOTER */}

          <p className="mt-8 text-center text-sm italic text-slate-400">

            “Nurturing Values, Building Brighter Futures”

          </p>

        </div>

      </section>


      {/* =====================================================
          RIGHT SIDE
      ====================================================== */}

      <section className="relative hidden overflow-hidden bg-[#0075FF] lg:block">


        <div className="absolute inset-0 bg-gradient-to-br from-[#0075FF] via-[#0069E6] to-[#004FAF]" />


        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full border border-white/10" />


        <div className="absolute -bottom-20 -left-20 h-[420px] w-[420px] rounded-full border border-white/10" />


        <div className="relative z-10 flex h-full items-center px-12 xl:px-16">


          <div className="max-w-2xl text-white">


            <div className="mb-6 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur-sm">

              Rosary School Portal

            </div>


            <h2 className="text-4xl font-bold leading-tight xl:text-5xl">

              Learning Today

              <br />

              for a Better Tomorrow

            </h2>


            <p className="mt-6 max-w-lg text-lg leading-8 text-white/80">

              Stay connected with academic progress,
              attendance, homework, results, circulars,
              schedules and school administration.

            </p>


            {/* =================================================
                PORTAL CARDS
            ================================================== */}

            <div className="mt-10 grid grid-cols-3 gap-3 xl:gap-4">


              {/* PARENT */}

              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm xl:p-5">


                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">

                  <Users
                    size={20}
                  />

                </div>


                <p className="font-semibold">

                  Parent Portal

                </p>


                <p className="mt-2 text-xs leading-5 text-white/70 xl:text-sm xl:leading-6">

                  Monitor your child&apos;s
                  academic journey.

                </p>

              </div>


              {/* TEACHER */}

              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm xl:p-5">


                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">

                  <GraduationCap
                    size={20}
                  />

                </div>


                <p className="font-semibold">

                  Teacher Portal

                </p>


                <p className="mt-2 text-xs leading-5 text-white/70 xl:text-sm xl:leading-6">

                  Manage academic activities
                  and students.

                </p>

              </div>


              {/* ADMIN */}

              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm xl:p-5">


                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">

                  <ShieldCheck
                    size={20}
                  />

                </div>


                <p className="font-semibold">

                  Admin Portal

                </p>


                <p className="mt-2 text-xs leading-5 text-white/70 xl:text-sm xl:leading-6">

                  Manage school portal
                  operations.

                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}