"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  KeyRound,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";

import AdminShell from "@/components/admin/AdminShell";

import {
  createAdminUser,
  deleteAdminUser,
  getAdminUsers,
  resetAdminUserPassword,
  updateAdminUser,
  updateAdminUserStatus,
} from "@/lib/admin-users";

// ======================================================
// EMPTY FORM
// ======================================================

const EMPTY_FORM = {
  name: "",
  username: "",
  email: "",
  password: "",
  role: "PARENT",
  is_active: true,
};

// ======================================================
// COMPONENT
// ======================================================

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ======================================================
  // FILTERS
  // ======================================================

  const [search, setSearch] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("");

  // ======================================================
  // PAGINATION
  // ======================================================

  const [page, setPage] =
    useState(1);

  const [pageSize, setPageSize] =
    useState(25);

  const [
    pagination,
    setPagination,
  ] = useState({
    page: 1,
    page_size: 25,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_previous: false,
  });

  const [
    refreshKey,
    setRefreshKey,
  ] = useState(0);

  // ======================================================
  // ADD / EDIT MODAL
  // ======================================================

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    editingUser,
    setEditingUser,
  ] = useState(null);

  const [form, setForm] =
    useState({
      ...EMPTY_FORM,
    });

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  // ======================================================
  // PASSWORD MODAL
  // ======================================================

  const [
    passwordModalOpen,
    setPasswordModalOpen,
  ] = useState(false);

  const [
    passwordUser,
    setPasswordUser,
  ] = useState(null);

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  // ======================================================
  // NORMALIZE USERS
  // ======================================================

  const normalizeUsers = (data) => {
    if (Array.isArray(data?.data)) {
      return data.data;
    }

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.items)) {
      return data.items;
    }

    if (Array.isArray(data?.users)) {
      return data.users;
    }

    return [];
  };

  // ======================================================
  // LOAD USERS
  // ======================================================

  useEffect(() => {
    const timer = setTimeout(
      async () => {
        try {
          setLoading(true);
          setError("");

          const filters = {
            page,
            page_size: pageSize,
          };

          if (search.trim()) {
            filters.search =
              search.trim();
          }

          if (roleFilter) {
            filters.role =
              roleFilter;
          }

          if (
            statusFilter !== ""
          ) {
            filters.is_active =
              statusFilter ===
              "active";
          }

          const data =
            await getAdminUsers(
              filters
            );

          const userList =
            normalizeUsers(data);

          setUsers(userList);

          setPagination({
            page:
              data?.page ??
              data?.pagination
                ?.page ??
              page,

            page_size:
              data?.page_size ??
              data?.pagination
                ?.page_size ??
              pageSize,

            total:
              data?.total ??
              data?.pagination
                ?.total ??
              userList.length,

            total_pages:
              data?.total_pages ??
              data?.pagination
                ?.total_pages ??
              1,

            has_next:
              data?.has_next ??
              data?.pagination
                ?.has_next ??
              false,

            has_previous:
              data?.has_previous ??
              data?.pagination
                ?.has_previous ??
              false,
          });
        } catch (err) {
          console.error(
            "Users loading error:",
            err
          );

          setError(
            err?.message ||
              "Unable to load users."
          );

          setUsers([]);

          setPagination({
            page: 1,
            page_size:
              pageSize,
            total: 0,
            total_pages: 0,
            has_next: false,
            has_previous:
              false,
          });
        } finally {
          setLoading(false);
        }
      },
      300
    );

    return () =>
      clearTimeout(timer);
  }, [
    search,
    roleFilter,
    statusFilter,
    page,
    pageSize,
    refreshKey,
  ]);

  // ======================================================
  // FILTER HANDLERS
  // ======================================================

  const handleSearchChange = (
    event
  ) => {
    setSearch(
      event.target.value
    );

    setPage(1);
  };

  const handleRoleChange = (
    event
  ) => {
    setRoleFilter(
      event.target.value
    );

    setPage(1);
  };

  const handleStatusFilterChange = (
    event
  ) => {
    setStatusFilter(
      event.target.value
    );

    setPage(1);
  };

  const handlePageSizeChange = (
    event
  ) => {
    setPageSize(
      Number(
        event.target.value
      )
    );

    setPage(1);
  };

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

    setForm((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ======================================================
  // ADD USER
  // ======================================================

  const openAddModal = () => {
    setEditingUser(null);

    setForm({
      ...EMPTY_FORM,
    });

    setShowPassword(false);

    setError("");
    setSuccess("");

    setModalOpen(true);
  };

  // ======================================================
  // EDIT USER
  // ======================================================

  const openEditModal = (
    user
  ) => {
    setEditingUser(user);

    setForm({
      name:
        user?.name || "",

      username:
        user?.username || "",

      email:
        user?.email || "",

      password: "",

      role:
        String(
          user?.role ||
            "PARENT"
        ).toUpperCase(),

      is_active:
        user?.is_active !==
        false,
    });

    setError("");
    setSuccess("");

    setModalOpen(true);
  };

  // ======================================================
  // CLOSE MODAL
  // ======================================================

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);

    setEditingUser(null);

    setShowPassword(false);

    setError("");

    setForm({
      ...EMPTY_FORM,
    });
  };

  // ======================================================
  // SAVE USER
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
          "Full name is required."
        );

        return;
      }

      if (
        !form.username.trim()
      ) {
        setError(
          "Username is required."
        );

        return;
      }

      if (
        form.username.trim()
          .length < 3
      ) {
        setError(
          "Username must contain at least 3 characters."
        );

        return;
      }

      if (
        !editingUser &&
        form.password.length <
          8
      ) {
        setError(
          "Password must contain at least 8 characters."
        );

        return;
      }

      try {
        setSaving(true);

        if (editingUser) {
          await updateAdminUser(
            editingUser.id,
            {
              name:
                form.name.trim(),

              username:
                form.username.trim(),

              email:
                form.email.trim()
                  ? form.email.trim()
                  : null,

              role: form.role,

              is_active:
                form.is_active,
            }
          );

          setSuccess(
            "User updated successfully."
          );
        } else {
          await createAdminUser({
            name:
              form.name.trim(),

            username:
              form.username.trim(),

            email:
              form.email.trim()
                ? form.email.trim()
                : null,

            password:
              form.password,

            role:
              form.role,

            is_active:
              form.is_active,
          });

          setSuccess(
            "User created successfully."
          );
        }

        setModalOpen(false);
        setEditingUser(null);

        setForm({
          ...EMPTY_FORM,
        });

        setRefreshKey(
          (previous) =>
            previous + 1
        );
      } catch (err) {
        console.error(
          "User save error:",
          err
        );

        setError(
          err?.message ||
            "Unable to save user."
        );
      } finally {
        setSaving(false);
      }
    };

  // ======================================================
  // STATUS CHANGE
  // ======================================================

  const handleStatusChange =
    async (user) => {
      try {
        setError("");
        setSuccess("");

        await updateAdminUserStatus(
          user.id,
          !user.is_active
        );

        setSuccess(
          user.is_active
            ? "User deactivated successfully."
            : "User activated successfully."
        );

        setRefreshKey(
          (previous) =>
            previous + 1
        );
      } catch (err) {
        setError(
          err?.message ||
            "Unable to update status."
        );
      }
    };

  // ======================================================
  // PASSWORD MODAL
  // ======================================================

  const openPasswordModal = (
    user
  ) => {
    setPasswordUser(user);

    setNewPassword("");

    setShowNewPassword(
      false
    );

    setError("");
    setSuccess("");

    setPasswordModalOpen(
      true
    );
  };

  const closePasswordModal =
    () => {
      if (saving) return;

      setPasswordModalOpen(
        false
      );

      setPasswordUser(null);

      setNewPassword("");

      setError("");
    };

  // ======================================================
  // RESET PASSWORD
  // ======================================================

  const handlePasswordReset =
    async (event) => {
      event.preventDefault();

      setError("");
      setSuccess("");

      if (
        newPassword.length <
        8
      ) {
        setError(
          "Password must contain at least 8 characters."
        );

        return;
      }

      if (!passwordUser) {
        return;
      }

      try {
        setSaving(true);

        await resetAdminUserPassword(
          passwordUser.id,
          newPassword
        );

        setSuccess(
          `Password reset successfully for ${passwordUser.name}.`
        );

        setPasswordModalOpen(
          false
        );

        setPasswordUser(null);

        setNewPassword("");
      } catch (err) {
        setError(
          err?.message ||
            "Unable to reset password."
        );
      } finally {
        setSaving(false);
      }
    };

  // ======================================================
  // DELETE USER
  // ======================================================

  const handleDelete =
    async (user) => {
      const confirmed =
        window.confirm(
          `Are you sure you want to delete "${user.name}"?`
        );

      if (!confirmed) return;

      try {
        setError("");
        setSuccess("");

        await deleteAdminUser(
          user.id
        );

        setSuccess(
          "User deleted successfully."
        );

        if (
          users.length === 1 &&
          page > 1
        ) {
          setPage(
            (previous) =>
              previous - 1
          );
        } else {
          setRefreshKey(
            (previous) =>
              previous + 1
          );
        }
      } catch (err) {
        setError(
          err?.message ||
            "Unable to delete user."
        );
      }
    };

  // ======================================================
  // ROLE STYLE
  // ======================================================

  const getRoleStyle = (
    role
  ) => {
    const normalizedRole =
      String(
        role || ""
      ).toUpperCase();

    if (
      normalizedRole ===
      "ADMIN"
    ) {
      return "bg-purple-50 text-purple-700";
    }

    if (
      normalizedRole ===
      "TEACHER"
    ) {
      return "bg-blue-50 text-blue-700";
    }

    if (
      normalizedRole ===
      "PARENT"
    ) {
      return "bg-amber-50 text-amber-700";
    }

    return "bg-slate-100 text-slate-600";
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
      value
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
  // PAGINATION DISPLAY
  // ======================================================

  const startRecord =
    pagination.total > 0
      ? (pagination.page -
          1) *
          pagination.page_size +
        1
      : 0;

  const endRecord =
    pagination.total > 0
      ? Math.min(
          pagination.page *
            pagination.page_size,
          pagination.total
        )
      : 0;

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <AdminShell>
      <div className="mx-auto w-full max-w-[1500px]">
        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Users
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage administrator,
              teacher and parent portal
              accounts.
            </p>
          </div>

          <button
            type="button"
            onClick={
              openAddModal
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0075FF] px-5 text-sm font-semibold text-white transition hover:bg-[#0066de]"
          >
            <Plus size={18} />

            Add User
          </button>
        </div>

        {/* SUCCESS */}

        {success && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {success}
          </div>
        )}

        {/* ERROR */}

        {error &&
          !modalOpen &&
          !passwordModalOpen && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

        {/* SUMMARY */}

        <div className="mb-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Users
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {pagination.total}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Current Page
            </p>

            <p className="mt-2 text-2xl font-bold text-[#0075FF]">
              {pagination.total_pages >
              0
                ? `${pagination.page} / ${pagination.total_pages}`
                : "0 / 0"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Showing Records
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {users.length}
            </p>
          </div>
        </div>

        {/* FILTERS */}

        <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[2fr_1fr_1fr]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={
                  handleSearchChange
                }
                placeholder="Search name, username or email..."
                className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#0075FF]"
              />
            </div>

            <select
              value={
                roleFilter
              }
              onChange={
                handleRoleChange
              }
              className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#0075FF]"
            >
              <option value="">
                All Roles
              </option>

              <option value="ADMIN">
                Admin
              </option>

              <option value="TEACHER">
                Teacher
              </option>

              <option value="PARENT">
                Parent
              </option>
            </select>

            <select
              value={
                statusFilter
              }
              onChange={
                handleStatusFilterChange
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

        {/* TABLE */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-3">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-[#0075FF]" />

              <p className="text-sm text-slate-500">
                Loading users...
              </p>
            </div>
          ) : users.length ===
            0 ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0075FF]">
                <Users
                  size={26}
                />
              </div>

              <h3 className="text-base font-bold text-slate-900">
                No users found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                No users match
                your current
                filters.
              </p>

              <button
                type="button"
                onClick={
                  openAddModal
                }
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0075FF] px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Plus
                  size={17}
                />

                Add User
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                        User
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                        Username
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                        Role
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase text-slate-500">
                        Created
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-bold uppercase text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map(
                      (user) => {
                        const role =
                          String(
                            user.role ||
                              ""
                          ).toUpperCase();

                        return (
                          <tr
                            key={
                              user.id
                            }
                            className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0075FF]">
                                  <UserRound
                                    size={
                                      19
                                    }
                                  />
                                </div>

                                <div className="min-w-0">
                                  <p className="max-w-[250px] truncate text-sm font-semibold text-slate-900">
                                    {user.name}
                                  </p>

                                  <p className="mt-1 max-w-[250px] truncate text-xs text-slate-500">
                                    {user.email ||
                                      "No email"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4 text-sm font-medium text-slate-700">
                              {
                                user.username
                              }
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded-lg px-2.5 py-1.5 text-xs font-bold ${getRoleStyle(
                                  role
                                )}`}
                              >
                                {
                                  role
                                }
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <button
                                type="button"
                                onClick={() =>
                                  handleStatusChange(
                                    user
                                  )
                                }
                                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                                  user.is_active
                                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                }`}
                              >
                                {user.is_active
                                  ? "Active"
                                  : "Inactive"}
                              </button>
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-600">
                              {formatDate(
                                user.created_at
                              )}
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openPasswordModal(
                                      user
                                    )
                                  }
                                  title="Reset Password"
                                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600"
                                >
                                  <KeyRound
                                    size={
                                      16
                                    }
                                  />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditModal(
                                      user
                                    )
                                  }
                                  title="Edit"
                                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0075FF]"
                                >
                                  <Pencil
                                    size={
                                      16
                                    }
                                  />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(
                                      user
                                    )
                                  }
                                  title="Delete"
                                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                >
                                  <Trash2
                                    size={
                                      16
                                    }
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}

              <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {
                      startRecord
                    }
                  </span>
                  {" - "}
                  <span className="font-semibold text-slate-700">
                    {endRecord}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-700">
                    {
                      pagination.total
                    }
                  </span>
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={
                      pageSize
                    }
                    onChange={
                      handlePageSizeChange
                    }
                    className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none"
                  >
                    <option
                      value={
                        25
                      }
                    >
                      25 / page
                    </option>

                    <option
                      value={
                        50
                      }
                    >
                      50 / page
                    </option>

                    <option
                      value={
                        100
                      }
                    >
                      100 / page
                    </option>
                  </select>

                  <button
                    type="button"
                    disabled={
                      !pagination.has_previous ||
                      loading
                    }
                    onClick={() =>
                      setPage(
                        (previous) =>
                          Math.max(
                            1,
                            previous -
                              1
                          )
                      )
                    }
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft
                      size={
                        16
                      }
                    />

                    Previous
                  </button>

                  <span className="text-sm font-medium text-slate-600">
                    Page{" "}
                    {
                      pagination.page
                    }{" "}
                    of{" "}
                    {pagination.total_pages ||
                      0}
                  </span>

                  <button
                    type="button"
                    disabled={
                      !pagination.has_next ||
                      loading
                    }
                    onClick={() =>
                      setPage(
                        (previous) =>
                          previous +
                          1
                      )
                    }
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next

                    <ChevronRight
                      size={
                        16
                      }
                    />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ADD / EDIT MODAL */}

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 md:px-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingUser
                    ? "Edit User"
                    : "Add New User"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {editingUser
                    ? "Update portal user account details."
                    : "Create a new portal user account."}
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
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Full Name{" "}
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
                    placeholder="Enter full name"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-[#0075FF]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Username{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    name="username"
                    value={
                      form.username
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="ADMIN001"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-[#0075FF]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={
                      form.email
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="user@rosaryschool.com"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-[#0075FF]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Role{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <select
                    name="role"
                    value={
                      form.role
                    }
                    onChange={
                      handleChange
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-[#0075FF]"
                  >
                    <option value="ADMIN">
                      Admin
                    </option>

                    <option value="TEACHER">
                      Teacher
                    </option>

                    <option value="PARENT">
                      Parent
                    </option>
                  </select>
                </div>

                {!editingUser && (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Password{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        name="password"
                        value={
                          form.password
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Minimum 8 characters"
                        className="h-11 w-full rounded-xl border border-slate-200 px-3.5 pr-11 text-sm outline-none focus:border-[#0075FF]"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        {showPassword ? (
                          <EyeOff
                            size={
                              18
                            }
                          />
                        ) : (
                          <Eye
                            size={
                              18
                            }
                          />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Active User
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Inactive
                        users will
                        not be
                        allowed to
                        access the
                        portal.
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
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0075FF] px-5 text-sm font-semibold text-white transition hover:bg-[#0066de] disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingUser
                      ? "Update User"
                      : "Save User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}

      {passwordModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Reset Password
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {passwordUser
                    ? `Set a new password for ${passwordUser.name}.`
                    : "Set a new password."}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closePasswordModal
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={
                handlePasswordReset
              }
              className="p-5"
            >
              {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                New Password{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <div className="relative">
                <input
                  type={
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    newPassword
                  }
                  onChange={(
                    event
                  ) =>
                    setNewPassword(
                      event.target
                        .value
                    )
                  }
                  placeholder="Minimum 8 characters"
                  className="h-11 w-full rounded-xl border border-slate-200 px-3.5 pr-11 text-sm outline-none focus:border-[#0075FF]"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNewPassword(
                      !showNewPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showNewPassword ? (
                    <EyeOff
                      size={
                        18
                      }
                    />
                  ) : (
                    <Eye
                      size={
                        18
                      }
                    />
                  )}
                </button>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Minimum 8
                characters.
              </p>

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  disabled={
                    saving
                  }
                  onClick={
                    closePasswordModal
                  }
                  className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0075FF] px-5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  <KeyRound
                    size={
                      17
                    }
                  />

                  {saving
                    ? "Resetting..."
                    : "Reset Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}