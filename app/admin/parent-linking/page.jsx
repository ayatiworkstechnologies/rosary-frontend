
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";


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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const PAGE_SIZE = 20;

export default function AdminParentLinkingPage() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const [pagination, setPagination] = useState({
    page: 1,
    page_size: PAGE_SIZE,
    total: 0,
    total_pages: 1,
    has_next: false,
    has_previous: false,
  });

  const [summary, setSummary] = useState({
    total_links: 0,
    parents_linked: 0,
    students_linked: 0,
  });

  // =====================================================
  // SEARCH DEBOUNCE
  // =====================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // =====================================================
  // LOAD PARENT LINKS
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    async function loadLinks() {
      try {
        setLoading(true);
        setError("");

        const response = await getAdminParentLinks({
          page,
          page_size: PAGE_SIZE,
          search: debouncedSearch,
        });

        if (cancelled) return;

        const records = Array.isArray(response?.data)
          ? response.data
          : [];

        const paginationData = response?.pagination || {};
        const summaryData = response?.summary || {};

        const total = Number(
          paginationData.total ?? response?.total ?? 0
        );

        const totalPages = Math.max(
          1,
          Number(
            paginationData.total_pages ??
              Math.ceil(total / PAGE_SIZE)
          )
        );

        setLinks(records);

        setPagination({
          page: Number(paginationData.page ?? page),
          page_size: Number(
            paginationData.page_size ?? PAGE_SIZE
          ),
          total,
          total_pages: totalPages,
          has_next:
            paginationData.has_next ??
            page < totalPages,
          has_previous:
            paginationData.has_previous ??
            page > 1,
        });

        setSummary({
          total_links: Number(
            summaryData.total_links ?? total
          ),
          parents_linked: Number(
            summaryData.parents_linked ?? 0
          ),
          students_linked: Number(
            summaryData.students_linked ?? 0
          ),
        });

        if (page > totalPages) {
          setPage(totalPages);
        }
      } catch (err) {
        if (cancelled) return;

        console.error("Load parent links error:", err);

        setError(
          err?.message || "Unable to load parent links."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadLinks();

    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, refreshKey]);

  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  // =====================================================
  // DELETE / UNLINK
  // =====================================================

  const handleDelete = async (item) => {
    if (deletingId !== null) return;

    const studentName =
      item.student?.full_name || "this student";

    const confirmed = window.confirm(
      `Unlink this parent from ${studentName}?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(item.id);

      await deleteAdminParentLink(item.id);

      if (links.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        handleRefresh();
      }
    } catch (err) {
      console.error("Unlink parent error:", err);

      window.alert(
        err?.message || "Unable to unlink parent."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = Math.max(
    1,
    pagination.total_pages
  );

  const pageNumbers = useMemo(() => {
    const pages = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);

    for (let number = adjustedStart; number <= end; number++) {
      pages.push(number);
    }

    return pages;
  }, [page, totalPages]);

  const goToPage = (nextPage) => {
    if (
      loading ||
      nextPage < 1 ||
      nextPage > totalPages ||
      nextPage === page
    ) {
      return;
    }

    setPage(nextPage);
  };

  const startRecord =
    pagination.total === 0
      ? 0
      : (page - 1) * PAGE_SIZE + 1;

  const endRecord = Math.min(
    page * PAGE_SIZE,
    pagination.total
  );

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      <section className="mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0B3A67] md:text-3xl">
              Parent Linking
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Link parents with their children and manage
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

      {/* SUMMARY */}
      <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Links
          </p>

          <p className="mt-2 text-2xl font-bold text-[#0B3A67]">
            {summary.total_links.toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Parents Linked
          </p>

          <p className="mt-2 text-2xl font-bold text-[#0075FF]">
            {summary.parents_linked.toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Students Linked
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            {summary.students_linked.toLocaleString()}
          </p>
        </div>
      </section>

      {/* SEARCH + REFRESH */}
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
              placeholder="Search parent, student, admission number, relationship..."
              className="h-11 w-full rounded-xl border border-gray-200 pl-11 pr-4 text-sm text-gray-700 outline-none transition focus:border-[#0075FF]"
            />
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </section>

      {/* ERROR */}
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

      {/* TABLE */}
      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Parent",
                  "Student",
                  "Class",
                  "Relationship",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className={`px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500 ${
                      heading === "Actions"
                        ? "text-right"
                        : "text-left"
                    }`}
                  >
                    {heading}
                  </th>
                ))}
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
                      size={25}
                      className="mx-auto animate-spin text-[#0075FF]"
                    />

                    <p className="mt-3 text-sm text-gray-500">
                      Loading parent links...
                    </p>
                  </td>
                </tr>
              ) : links.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-14 text-center"
                  >
                    <Users
                      size={27}
                      className="mx-auto text-[#0075FF]"
                    />

                    <p className="mt-3 font-semibold text-gray-700">
                      No parent links found
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      {debouncedSearch
                        ? "Try a different search."
                        : "Link a parent to a student to get started."}
                    </p>
                  </td>
                </tr>
              ) : (
                links.map((item) => (
                  <tr
                    key={item.id}
                    className="transition hover:bg-gray-50"
                  >
                    {/* PARENT */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#0075FF]">
                          <UserRound size={18} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {item.parent?.name ||
                              `Parent #${item.parent_user_id}`}
                          </p>

                          <p className="mt-0.5 text-xs text-gray-500">
                            {item.parent?.phone || "No phone"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* STUDENT */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                          <GraduationCap size={18} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {item.student?.full_name ||
                              "Unknown Student"}
                          </p>

                          <p className="mt-0.5 text-xs text-gray-500">
                            {item.student?.admission_no || "-"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* CLASS */}
                    <td className="px-6 py-4">
                      {item.student?.class ? (
                        <div>
                          <p className="text-sm font-semibold text-gray-700">
                            {item.student.class.name || "-"}
                            {" - "}
                            {item.student.class.section || "-"}
                          </p>

                          <p className="mt-0.5 text-xs text-gray-400">
                            {item.student.class.academic_year ||
                              "-"}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">
                          Not Assigned
                        </span>
                      )}
                    </td>

                    {/* RELATIONSHIP */}
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#0075FF]">
                        {item.relationship || "Guardian"}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/parent-linking/${item.id}/edit`}
                          title="Edit Link"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0075FF]"
                        >
                          <Pencil size={16} />
                        </Link>

                        <button
                          type="button"
                          title="Unlink Parent"
                          onClick={() => handleDelete(item)}
                          disabled={deletingId !== null}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === item.id ? (
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
        <div className="flex flex-col gap-4 border-t border-gray-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-800">
              {startRecord}–{endRecord}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-800">
              {pagination.total.toLocaleString()}
            </span>{" "}
            links
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={loading || page <= 1}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            {pageNumbers.map((number) => (
              <button
                key={number}
                type="button"
                onClick={() => goToPage(number)}
                disabled={loading}
                aria-current={
                  page === number ? "page" : undefined
                }
                className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-semibold transition disabled:cursor-not-allowed ${
                  page === number
                    ? "bg-[#0075FF] text-white"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {number}
              </button>
            ))}

            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={loading || page >= totalPages}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>

          <p className="text-sm text-gray-500">
            Page{" "}
            <span className="font-semibold text-gray-800">
              {page}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-800">
              {totalPages}
            </span>
          </p>
        </div>
      </section>
    </>
  );
}

