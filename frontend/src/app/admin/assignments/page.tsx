"use client";

import { useState, useEffect, useCallback } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import { Assignment, PagedResult } from "@/lib/types";
import { assignmentStatusLabel, assignmentStampClass } from "@/lib/status";
import LoadingNote from "@/components/ui/LoadingNote";
import EmptyState from "@/components/ui/EmptyState";
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

  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <DashboardLayout allowedRoles={["Admin"]}>
        <div>
          <div className="title-block">
            <h1>All Assignments</h1>
            <span className="tb-note">{total} items</span>
          </div>

          {loading ? (
            <LoadingNote />
          ) : assignments.length === 0 ? (
            <EmptyState>No assignments recorded yet.</EmptyState>
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
                        <span className={assignmentStampClass(a.status)}>{assignmentStatusLabel(a.status)}</span>
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
