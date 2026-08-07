"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import { Submission } from "@/lib/types";

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response = await api.get<Submission[]>("/api/admin/submissions");
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
    <ProtectedRoute allowedRoles={["Admin"]}>
      <DashboardLayout allowedRoles={["Admin"]}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">All Submissions</h1>

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-2 text-left">Assignment</th>
                    <th className="px-4 py-2 text-left">Student</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Marks</th>
                    <th className="px-4 py-2 text-left">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s) => (
                    <tr key={s.id} className="border-b">
                      <td className="px-4 py-3 font-medium">{s.assignmentTitle}</td>
                      <td className="px-4 py-3">{s.studentName}</td>
                      <td className="px-4 py-3 capitalize">{s.status}</td>
                      <td className="px-4 py-3">{s.marks ?? "Not graded"}</td>
                      <td className="px-4 py-3">
                        {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : "—"}
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
