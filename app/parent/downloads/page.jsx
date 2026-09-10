"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ChevronDown,
  Download,
  FileText,
  FolderOpen,
  Loader2,
  Search,
} from "lucide-react";

import {
  getParentChildren,
  getParentDownloadForms,
} from "@/services/parentService";


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

export default function ParentDownloadsPage() {
  const [
    children,
    setChildren,
  ] = useState([]);

  const [
    selectedStudentId,
    setSelectedStudentId,
  ] = useState("");

  const [
    forms,
    setForms,
  ] = useState([]);

  const [
    category,
    setCategory,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    initialLoading,
    setInitialLoading,
  ] = useState(true);

  const [
    formsLoading,
    setFormsLoading,
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


        setChildren(
          Array.isArray(
            data?.children
          )
            ? data.children
            : []
        );

      } catch (err) {
        console.error(
          "Download children:",
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
  // FORMS
  // =======================================================

  useEffect(() => {
    let cancelled = false;


    async function loadForms() {
      try {
        const data =
          await getParentDownloadForms(
            {
              studentId:
                selectedStudentId,

              category,

              search,
            }
          );


        if (cancelled) {
          return;
        }


        setForms(
          Array.isArray(
            data?.forms
          )
            ? data.forms
            : []
        );


        setError("");

      } catch (err) {
        console.error(
          "Download forms:",
          err
        );


        if (!cancelled) {
          setForms([]);

          setError(
            err?.response
              ?.data
              ?.detail ||
            "Unable to load download forms."
          );
        }

      } finally {
        if (!cancelled) {
          setFormsLoading(
            false
          );
        }
      }
    }


    const timer =
      setTimeout(
        loadForms,
        250
      );


    return () => {
      cancelled = true;

      clearTimeout(
        timer
      );
    };

  }, [
    selectedStudentId,
    category,
    search,
  ]);


  // =======================================================
  // CATEGORY COUNTS
  // =======================================================

  const certificateCount =
    useMemo(
      () =>
        forms.filter(
          (item) =>
            item.category ===
            "CERTIFICATE"
        ).length,
      [
        forms,
      ]
    );


  // =======================================================
  // INITIAL LOADING
  // =======================================================

  if (initialLoading) {
    return (
      <LoadingState
        text="Loading forms..."
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
          Download Forms
        </h1>

        <p
          className="
            mt-1
            text-sm
            text-slate-500
          "
        >
          Download school forms,
          applications and certificate requests.
        </p>

      </div>


      {/* SUMMARY */}

      <section
        className="
          mt-6
          grid
          grid-cols-1
          gap-3
          sm:grid-cols-2
        "
      >

        <SummaryCard
          title="Available Forms"
          value={
            forms.length
          }
          icon={
            FolderOpen
          }
        />


        <SummaryCard
          title="Certificates"
          value={
            certificateCount
          }
          icon={
            FileText
          }
        />

      </section>


      {/* FILTERS */}

      <section
        className="
          mt-5
          grid
          gap-3
          rounded-2xl
          border
          border-[#E4EDF7]
          bg-white
          p-4
          shadow-sm
          lg:grid-cols-[1fr_220px_220px]
        "
      >

        {/* SEARCH */}

        <div
          className="
            flex
            items-center
            rounded-xl
            border
            border-[#DCE8F5]
            px-3
          "
        >

          <Search
            size={17}
            className="
              text-slate-400
            "
          />


          <input
            value={search}
            onChange={(
              event
            ) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search forms..."
            className="
              w-full
              bg-transparent
              px-3
              py-3
              text-sm
              outline-none
            "
          />

        </div>


        {/* CHILD */}

        <SelectField
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
        >

          <option value="">
            All Children
          </option>


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
                  child.class_name
                }
              </option>
            )
          )}

        </SelectField>


        {/* CATEGORY */}

        <SelectField
          value={
            category
          }
          onChange={(
            event
          ) =>
            setCategory(
              event.target.value
            )
          }
        >

          <option value="">
            All Categories
          </option>

          <option value="APPLICATION">
            Applications
          </option>

          <option value="CERTIFICATE">
            Certificates
          </option>

          <option value="TRANSPORT">
            Transport
          </option>

          <option value="GENERAL">
            General
          </option>

        </SelectField>

      </section>


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

      {formsLoading && (
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

          Loading forms...
        </div>
      )}


      {/* FORMS */}

      {!formsLoading &&
        forms.length > 0 && (
        <section
          className="
            mt-5
            grid
            gap-4
            md:grid-cols-2
            xl:grid-cols-3
          "
        >

          {forms.map(
            (item) => (
              <FormCard
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
      )}


      {!formsLoading &&
        forms.length === 0 &&
        !error && (
        <EmptyForms />
      )}

    </div>
  );
}


// =========================================================
// FORM CARD
// =========================================================

function FormCard({
  item,
}) {
  return (
    <article
      className="
        flex
        flex-col
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
          <FileText
            size={20}
          />
        </div>


        <span
          className="
            rounded-full
            bg-[#EAF4FF]
            px-3
            py-1
            text-[10px]
            font-semibold
            text-[#0075FF]
          "
        >
          {item.category}
        </span>

      </div>


      <h2
        className="
          mt-4
          text-base
          font-bold
          text-[#0B3A67]
        "
      >
        {item.title}
      </h2>


      {item.description && (
        <p
          className="
            mt-2
            flex-1
            text-sm
            leading-6
            text-slate-500
          "
        >
          {item.description}
        </p>
      )}


      <p
        className="
          mt-4
          text-[11px]
          text-slate-400
        "
      >
        Published:{" "}
        {
          formatDate(
            item.published_date
          )
        }
      </p>


      {item.audience ===
        "CLASS" &&
        item.class_name && (
        <p
          className="
            mt-1
            text-[11px]
            font-semibold
            text-[#0075FF]
          "
        >
          Class:{" "}
          {item.class_name}
        </p>
      )}


      <a
        href={
          item.file_url
        }
        download={
          item.file_name
        }
        target="_blank"
        rel="noopener noreferrer"
        className="
          mt-5
          inline-flex
          items-center
          justify-center
          gap-2
          rounded-xl
          bg-[#0075FF]
          px-4
          py-3
          text-xs
          font-semibold
          text-white
          transition
          hover:bg-[#0065DD]
        "
      >
        <Download
          size={16}
        />

        Download Form
      </a>

    </article>
  );
}


// =========================================================
// SELECT
// =========================================================

function SelectField({
  value,
  onChange,
  children,
}) {
  return (
    <div
      className="
        relative
      "
    >

      <select
        value={value}
        onChange={onChange}
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
        {children}
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
  );
}


// =========================================================
// SUMMARY
// =========================================================

function SummaryCard({
  title,
  value,
  icon: Icon,
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-4
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
          h-12
          w-12
          items-center
          justify-center
          rounded-xl
          bg-[#EAF4FF]
          text-[#0075FF]
        "
      >
        <Icon
          size={21}
        />
      </div>


      <div>

        <p
          className="
            text-xs
            text-slate-500
          "
        >
          {title}
        </p>

        <p
          className="
            mt-1
            text-xl
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

function EmptyForms() {
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

      <FolderOpen
        size={42}
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
        No forms available
      </h3>

      <p
        className="
          mt-1
          text-sm
          text-slate-400
        "
      >
        Downloadable school forms
        will appear here.
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
          {text}
        </p>

      </div>

    </div>
  );
}