'use client';

import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { SlLayers, SlEqualizer, SlOptions } from 'react-icons/sl';
import { updateCategorySettingsAction } from '@/app/admin/actions/filter-actions';

export type SettingsHandle = { save: () => Promise<boolean>; };

export const CategorySettings = forwardRef<SettingsHandle, {}>((props, ref) => {
  const supabase = createSupabaseBrowserClient();
  const [filtersActive, setFiltersActive] = useState(true);
  const [sortingActive, setSortingActive] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('site_settings').select('is_category_filters_active, is_category_sorting_active').maybeSingle();
      if (data) {
        setFiltersActive(data.is_category_filters_active ?? true);
        setSortingActive(data.is_category_sorting_active ?? true);
      }
    };
    fetch();
  }, []);

  useImperativeHandle(ref, () => ({
    save: async () => {
      const formData = new FormData();
      formData.append('is_category_filters_active', String(filtersActive));
      formData.append('is_category_sorting_active', String(sortingActive));
      const res = await updateCategorySettingsAction(formData);
      return res.success;
    }
  }));

  return (
    <div className="card-admin shadow-sm border border-admin-card-border">
        <h3 className="font-bold border-b border-admin-card-border pb-3 mb-4 text-[var(--admin-fg)] flex items-center gap-2">
            <SlOptions className="text-admin-accent" /> Listeleme Araçları
        </h3>
        
        <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-admin bg-admin-input-bg border border-admin-input-border">
                <div>
                    <div className="text-sm font-bold text-admin-fg flex items-center gap-2"><SlEqualizer /> Filtreleme Alanı (Sidebar)</div>
                    <p className="text-xs text-admin-muted mt-1">Sol menüde yer alan özellik filtrelerini göster/gizle.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={filtersActive} onChange={(e) => setFiltersActive(e.target.checked)} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--admin-success)]"></div>
                </label>
            </div>

            <div className="flex items-center justify-between p-4 rounded-admin bg-admin-input-bg border border-admin-input-border">
                <div>
                    <div className="text-sm font-bold text-admin-fg flex items-center gap-2"><SlLayers /> Sıralama Butonu</div>
                    <p className="text-xs text-admin-muted mt-1">Ürün listesinin üstündeki "Önerilen Sıralama" butonunu göster/gizle.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={sortingActive} onChange={(e) => setSortingActive(e.target.checked)} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--admin-success)]"></div>
                </label>
            </div>
        </div>
    </div>
  );
});

CategorySettings.displayName = 'CategorySettings';