"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { UserRole } from "@/lib/types";
import {
  Squares2X2Icon,
  AcademicCapIcon,
  BookOpenIcon,
  UserGroupIcon,
  LinkIcon,
  ClipboardDocumentListIcon,
  ArrowLeftStartOnRectangleIcon,
} from "@heroicons/react/24/outline";

interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const roleLabels: Record<UserRole, string> = {
  Admin: "Administration",
  Teacher: "Teaching",
  Student: "Student",
};

const sheetLabels: Record<UserRole, string> = {
  Admin: "SHEET 01-A",
  Teacher: "SHEET 01-T",
  Student: "SHEET 01-S",
};

export default function DashboardLayout({ children, allowedRoles }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  const navItems: { label: string; href: string; icon: React.ElementType }[] = [];

  if (user.role === "Admin") {
    navItems.push(
      { label: "Dashboard", href: "/admin", icon: Squares2X2Icon },
      { label: "Classes", href: "/admin/classes", icon: AcademicCapIcon },
      { label: "Subjects", href: "/admin/subjects", icon: BookOpenIcon },
      { label: "Users", href: "/admin/users", icon: UserGroupIcon },
      { label: "Class-Subjects", href: "/admin/class-subjects", icon: LinkIcon },
      { label: "Assignments", href: "/admin/assignments", icon: ClipboardDocumentListIcon },
      { label: "Submissions", href: "/admin/submissions", icon: ClipboardDocumentListIcon }
    );
  } else if (user.role === "Teacher") {
    navItems.push(
      { label: "Dashboard", href: "/teacher", icon: Squares2X2Icon },
      { label: "My Assignments", href: "/teacher/assignments", icon: ClipboardDocumentListIcon },
      { label: "Submissions", href: "/teacher/submissions", icon: ClipboardDocumentListIcon }
    );
  } else if (user.role === "Student") {
    navItems.push(
      { label: "Dashboard", href: "/student", icon: Squares2X2Icon },
      { label: "Assignments", href: "/student/assignments", icon: BookOpenIcon },
      { label: "My Submissions", href: "/student/submissions", icon: ClipboardDocumentListIcon }
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Drawing index — the left rail of sheets */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-[var(--hairline-strong)] bg-[var(--paper-card)]">
        <div className="px-5 pt-5 pb-4 border-b border-[var(--hairline-strong)]">
          <p className="anno text-[var(--blue-ink)] font-bold">OnnoRokom Projukti</p>
          <p className="mt-1 text-[0.62rem] uppercase tracking-[0.16em] text-[var(--ink-faint)]">
            Assignment & Submission Mgmt
          </p>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${active ? "nav-item-active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-[var(--hairline-strong)]">
          <div className="flex items-center justify-between gap-2 mb-3">
            <p className="text-sm font-semibold text-[var(--ink)] truncate">{user.name}</p>
            <span className="stamp stamp-blue shrink-0">{user.role}</span>
          </div>
          <p className="anno mb-3 truncate" title={user.email}>{user.email}</p>
          <button onClick={logout} className="btn btn-secondary w-full">
            <ArrowLeftStartOnRectangleIcon className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 px-6 md:px-10 py-7">
        <div className="max-w-6xl mx-auto">
          <p className="anno mb-1">
            {roleLabels[user.role]} · {sheetLabels[user.role]}
          </p>
          {children}
        </div>
      </main>
    </div>
  );
}
