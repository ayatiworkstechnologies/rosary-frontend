
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import AdminShell from "@/components/admin/AdminShell";

import {
  getAdminClasses,
  updateAdminClassStatus,
  deleteAdminClass,
} from "@/services/adminClassService";

import {
  Plus,
  Search,
  Pencil,
  School,
  RefreshCw,
  AlertCircle,
  Power,
  PowerOff,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";

export default function AdminClassesPage() {
  // =========================================================
  // STATE
  // =========================================================

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusLoadingId, setStatusLoadingId] = useState(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [refreshKey, setRefreshKey] = useState(0);

  const [pagination, setPagination] = useState({
    total: 0,
    total_pages: 1,
    has_next: false,
    has_previous: false,
  });

  const [summary, setSummary] = useState({
    total_classes: 0,
    active_classes: 0,
    inactive_classes: 0,
  });

  // =========================================================
  // DEBOUNCED SEARCH
  // =========================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  // =========================================================
  // LOAD CLASSES
  // =========================================================

  const loadClasses = useCallback(
    async (signal) => {
      try {
        if (signal?.aborted) return;

        setLoading(true);
        setError("");

        const response = await getAdminClasses({
          paginated: true,
          page,
          page_size: pageSize,
          search: debouncedSearch,
        });

        if (signal?.aborted) return;

        const items = Array.isArray(response?.data)
          ? response.data
          : [];

        setClasses(items);

        setPagination({
          total: Number(response?.total ?? 0),
          total_pages: Math.max(
            1,
            Number(response?.total_pages ?? 1)
          ),
          has_next: Boolean(response?.has_next),
          has_previous: Boolean(response?.has_previous),
        });

        setSummary({
          total_classes: Number(
            response?.summary?.total_classes ?? 0
          ),
          active_classes: Number(
            response?.summary?.active_classes ?? 0
          ),
          inactive_classes: Number(
            response?.summary?.inactive_classes ?? 0
          ),
        });
      } catch (err) {
        if (signal?.aborted) return;

        console.error("Load classes error:", err);

        setError(
          err?.message || "Unable to load classes."
        );

        setClasses([]);
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [page, pageSize, debouncedSearch]
  );

  // =========================================================
  // LOAD ON PAGE / SEARCH / PAGE SIZE CHANGE
  // =========================================================

  useEffect(() => {
    const controller = new AbortController();

    const timer = setTimeout(() => {
      if (!controller.signal.aborted) {
        void loadClasses(controller.signal);
      }
    }, 0);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [loadClasses, refreshKey]);

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = () => {
    setRefreshKey((current) => current + 1);
  };

  // =========================================================
  // ACTIVATE / DEACTIVATE
  // =========================================================

  const handleStatusChange = async (item) => {
    if (deleteLoadingId !== null) return;

    const newStatus = !item.is_active;

    const message = newStatus
      ? `Activate ${item.name} - ${item.section}?`
      : `Deactivate ${item.name} - ${item.section}?`;

    if (!window.confirm(message)) return;

    try {
      setStatusLoadingId(item.id);

      await updateAdminClassStatus(
        item.id,
        newStatus
      );

      handleRefresh();
    } catch (err) {
      console.error(
        "Update class status error:",
        err
      );

      window.alert(
        err?.message ||
          "Unable to update class status."
      );
    } finally {
      setStatusLoadingId(null);
    }
  };

  // =========================================================
  // DELETE CLASS
  // =========================================================

  const handleDeleteClass = async (item) => {
    if (
      deleteLoadingId !== null ||
      statusLoadingId !== null
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${item.name} - ${item.section} (${item.academic_year})?\n\n` +
        "This action cannot be undone.\n\n" +
        "Classes with linked school records cannot be deleted."
    );

    if (!confirmed) return;

    try {
      setDeleteLoadingId(item.id);

      await deleteAdminClass(item.id);

      window.alert("Class deleted successfully.");

      // Move to the previous page if this was
      // the final record on the current page.
      if (classes.length === 1 && page > 1) {
        setPage((current) => Math.max(1, current - 1));
      } else {
        handleRefresh();
      }
    } catch (err) {
      console.error("Delete class error:", err);

      window.alert(
        err?.message || "Unable to delete class."
      );
    } finally {
      setDeleteLoadingId(null);
    }
  };

  // =========================================================
  // PAGINATION VALUES
  // =========================================================

  const totalPages = pagination.total_pages;

  const startRecord =
    pagination.total === 0
      ? 0
      : (page - 1) * pageSize + 1;

  const endRecord = Math.min(
    page * pageSize,
    pagination.total
  );

  // =========================================================
  // UI
  // =========================================================

  return (
    <AdminShell>
      {/* HEADER */}
      <section className="mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Classes
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage school classes, sections and academic years.
            </p>
          </div>

          <Link
            href="/admin/classes/add"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0075FF] px-5 text-sm font-semibold text-white transition hover:bg-[#0067DF]"
          >
            <Plus size={18} />
            Add Class
          </Link>
        </div>
      </section>

      {/* SUMMARY CARDS */}
      <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Classes
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {summary.total_classes}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Active
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            {summary.active_classes}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Inactive
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-600">
            {summary.inactive_classes}
          </p>
        </div>
      </section>

      {/* SEARCH / PAGE SIZE / REFRESH */}
      <section className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
              }}
              placeholder="Search class, section or academic year..."
              className="h-11 w-full rounded-xl border border-gray-200 pl-11 pr-4 text-sm text-gray-700 outline-none transition focus:border-[#0075FF]"
            />
          </div>

          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setPage(1);
            }}
            aria-label="Classes per page"
            className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none focus:border-[#0075FF]"
          >
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </section>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0 text-red-500"
          />

          <div>
            <p className="text-sm font-semibold text-red-700">
              Unable to load classes
            </p>

            <p className="mt-1 text-xs text-red-600">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* CLASSES TABLE */}
      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Class
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Section
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Academic Year
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-14 text-center"
                  >
                    <RefreshCw
                      size={24}
                      className="mx-auto animate-spin text-[#0075FF]"
                    />

                    <p className="mt-3 text-sm text-gray-500">
                      Loading classes...
                    </p>
                  </td>
                </tr>
              ) : classes.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-14 text-center"
                  >
                    <School
                      size={24}
                      className="mx-auto text-[#0075FF]"
                    />

                    <p className="mt-3 font-semibold text-gray-700">
                      No classes found
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      Try another search or add a new class.
                    </p>
                  </td>
                </tr>
              ) : (
                classes.map((item) => (
                  <tr
                    key={item.id}
                    className="transition hover:bg-gray-50"
                  >
                    {/* CLASS */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0075FF]">
                          <School size={18} />
                        </div>

                        <span className="text-sm font-semibold text-gray-800">
                          {item.name}
                        </span>
                      </div>
                    </td>

                    {/* SECTION */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.section}
                    </td>

                    {/* ACADEMIC YEAR */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.academic_year}
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          item.is_active
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {/* EDIT */}
                        <Link
                          href={`/admin/classes/${item.id}/edit`}
                          title="Edit class"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0075FF]"
                        >
                          <Pencil size={16} />
                        </Link>

                        {/* ACTIVATE / DEACTIVATE */}
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(item)
                          }
                          disabled={
                            statusLoadingId !== null ||
                            deleteLoadingId !== null
                          }
                          title={
                            item.is_active
                              ? "Deactivate"
                              : "Activate"
                          }
                          className={`flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:opacity-50 ${
                            item.is_active
                              ? "border-gray-200 text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                              : "border-gray-200 text-gray-500 hover:border-green-200 hover:bg-green-50 hover:text-green-600"
                          }`}
                        >
                          {statusLoadingId === item.id ? (
                            <RefreshCw
                              size={16}
                              className="animate-spin"
                            />
                          ) : item.is_active ? (
                            <PowerOff size={16} />
                          ) : (
                            <Power size={16} />
                          )}
                        </button>

                        {/* DELETE */}
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteClass(item)
                          }
                          disabled={
                            deleteLoadingId !== null ||
                            statusLoadingId !== null
                          }
                          title="Delete class"
                          aria-label={`Delete ${item.name} - ${item.section}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deleteLoadingId === item.id ? (
                            <RefreshCw
                              size={16}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        {!loading && !error && (
          <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              Showing {startRecord}–{endRecord} of{" "}
              {pagination.total} classes
            </p>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() =>
                  setPage((current) =>
                    Math.max(1, current - 1)
                  )
                }
                disabled={!pagination.has_previous}
                aria-label="Previous page"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                type="button"
                onClick={() =>
                  setPage((current) =>
                    Math.min(totalPages, current + 1)
                  )
                }
                disabled={!pagination.has_next}
                aria-label="Next page"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </section>
    </AdminShell>
  );
}
