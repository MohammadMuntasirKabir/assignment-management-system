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

  return (
    <ProtectedRoute allowedRoles={["Student"]}>
      <DashboardLayout allowedRoles={["Student"]}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Student Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-700">Available Assignments</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{assignments.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-700">Pending Review</h3>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingCount}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-700">Graded Submissions</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">{gradedCount}</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
                <h2 className="text-xl font-semibold p-4 border-b">My Assignments</h2>
                {assignments.length === 0 ? (
                  <p className="p-4 text-gray-600">No assignments available.</p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-4 py-2 text-left">Title</th>
                        <th className="px-4 py-2 text-left">Subject</th>
                        <th className="px-4 py-2 text-left">Deadline</th>
                        <th className="px-4 py-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map((a) => (
                        <tr key={a.id} className="border-b">
                          <td className="px-4 py-3 font-medium">{a.title}</td>
                          <td className="px-4 py-3">{a.subjectName}</td>
                          <td className="px-4 py-3">{new Date(a.deadline).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            {new Date() > new Date(a.deadline) ? (
                              <span className="text-red-600 text-sm">Past due</span>
                            ) : (
                              <span className="text-green-600 text-sm">Due soon</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <h2 className="text-xl font-semibold p-4 border-b">My Recent Submissions</h2>
                {submissions.length === 0 ? (
                  <p className="p-4 text-gray-600">No submissions yet.</p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-4 py-2 text-left">Assignment</th>
                        <th className="px-4 py-2 text-left">Status</th>
                        <th className="px-4 py-2 text-left">Marks</th>
                        <th className="px-4 py-2 text-left">Feedback</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((s) => (
                        <tr key={s.id} className="border-b">
                          <td className="px-4 py-3">{s.assignmentTitle}</td>
                          <td className="px-4 py-3 capitalize">{s.status.toLowerCase()}</td>
                          <td className="px-4 py-3">{s.marks ?? "—"}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{s.feedback ?? "—"}</td>
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
