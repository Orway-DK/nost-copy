// C:\Projeler\nost-copy\app\admin\(protected)\services\services-list.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { deleteServiceAction } from "./actions";
import {
  IoAdd,
  IoPencil,
  IoTrash,
  IoImageOutline,
  IoClose,
  IoSearch,
} from "react-icons/io5";
import { toast } from "react-hot-toast";
import ServiceForm from "./service-form";

export default function ServicesList({ initialData }: { initialData: any[] }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Basit Filtreleme
  const filteredData = initialData.filter((item) => {
    const trTitle =
      item.service_translations?.find((t: any) => t.lang_code === "tr")
        ?.title || "";
    return trTitle.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Handlers
  const handleAddNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu hizmeti silmek istediğinize emin misiniz?")) return;
    setBusyId(id);
    const res = await deleteServiceAction(id);
    setBusyId(null);
    if (res.success) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res.message);
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    router.refresh();
  };

  return (
    <div className="h-full flex flex-col">
      {/* 1. TOOLBAR (Sabit) */}
      <div className="shrink-0 p-3 border-b border-admin-card-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-admin-card">
        {/* Arama Kutusu */}
        <div className="relative w-full sm:w-64 group">
          <IoSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted group-focus-within:text-admin-accent transition-colors z-10"
            size={18} // İkonu biraz büyüttük (opsiyonel)
          />
          <input
            placeholder="Hizmet ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            // GÜNCELLEME: pl-9 yerine pl-11 yaptık.
            // Böylece ikon (left-3) ile yazı arasında daha fazla boşluk kalır.
            className="admin-input ml-11 h-10 w-full"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-admin-muted hidden sm:block">
            Toplam{" "}
            <strong className="text-admin-fg">{filteredData.length}</strong>{" "}
            kayıt
          </div>
          <button
            onClick={handleAddNew}
            className="btn-admin btn-admin-primary gap-2 h-10 px-4"
          >
            <IoAdd size={18} />{" "}
            <span className="hidden sm:inline">Yeni Hizmet</span>
          </button>
        </div>
      </div>

      {/* 2. TABLO ALANI (Scrollable) */}
      <div className="flex-1 overflow-auto bg-admin-card relative">
        {filteredData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-admin-muted opacity-60">
            <div className="p-4 rounded-full bg-admin-input-bg mb-3">
              <IoImageOutline size={32} />
            </div>
            <p>Kayıt bulunamadı.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            {/* STICKY HEADER */}
            <thead className="sticky top-0 z-10 bg-admin-bg text-admin-muted uppercase font-semibold text-xs border-b border-admin-card-border shadow-sm">
              <tr>
                <th className="py-3 pl-6 w-20 text-center bg-admin-bg">
                  Görsel
                </th>
                <th className="py-3 px-4 bg-admin-bg">Hizmet Başlığı</th>
                <th className="py-3 px-4 bg-admin-bg hidden md:table-cell">
                  Slug
                </th>
                <th className="py-3 px-4 w-32 text-center bg-admin-bg">
                  Durum
                </th>
                <th className="py-3 px-4 w-28 text-center bg-admin-bg">
                  İşlem
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-admin-input-border">
              {filteredData.map((item) => {
                const trTitle =
                  item.service_translations?.find(
                    (t: any) => t.lang_code === "tr"
                  )?.title || "(Başlıksız)";

                return (
                  <tr
                    key={item.id}
                    className="group hover:bg-admin-input-bg/50 transition-colors"
                  >
                    <td className="py-3 pl-6">
                      <div className="relative w-10 h-10 rounded-md border border-admin-card-border overflow-hidden bg-admin-input-bg">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center opacity-30">
                            <IoImageOutline size={18} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-admin-fg">
                      {trTitle}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-admin-muted hidden md:table-cell">
                      {item.slug}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`badge-admin ${
                          item.active
                            ? "badge-admin-success"
                            : "badge-admin-default"
                        }`}
                      >
                        {item.active ? "Yayında" : "Pasif"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 rounded hover:bg-admin-info hover:text-white text-admin-info transition-colors"
                          title="Düzenle"
                        >
                          <IoPencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded hover:bg-admin-danger hover:text-white text-admin-muted hover:opacity-100 transition-colors"
                          title="Sil"
                        >
                          <IoTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* 3. MODAL (ServiceForm) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl h-[90vh] flex flex-col bg-admin-card rounded-xl shadow-2xl overflow-hidden border border-admin-card-border">
            {/* Modal Header */}
            <div className="p-4 border-b border-admin-card-border flex justify-between items-center bg-admin-input-bg">
              <h2 className="text-admin-lg font-bold text-admin-fg">
                {editingItem ? "Hizmeti Düzenle" : "Yeni Hizmet Ekle"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-admin-muted hover:text-admin-fg transition-colors"
              >
                <IoClose size={24} />
              </button>
            </div>

            {/* Modal Body (Form) */}
            <div className="flex-1 overflow-hidden">
              <ServiceForm
                initialData={editingItem}
                onCancel={() => setIsModalOpen(false)}
                onSuccess={handleSuccess}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
