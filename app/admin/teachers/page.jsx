"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import AdminShell from "@/components/admin/AdminShell";

import {
  getAdminTeachers,
  updateAdminTeacherStatus,
} from "@/services/adminTeacherService";

import {
  Plus,
  Search,
  Pencil,
  Users,
  RefreshCw,
  Power,
  PowerOff,
  AlertCircle,
  BookOpen,
} from "lucide-react";

export default function AdminTeachersPage() {
  const [teachers, setTeachers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [statusLoadingId, setStatusLoadingId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      try {
        const response =
          await getAdminTeachers();

        if (cancelled) {
          return;
        }

        setTeachers(
          Array.isArray(response?.data)
            ? response.data
            : []
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Load teachers error:",
          error
        );

        setError(
          error?.message ||
            "Unable to load teachers."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInitialData();

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
        await getAdminTeachers();

      setTeachers(
        Array.isArray(response?.data)
          ? response.data
          : []
      );
    } catch (error) {
      setError(
        error?.message ||
          "Unable to load teachers."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FILTER
  // =====================================================

  const filteredTeachers =
    useMemo(() => {
      const keyword = search
        .trim()
        .toLowerCase();

      return teachers.filter(
        (teacher) => {
          const searchText = `
            ${teacher.name || ""}
            ${teacher.username || ""}
            ${teacher.employee_id || ""}
            ${teacher.email || ""}
            ${teacher.department || ""}
            ${teacher.designation || ""}
          `.toLowerCase();

          const matchesSearch =
            !keyword ||
            searchText.includes(keyword);

          const matchesStatus =
            statusFilter === ""
              ? true
              : statusFilter === "active"
              ? teacher.is_active
              : !teacher.is_active;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      teachers,
      search,
      statusFilter,
    ]);

  // =====================================================
  // STATUS
  // =====================================================

  const handleStatusChange = async (
    teacher
  ) => {
    const newStatus =
      !teacher.is_active;

    const confirmed =
      window.confirm(
        newStatus
          ? `Activate ${teacher.name}?`
          : `Deactivate ${teacher.name}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setStatusLoadingId(
        teacher.id
      );

      await updateAdminTeacherStatus(
        teacher.id,
        newStatus
      );

      setTeachers((current) =>
        current.map((item) =>
          item.id === teacher.id
            ? {
                ...item,
                is_active: newStatus,
              }
            : item
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

  return (
    <AdminShell>
      {/* HEADER */}

      <section className="mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Teachers
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage teachers, login
              access and class assignments.
            </p>
          </div>

          <Link
            href="/admin/teachers/add"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0075FF] px-5 text-sm font-semibold text-white hover:bg-[#0067DF]"
          >
            <Plus size={18} />

            Add Teacher
          </Link>

        </div>
      </section>

      {/* SUMMARY */}

      <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Teachers
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {teachers.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Active
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            {
              teachers.filter(
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
              teachers.filter(
                (item) =>
                  !item.is_active
              ).length
            }
          </p>
        </div>

      </section>

      {/* FILTER */}

      <section className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">

        <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">

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
              placeholder="Search teacher..."
              className="h-11 w-full rounded-xl border border-gray-200 pl-11 pr-4 text-sm outline-none focus:border-[#0075FF]"
            />

          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#0075FF]"
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

      {/* ERROR */}

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
                  Teacher
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Employee ID
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Department
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Designation
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Classes
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
                    colSpan={7}
                    className="px-6 py-14 text-center"
                  >
                    <RefreshCw
                      size={25}
                      className="mx-auto animate-spin text-[#0075FF]"
                    />

                    <p className="mt-3 text-sm text-gray-500">
                      Loading teachers...
                    </p>
                  </td>
                </tr>
              ) : filteredTeachers.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-14 text-center"
                  >
                    <Users
                      size={30}
                      className="mx-auto text-[#0075FF]"
                    />

                    <p className="mt-3 font-semibold text-gray-700">
                      No teachers found
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTeachers.map(
                  (teacher) => (
                    <tr
                      key={teacher.id}
                      className="hover:bg-gray-50"
                    >

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 font-semibold text-[#0075FF]">
                            {teacher.name
                              ?.charAt(0)
                              .toUpperCase() ||
                              "T"}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {teacher.name}
                            </p>

                            <p className="text-xs text-gray-500">
                              {teacher.username}
                            </p>
                          </div>

                        </div>

                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {teacher.employee_id}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {teacher.department ||
                          "-"}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {teacher.designation ||
                          "-"}
                      </td>

                      <td className="px-6 py-4">

                        <Link
                          href={`/admin/teachers/${teacher.id}/classes`}
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-[#0075FF] hover:bg-blue-100"
                        >
                          <BookOpen
                            size={14}
                          />

                          {teacher.class_count ||
                            0}{" "}
                          Classes
                        </Link>

                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            teacher.is_active
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {teacher.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>

                      </td>

                      <td className="px-6 py-4">

                        <div className="flex justify-end gap-2">

                          <Link
                            href={`/admin/teachers/${teacher.id}/edit`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-blue-50 hover:text-[#0075FF]"
                          >
                            <Pencil
                              size={16}
                            />
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(
                                teacher
                              )
                            }
                            disabled={
                              statusLoadingId ===
                              teacher.id
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            {statusLoadingId ===
                            teacher.id ? (
                              <RefreshCw
                                size={16}
                                className="animate-spin"
                              />
                            ) : teacher.is_active ? (
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