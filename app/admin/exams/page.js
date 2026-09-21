"use client";

import { useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  createAdminExam,
  deleteAdminExam,
  getAdminExams,
  updateAdminExam,
  updateAdminExamStatus,
} from "@/lib/admin-exams";

import AdminShell from "@/components/admin/AdminShell";


// ======================================================
// CONSTANTS
// ======================================================

const EMPTY_FORM = {
  name: "",
  academic_year: "2026-2027",
  start_date: "",
  end_date: "",
  is_active: true,
};


// ======================================================
// COMPONENT
// ======================================================

export default function AdminExamsPage() {
  const [
    exams,
    setExams,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    yearFilter,
    setYearFilter,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("");

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    editingExam,
    setEditingExam,
  ] = useState(null);

  const [
    form,
    setForm,
  ] = useState({
    ...EMPTY_FORM,
  });


  // ======================================================
  // BUILD FILTERS
  // ======================================================

  const buildFilters = () => {
    const filters = {};

    if (search.trim()) {
      filters.search =
        search.trim();
    }

    if (yearFilter) {
      filters.academic_year =
        yearFilter;
    }

    if (
      statusFilter !== ""
    ) {
      filters.is_active =
        statusFilter === "active";
    }

    return filters;
  };


  // ======================================================
  // LOAD EXAMS
  // ======================================================

  const loadExams = async () => {
    try {
      setLoading(true);
      setError("");

      const filters =
        buildFilters();

      const data =
        await getAdminExams(
          filters
        );

      console.log(
        "Admin Exams API:",
        data
      );

      if (
        Array.isArray(data)
      ) {
        setExams(data);
      } else if (
        Array.isArray(
          data?.items
        )
      ) {
        setExams(
          data.items
        );
      } else if (
        Array.isArray(
          data?.exams
        )
      ) {
        setExams(
          data.exams
        );
      } else {
        setExams([]);
      }
    } catch (err) {
      console.error(
        "Exam loading error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load exams."
      );

      setExams([]);
    } finally {
      setLoading(false);
    }
  };


  // ======================================================
  // LOAD ON FILTER CHANGE
  // ======================================================

  useEffect(() => {
    let cancelled = false;

    const timer =
      setTimeout(
        async () => {
          try {
            setLoading(true);
            setError("");

            const filters = {};

            if (
              search.trim()
            ) {
              filters.search =
                search.trim();
            }

            if (
              yearFilter
            ) {
              filters.academic_year =
                yearFilter;
            }

            if (
              statusFilter !==
              ""
            ) {
              filters.is_active =
                statusFilter ===
                "active";
            }

            const data =
              await getAdminExams(
                filters
              );

            if (cancelled) {
              return;
            }

            if (
              Array.isArray(
                data
              )
            ) {
              setExams(data);
            } else if (
              Array.isArray(
                data?.items
              )
            ) {
              setExams(
                data.items
              );
            } else if (
              Array.isArray(
                data?.exams
              )
            ) {
              setExams(
                data.exams
              );
            } else {
              setExams([]);
            }
          } catch (err) {
            console.error(
              "Exam loading error:",
              err
            );

            if (
              !cancelled
            ) {
              setError(
                err?.message ||
                  "Unable to load exams."
              );

              setExams([]);
            }
          } finally {
            if (
              !cancelled
            ) {
              setLoading(
                false
              );
            }
          }
        },
        300
      );

    return () => {
      cancelled = true;

      clearTimeout(
        timer
      );
    };
  }, [
    search,
    yearFilter,
    statusFilter,
  ]);


  // ======================================================
  // ACADEMIC YEAR OPTIONS
  // ======================================================

  const academicYears =
    useMemo(() => {
      const values =
        exams
          .map(
            (item) =>
              item.academic_year
          )
          .filter(Boolean);

      const uniqueYears = [
        ...new Set(values),
      ];

      if (
        !uniqueYears.includes(
          "2026-2027"
        )
      ) {
        uniqueYears.push(
          "2026-2027"
        );
      }

      return uniqueYears.sort();
    }, [exams]);


  // ======================================================
  // HANDLE INPUT CHANGE
  // ======================================================

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm(
      (previous) => ({
        ...previous,

        [name]:
          type ===
          "checkbox"
            ? checked
            : value,
      })
    );
  };


  // ======================================================
  // OPEN ADD MODAL
  // ======================================================

  const openAddModal = () => {
    setEditingExam(null);

    setForm({
      ...EMPTY_FORM,
    });

    setError("");
    setSuccess("");

    setModalOpen(true);
  };


  // ======================================================
  // OPEN EDIT MODAL
  // ======================================================

  const openEditModal = (
    exam
  ) => {
    setEditingExam(exam);

    setForm({
      name:
        exam?.name || "",

      academic_year:
        exam?.academic_year ||
        "2026-2027",

      start_date:
        exam?.start_date || "",

      end_date:
        exam?.end_date || "",

      is_active:
        Boolean(
          exam?.is_active
        ),
    });

    setError("");
    setSuccess("");

    setModalOpen(true);
  };


  // ======================================================
  // CLOSE MODAL
  // ======================================================

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);

    setEditingExam(null);

    setError("");

    setForm({
      ...EMPTY_FORM,
    });
  };


  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");
      setSuccess("");

      if (
        !form.name.trim()
      ) {
        setError(
          "Exam name is required."
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

      if (
        form.start_date &&
        form.end_date &&
        form.end_date <
          form.start_date
      ) {
        setError(
          "End date cannot be before start date."
        );

        return;
      }

      const payload = {
        name:
          form.name.trim(),

        academic_year:
          form.academic_year.trim(),

        start_date:
          form.start_date ||
          null,

        end_date:
          form.end_date ||
          null,

        is_active:
          form.is_active,
      };

      try {
        setSaving(true);

        if (
          editingExam
        ) {
          await updateAdminExam(
            editingExam.id,
            payload
          );

          setSuccess(
            "Exam updated successfully."
          );
        } else {
          await createAdminExam(
            payload
          );

          setSuccess(
            "Exam created successfully."
          );
        }

        setModalOpen(false);

        setEditingExam(
          null
        );

        setForm({
          ...EMPTY_FORM,
        });

        await loadExams();
      } catch (err) {
        console.error(
          "Exam save error:",
          err
        );

        setError(
          err?.message ||
            "Unable to save exam."
        );
      } finally {
        setSaving(false);
      }
    };


  // ======================================================
  // STATUS CHANGE
  // ======================================================

  const handleStatusChange =
    async (exam) => {
      try {
        setError("");
        setSuccess("");

        await updateAdminExamStatus(
          exam.id,
          !exam.is_active
        );

        setSuccess(
          exam.is_active
            ? "Exam deactivated successfully."
            : "Exam activated successfully."
        );

        await loadExams();
      } catch (err) {
        console.error(
          "Exam status error:",
          err
        );

        setError(
          err?.message ||
            "Unable to update exam status."
        );
      }
    };


  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete =
    async (exam) => {
      const confirmed =
        window.confirm(
          `Are you sure you want to delete "${exam.name}"?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setError("");
        setSuccess("");

        await deleteAdminExam(
          exam.id
        );

        setSuccess(
          "Exam deleted successfully."
        );

        await loadExams();
      } catch (err) {
        console.error(
          "Exam delete error:",
          err
        );

        setError(
          err?.message ||
            "Unable to delete exam."
        );
      }
    };


  // ======================================================
  // DATE FORMAT
  // ======================================================

  const formatDate = (
    value
  ) => {
    if (!value) {
      return "-";
    }

    return new Date(
      `${value}T00:00:00`
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };


  // ======================================================
  // RENDER
  // ======================================================

  return (
    <AdminShell>

      <div className="mx-auto max-w-[1500px]">


        {/* ============================================= */}
        {/* HEADER */}
        {/* ============================================= */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Exams
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Create and manage school
              examinations, academic years
              and examination periods.
            </p>

          </div>


          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0075FF] px-5 text-sm font-semibold text-white transition hover:bg-[#0066de]"
          >

            <Plus size={18} />

            Add Exam

          </button>

        </div>


        {/* ============================================= */}
        {/* SUCCESS */}
        {/* ============================================= */}

        {success && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">

            {success}

          </div>
        )}


        {/* ============================================= */}
        {/* ERROR */}
        {/* ============================================= */}

        {error &&
          !modalOpen && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">

              {error}

            </div>
          )}


        {/* ============================================= */}
        {/* FILTERS */}
        {/* EXACT SAME STYLE AS DOWNLOADS */}
        {/* ============================================= */}

        <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">

          <div className="grid gap-3 lg:grid-cols-[2fr_1fr_1fr]">


            {/* SEARCH */}

            <div className="relative">

              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search exams..."
                className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#0075FF]"
              />

            </div>


            {/* YEAR */}

            <select
              value={yearFilter}
              onChange={(event) =>
                setYearFilter(
                  event.target.value
                )
              }
              className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#0075FF]"
            >

              <option value="">
                All Academic Years
              </option>

              {academicYears.map(
                (year) => (

                  <option
                    key={year}
                    value={year}
                  >
                    {year}
                  </option>

                )
              )}

            </select>


            {/* STATUS */}

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#0075FF]"
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

          </div>

        </div>


        {/* ============================================= */}
        {/* TABLE */}
        {/* EXACT SAME STYLE AS DOWNLOADS */}
        {/* ============================================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {loading ? (

            <div className="flex min-h-[320px] flex-col items-center justify-center gap-3">

              <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-[#0075FF]" />

              <p className="text-sm text-slate-500">
                Loading exams...
              </p>

            </div>

          ) : exams.length === 0 ? (

            <div className="flex min-h-[350px] flex-col items-center justify-center p-8 text-center">

              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0075FF]">

                <CalendarDays
                  size={26}
                />

              </div>


              <h3 className="text-base font-bold text-slate-900">
                No exams found
              </h3>


              <p className="mt-1 text-sm text-slate-500">
                No exams match your
                current filters.
              </p>


              <button
                type="button"
                onClick={
                  openAddModal
                }
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0075FF] px-4 py-2.5 text-sm font-semibold text-white"
              >

                <Plus size={17} />

                Add Exam

              </button>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[950px]">


                {/* ===================================== */}
                {/* TABLE HEADER */}
                {/* ===================================== */}

                <thead>

                  <tr className="border-b border-slate-200 bg-slate-50">


                    <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                      Exam
                    </th>


                    <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                      Academic Year
                    </th>


                    <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                      Start Date
                    </th>


                    <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                      End Date
                    </th>


                    <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                      Status
                    </th>


                    <th className="px-5 py-4 text-right text-xs font-bold uppercase text-slate-500">
                      Actions
                    </th>

                  </tr>

                </thead>


                {/* ===================================== */}
                {/* TABLE BODY */}
                {/* ===================================== */}

                <tbody>

                  {exams.map(
                    (exam) => (

                      <tr
                        key={
                          exam.id
                        }
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >


                        {/* EXAM */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">


                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0075FF]">

                              <CalendarDays
                                size={19}
                              />

                            </div>


                            <div className="min-w-0">

                              <p className="max-w-[280px] truncate text-sm font-semibold text-slate-900">

                                {exam.name}

                              </p>


                              <p className="mt-1 text-xs text-slate-500">

                                Exam ID: {exam.id}

                              </p>

                            </div>

                          </div>

                        </td>


                        {/* YEAR */}

                        <td className="px-5 py-4">

                          <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700">

                            {
                              exam.academic_year
                            }

                          </span>

                        </td>


                        {/* START DATE */}

                        <td className="px-5 py-4 text-sm text-slate-600">

                          {formatDate(
                            exam.start_date
                          )}

                        </td>


                        {/* END DATE */}

                        <td className="px-5 py-4 text-sm text-slate-600">

                          {formatDate(
                            exam.end_date
                          )}

                        </td>


                        {/* STATUS */}

                        <td className="px-5 py-4">

                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(
                                exam
                              )
                            }
                            className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                              exam.is_active
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                            }`}
                          >

                            {exam.is_active
                              ? "Active"
                              : "Inactive"}

                          </button>

                        </td>


                        {/* ACTIONS */}

                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-2">


                            {/* EDIT */}

                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  exam
                                )
                              }
                              title="Edit"
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0075FF]"
                            >

                              <Pencil
                                size={16}
                              />

                            </button>


                            {/* DELETE */}

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  exam
                                )
                              }
                              title="Delete"
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            >

                              <Trash2
                                size={16}
                              />

                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>


      {/* ================================================= */}
      {/* ADD / EDIT MODAL */}
      {/* SAME STYLE AS DOWNLOADS */}
      {/* ================================================= */}

      {modalOpen && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">

          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">


            {/* ========================================= */}
            {/* MODAL HEADER */}
            {/* ========================================= */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 md:px-6">

              <div>

                <h2 className="text-lg font-bold text-slate-900">

                  {editingExam
                    ? "Edit Exam"
                    : "Add New Exam"}

                </h2>


                <p className="mt-1 text-xs text-slate-500">

                  {editingExam
                    ? "Update the examination details."
                    : "Create a new school examination."}

                </p>

              </div>


              <button
                type="button"
                onClick={
                  closeModal
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              >

                <X size={18} />

              </button>

            </div>


            {/* ========================================= */}
            {/* FORM */}
            {/* ========================================= */}

            <form
              onSubmit={
                handleSubmit
              }
              className="p-5 md:p-6"
            >


              {error && (

                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                  {error}

                </div>

              )}


              <div className="grid gap-5 md:grid-cols-2">


                {/* ===================================== */}
                {/* EXAM NAME */}
                {/* ===================================== */}

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-semibold text-slate-700">

                    Exam Name

                    <span className="text-red-500">
                      *
                    </span>

                  </label>


                  <input
                    type="text"
                    name="name"
                    value={
                      form.name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Quarterly Examination"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-[#0075FF] focus:ring-2 focus:ring-blue-100"
                  />

                </div>


                {/* ===================================== */}
                {/* ACADEMIC YEAR */}
                {/* ===================================== */}

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-semibold text-slate-700">

                    Academic Year

                    <span className="text-red-500">
                      *
                    </span>

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
                    placeholder="2026-2027"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-[#0075FF] focus:ring-2 focus:ring-blue-100"
                  />

                </div>


                {/* ===================================== */}
                {/* START DATE */}
                {/* ===================================== */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">

                    Start Date

                  </label>


                  <input
                    type="date"
                    name="start_date"
                    value={
                      form.start_date
                    }
                    onChange={
                      handleChange
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-[#0075FF]"
                  />

                </div>


                {/* ===================================== */}
                {/* END DATE */}
                {/* ===================================== */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">

                    End Date

                  </label>


                  <input
                    type="date"
                    name="end_date"
                    value={
                      form.end_date
                    }
                    min={
                      form.start_date ||
                      undefined
                    }
                    onChange={
                      handleChange
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-[#0075FF]"
                  />

                </div>


                {/* ===================================== */}
                {/* ACTIVE */}
                {/* ===================================== */}

                <div className="md:col-span-2">

                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4">

                    <div>

                      <p className="text-sm font-semibold text-slate-800">
                        Active Exam
                      </p>


                      <p className="mt-1 text-xs text-slate-500">
                        Active exams are
                        available for exam
                        schedules and results.
                      </p>

                    </div>


                    <input
                      type="checkbox"
                      name="is_active"
                      checked={
                        form.is_active
                      }
                      onChange={
                        handleChange
                      }
                      className="h-5 w-5 accent-[#0075FF]"
                    />

                  </label>

                </div>

              </div>


              {/* ========================================= */}
              {/* BUTTONS */}
              {/* ========================================= */}

              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">


                <button
                  type="button"
                  disabled={
                    saving
                  }
                  onClick={
                    closeModal
                  }
                  className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >

                  Cancel

                </button>


                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0075FF] px-5 text-sm font-semibold text-white transition hover:bg-[#0066de] disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {saving ? (
                    <>

                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      Saving...

                    </>
                  ) : (
                    <>

                      {editingExam ? (
                        <Pencil
                          size={17}
                        />
                      ) : (
                        <Plus
                          size={17}
                        />
                      )}

                      {editingExam
                        ? "Update Exam"
                        : "Save Exam"}

                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </AdminShell>
  );
}