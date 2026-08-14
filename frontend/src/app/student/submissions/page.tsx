"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import { Submission } from "@/lib/types";
import LoadingNote from "@/components/ui/LoadingNote";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/Pagination";

const PAGE_SIZE = 10;

export default function StudentSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

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

  const gradedSubmissions = submissions.filter((s) => s.status !== "Draft");

  const totalPages = Math.max(1, Math.ceil(gradedSubmissions.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedSubmissions = gradedSubmissions.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <ProtectedRoute allowedRoles={["Student"]}>
      <DashboardLayout allowedRoles={["Student"]}>
        <div>
          <div className="title-block">
            <h1>My Submissions</h1>
            <span className="tb-note">{gradedSubmissions.length} items</span>
          </div>

          {loading ? (
            <LoadingNote />
          ) : gradedSubmissions.length === 0 ? (
            <EmptyState>No submitted or graded assignments yet.</EmptyState>
          ) : (
            <div className="sheet overflow-x-auto">
              <table className="table-sheet">
                <thead>
                  <tr>
                    <th>Assignment</th>
                    <th>Marks</th>
                    <th>Submitted</th>
                    <th>Feedback</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedSubmissions.map((s) => (
                    <tr key={s.id}>
                      <td className="font-medium">{s.assignmentTitle}</td>
                      <td className="tnum">{s.marks !== null ? `${s.marks}` : "Not graded"}</td>
                      <td className="tnum">
                        {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : "—"}
                      </td>
                      <td>{s.feedback || "—"}</td>
                      <td>
                        <Link
                          href={`/student/assignments/${s.assignmentId}`}
                          className="btn btn-secondary btn-sm"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                page={safePage}
                pageSize={PAGE_SIZE}
                total={gradedSubmissions.length}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
