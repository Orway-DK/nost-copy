"use client";

import { useState } from "react";
import { updateSettingsAction } from "./actions"; // Mevcut update aksiyonun
import { toast } from "react-hot-toast";

// Bu tipi kendi tip dosyana eklemelisin
interface SettingsFormProps {
  initialData: {
    id: number;
    site_title: string;
    description: string;
    is_filters_active: boolean; // <--- YENİ ALAN
    // ... diğer alanlar
  };
}

export default function GeneralSettingsForm({ initialData }: SettingsFormProps) {
  const [loading, setLoading] = useState(false);
  
  // State'i burada yönetiyoruz
  const [isFilterActive, setIsFilterActive] = useState(initialData.is_filters_active ?? true);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    // Checkbox işaretli değilse FormData'ya gelmez, manuel ekliyoruz:
    formData.set("is_filters_active", String(isFilterActive));

    const res = await updateSettingsAction(formData);

    if (res.success) {
      toast.success("Ayarlar güncellendi");
    } else {
      toast.error("Hata: " + res.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      
      {/* ... Diğer Inputlar (Site Başlığı vs.) ... */}

      {/* --- FİLTRE AÇMA/KAPAMA TOGGLE --- */}
      <div className="card-admin flex items-center justify-between">
        <div>
            <h3 className="text-admin-base font-semibold text-admin-fg">Ürün Filtreleme</h3>
            <p className="text-admin-sm text-admin-muted mt-1">
                Kullanıcıların ürünleri listelerken filtreleme yapmasını sağlar.
            </p>
        </div>

        {/* Custom Toggle Switch */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer"
            checked={isFilterActive}
            onChange={(e) => setIsFilterActive(e.target.checked)}
            name="is_filters_active"
          />
          <div className="w-11 h-6 bg-admin-input-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-success"></div>
          
          <span className="ms-3 text-admin-sm font-medium text-admin-fg min-w-[3rem]">
            {isFilterActive ? 'Aktif' : 'Pasif'}
          </span>
        </label>
      </div>

      <div className="flex justify-end pt-4">
        <button 
            type="submit" 
            disabled={loading}
            className="btn-admin btn-admin-primary w-full md:w-auto"
        >
            {loading ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>
    </form>
  );
}