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
          <div className="title-block">
            <h1>My Assignments</h1>
            <span className="tb-note">{assignments.length} items</span>
          </div>

          {loading ? (
            <div className="loading-note">
              <span className="spinner"></span>
              Loading…
            </div>
          ) : assignments.length === 0 ? (
            <div className="empty-state">No assignments available.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {assignments.map((a) => (
                <div key={a.id} className="sheet p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-start gap-3">
                    <h2 className="font-semibold text-lg leading-snug">{a.title}</h2>
                    {isOverdue(a.deadline) ? (
                      <span className="stamp stamp-red whitespace-nowrap">Overdue</span>
                    ) : (
                      <span className="stamp stamp-blue whitespace-nowrap">Active</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-3">{a.description}</p>
                  <div className="text-sm space-y-1">
                    <div><span className="anno">Subject</span> {a.subjectName}</div>
                    <div><span className="anno">Class</span> {a.className}</div>
                    <div><span className="anno">Deadline</span> <span className="tnum">{new Date(a.deadline).toLocaleString()}</span></div>
                    <div><span className="anno">Max Marks</span> <span className="tnum">{a.maxMarks}</span></div>
                    <div><span className="anno">Teacher</span> {a.teacherName}</div>
                  </div>
                  <Link
                    href={`/student/assignments/${a.id}`}
                    className="btn btn-primary w-full mt-auto"
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
