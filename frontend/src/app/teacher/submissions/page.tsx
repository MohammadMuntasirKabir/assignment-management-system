"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import api, { getErrorMessage } from "@/lib/api";
import { Submission, GradeSubmissionDto } from "@/lib/types";

export default function TeacherSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [gradeForm, setGradeForm] = useState({ marks: 0, feedback: "", status: "Reviewed" as "Reviewed" | "Submitted" | "Late" | "Draft" });

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response = await api.get<Submission[]>("/api/teacher/submissions");
      setSubmissions(response.data || []);
    } catch (err) {
      console.error("Failed to fetch:", err);
      setSubmissions([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const openGradeModal = (submission: Submission) => {
    setGradingId(submission.id);
    setGradeForm({
      marks: submission.marks ?? 0,
      feedback: submission.feedback ?? "",
      status: "Reviewed",
    });
  };

  const closeGradeModal = () => {
    setGradingId(null);
    setGradeForm({ marks: 0, feedback: "", status: "Reviewed" });
  };

  const submitGrade = async () => {
    if (gradingId === null) return;
    try {
      const payload: GradeSubmissionDto = {
        marks: gradeForm.marks,
        feedback: gradeForm.feedback,
        status: gradeForm.status,
      };
      await api.put(`/api/teacher/submissions/${gradingId}/grade`, payload);
      closeGradeModal();
      fetchSubmissions();
    } catch (err) {
      console.error("Failed to grade:", err);
      alert(getErrorMessage(err, "Failed to grade submission"));
    }
  };

  const statusColor = (status: string) => {
    const colors: Record<string, string> = {
      Draft: "bg-gray-100 text-gray-800",
      Submitted: "bg-blue-100 text-blue-800",
      Late: "bg-orange-100 text-orange-800",
      Reviewed: "bg-green-100 text-green-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <ProtectedRoute allowedRoles={["Teacher"]}>
      <DashboardLayout allowedRoles={["Teacher"]}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Student Submissions</h1>

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-2 text-left">Assignment</th>
                    <th className="px-4 py-2 text-left">Student</th>
                    <th className="px-4 py-2 text-left">Submitted</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Marks</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s) => (
                    <tr key={s.id} className="border-b">
                      <td className="px-4 py-3">{s.assignmentTitle}</td>
                      <td className="px-4 py-3">{s.studentName}</td>
                      <td className="px-4 py-3">
                        {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded text-xs capitalize ${statusColor(s.status)}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{s.marks ?? "Not graded"}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openGradeModal(s)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          {s.marks !== null ? "Re-grade" : "Grade"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {gradingId && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-96">
                <h2 className="text-xl font-semibold mb-4">Grade Submission</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Marks</label>
                    <input
                      type="number"
                      value={gradeForm.marks}
                      onChange={(e) => setGradeForm({ ...gradeForm, marks: parseInt(e.target.value) || 0 })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Feedback</label>
                    <textarea
                      value={gradeForm.feedback}
                      onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={4}
                      placeholder="Enter your feedback here..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={gradeForm.status}
                      onChange={(e) => setGradeForm({ ...gradeForm, status: e.target.value as "Reviewed" | "Submitted" | "Late" | "Draft" })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="Reviewed">Reviewed</option>
                      <option value="Submitted">Submitted</option>
                      <option value="Late">Late</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={closeGradeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitGrade}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Save Grade
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
