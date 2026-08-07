"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import { Class, CreateClassDto } from "@/lib/types";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState<CreateClassDto>({ name: "", description: "" });
  const [loading, setLoading] = useState(true);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await api.get<Class[]>("/api/admin/classes");
      setClasses(response.data);
    } catch (err) {
      console.error("Failed to fetch classes:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const openCreateModal = () => {
    setEditingClass(null);
    setFormData({ name: "", description: "" });
    setShowModal(true);
  };

  const openEditModal = (cls: Class) => {
    setEditingClass(cls);
    setFormData({ name: cls.name, description: cls.description });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingClass) {
        await api.put(`/api/admin/classes/${editingClass.id}`, formData);
      } else {
        await api.post("/api/admin/classes", formData);
      }
      setShowModal(false);
      fetchClasses();
    } catch (err) {
      console.error("Failed to save class:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this class?")) return;
    try {
      await api.delete(`/api/admin/classes/${id}`);
      fetchClasses();
    } catch (err) {
      console.error("Failed to delete class:", err);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <DashboardLayout allowedRoles={["Admin"]}>
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Manage Classes</h1>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Add Class
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Description</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((cls) => (
                    <tr key={cls.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{cls.name}</td>
                      <td className="px-4 py-3">{cls.description}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openEditModal(cls)}
                          className="text-blue-600 hover:text-blue-800 mr-2"
                        >
                          <PencilIcon className="w-5 h-5 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(cls.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="w-5 h-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showModal && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 w-96">
                <h2 className="text-xl font-semibold mb-4">
                  {editingClass ? "Edit Class" : "Add Class"}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
