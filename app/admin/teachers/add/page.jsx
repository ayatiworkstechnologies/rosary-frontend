"use client";

import {
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import AdminShell from "@/components/admin/AdminShell";

import {
  createAdminTeacher,
} from "@/services/adminTeacherService";

import {
  ArrowLeft,
  Save,
  AlertCircle,
  UserPlus,
} from "lucide-react";

export default function AddTeacherPage() {
  const router = useRouter();

  const [form, setForm] =
    useState({
      name: "",
      username: "",
      email: "",
      password: "",
      employee_id: "",
      phone: "",
      designation: "",
      department: "",
      qualification: "",
      experience_years: "",
      joining_date: "",
      profile_image_url: "",
      is_active: true,
    });

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
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

    if (!form.name.trim()) {
      setError(
        "Teacher name is required."
      );
      return;
    }

    if (!form.username.trim()) {
      setError(
        "Username is required."
      );
      return;
    }

    if (!form.password) {
      setError(
        "Password is required."
      );
      return;
    }

    if (!form.employee_id.trim()) {
      setError(
        "Employee ID is required."
      );
      return;
    }

    try {
      setSaving(true);

      await createAdminTeacher({
        name: form.name.trim(),

        username:
          form.username.trim(),

        email:
          form.email.trim() ||
          null,

        password:
          form.password,

        employee_id:
          form.employee_id.trim(),

        phone:
          form.phone.trim() ||
          null,

        designation:
          form.designation.trim() ||
          null,

        department:
          form.department.trim() ||
          null,

        qualification:
          form.qualification.trim() ||
          null,

        experience_years:
          form.experience_years
            ? Number(
                form.experience_years
              )
            : null,

        joining_date:
          form.joining_date ||
          null,

        profile_image_url:
          form.profile_image_url.trim() ||
          null,

        is_active:
          form.is_active,
      });

      router.push(
        "/admin/teachers"
      );

      router.refresh();
    } catch (error) {
      setError(
        error?.message ||
          "Unable to create teacher."
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-[#0075FF]";

  return (
    <AdminShell>

      <section className="mb-6">

        <Link
          href="/admin/teachers"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#0075FF]"
        >
          <ArrowLeft size={17} />

          Back to Teachers
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
          Add Teacher
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Create the teacher login
          account and profile.
        </p>

      </section>

      <form
        onSubmit={handleSubmit}
        className="max-w-5xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
      >

        <div className="flex items-center gap-3 border-b border-gray-100 p-6">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0075FF]">
            <UserPlus size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">
              Teacher Information
            </h2>

            <p className="text-sm text-gray-500">
              Enter account and
              professional details.
            </p>
          </div>

        </div>

        <div className="p-6">

          {error && (
            <div className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">

              <AlertCircle
                size={18}
              />

              {error}

            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Teacher Name *
              </label>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className={inputClass}
                placeholder="Teacher name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Employee ID *
              </label>

              <input
                name="employee_id"
                value={
                  form.employee_id
                }
                onChange={handleChange}
                className={inputClass}
                placeholder="ROS-T-002"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Username *
              </label>

              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                className={inputClass}
                placeholder="TEACHER002"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Password *
              </label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className={inputClass}
                placeholder="Minimum 6 characters"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={inputClass}
                placeholder="teacher@school.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Phone
              </label>

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Designation
              </label>

              <input
                name="designation"
                value={
                  form.designation
                }
                onChange={handleChange}
                className={inputClass}
                placeholder="Mathematics Teacher"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Department
              </label>

              <input
                name="department"
                value={
                  form.department
                }
                onChange={handleChange}
                className={inputClass}
                placeholder="Mathematics"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Qualification
              </label>

              <input
                name="qualification"
                value={
                  form.qualification
                }
                onChange={handleChange}
                className={inputClass}
                placeholder="M.Sc Mathematics, B.Ed"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Experience Years
              </label>

              <input
                type="number"
                min="0"
                name="experience_years"
                value={
                  form.experience_years
                }
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Joining Date
              </label>

              <input
                type="date"
                name="joining_date"
                value={
                  form.joining_date
                }
                onChange={handleChange}
                className={inputClass}
              />
            </div>

          </div>

          <label className="mt-6 flex items-center gap-3">
            <input
              type="checkbox"
              name="is_active"
              checked={
                form.is_active
              }
              onChange={handleChange}
              className="h-4 w-4"
            />

            <span className="text-sm font-semibold text-gray-700">
              Teacher account active
            </span>
          </label>

        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 p-5">

          <Link
            href="/admin/teachers"
            className="inline-flex h-11 items-center rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-600"
          >
            Cancel
          </Link>

          <button
            disabled={saving}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0075FF] px-5 text-sm font-semibold text-white disabled:opacity-50"
          >
            <Save size={17} />

            {saving
              ? "Creating..."
              : "Create Teacher"}
          </button>

        </div>

      </form>

    </AdminShell>
  );
}