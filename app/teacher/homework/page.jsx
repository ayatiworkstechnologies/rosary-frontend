"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  FileText,
  Loader2,
  Plus,
  X,
} from "lucide-react";

import {
  createTeacherHomework,
  getTeacherClasses,
  getTeacherHomework,
} from "@/services/teacherService";


function getToday() {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


export default function TeacherHomeworkPage() {
  const [classes, setClasses] =
    useState([]);

  const [
    selectedClassId,
    setSelectedClassId,
  ] = useState("");

  const [homework, setHomework] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    showForm,
    setShowForm,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [form, setForm] = useState({
    subject: "",
    title: "",
    description: "",
    assigned_date: getToday(),
    due_date: "",
    attachment_url: "",
  });


  // =========================================
  // LOAD CLASSES
  // =========================================

  useEffect(() => {
    const loadClasses = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getTeacherClasses();

        const classList = Array.isArray(data)
          ? data
          : data?.classes || [];

        setClasses(classList);

        if (classList.length > 0) {
          setSelectedClassId(
            String(classList[0].id)
          );
        }

      } catch (error) {
        console.error(error);

        setError(
          error.response?.data?.detail ||
          "Unable to load classes."
        );

      } finally {
        setLoading(false);
      }
    };

    loadClasses();

  }, []);


  // =========================================
  // LOAD HOMEWORK
  // =========================================

  const loadHomework = async (
    classId
  ) => {
    if (!classId) return;

    try {
      setLoading(true);
      setError("");

      const data =
        await getTeacherHomework(
          classId
        );

      setHomework(
        Array.isArray(data)
          ? data
          : data?.homework || []
      );

    } catch (error) {
      console.error(error);

      setHomework([]);

      setError(
        error.response?.data?.detail ||
        "Unable to load homework."
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (!selectedClassId) return;

    let cancelled = false;

    const fetchHomework = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getTeacherHomework(
            selectedClassId
          );

        if (!cancelled) {
          setHomework(
            Array.isArray(data)
              ? data
              : data?.homework || []
          );
        }

      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setHomework([]);

          setError(
            error.response?.data?.detail ||
            "Unable to load homework."
          );
        }

      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchHomework();

    return () => {
      cancelled = true;
    };
  }, [selectedClassId]);


  // =========================================
  // FORM CHANGE
  // =========================================

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };


  // =========================================
  // RESET FORM
  // =========================================

  const resetForm = () => {
    setForm({
      subject: "",
      title: "",
      description: "",
      assigned_date: getToday(),
      due_date: "",
      attachment_url: "",
    });
  };


  // =========================================
  // SAVE HOMEWORK
  // =========================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!selectedClassId) {
      setError(
        "Please select a class."
      );

      return;
    }

    if (!form.subject.trim()) {
      setError(
        "Please enter subject."
      );

      return;
    }

    if (!form.title.trim()) {
      setError(
        "Please enter homework title."
      );

      return;
    }

    if (!form.due_date) {
      setError(
        "Please select due date."
      );

      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        subject:
          form.subject.trim(),

        title:
          form.title.trim(),

        description:
          form.description.trim()
            ? form.description.trim()
            : null,

        assigned_date:
          form.assigned_date,

        due_date:
          form.due_date,

        attachment_url:
          form.attachment_url.trim()
            ? form.attachment_url.trim()
            : null,
      };

      await createTeacherHomework(
        selectedClassId,
        payload
      );

      setSuccess(
        "Homework added successfully."
      );

      resetForm();

      setShowForm(false);

      await loadHomework(
        selectedClassId
      );

    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
        "Unable to add homework."
      );

    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="mx-auto max-w-[1400px]">

      {/* =========================================
          HEADER
      ========================================== */}

      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >

        <div>

          <h1 className="text-2xl font-bold text-[#0B3A67]">
            Homework
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create and manage homework for your students.
          </p>

        </div>

        <button
          type="button"
          onClick={() => {
            setShowForm(true);
            setError("");
            setSuccess("");
          }}
          className="
            flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-[#0075FF]
            px-5
            py-3
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-[#0065DD]
          "
        >
          <Plus size={18} />

          Add Homework
        </button>

      </div>


      {/* =========================================
          CLASS SELECTOR
      ========================================== */}

      <div
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

        <label className="mb-2 block text-xs font-semibold text-[#0B3A67]">
          Select Class
        </label>

        <div className="relative max-w-[320px]">

          <select
            value={selectedClassId}
            onChange={(event) =>
              setSelectedClassId(
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

            {classes.map(
              (schoolClass) => (
                <option
                  key={schoolClass.id}
                  value={schoolClass.id}
                >
                  {
                    schoolClass.display_name
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

      </div>


      {/* ERROR */}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}


      {/* SUCCESS */}

      {success && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-600">
          {success}
        </div>
      )}


      {/* =========================================
          HOMEWORK LIST
      ========================================== */}

      <section className="mt-5">

        <div className="mb-4">

          <h2 className="font-bold text-[#0B3A67]">
            Assigned Homework
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            {homework.length} homework item(s)
          </p>

        </div>


        {loading && (
          <div
            className="
              flex
              items-center
              justify-center
              gap-3
              rounded-2xl
              border
              border-[#E4EDF7]
              bg-white
              py-16
              text-sm
              text-slate-500
            "
          >
            <Loader2
              size={20}
              className="animate-spin text-[#0075FF]"
            />

            Loading homework...
          </div>
        )}


        {!loading &&
          homework.length === 0 && (
            <div
              className="
                rounded-2xl
                border
                border-[#E4EDF7]
                bg-white
                py-16
                text-center
              "
            >

              <BookOpen
                size={38}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-3 font-semibold text-[#0B3A67]">
                No homework yet
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Click Add Homework to create your first assignment.
              </p>

            </div>
          )}


        {!loading &&
          homework.length > 0 && (
            <div
              className="
                grid
                gap-4
                md:grid-cols-2
                xl:grid-cols-3
              "
            >
              {homework.map(
                (item) => (
                  <HomeworkCard
                    key={item.id}
                    item={item}
                  />
                )
              )}
            </div>
          )}

      </section>


      {/* =========================================
          ADD HOMEWORK MODAL
      ========================================== */}

      {showForm && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-slate-950/40
            p-4
            backdrop-blur-sm
          "
        >

          <div
            className="
              max-h-[90vh]
              w-full
              max-w-[620px]
              overflow-y-auto
              rounded-3xl
              bg-white
              shadow-2xl
            "
          >

            {/* MODAL HEADER */}

            <div
              className="
                sticky
                top-0
                z-10
                flex
                items-center
                justify-between
                border-b
                border-slate-100
                bg-white
                px-5
                py-4
                sm:px-6
              "
            >

              <div>

                <h2 className="text-lg font-bold text-[#0B3A67]">
                  Add Homework
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Create a new assignment.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowForm(false)
                }
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-slate-100
                  text-slate-500
                "
              >
                <X size={18} />
              </button>

            </div>


            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="p-5 sm:p-6"
            >

              <div className="grid gap-4 sm:grid-cols-2">

                <FormField
                  label="Subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Mathematics"
                />

                <FormField
                  label="Homework Title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Algebra Worksheet 5"
                />

              </div>


              <div className="mt-4">

                <label className="mb-2 block text-xs font-semibold text-[#0B3A67]">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter homework instructions..."
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-[#DCE8F5]
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-[#0075FF]
                  "
                />

              </div>


              <div className="mt-4 grid gap-4 sm:grid-cols-2">

                <FormField
                  label="Assigned Date"
                  type="date"
                  name="assigned_date"
                  value={
                    form.assigned_date
                  }
                  onChange={handleChange}
                />

                <FormField
                  label="Due Date"
                  type="date"
                  name="due_date"
                  value={form.due_date}
                  onChange={handleChange}
                />

              </div>


              <div className="mt-4">

                <FormField
                  label="Attachment URL (Optional)"
                  name="attachment_url"
                  value={
                    form.attachment_url
                  }
                  onChange={handleChange}
                  placeholder="https://..."
                />

              </div>


              <div
                className="
                  mt-6
                  flex
                  flex-col-reverse
                  gap-3
                  sm:flex-row
                  sm:justify-end
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    setShowForm(false)
                  }
                  className="
                    rounded-xl
                    border
                    border-slate-200
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-slate-600
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-[#0075FF]
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    disabled:opacity-50
                  "
                >

                  {saving ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />

                      Add Homework
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}


/* =========================================
   HOMEWORK CARD
========================================= */

function HomeworkCard({
  item,
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-[#E4EDF7]
        bg-white
        p-5
        shadow-sm
        transition
        hover:border-[#0075FF]/30
        hover:shadow-md
      "
    >

      <div className="flex items-start justify-between gap-3">

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
          <BookOpen size={20} />
        </div>

        <span
          className="
            rounded-full
            bg-green-50
            px-3
            py-1
            text-[10px]
            font-semibold
            text-green-600
          "
        >
          Active
        </span>

      </div>


      <p className="mt-4 text-xs font-semibold uppercase text-[#0075FF]">
        {item.subject}
      </p>

      <h3 className="mt-1 font-bold text-[#0B3A67]">
        {item.title}
      </h3>

      {item.description && (
        <p
          className="
            mt-2
            line-clamp-2
            text-xs
            leading-5
            text-slate-500
          "
        >
          {item.description}
        </p>
      )}


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
          icon={CalendarDays}
          label="Assigned"
          value={item.assigned_date}
        />

        <InfoRow
          icon={CalendarDays}
          label="Due"
          value={item.due_date}
        />

        {item.attachment_url && (
          <InfoRow
            icon={FileText}
            label="Attachment"
            value="Available"
          />
        )}

      </div>

    </div>
  );
}


function InfoRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-2">

      <Icon
        size={14}
        className="text-[#0075FF]"
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


function FormField({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>

      <label className="mb-2 block text-xs font-semibold text-[#0B3A67]">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          w-full
          rounded-xl
          border
          border-[#DCE8F5]
          px-4
          py-3
          text-sm
          text-slate-700
          outline-none
          focus:border-[#0075FF]
          focus:ring-2
          focus:ring-[#0075FF]/10
        "
      />

    </div>
  );
}
