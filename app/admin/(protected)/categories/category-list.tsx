"use client";

import { useState, Fragment } from "react";
import Link from "next/link";
import {
  IoPencil,
  IoTrash,
  IoFolderOpen,
  IoClose,
  IoWarning,
  IoAdd,
} from "react-icons/io5";
import {
  getCategoryDetailsAction,
  deleteCategoryWithOptionsAction,
  upsertCategoryAction,
} from "./actions";
import { useRouter } from "next/navigation";

import CategoryFormSlideOver from "./_components/CategoryFormSlideOver";

interface CategoryListProps {
  initialData: any[];
  allCategories: Array<{ id: number; name: string }>;
}

export default function CategoryList({
  initialData,
  allCategories,
}: CategoryListProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{
    id: number;
    name: string;
    subcategories: Array<{ id: number; name: string; slug: string }>;
    productCount: number;
  } | null>(null);
  const [deleteProducts, setDeleteProducts] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Slide-over state'leri
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);

  const handleDeleteClick = async (id: number, name: string) => {
    setBusyId(id);
    setModalLoading(true);

    try {
      // Kategori detaylarını getir
      const result = await getCategoryDetailsAction(id);

      if (result.success && result.data) {
        setSelectedCategory({
          id,
          name,
          subcategories: result.data.subcategories,
          productCount: result.data.productCount,
        });
        setDeleteModalOpen(true);
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert("Kategori detayları getirilemedi.");
    } finally {
      setBusyId(null);
      setModalLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCategory) return;

    setModalLoading(true);
    try {
      const res = await deleteCategoryWithOptionsAction(selectedCategory.id, {
        deleteProducts,
      });

      if (res.success) {
        setDeleteModalOpen(false);
        setSelectedCategory(null);
        setDeleteProducts(false);
        router.refresh();
      } else {
        alert(res.message);
      }
    } catch (error) {
      alert("Silme işlemi sırasında hata oluştu.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setSelectedCategory(null);
    setDeleteProducts(false);
  };

  // Yeni kategori ekle
  const handleNewCategory = () => {
    setEditingCategory(null);
    setSlideOverOpen(true);
  };

  // Kategori düzenle
  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setSlideOverOpen(true);
  };

  // Slide-over kapat
  const handleCloseSlideOver = () => {
    setSlideOverOpen(false);
    setEditingCategory(null);
  };

  // Form kaydetme
  const handleSaveCategory = async (formData: any) => {
    setFormLoading(true);
    try {
      const res = await upsertCategoryAction(formData);
      if (res.success) {
        alert("✅ " + res.message);
        router.refresh();
        setSlideOverOpen(false);
      } else {
        alert("❌ " + res.message);
      }
    } catch (error) {
      console.error("Kategori kaydedilemedi:", error);
      alert("Kategori kaydedilirken hata oluştu.");
    } finally {
      setFormLoading(false);
    }
  };

  const renderRow = (cat: any, level = 0) => (
    <Fragment key={cat.id}>
      <tr className="transition-colors hover:bg-[var(--admin-input-bg)] group">
        <td className="py-3 px-4">
          <div
            className="flex items-center gap-2"
            style={{ paddingLeft: `${level * 24}px` }}
          >
            {level > 0 && <span className="opacity-30">└─</span>}
            <IoFolderOpen className="text-yellow-500 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="font-medium text-[var(--admin-fg)] whitespace-nowrap">
                {cat.name}
              </span>
              {cat.product_count > 0 && (
                <span className="text-xs text-[var(--admin-muted)] mt-0.5">
                  {cat.product_count} ürün
                </span>
              )}
            </div>
          </div>
        </td>
        <td className="py-3 px-4 text-xs opacity-60 font-mono">{cat.slug}</td>
        <td className="py-3 px-4 text-sm text-center">{cat.sort}</td>
        <td className="py-3 px-4 text-center">
          {cat.active ? (
            <span className="badge-admin badge-admin-success">Aktif</span>
          ) : (
            <span className="badge-admin badge-admin-default opacity-60">
              Pasif
            </span>
          )}
        </td>
        <td className="py-3 px-4 text-right">
          <div className="flex justify-end gap-2">
            <button
              onClick={() => handleEditCategory(cat)}
              className="btn-admin btn-admin-secondary p-2 leading-none"
            >
              <IoPencil size={16} />
            </button>
            <button
              onClick={() => handleDeleteClick(cat.id, cat.name)}
              disabled={busyId === cat.id || modalLoading}
              className="btn-admin btn-admin-danger p-2 leading-none flex items-center justify-center min-w-[32px]"
            >
              {busyId === cat.id ? (
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              ) : (
                <IoTrash size={16} />
              )}
            </button>
          </div>
        </td>
      </tr>
      {/* Recursive Render */}
      {cat.children?.map((child: any) => renderRow(child, level + 1))}
    </Fragment>
  );

  return (
    <>
      <div className="flex flex-row justify-between items-center mb-4">
        <h2
          className="text-2xl font-semibold"
          style={{ color: "var(--admin-fg)" }}
        >
          Kategoriler
        </h2>
        <button
          onClick={handleNewCategory}
          className="btn-admin btn-admin-primary flex items-center gap-2"
        >
          <IoAdd size={18} /> Yeni Kategori
        </button>
      </div>

      <div className="card-admin p-0 overflow-auto max-h-[calc(100vh-125px)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-[var(--admin-input-bg)] border-b border-[var(--admin-card-border)] text-[var(--admin-muted)] text-sm uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Kategori Adı</th>
                <th className="py-3 px-4 font-semibold">Slug</th>
                <th className="py-3 px-4 font-semibold w-24 text-center">
                  Sıra
                </th>
                <th className="py-3 px-4 font-semibold w-24 text-center">
                  Durum
                </th>
                <th className="py-3 px-4 font-semibold w-32 text-right">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-card-border)]">
              {initialData.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-[var(--admin-muted)]"
                  >
                    Kayıt bulunamadı.
                  </td>
                </tr>
              ) : (
                initialData.map((cat) => renderRow(cat))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Silme Onay Modal'ı */}
      {deleteModalOpen && selectedCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
          <div className="bg-[var(--admin-card)] rounded-lg shadow-xl w-full max-w-md border border-[var(--admin-card-border)]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--admin-card-border)]">
              <div className="flex items-center gap-2">
                <IoWarning className="text-yellow-500" size={20} />
                <h3 className="font-semibold text-[var(--admin-fg)]">
                  Kategori Silme Onayı
                </h3>
              </div>
              <button
                onClick={handleCancelDelete}
                disabled={modalLoading}
                className="p-1 hover:bg-[var(--admin-input-bg)] rounded"
              >
                <IoClose size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <p className="text-[var(--admin-fg)]">
                <span className="font-semibold">"{selectedCategory.name}"</span>{" "}
                kategorisini silmek istediğinize emin misiniz?
              </p>

              {selectedCategory.subcategories.length > 0 && (
                <div className="bg-[var(--admin-input-bg)] p-3 rounded border border-[var(--admin-card-border)]">
                  <p className="text-sm font-semibold text-[var(--admin-muted)] mb-2">
                    Silinme talebi bulunan kategorinin alt kategorileri
                    aşağıdaki liste gibidir:
                  </p>
                  <ul className="space-y-1 max-h-32 overflow-y-auto">
                    {selectedCategory.subcategories.map((subcat, index) => (
                      <li
                        key={subcat.id}
                        className="text-sm text-[var(--admin-fg)] flex items-center gap-2"
                      >
                        <span className="opacity-60">{index + 1}.</span>
                        {subcat.name}
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-[var(--admin-muted)] mt-2">
                    Eğer silme işlemine devam ederseniz ilgili kategorinin alt
                    kategorileri de silinecektir.
                  </p>
                </div>
              )}

              {selectedCategory.productCount > 0 && (
                <div className="border border-[var(--admin-card-border)] rounded p-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={deleteProducts}
                      onChange={(e) => setDeleteProducts(e.target.checked)}
                      disabled={modalLoading}
                      className="rounded border-[var(--admin-input-border)]"
                    />
                    <span className="text-sm text-[var(--admin-fg)]">
                      Kategorilere bağlı ({selectedCategory.productCount} adet)
                      ürün de silinsin?
                    </span>
                  </label>
                  <p className="text-xs text-[var(--admin-muted)] mt-1 ml-6">
                    {deleteProducts
                      ? "Ürünler tamamen silinecek."
                      : "Ürünlerin kategori bağlantısı NULL yapılacak, ürünler korunacak."}
                  </p>
                </div>
              )}

              {selectedCategory.subcategories.length === 0 &&
                selectedCategory.productCount === 0 && (
                  <p className="text-sm text-[var(--admin-muted)] italic">
                    Bu kategorinin alt kategorisi veya bağlı ürünü
                    bulunmamaktadır.
                  </p>
                )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 p-4 border-t border-[var(--admin-card-border)]">
              <button
                onClick={handleCancelDelete}
                disabled={modalLoading}
                className="btn-admin btn-admin-secondary px-4"
              >
                İptal
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={modalLoading}
                className="btn-admin btn-admin-danger px-4 flex items-center gap-2"
              >
                {modalLoading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    İşleniyor...
                  </>
                ) : (
                  "Sil"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kategori Ekle/Düzenle Slide-Over */}
      <CategoryFormSlideOver
        isOpen={slideOverOpen}
        onClose={handleCloseSlideOver}
        editingCategory={editingCategory}
        allCategories={allCategories}
        onSave={handleSaveCategory}
        loading={formLoading}
      />
    </>
  );
}
