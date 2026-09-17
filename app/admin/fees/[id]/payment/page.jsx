"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  useParams,
  useRouter,
} from "next/navigation";

import AdminShell from "@/components/admin/AdminShell";

import {
  getAdminFee,
  updateAdminFeePayment,
} from "@/services/adminFeeService";

import {
  ArrowLeft,
  Save,
  RefreshCw,
  AlertCircle,
  CreditCard,
  IndianRupee,
  ReceiptText,
  CalendarDays,
  WalletCards,
} from "lucide-react";


function formatCurrency(value) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }
  ).format(Number(value || 0));
}


export default function AdminFeePaymentPage() {
  const params = useParams();
  const router = useRouter();

  const feeId = params.id;

  const [fee, setFee] =
    useState(null);

  const [form, setForm] =
    useState({
      paid_amount: "",
      paid_date: "",
      receipt_no: "",
      payment_mode: "",
      remarks: "",
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");


  // =====================================================
  // LOAD FEE
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    async function loadFee() {
      try {
        const response =
          await getAdminFee(
            feeId
          );

        if (cancelled) {
          return;
        }

        const feeData =
          response?.data;

        if (!feeData) {
          setError(
            "Fee record not found."
          );
          return;
        }

        setFee(feeData);

        setForm({
          paid_amount:
            feeData.paid_amount !==
              undefined &&
            feeData.paid_amount !== null
              ? String(
                  feeData.paid_amount
                )
              : "0",

          paid_date:
            feeData.paid_date ||
            "",

          receipt_no:
            feeData.receipt_no ||
            "",

          payment_mode:
            feeData.payment_mode ||
            "",

          remarks:
            feeData.remarks || "",
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Load fee payment error:",
          error
        );

        setError(
          error?.message ||
            "Unable to load fee."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (feeId) {
      loadFee();
    }

    return () => {
      cancelled = true;
    };
  }, [feeId]);


  // =====================================================
  // VALUES
  // =====================================================

  const totalAmount =
    Number(
      fee?.amount || 0
    );

  const paidAmount =
    Number(
      form.paid_amount || 0
    );

  const balance =
    Math.max(
      totalAmount -
        paidAmount,
      0
    );


  const paymentStatus =
    useMemo(() => {
      if (paidAmount <= 0) {
        return "UNPAID";
      }

      if (
        paidAmount >=
        totalAmount
      ) {
        return "PAID";
      }

      return "PARTIAL";
    }, [
      paidAmount,
      totalAmount,
    ]);


  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };


  // =====================================================
  // SAVE PAYMENT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (paidAmount < 0) {
      setError(
        "Paid amount cannot be negative."
      );
      return;
    }

    if (
      paidAmount >
      totalAmount
    ) {
      setError(
        "Paid amount cannot be greater than the total fee amount."
      );
      return;
    }

    if (
      paidAmount > 0 &&
      !form.paid_date
    ) {
      setError(
        "Paid date is required when paid amount is greater than zero."
      );
      return;
    }

    try {
      setSaving(true);

      await updateAdminFeePayment(
        feeId,
        {
          paid_amount:
            paidAmount,

          paid_date:
            paidAmount > 0
              ? form.paid_date
              : null,

          receipt_no:
            paidAmount > 0 &&
            form.receipt_no.trim()
              ? form.receipt_no.trim()
              : null,

          payment_mode:
            paidAmount > 0 &&
            form.payment_mode
              ? form.payment_mode
              : null,

          remarks:
            form.remarks.trim() ||
            null,
        }
      );

      router.push(
        "/admin/fees"
      );

      router.refresh();

    } catch (error) {

      console.error(
        "Update payment error:",
        error
      );

      setError(
        error?.message ||
          "Unable to update payment."
      );

    } finally {

      setSaving(false);

    }
  };


  const inputClass =
    "h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none transition focus:border-[#0075FF] focus:ring-2 focus:ring-blue-50";


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <AdminShell>

        <div className="flex min-h-[450px] items-center justify-center">

          <div className="text-center">

            <RefreshCw
              size={30}
              className="mx-auto animate-spin text-[#0075FF]"
            />

            <p className="mt-3 text-sm text-gray-500">
              Loading payment...
            </p>

          </div>

        </div>

      </AdminShell>
    );
  }


  if (!fee) {
    return (
      <AdminShell>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

          <div className="flex items-center gap-3 text-red-600">

            <AlertCircle
              size={20}
            />

            <p className="font-semibold">
              Fee record not found.
            </p>

          </div>

          <Link
            href="/admin/fees"
            className="mt-4 inline-flex text-sm font-semibold text-[#0075FF]"
          >
            Back to Fees
          </Link>

        </div>

      </AdminShell>
    );
  }


  return (
    <AdminShell>

      {/* BACK */}

      <Link
        href="/admin/fees"
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#0075FF]"
      >
        <ArrowLeft size={17} />

        Back to Fees
      </Link>


      {/* HEADER */}

      <section className="mb-6">

        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
          Update Fee Payment
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Record the paid amount,
          receipt and payment method.
        </p>

      </section>


      <div className="grid max-w-5xl gap-6 lg:grid-cols-[1fr_340px]">

        {/* ================================================= */}
        {/* PAYMENT FORM */}
        {/* ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
        >

          <div className="flex items-center gap-3 border-b border-gray-100 p-6">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0075FF]">
              <CreditCard
                size={21}
              />
            </div>

            <div>

              <h2 className="font-semibold text-gray-900">
                Payment Information
              </h2>

              <p className="text-sm text-gray-500">
                Update the current
                payment details.
              </p>

            </div>

          </div>


          <div className="space-y-6 p-6">

            {/* ERROR */}

            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-red-500"
                />

                <div>

                  <p className="text-sm font-semibold text-red-700">
                    Unable to update payment
                  </p>

                  <p className="mt-1 text-xs text-red-600">
                    {error}
                  </p>

                </div>

              </div>
            )}


            {/* PAID AMOUNT */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Paid Amount *
              </label>

              <div className="relative">

                <IndianRupee
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="number"
                  name="paid_amount"
                  min="0"
                  max={
                    totalAmount
                  }
                  step="0.01"
                  value={
                    form.paid_amount
                  }
                  onChange={
                    handleChange
                  }
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#0075FF] focus:ring-2 focus:ring-blue-50"
                />

              </div>

              <p className="mt-2 text-xs text-gray-500">
                Enter the total amount
                paid so far, not only
                the latest transaction.
              </p>

            </div>


            {/* PAYMENT STATUS */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Payment Status
              </label>

              <div className="flex h-12 items-center rounded-xl border border-gray-200 bg-gray-50 px-4">

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    paymentStatus ===
                    "PAID"
                      ? "bg-green-100 text-green-700"
                      : paymentStatus ===
                        "PARTIAL"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {paymentStatus}
                </span>

              </div>

            </div>


            {/* CONDITIONAL */}

            {paidAmount > 0 && (
              <>

                {/* PAID DATE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Paid Date *
                  </label>

                  <div className="relative">

                    <CalendarDays
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="date"
                      name="paid_date"
                      value={
                        form.paid_date
                      }
                      onChange={
                        handleChange
                      }
                      className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#0075FF]"
                    />

                  </div>

                </div>


                {/* PAYMENT MODE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Payment Mode
                  </label>

                  <select
                    name="payment_mode"
                    value={
                      form.payment_mode
                    }
                    onChange={
                      handleChange
                    }
                    className={
                      inputClass
                    }
                  >

                    <option value="">
                      Select Payment Mode
                    </option>

                    <option value="CASH">
                      Cash
                    </option>

                    <option value="ONLINE">
                      Online
                    </option>

                    <option value="UPI">
                      UPI
                    </option>

                    <option value="CARD">
                      Card
                    </option>

                    <option value="BANK_TRANSFER">
                      Bank Transfer
                    </option>

                    <option value="CHEQUE">
                      Cheque
                    </option>

                  </select>

                </div>


                {/* RECEIPT */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Receipt Number
                  </label>

                  <div className="relative">

                    <ReceiptText
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      name="receipt_no"
                      value={
                        form.receipt_no
                      }
                      onChange={
                        handleChange
                      }
                      className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#0075FF]"
                      placeholder="ROS-REC-006"
                    />

                  </div>

                </div>

              </>
            )}


            {/* REMARKS */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Remarks
              </label>

              <textarea
                name="remarks"
                value={
                  form.remarks
                }
                onChange={
                  handleChange
                }
                rows={4}
                className="w-full resize-none rounded-xl border border-gray-200 p-4 text-sm outline-none transition focus:border-[#0075FF] focus:ring-2 focus:ring-blue-50"
                placeholder="Payment remarks..."
              />

            </div>

          </div>


          {/* FOOTER */}

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 p-5 sm:flex-row sm:justify-end">

            <Link
              href="/admin/fees"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </Link>


            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0075FF] px-5 text-sm font-semibold text-white hover:bg-[#0067DF] disabled:cursor-not-allowed disabled:opacity-50"
            >

              {saving ? (

                <RefreshCw
                  size={17}
                  className="animate-spin"
                />

              ) : (

                <Save
                  size={17}
                />

              )}

              {saving
                ? "Updating..."
                : "Update Payment"}

            </button>

          </div>

        </form>


        {/* ================================================= */}
        {/* SUMMARY */}
        {/* ================================================= */}

        <aside className="h-fit rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">

          <div className="mb-5 flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0075FF]">
              <WalletCards
                size={19}
              />
            </div>

            <div>

              <h2 className="font-semibold text-gray-900">
                Fee Summary
              </h2>

              <p className="text-xs text-gray-500">
                Current fee information
              </p>

            </div>

          </div>


          {/* STUDENT */}

          <div className="border-b border-gray-100 pb-4">

            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Student
            </p>

            <p className="mt-2 font-semibold text-gray-900">
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

              <p className="mt-1 text-xs text-gray-500">
                {
                  fee.student.class
                    .name
                }{" "}
                -{" "}
                {
                  fee.student.class
                    .section
                }
              </p>

            )}

          </div>


          {/* FEE */}

          <div className="border-b border-gray-100 py-4">

            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Fee
            </p>

            <p className="mt-2 font-semibold text-gray-900">
              {fee.fee_title}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              {fee.fee_type} •{" "}
              {fee.academic_year}
            </p>

          </div>


          {/* AMOUNTS */}

          <div className="space-y-4 py-4">

            <div className="flex items-center justify-between">

              <span className="text-sm text-gray-500">
                Total Amount
              </span>

              <span className="font-bold text-gray-900">
                {formatCurrency(
                  totalAmount
                )}
              </span>

            </div>


            <div className="flex items-center justify-between">

              <span className="text-sm text-gray-500">
                Paid Amount
              </span>

              <span className="font-bold text-green-600">
                {formatCurrency(
                  paidAmount
                )}
              </span>

            </div>


            <div className="flex items-center justify-between border-t border-gray-100 pt-4">

              <span className="text-sm font-semibold text-gray-700">
                Balance
              </span>

              <span className="text-lg font-bold text-orange-600">
                {formatCurrency(
                  balance
                )}
              </span>

            </div>

          </div>


          {/* STATUS */}

          <div
            className={`rounded-xl p-4 ${
              paymentStatus ===
              "PAID"
                ? "bg-green-50"
                : paymentStatus ===
                  "PARTIAL"
                ? "bg-orange-50"
                : "bg-red-50"
            }`}
          >

            <p className="text-xs text-gray-500">
              Payment Status
            </p>

            <p
              className={`mt-1 font-bold ${
                paymentStatus ===
                "PAID"
                  ? "text-green-700"
                  : paymentStatus ===
                    "PARTIAL"
                  ? "text-orange-700"
                  : "text-red-600"
              }`}
            >
              {paymentStatus}
            </p>

          </div>

        </aside>

      </div>

    </AdminShell>
  );
}