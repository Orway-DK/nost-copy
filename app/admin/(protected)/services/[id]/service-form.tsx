'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IoSave, IoArrowBack } from 'react-icons/io5'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
// DÜZELTME 1: Fonksiyon ismini doğru import et
import { upsertServiceAction } from '../actions'
import RichTextEditor from '@/app/admin/_components/RichTextEditor'

const LANGS = ['tr', 'en', 'de']

export default function ServiceForm ({ initialData }: { initialData: any }) {
  const router = useRouter()
  const [formData, setFormData] = useState(initialData)
  const [activeLang, setActiveLang] = useState('tr')
  const [saving, setSaving] = useState(false)

  const handleMainChange = (key: string, val: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: val }))
  }

  const handleTransChange = (key: string, val: any) => {
    setFormData((prev: any) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [activeLang]: {
          ...prev.translations[activeLang],
          [key]: val
        }
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    // DÜZELTME 2: Form verisini (Object) Server Action'ın beklediği Array formatına çevir
    const payload = {
      id: formData.id,
      slug: formData.slug,
      image_url: formData.image_url,
      active: formData.active,
      // Translations objesini {tr:{...}, en:{...}} -> [{lang_code:'tr', ...}, ...] dizisine çevir
      translations: Object.keys(formData.translations).map(lang => ({
        lang_code: lang,
        ...formData.translations[lang]
      }))
    }

    const res = await upsertServiceAction(payload)

    setSaving(false)
    if (res.success) {
      toast.success(res.message)
      router.refresh()
    } else {
      toast.error(res.message)
    }
  }

  // Mevcut dildeki veriyi al (Hata önlemek için boş obje fallback'i)
  const currentTrans = formData.translations?.[activeLang] || {
    title: '',
    description: '',
    content: ''
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-6 pb-20'>
      {/* TOOLBAR */}
      <div className='sticky top-0 z-20 bg-[var(--admin-card)] p-4 rounded-xl border border-[var(--admin-card-border)] shadow-sm flex justify-between items-center backdrop-blur-sm bg-opacity-95'>
        <div className='flex items-center gap-4'>
          <Link
            href='/admin/services'
            className='p-2 rounded-lg hover:bg-[var(--admin-input-bg)]'
          >
            <IoArrowBack size={20} />
          </Link>
          <div className='flex gap-1 bg-[var(--admin-input-bg)] p-1 rounded-lg'>
            {LANGS.map(l => (
              <button
                key={l}
                type='button'
                onClick={() => setActiveLang(l)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                  activeLang === l
                    ? 'bg-[var(--admin-card)] text-[var(--admin-fg)] shadow-sm'
                    : 'text-[var(--admin-muted)]'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <button
          type='submit'
          disabled={saving}
          className='btn-admin btn-admin-primary gap-2 px-6'
        >
          <IoSave /> {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      <div className='flex flex-col lg:flex-row gap-6'>
        {/* SOL: Ayarlar */}
        <div className='w-full lg:w-1/3 space-y-6'>
          <div className='bg-[var(--admin-card)] p-5 rounded-xl border border-[var(--admin-card-border)]'>
            <h3 className='text-sm font-bold mb-4 uppercase'>Genel Ayarlar</h3>
            <div className='space-y-4'>
              <div>
                <label className='text-xs font-medium uppercase mb-1 block'>
                  Slug (URL)
                </label>
                <input
                  type='text'
                  value={formData.slug || ''}
                  onChange={e => handleMainChange('slug', e.target.value)}
                  className='admin-input w-full text-sm font-mono'
                />
              </div>
              <div>
                <label className='text-xs font-medium uppercase mb-1 block'>
                  Hero Görsel URL
                </label>
                <input
                  type='text'
                  value={formData.image_url || ''}
                  onChange={e => handleMainChange('image_url', e.target.value)}
                  className='admin-input w-full text-sm'
                />
                {formData.image_url && (
                  <img
                    src={formData.image_url}
                    alt='Preview'
                    className='mt-2 w-full h-32 object-cover rounded border border-[var(--admin-card-border)]'
                  />
                )}
              </div>
              <div className='flex items-center gap-2 pt-2'>
                <input
                  type='checkbox'
                  checked={formData.active}
                  onChange={e => handleMainChange('active', e.target.checked)}
                  className='w-4 h-4 rounded border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--primary)]'
                />
                <label className='text-sm font-medium'>Hizmet Aktif</label>
              </div>
            </div>
          </div>
        </div>

        {/* SAĞ: İçerik */}
        <div className='w-full lg:w-2/3'>
          <div className='bg-[var(--admin-card)] p-5 rounded-xl border border-[var(--admin-card-border)] h-full min-h-[500px]'>
            <h3 className='text-sm font-bold mb-4 uppercase'>
              İçerik ({activeLang.toUpperCase()})
            </h3>
            <div className='space-y-4'>
              <div>
                <label className='text-xs font-medium uppercase mb-1 block'>
                  Başlık
                </label>
                <input
                  type='text'
                  value={currentTrans.title || ''}
                  onChange={e => handleTransChange('title', e.target.value)}
                  className='admin-input w-full text-lg font-bold'
                />
              </div>
              <div>
                <label className='text-xs font-medium uppercase mb-1 block'>
                  Kısa Açıklama (SEO)
                </label>
                <textarea
                  rows={2}
                  value={currentTrans.description || ''}
                  onChange={e =>
                    handleTransChange('description', e.target.value)
                  }
                  className='admin-input w-full text-sm'
                />
              </div>
              <div>
                <label className='text-xs font-medium uppercase mb-2 block'>
                  Detaylı İçerik
                </label>
                {/* Rich Text Editor Bileşeni */}
                <RichTextEditor
                  value={currentTrans.content || ''}
                  onChange={val => handleTransChange('content', val)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
