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
  createAdminParentLink,
  getAdminParents,
} from "@/services/adminParentLinkService";

import {
  getAdminStudents,
} from "@/services/adminStudentService";

import {
  ArrowLeft,
  Link2,
  Save,
  AlertCircle,
} from "lucide-react";

export default function AddParentLinkPage() {
  const router = useRouter();

  const [parents, setParents] =
    useState([]);

  const [students, setStudents] =
    useState([]);

  const [form, setForm] =
    useState({
      parent_user_id: "",
      student_id: "",
      relationship: "Father",
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
          parentsResponse,
          studentsResponse,
        ] = await Promise.all([
          getAdminParents(),
          getAdminStudents(),
        ]);

        setParents(
          Array.isArray(
            parentsResponse?.data
          )
            ? parentsResponse.data
            : []
        );

        setStudents(
          Array.isArray(
            studentsResponse?.data
          )
            ? studentsResponse.data.filter(
                (item) =>
                  item.is_active
              )
            : []
        );
      } catch (error) {
        setError(
          error?.message ||
            "Unable to load data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleChange = (e) => {
    setForm((current) => ({
      ...current,
      [e.target.name]:
        e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.parent_user_id) {
      setError(
        "Please select a parent."
      );
      return;
    }

    if (!form.student_id) {
      setError(
        "Please select a student."
      );
      return;
    }

    try {
      setSaving(true);

      await createAdminParentLink({
        parent_user_id: Number(
          form.parent_user_id
        ),

        student_id: Number(
          form.student_id
        ),

        relationship:
          form.relationship || null,
      });

      router.push(
        "/admin/parent-linking"
      );

      router.refresh();
    } catch (error) {
      setError(
        error?.message ||
          "Unable to create link."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell>

      <section className="mb-6">

        <Link
          href="/admin/parent-linking"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#0075FF]"
        >
          <ArrowLeft size={17} />
          Back to Parent Linking
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
          Link Parent to Student
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Connect a parent account
          with a student.
        </p>

      </section>

      <section className="max-w-3xl">

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
        >

          <div className="flex items-center gap-3 border-b border-gray-100 p-6">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0075FF]">
              <Link2 size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">
                Parent & Student
              </h2>

              <p className="text-sm text-gray-500">
                Select both accounts.
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

            {loading ? (
              <p className="text-sm text-gray-500">
                Loading parents and
                students...
              </p>
            ) : (
              <>
                {/* Parent */}
                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Parent *
                  </label>

                  <select
                    name="parent_user_id"
                    value={
                      form.parent_user_id
                    }
                    onChange={
                      handleChange
                    }
                    className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#0075FF]"
                  >

                    <option value="">
                      Select Parent
                    </option>

                    {parents.map(
                      (parent) => (
                        <option
                          key={
                            parent.id
                          }
                          value={
                            parent.user_id
                          }
                        >
                          Parent #
                          {
                            parent.user_id
                          }
                          {" - "}
                          {parent.phone ||
                            "No phone"}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* Student */}
                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Student *
                  </label>

                  <select
                    name="student_id"
                    value={
                      form.student_id
                    }
                    onChange={
                      handleChange
                    }
                    className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#0075FF]"
                  >

                    <option value="">
                      Select Student
                    </option>

                    {students.map(
                      (student) => (
                        <option
                          key={
                            student.id
                          }
                          value={
                            student.id
                          }
                        >
                          {
                            student.full_name
                          }
                          {" - "}
                          {
                            student.admission_no
                          }
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* Relationship */}
                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Relationship
                  </label>

                  <select
                    name="relationship"
                    value={
                      form.relationship
                    }
                    onChange={
                      handleChange
                    }
                    className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#0075FF]"
                  >
                    <option value="Father">
                      Father
                    </option>

                    <option value="Mother">
                      Mother
                    </option>

                    <option value="Guardian">
                      Guardian
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>

                </div>
              </>
            )}

          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 p-5">

            <Link
              href="/admin/parent-linking"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-600"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={
                saving || loading
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0075FF] px-5 text-sm font-semibold text-white disabled:opacity-60"
            >
              <Save size={17} />

              {saving
                ? "Linking..."
                : "Link Parent"}
            </button>

          </div>

        </form>

      </section>

    </AdminShell>
  );
}