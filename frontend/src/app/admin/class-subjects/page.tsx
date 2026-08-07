"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import api, { getErrorMessage } from "@/lib/api";
import { ClassSubjectDto, Class, Subject } from "@/lib/types";

export default function AdminClassSubjectsPage() {
  const [classSubjects, setClassSubjects] = useState<ClassSubjectDto[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ classId: "", subjectId: "" });
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [csRes, cRes, sRes] = await Promise.all([
        api.get<ClassSubjectDto[]>("/api/admin/class-subjects"),
        api.get<Class[]>("/api/admin/classes"),
        api.get<Subject[]>("/api/admin/subjects"),
      ]);
      setClassSubjects(csRes.data || []);
      setClasses(cRes.data || []);
      setSubjects(sRes.data || []);
    } catch (err) {
      console.error("Failed to fetch:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSubmit = async () => {
    if (!formData.classId || !formData.subjectId) return;
    try {
      await api.post("/api/admin/class-subjects", { classId: formData.classId, subjectId: formData.subjectId });
      setShowModal(false);
      setFormData({ classId: "", subjectId: "" });
      fetchAll();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to link class and subject"));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Unlink this class-subject?")) return;
    try {
      await api.delete(`/api/admin/class-subjects/${id}`);
      fetchAll();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <DashboardLayout allowedRoles={["Admin"]}>
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Class-Subject Links</h1>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Link Class & Subject
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-2 text-left">Class</th>
                    <th className="px-4 py-2 text-left">Subject</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {classSubjects.map((cs) => (
                    <tr key={cs.id} className="border-b">
                      <td className="px-4 py-3">{cs.className}</td>
                      <td className="px-4 py-3">{cs.subjectName}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(cs.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Unlink
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showModal && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 w-96">
                <h2 className="text-xl font-semibold mb-4">Link Class & Subject</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Class</label>
                    <select
                      value={formData.classId}
                      onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select a class</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <select
                      value={formData.subjectId}
                      onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select a subject</option>
                      {subjects.map((subj) => (
                        <option key={subj.id} value={subj.id}>{subj.name}</option>
                      ))}
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
                    Link
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
