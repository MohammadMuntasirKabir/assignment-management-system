"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/components/AuthProvider";
import api, { getErrorMessage } from "@/lib/api";
import { AuthResponse, User } from "@/lib/types";
import { roleNumberToRole, roleToNumber } from "@/lib/auth";
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface UserForm {
  name: string;
  email: string;
  password: string;
  role: number;
}

export default function AdminUsersPage() {
  const { user: currentUser, setSession, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserForm>({
    name: "", email: "", password: "", role: 2
  });
  const [transferSelfRole, setTransferSelfRole] = useState<number | null>(null);
  const [transferDeleteSelf, setTransferDeleteSelf] = useState(false);
  const [modalError, setModalError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get<Array<Omit<User, "role"> & { role: number }>>(
        "/api/admin/users"
      );
      setUsers(
        (Array.isArray(response.data) ? response.data : []).map((u) => ({
          ...u,
          role: roleNumberToRole(u.role),
        }))
      );
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUsers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", password: "", role: 2 });
    setTransferSelfRole(null);
    setTransferDeleteSelf(false);
    setModalError("");
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: roleToNumber(user.role),
    });
    setTransferSelfRole(null);
    setTransferDeleteSelf(false);
    setModalError("");
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      setModalError("Name and email are required.");
      return;
    }
    setSaving(true);
    setModalError("");

    const isTransferringAdmin =
      editingUser !== null && !isSelf(editingUser) && formData.role === 0;

    if (isTransferringAdmin) {
      if (!transferDeleteSelf && !transferSelfRole) {
        setModalError("Choose a new role for your account or delete it.");
        setSaving(false);
        return;
      }
      try {
        const res = await api.post<{ currentSession: AuthResponse | null; deletedSelf: boolean }>(
          "/api/admin/transfer-admin",
          {
            targetUserId: editingUser!.id,
            selfRole: transferDeleteSelf ? undefined : transferSelfRole,
            deleteSelf: transferDeleteSelf,
          }
        );
        if (transferDeleteSelf) {
          logout();
        } else if (res.data.currentSession) {
          setSession(res.data.currentSession);
        }
      } catch (err) {
        setModalError(getErrorMessage(err, "Failed to transfer the admin role"));
        setSaving(false);
      }
      return;
    }

    try {
      if (editingUser) {
        await api.put(`/api/admin/users/${editingUser.id}`, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        });
      } else {
        if (!formData.password) {
          setModalError("A password is required for new accounts.");
          setSaving(false);
          return;
        }
        await api.post("/api/admin/users", formData);
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      setModalError(getErrorMessage(err, "Failed to save user"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove this account? This cannot be undone.")) return;
    try {
      await api.delete(`/api/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert(getErrorMessage(err, "Failed to delete user"));
    }
  };

  const isSelf = (user: User) => currentUser?.id === user.id;

  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <DashboardLayout allowedRoles={["Admin"]}>
        <div className="title-block">
          <h1>Users</h1>
          <span className="tb-note">REV · {users.length} accounts</span>
        </div>

        <div className="flex justify-end mb-5">
          <button onClick={openCreateModal} className="btn btn-primary">
            <PlusIcon className="w-4 h-4" />
            Add account
          </button>
        </div>

        {loading ? (
          <div className="loading-note">
            <span className="spinner" aria-hidden="true" />
            Loading register…
          </div>
        ) : users.length === 0 ? (
          <div className="sheet empty-state">
            <p>No accounts have been created yet.</p>
          </div>
        ) : (
          <div className="sheet overflow-x-auto">
            <table className="table-sheet">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th aria-label="Actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const self = isSelf(user);
                  return (
                    <tr key={user.id}>
                      <td className="font-semibold text-[var(--ink)]">
                        {user.name}
                        {self && (
                          <span className="stamp stamp-gray ml-2">you</span>
                        )}
                      </td>
                      <td className="tnum text-[var(--ink-soft)]">{user.email}</td>
                      <td className="font-semibold text-[var(--blue-ink)]">{user.role}</td>
                      <td className="tnum text-[var(--ink-soft)]">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(user)}
                            className="icon-btn"
                            title={self ? "You cannot change your own role" : "Edit account"}
                            aria-label={`Edit ${user.name}`}
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="icon-btn icon-btn-danger"
                            disabled={self}
                            title={self ? "You cannot delete your own account" : "Delete account"}
                            aria-label={`Delete ${user.name}`}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={editingUser ? "Edit account" : "Add account"}>
            <div className="modal-sheet">
              <div className="modal-head">
                <h2>{editingUser ? "Edit account" : "Add account"}</h2>
                <button onClick={() => setShowModal(false)} className="icon-btn" aria-label="Close">
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="modal-body space-y-4">
                {modalError && (
                  <div className="notice notice-error" role="alert">{modalError}</div>
                )}

                <div className="field">
                  <label htmlFor="user-name">Full name</label>
                  <input
                    id="user-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="field">
                  <label htmlFor="user-email">Email</label>
                  <input
                    id="user-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                  />
                </div>

                {!editingUser && (
                  <div className="field">
                    <label htmlFor="user-password">Password</label>
                    <input
                      id="user-password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input"
                      placeholder="Min. 6 characters"
                    />
                  </div>
                )}

                <div className="field">
                  <label htmlFor="user-role">Role</label>
                  <select
                    id="user-role"
                    value={formData.role}
                    onChange={(e) => {
                      const role = parseInt(e.target.value);
                      setFormData({ ...formData, role });
                      if (role !== 0) {
                        setTransferSelfRole(null);
                        setTransferDeleteSelf(false);
                      }
                    }}
                    className="select"
                    disabled={editingUser ? isSelf(editingUser) : false}
                  >
                    <option value={2}>Student</option>
                    <option value={1}>Teacher</option>
                    <option value={0}>Admin</option>
                  </select>
                  {editingUser && isSelf(editingUser) && (
                    <p className="field-error">You cannot change your own role.</p>
                  )}
                </div>

                {editingUser && !isSelf(editingUser) && formData.role === 0 && (
                  <div className="space-y-3">
                    <div className="notice">
                      There can only be one admin. Selecting an Admin transfers the
                      role — choose a new role for your account or delete it.
                    </div>
                    <div className="field">
                      <label htmlFor="transfer-role">Your new role</label>
                      <select
                        id="transfer-role"
                        value={transferSelfRole ?? ""}
                        onChange={(e) => {
                          const v = e.target.value === "" ? null : parseInt(e.target.value);
                          setTransferSelfRole(v);
                          if (v) setTransferDeleteSelf(false);
                        }}
                        className="select"
                        disabled={transferDeleteSelf}
                      >
                        <option value="" disabled>Select a role…</option>
                        <option value={1}>Teacher</option>
                        <option value={2}>Student</option>
                      </select>
                    </div>
                    <div className="field">
                      <div className="flex items-center gap-2">
                        <input
                          id="transfer-delete"
                          type="checkbox"
                          checked={transferDeleteSelf}
                          onChange={(e) => {
                            setTransferDeleteSelf(e.target.checked);
                            if (e.target.checked) setTransferSelfRole(null);
                          }}
                          className="accent-[var(--blue)]"
                        />
                        <label htmlFor="transfer-delete" className="!normal-case !tracking-normal cursor-pointer select-none">
                          Delete my account instead
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-foot">
                <button onClick={() => setShowModal(false)} className="btn btn-secondary" disabled={saving}>
                  Cancel
                </button>
                <button onClick={handleSubmit} className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving…" : editingUser ? "Save changes" : "Create account"}
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
