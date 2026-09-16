"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import AdminShell from "@/components/admin/AdminShell";

import {
  getAdminClasses,
  updateAdminClassStatus,
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
} from "lucide-react";

export default function AdminClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusLoadingId, setStatusLoadingId] =
    useState(null);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadClasses = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getAdminClasses();

      setClasses(response?.data || []);
    } catch (error) {
      console.error(
        "Load classes error:",
        error
      );

      setError(
        error?.message ||
          "Unable to load classes."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadClasses();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const filteredClasses = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    if (!keyword) {
      return classes;
    }

    return classes.filter((item) => {
      const searchableText = `
        ${item.name || ""}
        ${item.section || ""}
        ${item.academic_year || ""}
      `.toLowerCase();

      return searchableText.includes(
        keyword
      );
    });
  }, [classes, search]);

  const handleStatusChange = async (
    item
  ) => {
    const newStatus = !item.is_active;

    const message = newStatus
      ? `Activate ${item.name} - ${item.section}?`
      : `Deactivate ${item.name} - ${item.section}?`;

    const confirmed =
      window.confirm(message);

    if (!confirmed) {
      return;
    }

    try {
      setStatusLoadingId(item.id);

      await updateAdminClassStatus(
        item.id,
        newStatus
      );

      setClasses((current) =>
        current.map((classItem) =>
          classItem.id === item.id
            ? {
                ...classItem,
                is_active: newStatus,
              }
            : classItem
        )
      );
    } catch (error) {
      alert(
        error?.message ||
          "Unable to update class status."
      );
    } finally {
      setStatusLoadingId(null);
    }
  };

  return (
    <AdminShell>
      {/* Header */}
      <section className="mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Classes
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage school classes,
              sections and academic years.
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

      {/* Summary */}
      <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Classes
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {classes.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Active
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            {
              classes.filter(
                (item) => item.is_active
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
              classes.filter(
                (item) => !item.is_active
              ).length
            }
          </p>
        </div>
      </section>

      {/* Search */}
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
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search class, section or academic year..."
              className="h-11 w-full rounded-xl border border-gray-200 pl-11 pr-4 text-sm text-gray-700 outline-none transition focus:border-[#0075FF]"
            />
          </div>

          <button
            onClick={loadClasses}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
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

      {/* Error */}
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

      {/* Table */}
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
                    colSpan="5"
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
              ) : filteredClasses.length ===
                0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-14"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#0075FF]">
                        <School
                          size={22}
                        />
                      </div>

                      <p className="mt-3 font-semibold text-gray-700">
                        No classes found
                      </p>

                      <p className="mt-1 text-sm text-gray-400">
                        Create your first
                        school class.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClasses.map(
                  (item) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0075FF]">
                            <School
                              size={18}
                            />
                          </div>

                          <span className="text-sm font-semibold text-gray-800">
                            {item.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.section}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {
                          item.academic_year
                        }
                      </td>

                      <td className="px-6 py-4">
                        {item.is_active ? (
                          <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/classes/${item.id}/edit`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0075FF]"
                            title="Edit class"
                          >
                            <Pencil
                              size={16}
                            />
                          </Link>

                          <button
                            onClick={() =>
                              handleStatusChange(
                                item
                              )
                            }
                            disabled={
                              statusLoadingId ===
                              item.id
                            }
                            className={`flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:opacity-50 ${
                              item.is_active
                                ? "border-gray-200 text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                                : "border-gray-200 text-gray-500 hover:border-green-200 hover:bg-green-50 hover:text-green-600"
                            }`}
                            title={
                              item.is_active
                                ? "Deactivate"
                                : "Activate"
                            }
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
