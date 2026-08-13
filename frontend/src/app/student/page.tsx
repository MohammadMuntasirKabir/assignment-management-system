"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import { Assignment, Submission } from "@/lib/types";

export default function StudentDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [aRes, sRes] = await Promise.all([
          api.get<Assignment[]>("/api/student/assignments"),
          api.get<Submission[]>("/api/student/submissions"),
        ]);
        setAssignments(aRes.data || []);
        setSubmissions(sRes.data || []);
      } catch (err) {
        console.error("Failed to fetch:", err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const pendingCount = submissions.filter(s => s.status === "Submitted" || s.status === "Late").length;
  const gradedCount = submissions.filter(s => s.status === "Reviewed").length;

  const stampClass = (status: string) => {
    switch (status) {
      case "Reviewed":
        return "stamp stamp-green";
      case "Late":
        return "stamp stamp-red";
      case "Submitted":
        return "stamp stamp-blue";
      default:
        return "stamp stamp-gray";
    }
  };

  return (
    <ProtectedRoute allowedRoles={["Student"]}>
      <DashboardLayout allowedRoles={["Student"]}>
        <div>
          <div className="title-block">
            <h1>Student Dashboard</h1>
            <span className="tb-note">Project Overview</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="stat-block">
              <div className="stat-label">Available Assignments</div>
              <div className="stat-value">{assignments.length}</div>
            </div>
            <div className="stat-block">
              <div className="stat-label">Pending Review</div>
              <div className="stat-value">{pendingCount}</div>
            </div>
            <div className="stat-block">
              <div className="stat-label">Graded Submissions</div>
              <div className="stat-value">{gradedCount}</div>
            </div>
          </div>

          {loading ? (
            <div className="loading-note">
              <span className="spinner"></span>
              Loading…
            </div>
          ) : (
            <>
              <div className="sheet overflow-x-auto mb-6">
                <div className="anno px-4 pt-4">My Assignments</div>
                {assignments.length === 0 ? (
                  <div className="empty-state">No assignments available.</div>
                ) : (
                  <table className="table-sheet">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Subject</th>
                        <th>Deadline</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map((a) => (
                        <tr key={a.id}>
                          <td className="font-medium">{a.title}</td>
                          <td>{a.subjectName}</td>
                          <td className="tnum">{new Date(a.deadline).toLocaleString()}</td>
                          <td>
                            {new Date() > new Date(a.deadline) ? (
                              <span className="stamp stamp-red">Past due</span>
                            ) : (
                              <span className="stamp stamp-blue">Due soon</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="sheet overflow-x-auto">
                <div className="anno px-4 pt-4">My Recent Submissions</div>
                {submissions.length === 0 ? (
                  <div className="empty-state">No submissions yet.</div>
                ) : (
                  <table className="table-sheet">
                    <thead>
                      <tr>
                        <th>Assignment</th>
                        <th>Status</th>
                        <th>Marks</th>
                        <th>Feedback</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((s) => (
                        <tr key={s.id}>
                          <td>{s.assignmentTitle}</td>
                          <td>
                            <span className={stampClass(s.status)}>{s.status}</span>
                          </td>
                          <td className="tnum">{s.marks ?? "—"}</td>
                          <td>{s.feedback ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
