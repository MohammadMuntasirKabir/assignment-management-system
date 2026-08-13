"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import api, { getErrorMessage } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { Assignment, Submission, CreateSubmissionDto } from "@/lib/types";

interface StudentAssignmentDetailProps {
  params: Promise<{ id: string }>;
}

export default function StudentAssignmentDetail({ params }: StudentAssignmentDetailProps) {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [existingSubmission, setExistingSubmission] = useState<Submission | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { id } = use(params);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const aRes = await api.get<Assignment>(`/api/student/assignments/${id}`);
        setAssignment(aRes.data);

        const sRes = await api.get<Submission[]>(`/api/student/submissions`);
        const existing = sRes.data.find(s => s.assignmentId === id);
        if (existing) {
          setExistingSubmission(existing);
          setContent(existing.content);
        }
      } catch (err) {
        console.error("Failed to fetch:", err);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert("Please enter your submission content");
      return;
    }
    setSubmitting(true);
    try {
      const storedUser = getStoredUser();
      const studentId = storedUser?.id ?? "";

      if (existingSubmission) {
        await api.put<Submission>(`/api/student/submissions/${existingSubmission.id}`, { content });
        alert("Submission updated successfully!");
      } else {
        const payload: CreateSubmissionDto = {
          assignmentId: id,
          studentId: studentId,
          content,
        };
        await api.post<Submission>("/api/student/submissions", payload);
        alert("Submission created successfully!");
      }
      router.push("/student/submissions");
    } catch (err) {
      console.error("Failed to submit:", err);
      alert(getErrorMessage(err, "Failed to submit assignment"));
    }
    setSubmitting(false);
  };

  if (loading && !assignment) {
    return (
      <ProtectedRoute allowedRoles={["Student"]}>
        <DashboardLayout allowedRoles={["Student"]}>
          <div className="loading-note">
            <span className="spinner"></span>
            Loading…
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!assignment) {
    return (
      <ProtectedRoute allowedRoles={["Student"]}>
        <DashboardLayout allowedRoles={["Student"]}>
          <div className="notice notice-error">Assignment not found or not published.</div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const isOverdue = new Date() > new Date(assignment.deadline);
  const submissionStatus = existingSubmission ? existingSubmission.status : "Draft";

  return (
    <ProtectedRoute allowedRoles={["Student"]}>
      <DashboardLayout allowedRoles={["Student"]}>
        <div className="max-w-4xl mx-auto">
          <div className="title-block">
            <h1>{assignment.title}</h1>
            <span className="text-sm text-[var(--ink-soft)] whitespace-nowrap">
              {isOverdue ? "Overdue" : "Active"}
            </span>
          </div>

          <div className="sheet p-5 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div><span className="anno">Subject</span> <span className="ml-2">{assignment.subjectName}</span></div>
              <div><span className="anno">Class</span> <span className="ml-2">{assignment.className}</span></div>
              <div><span className="anno">Teacher</span> <span className="ml-2">{assignment.teacherName}</span></div>
              <div><span className="anno">Deadline</span> <span className="ml-2 tnum">{new Date(assignment.deadline).toLocaleString()}</span></div>
              <div><span className="anno">Max Marks</span> <span className="ml-2 tnum">{assignment.maxMarks}</span></div>
            </div>
          </div>

          <div className="sheet p-5 mb-6">
            <div className="anno mb-3">Description</div>
            <p className="text-ink whitespace-pre-wrap">{assignment.description}</p>
          </div>

          {existingSubmission && (
            <div className="sheet p-5 mb-6">
              <div className="anno mb-3">My Submission</div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm text-[var(--ink-soft)]">{submissionStatus}</span>
                {existingSubmission.submittedAt && (
                  <span className="text-xs text-ink-faint tnum">
                    {new Date(existingSubmission.submittedAt).toLocaleString()}
                  </span>
                )}
              </div>
              {existingSubmission.marks !== null && (
                <div className="text-sm mb-2">
                  <span className="anno">Marks</span>{" "}
                  <span className="ml-2 tnum">{existingSubmission.marks} / {assignment.maxMarks}</span>
                </div>
              )}
              {existingSubmission.feedback && (
                <div className="text-sm">
                  <div className="anno mb-1">Feedback</div>
                  <p className="text-ink whitespace-pre-wrap">{existingSubmission.feedback}</p>
                </div>
              )}
            </div>
          )}

          <div className="sheet p-5">
            <div className="anno mb-3">
              {existingSubmission ? "Update Your Submission" : "Submit Your Answer"}
            </div>
            {isOverdue && !existingSubmission && (
              <div className="notice notice-error mb-4">
                The deadline has passed. Your submission will be marked as Late.
              </div>
            )}
            {isOverdue && existingSubmission && (
              <div className="notice notice-info mb-4">
                Deadline has passed. You cannot edit this submission.
              </div>
            )}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="textarea"
              rows={8}
              placeholder="Enter your answer here..."
              readOnly={Boolean(isOverdue && existingSubmission)}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => router.push("/student/assignments")}
                className="btn btn-secondary"
              >
                Back to Assignments
              </button>
              {(!existingSubmission || !isOverdue) && (
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !content.trim() || Boolean(isOverdue && existingSubmission)}
                  className="btn btn-primary"
                >
                  {submitting
                    ? "Submitting…"
                    : existingSubmission
                    ? "Update Submission"
                    : "Submit Assignment"}
                </button>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
