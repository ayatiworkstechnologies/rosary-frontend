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
      <AdminShell>
        <div className="flex min-h-[400px] items-center justify-center">
          <RefreshCw
            size={28}
            className="animate-spin text-[#0075FF]"
          />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>

      <Link
        href="/admin/students"
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#0075FF]"
      >
        <ArrowLeft size={17} />

        Back to Students
      </Link>

      <h1 className="text-2xl font-bold text-gray-900">
        Edit Student
      </h1>

      <section className="mt-6 max-w-3xl">

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >

          {error && (
            <div className="flex gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-600">
              <AlertCircle
                size={18}
              />

              {error}
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">

            <input
              name="admission_no"
              value={
                form.admission_no
              }
              onChange={
                handleChange
              }
              placeholder="Admission No"
              className="h-12 rounded-xl border px-4"
            />

            <input
              name="roll_no"
              value={
                form.roll_no
              }
              onChange={
                handleChange
              }
              placeholder="Roll No"
              className="h-12 rounded-xl border px-4"
            />

          </div>

          <input
            name="full_name"
            value={
              form.full_name
            }
            onChange={
              handleChange
            }
            placeholder="Full Name"
            className="h-12 w-full rounded-xl border px-4"
          />

          <div className="grid gap-5 md:grid-cols-2">

            <select
              name="gender"
              value={form.gender}
              onChange={
                handleChange
              }
              className="h-12 rounded-xl border bg-white px-4"
            >
              <option value="">
                Select Gender
              </option>

              <option value="Male">
                Male
              </option>

              <option value="Female">
                Female
              </option>

              <option value="Other">
                Other
              </option>
            </select>

            <select
              name="class_id"
              value={
                form.class_id
              }
              onChange={
                handleChange
              }
              className="h-12 rounded-xl border bg-white px-4"
            >
              <option value="">
                Select Class
              </option>

              {classes.map(
                (item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name} -{" "}
                    {item.section} (
                    {
                      item.academic_year
                    }
                    )
                  </option>
                )
              )}
            </select>

          </div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="is_active"
              checked={
                form.is_active
              }
              onChange={
                handleChange
              }
              className="h-5 w-5 accent-[#0075FF]"
            />

            Active Student
          </label>

          <div className="flex justify-end gap-3">

            <Link
              href="/admin/students"
              className="rounded-xl border px-5 py-3 text-sm font-semibold"
            >
              Cancel
            </Link>

            <button
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0075FF] px-5 py-3 text-sm font-semibold text-white"
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