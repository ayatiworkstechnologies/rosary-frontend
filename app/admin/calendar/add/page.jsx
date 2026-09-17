"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import AdminShell from "@/components/admin/AdminShell";

import {
  createAdminCalendarEvent,
} from "@/services/adminCalendarService";

import {
  getAdminClasses,
} from "@/services/adminClassService";

import {
  ArrowLeft,
  Save,
  AlertCircle,
  CalendarPlus,
} from "lucide-react";

export default function AddCalendarEventPage() {
  const router = useRouter();

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
      is_active: true,
    });

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");


  useEffect(() => {
    let cancelled = false;

    async function loadClasses() {
      try {
        const response =
          await getAdminClasses();

        if (cancelled) {
          return;
        }

        setClasses(
          Array.isArray(response?.data)
            ? response.data.filter(
                (item) =>
                  item.is_active
              )
            : []
        );
      } catch (error) {
        console.error(
          "Load classes error:",
          error
        );
      }
    }

    loadClasses();

    return () => {
      cancelled = true;
    };
  }, []);


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

      ...(name === "audience" &&
      value !== "CLASS"
        ? {
            class_id: "",
          }
        : {}),
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.title.trim()) {
      setError(
        "Event title is required."
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
      form.audience === "CLASS" &&
      !form.class_id
    ) {
      setError(
        "Please select a class."
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

    try {
      setSaving(true);

      await createAdminCalendarEvent({
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
          form.audience === "CLASS"
            ? Number(
                form.class_id
              )
            : null,

        created_by:
          null,

        is_active:
          form.is_active,
      });

      router.push(
        "/admin/calendar"
      );

      router.refresh();

    } catch (error) {

      setError(
        error?.message ||
          "Unable to create event."
      );

    } finally {

      setSaving(false);

    }
  };


  const inputClass =
    "h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#0075FF]";


  return (
    <AdminShell>

      <Link
        href="/admin/calendar"
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#0075FF]"
      >
        <ArrowLeft size={17} />

        Back to Calendar
      </Link>


      <h1 className="text-2xl font-bold text-gray-900">
        Add School Event
      </h1>

      <p className="mt-1 text-sm text-gray-500">
        Add an event to the school calendar.
      </p>


      <form
        onSubmit={handleSubmit}
        className="mt-6 max-w-5xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
      >

        <div className="flex items-center gap-3 border-b border-gray-100 p-6">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0075FF]">
            <CalendarPlus
              size={20}
            />
          </div>

          <div>

            <h2 className="font-semibold text-gray-900">
              Event Information
            </h2>

            <p className="text-sm text-gray-500">
              Enter the school event details.
            </p>

          </div>

        </div>


        <div className="space-y-5 p-6">

          {error && (
            <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">

              <AlertCircle
                size={18}
              />

              {error}

            </div>
          )}


          <div>
            <label className="mb-2 block text-sm font-semibold">
              Event Title *
            </label>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className={inputClass}
              placeholder="Annual Sports Day"
            />
          </div>


          <div className="grid gap-5 md:grid-cols-2">

            <div>

              <label className="mb-2 block text-sm font-semibold">
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

              <label className="mb-2 block text-sm font-semibold">
                Audience
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


          {form.audience ===
            "CLASS" && (

            <div>

              <label className="mb-2 block text-sm font-semibold">
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


          <div>

            <label className="mb-2 block text-sm font-semibold">
              Description
            </label>

            <textarea
              name="description"
              value={
                form.description
              }
              onChange={handleChange}
              rows={5}
              className="w-full rounded-xl border border-gray-200 p-4 text-sm outline-none focus:border-[#0075FF]"
            />

          </div>


          <div className="grid gap-5 md:grid-cols-2">

            <div>

              <label className="mb-2 block text-sm font-semibold">
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

              <label className="mb-2 block text-sm font-semibold">
                End Date
              </label>

              <input
                type="date"
                name="end_date"
                value={
                  form.end_date
                }
                onChange={handleChange}
                className={inputClass}
              />

            </div>

          </div>


          <div className="grid gap-5 md:grid-cols-2">

            <div>

              <label className="mb-2 block text-sm font-semibold">
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

              <label className="mb-2 block text-sm font-semibold">
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


          <div>

            <label className="mb-2 block text-sm font-semibold">
              Location
            </label>

            <input
              name="location"
              value={
                form.location
              }
              onChange={handleChange}
              className={inputClass}
              placeholder="School Ground / Auditorium"
            />

          </div>


          <label className="flex items-center gap-3">

            <input
              type="checkbox"
              name="is_active"
              checked={
                form.is_active
              }
              onChange={handleChange}
              className="h-4 w-4"
            />

            <span className="text-sm font-semibold text-gray-700">
              Publish this event
            </span>

          </label>

        </div>


        <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 p-5">

          <Link
            href="/admin/calendar"
            className="inline-flex h-11 items-center rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-600"
          >
            Cancel
          </Link>

          <button
            disabled={saving}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0075FF] px-5 text-sm font-semibold text-white disabled:opacity-50"
          >
            <Save size={17} />

            {saving
              ? "Creating..."
              : "Create Event"}
          </button>

        </div>

      </form>

    </AdminShell>
  );
}