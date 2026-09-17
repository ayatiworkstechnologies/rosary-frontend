"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import AdminShell from "@/components/admin/AdminShell";

import {
  getAdminCirculars,
  updateAdminCircularStatus,
  deleteAdminCircular,
} from "@/services/adminCircularService";

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  AlertCircle,
  Power,
  PowerOff,
  Megaphone,
} from "lucide-react";

export default function AdminCircularsPage() {
  const [circulars, setCirculars] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [audienceFilter, setAudienceFilter] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [statusLoadingId, setStatusLoadingId] =
    useState(null);

  const [deletingId, setDeletingId] =
    useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const response =
          await getAdminCirculars();

        if (cancelled) return;

        setCirculars(
          Array.isArray(response?.data)
            ? response.data
            : []
        );
      } catch (error) {
        if (cancelled) return;

        setError(
          error?.message ||
            "Unable to load circulars."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getAdminCirculars();

      setCirculars(
        Array.isArray(response?.data)
          ? response.data
          : []
      );
    } catch (error) {
      setError(
        error?.message ||
          "Unable to load circulars."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredCirculars =
    useMemo(() => {
      const keyword = search
        .trim()
        .toLowerCase();

      return circulars.filter(
        (item) => {
          const searchText = `
            ${item.title || ""}
            ${item.category || ""}
            ${item.description || ""}
            ${item.audience || ""}
          `.toLowerCase();

          const matchesSearch =
            !keyword ||
            searchText.includes(
              keyword
            );

          const matchesAudience =
            !audienceFilter ||
            item.audience ===
              audienceFilter;

          const matchesStatus =
            statusFilter === ""
              ? true
              : statusFilter === "active"
              ? item.is_active
              : !item.is_active;

          return (
            matchesSearch &&
            matchesAudience &&
            matchesStatus
          );
        }
      );
    }, [
      circulars,
      search,
      audienceFilter,
      statusFilter,
    ]);

  const handleStatusChange =
    async (item) => {
      const newStatus =
        !item.is_active;

      const confirmed =
        window.confirm(
          newStatus
            ? `Activate "${item.title}"?`
            : `Deactivate "${item.title}"?`
        );

      if (!confirmed) return;

      try {
        setStatusLoadingId(
          item.id
        );

        await updateAdminCircularStatus(
          item.id,
          newStatus
        );

        setCirculars(
          (current) =>
            current.map(
              (circular) =>
                circular.id ===
                item.id
                  ? {
                      ...circular,
                      is_active:
                        newStatus,
                    }
                  : circular
            )
        );
      } catch (error) {
        window.alert(
          error?.message ||
            "Unable to update status."
        );
      } finally {
        setStatusLoadingId(null);
      }
    };

  const handleDelete =
    async (item) => {
      const confirmed =
        window.confirm(
          `Delete "${item.title}" permanently?`
        );

      if (!confirmed) return;

      try {
        setDeletingId(item.id);

        await deleteAdminCircular(
          item.id
        );

        setCirculars(
          (current) =>
            current.filter(
              (circular) =>
                circular.id !==
                item.id
            )
        );
      } catch (error) {
        window.alert(
          error?.message ||
            "Unable to delete circular."
        );
      } finally {
        setDeletingId(null);
      }
    };

  return (
    <AdminShell>
      {/* HEADER */}

      <section className="mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Circulars
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage school notices
              for parents, teachers
              and classes.
            </p>
          </div>

          <Link
            href="/admin/circulars/add"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0075FF] px-5 text-sm font-semibold text-white hover:bg-[#0067DF]"
          >
            <Plus size={18} />
            Add Circular
          </Link>
        </div>
      </section>

      {/* SUMMARY */}

      <section className="mb-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Circulars
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {circulars.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Active
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            {
              circulars.filter(
                (item) =>
                  item.is_active
              ).length
            }
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Inactive
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-600">
            {
              circulars.filter(
                (item) =>
                  !item.is_active
              ).length
            }
          </p>
        </div>
      </section>

      {/* FILTERS */}

      <section className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_160px_auto]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search circular..."
              className="h-11 w-full rounded-xl border border-gray-200 pl-11 pr-4 text-sm outline-none focus:border-[#0075FF]"
            />
          </div>

          <select
            value={audienceFilter}
            onChange={(e) =>
              setAudienceFilter(
                e.target.value
              )
            }
            className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm"
          >
            <option value="">
              All Audience
            </option>

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

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm"
          >
            <option value="">
              All Status
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>
          </select>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
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

      {error && (
        <div className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* TABLE */}

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Circular
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Category
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Audience
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Published
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Status
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-14 text-center"
                  >
                    <RefreshCw
                      size={25}
                      className="mx-auto animate-spin text-[#0075FF]"
                    />

                    <p className="mt-3 text-sm text-gray-500">
                      Loading circulars...
                    </p>
                  </td>
                </tr>
              ) : filteredCirculars.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-14 text-center"
                  >
                    <Megaphone
                      size={30}
                      className="mx-auto text-[#0075FF]"
                    />

                    <p className="mt-3 font-semibold text-gray-700">
                      No circulars found
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCirculars.map(
                  (item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-800">
                          {item.title}
                        </p>

                        <p className="mt-1 max-w-[360px] truncate text-xs text-gray-500">
                          {
                            item.description
                          }
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.category}
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#0075FF]">
                          {item.audience}
                        </span>

                        {item.audience ===
                          "CLASS" &&
                          item.class && (
                            <p className="mt-1 text-xs text-gray-500">
                              {
                                item.class
                                  .name
                              }{" "}
                              -{" "}
                              {
                                item.class
                                  .section
                              }
                            </p>
                          )}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {
                          item.published_date
                        }
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
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

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/circulars/${item.id}/edit`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-blue-50 hover:text-[#0075FF]"
                          >
                            <Pencil size={16} />
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(
                                item
                              )
                            }
                            disabled={
                              statusLoadingId ===
                              item.id
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 disabled:opacity-50"
                          >
                            {statusLoadingId ===
                            item.id ? (
                              <RefreshCw
                                size={16}
                                className="animate-spin"
                              />
                            ) : item.is_active ? (
                              <PowerOff
                                size={16}
                              />
                            ) : (
                              <Power
                                size={16}
                              />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                item
                              )
                            }
                            disabled={
                              deletingId ===
                              item.id
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-50"
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