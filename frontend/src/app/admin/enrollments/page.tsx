"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import api, { getErrorMessage } from "@/lib/api";
import { StudentEnrollmentDto, Class, User } from "@/lib/types";
import { roleNumberToRole } from "@/lib/auth";
import LoadingNote from "@/components/ui/LoadingNote";
import EmptyState from "@/components/ui/EmptyState";
import { PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<StudentEnrollmentDto[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ studentId: "", classId: "" });
  const [modalError, setModalError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [enrRes, usersRes, cRes] = await Promise.all([
        api.get<StudentEnrollmentDto[]>("/api/admin/enrollments"),
        api.get<{ items: Array<Omit<User, "role"> & { role: number }> }>("/api/admin/users", {
          params: { page: 1, pageSize: 1000 },
        }),
        api.get<Class[]>("/api/admin/classes"),
      ]);
      setEnrollments(enrRes.data || []);
      setStudents(
        (usersRes.data?.items || [])
          .filter((u) => roleNumberToRole(u.role) === "Student")
          .map((u) => ({ ...u, role: roleNumberToRole(u.role) }))
      );
      setClasses(cRes.data || []);
    } catch (err) {
      console.error("Failed to fetch:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openCreateModal = () => {
    setFormData({ studentId: "", classId: "" });
    setModalError("");
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.studentId || !formData.classId) {
      setModalError("Pick a student and a class.");
      return;
    }
    setSaving(true);
    setModalError("");
    try {
      await api.post("/api/admin/enroll-student", {
        studentId: formData.studentId,
        classId: formData.classId,
      });
      setShowModal(false);
      fetchAll();
    } catch (err) {
      setModalError(getErrorMessage(err, "Failed to enroll student"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove this enrollment?")) return;
    try {
      await api.delete(`/api/admin/enrollments/${id}`);
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
            <h1>Student Enrollments</h1>
            <button onClick={openCreateModal} className="btn btn-primary">
              <PlusIcon className="w-4 h-4" />
              Enroll Student
            </button>
          </div>

          {loading ? (
            <LoadingNote />
          ) : enrollments.length === 0 ? (
            <EmptyState>No enrollments yet.</EmptyState>
          ) : (
            <div className="sheet overflow-x-auto">
              <table className="table-sheet">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Class</th>
                    <th aria-label="Actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((e) => (
                    <tr key={e.id}>
                      <td className="font-medium">{e.studentName}</td>
                      <td>{e.className}</td>
                      <td className="whitespace-nowrap">
                        <button
                          className="icon-btn icon-btn-danger"
                          onClick={() => handleDelete(e.id)}
                          aria-label={`Remove ${e.studentName} from ${e.className}`}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showModal && (
            <div
              className="modal-overlay"
              role="dialog"
              aria-modal="true"
              aria-label="Enroll student"
              onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
            >
              <div className="modal-sheet">
                <div className="modal-head">
                  <h2>Enroll Student in Class</h2>
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
                      <label htmlFor="en-student">Student</label>
                      <select
                        id="en-student"
                        className="select"
                        value={formData.studentId}
                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      >
                        <option value="">Select a student</option>
                        {students.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                      {students.length === 0 && (
                        <p className="field-error">No student accounts exist yet.</p>
                      )}
                    </div>
                    <div className="field">
                      <label htmlFor="en-class">Class</label>
                      <select
                        id="en-class"
                        className="select"
                        value={formData.classId}
                        onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                      >
                        <option value="">Select a class</option>
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-foot">
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={saving}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                    {saving ? "Enrolling…" : "Enroll"}
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
