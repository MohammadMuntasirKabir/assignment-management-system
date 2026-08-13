"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import { Assignment } from "@/lib/types";

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await api.get<Assignment[]>("/api/admin/assignments");
      setAssignments(response.data || []);
    } catch (err) {
      console.error("Failed to fetch:", err);
      setAssignments([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const statusLabel = (status: string) => {
    const labels: Record<string, string> = {
      "0": "Draft",
      "1": "Published",
      Draft: "Draft",
      Published: "Published",
    };
    return labels[status] || status;
  };

  const statusText = (status: string) =>
    statusLabel(status) === "Published" ? "Published" : "Draft";

  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <DashboardLayout allowedRoles={["Admin"]}>
        <div>
          <div className="title-block">
            <h1>All Assignments</h1>
            <span className="tb-note">{assignments.length} items</span>
          </div>

          {loading ? (
            <div className="loading-note">
              <span className="spinner"></span>
              Loading…
            </div>
          ) : assignments.length === 0 ? (
            <div className="empty-state">No assignments recorded yet.</div>
          ) : (
            <div className="sheet overflow-x-auto">
              <table className="table-sheet">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Class</th>
                    <th>Subject</th>
                    <th>Teacher</th>
                    <th>Deadline</th>
                    <th>Max Marks</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr key={a.id}>
                      <td className="font-medium">{a.title}</td>
                      <td>{a.className}</td>
                      <td>{a.subjectName}</td>
                      <td>{a.teacherName}</td>
                      <td className="tnum">{new Date(a.deadline).toLocaleString()}</td>
                      <td className="tnum">{a.maxMarks}</td>
                      <td className="text-sm text-[var(--ink-soft)]">{statusText(a.status)}</td>
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
