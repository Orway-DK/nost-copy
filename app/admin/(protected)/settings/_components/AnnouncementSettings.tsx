'use client'

import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { FaBullhorn } from 'react-icons/fa'
import { LangCode } from '../page'
import { SettingsHandle } from './CategorySettings'

type FormData = { [key in LangCode]: { promo_text: string; promo_cta: string; promo_url: string } }
const INITIAL_DATA = { promo_text: '', promo_cta: '', promo_url: '' }

export const AnnouncementSettings = forwardRef<SettingsHandle, { lang: LangCode }>(({ lang }, ref) => {
  const supabase = createSupabaseBrowserClient()
  const [isBannerActive, setIsBannerActive] = useState(true)
  const [formData, setFormData] = useState<FormData>({ tr: { ...INITIAL_DATA }, en: { ...INITIAL_DATA }, de: { ...INITIAL_DATA } })

  useEffect(() => {
    async function fetchData() {
        try {
            const { data: bannerMain } = await supabase.from('banners').select('id, active').eq('code', 'top_horizontal').single()
            if (bannerMain) setIsBannerActive(bannerMain.active)
            const { data: bannerData } = await supabase.from('banner_translations').select('*').eq('banner_id', bannerMain?.id || 0)
            const newFormData = { ...formData }
            bannerData?.forEach((item: any) => {
              if (['tr', 'en', 'de'].includes(item.lang_code)) {
                newFormData[item.lang_code as LangCode] = { promo_text: item.promo_text || '', promo_cta: item.promo_cta || '', promo_url: item.promo_url || '' }
              }
            })
            setFormData(newFormData)
        } catch(e) { console.error(e) }
    }
    fetchData()
  }, [])

  useImperativeHandle(ref, () => ({
    save: async () => {
      try {
        let { data: banner } = await supabase.from('banners').select('id').eq('code', 'top_horizontal').maybeSingle()
        if (!banner) {
          const { data: newBanner } = await supabase.from('banners').insert({ code: 'top_horizontal', active: isBannerActive }).select().single()
          banner = newBanner
        } else {
          await supabase.from('banners').update({ active: isBannerActive }).eq('id', banner!.id)
        }
        for (const l of ['tr', 'en', 'de'] as LangCode[]) {
          const data = formData[l]
          if (banner) await supabase.from('banner_translations').upsert({ banner_id: banner.id, lang_code: l, promo_text: data.promo_text, promo_cta: data.promo_cta, promo_url: data.promo_url }, { onConflict: 'banner_id, lang_code' })
        }
        return true
      } catch (error) { console.error(error); return false }
    }
  }));

  const handleChange = (field: keyof FormData['tr'], value: string) => {
    setFormData(prev => ({ ...prev, [lang]: { ...prev[lang], [field]: value } }))
  }

  return (
    <div className='card-admin shadow-sm border border-admin-card-border'>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-3 border-b border-admin-card-border">
        <h3 className="font-bold text-[var(--admin-fg)] flex items-center gap-2">
            <FaBullhorn className="text-admin-accent" /> Duyuru Bandı (Top Bar)
        </h3>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={isBannerActive} onChange={(e) => setIsBannerActive(e.target.checked)} />
            <div className="w-9 h-5 bg-admin-card-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-admin-success"></div>
            <span className="ms-2 text-xs font-medium text-admin-fg">Aktif</span>
        </label>
      </div>

      <div className={`space-y-4 transition-opacity ${!isBannerActive ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="bg-[var(--admin-input-bg)] p-3 rounded-lg border border-admin-input-border">
             <div className="flex justify-between items-center mb-1">
                <label className="admin-label">Duyuru Metni ({lang.toUpperCase()})</label>
             </div>
             <textarea className="admin-textarea h-20 text-sm" value={formData[lang].promo_text} onChange={(e) => handleChange('promo_text', e.target.value)} placeholder="Örn: Tüm kartvizitlerde %20 indirim!" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Buton Metni (CTA)</label>
              <input className="admin-input" value={formData[lang].promo_cta} onChange={(e) => handleChange('promo_cta', e.target.value)} placeholder="Fırsatı Yakala" />
            </div>
            <div>
              <label className="admin-label">Yönlendirme Linki</label>
              <input className="admin-input" value={formData[lang].promo_url} onChange={(e) => handleChange('promo_url', e.target.value)} placeholder="/kampanyalar" />
            </div>
          </div>
      </div>
    </div>
  )
})

AnnouncementSettings.displayName = 'AnnouncementSettings';