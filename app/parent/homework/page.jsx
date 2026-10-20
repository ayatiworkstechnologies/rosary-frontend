"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Loader2,
  Search,
  UserRound,
} from "lucide-react";

import {
  useSearchParams,
} from "next/navigation";

import {
  getParentChildren,
  getParentChildHomework,
} from "@/services/parentService";


// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(value) {
  if (!value) {
    return "--";
  }

  const date = new Date(
    `${value}T00:00:00`
  );

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}


// =========================================================
// PAGE
// =========================================================

export default function ParentHomeworkPage() {
  const searchParams =
    useSearchParams();

  const requestedStudentId =
    searchParams.get("student");

  // =======================================================
  // CHILDREN
  // =======================================================

  const [
    children,
    setChildren,
  ] = useState([]);

  const [
    selectedStudentId,
    setSelectedStudentId,
  ] = useState("");

  // =======================================================
  // HOMEWORK
  // =======================================================

  const [
    homework,
    setHomework,
  ] = useState([]);

  const [
    studentInfo,
    setStudentInfo,
  ] = useState(null);

  // =======================================================
  // SEARCH / FILTER
  // =======================================================

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("");

  // =======================================================
  // PAGINATION
  // =======================================================

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    pageSize,
    setPageSize,
  ] = useState(10);

  const [
    pagination,
    setPagination,
  ] = useState({
    page: 1,
    page_size: 10,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_previous: false,
  });

  // =======================================================
  // LOADING
  // =======================================================

  const [
    initialLoading,
    setInitialLoading,
  ] = useState(true);

  const [
    homeworkLoading,
    setHomeworkLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  // =======================================================
  // LOAD CHILDREN
  // =======================================================

  useEffect(() => {
    let cancelled = false;

    async function loadChildren() {
      try {
        setInitialLoading(true);
        setError("");

        const data =
          await getParentChildren();

        if (cancelled) {
          return;
        }

        const childList =
          Array.isArray(
            data?.children
          )
            ? data.children
            : [];

        setChildren(
          childList
        );

        // URL child
        if (
          requestedStudentId &&
          childList.some(
            (child) =>
              String(
                child.id
              ) ===
              String(
                requestedStudentId
              )
          )
        ) {
          setSelectedStudentId(
            String(
              requestedStudentId
            )
          );

          return;
        }

        // Parent login child
        if (
          childList.length > 0
        ) {
          const loginAdmissionNo =
            localStorage.getItem(
              "parent_login_admission_no"
            ) ||
            sessionStorage.getItem(
              "parent_login_admission_no"
            );

          const loginChild =
            childList.find(
              (child) =>
                String(
                  child.admission_no ||
                    ""
                ).trim() ===
                String(
                  loginAdmissionNo ||
                    ""
                ).trim()
            );

          const selectedChild =
            loginChild ||
            childList[0];

          setSelectedStudentId(
            String(
              selectedChild.id
            )
          );
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Load children error:",
          err
        );

        setError(
          err?.response?.data
            ?.detail ||
            err?.message ||
            "Unable to load children."
        );
      } finally {
        if (!cancelled) {
          setInitialLoading(
            false
          );
        }
      }
    }

    loadChildren();

    return () => {
      cancelled = true;
    };
  }, [
    requestedStudentId,
  ]);

  // =======================================================
  // LOAD HOMEWORK
  // =======================================================

  useEffect(() => {
    if (!selectedStudentId) {
      return;
    }

    let cancelled = false;

    const timer =
      setTimeout(
        async () => {
          try {
            setHomeworkLoading(
              true
            );

            setError("");

            const data =
              await getParentChildHomework(
                selectedStudentId,
                {
                  page,
                  page_size:
                    pageSize,
                  search:
                    search.trim(),
                }
              );

            if (cancelled) {
              return;
            }

            // =================================================
            // HOMEWORK LIST
            // =================================================

            const homeworkList =
              Array.isArray(
                data?.homework
              )
                ? data.homework
                : Array.isArray(
                      data?.data
                    )
                  ? data.data
                  : Array.isArray(
                        data
                      )
                    ? data
                    : [];

            setHomework(
              homeworkList
            );

            // =================================================
            // STUDENT INFO
            // =================================================

            setStudentInfo({
              student_name:
                data?.student_name ||
                "",

              admission_no:
                data?.admission_no ||
                "",

              class_name:
                data?.class_name ||
                "",
            });

            // =================================================
            // PAGINATION
            // =================================================

            const meta =
              data?.pagination ||
              {};

            const currentPage =
              Number(
                meta.page ??
                  data?.page ??
                  page
              );

            const currentPageSize =
              Number(
                meta.page_size ??
                  data?.page_size ??
                  pageSize
              );

            const total =
              Number(
                meta.total ??
                  data?.total ??
                  homeworkList.length
              );

            const totalPages =
              Number(
                meta.total_pages ??
                  data?.total_pages ??
                  (
                    total > 0
                      ? Math.ceil(
                          total /
                            currentPageSize
                        )
                      : 0
                  )
              );

            const hasNext =
              meta.has_next ??
              data?.has_next ??
              (
                currentPage <
                totalPages
              );

            const hasPrevious =
              meta.has_previous ??
              data?.has_previous ??
              (
                currentPage > 1
              );

            setPagination({
              page:
                currentPage,

              page_size:
                currentPageSize,

              total,

              total_pages:
                totalPages,

              has_next:
                hasNext,

              has_previous:
                hasPrevious,
            });
          } catch (err) {
            if (cancelled) {
              return;
            }

            console.error(
              "Parent homework error:",
              err
            );

            setHomework([]);

            setStudentInfo(
              null
            );

            setPagination({
              page: 1,
              page_size:
                pageSize,
              total: 0,
              total_pages: 0,
              has_next:
                false,
              has_previous:
                false,
            });

            setError(
              err?.response?.data
                ?.detail ||
                err?.message ||
                "Unable to load homework."
            );
          } finally {
            if (!cancelled) {
              setHomeworkLoading(
                false
              );
            }
          }
        },
        300
      );

    return () => {
      cancelled = true;

      clearTimeout(
        timer
      );
    };
  }, [
    selectedStudentId,
    page,
    pageSize,
    search,
  ]);

  // =======================================================
  // STATUS FILTER
  // =======================================================

  const filteredHomework =
    useMemo(() => {
      if (!statusFilter) {
        return homework;
      }

      return homework.filter(
        (item) =>
          item.status ===
          statusFilter
      );
    }, [
      homework,
      statusFilter,
    ]);

  // =======================================================
  // CURRENT PAGE COUNTS
  // =======================================================

  const activeCount =
    homework.filter(
      (item) =>
        item.status ===
        "ACTIVE"
    ).length;

  const upcomingCount =
    homework.filter(
      (item) =>
        item.status ===
        "UPCOMING"
    ).length;

  const overdueCount =
    homework.filter(
      (item) =>
        item.status ===
        "OVERDUE"
    ).length;

  // =======================================================
  // CHILD CHANGE
  // =======================================================

  const handleChildChange = (
    event
  ) => {
    setSelectedStudentId(
      event.target.value
    );

    setPage(1);

    setSearch("");

    setStatusFilter("");

    setError("");
  };

  // =======================================================
  // SEARCH CHANGE
  // =======================================================

  const handleSearchChange = (
    event
  ) => {
    setSearch(
      event.target.value
    );

    setPage(1);
  };

  // =======================================================
  // PAGE SIZE CHANGE
  // =======================================================

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

  // =======================================================
  // RECORD RANGE
  // =======================================================

  const startRecord =
    pagination.total > 0
      ? (
          pagination.page -
          1
        ) *
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

  // =======================================================
  // INITIAL LOADING
  // =======================================================

  if (initialLoading) {
    return (
      <div className="flex min-h-[450px] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={32}
            className="mx-auto animate-spin text-[#0075FF]"
          />

          <p className="mt-3 text-sm text-slate-500">
            Loading homework...
          </p>
        </div>
      </div>
    );
  }

  // =======================================================
  // UI
  // =======================================================

  return (
    <div className="mx-auto max-w-[1400px]">
      {/* HEADER */}

      <div>
        <h1 className="text-2xl font-bold text-[#0B3A67]">
          Homework
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View your child&apos;s
          homework and assignments.
        </p>
      </div>

      {/* CHILD SELECTOR */}

      <section className="mt-6 rounded-2xl border border-[#E4EDF7] bg-white p-4 shadow-sm">
        <label className="mb-2 block text-xs font-semibold text-[#0B3A67]">
          Select Child
        </label>

        <div className="relative max-w-[420px]">
          <select
            value={
              selectedStudentId
            }
            onChange={
              handleChildChange
            }
            className="w-full appearance-none rounded-xl border border-[#DCE8F5] bg-white px-4 py-3 pr-10 text-sm font-semibold text-[#0B3A67] outline-none focus:border-[#0075FF]"
          >
            {children.length ===
              0 && (
              <option value="">
                No children linked
              </option>
            )}

            {children.map(
              (child) => (
                <option
                  key={
                    child.id
                  }
                  value={
                    child.id
                  }
                >
                  {
                    child.full_name
                  }
                  {" - "}
                  {
                    child.class_name ||
                    "--"
                  }
                </option>
              )
            )}
          </select>

          <ChevronDown
            size={17}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#0075FF]"
          />
        </div>
      </section>

      {/* ERROR */}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* HOMEWORK LOADING */}

      {homeworkLoading && (
        <div className="mt-5 flex items-center justify-center gap-3 rounded-2xl border border-[#E4EDF7] bg-white py-14 text-sm text-slate-500">
          <Loader2
            size={20}
            className="animate-spin text-[#0075FF]"
          />

          Loading homework...
        </div>
      )}

      {!homeworkLoading &&
        studentInfo && (
        <>
          {/* CHILD INFO */}

          <section className="mt-5 rounded-2xl border border-[#E4EDF7] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EAF4FF] text-[#0075FF]">
                <UserRound
                  size={21}
                />
              </div>

              <div>
                <h2 className="font-bold text-[#0B3A67]">
                  {studentInfo.student_name ||
                    "Student"}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  {studentInfo.class_name ||
                    "--"}

                  {" • "}

                  {studentInfo.admission_no ||
                    "--"}
                </p>
              </div>
            </div>
          </section>

          {/* SUMMARY */}

          <section className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <SummaryCard
              title="Total Homework"
              value={
                pagination.total
              }
              icon={
                BookOpen
              }
              iconClass="bg-[#EAF4FF] text-[#0075FF]"
            />

            <SummaryCard
              title="Active This Page"
              value={
                activeCount
              }
              icon={
                FileText
              }
              iconClass="bg-green-100 text-green-600"
            />

            <SummaryCard
              title="Upcoming This Page"
              value={
                upcomingCount
              }
              icon={
                CalendarDays
              }
              iconClass="bg-purple-100 text-purple-600"
            />

            <SummaryCard
              title="Overdue This Page"
              value={
                overdueCount
              }
              icon={
                CalendarDays
              }
              iconClass="bg-red-100 text-red-500"
            />
          </section>

          {/* SEARCH + FILTER */}

          <section className="mt-5 flex flex-col gap-3 rounded-2xl border border-[#E4EDF7] bg-white p-4 shadow-sm sm:flex-row">
            <div className="flex flex-1 items-center rounded-xl border border-[#DCE8F5] px-3">
              <Search
                size={17}
                className="text-slate-400"
              />

              <input
                value={search}
                onChange={
                  handleSearchChange
                }
                placeholder="Search homework..."
                className="w-full bg-transparent px-3 py-3 text-sm outline-none"
              />
            </div>

            <select
              value={
                statusFilter
              }
              onChange={(
                event
              ) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="rounded-xl border border-[#DCE8F5] bg-white px-4 py-3 text-sm font-medium text-[#0B3A67] outline-none focus:border-[#0075FF] sm:w-[210px]"
            >
              <option value="">
                All on This Page
              </option>

              <option value="ACTIVE">
                Active
              </option>

              <option value="UPCOMING">
                Upcoming
              </option>

              <option value="OVERDUE">
                Overdue
              </option>
            </select>
          </section>

          {/* RANGE */}

          {pagination.total >
            0 && (
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {
                    startRecord
                  }
                </span>
                {" - "}
                <span className="font-semibold text-slate-700">
                  {
                    endRecord
                  }
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {
                    pagination.total
                  }
                </span>{" "}
                homework items
              </p>

              <p className="text-xs text-slate-400">
                Page{" "}
                {
                  pagination.page
                }{" "}
                of{" "}
                {
                  pagination.total_pages
                }
              </p>
            </div>
          )}

          {/* HOMEWORK CARDS */}

          {filteredHomework.length >
          0 ? (
            <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredHomework.map(
                (item) => (
                  <HomeworkCard
                    key={
                      item.id
                    }
                    item={
                      item
                    }
                  />
                )
              )}
            </section>
          ) : (
            <div className="mt-5 rounded-2xl border border-[#E4EDF7] bg-white py-16 text-center shadow-sm">
              <BookOpen
                size={40}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-3 font-semibold text-[#0B3A67]">
                No homework found
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                {search.trim() ||
                statusFilter
                  ? "No homework matches the current filters."
                  : "Homework assigned by teachers will appear here."}
              </p>
            </div>
          )}

          {/* PAGINATION */}

          {pagination.total >
            0 && (
            <section className="mt-5 flex flex-col gap-4 rounded-2xl border border-[#E4EDF7] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Page{" "}
                <span className="font-semibold text-[#0B3A67]">
                  {
                    pagination.page
                  }
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[#0B3A67]">
                  {
                    pagination.total_pages
                  }
                </span>
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={
                    pageSize
                  }
                  onChange={
                    handlePageSizeChange
                  }
                  className="h-10 rounded-xl border border-[#DCE8F5] bg-white px-3 text-sm text-slate-600 outline-none focus:border-[#0075FF]"
                >
                  <option
                    value={10}
                  >
                    10 / page
                  </option>

                  <option
                    value={20}
                  >
                    20 / page
                  </option>

                  <option
                    value={50}
                  >
                    50 / page
                  </option>
                </select>

                <button
                  type="button"
                  disabled={
                    !pagination.has_previous ||
                    homeworkLoading
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        Math.max(
                          1,
                          current -
                            1
                        )
                    )
                  }
                  className="inline-flex h-10 items-center gap-1 rounded-xl border border-[#DCE8F5] bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft
                    size={16}
                  />

                  Previous
                </button>

                <button
                  type="button"
                  disabled={
                    !pagination.has_next ||
                    homeworkLoading
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        current +
                        1
                    )
                  }
                  className="inline-flex h-10 items-center gap-1 rounded-xl border border-[#DCE8F5] bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next

                  <ChevronRight
                    size={16}
                  />
                </button>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}


// =========================================================
// HOMEWORK CARD
// =========================================================

function HomeworkCard({
  item,
}) {
  return (
    <article className="rounded-2xl border border-[#E4EDF7] bg-white p-5 shadow-sm transition hover:border-[#0075FF]/30 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF4FF] text-[#0075FF]">
          <BookOpen
            size={20}
          />
        </div>

        <StatusBadge
          status={
            item.status
          }
        />
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#0075FF]">
        {item.subject ||
          "Subject"}
      </p>

      <h2 className="mt-1 text-base font-bold text-[#0B3A67]">
        {item.title}
      </h2>

      {item.description && (
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {
            item.description
          }
        </p>
      )}

      <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
        <InfoRow
          icon={
            CalendarDays
          }
          label="Assigned"
          value={formatDate(
            item.assigned_date
          )}
        />

        <InfoRow
          icon={
            CalendarDays
          }
          label="Due"
          value={formatDate(
            item.due_date
          )}
        />

        <InfoRow
          icon={
            UserRound
          }
          label="Teacher"
          value={
            item.teacher_name ||
            "Teacher"
          }
        />
      </div>

      {item.attachment_url && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <a
            href={
              item.attachment_url
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0075FF] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#0065DD]"
          >
            <Download
              size={15}
            />

            View Attachment
          </a>
        </div>
      )}
    </article>
  );
}


// =========================================================
// STATUS BADGE
// =========================================================

function StatusBadge({
  status,
}) {
  const styles = {
    ACTIVE:
      "bg-green-50 text-green-600",

    UPCOMING:
      "bg-purple-50 text-purple-600",

    OVERDUE:
      "bg-red-50 text-red-500",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-[10px] font-bold ${
        styles[status] ||
        "bg-slate-100 text-slate-500"
      }`}
    >
      {status || "UNKNOWN"}
    </span>
  );
}


// =========================================================
// INFO ROW
// =========================================================

function InfoRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon
        size={14}
        className="shrink-0 text-[#0075FF]"
      />

      <span className="text-[11px] text-slate-400">
        {label}:
      </span>

      <span className="text-[11px] font-semibold text-slate-600">
        {value}
      </span>
    </div>
  );
}


// =========================================================
// SUMMARY CARD
// =========================================================

function SummaryCard({
  title,
  value,
  icon: Icon,
  iconClass,
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#E4EDF7] bg-white p-4 shadow-sm">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
      >
        <Icon
          size={20}
        />
      </div>

      <div>
        <p className="text-[11px] text-slate-500">
          {title}
        </p>

        <p className="mt-1 text-xl font-bold text-[#0B3A67]">
          {value}
        </p>
      </div>
    </div>
  );
}