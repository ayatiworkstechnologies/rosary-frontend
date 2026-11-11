"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  useParams,
  useRouter,
} from "next/navigation";


import {
  getAdminTeacher,
  updateAdminTeacher,
} from "@/services/adminTeacherService";

import {
  ArrowLeft,
  Save,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export default function EditTeacherPage() {
  const params = useParams();
  const router = useRouter();

  const teacherId = params.id;

  const [form, setForm] =
    useState({
      name: "",
      username: "",
      email: "",
      employee_id: "",
      date_of_birth: "",
      phone: "",
      designation: "",
      department: "",
      qualification: "",
      experience_years: "",
      joining_date: "",
      profile_image_url: "",
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTeacher() {
      try {
        const response =
          await getAdminTeacher(
            teacherId
          );

        if (cancelled) {
          return;
        }

        const teacher =
          response?.data;

        setForm({
          name:
            teacher?.name || "",

          username:
            teacher?.username || "",

          email:
            teacher?.email || "",

          employee_id:
            teacher?.employee_id ||
            "",

          date_of_birth:
            teacher?.date_of_birth ||
            "",

          phone:
            teacher?.phone || "",

          designation:
            teacher?.designation ||
            "",

          department:
            teacher?.department ||
            "",

          qualification:
            teacher?.qualification ||
            "",

          experience_years:
            teacher?.experience_years ??
            "",

          joining_date:
            teacher?.joining_date ||
            "",

          profile_image_url:
            teacher?.profile_image_url ||
            "",
        });
      } catch (error) {
        if (!cancelled) {
          setError(
            error?.message ||
              "Unable to load teacher."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (teacherId) {
      loadTeacher();
    }

    return () => {
      cancelled = true;
    };
  }, [teacherId]);

  const handleChange = (e) => {
    setForm((current) => ({
      ...current,
      [e.target.name]:
        e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      await updateAdminTeacher(
        teacherId,
        {
          name: form.name.trim(),

          username:
            form.username.trim(),

          email:
            form.email.trim() ||
            null,

          employee_id:
            form.employee_id.trim(),

          date_of_birth:
            form.date_of_birth,

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
        }
      );

      router.push(
        "/admin/teachers"
      );

      router.refresh();
    } catch (error) {
      setError(
        error?.message ||
          "Unable to update teacher."
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#0075FF]";

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
      <Link
        href="/admin/teachers"
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#0075FF]"
      >
        <ArrowLeft size={17} />

        Back to Teachers
      </Link>

      <h1 className="text-2xl font-bold text-[#0B3A67]">
        Edit Teacher
      </h1>

      <div className="mt-6 grid max-w-5xl gap-6">

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >

          {error && (
            <div className="mb-5 flex gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-600">
              <AlertCircle
                size={18}
              />

              {error}
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Name
              </label>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Employee ID
              </label>

              <input
                name="employee_id"
                value={
                  form.employee_id
                }
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Username
              </label>

              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Email
              </label>

              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Date of Birth
              </label>

              <input
                type="date"
                name="date_of_birth"
                value={form.date_of_birth}
                onChange={handleChange}
                className={inputClass}
                required
              />

              <p className="mt-1 text-xs text-gray-500">
                Saving generates the login password as DDMMYYYY.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
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
              <label className="mb-2 block text-sm font-semibold">
                Designation
              </label>

              <input
                name="designation"
                value={
                  form.designation
                }
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Department
              </label>

              <input
                name="department"
                value={
                  form.department
                }
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Experience
              </label>

              <input
                type="number"
                name="experience_years"
                value={
                  form.experience_years
                }
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Qualification
              </label>

              <input
                name="qualification"
                value={
                  form.qualification
                }
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
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

          <div className="mt-6 flex justify-end">

            <button
              disabled={saving}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0075FF] px-5 text-sm font-semibold text-white"
            >
              <Save size={17} />

              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </form>

      </div>
    </>
  );
}
