"use client";

import { DemoAdminFees } from "@/components/demo/DemoSections";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";


import {
  getAdminFees,
  updateAdminFeeStatus,
} from "@/services/adminFeeService";

import {
  Plus,
  Search,
  Pencil,
  RefreshCw,
  AlertCircle,
  IndianRupee,
  CreditCard,
  WalletCards,
  ReceiptIndianRupee,
  Power,
  PowerOff,
} from "lucide-react";


function formatCurrency(value) {
  const amount =
    Number(value || 0);

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }
  ).format(amount);
}


function getPaymentStatusStyle(
  status
) {
  switch (status) {
    case "PAID":
      return (
        "bg-green-50 text-green-700 " +
        "border-green-100"
      );

    case "PARTIAL":
      return (
        "bg-orange-50 text-orange-700 " +
        "border-orange-100"
      );

    default:
      return (
        "bg-red-50 text-red-600 " +
        "border-red-100"
      );
  }
}


export default function AdminFeesPage() {
  const [fees, setFees] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [debouncedSearch, setDebouncedSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [pageSize, setPageSize] =
    useState(20);

  const [refreshKey, setRefreshKey] =
    useState(0);

  const [pagination, setPagination] =
    useState({
      page: 1,
      page_size: 20,
      total: 0,
      total_pages: 0,
      has_next: false,
      has_previous: false,
    });

  const [
    paymentStatusFilter,
    setPaymentStatusFilter,
  ] = useState("");

  const [
    activeStatusFilter,
    setActiveStatusFilter,
  ] = useState("");

  const [
    statusLoadingId,
    setStatusLoadingId,
  ] = useState(null);


  // =====================================================
  // SEARCH DEBOUNCE
  // =====================================================

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [search]);


  // =====================================================
  // LOAD PAGINATED FEES
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    async function loadFees() {
      try {
        setLoading(true);
        setError("");

        const response =
          await getAdminFees({
            search: debouncedSearch,
            payment_status:
              paymentStatusFilter,
            is_active:
              activeStatusFilter === ""
                ? undefined
                : activeStatusFilter ===
                    "active",
            page,
            page_size: pageSize,
          });

        if (cancelled) {
          return;
        }

        setFees(
          Array.isArray(response?.data)
            ? response.data
            : []
        );

        const nextPagination =
          response?.pagination || {};

        setPagination({
          page:
            Number(nextPagination.page) ||
            page,
          page_size:
            Number(
              nextPagination.page_size
            ) || pageSize,
          total:
            Number(nextPagination.total) ||
            0,
          total_pages:
            Number(
              nextPagination.total_pages
            ) || 0,
          has_next:
            Boolean(
              nextPagination.has_next
            ),
          has_previous:
            Boolean(
              nextPagination.has_previous
            ),
        });

        if (
          nextPagination.total_pages > 0 &&
          page > nextPagination.total_pages
        ) {
          setPage(
            nextPagination.total_pages
          );
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Load fees error:",
          error
        );

        setError(
          error?.message ||
            "Unable to load fees."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadFees();

    return () => {
      cancelled = true;
    };
  }, [
    activeStatusFilter,
    debouncedSearch,
    page,
    pageSize,
    paymentStatusFilter,
    refreshKey,
  ]);


  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = () => {
    setRefreshKey((current) =>
      current + 1
    );
  };


  // =====================================================
  // SUMMARY
  // =====================================================

  const totals =
    useMemo(() => {
      return fees.reduce(
        (result, fee) => {
          if (!fee.is_active) {
            return result;
          }

          result.total += Number(
            fee.amount || 0
          );

          result.paid += Number(
            fee.paid_amount || 0
          );

          result.balance += Number(
            fee.balance_amount || 0
          );

          return result;
        },
        {
          total: 0,
          paid: 0,
          balance: 0,
        }
      );
    }, [fees]);

  const rangeStart =
    pagination.total === 0
      ? 0
      : (pagination.page - 1) *
          pagination.page_size +
        1;

  const rangeEnd =
    pagination.total === 0
      ? 0
      : Math.min(
          pagination.page *
            pagination.page_size,
          pagination.total
        );


  // =====================================================
  // STATUS
  // =====================================================

  const handleStatusChange =
    async (fee) => {
      const newStatus =
        !fee.is_active;

      const confirmed =
        window.confirm(
          newStatus
            ? `Activate "${fee.fee_title}"?`
            : `Deactivate "${fee.fee_title}"?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setStatusLoadingId(
          fee.id
        );

        await updateAdminFeeStatus(
          fee.id,
          newStatus
        );

        setFees((current) =>
          current.map((item) =>
            item.id === fee.id
              ? {
                  ...item,
                  is_active:
                    newStatus,
                }
              : item
          )
        );
      } catch (error) {
        window.alert(
          error?.message ||
            "Unable to update fee status."
        );
      } finally {
        setStatusLoadingId(null);
      }
    };


  return (
    <>
      <section className="mb-6">

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            <h1 className="text-2xl font-bold text-[#0B3A67] md:text-3xl">
              Fees Management
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage student fees,
              payments, balances and
              receipts.
            </p>

          </div>

          <Link
            href="/admin/fees/add"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0075FF] px-5 text-sm font-semibold text-white transition hover:bg-[#0067DF]"
          >
            <Plus size={18} />

            Add Fee
          </Link>

        </div>

      </section>


      {/* ========================================== */}
      {/* SUMMARY */}
      {/* ========================================== */}

      <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-500">
                Fee Records
              </p>

              <p className="mt-2 text-2xl font-bold text-[#0B3A67]">
                {pagination.total}
              </p>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0075FF]">
              <ReceiptIndianRupee
                size={21}
              />
            </div>

          </div>

        </div>


        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-500">
                Page Total
              </p>

              <p className="mt-2 text-xl font-bold text-[#0B3A67]">
                {formatCurrency(
                  totals.total
                )}
              </p>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0075FF]">
              <IndianRupee
                size={21}
              />
            </div>

          </div>

        </div>


        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-500">
                Page Paid
              </p>

              <p className="mt-2 text-xl font-bold text-green-600">
                {formatCurrency(
                  totals.paid
                )}
              </p>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <CreditCard size={21} />
            </div>

          </div>

        </div>


        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-500">
                Page Balance
              </p>

              <p className="mt-2 text-xl font-bold text-orange-600">
                {formatCurrency(
                  totals.balance
                )}
              </p>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <WalletCards size={21} />
            </div>

          </div>

        </div>

      </section>


      {/* ========================================== */}
      {/* FILTER */}
      {/* ========================================== */}

      <section className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">

        <div className="grid gap-3 lg:grid-cols-[1fr_170px_170px_auto]">

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
              placeholder="Search student, fee, admission no..."
              className="h-11 w-full rounded-xl border border-gray-200 pl-11 pr-4 text-sm outline-none transition focus:border-[#0075FF]"
            />

          </div>


          <select
            value={
              paymentStatusFilter
            }
            onChange={(e) =>
              {
                setPaymentStatusFilter(
                  e.target.value
                );
                setPage(1);
              }
            }
            className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#0075FF]"
          >

            <option value="">
              All Payments
            </option>

            <option value="PAID">
              Paid
            </option>

            <option value="PARTIAL">
              Partial
            </option>

            <option value="UNPAID">
              Unpaid
            </option>

          </select>


          <select
            value={
              activeStatusFilter
            }
            onChange={(e) =>
              {
                setActiveStatusFilter(
                  e.target.value
                );
                setPage(1);
              }
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
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
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


      {/* ========================================== */}
      {/* ERROR */}
      {/* ========================================== */}

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">

          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0"
          />

          {error}

        </div>
      )}


      {/* ========================================== */}
      {/* TABLE */}
      {/* ========================================== */}

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1300px]">

            <thead className="bg-gray-50">

              <tr>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Student
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Fee
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Amount
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Paid
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Balance
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Due Date
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Payment
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Status
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-gray-500">
                  Actions
                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-gray-100">

              {loading ? (

                <tr>

                  <td
                    colSpan={9}
                    className="px-6 py-14 text-center"
                  >

                    <RefreshCw
                      size={26}
                      className="mx-auto animate-spin text-[#0075FF]"
                    />

                    <p className="mt-3 text-sm text-gray-500">
                      Loading fees...
                    </p>

                  </td>

                </tr>

              ) : fees.length ===
                0 ? (

                <tr>

                  <td
                    colSpan={9}
                    className="px-6 py-14 text-center"
                  >

                    <ReceiptIndianRupee
                      size={32}
                      className="mx-auto text-[#0075FF]"
                    />

                    <p className="mt-3 font-semibold text-gray-700">
                      No fee records found
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      Add a fee record to
                      get started.
                    </p>

                  </td>

                </tr>

              ) : (

                fees.map(
                  (fee) => (

                    <tr
                      key={fee.id}
                      className="transition hover:bg-gray-50"
                    >

                      {/* STUDENT */}

                      <td className="px-5 py-4">

                        <p className="text-sm font-semibold text-gray-800">
                          {fee.student
                            ?.full_name ||
                            "-"}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {
                            fee.student
                              ?.admission_no
                          }
                        </p>

                        {fee.student
                          ?.class && (

                          <p className="mt-1 text-xs text-gray-400">
                            {
                              fee.student
                                .class
                                .name
                            }{" "}
                            -{" "}
                            {
                              fee.student
                                .class
                                .section
                            }
                          </p>

                        )}

                      </td>


                      {/* FEE */}

                      <td className="px-5 py-4">

                        <p className="text-sm font-semibold text-gray-700">
                          {
                            fee.fee_title
                          }
                        </p>

                        <div className="mt-1 flex items-center gap-2">

                          <span className="rounded-md bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-600">
                            {
                              fee.fee_type
                            }
                          </span>

                          <span className="text-xs text-gray-400">
                            {
                              fee.academic_year
                            }
                          </span>

                        </div>

                      </td>


                      {/* TOTAL */}

                      <td className="px-5 py-4 text-sm font-semibold text-gray-800">
                        {formatCurrency(
                          fee.amount
                        )}
                      </td>


                      {/* PAID */}

                      <td className="px-5 py-4 text-sm font-semibold text-green-600">
                        {formatCurrency(
                          fee.paid_amount
                        )}
                      </td>


                      {/* BALANCE */}

                      <td className="px-5 py-4 text-sm font-semibold text-orange-600">
                        {formatCurrency(
                          fee.balance_amount
                        )}
                      </td>


                      {/* DUE */}

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {fee.due_date ||
                          "-"}
                      </td>


                      {/* PAYMENT STATUS */}

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getPaymentStatusStyle(
                            fee.payment_status
                          )}`}
                        >
                          {
                            fee.payment_status
                          }
                        </span>

                      </td>


                      {/* ACTIVE STATUS */}

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            fee.is_active
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {fee.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>

                      </td>


                      {/* ACTIONS */}

                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-2">

                          {/* PAYMENT */}

                          <Link
                            href={`/admin/fees/${fee.id}/payment`}
                            title="Update Payment"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-green-200 text-green-600 transition hover:bg-green-50"
                          >
                            <CreditCard
                              size={16}
                            />
                          </Link>


                          {/* EDIT */}

                          <Link
                            href={`/admin/fees/${fee.id}/edit`}
                            title="Edit Fee"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-blue-50 hover:text-[#0075FF]"
                          >
                            <Pencil
                              size={16}
                            />
                          </Link>


                          {/* ACTIVE */}

                          <button
                            type="button"
                            title={
                              fee.is_active
                                ? "Deactivate"
                                : "Activate"
                            }
                            onClick={() =>
                              handleStatusChange(
                                fee
                              )
                            }
                            disabled={
                              statusLoadingId ===
                              fee.id
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:opacity-50"
                          >

                            {statusLoadingId ===
                            fee.id ? (

                              <RefreshCw
                                size={16}
                                className="animate-spin"
                              />

                            ) : fee.is_active ? (

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

        {!loading && pagination.total > 0 && (
          <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              Showing {rangeStart}-{rangeEnd} of {pagination.total} records
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-500">
                Rows
                <select
                  aria-label="Rows per page"
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value));
                    setPage(1);
                  }}
                  className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-[#0075FF]"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </label>

              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={!pagination.has_previous || loading}
                className="h-9 rounded-lg border border-gray-200 px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <span className="min-w-24 text-center text-sm font-semibold text-[#0B3A67]">
                Page {pagination.page} of {Math.max(pagination.total_pages, 1)}
              </span>

              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                disabled={!pagination.has_next || loading}
                className="h-9 rounded-lg border border-gray-200 px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </section>

      {/* DEMO PREVIEW (dev-only; renders nothing unless
          NEXT_PUBLIC_DEMO_PREVIEW=true at build time) */}
      <DemoAdminFees />
    </>
  );
}
