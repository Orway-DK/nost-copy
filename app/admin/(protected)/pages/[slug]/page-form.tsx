'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IoSave, IoArrowBack } from 'react-icons/io5'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { updatePageAction } from '../actions'
import RichTextEditor from '@/app/admin/_components/RichTextEditor' // Önceki adımda oluşturduğumuz editör

const LANGS = ['tr', 'en', 'de']

export default function PageForm ({ initialData }: { initialData: any }) {
  const router = useRouter()
  const [formData, setFormData] = useState(initialData)
  const [activeLang, setActiveLang] = useState('tr')
  const [saving, setSaving] = useState(false)

  // Input Change
  const handleMainChange = (key: string, val: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: val }))
  }

  // Translation Change
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

    // Server Action Çağır
    const res = await updatePageAction(formData.id, formData)

    setSaving(false)

    if (res.success) {
      toast.success(res.message)
      router.refresh()
    } else {
      toast.error(res.message)
    }
  }

  const currentTrans = formData.translations[activeLang] || {
    title: '',
    content: ''
  }

  return (
    <form onSubmit={handleSubmit} className='h-full flex flex-col gap-6'>
      {/* TOOLBAR */}
      <div className='sticky top-0 z-20 bg-[var(--admin-card)] p-4 rounded-xl border border-[var(--admin-card-border)] shadow-sm flex justify-between items-center backdrop-blur-sm bg-opacity-95'>
        <div className='flex items-center gap-4'>
          <Link
            href='/admin/pages'
            className='p-2 rounded-lg hover:bg-[var(--admin-input-bg)] text-[var(--admin-muted)]'
          >
            <IoArrowBack size={20} />
          </Link>

          {/* Dil Seçimi */}
          <div className='flex gap-1 bg-[var(--admin-input-bg)] p-1 rounded-lg'>
            {LANGS.map(l => (
              <button
                key={l}
                type='button'
                onClick={() => setActiveLang(l)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                  activeLang === l
                    ? 'bg-[var(--admin-card)] text-[var(--admin-fg)] shadow-sm'
                    : 'text-[var(--admin-muted)] hover:text-[var(--admin-fg)]'
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
          <IoSave />
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      <div className='flex flex-col lg:flex-row gap-6 pb-20'>
        {/* SOL: Genel Ayarlar */}
        <div className='w-full lg:w-1/3 space-y-6'>
          <div className='bg-[var(--admin-card)] p-5 rounded-xl border border-[var(--admin-card-border)]'>
            <h3 className='text-sm font-bold text-[var(--admin-fg)] mb-4 uppercase tracking-wider'>
              Genel Ayarlar
            </h3>

            <div className='space-y-4'>
              <div>
                <label className='text-xs font-medium text-[var(--admin-muted)] uppercase mb-1 block'>
                  Hero Görsel URL
                </label>
                <input
                  type='text'
                  value={formData.image_url || ''}
                  onChange={e => handleMainChange('image_url', e.target.value)}
                  className='admin-input w-full text-sm'
                  placeholder='https://...'
                />
                {formData.image_url && (
                  <div className='mt-2 relative h-32 w-full rounded-lg overflow-hidden border border-[var(--admin-card-border)]'>
                    <img
                      src={formData.image_url}
                      alt='Preview'
                      className='w-full h-full object-cover'
                    />
                  </div>
                )}
              </div>

              <div className='flex items-center gap-3 pt-2'>
                <input
                  type='checkbox'
                  id='isActive'
                  checked={formData.active}
                  onChange={e => handleMainChange('active', e.target.checked)}
                  className='w-4 h-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]'
                />
                <label
                  htmlFor='isActive'
                  className='text-sm font-medium text-[var(--admin-fg)] cursor-pointer'
                >
                  Sayfa Yayında (Aktif)
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* SAĞ: İçerik Editörü */}
        <div className='w-full lg:w-2/3'>
          <div className='bg-[var(--admin-card)] p-5 rounded-xl border border-[var(--admin-card-border)] h-full min-h-[500px]'>
            <div className='mb-4 flex justify-between items-center'>
              <h3 className='text-sm font-bold text-[var(--admin-fg)] uppercase tracking-wider'>
                İçerik ({activeLang.toUpperCase()})
              </h3>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='text-xs font-medium text-[var(--admin-muted)] uppercase mb-1 block'>
                  Sayfa Başlığı
                </label>
                <input
                  type='text'
                  value={currentTrans.title || ''}
                  onChange={e => handleTransChange('title', e.target.value)}
                  className='admin-input w-full text-lg font-bold'
                  placeholder='Başlık giriniz...'
                />
              </div>

              <div>
                <label className='text-xs font-medium text-[var(--admin-muted)] uppercase mb-2 block'>
                  Detaylı İçerik
                </label>
                {/* Rich Text Editor */}
                <div className='text-[var(--admin-fg)]'>
                  <RichTextEditor
                    value={currentTrans.content || ''}
                    onChange={val => handleTransChange('content', val)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
