"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IoAdd, IoLayersOutline } from "react-icons/io5";
import SlideOver from "@/app/admin/_components/SlideOver";
import TemplateListClient from "./template-list-client";
import TemplateForm from "./template-form";
import { ProductTemplate } from "@/types";

interface Props {
  templates: ProductTemplate[];
}

// Görünüm Modları
type ViewMode = "LIST" | "NEW_TEMPLATE" | "EDIT_TEMPLATE";

export default function TemplateManager({ templates }: Props) {
  const router = useRouter();
  const [view, setView] = useState<ViewMode>("LIST");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Seçili şablonu bul
  const selectedTemplate = templates.find(t => t.id === selectedId);

  // Paneli Kapat
  const closePanel = () => {
    setView("LIST");
    setSelectedId(null);
  };

  // Kaydetme sonrası
  const handleSuccess = () => {
    closePanel();
    router.refresh(); // Listeyi yenile
  };

  // Düzenleme Butonuna Tıklanınca (TemplateListClient'tan çağrılırsa diye opsiyonel)
  // Not: TemplateListClient içinde Link yerine onClick prop'u kullanırsan daha iyi olur
  // Ama Link kullandıysan bile bu sayfada ID yakalamak için URL params kullanabilirsin.
  // Şimdilik TemplateListClient'ı modifiye etmeye gerek yok, çünkü orası DataTable.

  return (
    <div className="h-full flex flex-col gap-4">
      
      {/* ÜST BAR */}
      <div className="shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-admin-card p-3 rounded-admin border border-admin-card-border shadow-sm">
        <div>
            <h1 className="text-admin-lg font-bold flex items-center gap-2">
                <IoLayersOutline className="text-admin-accent" /> 
                Şablon Yönetimi
            </h1>
        </div>

        <div>
            <button 
                onClick={() => { setSelectedId(null); setView("NEW_TEMPLATE"); }}
                className="btn-admin btn-admin-primary text-admin-tiny"
            >
                <IoAdd size={16} /> Yeni Şablon
            </button>
        </div>
      </div>

      {/* LİSTE ALANI */}
      <div className="flex-1 bg-admin-card rounded-admin border border-admin-card-border overflow-hidden flex flex-col">
         {/* List Componentine onEdit prop'u eklememiz lazım, DataTable buna uygun hale gelmeli */}
         {/* Şimdilik Link ile gidiyor olabilir, onu düzeltelim */}
         <TemplateListClient 
            initialTemplates={templates} 
            onEdit={(id) => { setSelectedId(id); setView("EDIT_TEMPLATE"); }}
         />
      </div>

      {/* SLIDE OVER (FORM) */}
      <SlideOver 
        isOpen={view === "NEW_TEMPLATE" || view === "EDIT_TEMPLATE"} 
        onClose={closePanel} 
        title={view === "NEW_TEMPLATE" ? "Yeni Şablon Oluştur" : `Şablonu Düzenle #${selectedId}`}
        width="2xl"
      >
        <TemplateForm 
            initialData={selectedTemplate || null}
            onSuccess={handleSuccess}
            onCancel={closePanel}
        />
      </SlideOver>

    </div>
  );
}