"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";


import {
  getAdminTeachers,
  updateAdminTeacherStatus,
} from "@/services/adminTeacherService";

import {
  AlertCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Power,
  PowerOff,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

export default function AdminTeachersPage() {
  const [teachers, setTeachers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [
    statusLoadingId,
    setStatusLoadingId,
  ] = useState(null);

  const [error, setError] =
    useState("");

  // =====================================================
  // FILTERS
  // =====================================================

  const [search, setSearch] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("");

  // =====================================================
  // PAGINATION
  // =====================================================

  const [page, setPage] =
    useState(1);

  const [pageSize, setPageSize] =
    useState(25);

  const [
    pagination,
    setPagination,
  ] = useState({
    page: 1,
    page_size: 25,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_previous: false,
  });

  // =====================================================
  // SUMMARY
  // =====================================================

  const [
    summary,
    setSummary,
  ] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  const [
    refreshKey,
    setRefreshKey,
  ] = useState(0);

  // =====================================================
  // LOAD TEACHER SUMMARY
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    async function loadTeacherSummary() {
      try {
        const [
          allResponse,
          activeResponse,
          inactiveResponse,
        ] = await Promise.all([
          getAdminTeachers({
            page: 1,
            page_size: 1,
          }),

          getAdminTeachers({
            page: 1,
            page_size: 1,
            is_active: true,
          }),

          getAdminTeachers({
            page: 1,
            page_size: 1,
            is_active: false,
          }),
        ]);

        if (cancelled) {
          return;
        }

        const allTotal =
          allResponse?.pagination
            ?.total ??
          allResponse?.total ??
          0;

        const activeTotal =
          activeResponse?.pagination
            ?.total ??
          activeResponse?.total ??
          0;

        const inactiveTotal =
          inactiveResponse?.pagination
            ?.total ??
          inactiveResponse?.total ??
          0;

        setSummary({
          total: allTotal,
          active: activeTotal,
          inactive: inactiveTotal,
        });
      } catch (err) {
        if (!cancelled) {
          console.error(
            "Teacher summary error:",
            err
          );
        }
      }
    }

    loadTeacherSummary();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  // =====================================================
  // LOAD TEACHERS
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(
      async () => {
        try {
          setLoading(true);
          setError("");

          const filters = {
            page,
            page_size:
              pageSize,
          };

          if (
            search.trim()
          ) {
            filters.search =
              search.trim();
          }

          if (
            statusFilter ===
            "active"
          ) {
            filters.is_active =
              true;
          }

          if (
            statusFilter ===
            "inactive"
          ) {
            filters.is_active =
              false;
          }

          const response =
            await getAdminTeachers(
              filters
            );

          if (cancelled) {
            return;
          }

          const teacherList =
            Array.isArray(
              response?.data
            )
              ? response.data
              : [];

          const responsePagination =
            response?.pagination ||
            {};

          setTeachers(
            teacherList
          );

          setPagination({
            page:
              responsePagination.page ??
              page,

            page_size:
              responsePagination.page_size ??
              pageSize,

            total:
              responsePagination.total ??
              0,

            total_pages:
              responsePagination.total_pages ??
              0,

            has_next:
              responsePagination.has_next ??
              false,

            has_previous:
              responsePagination.has_previous ??
              false,
          });
        } catch (err) {
          if (cancelled) {
            return;
          }

          console.error(
            "Load teachers error:",
            err
          );

          setTeachers([]);

          setPagination({
            page: 1,
            page_size:
              pageSize,
            total: 0,
            total_pages: 0,
            has_next: false,
            has_previous:
              false,
          });

          setError(
            err?.message ||
              "Unable to load teachers."
          );
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      },
      300
    );

    return () => {
      cancelled = true;

      clearTimeout(timer);
    };
  }, [
    search,
    statusFilter,
    page,
    pageSize,
    refreshKey,
  ]);

  // =====================================================
  // SEARCH CHANGE
  // =====================================================

  const handleSearchChange = (
    event
  ) => {
    setSearch(
      event.target.value
    );

    setPage(1);
  };

  // =====================================================
  // STATUS FILTER CHANGE
  // =====================================================

  const handleStatusFilterChange = (
    event
  ) => {
    setStatusFilter(
      event.target.value
    );

    setPage(1);
  };

  // =====================================================
  // PAGE SIZE CHANGE
  // =====================================================

  const handlePageSizeChange = (
    event
  ) => {
    setPageSize(
      Number(
        event.target.value
      )
    );

    setPage(1);
  };

  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = () => {
    setRefreshKey(
      (current) =>
        current + 1
    );
  };

  // =====================================================
  // STATUS UPDATE
  // =====================================================

  const handleStatusChange =
    async (teacher) => {
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

        setRefreshKey(
          (current) =>
            current + 1
        );
      } catch (err) {
        window.alert(
          err?.message ||
            "Unable to update status."
        );
      } finally {
        setStatusLoadingId(
          null
        );
      }
    };

  // =====================================================
  // PAGINATION DISPLAY
  // =====================================================

  const startRecord =
    pagination.total > 0
      ? (pagination.page -
          1) *
          pagination.page_size +
        1
      : 0;

  const endRecord =
    pagination.total > 0
      ? Math.min(
          pagination.page *
            pagination.page_size,
          pagination.total
        )
      : 0;

  // =====================================================
  // RENDER
  // =====================================================

  return (
      <div className="mx-auto w-full max-w-[1500px]">
        {/* HEADER */}

        <section className="mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0B3A67] md:text-3xl">
                Teachers
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage teachers,
                login access and
                class assignments.
              </p>
            </div>

            <Link
              href="/admin/teachers/add"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0075FF] px-5 text-sm font-semibold text-white transition hover:bg-[#0067DF]"
            >
              <Plus
                size={18}
              />

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

            <p className="mt-2 text-2xl font-bold text-[#0B3A67]">
              {
                summary.total
              }
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Active
            </p>

            <p className="mt-2 text-2xl font-bold text-green-600">
              {
                summary.active
              }
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Inactive
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-600">
              {
                summary.inactive
              }
            </p>
          </div>
        </section>

        {/* FILTERS */}

        <section className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
            {/* SEARCH */}

            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={
                  handleSearchChange
                }
                placeholder="Search teacher..."
                className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#0075FF]"
              />
            </div>

            {/* STATUS */}

            <select
              value={
                statusFilter
              }
              onChange={
                handleStatusFilterChange
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

            {/* REFRESH */}

            <button
              type="button"
              onClick={
                handleRefresh
              }
              disabled={
                loading
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            <AlertCircle
              size={18}
              className="shrink-0"
            />

            <span>
              {error}
            </span>
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
                        Loading
                        teachers...
                      </p>
                    </td>
                  </tr>
                ) : teachers.length ===
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
                        No teachers
                        found
                      </p>
                    </td>
                  </tr>
                ) : (
                  teachers.map(
                    (
                      teacher
                    ) => (
                      <tr
                        key={
                          teacher.id
                        }
                        className="hover:bg-gray-50"
                      >
                        {/* TEACHER */}

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 font-semibold text-[#0075FF]">
                              {teacher.name
                                ?.charAt(
                                  0
                                )
                                .toUpperCase() ||
                                "T"}
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-[240px] truncate text-sm font-semibold text-gray-800">
                                {
                                  teacher.name
                                }
                              </p>

                              <p className="max-w-[240px] truncate text-xs text-gray-500">
                                {
                                  teacher.username
                                }
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* EMPLOYEE ID */}

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {teacher.employee_id ||
                            "-"}
                        </td>

                        {/* DEPARTMENT */}

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {teacher.department ||
                            "-"}
                        </td>

                        {/* DESIGNATION */}

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {teacher.designation ||
                            "-"}
                        </td>

                        {/* CLASSES */}

                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/teachers/${teacher.id}/classes`}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-[#0075FF] transition hover:bg-blue-100"
                          >
                            <BookOpen
                              size={
                                14
                              }
                            />

                            {teacher.class_count ??
                              0}{" "}
                            Classes
                          </Link>
                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
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

                        {/* ACTIONS */}

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/admin/teachers/${teacher.id}/edit`}
                              title="Edit Teacher"
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0075FF]"
                            >
                              <Pencil
                                size={
                                  16
                                }
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
                              title={
                                teacher.is_active
                                  ? "Deactivate Teacher"
                                  : "Activate Teacher"
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {statusLoadingId ===
                              teacher.id ? (
                                <RefreshCw
                                  size={
                                    16
                                  }
                                  className="animate-spin"
                                />
                              ) : teacher.is_active ? (
                                <PowerOff
                                  size={
                                    16
                                  }
                                />
                              ) : (
                                <Power
                                  size={
                                    16
                                  }
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

          {/* PAGINATION */}

          {!loading &&
            pagination.total >
              0 && (
              <div className="flex flex-col gap-4 border-t border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                {/* RECORD COUNT */}

                <p className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-semibold text-gray-700">
                    {
                      startRecord
                    }
                  </span>
                  {" - "}
                  <span className="font-semibold text-gray-700">
                    {endRecord}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-700">
                    {
                      pagination.total
                    }
                  </span>
                </p>

                {/* PAGINATION CONTROLS */}

                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={
                      pageSize
                    }
                    onChange={
                      handlePageSizeChange
                    }
                    className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-600 outline-none focus:border-[#0075FF]"
                  >
                    <option
                      value={
                        25
                      }
                    >
                      25 / page
                    </option>

                    <option
                      value={
                        50
                      }
                    >
                      50 / page
                    </option>

                    <option
                      value={
                        100
                      }
                    >
                      100 / page
                    </option>
                  </select>

                  <button
                    type="button"
                    disabled={
                      !pagination.has_previous ||
                      loading
                    }
                    onClick={() =>
                      setPage(
                        (
                          current
                        ) =>
                          Math.max(
                            1,
                            current -
                              1
                          )
                      )
                    }
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft
                      size={
                        16
                      }
                    />

                    Previous
                  </button>

                  <span className="min-w-[90px] text-center text-sm font-medium text-gray-600">
                    Page{" "}
                    {
                      pagination.page
                    }{" "}
                    of{" "}
                    {
                      pagination.total_pages
                    }
                  </span>

                  <button
                    type="button"
                    disabled={
                      !pagination.has_next ||
                      loading
                    }
                    onClick={() =>
                      setPage(
                        (
                          current
                        ) =>
                          current +
                          1
                      )
                    }
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next

                    <ChevronRight
                      size={
                        16
                      }
                    />
                  </button>
                </div>
              </div>
            )}
        </section>
      </div>
  );
}