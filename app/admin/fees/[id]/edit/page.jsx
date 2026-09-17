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
  updateAdminFee,
} from "@/services/adminFeeService";

import {
  getAdminStudents,
} from "@/services/adminStudentService";

import {
  ArrowLeft,
  Save,
  RefreshCw,
  AlertCircle,
  ReceiptIndianRupee,
  UserRound,
  IndianRupee,
  CreditCard,
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


export default function EditAdminFeePage() {
  const params = useParams();
  const router = useRouter();

  const feeId = params.id;

  const [students, setStudents] =
    useState([]);

  const [form, setForm] =
    useState({
      student_id: "",
      academic_year: "",
      fee_title: "",
      fee_type: "TUITION",
      amount: "",
      due_date: "",
      remarks: "",
    });

  const [existingPayment, setExistingPayment] =
    useState({
      paid_amount: 0,
      balance_amount: 0,
      payment_status: "UNPAID",
      paid_date: null,
      receipt_no: null,
      payment_mode: null,
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");


  // =====================================================
  // LOAD FEE + STUDENTS
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [
          feeResponse,
          studentsResponse,
        ] = await Promise.all([
          getAdminFee(feeId),
          getAdminStudents(),
        ]);

        if (cancelled) {
          return;
        }

        const fee =
          feeResponse?.data;

        if (!fee) {
          setError(
            "Fee record not found."
          );
          return;
        }

        setForm({
          student_id:
            fee.student_id
              ? String(
                  fee.student_id
                )
              : "",

          academic_year:
            fee.academic_year ||
            "",

          fee_title:
            fee.fee_title || "",

          fee_type:
            fee.fee_type ||
            "TUITION",

          amount:
            fee.amount !==
              undefined &&
            fee.amount !== null
              ? String(
                  fee.amount
                )
              : "",

          due_date:
            fee.due_date || "",

          remarks:
            fee.remarks || "",
        });

        setExistingPayment({
          paid_amount:
            Number(
              fee.paid_amount ||
                0
            ),

          balance_amount:
            Number(
              fee.balance_amount ||
                0
            ),

          payment_status:
            fee.payment_status ||
            "UNPAID",

          paid_date:
            fee.paid_date ||
            null,

          receipt_no:
            fee.receipt_no ||
            null,

          payment_mode:
            fee.payment_mode ||
            null,
        });

        setStudents(
          Array.isArray(
            studentsResponse?.data
          )
            ? studentsResponse.data
            : []
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Load fee error:",
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
      loadData();
    }

    return () => {
      cancelled = true;
    };
  }, [feeId]);


  // =====================================================
  // SELECTED STUDENT
  // =====================================================

  const selectedStudent =
    useMemo(() => {
      return students.find(
        (student) =>
          String(student.id) ===
          String(form.student_id)
      );
    }, [
      students,
      form.student_id,
    ]);


  // =====================================================
  // PREVIEW
  // =====================================================

  const updatedAmount =
    Number(form.amount || 0);

  const newBalance =
    Math.max(
      updatedAmount -
        existingPayment.paid_amount,
      0
    );


  // =====================================================
  // HANDLE CHANGE
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
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.student_id) {
      setError(
        "Please select a student."
      );
      return;
    }

    if (
      !form.academic_year.trim()
    ) {
      setError(
        "Academic year is required."
      );
      return;
    }

    if (!form.fee_title.trim()) {
      setError(
        "Fee title is required."
      );
      return;
    }

    if (!form.fee_type.trim()) {
      setError(
        "Fee type is required."
      );
      return;
    }

    if (
      !form.amount ||
      Number(form.amount) <= 0
    ) {
      setError(
        "Fee amount must be greater than zero."
      );
      return;
    }

    if (
      Number(form.amount) <
      existingPayment.paid_amount
    ) {
      setError(
        `Fee amount cannot be less than the already paid amount of ${formatCurrency(
          existingPayment.paid_amount
        )}.`
      );
      return;
    }

    if (!form.due_date) {
      setError(
        "Due date is required."
      );
      return;
    }

    try {
      setSaving(true);

      await updateAdminFee(
        feeId,
        {
          student_id:
            Number(
              form.student_id
            ),

          academic_year:
            form.academic_year.trim(),

          fee_title:
            form.fee_title.trim(),

          fee_type:
            form.fee_type
              .trim()
              .toUpperCase(),

          amount:
            Number(form.amount),

          due_date:
            form.due_date,

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
        "Update fee error:",
        error
      );

      setError(
        error?.message ||
          "Unable to update fee."
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
              Loading fee...
            </p>

          </div>

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
          Edit Student Fee
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Update the fee details.
          Payment information is
          managed separately.
        </p>

      </section>


      <div className="grid max-w-5xl gap-6">

        {/* ============================================= */}
        {/* PAYMENT SUMMARY */}
        {/* ============================================= */}

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">

          <div className="mb-4 flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <CreditCard
                size={19}
              />
            </div>

            <div>

              <h2 className="font-semibold text-gray-900">
                Current Payment
              </h2>

              <p className="text-sm text-gray-500">
                Existing payment
                information for this fee.
              </p>

            </div>

          </div>


          <div className="grid gap-4 sm:grid-cols-3">

            <div className="rounded-xl bg-gray-50 p-4">

              <p className="text-xs text-gray-500">
                Paid Amount
              </p>

              <p className="mt-1 text-lg font-bold text-green-600">
                {formatCurrency(
                  existingPayment.paid_amount
                )}
              </p>

            </div>


            <div className="rounded-xl bg-gray-50 p-4">

              <p className="text-xs text-gray-500">
                Current Balance
              </p>

              <p className="mt-1 text-lg font-bold text-orange-600">
                {formatCurrency(
                  newBalance
                )}
              </p>

            </div>


            <div className="rounded-xl bg-gray-50 p-4">

              <p className="text-xs text-gray-500">
                Payment Status
              </p>

              <span
                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  existingPayment.payment_status ===
                  "PAID"
                    ? "bg-green-100 text-green-700"
                    : existingPayment.payment_status ===
                      "PARTIAL"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {
                  existingPayment.payment_status
                }
              </span>

            </div>

          </div>


          <div className="mt-4">

            <Link
              href={`/admin/fees/${feeId}/payment`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0075FF] hover:underline"
            >
              <CreditCard size={16} />

              Update Payment
            </Link>

          </div>

        </section>


        {/* ============================================= */}
        {/* EDIT FORM */}
        {/* ============================================= */}

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
        >

          <div className="flex items-center gap-3 border-b border-gray-100 p-6">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0075FF]">
              <ReceiptIndianRupee
                size={21}
              />
            </div>

            <div>

              <h2 className="font-semibold text-gray-900">
                Fee Information
              </h2>

              <p className="text-sm text-gray-500">
                Edit student and fee
                details.
              </p>

            </div>

          </div>


          <div className="space-y-7 p-6">

            {/* ERROR */}

            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-red-500"
                />

                <div>

                  <p className="text-sm font-semibold text-red-700">
                    Unable to update fee
                  </p>

                  <p className="mt-1 text-xs text-red-600">
                    {error}
                  </p>

                </div>

              </div>
            )}


            {/* ========================================= */}
            {/* STUDENT */}
            {/* ========================================= */}

            <section>

              <div className="mb-4 flex items-center gap-2">

                <UserRound
                  size={18}
                  className="text-[#0075FF]"
                />

                <h3 className="font-semibold text-gray-900">
                  Student
                </h3>

              </div>


              <select
                name="student_id"
                value={
                  form.student_id
                }
                onChange={handleChange}
                className={
                  inputClass
                }
              >

                <option value="">
                  Select Student
                </option>

                {students
                  .filter(
                    (student) =>
                      student.is_active ||
                      String(
                        student.id
                      ) ===
                        String(
                          form.student_id
                        )
                  )
                  .map(
                    (student) => (

                      <option
                        key={
                          student.id
                        }
                        value={
                          student.id
                        }
                      >
                        {
                          student.full_name
                        }{" "}
                        -{" "}
                        {
                          student.admission_no
                        }
                      </option>

                    )
                  )}

              </select>


              {selectedStudent && (

                <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/50 p-4">

                  <p className="font-semibold text-gray-900">
                    {
                      selectedStudent.full_name
                    }
                  </p>

                  <div className="mt-1 flex flex-wrap gap-4 text-xs text-gray-500">

                    <span>
                      Admission:{" "}
                      {
                        selectedStudent.admission_no
                      }
                    </span>

                    {selectedStudent.roll_no && (
                      <span>
                        Roll No:{" "}
                        {
                          selectedStudent.roll_no
                        }
                      </span>
                    )}

                  </div>

                </div>

              )}

            </section>


            <hr className="border-gray-100" />


            {/* ========================================= */}
            {/* FEE DETAILS */}
            {/* ========================================= */}

            <section>

              <div className="mb-4 flex items-center gap-2">

                <IndianRupee
                  size={18}
                  className="text-[#0075FF]"
                />

                <h3 className="font-semibold text-gray-900">
                  Fee Details
                </h3>

              </div>


              <div className="grid gap-5 md:grid-cols-2">

                {/* YEAR */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Academic Year *
                  </label>

                  <input
                    name="academic_year"
                    value={
                      form.academic_year
                    }
                    onChange={
                      handleChange
                    }
                    className={
                      inputClass
                    }
                  />

                </div>


                {/* TYPE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Fee Type *
                  </label>

                  <select
                    name="fee_type"
                    value={
                      form.fee_type
                    }
                    onChange={
                      handleChange
                    }
                    className={
                      inputClass
                    }
                  >

                    <option value="TUITION">
                      Tuition
                    </option>

                    <option value="ACTIVITY">
                      Activity
                    </option>

                    <option value="EXAM">
                      Exam
                    </option>

                    <option value="TRANSPORT">
                      Transport
                    </option>

                    <option value="LAB">
                      Lab
                    </option>

                    <option value="BOOK">
                      Book
                    </option>

                    <option value="UNIFORM">
                      Uniform
                    </option>

                    <option value="OTHER">
                      Other
                    </option>

                  </select>

                </div>


                {/* TITLE */}

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Fee Title *
                  </label>

                  <input
                    name="fee_title"
                    value={
                      form.fee_title
                    }
                    onChange={
                      handleChange
                    }
                    className={
                      inputClass
                    }
                  />

                </div>


                {/* AMOUNT */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Fee Amount *
                  </label>

                  <input
                    type="number"
                    name="amount"
                    min={
                      existingPayment.paid_amount
                    }
                    step="0.01"
                    value={
                      form.amount
                    }
                    onChange={
                      handleChange
                    }
                    className={
                      inputClass
                    }
                  />

                  {existingPayment.paid_amount >
                    0 && (

                    <p className="mt-2 text-xs text-orange-600">
                      Minimum amount:{" "}
                      {formatCurrency(
                        existingPayment.paid_amount
                      )}{" "}
                      because this amount
                      has already been paid.
                    </p>

                  )}

                </div>


                {/* DUE DATE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Due Date *
                  </label>

                  <input
                    type="date"
                    name="due_date"
                    value={
                      form.due_date
                    }
                    onChange={
                      handleChange
                    }
                    className={
                      inputClass
                    }
                  />

                </div>

              </div>

            </section>


            {/* REMARKS */}

            <section>

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
                placeholder="Optional remarks..."
              />

            </section>

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

                <Save size={17} />

              )}

              {saving
                ? "Saving..."
                : "Save Changes"}

            </button>

          </div>

        </form>

      </div>

    </AdminShell>
  );
}