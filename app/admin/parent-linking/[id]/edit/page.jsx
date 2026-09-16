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
  getAdminParents,
  getAdminParentLink,
  updateAdminParentLink,
} from "@/services/adminParentLinkService";

import {
  getAdminStudents,
} from "@/services/adminStudentService";

import {
  ArrowLeft,
  Save,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export default function EditParentLinkPage() {
  const params = useParams();
  const router = useRouter();

  const linkId = params.id;

  const [parents, setParents] =
    useState([]);

  const [students, setStudents] =
    useState([]);

  const [form, setForm] =
    useState({
      parent_user_id: "",
      student_id: "",
      relationship: "",
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
          linkResponse,
          parentResponse,
          studentResponse,
        ] = await Promise.all([
          getAdminParentLink(
            linkId
          ),

          getAdminParents(),

          getAdminStudents(),
        ]);

        const link =
          linkResponse?.data;

        setForm({
          parent_user_id:
            String(
              link?.parent_user_id ||
                ""
            ),

          student_id:
            String(
              link?.student_id || ""
            ),

          relationship:
            link?.relationship ||
            "Guardian",
        });

        setParents(
          parentResponse?.data || []
        );

        setStudents(
          studentResponse?.data || []
        );
      } catch (error) {
        setError(
          error?.message ||
            "Unable to load link."
        );
      } finally {
        setLoading(false);
      }
    };

    if (linkId) {
      loadData();
    }
  }, [linkId]);

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

      await updateAdminParentLink(
        linkId,
        {
          parent_user_id: Number(
            form.parent_user_id
          ),

          student_id: Number(
            form.student_id
          ),

          relationship:
            form.relationship ||
            null,
        }
      );

      router.push(
        "/admin/parent-linking"
      );

      router.refresh();
    } catch (error) {
      setError(
        error?.message ||
          "Unable to update link."
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
        href="/admin/parent-linking"
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#0075FF]"
      >
        <ArrowLeft size={17} />

        Back to Parent Linking
      </Link>

      <h1 className="text-2xl font-bold text-gray-900">
        Edit Parent Link
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

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Parent
            </label>

            <select
              name="parent_user_id"
              value={
                form.parent_user_id
              }
              onChange={
                handleChange
              }
              className="h-12 w-full rounded-xl border bg-white px-4"
            >
              {parents.map(
                (parent) => (
                  <option
                    key={parent.id}
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

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Student
            </label>

            <select
              name="student_id"
              value={
                form.student_id
              }
              onChange={
                handleChange
              }
              className="h-12 w-full rounded-xl border bg-white px-4"
            >
              {students.map(
                (student) => (
                  <option
                    key={student.id}
                    value={student.id}
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

          <div>
            <label className="mb-2 block text-sm font-semibold">
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
              className="h-12 w-full rounded-xl border bg-white px-4"
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

          <div className="flex justify-end gap-3">

            <Link
              href="/admin/parent-linking"
              className="rounded-xl border px-5 py-3 text-sm font-semibold"
            >
              Cancel
            </Link>

            <button
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0075FF] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
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