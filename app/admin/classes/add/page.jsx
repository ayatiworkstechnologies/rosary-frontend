"use client";

import { useState } from "react";
import {
  useRouter,
} from "next/navigation";
import Link from "next/link";

import AdminShell from "@/components/admin/AdminShell";

import {
  createAdminClass,
} from "@/services/adminClassService";

import {
  ArrowLeft,
  School,
  Save,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function AddAdminClassPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    section: "",
    academic_year: "2026-2027",
    is_active: true,
  });

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError(
        "Class name is required."
      );

      return;
    }

    if (!form.section.trim()) {
      setError(
        "Section is required."
      );

      return;
    }

    if (!form.academic_year.trim()) {
      setError(
        "Academic year is required."
      );

      return;
    }

    try {
      setSaving(true);

      await createAdminClass({
        name: form.name.trim(),
        section:
          form.section.trim(),
        academic_year:
          form.academic_year.trim(),
        is_active:
          form.is_active,
      });

      setSuccess(
        "Class created successfully."
      );

      setTimeout(() => {
        router.push(
          "/admin/classes"
        );

        router.refresh();
      }, 700);
    } catch (error) {
      console.error(
        "Create class error:",
        error
      );

      setError(
        error?.message ||
          "Unable to create class."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell>
      {/* Header */}
      <section className="mb-6">
        <Link
          href="/admin/classes"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#0075FF]"
        >
          <ArrowLeft size={17} />

          Back to Classes
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
          Add Class
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Create a new school class
          and section.
        </p>
      </section>

      <section className="max-w-3xl">
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
        >
          {/* Form Header */}
          <div className="flex items-center gap-3 border-b border-gray-100 p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0075FF]">
              <School size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">
                Class Information
              </h2>

              <p className="text-sm text-gray-500">
                Enter the class details
                below.
              </p>
            </div>
          </div>

          <div className="space-y-5 p-6">
            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-red-500"
                />

                <p className="text-sm text-red-600">
                  {error}
                </p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0 text-green-600"
                />

                <p className="text-sm text-green-700">
                  {success}
                </p>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Class Name
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                maxLength={50}
                placeholder="Example: 10"
                className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#0075FF]"
              />
            </div>

            {/* Section */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Section
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <input
                type="text"
                name="section"
                value={form.section}
                onChange={handleChange}
                maxLength={20}
                placeholder="Example: A"
                className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#0075FF]"
              />
            </div>

            {/* Academic year */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Academic Year
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <input
                type="text"
                name="academic_year"
                value={
                  form.academic_year
                }
                onChange={handleChange}
                maxLength={20}
                placeholder="2026-2027"
                className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#0075FF]"
              />
            </div>

            {/* Active */}
            <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Active Class
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Active classes can be
                  assigned to students and
                  teachers.
                </p>
              </div>

              <input
                type="checkbox"
                name="is_active"
                checked={
                  form.is_active
                }
                onChange={handleChange}
                className="h-5 w-5 accent-[#0075FF]"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 p-5 sm:flex-row sm:justify-end">
            <Link
              href="/admin/classes"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0075FF] px-5 text-sm font-semibold text-white transition hover:bg-[#0067DF] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />

              {saving
                ? "Creating..."
                : "Create Class"}
            </button>
          </div>
        </form>
      </section>
    </AdminShell>
  );
}