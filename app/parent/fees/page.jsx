"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CreditCard,
  Loader2,
  ReceiptText,
  UserRound,
  WalletCards,
} from "lucide-react";

import {
  getParentChildren,
  getParentChildFees,
} from "@/services/parentService";


// =========================================================
// MONEY
// =========================================================

function formatMoney(value) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  ).format(
    Number(value || 0)
  );
}


// =========================================================
// DATE
// =========================================================

function formatDate(value) {
  if (!value) {
    return "--";
  }

  const date =
    new Date(
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

export default function ParentFeesPage() {
  const [
    children,
    setChildren,
  ] = useState([]);

  const [
    selectedStudentId,
    setSelectedStudentId,
  ] = useState("");

  const [
    feeData,
    setFeeData,
  ] = useState(null);

  const [
    initialLoading,
    setInitialLoading,
  ] = useState(true);

  const [
    feeLoading,
    setFeeLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  // =======================================================
  // CHILDREN
  // =======================================================

  useEffect(() => {
    let cancelled = false;


    async function loadChildren() {
      try {
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


        if (
          childList.length > 0
        ) {
          setSelectedStudentId(
            String(
              childList[0].id
            )
          );
        }

      } catch (err) {
        console.error(
          "Fee children:",
          err
        );


        if (!cancelled) {
          setError(
            err?.response
              ?.data
              ?.detail ||
            "Unable to load children."
          );
        }

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

  }, []);


  // =======================================================
  // FEES
  // =======================================================

  useEffect(() => {
    if (!selectedStudentId) {
      return;
    }


    let cancelled = false;


    async function loadFees() {
      try {
        setFeeLoading(
          true
        );


        const data =
          await getParentChildFees(
            selectedStudentId
          );


        if (cancelled) {
          return;
        }


        setFeeData(
          data
        );

        setError("");

      } catch (err) {
        console.error(
          "Parent fees:",
          err
        );


        if (!cancelled) {
          setFeeData(
            null
          );

          setError(
            err?.response
              ?.data
              ?.detail ||
            "Unable to load fee information."
          );
        }

      } finally {
        if (!cancelled) {
          setFeeLoading(
            false
          );
        }
      }
    }


    loadFees();


    return () => {
      cancelled = true;
    };

  }, [
    selectedStudentId,
  ]);


  if (initialLoading) {
    return (
      <LoadingState
        text="Loading fee information..."
      />
    );
  }


  return (
    <div
      className="
        mx-auto
        max-w-[1400px]
      "
    >

      {/* HEADER */}

      <div>
        <h1
          className="
            text-2xl
            font-bold
            text-[#0B3A67]
          "
        >
          Fee Information
        </h1>

        <p
          className="
            mt-1
            text-sm
            text-slate-500
          "
        >
          View your child&apos;s
          school fee details and
          payment status.
        </p>
      </div>


      {/* CHILD */}

      {children.length > 0 && (
        <section
          className="
            mt-6
            rounded-2xl
            border
            border-[#E4EDF7]
            bg-white
            p-4
            shadow-sm
          "
        >

          <label
            className="
              mb-2
              block
              text-xs
              font-semibold
              text-[#0B3A67]
            "
          >
            Select Child
          </label>


          <div
            className="
              relative
              max-w-[420px]
            "
          >
            <select
              value={
                selectedStudentId
              }
              onChange={(
                event
              ) =>
                setSelectedStudentId(
                  event.target.value
                )
              }
              className="
                w-full
                appearance-none
                rounded-xl
                border
                border-[#DCE8F5]
                bg-white
                px-4
                py-3
                pr-10
                text-sm
                font-semibold
                text-[#0B3A67]
                outline-none
                focus:border-[#0075FF]
              "
            >
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
                      child.name
                    }
                  </option>
                )
              )}
            </select>


            <ChevronDown
              size={17}
              className="
                pointer-events-none
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                text-[#0075FF]
              "
            />
          </div>

        </section>
      )}


      {/* ERROR */}

      {error && (
        <div
          className="
            mt-4
            rounded-xl
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-sm
            text-red-600
          "
        >
          {error}
        </div>
      )}


      {/* LOADING */}

      {feeLoading && (
        <div
          className="
            mt-5
            flex
            items-center
            justify-center
            gap-3
            rounded-2xl
            border
            border-[#E4EDF7]
            bg-white
            py-14
          "
        >
          <Loader2
            size={20}
            className="
              animate-spin
              text-[#0075FF]
            "
          />

          <span
            className="
              text-sm
              text-slate-500
            "
          >
            Loading fees...
          </span>
        </div>
      )}


      {!feeLoading &&
        feeData && (
        <>

          {/* STUDENT */}

          <section
            className="
              mt-5
              rounded-2xl
              border
              border-[#E4EDF7]
              bg-white
              p-4
              shadow-sm
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#EAF4FF]
                  text-[#0075FF]
                "
              >
                <UserRound
                  size={21}
                />
              </div>


              <div>
                <h2
                  className="
                    font-bold
                    text-[#0B3A67]
                  "
                >
                  {
                    feeData.student_name
                  }
                </h2>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-400
                  "
                >
                  {
                    feeData.name ||
                    "--"
                  }

                  {" • "}

                  {
                    feeData.admission_no
                  }

                  {" • "}

                  {
                    feeData.academic_year
                  }
                </p>
              </div>
            </div>
          </section>


          {/* SUMMARY */}

          <section
            className="
              mt-4
              grid
              grid-cols-2
              gap-3
              lg:grid-cols-4
            "
          >
            <SummaryCard
              title="Total Fee"
              value={
                formatMoney(
                  feeData.total_fee
                )
              }
              icon={
                WalletCards
              }
              iconClass="
                bg-[#EAF4FF]
                text-[#0075FF]
              "
            />

            <SummaryCard
              title="Paid"
              value={
                formatMoney(
                  feeData.total_paid
                )
              }
              icon={
                CheckCircle2
              }
              iconClass="
                bg-green-100
                text-green-600
              "
            />

            <SummaryCard
              title="Pending"
              value={
                formatMoney(
                  feeData.total_pending
                )
              }
              icon={
                Clock3
              }
              iconClass="
                bg-orange-100
                text-orange-600
              "
            />

            <SummaryCard
              title="Overdue"
              value={
                formatMoney(
                  feeData.overdue_amount
                )
              }
              icon={
                Banknote
              }
              iconClass="
                bg-red-100
                text-red-500
              "
            />
          </section>


          {/* FEES */}

          {feeData.fees?.length > 0 ? (
            <section
              className="
                mt-5
                grid
                gap-4
                md:grid-cols-2
              "
            >
              {feeData.fees.map(
                (item) => (
                  <FeeCard
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
            <EmptyFees />
          )}

        </>
      )}

    </div>
  );
}


// =========================================================
// FEE CARD
// =========================================================

function FeeCard({
  item,
}) {
  return (
    <article
      className="
        rounded-2xl
        border
        border-[#E4EDF7]
        bg-white
        p-5
        shadow-sm
      "
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-3
        "
      >
        <div
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            bg-[#EAF4FF]
            text-[#0075FF]
          "
        >
          <CreditCard
            size={20}
          />
        </div>


        <StatusBadge
          status={
            item.status
          }
        />
      </div>


      <p
        className="
          mt-4
          text-xs
          font-semibold
          uppercase
          text-[#0075FF]
        "
      >
        {
          item.fee_type
        }
      </p>


      <h2
        className="
          mt-1
          text-base
          font-bold
          text-[#0B3A67]
        "
      >
        {
          item.fee_title
        }
      </h2>


      <div
        className="
          mt-4
          grid
          grid-cols-3
          gap-2
        "
      >
        <MoneyBox
          label="Amount"
          value={
            item.amount
          }
        />

        <MoneyBox
          label="Paid"
          value={
            item.paid_amount
          }
        />

        <MoneyBox
          label="Pending"
          value={
            item.pending_amount
          }
        />
      </div>


      <div
        className="
          mt-4
          space-y-2
          border-t
          border-slate-100
          pt-4
        "
      >
        <InfoRow
          icon={
            CalendarDays
          }
          label="Due Date"
          value={
            formatDate(
              item.due_date
            )
          }
        />


        {item.paid_date && (
          <InfoRow
            icon={
              CheckCircle2
            }
            label="Paid Date"
            value={
              formatDate(
                item.paid_date
              )
            }
          />
        )}


        {item.receipt_no && (
          <InfoRow
            icon={
              ReceiptText
            }
            label="Receipt"
            value={
              item.receipt_no
            }
          />
        )}


        {item.payment_mode && (
          <InfoRow
            icon={
              CreditCard
            }
            label="Payment Mode"
            value={
              item.payment_mode
            }
          />
        )}
      </div>


      {item.remarks && (
        <div
          className="
            mt-4
            rounded-xl
            bg-[#F8FBFF]
            p-3
            text-xs
            text-slate-500
          "
        >
          {item.remarks}
        </div>
      )}

    </article>
  );
}


// =========================================================
// MONEY BOX
// =========================================================

function MoneyBox({
  label,
  value,
}) {
  return (
    <div
      className="
        rounded-xl
        bg-[#F8FBFF]
        p-3
      "
    >
      <p
        className="
          text-[10px]
          text-slate-400
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          text-sm
          font-bold
          text-[#0B3A67]
        "
      >
        {
          formatMoney(
            value
          )
        }
      </p>
    </div>
  );
}


// =========================================================
// STATUS
// =========================================================

function StatusBadge({
  status,
}) {
  const styles = {
    PAID:
      "bg-green-50 text-green-600",

    PARTIAL:
      "bg-blue-50 text-blue-600",

    PENDING:
      "bg-orange-50 text-orange-600",

    OVERDUE:
      "bg-red-50 text-red-500",
  };


  return (
    <span
      className={`
        rounded-full
        px-3
        py-1
        text-[10px]
        font-bold
        ${
          styles[status] ||
          "bg-slate-100 text-slate-500"
        }
      `}
    >
      {status}
    </span>
  );
}


// =========================================================
// INFO
// =========================================================

function InfoRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-2
      "
    >
      <Icon
        size={14}
        className="
          text-[#0075FF]
        "
      />

      <span
        className="
          text-[11px]
          text-slate-400
        "
      >
        {label}:
      </span>

      <span
        className="
          text-[11px]
          font-semibold
          text-slate-600
        "
      >
        {value}
      </span>
    </div>
  );
}


// =========================================================
// SUMMARY
// =========================================================

function SummaryCard({
  title,
  value,
  icon: Icon,
  iconClass,
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-3
        rounded-2xl
        border
        border-[#E4EDF7]
        bg-white
        p-4
        shadow-sm
      "
    >
      <div
        className={`
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-xl
          ${iconClass}
        `}
      >
        <Icon
          size={20}
        />
      </div>


      <div
        className="
          min-w-0
        "
      >
        <p
          className="
            text-[11px]
            text-slate-500
          "
        >
          {title}
        </p>

        <p
          className="
            mt-1
            truncate
            text-lg
            font-bold
            text-[#0B3A67]
          "
        >
          {value}
        </p>
      </div>
    </div>
  );
}


// =========================================================
// EMPTY
// =========================================================

function EmptyFees() {
  return (
    <div
      className="
        mt-5
        rounded-2xl
        border
        border-[#E4EDF7]
        bg-white
        py-16
        text-center
      "
    >
      <WalletCards
        size={40}
        className="
          mx-auto
          text-slate-300
        "
      />

      <h3
        className="
          mt-3
          font-semibold
          text-[#0B3A67]
        "
      >
        No fee information
      </h3>

      <p
        className="
          mt-1
          text-sm
          text-slate-400
        "
      >
        Fee details will appear here.
      </p>
    </div>
  );
}


// =========================================================
// LOADING
// =========================================================

function LoadingState({
  text,
}) {
  return (
    <div
      className="
        flex
        min-h-[450px]
        items-center
        justify-center
      "
    >
      <div
        className="
          text-center
        "
      >
        <Loader2
          size={32}
          className="
            mx-auto
            animate-spin
            text-[#0075FF]
          "
        />

        <p
          className="
            mt-3
            text-sm
            text-slate-500
          "
        >
          {text}
        </p>
      </div>
    </div>
  );
}