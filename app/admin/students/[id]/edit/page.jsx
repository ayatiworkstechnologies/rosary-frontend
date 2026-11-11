"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import Link from "next/link";


import {
  getAdminStudent,
  updateAdminStudent,
} from "@/services/adminStudentService";

import {
  getAdminClasses,
} from "@/services/adminClassService";

import {
  ArrowLeft,
  Save,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export default function EditAdminStudentPage() {
  const params = useParams();
  const router = useRouter();

  const studentId = params.id;

  const [classes, setClasses] =
    useState([]);

  const [form, setForm] =
    useState({
      admission_no: "",
      roll_no: "",
      full_name: "",
      date_of_birth: "",
      parent_email: "",
      gender: "",
      class_id: "",
      is_active: true,
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [
          studentResponse,
          classResponse,
        ] = await Promise.all([
          getAdminStudent(
            studentId
          ),

          getAdminClasses(),
        ]);

        const student =
          studentResponse?.data;

        setForm({
          admission_no:
            student?.admission_no ||
            "",

          roll_no:
            student?.roll_no || "",

          full_name:
            student?.full_name || "",

          date_of_birth:
            student?.date_of_birth ||
            "",

          parent_email:
            student?.parent_email ||
            "",

          gender:
            student?.gender || "",

          class_id:
            student?.class_id
              ? String(
                  student.class_id
                )
              : "",

          is_active:
            student?.is_active ??
            true,
        });

        setClasses(
          Array.isArray(
            classResponse?.data
          )
            ? classResponse.data
            : []
        );
      } catch (error) {
        setError(
          error?.message ||
            "Unable to load student."
        );
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      loadData();
    }
  }, [studentId]);

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((current) => ({
      ...current,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      await updateAdminStudent(
        studentId,
        {
          admission_no:
            form.admission_no.trim(),

          roll_no:
            form.roll_no.trim() ||
            null,

          full_name:
            form.full_name.trim(),

          date_of_birth:
            form.date_of_birth ||
            null,

          parent_email:
            form.parent_email.trim() ||
            null,

          gender:
            form.gender || null,

          class_id:
            form.class_id
              ? Number(
                  form.class_id
                )
              : null,

          is_active:
            form.is_active,
        }
      );

      router.push(
        "/admin/students"
      );

      router.refresh();
    } catch (error) {
      setError(
        error?.message ||
          "Unable to update student."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
        <div className="flex min-h-[400px] items-center justify-center">
          <RefreshCw
            size={28}
            className="animate-spin text-[#0075FF]"
          />
        </div>
    );
  }

  return (
    <>
      <section className="mb-6">
        <Link
          href="/admin/students"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#0075FF]"
        >
          <ArrowLeft size={17} />
          Back to Students
        </Link>

        <h1 className="text-2xl font-bold text-[#0B3A67] md:text-3xl">
          Edit Student
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Update student information and
          parent contact details.
        </p>
      </section>

      <section className="max-w-3xl">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />
              <span>{error}</span>
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="admission_no" className="mb-2 block text-sm font-semibold text-slate-700">
                Admission Number *
              </label>
              <input
                id="admission_no"
                name="admission_no"
                value={form.admission_no}
                onChange={handleChange}
                maxLength={50}
                required
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#0075FF]"
              />
            </div>

            <div>
              <label htmlFor="roll_no" className="mb-2 block text-sm font-semibold text-slate-700">
                Roll Number
              </label>
              <input
                id="roll_no"
                name="roll_no"
                value={form.roll_no}
                onChange={handleChange}
                maxLength={20}
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#0075FF]"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="full_name" className="mb-2 block text-sm font-semibold text-slate-700">
                Full Name *
              </label>
              <input
                id="full_name"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                maxLength={150}
                required
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#0075FF]"
              />
            </div>

            <div>
              <label htmlFor="date_of_birth" className="mb-2 block text-sm font-semibold text-slate-700">
                Date of Birth *
              </label>
              <input
                id="date_of_birth"
                type="date"
                name="date_of_birth"
                value={form.date_of_birth}
                onChange={handleChange}
                max={new Date().toISOString().split("T")[0]}
                required
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#0075FF]"
              />
              <p className="mt-2 text-xs text-slate-500">
                Used for parent login in DDMMYYYY format.
              </p>
            </div>

            <div>
              <label htmlFor="gender" className="mb-2 block text-sm font-semibold text-slate-700">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[#0075FF]"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="parent_email" className="mb-2 block text-sm font-semibold text-slate-700">
                Parent Email Address
              </label>
              <input
                id="parent_email"
                type="email"
                name="parent_email"
                value={form.parent_email}
                onChange={handleChange}
                placeholder="parent@example.com"
                autoComplete="email"
                maxLength={150}
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#0075FF]"
              />
              <p className="mt-2 text-xs text-slate-500">
                Verification and opt-in are required for email notifications.
              </p>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="class_id" className="mb-2 block text-sm font-semibold text-slate-700">
                Class
              </label>
              <select
                id="class_id"
                name="class_id"
                value={form.class_id}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[#0075FF]"
              >
                <option value="">Select class</option>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} - {item.section} ({item.academic_year})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="mt-5 flex items-center gap-3 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
              className="h-5 w-5 accent-[#0075FF]"
            />
            Active Student
          </label>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Link
              href="/admin/students"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0075FF] px-5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? (
                <RefreshCw
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Save size={17} />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>

    </>
  );
}
