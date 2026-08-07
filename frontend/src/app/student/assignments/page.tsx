"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import { Assignment } from "@/lib/types";

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await api.get<Assignment[]>("/api/student/assignments");
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

  const isOverdue = (deadline: string) => new Date() > new Date(deadline);

  return (
    <ProtectedRoute allowedRoles={["Student"]}>
      <DashboardLayout allowedRoles={["Student"]}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Assignments</h1>

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-12 text-gray-600">No assignments available.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignments.map((a) => (
                <div key={a.id} className="bg-white rounded-lg shadow border p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">{a.title}</h2>
                    <span className={`text-xs px-2 py-1 rounded ${
                      isOverdue(a.deadline)
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {isOverdue(a.deadline) ? "Overdue" : "Active"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{a.description}</p>
                  <div className="text-sm text-gray-500 mb-4">
                    <div><strong>Subject:</strong> {a.subjectName}</div>
                    <div><strong>Class:</strong> {a.className}</div>
                    <div><strong>Deadline:</strong> {new Date(a.deadline).toLocaleString()}</div>
                    <div><strong>Max Marks:</strong> {a.maxMarks}</div>
                    <div><strong>Teacher:</strong> {a.teacherName}</div>
                  </div>
                  <Link
                    href={`/student/assignments/${a.id}`}
                    className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
