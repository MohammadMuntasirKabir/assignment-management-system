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

  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <DashboardLayout allowedRoles={["Admin"]}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">All Assignments</h1>

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Class</th>
                    <th className="px-4 py-2 text-left">Subject</th>
                    <th className="px-4 py-2 text-left">Teacher</th>
                    <th className="px-4 py-2 text-left">Deadline</th>
                    <th className="px-4 py-2 text-left">Max Marks</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr key={a.id} className="border-b">
                      <td className="px-4 py-3 font-medium">{a.title}</td>
                      <td className="px-4 py-3">{a.className}</td>
                      <td className="px-4 py-3">{a.subjectName}</td>
                      <td className="px-4 py-3">{a.teacherName}</td>
                      <td className="px-4 py-3">{new Date(a.deadline).toLocaleString()}</td>
                      <td className="px-4 py-3">{a.maxMarks}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded text-xs ${
                          a.status === "Published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {statusLabel(a.status)}
                        </span>
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
