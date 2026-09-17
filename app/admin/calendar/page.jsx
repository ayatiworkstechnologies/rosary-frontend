"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import AdminShell from "@/components/admin/AdminShell";

import {
  getAdminCalendarEvents,
  updateAdminCalendarEventStatus,
  deleteAdminCalendarEvent,
} from "@/services/adminCalendarService";

import {
  Plus,
  Search,
  CalendarDays,
  Pencil,
  Trash2,
  RefreshCw,
  Power,
  PowerOff,
  AlertCircle,
  MapPin,
} from "lucide-react";

export default function AdminCalendarPage() {
  const [events, setEvents] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [audienceFilter, setAudienceFilter] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [statusLoadingId, setStatusLoadingId] =
    useState(null);

  const [deletingId, setDeletingId] =
    useState(null);


  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      try {
        const response =
          await getAdminCalendarEvents();

        if (cancelled) {
          return;
        }

        setEvents(
          Array.isArray(response?.data)
            ? response.data
            : []
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        setError(
          error?.message ||
            "Unable to load school events."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);


  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getAdminCalendarEvents();

      setEvents(
        Array.isArray(response?.data)
          ? response.data
          : []
      );
    } catch (error) {
      setError(
        error?.message ||
          "Unable to load school events."
      );
    } finally {
      setLoading(false);
    }
  };


  const filteredEvents =
    useMemo(() => {
      const keyword = search
        .trim()
        .toLowerCase();

      return events.filter(
        (item) => {
          const text = `
            ${item.title || ""}
            ${item.event_type || ""}
            ${item.description || ""}
            ${item.location || ""}
            ${item.audience || ""}
          `.toLowerCase();

          const matchesSearch =
            !keyword ||
            text.includes(keyword);

          const matchesAudience =
            !audienceFilter ||
            item.audience ===
              audienceFilter;

          const matchesStatus =
            statusFilter === ""
              ? true
              : statusFilter ===
                "active"
              ? item.is_active
              : !item.is_active;

          return (
            matchesSearch &&
            matchesAudience &&
            matchesStatus
          );
        }
      );
    }, [
      events,
      search,
      audienceFilter,
      statusFilter,
    ]);


  const handleStatusChange =
    async (item) => {
      const newStatus =
        !item.is_active;

      const confirmed =
        window.confirm(
          newStatus
            ? `Activate "${item.title}"?`
            : `Deactivate "${item.title}"?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setStatusLoadingId(
          item.id
        );

        await updateAdminCalendarEventStatus(
          item.id,
          newStatus
        );

        setEvents((current) =>
          current.map((event) =>
            event.id === item.id
              ? {
                  ...event,
                  is_active:
                    newStatus,
                }
              : event
          )
        );
      } catch (error) {
        window.alert(
          error?.message ||
            "Unable to update event status."
        );
      } finally {
        setStatusLoadingId(null);
      }
    };


  const handleDelete =
    async (item) => {
      const confirmed =
        window.confirm(
          `Delete "${item.title}" permanently?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeletingId(item.id);

        await deleteAdminCalendarEvent(
          item.id
        );

        setEvents((current) =>
          current.filter(
            (event) =>
              event.id !== item.id
          )
        );
      } catch (error) {
        window.alert(
          error?.message ||
            "Unable to delete event."
        );
      } finally {
        setDeletingId(null);
      }
    };


  return (
    <AdminShell>

      {/* HEADER */}

      <section className="mb-6">

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              School Calendar
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage school events,
              exams, holidays and
              activities.
            </p>

          </div>

          <Link
            href="/admin/calendar/add"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0075FF] px-5 text-sm font-semibold text-white hover:bg-[#0067DF]"
          >
            <Plus size={18} />

            Add Event
          </Link>

        </div>

      </section>


      {/* SUMMARY */}

      <section className="mb-5 grid gap-4 sm:grid-cols-3">

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">

          <p className="text-sm text-gray-500">
            Total Events
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {events.length}
          </p>

        </div>


        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">

          <p className="text-sm text-gray-500">
            Active
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            {
              events.filter(
                (item) =>
                  item.is_active
              ).length
            }
          </p>

        </div>


        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">

          <p className="text-sm text-gray-500">
            Inactive
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-600">
            {
              events.filter(
                (item) =>
                  !item.is_active
              ).length
            }
          </p>

        </div>

      </section>


      {/* FILTERS */}

      <section className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">

        <div className="grid gap-3 lg:grid-cols-[1fr_180px_160px_auto]">

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
              placeholder="Search events..."
              className="h-11 w-full rounded-xl border border-gray-200 pl-11 pr-4 text-sm outline-none focus:border-[#0075FF]"
            />

          </div>


          <select
            value={audienceFilter}
            onChange={(e) =>
              setAudienceFilter(
                e.target.value
              )
            }
            className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm"
          >

            <option value="">
              All Audience
            </option>

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


          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm"
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
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
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


      {/* ERROR */}

      {error && (
        <div className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">

          <AlertCircle size={18} />

          {error}

        </div>
      )}


      {/* TABLE */}

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1150px]">

            <thead className="bg-gray-50">

              <tr>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Event
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Type
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Date
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Location
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Audience
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Status
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-gray-500">
                  Actions
                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-gray-100">

              {loading ? (

                <tr>

                  <td
                    colSpan={7}
                    className="px-6 py-14 text-center"
                  >

                    <RefreshCw
                      size={25}
                      className="mx-auto animate-spin text-[#0075FF]"
                    />

                    <p className="mt-3 text-sm text-gray-500">
                      Loading events...
                    </p>

                  </td>

                </tr>

              ) : filteredEvents.length === 0 ? (

                <tr>

                  <td
                    colSpan={7}
                    className="px-6 py-14 text-center"
                  >

                    <CalendarDays
                      size={30}
                      className="mx-auto text-[#0075FF]"
                    />

                    <p className="mt-3 font-semibold text-gray-700">
                      No events found
                    </p>

                  </td>

                </tr>

              ) : (

                filteredEvents.map(
                  (item) => (

                    <tr
                      key={item.id}
                      className="hover:bg-gray-50"
                    >

                      <td className="px-6 py-4">

                        <p className="text-sm font-semibold text-gray-800">
                          {item.title}
                        </p>

                        <p className="mt-1 max-w-[320px] truncate text-xs text-gray-500">
                          {item.description ||
                            "No description"}
                        </p>

                      </td>


                      <td className="px-6 py-4">

                        <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                          {item.event_type}
                        </span>

                      </td>


                      <td className="px-6 py-4 text-sm text-gray-600">

                        <p>
                          {item.start_date}
                        </p>

                        {item.end_date &&
                          item.end_date !==
                            item.start_date && (
                            <p className="text-xs text-gray-400">
                              to{" "}
                              {
                                item.end_date
                              }
                            </p>
                          )}

                        {item.start_time && (
                          <p className="mt-1 text-xs text-gray-400">
                            {
                              item.start_time
                            }
                            {item.end_time
                              ? ` - ${item.end_time}`
                              : ""}
                          </p>
                        )}

                      </td>


                      <td className="px-6 py-4">

                        <div className="flex items-center gap-2 text-sm text-gray-600">

                          <MapPin
                            size={15}
                          />

                          {item.location ||
                            "-"}

                        </div>

                      </td>


                      <td className="px-6 py-4">

                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#0075FF]">
                          {item.audience}
                        </span>

                        {item.audience ===
                          "CLASS" &&
                          item.class && (

                            <p className="mt-1 text-xs text-gray-500">
                              {
                                item.class
                                  .name
                              }{" "}
                              -{" "}
                              {
                                item.class
                                  .section
                              }
                            </p>

                          )}

                      </td>


                      <td className="px-6 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.is_active
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >

                          {item.is_active
                            ? "Active"
                            : "Inactive"}

                        </span>

                      </td>


                      <td className="px-6 py-4">

                        <div className="flex justify-end gap-2">

                          <Link
                            href={`/admin/calendar/${item.id}/edit`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-blue-50 hover:text-[#0075FF]"
                          >
                            <Pencil
                              size={16}
                            />
                          </Link>


                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(
                                item
                              )
                            }
                            disabled={
                              statusLoadingId ===
                              item.id
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 disabled:opacity-50"
                          >

                            {statusLoadingId ===
                            item.id ? (

                              <RefreshCw
                                size={16}
                                className="animate-spin"
                              />

                            ) : item.is_active ? (

                              <PowerOff
                                size={16}
                              />

                            ) : (

                              <Power
                                size={16}
                              />

                            )}

                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                item
                              )
                            }
                            disabled={
                              deletingId ===
                              item.id
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-50"
                          >

                            {deletingId ===
                            item.id ? (

                              <RefreshCw
                                size={16}
                                className="animate-spin"
                              />

                            ) : (

                              <Trash2
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

      </section>

    </AdminShell>
  );
}