"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import api, { getErrorMessage } from "@/lib/api";
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface NamedEntity {
  id: string;
  name: string;
  description: string;
}

interface EntityCrudPageProps<T extends NamedEntity, D extends { name: string; description: string }> {
  title: string;
  entityName: string;
  emptyText: string;
  apiPath: string;
  createDto: () => D;
  toDto: (entity: T) => D;
  listLabel: string;
}

export default function EntityCrudPage<T extends NamedEntity, D extends { name: string; description: string }>({
  title,
  entityName,
  emptyText,
  apiPath,
  createDto,
  toDto,
  listLabel,
}: EntityCrudPageProps<T, D>) {
  const [items, setItems] = useState<T[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [formData, setFormData] = useState<D>(createDto);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const itemCountRef = useRef(0);

  const fetchItems = useCallback(async () => {
    setLoading(itemCountRef.current === 0);
    setError("");
    try {
      const response = await api.get<T[]>(apiPath);
      itemCountRef.current = response.data.length;
      setItems(response.data);
    } catch (err) {
      setError(getErrorMessage(err, `Failed to load ${entityName.toLowerCase()}s`));
    }
    setLoading(false);
  }, [apiPath, entityName]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData(createDto());
    setShowModal(true);
  };

  const openEditModal = (item: T) => {
    setEditingItem(item);
    setFormData(toDto(item));
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingItem) {
        await api.put(`${apiPath}/${editingItem.id}`, formData);
      } else {
        await api.post(apiPath, formData);
      }
      setShowModal(false);
      fetchItems();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to save"));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Delete this ${entityName.toLowerCase()}?`)) return;
    try {
      await api.delete(`${apiPath}/${id}`);
      fetchItems();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to delete"));
    }
  };

  return (
    <div>
      <div className="title-block">
        <h1>{title}</h1>
        <button onClick={openCreateModal} className="btn btn-primary">
          <PlusIcon className="w-4 h-4" />
          Add {entityName}
        </button>
      </div>

      {error && <div className="notice notice-error mb-4">{error}</div>}

      {loading ? (
        <div className="loading-note">
          <span className="spinner"></span>
          Loading…
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">{emptyText}</div>
      ) : (
        <div className="sheet overflow-x-auto">
          <table className="table-sheet">
            <thead>
              <tr>
                <th>{listLabel}</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="font-medium">{item.name}</td>
                  <td>{item.description}</td>
                  <td className="whitespace-nowrap">
                    <button
                      className="icon-btn"
                      onClick={() => openEditModal(item)}
                      aria-label={`Edit ${item.name}`}
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      className="icon-btn icon-btn-danger"
                      onClick={() => handleDelete(item.id)}
                      aria-label={`Delete ${item.name}`}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="modal-sheet">
            <div className="modal-head">
              <h2>{editingItem ? `Edit ${entityName}` : `Add ${entityName}`}</h2>
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
                  <label>{listLabel}</label>
                  <input
                    type="text"
                    className="input"
                    value={(formData as { name: string }).name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Description</label>
                  <input
                    type="text"
                    className="input"
                    value={(formData as { description: string }).description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
