"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import api, { getErrorMessage } from "@/lib/api";
import { Assignment, CreateAssignmentDto, ClassSubjectDto } from "@/lib/types";
import { assignmentStatusLabel, assignmentStampClass } from "@/lib/status";
import LoadingNote from "@/components/ui/LoadingNote";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/Pagination";
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

const PAGE_SIZE = 10;

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classSubjects, setClassSubjects] = useState<ClassSubjectDto[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [formData, setFormData] = useState<CreateAssignmentDto>({
    title: "",
    description: "",
    classSubjectId: "",
    deadline: "",
    maxMarks: 0,
    status: "Draft" as "Draft" | "Published",
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await api.get<Assignment[]>("/api/teacher/assignments");
      setAssignments(response.data || []);
    } catch (err) {
      console.error("Failed to fetch:", err);
      setAssignments([]);
    }
    setLoading(false);
  };

  const fetchClassSubjects = async () => {
    try {
      const response = await api.get<ClassSubjectDto[]>("/api/teacher/class-subjects");
      setClassSubjects(response.data || []);
    } catch (err) {
      console.error("Failed to fetch:", err);
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchClassSubjects();
  }, []);

  const totalPages = Math.max(1, Math.ceil(assignments.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedAssignments = assignments.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const openCreateModal = async () => {
    setEditingAssignment(null);
    setFormData({
      title: "",
      description: "",
      classSubjectId: "",
      deadline: "",
      maxMarks: 0,
      status: "Draft",
    });
    await fetchClassSubjects();
    setShowModal(true);
  };

  const openEditModal = async (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description,
      classSubjectId: assignment.classSubjectId,
      deadline: assignment.deadline,
      maxMarks: assignment.maxMarks,
      status: assignment.status,
    });
    await fetchClassSubjects();
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.classSubjectId || formData.maxMarks <= 0) {
      alert("Please fill in all required fields");
      return;
    }
    try {
      const payload = { ...formData };
      if (editingAssignment) {
        await api.put(`/api/teacher/assignments/${editingAssignment.id}`, payload);
      } else {
        await api.post("/api/teacher/assignments", payload);
      }
      setShowModal(false);
      setPage(1);
      fetchAssignments();
    } catch (err) {
      console.error("Failed:", err);
      alert(getErrorMessage(err, "Failed to save"));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this assignment?")) return;
    try {
      await api.delete(`/api/teacher/assignments/${id}`);
      setPage(1);
      fetchAssignments();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["Teacher"]}>
      <DashboardLayout allowedRoles={["Teacher"]}>
        <div>
          <div className="title-block">
            <h1>My Assignments</h1>
            <button onClick={openCreateModal} className="btn btn-primary">
              <PlusIcon className="w-4 h-4" />
              Create Assignment
            </button>
          </div>

          {loading ? (
            <LoadingNote />
          ) : assignments.length === 0 ? (
            <EmptyState>You have not created any assignments yet.</EmptyState>
          ) : (
            <div className="sheet overflow-x-auto">
              <table className="table-sheet">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Class</th>
                    <th>Subject</th>
                    <th>Deadline</th>
                    <th>Marks</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedAssignments.map((a) => (
                    <tr key={a.id}>
                      <td className="font-medium">{a.title}</td>
                      <td>{a.className}</td>
                      <td>{a.subjectName}</td>
                      <td className="tnum">{new Date(a.deadline).toLocaleString()}</td>
                      <td className="tnum">{a.maxMarks}</td>
                      <td>
                        <span className={assignmentStampClass(a.status)}>{assignmentStatusLabel(a.status)}</span>
                      </td>
                      <td className="whitespace-nowrap">
                        <button
                          className="icon-btn"
                          onClick={() => openEditModal(a)}
                          aria-label={`Edit ${a.title}`}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          className="icon-btn icon-btn-danger"
                          onClick={() => handleDelete(a.id)}
                          aria-label={`Delete ${a.title}`}
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
              onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
            >
              <div className="modal-sheet">
                <div className="modal-head">
                  <h2>{editingAssignment ? "Edit Assignment" : "Create Assignment"}</h2>
                  <button
                    className="icon-btn"
                    onClick={() => setShowModal(false)}
                    aria-label="Close"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="space-y-4">
                    <div className="field">
                      <label>Title</label>
                      <input
                        type="text"
                        className="input"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div className="field">
                      <label>Description</label>
                      <textarea
                        className="textarea"
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                    <div className="field">
                      <label>Class-Subject</label>
                      <select
                        className="select"
                        value={formData.classSubjectId}
                        onChange={(e) => setFormData({ ...formData, classSubjectId: e.target.value })}
                      >
                        <option value="">Select a class-subject</option>
                        {classSubjects.map((cs) => (
                          <option key={cs.id} value={cs.id}>
                            {cs.className} - {cs.subjectName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label>Deadline</label>
                      <input
                        type="datetime-local"
                        className="input"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      />
                    </div>
                    <div className="field">
                      <label>Max Marks</label>
                      <input
                        type="number"
                        className="input"
                        value={formData.maxMarks}
                        onChange={(e) => setFormData({ ...formData, maxMarks: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="field">
                      <label>Status</label>
                      <select
                        className="select"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as "Draft" | "Published" })}
                      >
                        <option value="Draft">Draft</option>
                        <option value="Published">Published</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-foot">
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleSubmit}>
                    Save
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
