"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import api, { getErrorMessage } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { Assignment, CreateAssignmentDto, ClassSubjectDto } from "@/lib/types";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classSubjects, setClassSubjects] = useState<ClassSubjectDto[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [formData, setFormData] = useState<CreateAssignmentDto>({
    title: "",
    description: "",
    classSubjectId: "",
    teacherId: "",
    deadline: "",
    maxMarks: 0,
    status: "Draft" as "Draft" | "Published",
  });
  const [loading, setLoading] = useState(true);

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

  const openCreateModal = async () => {
    setEditingAssignment(null);
    setFormData({
      title: "",
      description: "",
      classSubjectId: "",
      teacherId: "",
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
      teacherId: assignment.teacherId,
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
      const teacherId = await getTeacherId();
      const payload = { ...formData, teacherId };
      if (editingAssignment) {
        await api.put(`/api/teacher/assignments/${editingAssignment.id}`, payload);
      } else {
        await api.post("/api/teacher/assignments", payload);
      }
      setShowModal(false);
      fetchAssignments();
    } catch (err) {
      console.error("Failed:", err);
      alert(getErrorMessage(err, "Failed to save"));
    }
  };

  const getTeacherId = async (): Promise<string> => {
    const storedUser = getStoredUser();
    return storedUser?.id ?? "";
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this assignment?")) return;
    try {
      await api.delete(`/api/teacher/assignments/${id}`);
      fetchAssignments();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["Teacher"]}>
      <DashboardLayout allowedRoles={["Teacher"]}>
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Create Assignment
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Class</th>
                    <th className="px-4 py-2 text-left">Subject</th>
                    <th className="px-4 py-2 text-left">Deadline</th>
                    <th className="px-4 py-2 text-left">Marks</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr key={a.id} className="border-b">
                      <td className="px-4 py-3 font-medium">{a.title}</td>
                      <td className="px-4 py-3">{a.className}</td>
                      <td className="px-4 py-3">{a.subjectName}</td>
                      <td className="px-4 py-3">{new Date(a.deadline).toLocaleString()}</td>
                      <td className="px-4 py-3">{a.maxMarks}</td>
                      <td className="px-4 py-3 capitalize">{a.status.toLowerCase()}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openEditModal(a)}
                          className="text-blue-600 hover:text-blue-800 mr-2"
                        >
                          <PencilIcon className="w-5 h-5 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="w-5 h-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showModal && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">
                  {editingAssignment ? "Edit Assignment" : "Create Assignment"}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Class-Subject</label>
                    <select
                      value={formData.classSubjectId}
                      onChange={(e) => setFormData({ ...formData, classSubjectId: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select a class-subject</option>
                      {classSubjects.map((cs) => (
                        <option key={cs.id} value={cs.id}>
                          {cs.className} - {cs.subjectName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Deadline</label>
                    <input
                      type="datetime-local"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Max Marks</label>
                    <input
                      type="number"
                      value={formData.maxMarks}
                      onChange={(e) => setFormData({ ...formData, maxMarks: parseInt(e.target.value) || 0 })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as "Draft" | "Published" })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
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
