"use client";

import { useState, useEffect } from "react";
import SlideOver from "@/app/admin/_components/SlideOver";
import { IoAdd, IoSave } from "react-icons/io5";
import TextareaAutoResize from "@/components/TextareaAutoResize";

interface CategoryFormSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  editingCategory: any;
  allCategories: Array<{ id: number; name: string }>;
  onSave: (formData: any) => Promise<void>;
  loading: boolean;
}

export default function CategoryFormSlideOver({
  isOpen,
  onClose,
  editingCategory,
  allCategories,
  onSave,
  loading,
}: CategoryFormSlideOverProps) {
  const [formData, setFormData] = useState({
    id: editingCategory?.id || null,
    name: editingCategory?.name || "",
    slug: editingCategory?.slug || "",
    description: editingCategory?.description || "",
    parent_id: editingCategory?.parent_id || null,
    active: editingCategory?.active ?? true,
    sort: editingCategory?.sort || 0,
  });

  // Form verilerini editingCategory değiştiğinde güncelle
  useEffect(() => {
    if (editingCategory) {
      setFormData({
        id: editingCategory.id,
        name: editingCategory.name || "",
        slug: editingCategory.slug || "",
        description: editingCategory.description || "",
        parent_id: editingCategory.parent_id || null,
        active: editingCategory.active ?? true,
        sort: editingCategory.sort || 0,
      });
    } else {
      // Yeni kategori için boş form
      setFormData({
        id: null,
        name: "",
        slug: "",
        description: "",
        parent_id: null,
        active: true,
        sort: 0,
      });
    }
  }, [editingCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? Number(value)
          : value === ""
          ? null
          : value,
    }));

  };

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title={
        editingCategory
          ? `Kategori Düzenle: ${editingCategory.name}`
          : "Yeni Kategori Ekle"
      }
      width="2xl"
    >
      <div className="space-y-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="admin-label">Kategori Adı *</label>
              <input
                name="name"
                className="admin-input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="admin-label">Slug</label>
              <input
                name="slug"
                className="admin-input"
                value={formData.slug}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <label className="admin-label">Açıklama</label>
            <TextareaAutoResize
              name="description"
              value={formData.description}
              onChange={handleChange}
              minRows={3}
              maxRows={10}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="space-y-2">
              <label className="admin-label">Üst Kategori</label>
              <select
                name="parent_id"
                className="admin-select"
                value={formData.parent_id || ""}
                onChange={handleChange}
              >
                <option value="">-- Ana Kategori --</option>
                {allCategories
                  .filter((c) => c.id !== editingCategory?.id) // Kendisini seçemesin
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="admin-label">Sıra</label>
              <input
                type="number"
                name="sort"
                className="admin-input"
                value={formData.sort}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label className="admin-label">Durum</label>
              <div
                className="flex items-center gap-3 border p-3 rounded"
                style={{ borderColor: "var(--admin-input-border)" }}
              >
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="w-5 h-5 accent-[var(--admin-accent)]"
                />
                <label>Aktif</label>
              </div>
            </div>
          </div>

          <div
            className="flex justify-end pt-6 border-t mt-6"
            style={{ borderColor: "var(--admin-card-border)" }}
          >
            <button
              type="button"
              onClick={onClose}
              className="btn-admin btn-admin-secondary px-6 mr-3"
              disabled={loading}
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-admin btn-admin-primary px-6 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <IoSave size={18} />
                  Kaydet
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </SlideOver>
  );
}
