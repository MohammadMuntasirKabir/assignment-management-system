"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import api, { getErrorMessage } from "@/lib/api";
import { Submission, GradeSubmissionDto } from "@/lib/types";
import LoadingNote from "@/components/ui/LoadingNote";
import EmptyState from "@/components/ui/EmptyState";
import { XMarkIcon } from "@heroicons/react/24/outline";

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

  return (
    <ProtectedRoute allowedRoles={["Teacher"]}>
      <DashboardLayout allowedRoles={["Teacher"]}>
        <div>
          <div className="title-block">
            <h1>Student Submissions</h1>
            <span className="tb-note">{submissions.length} items</span>
          </div>

          {loading ? (
            <LoadingNote />
          ) : submissions.length === 0 ? (
            <EmptyState>No submissions to review yet.</EmptyState>
          ) : (
            <div className="sheet overflow-x-auto">
              <table className="table-sheet">
                <thead>
                  <tr>
                    <th>Assignment</th>
                    <th>Student</th>
                    <th>Submitted</th>
                    <th>Marks</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s) => (
                    <tr key={s.id}>
                      <td className="font-medium">{s.assignmentTitle}</td>
                      <td>{s.studentName}</td>
                      <td className="tnum">
                        {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : "—"}
                      </td>
                      <td className="tnum">{s.marks ?? "Not graded"}</td>
                      <td className="whitespace-nowrap">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => openGradeModal(s)}
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
            <div
              className="modal-overlay"
              onClick={(e) => e.target === e.currentTarget && closeGradeModal()}
            >
              <div className="modal-sheet">
                <div className="modal-head">
                  <h2>Grade Submission</h2>
                  <button className="icon-btn" onClick={closeGradeModal} aria-label="Close">
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="space-y-4">
                    <div className="field">
                      <label>Marks</label>
                      <input
                        type="number"
                        className="input"
                        value={gradeForm.marks}
                        onChange={(e) => setGradeForm({ ...gradeForm, marks: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="field">
                      <label>Feedback</label>
                      <textarea
                        className="textarea"
                        rows={4}
                        placeholder="Enter your feedback here..."
                        value={gradeForm.feedback}
                        onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                      />
                    </div>
                    <div className="field">
                      <label>Status</label>
                      <select
                        className="select"
                        value={gradeForm.status}
                        onChange={(e) => setGradeForm({ ...gradeForm, status: e.target.value as "Reviewed" | "Submitted" | "Late" | "Draft" })}
                      >
                        <option value="Reviewed">Reviewed</option>
                        <option value="Submitted">Submitted</option>
                        <option value="Late">Late</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-foot">
                  <button className="btn btn-secondary" onClick={closeGradeModal}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={submitGrade}>
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
