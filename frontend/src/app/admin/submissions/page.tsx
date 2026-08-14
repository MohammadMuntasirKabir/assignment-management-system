"use client";

import { useState, useEffect, useCallback } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import { PagedResult, Submission } from "@/lib/types";
import Pagination from "@/components/Pagination";

const PAGE_SIZE = 20;

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = useCallback(async (targetPage: number) => {
    setLoading(true);
    try {
      const response = await api.get<PagedResult<Submission>>("/api/admin/submissions", {
        params: { page: targetPage, pageSize: PAGE_SIZE },
      });
      setSubmissions(response.data?.items || []);
      setTotal(response.data?.total ?? 0);
    } catch (err) {
      console.error("Failed to fetch:", err);
      setSubmissions([]);
      setTotal(0);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSubmissions(1);
  }, [fetchSubmissions]);

  const handlePageChange = (next: number) => {
    setPage(next);
    fetchSubmissions(next);
  };

  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <DashboardLayout allowedRoles={["Admin"]}>
        <div>
          <div className="title-block">
            <h1>All Submissions</h1>
            <span className="tb-note">{total} items</span>
          </div>

          {loading ? (
            <div className="loading-note">
              <span className="spinner"></span>
              Loading…
            </div>
          ) : submissions.length === 0 ? (
            <div className="empty-state">No submissions recorded yet.</div>
          ) : (
            <div className="sheet overflow-x-auto">
              <table className="table-sheet">
                <thead>
                  <tr>
                    <th>Assignment</th>
                    <th>Student</th>
                    <th>Marks</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s) => (
                    <tr key={s.id}>
                      <td className="font-medium">{s.assignmentTitle}</td>
                      <td>{s.studentName}</td>
                      <td className="tnum">{s.marks ?? "Not graded"}</td>
                      <td className="tnum">
                        {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                page={page}
                pageSize={PAGE_SIZE}
                total={total}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
