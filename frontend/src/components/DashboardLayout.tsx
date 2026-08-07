"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { UserRole } from "@/lib/types";

interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const roleLabels: Record<UserRole, string> = {
  Admin: "Admin",
  Teacher: "Teacher",
  Student: "Student",
};

export default function DashboardLayout({ children, allowedRoles }: DashboardLayoutProps) {
  const { user, logout } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  const navItems: { label: string; href: string }[] = [];

  if (user.role === "Admin") {
    navItems.push(
      { label: "Dashboard", href: "/admin" },
      { label: "Classes", href: "/admin/classes" },
      { label: "Subjects", href: "/admin/subjects" },
      { label: "Users", href: "/admin/users" },
      { label: "Class-Subjects", href: "/admin/class-subjects" },
      { label: "Assignments", href: "/admin/assignments" },
      { label: "Submissions", href: "/admin/submissions" }
    );
  } else if (user.role === "Teacher") {
    navItems.push(
      { label: "Dashboard", href: "/teacher" },
      { label: "My Assignments", href: "/teacher/assignments" },
      { label: "Submissions", href: "/teacher/submissions" }
    );
  } else if (user.role === "Student") {
    navItems.push(
      { label: "Dashboard", href: "/student" },
      { label: "Assignments", href: "/student/assignments" },
      { label: "My Submissions", href: "/student/submissions" }
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white shadow-sm border-r">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">{roleLabels[user.role]} Dashboard</h2>
          <p className="text-sm text-gray-600">{user.name}</p>
        </div>
        <nav className="py-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 w-64">
          <button
            onClick={logout}
            className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
