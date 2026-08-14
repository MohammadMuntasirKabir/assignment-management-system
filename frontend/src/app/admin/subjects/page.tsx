"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import EntityCrudPage from "@/components/EntityCrudPage";
import { Subject, CreateSubjectDto } from "@/lib/types";

export default function AdminSubjectsPage() {
  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <DashboardLayout allowedRoles={["Admin"]}>
        <EntityCrudPage<Subject, CreateSubjectDto>
          title="Manage Subjects"
          entityName="Subject"
          emptyText="No subjects recorded yet."
          listLabel="Name"
          apiPath="/api/admin/subjects"
          createDto={() => ({ name: "", description: "" })}
          toDto={(subject) => ({ name: subject.name, description: subject.description })}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
