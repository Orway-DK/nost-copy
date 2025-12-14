// C:\Projeler\nost-copy\app\admin\(protected)\showcase\make-it-easier\slider-section-form.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { saveSliderPartAction } from './actions'
import { translateTextAction } from '@/app/admin/actions'
import {
  IoSave,
  IoAdd,
  IoTrash,
  IoSparkles,
  IoImageOutline
} from 'react-icons/io5'
import MediaPickerModal from '@/app/admin/(protected)/_components/MediaPickerModal'
import { toast } from 'react-hot-toast'

const LANGS = ['tr', 'en', 'de']

const getImageUrl = (path: string | null) => {
  if (!path) return null
  if (path.startsWith('http') || path.startsWith('/')) return path
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sliders/${path}`
}

export default function SliderSectionForm ({
  initialData
}: {
  initialData: any
}) {
  const router = useRouter()
  const [activeLang, setActiveLang] = useState('tr')
  const [saving, setSaving] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [isMediaOpen, setIsMediaOpen] = useState(false)

  const [form, setForm] = useState(() => {
    let links: string[] = []
    try {
      links =
        typeof initialData?.image_links === 'string'
          ? JSON.parse(initialData.image_links)
          : initialData?.image_links || []
    } catch {
      links = []
    }

    const translations = LANGS.map(l => {
      const found = initialData?.make_it_easier_slider_translations?.find(
        (t: any) => t.lang_code === l
      )
      return {
        lang_code: l,
        id: found?.id,
        title: found?.title || '',
        text: found?.text || '',
        button_name: found?.button_name || '',
        button_link: found?.button_link || ''
      }
    })

    return {
      id: initialData?.id,
      image_links: links,
      translations
    }
  })

  const currentTrans = form.translations.find(t => t.lang_code === activeLang)!

  const updateTrans = (key: string, val: any) => {
    setForm(prev => ({
      ...prev,
      translations: prev.translations.map(t =>
        t.lang_code === activeLang ? { ...t, [key]: val } : t
      )
    }))
  }

  const addImage = (url: string) => {
    setForm(prev => ({ ...prev, image_links: [...prev.image_links, url] }))
  }

  const removeImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      image_links: prev.image_links.filter((_, i) => i !== index)
    }))
  }

  const handleAutoTranslate = async () => {
    if (!currentTrans.title && !currentTrans.text) {
      toast.error(`Lütfen önce ${activeLang.toUpperCase()} içeriğini doldurun.`)
      return
    }

    if (
      !confirm(
        `Mevcut (${activeLang.toUpperCase()}) içerik kaynak alınarak diğer diller otomatik doldurulacak. Onaylıyor musunuz?`
      )
    )
      return

    setTranslating(true)
    const loadingToast = toast.loading('Çeviriler yapılıyor...')

    try {
      const newTranslations = [...form.translations]
      const textFields = ['title', 'text', 'button_name']

      const tasks = newTranslations.map(async (target, index) => {
        if (target.lang_code === activeLang) return

        for (const field of textFields) {
          // @ts-ignore
          const sourceText = currentTrans[field]
          if (sourceText && sourceText.trim() !== '') {
            const res = await translateTextAction(
              sourceText,
              target.lang_code,
              activeLang
            )
            if (res.success && res.text) {
              // @ts-ignore
              newTranslations[index][field] = res.text
            }
          }
        }

        if (currentTrans.button_link && !newTranslations[index].button_link) {
          newTranslations[index].button_link = currentTrans.button_link
        }
      })

      await Promise.all(tasks)
      setForm(prev => ({ ...prev, translations: newTranslations }))
      toast.success('Çeviriler tamamlandı!', { id: loadingToast })
    } catch (error) {
      console.error(error)
      toast.error('Çeviri sırasında hata oluştu.', { id: loadingToast })
    } finally {
      setTranslating(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    const promise = saveSliderPartAction(form)

    toast.promise(promise, {
      loading: 'Kaydediliyor...',
      success: res => {
        if (!res.success) throw new Error(res.message)
        router.refresh()
        return res.message
      },
      error: err => err.message
    })

    try {
      await promise
    } finally {
      setSaving(false)
    }
  }

  return (
    // DÜZELTME: p-3 (320px için daha dar padding) ve w-full
    <div className='card-admin p-3 md:p-6 space-y-6 pb-20 w-full'>
      {/* Header */}
      <div
        className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4'
        style={{ borderColor: 'var(--admin-card-border)' }}
      >
        <div>
          <h3
            className='font-semibold text-lg'
            style={{ color: 'var(--admin-fg)' }}
          >
            Kampanya & Slider
          </h3>
          <p className='text-xs text-[var(--admin-muted)]'>
            Slider alanını buradan yönetebilirsiniz.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className='btn-admin btn-admin-primary px-6 gap-2 w-full sm:w-auto justify-center'
        >
          <IoSave /> Kaydet
        </button>
      </div>

      {/* Çeviri Alanı */}
      <div className='space-y-4 w-full'>
        {/* Dil Seçimi ve Çevir Butonu */}
        <div className='flex flex-col gap-3 w-full'>
          {/* Diller */}
          <div className='w-full overflow-x-auto pb-1 scrollbar-hide'>
            <div className='flex gap-2 min-w-max'>
              {LANGS.map(l => (
                <button
                  key={l}
                  onClick={() => setActiveLang(l)}
                  className={`px-4 py-2 text-sm font-bold rounded transition-colors whitespace-nowrap ${
                    activeLang === l
                      ? 'bg-[var(--admin-accent)] text-[var(--admin-bg)]'
                      : 'bg-[var(--admin-input-bg)] text-[var(--admin-muted)]'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Çevir Butonu */}
          {/* DÜZELTME: whitespace-normal ve h-auto eklendi (Satır atlayabilsin) */}
          <button
            onClick={handleAutoTranslate}
            disabled={translating}
            className='btn-admin btn-admin-secondary text-xs py-3 px-3 flex items-center justify-center gap-2 w-full h-auto whitespace-normal leading-tight text-center'
            title={`Mevcut (${activeLang.toUpperCase()}) içeriği diğer dillere çevir`}
          >
            <IoSparkles
              className={
                translating
                  ? 'animate-spin text-yellow-500 shrink-0'
                  : 'text-yellow-500 shrink-0'
              }
            />
            <span>
              {translating ? 'Çevriliyor...' : 'İçeriği Diğer Dillere Dağıt'}
            </span>
          </button>
        </div>

        {/* Form Alanları */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-2'>
          <div className='space-y-4 min-w-0'>
            <div>
              <label className='admin-label'>Başlık</label>
              <input
                className='admin-input w-full min-w-0'
                value={currentTrans.title}
                onChange={e => updateTrans('title', e.target.value)}
              />
            </div>
            <div>
              <label className='admin-label'>Metin</label>
              <textarea
                className='admin-textarea h-32 w-full min-w-0'
                value={currentTrans.text}
                onChange={e => updateTrans('text', e.target.value)}
              />
            </div>
          </div>
          <div className='space-y-4 min-w-0'>
            <div>
              <label className='admin-label'>Buton Metni</label>
              <input
                className='admin-input w-full min-w-0'
                value={currentTrans.button_name}
                onChange={e => updateTrans('button_name', e.target.value)}
              />
            </div>
            <div>
              <label className='admin-label'>Buton Linki</label>
              <input
                className='admin-input w-full min-w-0'
                value={currentTrans.button_link}
                onChange={e => updateTrans('button_link', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Slider Görselleri */}
      <div
        className='pt-6 border-t w-full'
        style={{ borderColor: 'var(--admin-card-border)' }}
      >
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3'>
          <label className='admin-label text-base font-semibold'>
            Slider Görselleri
          </label>
          <button
            onClick={() => setIsMediaOpen(true)}
            className='btn-admin btn-admin-secondary text-sm gap-2 w-full sm:w-auto justify-center'
          >
            <IoAdd /> Görsel Ekle
          </button>
        </div>

        {/* Grid - Mobilde 2 Kolon, Gap küçültüldü */}
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4'>
          {form.image_links.map((link, idx) => {
            const url = getImageUrl(link)
            return (
              <div
                key={idx}
                className='relative aspect-square rounded-lg border overflow-hidden group bg-[var(--admin-input-bg)] w-full'
                style={{ borderColor: 'var(--admin-input-border)' }}
              >
                {url ? (
                  <Image
                    src={url}
                    alt='slider'
                    fill
                    className='object-cover'
                    unoptimized
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center text-xs opacity-50 text-[var(--admin-muted)]'>
                    <IoImageOutline size={24} />
                  </div>
                )}
                {/* Mobilde silme butonu her zaman görünür olsun veya dokununca */}
                <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                  <button
                    onClick={() => removeImage(idx)}
                    className='text-white hover:text-red-400 p-2 rounded-full hover:bg-white/10 transition-colors'
                  >
                    <IoTrash size={20} />
                  </button>
                </div>
              </div>
            )
          })}
          {form.image_links.length === 0 && (
            <div
              className='col-span-full py-8 text-center text-[var(--admin-muted)] border border-dashed rounded-lg'
              style={{ borderColor: 'var(--admin-input-border)' }}
            >
              Henüz görsel eklenmemiş.
            </div>
          )}
        </div>
      </div>

      <MediaPickerModal
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        onSelect={url => addImage(url)}
        bucketName='sliders'
      />
    </div>
  )
}
