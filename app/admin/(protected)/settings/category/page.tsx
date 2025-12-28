// C:\Projeler\nost-copy\app\admin\(protected)\settings\category\page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { SlCheck, SlLayers, SlEqualizer, SlOptions } from 'react-icons/sl';
import { updateCategorySettingsAction } from '@/app/admin/actions/filter-actions'; // Action'ı import et

export default function CategorySettingsPage() {
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State
  const [filtersActive, setFiltersActive] = useState(true);
  const [sortingActive, setSortingActive] = useState(true);

  // Veri Çekme
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('site_settings')
        .select('is_category_filters_active, is_category_sorting_active')
        .maybeSingle();

      if (data) {
        setFiltersActive(data.is_category_filters_active ?? true);
        setSortingActive(data.is_category_sorting_active ?? true);
      }
      setLoading(false);
    };
    fetch();
  }, []);

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    // String(true) -> "true" olarak gönderir. Action tarafında === "true" ile yakalarız.
    formData.append('is_category_filters_active', String(filtersActive));
    formData.append('is_category_sorting_active', String(sortingActive));

    const res = await updateCategorySettingsAction(formData);
    if (res.success) {
      toast.success('Kategori ayarları güncellendi');
    } else {
      toast.error('Hata: ' + res.message);
    }
    setSaving(false);
  };

  if (loading) return <div className="p-10 text-admin-muted text-admin-sm">Ayarlar yükleniyor...</div>;

  return (
    <>
      {/* BAŞLIK */}
      <div className="mb-6">
        <h1 className="text-admin-lg font-bold text-admin-fg flex items-center gap-2">
           <SlLayers className="text-admin-accent" /> Kategori Ayarları
        </h1>
        <p className="text-admin-muted text-admin-sm mt-1">
          Kategori sayfalarındaki listeleme, filtreleme ve görünüm seçenekleri.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        
        {/* KART: Liste Görünümü */}
        <div className="card-admin">
            <h3 className="text-admin-base font-bold mb-4 flex items-center gap-2 pb-2 border-b border-admin-card-border text-admin-fg">
              <SlOptions /> Listeleme Araçları
            </h3>

            <div className="space-y-4">
                {/* 1. FİLTRELEME TOGGLE */}
                <div className="flex items-center justify-between p-3 rounded-admin bg-admin-input-bg border border-admin-input-border">
                    <div>
                        <div className="text-admin-sm font-semibold text-admin-fg flex items-center gap-2">
                             <SlEqualizer /> Filtreleme Alanı (Sidebar)
                        </div>
                        <p className="text-admin-tiny text-admin-muted mt-0.5">
                            Sol menüde yer alan özellik filtrelerini göster/gizle.
                        </p>
                    </div>
                    
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={filtersActive}
                            onChange={(e) => setFiltersActive(e.target.checked)}
                        />
                        <div className="w-9 h-5 bg-admin-card-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-admin-success"></div>
                    </label>
                </div>

                {/* 2. SIRALAMA TOGGLE */}
                <div className="flex items-center justify-between p-3 rounded-admin bg-admin-input-bg border border-admin-input-border">
                    <div>
                         <div className="text-admin-sm font-semibold text-admin-fg flex items-center gap-2">
                             <SlLayers /> Sıralama Butonu
                        </div>
                        <p className="text-admin-tiny text-admin-muted mt-0.5">
                            Ürün listesinin üstündeki "Önerilen Sıralama" butonunu göster/gizle.
                        </p>
                    </div>
                    
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={sortingActive}
                            onChange={(e) => setSortingActive(e.target.checked)}
                        />
                        <div className="w-9 h-5 bg-admin-card-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-admin-success"></div>
                    </label>
                </div>
            </div>
        </div>

        {/* KAYDET BUTONU */}
        <div className="flex justify-end">
             <button
              type='submit'
              disabled={saving}
              className='btn-admin btn-admin-primary text-admin-sm gap-2 px-6'
            >
              <SlCheck /> {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
        </div>

      </form>
    </>
  );
}