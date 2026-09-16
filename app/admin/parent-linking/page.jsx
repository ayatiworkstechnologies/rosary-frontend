"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import AdminShell from "@/components/admin/AdminShell";

import {
  getAdminParentLinks,
  deleteAdminParentLink,
} from "@/services/adminParentLinkService";

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Users,
  RefreshCw,
  AlertCircle,
  UserRound,
  GraduationCap,
} from "lucide-react";

export default function AdminParentLinkingPage() {
  const [links, setLinks] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [deletingId, setDeletingId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    async function loadInitialLinks() {
      try {
        const response =
          await getAdminParentLinks();

        if (cancelled) {
          return;
        }

        setLinks(
          Array.isArray(response?.data)
            ? response.data
            : []
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Load parent links error:",
          error
        );

        setError(
          error?.message ||
            "Unable to load parent links."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInitialLinks();

    return () => {
      cancelled = true;
    };
  }, []);

  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getAdminParentLinks();

      setLinks(
        Array.isArray(response?.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "Refresh parent links error:",
        error
      );

      setError(
        error?.message ||
          "Unable to load parent links."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SEARCH FILTER
  // =====================================================

  const filteredLinks = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    if (!keyword) {
      return links;
    }

    return links.filter((item) => {
      const text = `
        ${item.parent_user_id || ""}
        ${item.parent?.phone || ""}
        ${item.student?.full_name || ""}
        ${item.student?.admission_no || ""}
        ${item.relationship || ""}
        ${item.student?.class?.name || ""}
        ${item.student?.class?.section || ""}
        ${item.student?.class?.academic_year || ""}
      `.toLowerCase();

      return text.includes(keyword);
    });
  }, [links, search]);

  // =====================================================
  // DELETE / UNLINK
  // =====================================================

  const handleDelete = async (item) => {
    const studentName =
      item.student?.full_name ||
      "this student";

    const confirmed =
      window.confirm(
        `Unlink this parent from ${studentName}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(item.id);

      await deleteAdminParentLink(
        item.id
      );

      setLinks((current) =>
        current.filter(
          (link) =>
            link.id !== item.id
        )
      );
    } catch (error) {
      console.error(
        "Unlink parent error:",
        error
      );

      window.alert(
        error?.message ||
          "Unable to unlink parent."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminShell>
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <section className="mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Parent Linking
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Link parents with their
              children and manage
              relationships.
            </p>
          </div>

          <Link
            href="/admin/parent-linking/add"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0075FF] px-5 text-sm font-semibold text-white transition hover:bg-[#0067DF]"
          >
            <Plus size={18} />

            Link Parent
          </Link>
        </div>
      </section>

      {/* ================================================= */}
      {/* SUMMARY */}
      {/* ================================================= */}

      <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Links */}

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Links
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {links.length}
          </p>
        </div>

        {/* Parents Linked */}

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Parents Linked
          </p>

          <p className="mt-2 text-2xl font-bold text-[#0075FF]">
            {
              new Set(
                links.map(
                  (item) =>
                    item.parent_user_id
                )
              ).size
            }
          </p>
        </div>

        {/* Students Linked */}

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Students Linked
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            {
              new Set(
                links.map(
                  (item) =>
                    item.student_id
                )
              ).size
            }
          </p>
        </div>
      </section>

      {/* ================================================= */}
      {/* SEARCH + REFRESH */}
      {/* ================================================= */}

      <section className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Search */}

          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search parent, student, relationship..."
              className="h-11 w-full rounded-xl border border-gray-200 pl-11 pr-4 text-sm text-gray-700 outline-none transition focus:border-[#0075FF]"
            />
          </div>

          {/* Refresh */}

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>
      </section>

      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0 text-red-500"
          />

          <div>
            <p className="text-sm font-semibold text-red-700">
              Unable to load parent links
            </p>

            <p className="mt-1 text-xs text-red-600">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* TABLE */}
      {/* ================================================= */}

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            {/* Header */}

            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Parent
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Student
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Class
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Relationship
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Body */}

            <tbody className="divide-y divide-gray-100">
              {/* Loading */}

              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-14 text-center"
                  >
                    <RefreshCw
                      size={25}
                      className="mx-auto animate-spin text-[#0075FF]"
                    />

                    <p className="mt-3 text-sm text-gray-500">
                      Loading parent links...
                    </p>
                  </td>
                </tr>
              ) : filteredLinks.length ===
                0 ? (
                /* Empty */
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-14"
                  >
                    <div className="text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0075FF]">
                        <Users
                          size={27}
                        />
                      </div>

                      <p className="mt-3 font-semibold text-gray-700">
                        No parent links found
                      </p>

                      <p className="mt-1 text-sm text-gray-400">
                        Link a parent to a
                        student to get started.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLinks.map(
                  (item) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-gray-50"
                    >
                      {/* Parent */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#0075FF]">
                            <UserRound
                              size={18}
                            />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              Parent #
                              {
                                item.parent_user_id
                              }
                            </p>

                            <p className="mt-0.5 text-xs text-gray-500">
                              {item.parent
                                ?.phone ||
                                "No phone"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Student */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                            <GraduationCap
                              size={18}
                            />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {item.student
                                ?.full_name ||
                                "Unknown Student"}
                            </p>

                            <p className="mt-0.5 text-xs text-gray-500">
                              {item.student
                                ?.admission_no ||
                                "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Class */}

                      <td className="px-6 py-4">
                        {item.student?.class ? (
                          <div>
                            <p className="text-sm font-semibold text-gray-700">
                              {
                                item.student
                                  .class
                                  .name
                              }{" "}
                              -{" "}
                              {
                                item.student
                                  .class
                                  .section
                              }
                            </p>

                            <p className="mt-0.5 text-xs text-gray-400">
                              {
                                item.student
                                  .class
                                  .academic_year
                              }
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">
                            Not Assigned
                          </span>
                        )}
                      </td>

                      {/* Relationship */}

                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#0075FF]">
                          {item.relationship ||
                            "Guardian"}
                        </span>
                      </td>

                      {/* Actions */}

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {/* Edit */}

                          <Link
                            href={`/admin/parent-linking/${item.id}/edit`}
                            title="Edit Link"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0075FF]"
                          >
                            <Pencil
                              size={16}
                            />
                          </Link>

                          {/* Delete */}

                          <button
                            type="button"
                            title="Unlink Parent"
                            onClick={() =>
                              handleDelete(
                                item
                              )
                            }
                            disabled={
                              deletingId ===
                              item.id
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId ===
                            item.id ? (
                              <RefreshCw
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2
                                size={16}
                              />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}