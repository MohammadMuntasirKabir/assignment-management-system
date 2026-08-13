"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import { Submission } from "@/lib/types";

export default function StudentSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response = await api.get<Submission[]>("/api/student/submissions");
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

  return (
    <ProtectedRoute allowedRoles={["Student"]}>
      <DashboardLayout allowedRoles={["Student"]}>
        <div>
          <div className="title-block">
            <h1>My Submissions</h1>
            <span className="tb-note">{submissions.length} items</span>
          </div>

          {loading ? (
            <div className="loading-note">
              <span className="spinner"></span>
              Loading…
            </div>
          ) : submissions.length === 0 ? (
            <div className="empty-state">No submissions yet.</div>
          ) : (
            <div className="sheet overflow-x-auto">
              <table className="table-sheet">
                <thead>
                  <tr>
                    <th>Assignment</th>
                    <th>Status</th>
                    <th>Marks</th>
                    <th>Submitted</th>
                    <th>Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s) => (
                    <tr key={s.id}>
                      <td className="font-medium">{s.assignmentTitle}</td>
                      <td className="text-sm text-ink-soft">{s.status}</td>
                      <td className="tnum">{s.marks !== null ? `${s.marks}` : "Not graded"}</td>
                      <td className="tnum">
                        {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : "—"}
                      </td>
                      <td>{s.feedback || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
