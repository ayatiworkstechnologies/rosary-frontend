"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import AdminShell from "@/components/admin/AdminShell";

import {
  createAdminFee,
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
  Search,
  UserRound,
  IndianRupee,
  CreditCard,
} from "lucide-react";


export default function AddAdminFeePage() {
  const router = useRouter();

  const [students, setStudents] =
    useState([]);

  const [loadingStudents, setLoadingStudents] =
    useState(true);

  const [studentSearch, setStudentSearch] =
    useState("");

  const [form, setForm] =
    useState({
      student_id: "",
      academic_year: "2026-2027",
      fee_title: "",
      fee_type: "TUITION",
      amount: "",
      paid_amount: "0",
      due_date: "",
      paid_date: "",
      receipt_no: "",
      payment_mode: "",
      remarks: "",
      is_active: true,
    });

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");


  // =====================================================
  // LOAD STUDENTS
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    async function loadStudents() {
      try {
        const response =
          await getAdminStudents();

        if (cancelled) {
          return;
        }

        const data =
          Array.isArray(response?.data)
            ? response.data
            : [];

        setStudents(
          data.filter(
            (student) =>
              student.is_active
          )
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Load students error:",
          error
        );

        setError(
          error?.message ||
            "Unable to load students."
        );
      } finally {
        if (!cancelled) {
          setLoadingStudents(false);
        }
      }
    }

    loadStudents();

    return () => {
      cancelled = true;
    };
  }, []);


  // =====================================================
  // STUDENT FILTER
  // =====================================================

  const filteredStudents =
    useMemo(() => {
      const keyword =
        studentSearch
          .trim()
          .toLowerCase();

      if (!keyword) {
        return students;
      }

      return students.filter(
        (student) => {
          const text = `
            ${student.full_name || ""}
            ${student.admission_no || ""}
            ${student.roll_no || ""}
          `.toLowerCase();

          return text.includes(
            keyword
          );
        }
      );
    }, [
      students,
      studentSearch,
    ]);


  // =====================================================
  // SELECTED STUDENT
  // =====================================================

  const selectedStudent =
    useMemo(() => {
      if (!form.student_id) {
        return null;
      }

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
  // PAYMENT VALUES
  // =====================================================

  const amount =
    Number(form.amount || 0);

  const paidAmount =
    Number(
      form.paid_amount || 0
    );

  const balance =
    Math.max(
      amount - paidAmount,
      0
    );

  const paymentStatus =
    paidAmount <= 0
      ? "UNPAID"
      : paidAmount >= amount &&
        amount > 0
      ? "PAID"
      : "PARTIAL";


  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((current) => ({
      ...current,

      [name]:
        type === "checkbox"
          ? checked
          : value,
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

    if (!form.due_date) {
      setError(
        "Due date is required."
      );
      return;
    }

    const totalAmount =
      Number(form.amount);

    const payment =
      Number(
        form.paid_amount || 0
      );

    if (payment < 0) {
      setError(
        "Paid amount cannot be negative."
      );
      return;
    }

    if (
      payment >
      totalAmount
    ) {
      setError(
        "Paid amount cannot be greater than the fee amount."
      );
      return;
    }

    if (
      payment > 0 &&
      !form.paid_date
    ) {
      setError(
        "Paid date is required when an initial payment is entered."
      );
      return;
    }

    try {
      setSaving(true);

      await createAdminFee({
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

        paid_amount:
          payment,

        due_date:
          form.due_date,

        paid_date:
          payment > 0
            ? form.paid_date
            : null,

        receipt_no:
          payment > 0 &&
          form.receipt_no.trim()
            ? form.receipt_no.trim()
            : null,

        payment_mode:
          payment > 0 &&
          form.payment_mode
            ? form.payment_mode
            : null,

        remarks:
          form.remarks.trim() ||
          null,

        is_active:
          form.is_active,
      });

      router.push(
        "/admin/fees"
      );

      router.refresh();

    } catch (error) {

      console.error(
        "Create fee error:",
        error
      );

      setError(
        error?.message ||
          "Unable to create fee."
      );

    } finally {

      setSaving(false);

    }
  };


  const inputClass =
    "h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none transition focus:border-[#0075FF] focus:ring-2 focus:ring-blue-50";


  // =====================================================
  // UI
  // =====================================================

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
          Add Student Fee
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Create a new fee record
          for a student.
        </p>

      </section>


      <form
        onSubmit={handleSubmit}
        className="max-w-5xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
      >

        {/* FORM HEADER */}

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
              Student, fee and
              payment details.
            </p>

          </div>

        </div>


        <div className="space-y-8 p-6">

          {/* ERROR */}

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0 text-red-500"
              />

              <div>

                <p className="text-sm font-semibold text-red-700">
                  Unable to create fee
                </p>

                <p className="mt-1 text-xs text-red-600">
                  {error}
                </p>

              </div>

            </div>
          )}


          {/* ============================================= */}
          {/* STUDENT SECTION */}
          {/* ============================================= */}

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


            <div className="grid gap-4">

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Search Student
                </label>

                <div className="relative">

                  <Search
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    value={
                      studentSearch
                    }
                    onChange={(e) =>
                      setStudentSearch(
                        e.target.value
                      )
                    }
                    placeholder="Search name, admission no or roll no..."
                    className="h-12 w-full rounded-xl border border-gray-200 pl-11 pr-4 text-sm outline-none focus:border-[#0075FF]"
                  />

                </div>

              </div>


              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Select Student *
                </label>

                <select
                  name="student_id"
                  value={
                    form.student_id
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    loadingStudents
                  }
                  className={
                    inputClass
                  }
                >

                  <option value="">
                    {loadingStudents
                      ? "Loading students..."
                      : "Select Student"}
                  </option>

                  {filteredStudents.map(
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

              </div>


              {/* SELECTED STUDENT */}

              {selectedStudent && (

                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">

                  <div className="flex items-start gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white font-bold text-[#0075FF] shadow-sm">
                      {selectedStudent
                        .full_name
                        ?.charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>

                      <p className="font-semibold text-gray-900">
                        {
                          selectedStudent.full_name
                        }
                      </p>

                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">

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

                        {selectedStudent.class && (
                          <span>
                            Class:{" "}
                            {
                              selectedStudent
                                .class
                                .name
                            }{" "}
                            -{" "}
                            {
                              selectedStudent
                                .class
                                .section
                            }
                          </span>
                        )}

                      </div>

                    </div>

                  </div>

                </div>

              )}

            </div>

          </section>


          <hr className="border-gray-100" />


          {/* ============================================= */}
          {/* FEE DETAILS */}
          {/* ============================================= */}

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

              {/* ACADEMIC YEAR */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Academic Year *
                </label>

                <input
                  type="text"
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
                  placeholder="2026-2027"
                />

              </div>


              {/* FEE TYPE */}

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


              {/* FEE TITLE */}

              <div className="md:col-span-2">

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Fee Title *
                </label>

                <input
                  type="text"
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
                  placeholder="Term 1 Tuition Fee"
                />

              </div>


              {/* AMOUNT */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Fee Amount *
                </label>

                <div className="relative">

                  <IndianRupee
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="number"
                    name="amount"
                    min="0"
                    step="0.01"
                    value={
                      form.amount
                    }
                    onChange={
                      handleChange
                    }
                    className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-[#0075FF]"
                    placeholder="15000"
                  />

                </div>

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


          <hr className="border-gray-100" />


          {/* ============================================= */}
          {/* INITIAL PAYMENT */}
          {/* ============================================= */}

          <section>

            <div className="mb-2 flex items-center gap-2">

              <CreditCard
                size={18}
                className="text-[#0075FF]"
              />

              <h3 className="font-semibold text-gray-900">
                Initial Payment
              </h3>

            </div>

            <p className="mb-5 text-sm text-gray-500">
              Leave paid amount as
              ₹0 if the fee has not
              been paid yet.
            </p>


            <div className="grid gap-5 md:grid-cols-2">

              {/* PAID AMOUNT */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Paid Amount
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
                    step="0.01"
                    value={
                      form.paid_amount
                    }
                    onChange={
                      handleChange
                    }
                    className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-[#0075FF]"
                  />

                </div>

              </div>


              {/* STATUS PREVIEW */}

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


              {/* CONDITIONAL PAYMENT DETAILS */}

              {paidAmount > 0 && (
                <>

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Paid Date *
                    </label>

                    <input
                      type="date"
                      name="paid_date"
                      value={
                        form.paid_date
                      }
                      onChange={
                        handleChange
                      }
                      className={
                        inputClass
                      }
                    />

                  </div>


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
                        Select Mode
                      </option>

                      <option value="ONLINE">
                        Online
                      </option>

                      <option value="CASH">
                        Cash
                      </option>

                      <option value="CARD">
                        Card
                      </option>

                      <option value="UPI">
                        UPI
                      </option>

                      <option value="BANK_TRANSFER">
                        Bank Transfer
                      </option>

                    </select>

                  </div>


                  <div className="md:col-span-2">

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Receipt Number
                    </label>

                    <input
                      type="text"
                      name="receipt_no"
                      value={
                        form.receipt_no
                      }
                      onChange={
                        handleChange
                      }
                      className={
                        inputClass
                      }
                      placeholder="ROS-REC-005"
                    />

                  </div>

                </>
              )}

            </div>


            {/* PAYMENT PREVIEW */}

            {amount > 0 && (

              <div className="mt-5 grid gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 sm:grid-cols-3">

                <div>

                  <p className="text-xs text-gray-500">
                    Total
                  </p>

                  <p className="mt-1 font-bold text-gray-900">
                    ₹
                    {amount.toLocaleString(
                      "en-IN"
                    )}
                  </p>

                </div>


                <div>

                  <p className="text-xs text-gray-500">
                    Paid
                  </p>

                  <p className="mt-1 font-bold text-green-600">
                    ₹
                    {paidAmount.toLocaleString(
                      "en-IN"
                    )}
                  </p>

                </div>


                <div>

                  <p className="text-xs text-gray-500">
                    Balance
                  </p>

                  <p className="mt-1 font-bold text-orange-600">
                    ₹
                    {balance.toLocaleString(
                      "en-IN"
                    )}
                  </p>

                </div>

              </div>

            )}

          </section>


          <hr className="border-gray-100" />


          {/* ============================================= */}
          {/* REMARKS */}
          {/* ============================================= */}

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
              className="w-full resize-none rounded-xl border border-gray-200 p-4 text-sm outline-none focus:border-[#0075FF]"
              placeholder="Optional remarks..."
            />

          </section>


          {/* ACTIVE */}

          <label className="flex items-center gap-3">

            <input
              type="checkbox"
              name="is_active"
              checked={
                form.is_active
              }
              onChange={
                handleChange
              }
              className="h-4 w-4"
            />

            <span className="text-sm font-semibold text-gray-700">
              Fee record active
            </span>

          </label>

        </div>


        {/* ============================================= */}
        {/* FOOTER */}
        {/* ============================================= */}

        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 p-5 sm:flex-row sm:justify-end">

          <Link
            href="/admin/fees"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </Link>


          <button
            type="submit"
            disabled={
              saving ||
              loadingStudents
            }
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
              ? "Creating Fee..."
              : "Create Fee"}

          </button>

        </div>

      </form>

    </AdminShell>
  );
}