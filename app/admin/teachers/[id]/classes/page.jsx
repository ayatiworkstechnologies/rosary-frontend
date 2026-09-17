"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  useParams,
} from "next/navigation";

import AdminShell from "@/components/admin/AdminShell";

import {
  getAdminTeacher,
  getAdminTeacherClasses,
  assignAdminTeacherClass,
  updateAdminTeacherClass,
  removeAdminTeacherClass,
} from "@/services/adminTeacherService";

import {
  getAdminClasses,
} from "@/services/adminClassService";

import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  BookOpen,
  AlertCircle,
} from "lucide-react";

export default function TeacherClassesPage() {
  const params = useParams();

  const teacherId = params.id;

  const [teacher, setTeacher] =
    useState(null);

  const [classes, setClasses] =
    useState([]);

  const [assignments, setAssignments] =
    useState([]);

  const [classId, setClassId] =
    useState("");

  const [subject, setSubject] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [
          teacherResponse,
          classesResponse,
          assignmentResponse,
        ] = await Promise.all([
          getAdminTeacher(
            teacherId
          ),

          getAdminClasses(),

          getAdminTeacherClasses(
            teacherId
          ),
        ]);

        if (cancelled) {
          return;
        }

        setTeacher(
          teacherResponse?.data ||
            null
        );

        setClasses(
          Array.isArray(
            classesResponse?.data
          )
            ? classesResponse.data
            : []
        );

        setAssignments(
          Array.isArray(
            assignmentResponse?.data
          )
            ? assignmentResponse.data
            : []
        );
      } catch (error) {
        if (!cancelled) {
          setError(
            error?.message ||
              "Unable to load class assignments."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (teacherId) {
      loadData();
    }

    return () => {
      cancelled = true;
    };
  }, [teacherId]);

  const handleAssign = async () => {
    if (!classId) {
      setError(
        "Please select a class."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      await assignAdminTeacherClass(
        teacherId,
        {
          class_id:
            Number(classId),

          subject:
            subject.trim() ||
            null,
        }
      );

      const response =
        await getAdminTeacherClasses(
          teacherId
        );

      setAssignments(
        response?.data || []
      );

      setClassId("");
      setSubject("");
    } catch (error) {
      setError(
        error?.message ||
          "Unable to assign class."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSubjectUpdate =
    async (
      assignmentId,
      newSubject
    ) => {
      try {
        await updateAdminTeacherClass(
          teacherId,
          assignmentId,
          {
            subject:
              newSubject.trim() ||
              null,
          }
        );

        window.alert(
          "Subject updated successfully."
        );
      } catch (error) {
        window.alert(
          error?.message ||
            "Unable to update subject."
        );
      }
    };

  const handleRemove = async (
    assignment
  ) => {
    const confirmed =
      window.confirm(
        "Remove this class assignment?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await removeAdminTeacherClass(
        teacherId,
        assignment.id
      );

      setAssignments(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              assignment.id
          )
      );
    } catch (error) {
      window.alert(
        error?.message ||
          "Unable to remove class."
      );
    }
  };

  if (loading) {
    return (
      <AdminShell>
        <div className="flex min-h-[400px] items-center justify-center">

          <RefreshCw
            size={28}
            className="animate-spin text-[#0075FF]"
          />

        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>

      <Link
        href="/admin/teachers"
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#0075FF]"
      >
        <ArrowLeft size={17} />

        Back to Teachers
      </Link>

      <h1 className="text-2xl font-bold text-gray-900">
        Class Assignments
      </h1>

      <p className="mt-1 text-sm text-gray-500">
        {teacher?.name} •{" "}
        {teacher?.employee_id}
      </p>

      {error && (
        <div className="mt-5 flex gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-600">

          <AlertCircle
            size={18}
          />

          {error}

        </div>
      )}

      {/* ASSIGN */}

      <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

        <div className="mb-5 flex items-center gap-3">

          <BookOpen
            size={20}
            className="text-[#0075FF]"
          />

          <h2 className="font-semibold text-gray-900">
            Assign Class
          </h2>

        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">

          <select
            value={classId}
            onChange={(e) =>
              setClassId(
                e.target.value
              )
            }
            className="h-12 rounded-xl border border-gray-200 bg-white px-4"
          >
            <option value="">
              Select Class
            </option>

            {classes
              .filter(
                (item) =>
                  item.is_active
              )
              .map((item) => (
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
              ))}
          </select>

          <input
            value={subject}
            onChange={(e) =>
              setSubject(
                e.target.value
              )
            }
            placeholder="Subject e.g. Mathematics"
            className="h-12 rounded-xl border border-gray-200 px-4"
          />

          <button
            type="button"
            onClick={handleAssign}
            disabled={saving}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0075FF] px-5 text-sm font-semibold text-white disabled:opacity-50"
          >
            <Plus size={17} />

            {saving
              ? "Assigning..."
              : "Assign"}
          </button>

        </div>

      </section>

      {/* ASSIGNMENTS */}

      <section className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

        <div className="border-b border-gray-100 p-5">

          <h2 className="font-semibold text-gray-900">
            Assigned Classes
          </h2>

        </div>

        {assignments.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            No classes assigned.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">

            {assignments.map(
              (assignment) => (
                <AssignmentRow
                  key={
                    assignment.id
                  }
                  assignment={
                    assignment
                  }
                  onSave={
                    handleSubjectUpdate
                  }
                  onRemove={
                    handleRemove
                  }
                />
              )
            )}

          </div>
        )}

      </section>

    </AdminShell>
  );
}


function AssignmentRow({
  assignment,
  onSave,
  onRemove,
}) {
  const [subject, setSubject] =
    useState(
      assignment.subject || ""
    );

  return (
    <div className="grid gap-4 p-5 md:grid-cols-[1fr_1fr_auto] md:items-center">

      <div>
        <p className="font-semibold text-gray-800">
          {assignment.class?.name} -{" "}
          {
            assignment.class?.section
          }
        </p>

        <p className="text-xs text-gray-500">
          {
            assignment.class
              ?.academic_year
          }
        </p>
      </div>

      <input
        value={subject}
        onChange={(e) =>
          setSubject(
            e.target.value
          )
        }
        className="h-11 rounded-xl border border-gray-200 px-4 text-sm"
        placeholder="Subject"
      />

      <div className="flex gap-2">

        <button
          type="button"
          onClick={() =>
            onSave(
              assignment.id,
              subject
            )
          }
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-200 text-[#0075FF] hover:bg-blue-50"
        >
          <Save size={16} />
        </button>

        <button
          type="button"
          onClick={() =>
            onRemove(
              assignment
            )
          }
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
        >
          <Trash2 size={16} />
        </button>

      </div>

    </div>
  );
}