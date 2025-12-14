// C:\Projeler\nost-copy\app\admin\(protected)\showcase\why-us\why-us-form.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  IoSave,
  IoLanguage,
  IoImageOutline,
  IoInformationCircle,
  IoCheckmark
} from 'react-icons/io5'
import { updateWhyUsAction } from './actions'
import { toast } from 'react-hot-toast'

type Props = {
  initialBase: any
  initialTranslations: any
}

const defaultTransData = {
  badge_label: '',
  headline_prefix: '',
  headline_emphasis: '',
  headline_suffix: '',
  description: '',
  item1_title: '',
  item1_text: '',
  item2_title: '',
  item2_text: '',
  item3_title: '',
  item3_text: ''
}

const LANGS = ['tr', 'en', 'de'] as const

export default function WhyUsForm ({ initialBase, initialTranslations }: Props) {
  const [saving, setSaving] = useState(false)
  const [selectedLang, setSelectedLang] = useState<typeof LANGS[number]>('tr')

  // State tanımları
  const [baseData, setBaseData] = useState({
    id: initialBase?.id,
    image1_url: initialBase?.image1_url || '',
    image2_url: initialBase?.image2_url || '',
    years_experience: initialBase?.years_experience || 1,
    badge_code: initialBase?.badge_code || ''
  })

  const [translations, setTranslations] = useState(() => {
    const state: any = {
      tr: { ...defaultTransData },
      en: { ...defaultTransData },
      de: { ...defaultTransData }
    }
    if (Array.isArray(initialTranslations)) {
      initialTranslations.forEach((t: any) => {
        if (LANGS.includes(t.lang_code)) {
          state[t.lang_code] = { ...defaultTransData, ...t }
        }
      })
    }
    return state
  })

  // Kaydetme Fonksiyonu
  const handleSave = async () => {
    setSaving(true)
    const toastId = toast.loading('Kaydediliyor...')

    try {
      const res = await updateWhyUsAction({ base: baseData, translations })
      if (res.success) {
        toast.success('Başarıyla güncellendi!', { id: toastId })
        if (res.data?.id) setBaseData(prev => ({ ...prev, id: res.data.id }))
      } else {
        toast.error('Hata: ' + res.message, { id: toastId })
      }
    } catch (e: any) {
      toast.error('Hata: ' + e.message, { id: toastId })
    } finally {
      setSaving(false)
    }
  }

  const handleBaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setBaseData(prev => ({
      ...prev,
      [name]: name === 'years_experience' ? Number(value) : value
    }))
  }

  const handleTransChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setTranslations((prev: any) => ({
      ...prev,
      [selectedLang]: { ...prev[selectedLang], [name]: value }
    }))
  }

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* --- SOL KOLON: Görseller --- */}
        <div className='lg:col-span-1 space-y-6'>
          <div className='card-admin space-y-5 h-full'>
            <h3
              className='text-lg font-bold flex items-center gap-2 border-b pb-3'
              style={{
                borderColor: 'var(--admin-card-border)',
                color: 'var(--admin-fg)'
              }}
            >
              <IoImageOutline className='text-[var(--admin-accent)]' /> Genel
              Görseller
            </h3>

            <div>
              <label className='admin-label'>Deneyim Yılı</label>
              <input
                type='number'
                name='years_experience'
                value={baseData.years_experience}
                onChange={handleBaseChange}
                className='admin-input'
              />
            </div>

            <div>
              <label className='admin-label'>Büyük Resim URL</label>
              <input
                type='text'
                name='image1_url'
                value={baseData.image1_url}
                onChange={handleBaseChange}
                className='admin-input mb-2'
                placeholder='/images/...'
              />
              <div
                className='relative w-full h-32 rounded-lg overflow-hidden border bg-[var(--admin-input-bg)] flex items-center justify-center'
                style={{ borderColor: 'var(--admin-card-border)' }}
              >
                {baseData.image1_url ? (
                  <Image
                    src={baseData.image1_url}
                    alt='p'
                    fill
                    className='object-contain'
                    unoptimized
                  />
                ) : (
                  <IoImageOutline className='text-4xl text-[var(--admin-muted)] opacity-30' />
                )}
              </div>
            </div>

            <div>
              <label className='admin-label'>Küçük Resim URL</label>
              <input
                type='text'
                name='image2_url'
                value={baseData.image2_url}
                onChange={handleBaseChange}
                className='admin-input mb-2'
                placeholder='/images/...'
              />
              <div
                className='relative w-full h-32 rounded-lg overflow-hidden border bg-[var(--admin-input-bg)] flex items-center justify-center'
                style={{ borderColor: 'var(--admin-card-border)' }}
              >
                {baseData.image2_url ? (
                  <Image
                    src={baseData.image2_url}
                    alt='p'
                    fill
                    className='object-contain'
                    unoptimized
                  />
                ) : (
                  <IoImageOutline className='text-4xl text-[var(--admin-muted)] opacity-30' />
                )}
              </div>
            </div>

            <div>
              <label className='admin-label'>Badge Kodu</label>
              <input
                type='text'
                name='badge_code'
                value={baseData.badge_code}
                onChange={handleBaseChange}
                className='admin-input'
              />
            </div>
          </div>
        </div>

        {/* --- SAĞ KOLON: Çeviriler --- */}
        <div className='lg:col-span-2'>
          <div className='card-admin h-full'>
            <div
              className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 border-b pb-4 gap-4'
              style={{ borderColor: 'var(--admin-card-border)' }}
            >
              <h3
                className='text-lg font-bold flex items-center gap-2'
                style={{ color: 'var(--admin-fg)' }}
              >
                <IoLanguage className='text-[var(--admin-info)]' /> İçerik
                Çevirileri
              </h3>

              <div className='flex bg-[var(--admin-input-bg)] p-1 rounded-lg border border-[var(--admin-card-border)]'>
                {LANGS.map(lang => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLang(lang)}
                    className={`px-4 py-1.5 rounded-md text-sm font-bold uppercase transition-all ${
                      selectedLang === lang
                        ? 'bg-[var(--admin-card)] text-[var(--admin-accent)] shadow-sm text-white' // text-white -> text-accent for light bg card
                        : 'text-[var(--admin-muted)] hover:text-[var(--admin-fg)]'
                    }`}
                    style={
                      selectedLang === lang
                        ? {
                            backgroundColor: 'var(--admin-accent)',
                            color: '#fff'
                          }
                        : {}
                    }
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className='space-y-6'>
              <div>
                <label className='admin-label'>Badge Label</label>
                <input
                  name='badge_label'
                  value={translations[selectedLang].badge_label}
                  onChange={handleTransChange}
                  className='admin-input'
                />
              </div>

              <div className='space-y-2'>
                <label className='admin-label'>
                  Ana Başlık (Prefix -{' '}
                  <span className='font-bold'>Emphasis</span> - Suffix)
                </label>
                <div className='flex flex-col md:flex-row gap-2'>
                  <input
                    name='headline_prefix'
                    value={translations[selectedLang].headline_prefix}
                    onChange={handleTransChange}
                    className='admin-input flex-1'
                    placeholder='Prefix'
                  />
                  <input
                    name='headline_emphasis'
                    value={translations[selectedLang].headline_emphasis}
                    onChange={handleTransChange}
                    className='admin-input flex-1 font-bold text-[var(--admin-accent)]'
                    placeholder='Emphasis'
                  />
                  <input
                    name='headline_suffix'
                    value={translations[selectedLang].headline_suffix}
                    onChange={handleTransChange}
                    className='admin-input flex-1'
                    placeholder='Suffix'
                  />
                </div>
              </div>

              <div>
                <label className='admin-label'>Açıklama</label>
                <textarea
                  name='description'
                  rows={3}
                  value={translations[selectedLang].description}
                  onChange={handleTransChange}
                  className='admin-textarea'
                />
              </div>

              <div
                className='pt-6 border-t'
                style={{ borderColor: 'var(--admin-card-border)' }}
              >
                <div className='flex items-center gap-2 font-bold mb-4 text-[var(--admin-fg)]'>
                  <IoInformationCircle className='text-[var(--admin-info)]' />
                  <span>Özellik Maddeleri</span>
                </div>

                <div className='grid gap-4'>
                  {[1, 2, 3].map(num => (
                    <div
                      key={num}
                      className='p-4 rounded-lg border bg-[var(--admin-input-bg)]'
                      style={{ borderColor: 'var(--admin-input-border)' }}
                    >
                      <span className='text-xs font-bold uppercase mb-3 block text-[var(--admin-muted)]'>
                        Madde {num}
                      </span>
                      <div className='grid gap-3'>
                        {/* @ts-ignore */}
                        <input
                          name={`item${num}_title`}
                          value={translations[selectedLang][`item${num}_title`]}
                          onChange={handleTransChange}
                          className='admin-input font-semibold'
                          placeholder='Başlık'
                        />
                        {/* @ts-ignore */}
                        <textarea
                          rows={2}
                          name={`item${num}_text`}
                          value={translations[selectedLang][`item${num}_text`]}
                          onChange={handleTransChange}
                          className='admin-textarea min-h-[60px] text-sm'
                          placeholder='Açıklama'
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION BAR */}
      <div className='fixed bottom-0 right-0 left-0 lg:left-64 p-4 bg-[var(--admin-card)] border-t border-[var(--admin-card-border)] flex justify-end z-30 shadow-lg'>
        <button
          onClick={handleSave}
          disabled={saving}
          className='btn-admin btn-admin-primary px-8 py-2.5 flex items-center gap-2'
        >
          <IoSave />
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </div>
  )
}
