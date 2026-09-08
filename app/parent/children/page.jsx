"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  BookOpen,
  CalendarCheck,
  ChevronRight,
  GraduationCap,
  Loader2,
  School,
  UserRound,
  Users,
} from "lucide-react";

import {
  getParentChildren,
} from "@/services/parentService";


// =========================================================
// MAIN PAGE
// =========================================================

export default function ParentChildrenPage() {
  const [
    children,
    setChildren,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  // =======================================================
  // LOAD CHILDREN
  // =======================================================

  useEffect(() => {
    const loadChildren =
      async () => {

        try {

          setLoading(true);

          setError("");

          const data =
            await getParentChildren();

          setChildren(
            Array.isArray(
              data?.children
            )
              ? data.children
              : []
          );

        } catch (err) {

          console.error(
            "Parent children error:",
            err
          );

          setChildren([]);

          setError(
            err?.response
              ?.data
              ?.detail ||
            "Unable to load children."
          );

        } finally {

          setLoading(false);

        }

      };


    loadChildren();

  }, []);


  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <div
        className="
          flex
          min-h-[450px]
          items-center
          justify-center
        "
      >

        <div className="text-center">

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
            Loading children...
          </p>

        </div>

      </div>
    );
  }


  // =======================================================
  // UI
  // =======================================================

  return (
    <div
      className="
        mx-auto
        max-w-[1200px]
      "
    >

      {/* =========================================
          HEADER
      ========================================== */}

      <div>

        <h1
          className="
            text-2xl
            font-bold
            text-[#0B3A67]
          "
        >
          My Children
        </h1>

        <p
          className="
            mt-1
            text-sm
            text-slate-500
          "
        >
          View your children&apos;s
          academic information and school activity.
        </p>

      </div>


      {/* =========================================
          ERROR
      ========================================== */}

      {error && (
        <div
          className="
            mt-5
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


      {/* =========================================
          SUMMARY
      ========================================== */}

      {!error && (
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

          <div
            className="
              flex
              items-center
              gap-4
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

              <Users
                size={22}
              />

            </div>


            <div>

              <p
                className="
                  text-xs
                  text-slate-500
                "
              >
                Children Linked
              </p>

              <p
                className="
                  mt-1
                  text-xl
                  font-bold
                  text-[#0B3A67]
                "
              >
                {children.length}
              </p>

            </div>

          </div>

        </section>
      )}


      {/* =========================================
          CHILD CARDS
      ========================================== */}

      {!error &&
        children.length > 0 && (
        <section
          className="
            mt-5
            grid
            gap-4
            md:grid-cols-2
          "
        >

          {children.map(
            (child) => (
              <ChildCard
                key={child.id}
                child={child}
              />
            )
          )}

        </section>
      )}


      {/* =========================================
          EMPTY
      ========================================== */}

      {!error &&
        children.length === 0 && (
        <div
          className="
            mt-5
            rounded-2xl
            border
            border-[#E4EDF7]
            bg-white
            py-16
            text-center
            shadow-sm
          "
        >

          <Users
            size={40}
            className="
              mx-auto
              text-slate-300
            "
          />

          <h2
            className="
              mt-3
              font-semibold
              text-[#0B3A67]
            "
          >
            No children linked
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-slate-400
            "
          >
            Please contact the school
            administrator to link your child.
          </p>

        </div>
      )}

    </div>
  );
}


// =========================================================
// CHILD CARD
// =========================================================

function ChildCard({
  child,
}) {
  const initials =
    child.full_name
      ?.split(" ")
      .filter(Boolean)
      .map(
        (item) =>
          item[0]
      )
      .slice(0, 2)
      .join("")
      .toUpperCase() ||
    "ST";


  return (
    <article
      className="
        overflow-hidden
        rounded-2xl
        border
        border-[#E4EDF7]
        bg-white
        shadow-sm
        transition
        hover:border-[#0075FF]/30
        hover:shadow-md
      "
    >

      {/* TOP */}

      <div
        className="
          bg-gradient-to-r
          from-[#0075FF]
          to-[#0B3A67]
          p-5
        "
      >

        <div
          className="
            flex
            items-center
            gap-4
          "
        >

          <div
            className="
              flex
              h-16
              w-16
              shrink-0
              items-center
              justify-center
              rounded-2xl
              border
              border-white/20
              bg-white
              text-lg
              font-bold
              text-[#0075FF]
            "
          >
            {initials}
          </div>


          <div
            className="
              min-w-0
            "
          >

            <h2
              className="
                truncate
                text-lg
                font-bold
                text-white
              "
            >
              {child.full_name}
            </h2>

            <p
              className="
                mt-1
                text-xs
                text-white/80
              "
            >
              Admission No:{" "}
              {child.admission_no}
            </p>

          </div>

        </div>

      </div>


      {/* INFORMATION */}

      <div className="p-5">

        <div
          className="
            grid
            grid-cols-2
            gap-3
          "
        >

          <InfoBox
            icon={School}
            label="Class"
            value={
              child.class_name ||
              "--"
            }
          />

          <InfoBox
            icon={UserRound}
            label="Roll No."
            value={
              child.roll_no ||
              "--"
            }
          />

          <InfoBox
            icon={BookOpen}
            label="Academic Year"
            value={
              child.academic_year ||
              "--"
            }
          />

          <InfoBox
            icon={Users}
            label="Relationship"
            value={
              child.relationship ||
              "--"
            }
          />

        </div>


        {/* STATUS */}

        <div
          className="
            mt-4
            flex
            items-center
            justify-between
            border-t
            border-slate-100
            pt-4
          "
        >

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <span
              className={`
                h-2
                w-2
                rounded-full
                ${
                  child.status ===
                  "Active"
                    ? "bg-green-500"
                    : "bg-red-500"
                }
              `}
            />

            <span
              className="
                text-xs
                font-medium
                text-slate-500
              "
            >
              {child.status}
            </span>

          </div>


          <span
            className="
              flex
              items-center
              gap-1
              text-xs
              font-semibold
              text-[#0075FF]
            "
          >
            Student Details

            <ChevronRight
              size={15}
            />
          </span>

        </div>


        {/* QUICK LINKS */}

        <div
          className="
            mt-4
            grid
            grid-cols-3
            gap-2
          "
        >

          <QuickAction
            icon={CalendarCheck}
            label="Attendance"
          />

          <QuickAction
            icon={BookOpen}
            label="Homework"
          />

          <QuickAction
            icon={GraduationCap}
            label="Results"
          />

        </div>

      </div>

    </article>
  );
}


// =========================================================
// INFO BOX
// =========================================================

function InfoBox({
  icon: Icon,
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

      <div
        className="
          flex
          items-center
          gap-1.5
        "
      >

        <Icon
          size={13}
          className="
            text-[#0075FF]
          "
        />

        <p
          className="
            text-[10px]
            text-slate-400
          "
        >
          {label}
        </p>

      </div>


      <p
        className="
          mt-1
          truncate
          text-xs
          font-semibold
          text-[#0B3A67]
        "
      >
        {value}
      </p>

    </div>
  );
}


// =========================================================
// QUICK ACTION
// =========================================================

function QuickAction({
  icon: Icon,
  label,
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-[#E4EDF7]
        p-3
        text-center
      "
    >

      <Icon
        size={17}
        className="
          mx-auto
          text-[#0075FF]
        "
      />

      <p
        className="
          mt-1.5
          text-[10px]
          font-semibold
          text-[#0B3A67]
        "
      >
        {label}
      </p>

    </div>
  );
}