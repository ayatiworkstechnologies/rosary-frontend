"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Download,
  FileText,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import {
  createAdminDownload,
  deleteAdminDownload,
  updateAdminDownload,
  updateAdminDownloadStatus,
} from "@/lib/admin-downloads";

import AdminShell from "@/components/admin/AdminShell";


// ======================================================
// CONSTANTS
// ======================================================

const API_BASE_URL =
  process.env.NEXT_PUBLIC_ROSARY_API_URL ||
  "http://127.0.0.1:8000";

const DOWNLOAD_API =
  `${API_BASE_URL}/api/v1/admin/downloads`;

const CLASSES_API =
  `${API_BASE_URL}/api/v1/admin/classes`;


const getToday = () => {
  return new Date()
    .toISOString()
    .split("T")[0];
};


const EMPTY_FORM = {
  title: "",
  category: "",
  description: "",
  audience: "ALL",
  class_id: "",
  published_date: "",
  is_active: true,
};


// ======================================================
// DOWNLOAD FETCH FUNCTION
// ======================================================

async function fetchDownloads(filters = {}) {
  const params = new URLSearchParams();

  if (filters.search) {
    params.append(
      "search",
      filters.search
    );
  }

  if (filters.category) {
    params.append(
      "category",
      filters.category
    );
  }

  if (filters.audience) {
    params.append(
      "audience",
      filters.audience
    );
  }

  if (
    filters.is_active !== undefined
  ) {
    params.append(
      "is_active",
      String(filters.is_active)
    );
  }

  const query = params.toString();

  const url = query
    ? `${DOWNLOAD_API}?${query}`
    : DOWNLOAD_API;

  console.log(
    "Calling Downloads API:",
    url
  );

  const response = await fetch(
    url,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    console.error(
      "Downloads API error:",
      response.status,
      data
    );

    throw new Error(
      data?.detail ||
        `Failed to load downloads (${response.status})`
    );
  }

  console.log(
    "Downloads API response:",
    data
  );

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (
    Array.isArray(
      data?.downloads
    )
  ) {
    return data.downloads;
  }

  return [];
}


// ======================================================
// COMPONENT
// ======================================================

export default function AdminDownloadsPage() {
  const [
    downloads,
    setDownloads,
  ] = useState([]);

  const [
    classes,
    setClasses,
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
    categoryFilter,
    setCategoryFilter,
  ] = useState("");

  const [
    audienceFilter,
    setAudienceFilter,
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
    editingItem,
    setEditingItem,
  ] = useState(null);

  const [
    selectedFile,
    setSelectedFile,
  ] = useState(null);

  const [
    form,
    setForm,
  ] = useState({
    ...EMPTY_FORM,
    published_date: getToday(),
  });


  // ======================================================
  // BUILD CURRENT FILTERS
  // ======================================================

  const buildFilters = () => {
    const filters = {};

    if (search.trim()) {
      filters.search =
        search.trim();
    }

    if (categoryFilter) {
      filters.category =
        categoryFilter;
    }

    if (audienceFilter) {
      filters.audience =
        audienceFilter;
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
  // LOAD CLASSES
  // ======================================================

  useEffect(() => {
    let cancelled = false;

    const loadClasses =
      async () => {
        try {
          const response =
            await fetch(
              CLASSES_API,
              {
                method: "GET",
                cache: "no-store",
              }
            );

          let data = null;

          try {
            data =
              await response.json();
          } catch {
            data = null;
          }

          if (
            !response.ok
          ) {
            throw new Error(
              data?.detail ||
                `Failed to load classes (${response.status})`
            );
          }

          if (cancelled) {
            return;
          }

          console.log(
            "Classes API:",
            data
          );

          if (
            Array.isArray(data)
          ) {
            setClasses(data);
            return;
          }

          if (
            Array.isArray(
              data?.items
            )
          ) {
            setClasses(
              data.items
            );
            return;
          }

          if (
            Array.isArray(
              data?.classes
            )
          ) {
            setClasses(
              data.classes
            );
            return;
          }

          setClasses([]);
        } catch (err) {
          console.error(
            "Class loading error:",
            err
          );

          if (!cancelled) {
            setClasses([]);
          }
        }
      };

    loadClasses();

    return () => {
      cancelled = true;
    };
  }, []);


  // ======================================================
  // LOAD DOWNLOADS WHEN FILTER CHANGES
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
              categoryFilter
            ) {
              filters.category =
                categoryFilter;
            }

            if (
              audienceFilter
            ) {
              filters.audience =
                audienceFilter;
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
              await fetchDownloads(
                filters
              );

            if (
              !cancelled
            ) {
              setDownloads(
                data
              );
            }
          } catch (err) {
            console.error(
              "Download loading error:",
              err
            );

            if (
              !cancelled
            ) {
              setError(
                err?.message ||
                  "Unable to load downloads."
              );

              setDownloads(
                []
              );
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
    categoryFilter,
    audienceFilter,
    statusFilter,
  ]);


  // ======================================================
  // MANUAL REFRESH
  // ======================================================

  const loadDownloads =
    async () => {
      try {
        setLoading(true);
        setError("");

        const filters =
          buildFilters();

        const data =
          await fetchDownloads(
            filters
          );

        setDownloads(data);
      } catch (err) {
        console.error(
          "Manual download refresh error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load downloads."
        );

        setDownloads([]);
      } finally {
        setLoading(false);
      }
    };


  // ======================================================
  // CATEGORY OPTIONS
  // ======================================================

  const categories =
    useMemo(() => {
      const values =
        downloads
          .map(
            (item) =>
              item.category
          )
          .filter(Boolean);

      return [
        ...new Set(values),
      ];
    }, [downloads]);


  // ======================================================
  // FORM CHANGE
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
    setEditingItem(null);

    setSelectedFile(null);

    setForm({
      ...EMPTY_FORM,

      published_date:
        getToday(),
    });

    setError("");
    setSuccess("");

    setModalOpen(true);
  };


  // ======================================================
  // OPEN EDIT MODAL
  // ======================================================

  const openEditModal = (
    item
  ) => {
    setEditingItem(item);

    setSelectedFile(null);

    setForm({
      title:
        item?.title || "",

      category:
        item?.category || "",

      description:
        item?.description ||
        "",

      audience:
        item?.audience ||
        "ALL",

      class_id:
        item?.class_id !==
          null &&
        item?.class_id !==
          undefined
          ? String(
              item.class_id
            )
          : "",

      published_date:
        item?.published_date ||
        getToday(),

      is_active:
        Boolean(
          item?.is_active
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

    setEditingItem(null);

    setSelectedFile(null);

    setError("");

    setForm({
      ...EMPTY_FORM,

      published_date:
        getToday(),
    });
  };


  // ======================================================
  // VALIDATE FILE
  // ======================================================

  const validateFile = (
    file
  ) => {
    if (!file) {
      return true;
    }

    const allowedExtensions =
      [
        "pdf",
        "doc",
        "docx",
      ];

    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase();

    if (
      !allowedExtensions.includes(
        extension
      )
    ) {
      setError(
        "Only PDF, DOC and DOCX files are allowed."
      );

      return false;
    }

    const maxSize =
      10 * 1024 * 1024;

    if (
      file.size > maxSize
    ) {
      setError(
        "File size cannot exceed 10 MB."
      );

      return false;
    }

    return true;
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
        !form.title.trim()
      ) {
        setError(
          "Form title is required."
        );

        return;
      }

      if (
        !form.category.trim()
      ) {
        setError(
          "Category is required."
        );

        return;
      }

      if (
        !form.audience
      ) {
        setError(
          "Audience is required."
        );

        return;
      }

      if (
        form.audience ===
          "CLASS" &&
        !form.class_id
      ) {
        setError(
          "Please select a class for CLASS audience."
        );

        return;
      }

      if (
        !form.published_date
      ) {
        setError(
          "Published date is required."
        );

        return;
      }

      if (
        !editingItem &&
        !selectedFile
      ) {
        setError(
          "Please select a PDF, DOC or DOCX file."
        );

        return;
      }

      if (
        !validateFile(
          selectedFile
        )
      ) {
        return;
      }

      const formData =
        new FormData();

      formData.append(
        "title",
        form.title.trim()
      );

      formData.append(
        "category",
        form.category.trim()
      );

      if (
        form.description.trim()
      ) {
        formData.append(
          "description",
          form.description.trim()
        );
      }

      formData.append(
        "audience",
        form.audience
      );

      if (
        form.class_id
      ) {
        formData.append(
          "class_id",
          form.class_id
        );
      }

      formData.append(
        "published_date",
        form.published_date
      );

      formData.append(
        "is_active",
        String(
          form.is_active
        )
      );

      if (
        selectedFile
      ) {
        formData.append(
          "file",
          selectedFile
        );
      }

      try {
        setSaving(true);

        if (
          editingItem
        ) {
          await updateAdminDownload(
            editingItem.id,
            formData
          );

          setSuccess(
            "Form updated successfully."
          );
        } else {
          await createAdminDownload(
            formData
          );

          setSuccess(
            "Form added successfully."
          );
        }

        setModalOpen(false);

        setEditingItem(
          null
        );

        setSelectedFile(
          null
        );

        setForm({
          ...EMPTY_FORM,

          published_date:
            getToday(),
        });

        await loadDownloads();
      } catch (err) {
        console.error(
          "Save form error:",
          err
        );

        setError(
          err?.message ||
            "Unable to save form."
        );
      } finally {
        setSaving(false);
      }
    };


  // ======================================================
  // STATUS
  // ======================================================

  const handleStatusChange =
    async (item) => {
      try {
        setError("");
        setSuccess("");

        await updateAdminDownloadStatus(
          item.id,
          !item.is_active
        );

        setSuccess(
          item.is_active
            ? "Form deactivated successfully."
            : "Form activated successfully."
        );

        await loadDownloads();
      } catch (err) {
        console.error(
          "Status update error:",
          err
        );

        setError(
          err?.message ||
            "Unable to update status."
        );
      }
    };


  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete =
    async (item) => {
      const confirmed =
        window.confirm(
          `Are you sure you want to delete "${item.title}"?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setError("");
        setSuccess("");

        await deleteAdminDownload(
          item.id
        );

        setSuccess(
          "Form deleted successfully."
        );

        await loadDownloads();
      } catch (err) {
        console.error(
          "Delete error:",
          err
        );

        setError(
          err?.message ||
            "Unable to delete form."
        );
      }
    };


  // ======================================================
  // CLASS NAME
  // ======================================================

  const getClassName = (
    classId
  ) => {
    if (
      classId === null ||
      classId === undefined
    ) {
      return "All Classes";
    }

    const classItem =
      classes.find(
        (item) =>
          Number(
            item.id
          ) ===
          Number(
            classId
          )
      );

    if (!classItem) {
      return `Class ${classId}`;
    }

    return (
      classItem.name ||
      classItem.class_name ||
      classItem.display_name ||
      `Class ${classId}`
    );
  };


  // ======================================================
  // AUDIENCE LABEL
  // ======================================================

  const getAudienceLabel = (
    audience
  ) => {
    switch (audience) {
      case "ALL":
        return "Everyone";

      case "PARENT":
        return "Parents";

      case "STUDENT":
        return "Students";

      case "TEACHER":
        return "Teachers";

      case "CLASS":
        return "Specific Class";

      default:
        return audience || "-";
    }
  };


  // ======================================================
  // FILE URL
  // ======================================================

  const getFileUrl = (
    fileUrl
  ) => {
    if (!fileUrl) {
      return "#";
    }

    if (
      fileUrl.startsWith(
        "http://"
      ) ||
      fileUrl.startsWith(
        "https://"
      )
    ) {
      return fileUrl;
    }

    const normalizedUrl =
      fileUrl.startsWith("/")
        ? fileUrl
        : `/${fileUrl}`;

    /*
      Existing DB records:
      /forms/file.pdf

      New upload records:
      /uploads/download_forms/file.pdf

      Using /backend here means both paths
      are forwarded to FastAPI.
    */

    return `/backend${normalizedUrl}`;
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
              Downloads & Forms
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage downloadable forms and
              documents for parents, students
              and teachers.
            </p>

          </div>


          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0075FF] px-5 text-sm font-semibold text-white transition hover:bg-[#0066de]"
          >
            <Plus size={18} />

            Add Form
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
        {/* ============================================= */}

        <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">

          <div className="grid gap-3 lg:grid-cols-[2fr_1fr_1fr_1fr]">


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
                placeholder="Search forms..."
                className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#0075FF]"
              />

            </div>


            {/* CATEGORY */}

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value
                )
              }
              className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#0075FF]"
            >

              <option value="">
                All Categories
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                )
              )}

            </select>


            {/* AUDIENCE */}

            <select
              value={audienceFilter}
              onChange={(event) =>
                setAudienceFilter(
                  event.target.value
                )
              }
              className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#0075FF]"
            >

              <option value="">
                All Audience
              </option>

              <option value="ALL">
                Everyone
              </option>

              <option value="PARENT">
                Parents
              </option>

              <option value="STUDENT">
                Students
              </option>

              <option value="TEACHER">
                Teachers
              </option>

              <option value="CLASS">
                Specific Class
              </option>

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
        {/* ============================================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {loading ? (

            <div className="flex min-h-[320px] flex-col items-center justify-center gap-3">

              <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-[#0075FF]" />

              <p className="text-sm text-slate-500">
                Loading forms...
              </p>

            </div>

          ) : downloads.length === 0 ? (

            <div className="flex min-h-[350px] flex-col items-center justify-center p-8 text-center">

              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0075FF]">

                <FileText
                  size={26}
                />

              </div>

              <h3 className="text-base font-bold text-slate-900">
                No forms found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                No download forms match your
                current filters.
              </p>

              <button
                type="button"
                onClick={openAddModal}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0075FF] px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Plus size={17} />

                Add Form
              </button>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1050px]">

                <thead>

                  <tr className="border-b border-slate-200 bg-slate-50">

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                      Form
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                      Category
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                      Audience
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                      Class
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                      Date
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase text-slate-500">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {downloads.map(
                    (item) => (

                      <tr
                        key={item.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >


                        {/* FORM */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0075FF]">

                              <FileText
                                size={19}
                              />

                            </div>


                            <div className="min-w-0">

                              <p className="max-w-[280px] truncate text-sm font-semibold text-slate-900">
                                {item.title}
                              </p>

                              <p className="mt-1 max-w-[280px] truncate text-xs text-slate-500">
                                {item.file_name}
                              </p>

                            </div>

                          </div>

                        </td>


                        {/* CATEGORY */}

                        <td className="px-5 py-4">

                          <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700">

                            {item.category}

                          </span>

                        </td>


                        {/* AUDIENCE */}

                        <td className="px-5 py-4 text-sm text-slate-600">

                          {getAudienceLabel(
                            item.audience
                          )}

                        </td>


                        {/* CLASS */}

                        <td className="px-5 py-4 text-sm text-slate-600">

                          {item.audience ===
                          "CLASS"
                            ? getClassName(
                                item.class_id
                              )
                            : item.class_id
                              ? getClassName(
                                  item.class_id
                                )
                              : "All Classes"}

                        </td>


                        {/* DATE */}

                        <td className="px-5 py-4 text-sm text-slate-600">

                          {item.published_date
                            ? new Date(
                                `${item.published_date}T00:00:00`
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "-"}

                        </td>


                        {/* STATUS */}

                        <td className="px-5 py-4">

                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(
                                item
                              )
                            }
                            className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                              item.is_active
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                            }`}
                          >

                            {item.is_active
                              ? "Active"
                              : "Inactive"}

                          </button>

                        </td>


                        {/* ACTIONS */}

                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-2">


                            {/* DOWNLOAD */}

                            <a
                              href={getFileUrl(
                                item.file_url
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="View / Download"
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0075FF]"
                            >

                              <Download
                                size={16}
                              />

                            </a>


                            {/* EDIT */}

                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  item
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
                                  item
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
      {/* ================================================= */}

      {modalOpen && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">

          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">


            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 md:px-6">

              <div>

                <h2 className="text-lg font-bold text-slate-900">

                  {editingItem
                    ? "Edit Form"
                    : "Add New Form"}

                </h2>

                <p className="mt-1 text-xs text-slate-500">

                  {editingItem
                    ? "Update the form information or replace the document."
                    : "Upload a new downloadable school form."}

                </p>

              </div>


              <button
                type="button"
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              >

                <X size={18} />

              </button>

            </div>


            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="p-5 md:p-6"
            >


              {error && (

                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                  {error}

                </div>

              )}


              <div className="grid gap-5 md:grid-cols-2">


                {/* TITLE */}

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-semibold text-slate-700">

                    Form Title

                    <span className="text-red-500">
                      *
                    </span>

                  </label>

                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Admission Application Form"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-[#0075FF] focus:ring-2 focus:ring-blue-100"
                  />

                </div>


                {/* CATEGORY */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">

                    Category

                    <span className="text-red-500">
                      *
                    </span>

                  </label>

                  <input
                    type="text"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="Admission"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-[#0075FF] focus:ring-2 focus:ring-blue-100"
                  />

                </div>


                {/* AUDIENCE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Audience
                  </label>

                  <select
                    name="audience"
                    value={form.audience}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-[#0075FF]"
                  >

                    <option value="ALL">
                      Everyone
                    </option>

                    <option value="PARENT">
                      Parents
                    </option>

                    <option value="STUDENT">
                      Students
                    </option>

                    <option value="TEACHER">
                      Teachers
                    </option>

                    <option value="CLASS">
                      Specific Class
                    </option>

                  </select>

                </div>


                {/* CLASS */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">

                    Class

                    {form.audience ===
                      "CLASS" && (
                      <span className="text-red-500">
                        *
                      </span>
                    )}

                  </label>

                  <select
                    name="class_id"
                    value={form.class_id}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-[#0075FF]"
                  >

                    <option value="">
                      All Classes
                    </option>

                    {classes.map(
                      (item) => (

                        <option
                          key={item.id}
                          value={item.id}
                        >

                          {item.name ||
                            item.class_name ||
                            item.display_name ||
                            `Class ${item.id}`}

                        </option>

                      )
                    )}

                  </select>

                  {form.audience ===
                    "CLASS" && (
                    <p className="mt-1.5 text-xs text-slate-500">
                      Select the class that should receive this form.
                    </p>
                  )}

                </div>


                {/* DATE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">

                    Published Date

                    <span className="text-red-500">
                      *
                    </span>

                  </label>

                  <input
                    type="date"
                    name="published_date"
                    value={
                      form.published_date
                    }
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-[#0075FF]"
                  />

                </div>


                {/* DESCRIPTION */}

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Enter form description..."
                    className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-[#0075FF] focus:ring-2 focus:ring-blue-100"
                  />

                </div>


                {/* FILE */}

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-semibold text-slate-700">

                    Document File

                    {!editingItem && (

                      <span className="text-red-500">
                        *
                      </span>

                    )}

                  </label>


                  <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 transition hover:border-[#0075FF] hover:bg-blue-50/40">


                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#0075FF] shadow-sm">

                      <Upload
                        size={20}
                      />

                    </div>


                    <div className="min-w-0 flex-1">

                      <p className="truncate text-sm font-semibold text-slate-700">

                        {selectedFile
                          ? selectedFile.name
                          : editingItem
                            ? editingItem.file_name
                            : "Choose document"}

                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        PDF, DOC, DOCX — Maximum 10 MB
                      </p>

                    </div>


                    <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
                      Browse
                    </span>


                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(event) => {

                        const file =
                          event.target
                            .files?.[0];

                        setError("");

                        if (!file) {
                          setSelectedFile(
                            null
                          );

                          return;
                        }

                        if (
                          validateFile(
                            file
                          )
                        ) {
                          setSelectedFile(
                            file
                          );
                        }

                      }}
                    />

                  </label>


                  {editingItem && (

                    <p className="mt-2 text-xs text-slate-500">
                      Leave the file unchanged if you only want to edit the form details.
                    </p>

                  )}

                </div>


                {/* ACTIVE */}

                <div className="md:col-span-2">

                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4">

                    <div>

                      <p className="text-sm font-semibold text-slate-800">
                        Active Form
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Active forms are visible to the selected audience.
                      </p>

                    </div>


                    <input
                      type="checkbox"
                      name="is_active"
                      checked={
                        form.is_active
                      }
                      onChange={handleChange}
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
                  disabled={saving}
                  onClick={closeModal}
                  className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >

                  Cancel

                </button>


                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0075FF] px-5 text-sm font-semibold text-white transition hover:bg-[#0066de] disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {saving ? (
                    <>

                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      Saving...

                    </>
                  ) : (
                    <>

                      {editingItem ? (
                        <Pencil
                          size={17}
                        />
                      ) : (
                        <Plus
                          size={17}
                        />
                      )}

                      {editingItem
                        ? "Update Form"
                        : "Save Form"}

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
