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
  createAdminCircular,
} from "@/services/adminCircularService";

import {
  getAdminClasses,
} from "@/services/adminClassService";

import {
  ArrowLeft,
  Save,
  AlertCircle,
  Megaphone,
} from "lucide-react";

export default function AddCircularPage() {
  const router = useRouter();

  const [classes, setClasses] =
    useState([]);

  const [form, setForm] =
    useState({
      title: "",
      category: "",
      description: "",
      published_date:
        new Date()
          .toISOString()
          .split("T")[0],
      audience: "ALL",
      class_id: "",
      attachment_url: "",
      is_active: true,
    });

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadClasses() {
      try {
        const response =
          await getAdminClasses();

        if (cancelled) return;

        setClasses(
          Array.isArray(response?.data)
            ? response.data.filter(
                (item) =>
                  item.is_active
              )
            : []
        );
      } catch (error) {
        console.error(
          "Class loading error:",
          error
        );
      }
    }

    loadClasses();

    return () => {
      cancelled = true;
    };
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

      ...(name === "audience" &&
      value !== "CLASS"
        ? {
            class_id: "",
          }
        : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.title.trim()) {
      setError(
        "Title is required."
      );
      return;
    }

    if (!form.category.trim()) {
      setError(
        "Category is required."
      );
      return;
    }

    if (!form.description.trim()) {
      setError(
        "Description is required."
      );
      return;
    }

    if (
      form.audience === "CLASS" &&
      !form.class_id
    ) {
      setError(
        "Please select a class."
      );
      return;
    }

    try {
      setSaving(true);

      await createAdminCircular({
        title:
          form.title.trim(),

        category:
          form.category.trim(),

        description:
          form.description.trim(),

        published_date:
          form.published_date,

        audience:
          form.audience,

        class_id:
          form.audience === "CLASS"
            ? Number(
                form.class_id
              )
            : null,

        attachment_url:
          form.attachment_url.trim() ||
          null,

        created_by: null,

        is_active:
          form.is_active,
      });

      router.push(
        "/admin/circulars"
      );

      router.refresh();
    } catch (error) {
      setError(
        error?.message ||
          "Unable to create circular."
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#0075FF]";

  return (
    <AdminShell>
      <Link
        href="/admin/circulars"
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#0075FF]"
      >
        <ArrowLeft size={17} />
        Back to Circulars
      </Link>

      <h1 className="text-2xl font-bold text-gray-900">
        Add Circular
      </h1>

      <p className="mt-1 text-sm text-gray-500">
        Publish a school notice to
        teachers, parents or a
        specific class.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 max-w-4xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
      >
        <div className="flex items-center gap-3 border-b border-gray-100 p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0075FF]">
            <Megaphone size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">
              Circular Information
            </h2>

            <p className="text-sm text-gray-500">
              Enter notice details.
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

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Title *
            </label>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className={inputClass}
              placeholder="Circular title"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Category *
              </label>

              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                className={inputClass}
                placeholder="General / Exam / Fees"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Published Date *
              </label>

              <input
                type="date"
                name="published_date"
                value={
                  form.published_date
                }
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Description *
            </label>

            <textarea
              name="description"
              value={
                form.description
              }
              onChange={handleChange}
              rows={6}
              className="w-full rounded-xl border border-gray-200 p-4 text-sm outline-none focus:border-[#0075FF]"
              placeholder="Circular description..."
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Audience *
              </label>

              <select
                name="audience"
                value={form.audience}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="ALL">
                  Everyone
                </option>

                <option value="TEACHER">
                  Teachers
                </option>

                <option value="PARENT">
                  Parents
                </option>

                <option value="CLASS">
                  Specific Class
                </option>
              </select>
            </div>

            {form.audience ===
              "CLASS" && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Class *
                </label>

                <select
                  name="class_id"
                  value={
                    form.class_id
                  }
                  onChange={
                    handleChange
                  }
                  className={
                    inputClass
                  }
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
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Attachment URL
            </label>

            <input
              name="attachment_url"
              value={
                form.attachment_url
              }
              onChange={handleChange}
              className={inputClass}
              placeholder="/uploads/circulars/file.pdf"
            />
          </div>

          <label className="flex items-center gap-3">
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
              Publish immediately
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 p-5">
          <Link
            href="/admin/circulars"
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
              ? "Publishing..."
              : "Publish Circular"}
          </button>
        </div>
      </form>
    </AdminShell>
  );
}