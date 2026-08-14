"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import { Assignment, Submission } from "@/lib/types";
import LoadingNote from "@/components/ui/LoadingNote";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/Pagination";

type AssignmentFilter = "due" | "submitted" | "overdue";

const PAGE_SIZE = 12;

const FILTERS: { value: AssignmentFilter; label: string }[] = [
  { value: "due", label: "Due" },
  { value: "submitted", label: "Submitted" },
  { value: "overdue", label: "Overdue" },
];

const EMPTY_NOTES: Record<AssignmentFilter, string> = {
  due: "No assignments due right now.",
  submitted: "No submissions yet.",
  overdue: "Nothing overdue — you're all caught up.",
};

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter] = useState<AssignmentFilter>("due");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

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
        setAssignments([]);
        setSubmissions([]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const submittedIds = new Set(submissions.map((s) => s.assignmentId));

  const isOverdue = (a: Assignment) => new Date() > new Date(a.deadline);

  const matchesFilter = (a: Assignment) => {
    const submitted = submittedIds.has(a.id);
    if (filter === "submitted") return submitted;
    if (filter === "overdue") return !submitted && isOverdue(a);
    return !submitted && !isOverdue(a);
  };

  const visibleAssignments = assignments.filter(matchesFilter);

  const totalPages = Math.max(1, Math.ceil(visibleAssignments.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedAssignments = visibleAssignments.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const statusFor = (a: Assignment) => {
    if (submittedIds.has(a.id)) {
      return "Submitted";
    }
    if (isOverdue(a)) {
      return "Overdue";
    }
    return "Due";
  };

  const statusStamp = (a: Assignment) => {
    if (submittedIds.has(a.id)) return "stamp stamp-green";
    if (isOverdue(a)) return "stamp stamp-red";
    return "stamp stamp-blue";
  };

  return (
    <ProtectedRoute allowedRoles={["Student"]}>
      <DashboardLayout allowedRoles={["Student"]}>
        <div>
          <div className="title-block">
            <h1>My Assignments</h1>
            <span className="tb-note">{visibleAssignments.length} items</span>
          </div>

          <div className="flex gap-2 mb-6">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => {
                  setFilter(f.value);
                  setPage(1);
                }}
                className={`btn btn-sm ${filter === f.value ? "btn-primary" : "btn-secondary"}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <LoadingNote />
          ) : visibleAssignments.length === 0 ? (
            <EmptyState>{EMPTY_NOTES[filter]}</EmptyState>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {pagedAssignments.map((a) => (
                <div key={a.id} className="sheet p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-start gap-3">
                    <h2 className="font-semibold text-lg leading-snug">{a.title}</h2>
                    <span className={`${statusStamp(a)} shrink-0 whitespace-nowrap`}>{statusFor(a)}</span>
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
              <Pagination
                page={safePage}
                pageSize={PAGE_SIZE}
                total={visibleAssignments.length}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
