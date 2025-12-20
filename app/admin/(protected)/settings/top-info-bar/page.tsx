// C:\Projeler\nost-copy\app\admin\(protected)\top-info-bar\page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { FaPhone, FaBullhorn, FaMapMarkerAlt } from 'react-icons/fa'
import { SlCheck } from 'react-icons/sl'

type Language = 'tr' | 'en' | 'de'

type FormData = {
  [key in Language]: {
    phone: string
    email: string
    location_url: string
    location_label: string
    promo_text: string
    promo_cta: string
    promo_url: string
  }
}

const INITIAL_DATA = {
  phone: '',
  email: '',
  location_url: '',
  location_label: '',
  promo_text: '',
  promo_cta: '',
  promo_url: ''
}

export default function TopInfoBarSettings () {
  const supabase = createSupabaseBrowserClient()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Language>('tr')
  const [isBannerActive, setIsBannerActive] = useState(true)

  const [formData, setFormData] = useState<FormData>({
    tr: { ...INITIAL_DATA },
    en: { ...INITIAL_DATA },
    de: { ...INITIAL_DATA }
  })

  useEffect(() => {
    async function fetchData () {
      setLoading(true)
      try {
        const { data: bannerMain } = await supabase
          .from('banners')
          .select('id, active')
          .eq('code', 'top_horizontal')
          .single()
        if (bannerMain) setIsBannerActive(bannerMain.active)

        const { data: contactData } = await supabase
          .from('site_contact_info')
          .select('*')
        const { data: bannerData } = await supabase
          .from('banner_translations')
          .select('*')
          .eq('banner_id', bannerMain?.id || 0)

        const newFormData = { ...formData }

        contactData?.forEach((item: any) => {
          if (['tr', 'en', 'de'].includes(item.lang_code)) {
            const lang = item.lang_code as Language
            newFormData[lang] = {
              ...newFormData[lang],
              phone: item.phone || '',
              email: item.email || '',
              location_url: item.location_url || '',
              location_label: item.location_label || ''
            }
          }
        })

        bannerData?.forEach((item: any) => {
          if (['tr', 'en', 'de'].includes(item.lang_code)) {
            const lang = item.lang_code as Language
            newFormData[lang] = {
              ...newFormData[lang],
              promo_text: item.promo_text || '',
              promo_cta: item.promo_cta || '',
              promo_url: item.promo_url || ''
            }
          }
        })

        setFormData(newFormData)
      } catch (error) {
        console.error('Veri hatası:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSave = async () => {
    const toastId = toast.loading('Kaydediliyor...')
    try {
      let { data: banner } = await supabase
        .from('banners')
        .select('id')
        .eq('code', 'top_horizontal')
        .maybeSingle()

      if (!banner) {
        const { data: newBanner } = await supabase
          .from('banners')
          .insert({ code: 'top_horizontal', active: isBannerActive })
          .select()
          .single()
        banner = newBanner
      } else {
        await supabase
          .from('banners')
          .update({ active: isBannerActive })
          .eq('id', banner!.id)
      }

      for (const lang of ['tr', 'en', 'de'] as Language[]) {
        const data = formData[lang]
        await supabase
          .from('site_contact_info')
          .upsert(
            {
              lang_code: lang,
              phone: data.phone,
              email: data.email,
              location_url: data.location_url,
              location_label: data.location_label
            },
            { onConflict: 'lang_code' }
          )
        if (banner) {
          await supabase
            .from('banner_translations')
            .upsert(
              {
                banner_id: banner.id,
                lang_code: lang,
                promo_text: data.promo_text,
                promo_cta: data.promo_cta,
                promo_url: data.promo_url
              },
              { onConflict: 'banner_id, lang_code' }
            )
        }
      }
      toast.success('Kaydedildi!', { id: toastId })
    } catch (error: any) {
      toast.error(error.message, { id: toastId })
    }
  }

  const handleChange = (field: keyof FormData['tr'], value: string) => {
    setFormData(prev => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], [field]: value }
    }))
  }

  if (loading)
    return (
      <div className='text-center p-10 text-[var(--admin-muted)]'>
        Yükleniyor...
      </div>
    )

  return (
    <div className='space-y-6 pb-20'>
      {/* Header */}
      <div className='card-admin flex flex-col md:flex-row justify-between items-center gap-4'>
        <div className='flex items-center gap-4 w-full md:w-auto'>
          <label className='relative inline-flex items-center cursor-pointer'>
            <input
              type='checkbox'
              className='sr-only peer'
              checked={isBannerActive}
              onChange={e => setIsBannerActive(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--admin-success)]"></div>
            <span className='ms-3 text-sm font-medium text-[var(--admin-fg)]'>
              Banner Aktif
            </span>
          </label>
        </div>

        <div className='flex gap-1 bg-[var(--admin-input-bg)] p-1 rounded-lg border border-[var(--admin-input-border)] w-full md:w-auto overflow-x-auto'>
          {(['tr', 'en', 'de'] as Language[]).map(lang => (
            <button
              key={lang}
              onClick={() => setActiveTab(lang)}
              className={`px-4 py-1.5 text-sm font-bold uppercase rounded transition-all ${
                activeTab === lang
                  ? 'bg-white text-[var(--admin-input-bg)] shadow-sm'
                  : 'text-[var(--admin-muted)] hover:text-[var(--admin-fg)]'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* SOL: İletişim */}
        <div className='card-admin'>
          <h3 className='text-lg font-bold mb-4 flex items-center gap-2 text-[var(--admin-fg)]'>
            <FaPhone className='text-[var(--admin-info)]' /> İletişim Bilgileri
          </h3>
          <div className='space-y-4'>
            <div>
              <label className='admin-label'>Telefon</label>
              <input
                className='admin-input'
                value={formData[activeTab].phone}
                onChange={e => handleChange('phone', e.target.value)}
                placeholder='+90...'
              />
            </div>
            <div>
              <label className='admin-label'>E-Posta</label>
              <input
                type='email'
                className='admin-input'
                value={formData[activeTab].email}
                onChange={e => handleChange('email', e.target.value)}
                placeholder='info@...'
              />
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <label className='admin-label'>Konum Metni</label>
                <div className='relative'>
                  <FaMapMarkerAlt className='absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-muted)]' />
                  <input
                    className='admin-input pl-9'
                    value={formData[activeTab].location_label}
                    onChange={e =>
                      handleChange('location_label', e.target.value)
                    }
                    placeholder='Konum'
                  />
                </div>
              </div>
              <div>
                <label className='admin-label'>Harita Linki</label>
                <input
                  className='admin-input'
                  value={formData[activeTab].location_url}
                  onChange={e => handleChange('location_url', e.target.value)}
                  placeholder='https://...'
                />
              </div>
            </div>
          </div>
        </div>

        {/* SAĞ: Banner */}
        <div
          className={`card-admin transition-opacity ${
            !isBannerActive ? 'opacity-60' : ''
          }`}
        >
          <h3 className='text-lg font-bold mb-4 flex items-center gap-2 text-[var(--admin-fg)]'>
            <FaBullhorn className='text-[var(--admin-warning)]' /> Promosyon
            Banner
          </h3>
          <div className='space-y-4'>
            <div>
              <label className='admin-label'>Duyuru Metni</label>
              <textarea
                className='admin-textarea h-24'
                value={formData[activeTab].promo_text}
                onChange={e => handleChange('promo_text', e.target.value)}
                placeholder='Kampanya detayları...'
              />
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <label className='admin-label'>Buton Metni (CTA)</label>
                <input
                  className='admin-input'
                  value={formData[activeTab].promo_cta}
                  onChange={e => handleChange('promo_cta', e.target.value)}
                  placeholder='İncele'
                />
              </div>
              <div>
                <label className='admin-label'>Yönlendirme Linki</label>
                <input
                  className='admin-input'
                  value={formData[activeTab].promo_url}
                  onChange={e => handleChange('promo_url', e.target.value)}
                  placeholder='/'
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='fixed bottom-0 right-0 left-0 lg:left-64 p-4 bg-[var(--admin-card)] border-t border-[var(--admin-card-border)] flex justify-end z-30 shadow-lg'>
        <button
          onClick={handleSave}
          className='btn-admin btn-admin-primary px-8 py-2.5'
        >
          <SlCheck /> Kaydet
        </button>
      </div>
    </div>
  )
}
