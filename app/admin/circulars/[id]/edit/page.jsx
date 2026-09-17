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

import AdminShell from "@/components/admin/AdminShell";

import {
  getAdminCircular,
  updateAdminCircular,
} from "@/services/adminCircularService";

import {
  getAdminClasses,
} from "@/services/adminClassService";

import {
  ArrowLeft,
  Save,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export default function EditCircularPage() {
  const params = useParams();
  const router = useRouter();

  const circularId =
    params.id;

  const [classes, setClasses] =
    useState([]);

  const [form, setForm] =
    useState({
      title: "",
      category: "",
      description: "",
      published_date: "",
      audience: "ALL",
      class_id: "",
      attachment_url: "",
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [
          circularResponse,
          classesResponse,
        ] = await Promise.all([
          getAdminCircular(
            circularId
          ),
          getAdminClasses(),
        ]);

        if (cancelled) return;

        const circular =
          circularResponse?.data;

        setForm({
          title:
            circular?.title || "",
          category:
            circular?.category || "",
          description:
            circular?.description ||
            "",
          published_date:
            circular?.published_date ||
            "",
          audience:
            circular?.audience ||
            "ALL",
          class_id:
            circular?.class_id
              ? String(
                  circular.class_id
                )
              : "",
          attachment_url:
            circular
              ?.attachment_url ||
            "",
        });

        setClasses(
          Array.isArray(
            classesResponse?.data
          )
            ? classesResponse.data
            : []
        );
      } catch (error) {
        if (!cancelled) {
          setError(
            error?.message ||
              "Unable to load circular."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (circularId) {
      loadData();
    }

    return () => {
      cancelled = true;
    };
  }, [circularId]);

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,

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

      await updateAdminCircular(
        circularId,
        {
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
            form.audience ===
            "CLASS"
              ? Number(
                  form.class_id
                )
              : null,

          attachment_url:
            form.attachment_url.trim() ||
            null,
        }
      );

      router.push(
        "/admin/circulars"
      );

      router.refresh();
    } catch (error) {
      setError(
        error?.message ||
          "Unable to update circular."
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#0075FF]";

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
        href="/admin/circulars"
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#0075FF]"
      >
        <ArrowLeft size={17} />
        Back to Circulars
      </Link>

      <h1 className="text-2xl font-bold text-gray-900">
        Edit Circular
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mt-6 max-w-4xl rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        {error && (
          <div className="mb-5 flex gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-600">
            <AlertCircle
              size={18}
            />
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Title
            </label>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Category
              </label>

              <input
                name="category"
                value={
                  form.category
                }
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Published Date
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
            <label className="mb-2 block text-sm font-semibold">
              Description
            </label>

            <textarea
              name="description"
              value={
                form.description
              }
              onChange={handleChange}
              rows={6}
              className="w-full rounded-xl border border-gray-200 p-4 text-sm outline-none focus:border-[#0075FF]"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Audience
              </label>

              <select
                name="audience"
                value={
                  form.audience
                }
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
                <label className="mb-2 block text-sm font-semibold">
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
                        }
                      </option>
                    )
                  )}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Attachment URL
            </label>

            <input
              name="attachment_url"
              value={
                form.attachment_url
              }
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Link
              href="/admin/circulars"
              className="inline-flex h-11 items-center rounded-xl border border-gray-200 px-5 text-sm font-semibold"
            >
              Cancel
            </Link>

            <button
              disabled={saving}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0075FF] px-5 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Save size={17} />

              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </AdminShell>
  );
}