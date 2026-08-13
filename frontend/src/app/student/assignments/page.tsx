"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import { Assignment, Submission } from "@/lib/types";

type AssignmentFilter = "due" | "submitted" | "overdue";

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

  const ribbonFor = (a: Assignment) => {
    if (submittedIds.has(a.id)) {
      return <span className="stamp stamp-green whitespace-nowrap">Submitted</span>;
    }
    if (isOverdue(a)) {
      return <span className="stamp stamp-red whitespace-nowrap">Overdue</span>;
    }
    return <span className="stamp stamp-blue whitespace-nowrap">Due</span>;
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
                onClick={() => setFilter(f.value)}
                className={`btn btn-sm ${filter === f.value ? "btn-primary" : "btn-secondary"}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-note">
              <span className="spinner"></span>
              Loading…
            </div>
          ) : visibleAssignments.length === 0 ? (
            <div className="empty-state">{EMPTY_NOTES[filter]}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {visibleAssignments.map((a) => (
                <div key={a.id} className="sheet p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-start gap-3">
                    <h2 className="font-semibold text-lg leading-snug">{a.title}</h2>
                    {ribbonFor(a)}
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
