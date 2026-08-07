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
    <ProtectedRoute allowedRoles={["Student"]}>
      <DashboardLayout allowedRoles={["Student"]}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Submissions</h1>

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12 text-gray-600">No submissions yet.</div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-2 text-left">Assignment</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Marks</th>
                    <th className="px-4 py-2 text-left">Submitted</th>
                    <th className="px-4 py-2 text-left">Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s) => (
                    <tr key={s.id} className="border-b">
                      <td className="px-4 py-3 font-medium">{s.assignmentTitle}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded text-xs capitalize ${statusColor(s.status)}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {s.marks !== null ? `${s.marks}` : "Not graded"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {s.feedback || "—"}
                      </td>
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
