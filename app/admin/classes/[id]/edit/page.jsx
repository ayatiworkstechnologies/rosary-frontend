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

import AdminShell from "@/components/admin/AdminShell";

import {
  getAdminClass,
  updateAdminClass,
} from "@/services/adminClassService";

import {
  ArrowLeft,
  School,
  Save,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

export default function EditAdminClassPage() {
  const params = useParams();
  const router = useRouter();

  const classId = params.id;

  const [form, setForm] = useState({
    name: "",
    section: "",
    academic_year: "",
    is_active: true,
  });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    const loadClass = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getAdminClass(
            classId
          );

        const item =
          response?.data;

        if (!item) {
          throw new Error(
            "Class not found"
          );
        }

        setForm({
          name: item.name || "",
          section:
            item.section || "",
          academic_year:
            item.academic_year ||
            "",
          is_active:
            item.is_active ??
            true,
        });
      } catch (error) {
        console.error(
          "Load class error:",
          error
        );

        setError(
          error?.message ||
            "Unable to load class."
        );
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      loadClass();
    }
  }, [classId]);

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

      await updateAdminClass(
        classId,
        {
          name: form.name.trim(),
          section:
            form.section.trim(),
          academic_year:
            form.academic_year.trim(),
          is_active:
            form.is_active,
        }
      );

      setSuccess(
        "Class updated successfully."
      );

      setTimeout(() => {
        router.push(
          "/admin/classes"
        );

        router.refresh();
      }, 700);
    } catch (error) {
      console.error(
        "Update class error:",
        error
      );

      setError(
        error?.message ||
          "Unable to update class."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminShell>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <RefreshCw
              size={28}
              className="mx-auto animate-spin text-[#0075FF]"
            />

            <p className="mt-3 text-sm text-gray-500">
              Loading class...
            </p>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <section className="mb-6">
        <Link
          href="/admin/classes"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#0075FF]"
        >
          <ArrowLeft size={17} />

          Back to Classes
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
          Edit Class
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Update class and section
          information.
        </p>
      </section>

      <section className="max-w-3xl">
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
        >
          <div className="flex items-center gap-3 border-b border-gray-100 p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0075FF]">
              <School size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">
                Class Information
              </h2>

              <p className="text-sm text-gray-500">
                Editing class ID #
                {classId}
              </p>
            </div>
          </div>

          <div className="space-y-5 p-6">
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

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Class Name
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                maxLength={50}
                className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm text-gray-700 outline-none transition focus:border-[#0075FF]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Section
              </label>

              <input
                type="text"
                name="section"
                value={
                  form.section
                }
                onChange={handleChange}
                maxLength={20}
                className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm text-gray-700 outline-none transition focus:border-[#0075FF]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Academic Year
              </label>

              <input
                type="text"
                name="academic_year"
                value={
                  form.academic_year
                }
                onChange={handleChange}
                maxLength={20}
                className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm text-gray-700 outline-none transition focus:border-[#0075FF]"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Class Status
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Enable or disable this
                  class.
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
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0075FF] px-5 text-sm font-semibold text-white transition hover:bg-[#0067DF] disabled:opacity-60"
            >
              <Save size={17} />

              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </section>
    </AdminShell>
  );
}