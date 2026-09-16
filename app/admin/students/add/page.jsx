"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import AdminShell from "@/components/admin/AdminShell";

import {
  createAdminStudent,
} from "@/services/adminStudentService";

import {
  getAdminClasses,
} from "@/services/adminClassService";

import {
  ArrowLeft,
  Save,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function AddAdminStudentPage() {
  const router = useRouter();

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

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    const loadClasses =
      async () => {
        try {
          const response =
            await getAdminClasses();

          setClasses(
            Array.isArray(
              response?.data
            )
              ? response.data.filter(
                  (item) =>
                    item.is_active
                )
              : []
          );
        } catch (error) {
          console.error(error);

          setError(
            "Unable to load classes."
          );
        }
      };

    loadClasses();
  }, []);

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

    setError("");
    setSuccess("");

    if (
      !form.admission_no.trim()
    ) {
      setError(
        "Admission number is required."
      );

      return;
    }

    if (!form.full_name.trim()) {
      setError(
        "Student name is required."
      );

      return;
    }

    try {
      setSaving(true);

      await createAdminStudent({
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
      });

      setSuccess(
        "Student created successfully."
      );

      setTimeout(() => {
        router.push(
          "/admin/students"
        );

        router.refresh();
      }, 700);
    } catch (error) {
      setError(
        error?.message ||
          "Unable to create student."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell>
      <section className="mb-6">

        <Link
          href="/admin/students"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#0075FF]"
        >
          <ArrowLeft size={17} />

          Back to Students
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
          Add Student
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Create a new student
          profile.
        </p>
      </section>

      <section className="max-w-3xl">

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
        >

          <div className="flex items-center gap-3 border-b border-gray-100 p-6">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0075FF]">
              <GraduationCap
                size={21}
              />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">
                Student Information
              </h2>

              <p className="text-sm text-gray-500">
                Enter student details.
              </p>
            </div>

          </div>

          <div className="space-y-5 p-6">

            {error && (
              <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                <AlertCircle
                  size={18}
                />

                {error}
              </div>
            )}

            {success && (
              <div className="flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                <CheckCircle2
                  size={18}
                />

                {success}
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Admission Number *
                </label>

                <input
                  name="admission_no"
                  value={
                    form.admission_no
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="ROS006"
                  maxLength={50}
                  className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-[#0075FF]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Roll Number
                </label>

                <input
                  name="roll_no"
                  value={
                    form.roll_no
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="06"
                  maxLength={20}
                  className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-[#0075FF]"
                />
              </div>

            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Full Name *
              </label>

              <input
                name="full_name"
                value={
                  form.full_name
                }
                onChange={
                  handleChange
                }
                placeholder="Student full name"
                maxLength={150}
                className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-[#0075FF]"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Gender
                </label>

                <select
                  name="gender"
                  value={
                    form.gender
                  }
                  onChange={
                    handleChange
                  }
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#0075FF]"
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
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Class
                </label>

                <select
                  name="class_id"
                  value={
                    form.class_id
                  }
                  onChange={
                    handleChange
                  }
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#0075FF]"
                >
                  <option value="">
                    Select Class
                  </option>

                  {classes.map(
                    (item) => (
                      <option
                        key={
                          item.id
                        }
                        value={
                          item.id
                        }
                      >
                        {
                          item.name
                        }{" "}
                        -{" "}
                        {
                          item.section
                        }{" "}
                        (
                        {
                          item.academic_year
                        }
                        )
                      </option>
                    )
                  )}
                </select>
              </div>

            </div>

            <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">

              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Active Student
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Student will be visible
                  to Teacher and Parent
                  modules.
                </p>
              </div>

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

            </div>

          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 p-5">

            <Link
              href="/admin/students"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-600"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0075FF] px-5 text-sm font-semibold text-white disabled:opacity-60"
            >
              <Save size={17} />

              {saving
                ? "Creating..."
                : "Create Student"}
            </button>

          </div>

        </form>
      </section>
    </AdminShell>
  );
}