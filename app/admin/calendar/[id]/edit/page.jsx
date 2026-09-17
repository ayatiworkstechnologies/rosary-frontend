"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  useParams,
  useRouter,
} from "next/navigation";

import AdminShell from "@/components/admin/AdminShell";

import {
  getAdminCalendarEvent,
  updateAdminCalendarEvent,
} from "@/services/adminCalendarService";

import {
  getAdminClasses,
} from "@/services/adminClassService";

import {
  ArrowLeft,
  Save,
  RefreshCw,
  AlertCircle,
  CalendarDays,
} from "lucide-react";


export default function EditCalendarEventPage() {
  const params = useParams();
  const router = useRouter();

  const eventId = params.id;

  const [classes, setClasses] =
    useState([]);

  const [form, setForm] =
    useState({
      title: "",
      event_type: "GENERAL",
      description: "",
      start_date: "",
      end_date: "",
      start_time: "",
      end_time: "",
      location: "",
      audience: "ALL",
      class_id: "",
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");


  // =====================================================
  // LOAD EVENT + CLASSES
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [
          eventResponse,
          classesResponse,
        ] = await Promise.all([
          getAdminCalendarEvent(
            eventId
          ),

          getAdminClasses(),
        ]);

        if (cancelled) {
          return;
        }

        const event =
          eventResponse?.data;

        if (!event) {
          setError(
            "Event data not found."
          );
          return;
        }

        setForm({
          title:
            event.title || "",

          event_type:
            event.event_type ||
            "GENERAL",

          description:
            event.description ||
            "",

          start_date:
            event.start_date ||
            "",

          end_date:
            event.end_date ||
            "",

          start_time:
            event.start_time
              ? String(
                  event.start_time
                ).slice(0, 5)
              : "",

          end_time:
            event.end_time
              ? String(
                  event.end_time
                ).slice(0, 5)
              : "",

          location:
            event.location ||
            "",

          audience:
            event.audience ||
            "ALL",

          class_id:
            event.class_id
              ? String(
                  event.class_id
                )
              : "",
        });

        setClasses(
          Array.isArray(
            classesResponse?.data
          )
            ? classesResponse.data
            : []
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Load calendar event error:",
          error
        );

        setError(
          error?.message ||
            "Unable to load event."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (eventId) {
      loadData();
    }

    return () => {
      cancelled = true;
    };
  }, [eventId]);


  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((current) => ({
      ...current,

      [name]: value,

      ...(name === "audience" &&
      value !== "CLASS"
        ? {
            class_id: "",
          }
        : {}),
    }));
  };


  // =====================================================
  // UPDATE EVENT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.title.trim()) {
      setError(
        "Event title is required."
      );
      return;
    }

    if (!form.event_type.trim()) {
      setError(
        "Event type is required."
      );
      return;
    }

    if (!form.start_date) {
      setError(
        "Start date is required."
      );
      return;
    }

    if (
      form.end_date &&
      form.end_date <
        form.start_date
    ) {
      setError(
        "End date cannot be before start date."
      );
      return;
    }

    if (
      form.audience === "CLASS" &&
      !form.class_id
    ) {
      setError(
        "Please select a class."
      );
      return;
    }

    if (
      (!form.end_date ||
        form.end_date ===
          form.start_date) &&
      form.start_time &&
      form.end_time &&
      form.end_time <
        form.start_time
    ) {
      setError(
        "End time cannot be before start time."
      );
      return;
    }

    try {
      setSaving(true);

      await updateAdminCalendarEvent(
        eventId,
        {
          title:
            form.title.trim(),

          event_type:
            form.event_type.trim(),

          description:
            form.description.trim() ||
            null,

          start_date:
            form.start_date,

          end_date:
            form.end_date ||
            null,

          start_time:
            form.start_time
              ? `${form.start_time}:00`
              : null,

          end_time:
            form.end_time
              ? `${form.end_time}:00`
              : null,

          location:
            form.location.trim() ||
            null,

          audience:
            form.audience,

          class_id:
            form.audience ===
            "CLASS"
              ? Number(
                  form.class_id
                )
              : null,
        }
      );

      router.push(
        "/admin/calendar"
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Update calendar event error:",
        error
      );

      setError(
        error?.message ||
          "Unable to update event."
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
              Loading event...
            </p>
          </div>
        </div>
      </AdminShell>
    );
  }


  return (
    <AdminShell>

      {/* ================================================= */}
      {/* BACK */}
      {/* ================================================= */}

      <Link
        href="/admin/calendar"
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#0075FF]"
      >
        <ArrowLeft size={17} />

        Back to Calendar
      </Link>


      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <section className="mb-6">

        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
          Edit School Event
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Update event information,
          dates, audience and location.
        </p>

      </section>


      {/* ================================================= */}
      {/* FORM */}
      {/* ================================================= */}

      <form
        onSubmit={handleSubmit}
        className="max-w-5xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
      >

        {/* FORM HEADER */}

        <div className="flex items-center gap-3 border-b border-gray-100 p-6">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0075FF]">
            <CalendarDays
              size={20}
            />
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">
              Event Information
            </h2>

            <p className="text-sm text-gray-500">
              Modify the school
              calendar event.
            </p>
          </div>

        </div>


        {/* BODY */}

        <div className="space-y-5 p-6">

          {/* ERROR */}

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0 text-red-500"
              />

              <div>
                <p className="text-sm font-semibold text-red-700">
                  Unable to save event
                </p>

                <p className="mt-1 text-xs text-red-600">
                  {error}
                </p>
              </div>

            </div>
          )}


          {/* TITLE */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Event Title *
            </label>

            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className={inputClass}
              placeholder="Annual Sports Day"
            />

          </div>


          {/* TYPE + AUDIENCE */}

          <div className="grid gap-5 md:grid-cols-2">

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Event Type *
              </label>

              <select
                name="event_type"
                value={
                  form.event_type
                }
                onChange={handleChange}
                className={inputClass}
              >
                <option value="GENERAL">
                  General
                </option>

                <option value="EXAM">
                  Exam
                </option>

                <option value="HOLIDAY">
                  Holiday
                </option>

                <option value="SPORTS">
                  Sports
                </option>

                <option value="MEETING">
                  Meeting
                </option>

                <option value="CULTURAL">
                  Cultural
                </option>

                <option value="ACTIVITY">
                  Activity
                </option>
              </select>

            </div>


            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Audience *
              </label>

              <select
                name="audience"
                value={
                  form.audience
                }
                onChange={handleChange}
                className={inputClass}
              >
                <option value="ALL">
                  Everyone
                </option>

                <option value="TEACHER">
                  Teachers
                </option>

                <option value="PARENT">
                  Parents
                </option>

                <option value="CLASS">
                  Specific Class
                </option>
              </select>

            </div>

          </div>


          {/* CLASS */}

          {form.audience ===
            "CLASS" && (

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Select Class *
              </label>

              <select
                name="class_id"
                value={
                  form.class_id
                }
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">
                  Select Class
                </option>

                {classes.map(
                  (item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name} -{" "}
                      {item.section} (
                      {
                        item.academic_year
                      }
                      )
                    </option>
                  )
                )}
              </select>

            </div>

          )}


          {/* DESCRIPTION */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Description
            </label>

            <textarea
              name="description"
              value={
                form.description
              }
              onChange={handleChange}
              rows={5}
              placeholder="Enter event description..."
              className="w-full resize-none rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700 outline-none transition focus:border-[#0075FF] focus:ring-2 focus:ring-blue-50"
            />

          </div>


          {/* DATES */}

          <div className="grid gap-5 md:grid-cols-2">

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Start Date *
              </label>

              <input
                type="date"
                name="start_date"
                value={
                  form.start_date
                }
                onChange={handleChange}
                className={inputClass}
              />

            </div>


            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                End Date
              </label>

              <input
                type="date"
                name="end_date"
                value={
                  form.end_date
                }
                onChange={handleChange}
                min={
                  form.start_date ||
                  undefined
                }
                className={inputClass}
              />

            </div>

          </div>


          {/* TIMES */}

          <div className="grid gap-5 md:grid-cols-2">

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Start Time
              </label>

              <input
                type="time"
                name="start_time"
                value={
                  form.start_time
                }
                onChange={handleChange}
                className={inputClass}
              />

            </div>


            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                End Time
              </label>

              <input
                type="time"
                name="end_time"
                value={
                  form.end_time
                }
                onChange={handleChange}
                className={inputClass}
              />

            </div>

          </div>


          {/* LOCATION */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Location
            </label>

            <input
              type="text"
              name="location"
              value={
                form.location
              }
              onChange={handleChange}
              className={inputClass}
              placeholder="School Ground / Auditorium / Classroom"
            />

          </div>

        </div>


        {/* FOOTER */}

        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 p-5 sm:flex-row sm:justify-end">

          <Link
            href="/admin/calendar"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0075FF] px-5 text-sm font-semibold text-white transition hover:bg-[#0067DF] disabled:cursor-not-allowed disabled:opacity-50"
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

    </AdminShell>
  );
}