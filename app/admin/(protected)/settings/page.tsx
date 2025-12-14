// C:\Projeler\nost-copy\app\admin\(protected)\settings\page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import {
  SlPhone,
  SlEnvolope,
  SlLocationPin,
  SlClock,
  SlGlobe,
  SlPicture,
  SlCheck,
  SlNote,
  SlRefresh,
  SlMap
} from 'react-icons/sl'
import { translateTextAction } from '@/app/admin/actions'

// --- TİPLER ---
type GlobalSettings = {
  id?: number
  logo_url: string
  favicon_url: string
  phone: string
  email: string
  working_hours: string
  store_location_url: string
}

type LocalizedSettings = {
  site_name: string
  footer_text: string
  address: string
}

type FormState = {
  global: GlobalSettings
  translations: Record<string, LocalizedSettings>
}

const LANGUAGES = ['tr', 'en', 'de']
const INITIAL_LOCALIZED: LocalizedSettings = {
  site_name: '',
  footer_text: '',
  address: ''
}

export default function GeneralSettingsPage () {
  const supabase = createSupabaseBrowserClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeLang, setActiveLang] = useState('tr')

  const [formData, setFormData] = useState<FormState>({
    global: {
      logo_url: '',
      favicon_url: '',
      phone: '',
      email: '',
      working_hours: '',
      store_location_url: ''
    },
    translations: {
      tr: { ...INITIAL_LOCALIZED },
      en: { ...INITIAL_LOCALIZED },
      de: { ...INITIAL_LOCALIZED }
    }
  })

  // --- VERİ ÇEKME ---
  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      const { data: settings } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .maybeSingle()

      if (settings) {
        const { data: trans } = await supabase
          .from('site_settings_translations')
          .select('*')
          .eq('settings_id', settings.id)

        const newTrans = { ...formData.translations }
        trans?.forEach((t: any) => {
          if (newTrans[t.lang_code]) {
            newTrans[t.lang_code] = {
              site_name: t.site_name || '',
              footer_text: t.footer_text || '',
              address: t.address || ''
            }
          }
        })

        setFormData({
          global: settings,
          translations: newTrans
        })
      }
      setLoading(false)
    }
    fetch()
  }, [])

  // --- KAYDETME ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: savedGlobal, error: globalError } = await supabase
        .from('site_settings')
        .upsert(
          formData.global.id
            ? formData.global
            : { ...formData.global, id: undefined }
        )
        .select()
        .single()

      if (globalError) throw globalError

      const translationsToUpsert = LANGUAGES.map(lang => ({
        settings_id: savedGlobal.id,
        lang_code: lang,
        ...formData.translations[lang]
      }))

      const { error: transError } = await supabase
        .from('site_settings_translations')
        .upsert(translationsToUpsert, { onConflict: 'settings_id, lang_code' })

      if (transError) throw transError

      toast.success('Ayarlar başarıyla kaydedildi!')
      setFormData(prev => ({
        ...prev,
        global: { ...prev.global, id: savedGlobal.id }
      }))
    } catch (err: any) {
      toast.error('Hata: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleGlobalChange = (key: keyof GlobalSettings, val: string) => {
    setFormData(prev => ({ ...prev, global: { ...prev.global, [key]: val } }))
  }

  const handleLocalChange = (key: keyof LocalizedSettings, val: string) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [activeLang]: { ...prev.translations[activeLang], [key]: val }
      }
    }))
  }

  // --- OTOMATİK ÇEVİRİLİ DAĞIT ---
  const handleDistributeLanguage = async () => {
    if (
      !confirm(
        `Şu anki (${activeLang.toUpperCase()}) metinleri diğer dillere çevirip dağıtmak istiyor musunuz?`
      )
    )
      return

    const toastId = toast.loading('Otomatik çeviri yapılıyor...')
    const sourceData = formData.translations[activeLang]
    const newTrans = { ...formData.translations }

    await Promise.all(
      LANGUAGES.map(async lang => {
        if (lang === activeLang) return

        const resName = await translateTextAction(
          sourceData.site_name,
          lang,
          activeLang
        )
        const resFooter = await translateTextAction(
          sourceData.footer_text,
          lang,
          activeLang
        )
        const resAddress = await translateTextAction(
          sourceData.address,
          lang,
          activeLang
        )

        newTrans[lang] = {
          site_name: resName.success ? resName.text : sourceData.site_name,
          footer_text: resFooter.success
            ? resFooter.text
            : sourceData.footer_text,
          address: resAddress.success ? resAddress.text : sourceData.address
        }
      })
    )

    setFormData(prev => ({ ...prev, translations: newTrans }))
    toast.success('Çeviriler tamamlandı.', { id: toastId })
  }

  if (loading)
    return (
      <div className='p-10 text-center text-[var(--admin-muted)]'>
        Yükleniyor...
      </div>
    )

  return (
    <form onSubmit={handleSave} className='space-y-6 pb-20'>
      {/* BAŞLIK & DİL SEÇİMİ */}
      <div className='card-admin sticky top-2 z-20 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4'>
        <div className='flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide'>
          {LANGUAGES.map(lang => (
            <button
              type='button'
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`px-4 py-2 rounded-lg font-bold uppercase text-sm transition-all border border-transparent whitespace-nowrap ${
                activeLang === lang
                  ? 'bg-[var(--admin-accent)] text-white shadow-md'
                  : 'bg-[var(--admin-input-bg)] text-[var(--admin-muted)] hover:text-[var(--admin-fg)] hover:border-[var(--admin-input-border)]'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        <div className='flex items-center gap-3 w-full md:w-auto'>
          <button
            type='button'
            onClick={handleDistributeLanguage}
            className='btn-admin btn-admin-secondary text-xs flex-1 md:flex-none'
            title='Otomatik Çevir'
          >
            <SlRefresh />{' '}
            <span className='hidden sm:inline'>Çevir & Dağıt</span>
          </button>
          <div className='hidden md:block h-6 w-px bg-[var(--admin-card-border)]'></div>
          <span className='text-xs font-bold uppercase text-[var(--admin-muted)] hidden md:inline-block'>
            {activeLang}
          </span>
        </div>
      </div>

      <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
        {/* SOL KOLON: Site Kimliği */}
        <div className='card-admin h-fit'>
          <h3 className='text-lg font-bold mb-6 flex items-center gap-2 pb-2 border-b border-[var(--admin-card-border)]'>
            <SlGlobe className='text-[var(--admin-accent)]' /> Site Kimliği
          </h3>

          <div className='space-y-5'>
            {/* Site Adı */}
            <div>
              <label className='admin-label flex justify-between items-center'>
                <span className='flex items-center gap-2'>
                  Site Adı (Title)
                </span>
                <span className='badge-admin badge-admin-default text-[10px] uppercase'>
                  {activeLang}
                </span>
              </label>
              <input
                className='admin-input'
                value={formData.translations[activeLang].site_name}
                onChange={e => handleLocalChange('site_name', e.target.value)}
                placeholder='Site Başlığı'
              />
            </div>

            {/* Logo URL */}
            <div>
              <label className='admin-label flex items-center gap-2'>
                <SlPicture className='text-[var(--admin-muted)]' /> Logo URL
              </label>
              <input
                className='admin-input'
                placeholder='https://...'
                value={formData.global.logo_url || ''}
                onChange={e => handleGlobalChange('logo_url', e.target.value)}
              />
              {formData.global.logo_url && (
                <div className='mt-3 p-2 border border-dashed border-[var(--admin-card-border)] rounded-lg bg-[var(--admin-input-bg)] inline-block'>
                  <img
                    src={formData.global.logo_url}
                    alt='Logo Önizleme'
                    className='h-8 w-auto object-contain'
                  />
                </div>
              )}
            </div>

            {/* Footer Text */}
            <div>
              <label className='admin-label flex justify-between items-center'>
                <span className='flex items-center gap-2'>
                  <SlNote className='text-[var(--admin-muted)]' /> Footer
                  Hakkında Metni
                </span>
                <span className='badge-admin badge-admin-default text-[10px] uppercase'>
                  {activeLang}
                </span>
              </label>
              <textarea
                className='admin-textarea min-h-[100px]'
                value={formData.translations[activeLang].footer_text}
                onChange={e => handleLocalChange('footer_text', e.target.value)}
                placeholder='Kısa açıklama...'
              />
            </div>
          </div>
        </div>

        {/* SAĞ KOLON: İletişim */}
        <div className='card-admin h-fit'>
          <h3 className='text-lg font-bold mb-6 flex items-center gap-2 pb-2 border-b border-[var(--admin-card-border)]'>
            <SlPhone className='text-[var(--admin-accent)]' /> İletişim
            Bilgileri
          </h3>

          <div className='space-y-5'>
            {/* Telefon & Email */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='admin-label flex items-center gap-2'>
                  <SlPhone className='text-[var(--admin-muted)]' /> Telefon
                </label>
                <input
                  className='admin-input'
                  value={formData.global.phone || ''}
                  onChange={e => handleGlobalChange('phone', e.target.value)}
                  placeholder='+90...'
                />
              </div>
              <div>
                <label className='admin-label flex items-center gap-2'>
                  <SlEnvolope className='text-[var(--admin-muted)]' /> E-Posta
                </label>
                <input
                  type='email'
                  className='admin-input'
                  value={formData.global.email || ''}
                  onChange={e => handleGlobalChange('email', e.target.value)}
                  placeholder='info@...'
                />
              </div>
            </div>

            {/* Adres */}
            <div>
              <label className='admin-label flex justify-between items-center'>
                <span className='flex items-center gap-2'>
                  <SlLocationPin className='text-[var(--admin-muted)]' /> Açık
                  Adres
                </span>
                <span className='badge-admin badge-admin-default text-[10px] uppercase'>
                  {activeLang}
                </span>
              </label>
              <textarea
                className='admin-textarea min-h-[80px]'
                value={formData.translations[activeLang].address}
                onChange={e => handleLocalChange('address', e.target.value)}
                placeholder='Adres bilgisi...'
              />
            </div>

            {/* Çalışma Saatleri & Harita */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='admin-label flex items-center gap-2'>
                  <SlClock className='text-[var(--admin-muted)]' /> Çalışma
                  Saatleri
                </label>
                <input
                  className='admin-input'
                  value={formData.global.working_hours || ''}
                  onChange={e =>
                    handleGlobalChange('working_hours', e.target.value)
                  }
                  placeholder='Pzt-Cum 09:00...'
                />
              </div>
              <div>
                <label className='admin-label flex items-center gap-2'>
                  <SlMap className='text-[var(--admin-muted)]' /> Harita Linki
                </label>
                <input
                  className='admin-input'
                  placeholder='Google Maps URL'
                  value={formData.global.store_location_url || ''}
                  onChange={e =>
                    handleGlobalChange('store_location_url', e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION BAR */}
      <div className='fixed bottom-0 right-0 left-0 lg:left-64 p-4 bg-[var(--admin-card)] border-t border-[var(--admin-card-border)] flex justify-end z-30'>
        <button
          type='submit'
          disabled={saving}
          className='btn-admin btn-admin-primary px-8 py-2.5 shadow-lg'
        >
          <SlCheck /> {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </form>
  )
}
