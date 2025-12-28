'use client'

import React, { useEffect, useState, forwardRef, useImperativeHandle, useRef } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { SlPicture, SlNote, SlRefresh } from 'react-icons/sl'
import { translateTextAction } from '@/app/admin/actions'
import { LangCode } from '../page'
import { CategorySettings, SettingsHandle } from './CategorySettings'
import { AnnouncementSettings } from './AnnouncementSettings'

type GlobalSettings = { id?: number; logo_url: string; favicon_url: string }
type LocalizedSettings = { site_name: string; footer_text: string }
type FormState = { global: GlobalSettings; translations: Record<string, LocalizedSettings> }
const INITIAL_LOCALIZED: LocalizedSettings = { site_name: '', footer_text: '' }

export const GeneralSettings = forwardRef<SettingsHandle, { lang: LangCode }>(({ lang }, ref) => {
  const supabase = createSupabaseBrowserClient()
  const [formData, setFormData] = useState<FormState>({ global: { logo_url: '', favicon_url: '' }, translations: { tr: { ...INITIAL_LOCALIZED }, en: { ...INITIAL_LOCALIZED }, de: { ...INITIAL_LOCALIZED } } })
  const categoryRef = useRef<SettingsHandle>(null)
  const announcementRef = useRef<SettingsHandle>(null)

  useEffect(() => {
    const fetch = async () => {
        const { data: settings } = await supabase.from('site_settings').select('*').limit(1).maybeSingle()
        if (settings) {
            const { data: trans } = await supabase.from('site_settings_translations').select('*').eq('settings_id', settings.id)
            const newTrans = { ...formData.translations }
            trans?.forEach((t: any) => {
                if (newTrans[t.lang_code]) { newTrans[t.lang_code] = { site_name: t.site_name || '', footer_text: t.footer_text || '' } }
            })
            setFormData({ global: { id: settings.id, logo_url: settings.logo_url, favicon_url: settings.favicon_url }, translations: newTrans })
        }
    }
    fetch()
  }, [])

  useImperativeHandle(ref, () => ({
    save: async () => {
      let success = true;
      try {
        const { data: savedGlobal, error: globalError } = await supabase.from('site_settings').upsert(formData.global.id ? formData.global : { ...formData.global, id: undefined }).select().single()
        if (globalError) throw globalError
        
        const translationsToUpsert = ['tr', 'en', 'de'].map(l => ({ settings_id: savedGlobal.id, lang_code: l, ...formData.translations[l] }))
        const { error: transError } = await supabase.from('site_settings_translations').upsert(translationsToUpsert, { onConflict: 'settings_id, lang_code' })
        if (transError) throw transError
        
        setFormData(prev => ({ ...prev, global: { ...prev.global, id: savedGlobal.id } }))

        if (categoryRef.current) { const catRes = await categoryRef.current.save(); if(!catRes) success = false }
        if (announcementRef.current) { const annRes = await announcementRef.current.save(); if(!annRes) success = false }

      } catch (err) { console.error(err); success = false }
      return success
    }
  }));

  const handleTranslate = async () => {
    if (!confirm(`${lang.toUpperCase()} verilerini diğer dillere çevirmek istiyor musunuz?`)) return
    const toastId = toast.loading('Çevriliyor...')
    const src = formData.translations[lang]
    const newTrans = { ...formData.translations }
    await Promise.all(['tr', 'en', 'de'].map(async l => {
        if (l === lang) return
        const t1 = await translateTextAction(src.site_name, l, lang)
        const t2 = await translateTextAction(src.footer_text, l, lang)
        newTrans[l] = { site_name: t1.success ? t1.text : src.site_name, footer_text: t2.success ? t2.text : src.footer_text }
    }))
    setFormData(prev => ({ ...prev, translations: newTrans }))
    toast.success('Tamamlandı', { id: toastId })
  }

  return (
    <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
        <div className='card-admin shadow-sm border border-admin-card-border h-fit'>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-admin-card-border">
                <h3 className="font-bold text-lg text-[var(--admin-fg)]">Site Kimliği ({lang.toUpperCase()})</h3>
                <button onClick={handleTranslate} className='btn-admin btn-admin-secondary text-xs px-3 gap-2'><SlRefresh /> Çevir</button>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div><label className='admin-label'>Site Başlığı (Title)</label><input className='admin-input font-bold' value={formData.translations[lang].site_name} onChange={e => setFormData(p => ({...p, translations: {...p.translations, [lang]: {...p.translations[lang], site_name: e.target.value}}}))} /></div>
                        <div><label className='admin-label'>Logo URL</label><input className='admin-input text-xs' value={formData.global.logo_url} onChange={e => setFormData(p => ({...p, global: {...p.global, logo_url: e.target.value}}))} /></div>
                        <div><label className='admin-label'>Favicon URL</label><input className='admin-input text-xs' value={formData.global.favicon_url} onChange={e => setFormData(p => ({...p, global: {...p.global, favicon_url: e.target.value}}))} /></div>
                    </div>
                    <div className="space-y-4">
                        <div className="bg-[var(--admin-input-bg)] rounded-lg h-28 border border-[var(--admin-card-border)] flex items-center justify-center relative group">
                            {formData.global.logo_url ? <img src={formData.global.logo_url} className="max-h-20 max-w-full object-contain" /> : <SlPicture className="text-3xl opacity-20" />}
                            <span className="absolute bottom-1 right-2 text-[10px] text-admin-muted">Önizleme</span>
                        </div>
                        <div><label className='admin-label flex items-center gap-2'><SlNote className='text-[var(--admin-muted)]' /> Footer Metni</label><textarea className='admin-textarea min-h-[90px]' value={formData.translations[lang].footer_text} onChange={e => setFormData(p => ({...p, translations: {...p.translations, [lang]: {...p.translations[lang], footer_text: e.target.value}}}))} /></div>
                    </div>
                </div>
            </div>
        </div>

        <div className='space-y-6'>
            <AnnouncementSettings ref={announcementRef} lang={lang} />
            <CategorySettings ref={categoryRef} />
        </div>
    </div>
  )
})

GeneralSettings.displayName = 'GeneralSettings';