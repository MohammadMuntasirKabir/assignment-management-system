"use client";

import { useState, useEffect, useCallback } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import { Assignment, PagedResult } from "@/lib/types";
import Pagination from "@/components/Pagination";

const PAGE_SIZE = 20;

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = useCallback(async (targetPage: number) => {
    setLoading(true);
    try {
      const response = await api.get<PagedResult<Assignment>>("/api/admin/assignments", {
        params: { page: targetPage, pageSize: PAGE_SIZE },
      });
      setAssignments(response.data?.items || []);
      setTotal(response.data?.total ?? 0);
    } catch (err) {
      console.error("Failed to fetch:", err);
      setAssignments([]);
      setTotal(0);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAssignments(1);
  }, [fetchAssignments]);

  const handlePageChange = (next: number) => {
    setPage(next);
    fetchAssignments(next);
  };

  const statusLabel = (status: string) => {
    const labels: Record<string, string> = {
      "0": "Draft",
      "1": "Published",
      Draft: "Draft",
      Published: "Published",
    };
    return labels[status] || status;
  };

  const stampClass = (status: string) =>
    statusLabel(status) === "Published" ? "stamp stamp-blue" : "stamp stamp-gray";

  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <DashboardLayout allowedRoles={["Admin"]}>
        <div>
          <div className="title-block">
            <h1>All Assignments</h1>
            <span className="tb-note">{total} items</span>
          </div>

          {loading ? (
            <div className="loading-note">
              <span className="spinner"></span>
              Loading…
            </div>
          ) : assignments.length === 0 ? (
            <div className="empty-state">No assignments recorded yet.</div>
          ) : (
            <div className="sheet overflow-x-auto">
              <table className="table-sheet">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Class</th>
                    <th>Subject</th>
                    <th>Teacher</th>
                    <th>Deadline</th>
                    <th>Max Marks</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr key={a.id}>
                      <td className="font-medium">{a.title}</td>
                      <td>{a.className}</td>
                      <td>{a.subjectName}</td>
                      <td>{a.teacherName}</td>
                      <td className="tnum">{new Date(a.deadline).toLocaleString()}</td>
                      <td className="tnum">{a.maxMarks}</td>
                      <td>
                        <span className={stampClass(a.status)}>{statusLabel(a.status)}</span>
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
