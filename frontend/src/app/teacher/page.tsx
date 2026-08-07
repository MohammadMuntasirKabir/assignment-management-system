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

  return (
    <ProtectedRoute allowedRoles={["Teacher"]}>
      <DashboardLayout allowedRoles={["Teacher"]}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Teacher Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-700">My Assignments</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{assignments.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-700">Submissions to Review</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">{submissionsCount}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-700">Assigned Classes</h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">{classSubjects.length}</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <h2 className="text-xl font-semibold p-4 border-b">My Assignments</h2>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Deadline</th>
                    <th className="px-4 py-2 text-left">Max Marks</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr key={a.id} className="border-b">
                      <td className="px-4 py-3">{a.title}</td>
                      <td className="px-4 py-3">{new Date(a.deadline).toLocaleString()}</td>
                      <td className="px-4 py-3">{a.maxMarks}</td>
                      <td className="px-4 py-3 capitalize">{a.status.toLowerCase()}</td>
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
