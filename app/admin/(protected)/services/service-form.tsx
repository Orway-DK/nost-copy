// C:\Projeler\nost-copy\app\admin\(protected)\services\service-form.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { IoSave, IoImageOutline, IoSparkles } from 'react-icons/io5'
import { toast } from 'react-hot-toast'
import MediaPickerModal from '@/app/admin/(protected)/_components/MediaPickerModal'
import { upsertServiceAction } from './actions'
import { translateTextAction } from '@/app/admin/actions' // Global çeviri action'ı

const LANGS = ['tr', 'en', 'de']

type Props = {
  initialData?: any
  onClose: () => void
  onSuccess: () => void
}

export default function ServiceForm ({
  initialData,
  onClose,
  onSuccess
}: Props) {
  const [saving, setSaving] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [activeLang, setActiveLang] = useState('tr')
  const [isMediaOpen, setIsMediaOpen] = useState(false)

  // Form State
  const [form, setForm] = useState(() => {
    const translations = LANGS.map(l => {
      const found = initialData?.service_translations?.find(
        (t: any) => t.lang_code === l
      )
      return {
        lang_code: l,
        id: found?.id,
        title: found?.title || '',
        description: found?.description || '',
        content: found?.content || ''
      }
    })

    return {
      id: initialData?.id,
      slug: initialData?.slug || '',
      image_url: initialData?.image_url || '',
      active: initialData?.active ?? true,
      translations
    }
  })

  const currentTrans = form.translations.find(t => t.lang_code === activeLang)!

  // Helpers
  const updateMain = (key: string, val: any) =>
    setForm(prev => ({ ...prev, [key]: val }))

  const updateTrans = (key: string, val: string) => {
    setForm(prev => ({
      ...prev,
      translations: prev.translations.map(t =>
        t.lang_code === activeLang ? { ...t, [key]: val } : t
      )
    }))
  }

  // Auto Translate
  const handleAutoTranslate = async () => {
    if (!currentTrans.title) {
      toast.error(`Lütfen önce ${activeLang.toUpperCase()} başlığını girin.`)
      return
    }
    if (!confirm('Diğer diller otomatik doldurulacak. Onaylıyor musunuz?'))
      return

    setTranslating(true)
    const loadingToast = toast.loading('Çeviriliyor...')

    try {
      // HATA DÜZELTİLDİ: Değişken isimleri tutarlı hale getirildi (newTrans)
      const newTrans = [...form.translations]
      const fields = ['title', 'description', 'content']

      const tasks = newTrans.map(async (target, idx) => {
        if (target.lang_code === activeLang) return

        for (const field of fields) {
          // @ts-ignore
          const txt = currentTrans[field]
          if (txt) {
            const res = await translateTextAction(
              txt,
              target.lang_code,
              activeLang
            )
            if (res.success) {
              // @ts-ignore
              newTrans[idx][field] = res.text
            }
          }
        }
      })

      await Promise.all(tasks)
      setForm(prev => ({ ...prev, translations: newTrans }))
      toast.success('Tamamlandı!', { id: loadingToast })
    } catch (e) {
      toast.error('Hata oluştu', { id: loadingToast })
    } finally {
      setTranslating(false)
    }
  }

  // Save
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await upsertServiceAction(form)
    setSaving(false)

    if (res.success) {
      toast.success(res.message)
      onSuccess()
    } else {
      toast.error(res.message)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='flex flex-col h-full bg-[var(--admin-card)]'
    >
      {/* Modal Body - Scrollable */}
      <div className='flex-1 overflow-y-auto p-6 space-y-6'>
        {/* 1. Genel Bilgiler */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-4'>
            <div>
              <label className='admin-label'>Slug (URL)</label>
              <input
                className='admin-input'
                value={form.slug}
                onChange={e => updateMain('slug', e.target.value)}
                placeholder='hizmet-adi-url (Boş bırakırsan otomatik dolar)'
              />
            </div>
            <div className='flex items-center gap-2 pt-4'>
              <input
                type='checkbox'
                className='w-5 h-5 accent-[var(--admin-success)]'
                checked={form.active}
                onChange={e => updateMain('active', e.target.checked)}
              />
              <span className='text-sm font-medium text-[var(--admin-fg)]'>
                Yayında (Aktif)
              </span>
            </div>
          </div>

          {/* Resim Seçimi */}
          <div>
            <label className='admin-label'>Hizmet Görseli</label>
            <div className='flex gap-2 mb-2'>
              <input
                className='admin-input flex-1 text-xs'
                value={form.image_url}
                readOnly
                placeholder='Görsel seç...'
              />
              <button
                type='button'
                onClick={() => setIsMediaOpen(true)}
                className='btn-admin btn-admin-secondary'
              >
                Seç
              </button>
            </div>
            <div
              className='relative w-full h-32 rounded-lg border bg-[var(--admin-input-bg)] flex items-center justify-center overflow-hidden'
              style={{ borderColor: 'var(--admin-input-border)' }}
            >
              {form.image_url ? (
                <Image
                  src={form.image_url}
                  alt='preview'
                  fill
                  className='object-cover'
                  unoptimized
                />
              ) : (
                <div className='flex flex-col items-center opacity-30'>
                  <IoImageOutline size={32} />
                  <span className='text-xs'>Görsel Yok</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <hr className='border-[var(--admin-card-border)]' />

        {/* 2. Çeviri Alanı */}
        <div className='space-y-4'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3'>
            <div className='flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1'>
              {LANGS.map(l => (
                <button
                  key={l}
                  type='button'
                  onClick={() => setActiveLang(l)}
                  className={`px-3 py-1.5 rounded text-sm font-bold uppercase transition-colors border ${
                    activeLang === l
                      ? 'bg-[var(--admin-accent)] text-white border-transparent'
                      : 'bg-[var(--admin-input-bg)] text-[var(--admin-muted)] border-[var(--admin-card-border)]'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            <button
              type='button'
              onClick={handleAutoTranslate}
              disabled={translating}
              className='btn-admin btn-admin-secondary text-xs py-1.5 px-3 flex items-center gap-2 whitespace-nowrap w-full sm:w-auto justify-center'
            >
              <IoSparkles
                className={
                  translating
                    ? 'animate-spin text-yellow-500'
                    : 'text-yellow-500'
                }
              />
              {translating ? 'Çevriliyor...' : 'Diğerlerine Dağıt'}
            </button>
          </div>

          <div className='space-y-4 animate-in fade-in'>
            <div>
              <label className='admin-label'>
                Hizmet Başlığı ({activeLang.toUpperCase()})
              </label>
              <input
                className='admin-input font-semibold'
                value={currentTrans.title}
                onChange={e => updateTrans('title', e.target.value)}
                required={activeLang === 'tr'}
              />
            </div>
            <div>
              <label className='admin-label'>
                Kısa Açıklama (Kartta görünür)
              </label>
              <textarea
                className='admin-textarea h-20'
                value={currentTrans.description}
                onChange={e => updateTrans('description', e.target.value)}
              />
            </div>
            <div>
              <label className='admin-label'>
                Detaylı İçerik (HTML destekler)
              </label>
              <textarea
                className='admin-textarea h-40 font-mono text-sm'
                value={currentTrans.content}
                onChange={e => updateTrans('content', e.target.value)}
                placeholder='<p>Paragraf...</p>'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className='p-5 border-t border-[var(--admin-card-border)] bg-[var(--admin-input-bg)] flex justify-end gap-3'>
        <button
          type='button'
          onClick={onClose}
          className='btn-admin btn-admin-secondary px-6'
        >
          İptal
        </button>
        <button
          type='submit'
          disabled={saving}
          className='btn-admin btn-admin-primary px-6 gap-2'
        >
          <IoSave /> {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      <MediaPickerModal
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        onSelect={url => updateMain('image_url', url)}
        bucketName='services'
      />
    </form>
  )
}
