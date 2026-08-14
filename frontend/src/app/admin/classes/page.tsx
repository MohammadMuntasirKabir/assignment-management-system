"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import EntityCrudPage from "@/components/EntityCrudPage";
import { Class, CreateClassDto } from "@/lib/types";

export default function AdminClassesPage() {
  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <DashboardLayout allowedRoles={["Admin"]}>
        <EntityCrudPage<Class, CreateClassDto>
          title="Manage Classes"
          entityName="Class"
          emptyText="No classes recorded yet."
          listLabel="Name"
          apiPath="/api/admin/classes"
          createDto={() => ({ name: "", description: "" })}
          toDto={(cls) => ({ name: cls.name, description: cls.description })}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
