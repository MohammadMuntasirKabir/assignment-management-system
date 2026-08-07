"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import { User, Class, Assignment, Submission } from "@/lib/types";

export default function AdminDashboard() {
  const [usersCount, setUsersCount] = useState<number | null>(null);
  const [classesCount, setClassesCount] = useState<number | null>(null);
  const [assignmentsCount, setAssignmentsCount] = useState<number | null>(null);
  const [submissionsCount, setSubmissionsCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, classes, assignments, submissions] = await Promise.all([
          api.get<User[]>("/api/admin/users"),
          api.get<Class[]>("/api/admin/classes"),
          api.get<Assignment[]>("/api/admin/assignments"),
          api.get<Submission[]>("/api/admin/submissions"),
        ]);
        setUsersCount((users.data || []).length);
        setClassesCount((classes.data || []).length);
        setAssignmentsCount((assignments.data || []).length);
        setSubmissionsCount((submissions.data || []).length);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <DashboardLayout allowedRoles={["Admin"]}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{usersCount ?? "—"}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-700">Total Classes</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">{classesCount ?? "—"}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-700">Total Assignments</h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">{assignmentsCount ?? "—"}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-700">Total Submissions</h3>
              <p className="text-3xl font-bold text-orange-600 mt-2">{submissionsCount ?? "—"}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="/admin/classes" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Manage Classes</a>
              <a href="/admin/subjects" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">Manage Subjects</a>
              <a href="/admin/users" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">Manage Users</a>
              <a href="/admin/assignments" className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition">View Assignments</a>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
