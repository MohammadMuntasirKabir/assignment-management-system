"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import { Assignment, ClassSubjectDto, Submission } from "@/lib/types";

export default function TeacherDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissionsCount, setSubmissionsCount] = useState(0);
  const [classSubjects, setClassSubjects] = useState<ClassSubjectDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aRes, sRes] = await Promise.all([
          api.get<Assignment[]>("/api/teacher/assignments"),
          api.get<Submission[]>("/api/teacher/submissions"),
        ]);
        setAssignments(aRes.data || []);
        setSubmissionsCount((sRes.data || []).length);
      } catch (err) {
        console.error("Failed to fetch:", err);
      }
      setLoading(false);
    };
    fetchData();

    const fetchClassSubjects = async () => {
      try {
        const response = await api.get<ClassSubjectDto[]>("/api/teacher/class-subjects");
        setClassSubjects(response.data || []);
      } catch (err) {
        console.error("Failed:", err);
      }
    };
    fetchClassSubjects();
  }, []);

  const statusText = (status: string) =>
    status === "Published" ? "Published" : "Draft";

  return (
    <ProtectedRoute allowedRoles={["Teacher"]}>
      <DashboardLayout allowedRoles={["Teacher"]}>
        <div>
          <div className="title-block">
            <h1>Teacher Dashboard</h1>
            <span className="tb-note">Project Overview</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="stat-block">
              <div className="stat-label">My Assignments</div>
              <div className="stat-value">{assignments.length}</div>
            </div>
            <div className="stat-block">
              <div className="stat-label">Submissions to Review</div>
              <div className="stat-value">{submissionsCount}</div>
            </div>
            <div className="stat-block">
              <div className="stat-label">Assigned Classes</div>
              <div className="stat-value">{classSubjects.length}</div>
            </div>
          </div>

          {loading ? (
            <div className="loading-note">
              <span className="spinner"></span>
              Loading…
            </div>
          ) : assignments.length === 0 ? (
            <div className="empty-state">You have not created any assignments yet.</div>
          ) : (
            <div className="sheet overflow-x-auto">
              <div className="anno px-4 pt-4">My Assignments</div>
              <table className="table-sheet">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Deadline</th>
                    <th>Max Marks</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr key={a.id}>
                      <td className="font-medium">{a.title}</td>
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
