"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import { Assignment, Class, PagedResult, Submission, User } from "@/lib/types";

export default function AdminDashboard() {
  const [usersCount, setUsersCount] = useState<number | null>(null);
  const [classesCount, setClassesCount] = useState<number | null>(null);
  const [assignmentsCount, setAssignmentsCount] = useState<number | null>(null);
  const [submissionsCount, setSubmissionsCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, classes, assignments, submissions] = await Promise.all([
          api.get<PagedResult<User>>("/api/admin/users", { params: { page: 1, pageSize: 1 } }),
          api.get<Class[]>("/api/admin/classes"),
          api.get<PagedResult<Assignment>>("/api/admin/assignments", {
            params: { page: 1, pageSize: 1 },
          }),
          api.get<PagedResult<Submission>>("/api/admin/submissions", {
            params: { page: 1, pageSize: 1 },
          }),
        ]);
        setUsersCount(users.data?.total ?? 0);
        setClassesCount((classes.data || []).length);
        setAssignmentsCount(assignments.data?.total ?? 0);
        setSubmissionsCount(submissions.data?.total ?? 0);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };
    fetchStats();
  }, []);

  const actions = [
    { href: "/admin/classes", label: "Manage Classes" },
    { href: "/admin/subjects", label: "Manage Subjects" },
    { href: "/admin/class-subjects", label: "Link Class & Subject" },
    { href: "/admin/users", label: "Manage Users" },
    { href: "/admin/assignments", label: "View Assignments" },
    { href: "/admin/submissions", label: "View Submissions" },
  ];

  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <DashboardLayout allowedRoles={["Admin"]}>
        <div>
          <div className="title-block">
            <h1>Admin Dashboard</h1>
            <span className="tb-note">Project Overview</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="stat-block">
              <div className="stat-label">Total Users</div>
              <div className="stat-value">{usersCount ?? "—"}</div>
            </div>
            <div className="stat-block">
              <div className="stat-label">Total Classes</div>
              <div className="stat-value">{classesCount ?? "—"}</div>
            </div>
            <div className="stat-block">
              <div className="stat-label">Total Assignments</div>
              <div className="stat-value">{assignmentsCount ?? "—"}</div>
            </div>
            <div className="stat-block">
              <div className="stat-label">Total Submissions</div>
              <div className="stat-value">{submissionsCount ?? "—"}</div>
            </div>
          </div>

          <div className="sheet p-5">
            <div className="anno mb-3">Quick Actions</div>
            <div className="flex flex-wrap gap-3">
              {actions.map((a) => (
                <Link key={a.href} href={a.href} className="action-tile">
                  {a.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
