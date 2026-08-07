"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import api, { getErrorMessage } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { Assignment, Submission, CreateSubmissionDto } from "@/lib/types";

interface StudentAssignmentDetailProps {
  params: { id: string };
}

export default function StudentAssignmentDetail({ params }: StudentAssignmentDetailProps) {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [existingSubmission, setExistingSubmission] = useState<Submission | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { id } = params;

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

  if (!assignment && loading) {
    return (
      <ProtectedRoute allowedRoles={["Student"]}>
        <div className="p-6">Loading...</div>
      </ProtectedRoute>
    );
  }

  if (!assignment) {
    return (
      <ProtectedRoute allowedRoles={["Student"]}>
        <div className="p-6">
          <p className="text-red-600">Assignment not found or not published.</p>
        </div>
      </ProtectedRoute>
    );
  }

  const isOverdue = new Date() > new Date(assignment.deadline);

  return (
    <ProtectedRoute allowedRoles={["Student"]}>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
            <span className={`text-xs px-3 py-1 rounded ${
              isOverdue
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
            }`}>
              {isOverdue ? "Overdue" : "Active"}
            </span>
          </div>

          <div className="text-sm text-gray-500 mb-6 space-y-1">
            <div><strong>Subject:</strong> {assignment.subjectName}</div>
            <div><strong>Class:</strong> {assignment.className}</div>
            <div><strong>Teacher:</strong> {assignment.teacherName}</div>
            <div><strong>Deadline:</strong> {new Date(assignment.deadline).toLocaleString()}</div>
            <div><strong>Max Marks:</strong> {assignment.maxMarks}</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{assignment.description}</p>
          </div>

          {existingSubmission && (
            <div className="bg-gray-50 rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-3">My Submission</h2>
              <div className="mb-2">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <span className={`ml-2 capitalize text-sm ${
                  existingSubmission.status === "Reviewed" ? "text-green-600" :
                  existingSubmission.status === "Late" ? "text-orange-600" :
                  existingSubmission.status === "Submitted" ? "text-blue-600" :
                  "text-gray-600"
                }`}>
                  {existingSubmission.status.toLowerCase()}
                </span>
              </div>
              {existingSubmission.marks !== null && (
                <div className="mb-2 text-sm">
                  <span className="font-medium text-gray-700">Marks:</span>
                  <span className="ml-2">{existingSubmission.marks} / {assignment.maxMarks}</span>
                </div>
              )}
              {existingSubmission.feedback && (
                <div className="mb-2 text-sm">
                  <span className="font-medium text-gray-700">Feedback:</span>
                  <p className="mt-1 text-gray-700">{existingSubmission.feedback}</p>
                </div>
              )}
              {existingSubmission.submittedAt && (
                <div className="text-xs text-gray-500">
                  Submitted: {new Date(existingSubmission.submittedAt).toLocaleString()}
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-3">
              {existingSubmission ? "Update Your Submission" : "Submit Your Answer"}
            </h2>
            {isOverdue && !existingSubmission && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                The deadline has passed. Your submission will be marked as Late.
              </div>
            )}
            {isOverdue && existingSubmission && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                Deadline has passed. You cannot edit this submission.
              </div>
            )}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={8}
              placeholder="Enter your answer here..."
              readOnly={Boolean(isOverdue && existingSubmission)}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => router.push("/student/assignments")}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Back to Assignments
              </button>
              {(!existingSubmission || !isOverdue) && (
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !content.trim() || Boolean(isOverdue && existingSubmission)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting
                    ? "Submitting..."
                    : existingSubmission
                    ? "Update Submission"
                    : "Submit Assignment"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
