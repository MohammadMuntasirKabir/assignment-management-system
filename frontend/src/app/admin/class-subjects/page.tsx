"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import api, { getErrorMessage } from "@/lib/api";
import { ClassSubjectDto, Class, Subject } from "@/lib/types";
import LoadingNote from "@/components/ui/LoadingNote";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/Pagination";
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

const PAGE_SIZE = 10;

export default function AdminClassSubjectsPage() {
  const [classSubjects, setClassSubjects] = useState<ClassSubjectDto[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingLink, setEditingLink] = useState<ClassSubjectDto | null>(null);
  const [formData, setFormData] = useState({ classId: "", subjectId: "" });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [csRes, cRes, sRes] = await Promise.all([
        api.get<ClassSubjectDto[]>("/api/admin/class-subjects"),
        api.get<Class[]>("/api/admin/classes"),
        api.get<Subject[]>("/api/admin/subjects"),
      ]);
      setClassSubjects(csRes.data || []);
      setClasses(cRes.data || []);
      setSubjects(sRes.data || []);
    } catch (err) {
      console.error("Failed to fetch:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const totalPages = Math.max(1, Math.ceil(classSubjects.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedClassSubjects = classSubjects.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const openCreateModal = () => {
    setEditingLink(null);
    setFormData({ classId: "", subjectId: "" });
    setShowModal(true);
  };

  const openEditModal = (link: ClassSubjectDto) => {
    setEditingLink(link);
    setFormData({ classId: link.classId, subjectId: link.subjectId });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.classId || !formData.subjectId) return;
    try {
      if (editingLink) {
        await api.put(`/api/admin/class-subjects/${editingLink.id}`, {
          classId: formData.classId,
          subjectId: formData.subjectId,
        });
      } else {
        await api.post("/api/admin/class-subjects", { classId: formData.classId, subjectId: formData.subjectId });
      }
      setShowModal(false);
      setFormData({ classId: "", subjectId: "" });
      setPage(1);
      fetchAll();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to save class-subject link"));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Unlink this class-subject?")) return;
    try {
      await api.delete(`/api/admin/class-subjects/${id}`);
      setPage(1);
      fetchAll();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <DashboardLayout allowedRoles={["Admin"]}>
        <div>
          <div className="title-block">
            <h1>Class–Subject Links</h1>
            <button onClick={openCreateModal} className="btn btn-primary">
              <PlusIcon className="w-4 h-4" />
              Link Class & Subject
            </button>
          </div>

          {loading ? (
            <LoadingNote />
          ) : classSubjects.length === 0 ? (
            <EmptyState>No class-subject links yet.</EmptyState>
          ) : (
            <div className="sheet overflow-x-auto">
              <table className="table-sheet">
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Subject</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedClassSubjects.map((cs) => (
                    <tr key={cs.id}>
                      <td className="font-medium">{cs.className}</td>
                      <td>{cs.subjectName}</td>
                      <td className="whitespace-nowrap">
                        <button
                          className="icon-btn"
                          onClick={() => openEditModal(cs)}
                          aria-label={`Edit ${cs.className} – ${cs.subjectName}`}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          className="icon-btn icon-btn-danger"
                          onClick={() => handleDelete(cs.id)}
                          aria-label={`Unlink ${cs.className} – ${cs.subjectName}`}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                page={safePage}
                pageSize={PAGE_SIZE}
                total={classSubjects.length}
                onPageChange={setPage}
              />
            </div>
          )}

          {showModal && (
            <div
              className="modal-overlay"
              onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
            >
              <div className="modal-sheet">
                <div className="modal-head">
                  <h2>{editingLink ? "Edit Class–Subject Link" : "Link Class & Subject"}</h2>
                  <button
                    className="icon-btn"
                    onClick={() => setShowModal(false)}
                    aria-label="Close"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="space-y-4">
                    <div className="field">
                      <label htmlFor="cs-class">Class</label>
                      <select
                        id="cs-class"
                        className="select"
                        value={formData.classId}
                        onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                      >
                        <option value="">Select a class</option>
                        {classes.map((cls) => (
                          <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="cs-subject">Subject</label>
                      <select
                        id="cs-subject"
                        className="select"
                        value={formData.subjectId}
                        onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                      >
                        <option value="">Select a subject</option>
                        {subjects.map((subj) => (
                          <option key={subj.id} value={subj.id}>{subj.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-foot">
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleSubmit}>
                    {editingLink ? "Save" : "Link"}
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
