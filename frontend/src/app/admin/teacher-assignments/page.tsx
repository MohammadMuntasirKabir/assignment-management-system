"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import api, { getErrorMessage } from "@/lib/api";
import { TeacherAssignmentDto, ClassSubjectDto, User } from "@/lib/types";
import { roleNumberToRole } from "@/lib/auth";
import LoadingNote from "@/components/ui/LoadingNote";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/Pagination";
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

const PAGE_SIZE = 10;

export default function AdminTeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<TeacherAssignmentDto[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [classSubjects, setClassSubjects] = useState<ClassSubjectDto[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<TeacherAssignmentDto | null>(null);
  const [formData, setFormData] = useState({ teacherId: "", classSubjectId: "" });
  const [modalError, setModalError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [asgnRes, usersRes, csRes] = await Promise.all([
        api.get<TeacherAssignmentDto[]>("/api/admin/teacher-assignments"),
        api.get<{ items: Array<Omit<User, "role"> & { role: number }> }>("/api/admin/users", {
          params: { page: 1, pageSize: 1000 },
        }),
        api.get<ClassSubjectDto[]>("/api/admin/class-subjects"),
      ]);
      setAssignments(asgnRes.data || []);
      setTeachers(
        (usersRes.data?.items || [])
          .filter((u) => roleNumberToRole(u.role) === "Teacher")
          .map((u) => ({ ...u, role: roleNumberToRole(u.role) }))
      );
      setClassSubjects(csRes.data || []);
    } catch (err) {
      console.error("Failed to fetch:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const totalPages = Math.max(1, Math.ceil(assignments.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedAssignments = assignments.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const openCreateModal = () => {
    setEditingAssignment(null);
    setFormData({ teacherId: "", classSubjectId: "" });
    setModalError("");
    setShowModal(true);
  };

  const openEditModal = (assignment: TeacherAssignmentDto) => {
    setEditingAssignment(assignment);
    setFormData({ teacherId: assignment.teacherId, classSubjectId: assignment.classSubjectId });
    setModalError("");
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.teacherId || !formData.classSubjectId) {
      setModalError("Pick a teacher and a class-subject link.");
      return;
    }
    setSaving(true);
    setModalError("");
    try {
      if (editingAssignment) {
        await api.put(`/api/admin/teacher-assignments/${editingAssignment.id}`, {
          teacherId: formData.teacherId,
          classSubjectId: formData.classSubjectId,
        });
      } else {
        await api.post("/api/admin/assign-teacher", {
          teacherId: formData.teacherId,
          classSubjectId: formData.classSubjectId,
        });
      }
      setShowModal(false);
      setPage(1);
      fetchAll();
    } catch (err) {
      setModalError(getErrorMessage(err, "Failed to save assignment"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove this teacher assignment?")) return;
    try {
      await api.delete(`/api/admin/teacher-assignments/${id}`);
      setPage(1);
      fetchAll();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <DashboardLayout allowedRoles={["Admin"]}>
        <div>
          <div className="title-block">
            <h1>Teacher Assignments</h1>
            <button onClick={openCreateModal} className="btn btn-primary">
              <PlusIcon className="w-4 h-4" />
              Assign Teacher
            </button>
          </div>

          {loading ? (
            <LoadingNote />
          ) : assignments.length === 0 ? (
            <EmptyState>No teacher assignments yet.</EmptyState>
          ) : (
            <div className="sheet overflow-x-auto">
              <table className="table-sheet">
                <thead>
                  <tr>
                    <th>Teacher</th>
                    <th>Class</th>
                    <th>Subject</th>
                    <th aria-label="Actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedAssignments.map((a) => (
                    <tr key={a.id}>
                      <td className="font-medium">{a.teacherName}</td>
                      <td>{a.className}</td>
                      <td>{a.subjectName}</td>
                      <td className="whitespace-nowrap">
                        <button
                          className="icon-btn"
                          onClick={() => openEditModal(a)}
                          title="Edit assignment"
                          aria-label={`Edit ${a.teacherName} in ${a.className} – ${a.subjectName}`}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          className="icon-btn icon-btn-danger"
                          onClick={() => handleDelete(a.id)}
                          aria-label={`Remove ${a.teacherName} from ${a.className} – ${a.subjectName}`}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                page={safePage}
                pageSize={PAGE_SIZE}
                total={assignments.length}
                onPageChange={setPage}
              />
            </div>
          )}

          {showModal && (
            <div
              className="modal-overlay"
              role="dialog"
              aria-modal="true"
              aria-label={editingAssignment ? "Edit teacher assignment" : "Assign teacher"}
              onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
            >
              <div className="modal-sheet">
                <div className="modal-head">
                  <h2>
                    {editingAssignment
                      ? "Edit Teacher Assignment"
                      : "Assign Teacher to Class–Subject"}
                  </h2>
                  <button
                    className="icon-btn"
                    onClick={() => setShowModal(false)}
                    aria-label="Close"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="modal-body">
                  {modalError && (
                    <div className="notice notice-error" role="alert">{modalError}</div>
                  )}
                  <div className="space-y-4">
                    <div className="field">
                      <label htmlFor="ta-teacher">Teacher</label>
                      <select
                        id="ta-teacher"
                        className="select"
                        value={formData.teacherId}
                        onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                      >
                        <option value="">Select a teacher</option>
                        {teachers.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                      {teachers.length === 0 && (
                        <p className="field-error">No teacher accounts exist yet.</p>
                      )}
                    </div>
                    <div className="field">
                      <label htmlFor="ta-class-subject">Class–Subject</label>
                      <select
                        id="ta-class-subject"
                        className="select"
                        value={formData.classSubjectId}
                        onChange={(e) => setFormData({ ...formData, classSubjectId: e.target.value })}
                      >
                        <option value="">Select a class–subject</option>
                        {classSubjects.map((cs) => (
                          <option key={cs.id} value={cs.id}>{cs.className} – {cs.subjectName}</option>
                        ))}
                      </select>
                      {classSubjects.length === 0 && (
                        <p className="field-error">Create class–subject links first.</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="modal-foot">
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={saving}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                    {saving ? "Saving…" : editingAssignment ? "Save" : "Assign"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
