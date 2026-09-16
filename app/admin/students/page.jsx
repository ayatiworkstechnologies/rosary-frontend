"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import AdminShell from "@/components/admin/AdminShell";

import {
  getAdminStudents,
  updateAdminStudentStatus,
} from "@/services/adminStudentService";

import {
  getAdminClasses,
} from "@/services/adminClassService";

import {
  Plus,
  Search,
  Pencil,
  GraduationCap,
  RefreshCw,
  Power,
  PowerOff,
  AlertCircle,
  Filter,
} from "lucide-react";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);

  const [classes, setClasses] = useState([]);

  const [loading, setLoading] = useState(true);

  const [statusLoadingId, setStatusLoadingId] =
    useState(null);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [classFilter, setClassFilter] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  // =====================================================
  // INITIAL PAGE LOAD
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      try {
        const [
          studentsResponse,
          classesResponse,
        ] = await Promise.all([
          getAdminStudents(),
          getAdminClasses(),
        ]);

        if (cancelled) {
          return;
        }

        setStudents(
          Array.isArray(studentsResponse?.data)
            ? studentsResponse.data
            : []
        );

        setClasses(
          Array.isArray(classesResponse?.data)
            ? classesResponse.data
            : []
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Students page loading error:",
          error
        );

        setError(
          error?.message ||
            "Unable to load students."
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

      const [
        studentsResponse,
        classesResponse,
      ] = await Promise.all([
        getAdminStudents(),
        getAdminClasses(),
      ]);

      setStudents(
        Array.isArray(studentsResponse?.data)
          ? studentsResponse.data
          : []
      );

      setClasses(
        Array.isArray(classesResponse?.data)
          ? classesResponse.data
          : []
      );
    } catch (error) {
      console.error(
        "Refresh students error:",
        error
      );

      setError(
        error?.message ||
          "Unable to load students."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FILTER STUDENTS
  // =====================================================

  const filteredStudents = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    return students.filter((student) => {
      const fullName =
        student.full_name
          ?.toLowerCase() || "";

      const admissionNo =
        student.admission_no
          ?.toLowerCase() || "";

      const rollNo =
        student.roll_no
          ?.toLowerCase() || "";

      const matchesSearch =
        !keyword ||
        fullName.includes(keyword) ||
        admissionNo.includes(keyword) ||
        rollNo.includes(keyword);

      const matchesClass =
        !classFilter ||
        String(student.class_id) ===
          String(classFilter);

      const matchesStatus =
        statusFilter === ""
          ? true
          : statusFilter === "active"
          ? student.is_active === true
          : student.is_active === false;

      return (
        matchesSearch &&
        matchesClass &&
        matchesStatus
      );
    });
  }, [
    students,
    search,
    classFilter,
    statusFilter,
  ]);

  // =====================================================
  // ACTIVE / INACTIVE
  // =====================================================

  const handleStatusChange = async (
    student
  ) => {
    const newStatus =
      !student.is_active;

    const confirmed =
      window.confirm(
        newStatus
          ? `Activate ${student.full_name}?`
          : `Deactivate ${student.full_name}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setStatusLoadingId(
        student.id
      );

      await updateAdminStudentStatus(
        student.id,
        newStatus
      );

      setStudents((current) =>
        current.map((item) =>
          item.id === student.id
            ? {
                ...item,
                is_active: newStatus,
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Student status update error:",
        error
      );

      window.alert(
        error?.message ||
          "Unable to update student status."
      );
    } finally {
      setStatusLoadingId(null);
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
              Students
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage student profiles,
              classes and account status.
            </p>
          </div>

          <Link
            href="/admin/students/add"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0075FF] px-5 text-sm font-semibold text-white transition hover:bg-[#0067DF]"
          >
            <Plus size={18} />

            Add Student
          </Link>
        </div>
      </section>

      {/* ================================================= */}
      {/* SUMMARY */}
      {/* ================================================= */}

      <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total */}

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Students
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {students.length}
          </p>
        </div>

        {/* Active */}

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Active
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            {
              students.filter(
                (item) =>
                  item.is_active
              ).length
            }
          </p>
        </div>

        {/* Inactive */}

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Inactive
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-600">
            {
              students.filter(
                (item) =>
                  !item.is_active
              ).length
            }
          </p>
        </div>
      </section>

      {/* ================================================= */}
      {/* FILTERS */}
      {/* ================================================= */}

      <section className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_180px_auto]">
          {/* Search */}

          <div className="relative">
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
              placeholder="Search student, admission no or roll no..."
              className="h-11 w-full rounded-xl border border-gray-200 pl-11 pr-4 text-sm text-gray-700 outline-none transition focus:border-[#0075FF]"
            />
          </div>

          {/* Class Filter */}

          <div className="relative">
            <Filter
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <select
              value={classFilter}
              onChange={(e) =>
                setClassFilter(
                  e.target.value
                )
              }
              className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-700 outline-none transition focus:border-[#0075FF]"
            >
              <option value="">
                All Classes
              </option>

              {classes.map(
                (item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name} -{" "}
                    {item.section} (
                    {
                      item.academic_year
                    }
                    )
                  </option>
                )
              )}
            </select>
          </div>

          {/* Status Filter */}

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none transition focus:border-[#0075FF]"
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
              Unable to load students
            </p>

            <p className="mt-1 text-xs text-red-600">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* STUDENTS TABLE */}
      {/* ================================================= */}

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            {/* Table Header */}

            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Student
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Admission No
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Roll No
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Gender
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Class
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Table Body */}

            <tbody className="divide-y divide-gray-100">
              {/* Loading */}

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
                      Loading students...
                    </p>
                  </td>
                </tr>
              ) : filteredStudents.length ===
                0 ? (
                /* Empty */
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-14"
                  >
                    <div className="text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0075FF]">
                        <GraduationCap
                          size={27}
                        />
                      </div>

                      <p className="mt-3 font-semibold text-gray-700">
                        No students found
                      </p>

                      <p className="mt-1 text-sm text-gray-400">
                        Try changing the
                        search or filter.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map(
                  (student) => (
                    <tr
                      key={student.id}
                      className="transition hover:bg-gray-50"
                    >
                      {/* Student */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-[#0075FF]">
                            {student.full_name
                              ?.charAt(0)
                              .toUpperCase() ||
                              "S"}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {
                                student.full_name
                              }
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Admission */}

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {
                          student.admission_no
                        }
                      </td>

                      {/* Roll */}

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.roll_no ||
                          "-"}
                      </td>

                      {/* Gender */}

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.gender ||
                          "-"}
                      </td>

                      {/* Class */}

                      <td className="px-6 py-4">
                        {student.class ? (
                          <div>
                            <p className="text-sm font-semibold text-gray-700">
                              {
                                student
                                  .class
                                  .name
                              }{" "}
                              -{" "}
                              {
                                student
                                  .class
                                  .section
                              }
                            </p>

                            <p className="mt-0.5 text-xs text-gray-400">
                              {
                                student
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

                      {/* Status */}

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            student.is_active
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {student.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      {/* Actions */}

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {/* Edit */}

                          <Link
                            href={`/admin/students/${student.id}/edit`}
                            title="Edit Student"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0075FF]"
                          >
                            <Pencil
                              size={16}
                            />
                          </Link>

                          {/* Status */}

                          <button
                            type="button"
                            title={
                              student.is_active
                                ? "Deactivate Student"
                                : "Activate Student"
                            }
                            onClick={() =>
                              handleStatusChange(
                                student
                              )
                            }
                            disabled={
                              statusLoadingId ===
                              student.id
                            }
                            className={`flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-50 ${
                              student.is_active
                                ? "border-gray-200 text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                                : "border-gray-200 text-gray-500 hover:border-green-200 hover:bg-green-50 hover:text-green-600"
                            }`}
                          >
                            {statusLoadingId ===
                            student.id ? (
                              <RefreshCw
                                size={16}
                                className="animate-spin"
                              />
                            ) : student.is_active ? (
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