'use client'

import { useState, useEffect } from 'react'
import { IoSave, IoSparkles, IoTrashBinOutline } from 'react-icons/io5'
import { toast } from 'react-hot-toast'
import { upsertMenuItemAction, deleteMenuItemAction } from '../actions'
import { translateTextAction } from '@/app/actions/translate'

const LANGS = ['tr', 'en', 'de']

// Props güncellendi: onClose ve onSuccess eklendi
export default function MenuForm ({
  initialData,
  parentOptions,
  onClose,
  onSuccess
}: {
  initialData: any
  parentOptions: any[]
  onClose: () => void
  onSuccess: () => void
}) {
  // Form State
  const [formData, setFormData] = useState({
    id: null,
    parent_id: 0,
    type: 'link',
    label: { tr: '', en: '', de: '' },
    url: '',
    sort_order: 0,
    is_active: true
  })

  // Modal açıldığında veriyi doldur veya sıfırla
  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        parent_id: initialData.parent_id || 0,
        type: initialData.type || 'link',
        label: initialData.label || { tr: '', en: '', de: '' },
        url: initialData.url || '',
        sort_order: initialData.sort_order || 0,
        is_active: initialData.is_active ?? true
      })
    } else {
      // Yeni kayıt için sıfırla
      setFormData({
        id: null,
        parent_id: 0,
        type: 'link',
        label: { tr: '', en: '', de: '' },
        url: '',
        sort_order: 0,
        is_active: true
      })
    }
  }, [initialData])

  const [activeLang, setActiveLang] = useState('tr')
  const [saving, setSaving] = useState(false)
  const [translating, setTranslating] = useState(false)

  // Kendisini parent olarak seçemesin
  const availableParents = parentOptions.filter(
    i => i.id !== formData.id && i.type !== 'link'
  )

  const handleLabelChange = (val: string) => {
    setFormData(prev => ({
      ...prev,
      label: { ...prev.label, [activeLang]: val }
    }))
  }

  const handleAutoTranslate = async () => {
    const currentText = (formData.label as any)[activeLang]
    if (!currentText) {
      toast.error('Önce bir metin yazmalısınız.')
      return
    }

    setTranslating(true)
    const newLabels = { ...formData.label } as any

    try {
      const targetLangs = LANGS.filter(l => l !== activeLang)
      await Promise.all(
        targetLangs.map(async lang => {
          const translated = await translateTextAction(currentText, lang)
          newLabels[lang] = translated
        })
      )
      setFormData(prev => ({ ...prev, label: newLabels }))
      toast.success('Çevrildi! ✨')
    } catch (error) {
      toast.error('Çeviri hatası.')
    } finally {
      setTranslating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await upsertMenuItemAction(formData)
    setSaving(false)

    if (res.success) {
      toast.success(res.message)
      onSuccess() // Sayfayı yenile ve modalı kapat
    } else {
      toast.error(res.message)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Silmek istediğinize emin misiniz?')) return
    if (!formData.id) return

    const res = await deleteMenuItemAction(formData.id)
    if (res.success) {
      toast.success(res.message)
      onSuccess()
    } else {
      toast.error(res.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
      {/* HEADER: Dil Seçimi */}
      <div className='flex justify-between items-center border-b border-[var(--admin-card-border)] pb-4'>
        <div className='flex gap-1 bg-[var(--admin-input-bg)] p-1 rounded-lg'>
          {LANGS.map(l => (
            <button
              key={l}
              type='button'
              onClick={() => setActiveLang(l)}
              className={`px-3 py-1 text-xs font-bold uppercase transition-all rounded ${
                activeLang === l
                  ? 'bg-white dark:bg-black/20 text-[var(--admin-fg)] shadow-sm'
                  : 'text-[var(--admin-muted)]'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        {formData.id && (
          <button
            type='button'
            onClick={handleDelete}
            className='text-red-500 hover:text-red-700 p-2'
            title='Sil'
          >
            <IoTrashBinOutline size={18} />
          </button>
        )}
      </div>

      {/* FORM İÇERİĞİ */}
      <div className='space-y-4'>
        {/* Etiket + Auto Translate */}
        <div>
          <div className='flex justify-between items-center mb-1'>
            <label className='text-xs font-medium uppercase text-[var(--admin-muted)]'>
              İsim ({activeLang.toUpperCase()})
            </label>
            <button
              type='button'
              onClick={handleAutoTranslate}
              disabled={translating || !(formData.label as any)[activeLang]}
              className='text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 disabled:opacity-50'
            >
              <IoSparkles /> {translating ? '...' : 'Çevir'}
            </button>
          </div>
          <input
            type='text'
            required
            value={(formData.label as any)[activeLang] || ''}
            onChange={e => handleLabelChange(e.target.value)}
            className='admin-input w-full font-bold'
            placeholder='Örn: Hakkımızda'
            autoFocus
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          {/* URL */}
          <div>
            <label className='text-xs font-medium uppercase mb-1 block text-[var(--admin-muted)]'>
              URL / Slug
            </label>
            <input
              type='text'
              value={formData.url || ''}
              onChange={e => setFormData({ ...formData, url: e.target.value })}
              className='admin-input w-full text-sm'
              placeholder='about-us'
            />
          </div>

          {/* Sıra */}
          <div>
            <label className='text-xs font-medium uppercase mb-1 block text-[var(--admin-muted)]'>
              Sıra No
            </label>
            <input
              type='number'
              value={formData.sort_order}
              onChange={e =>
                setFormData({
                  ...formData,
                  sort_order: parseInt(e.target.value)
                })
              }
              className='admin-input w-full text-sm'
            />
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          {/* Tip */}
          <div>
            <label className='text-xs font-medium uppercase mb-1 block text-[var(--admin-muted)]'>
              Tip
            </label>
            <select
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value })}
              className='admin-input w-full text-sm'
            >
              <option value='link'>Link</option>
              <option value='dropdown'>Dropdown</option>
            </select>
          </div>

          {/* Parent */}
          <div>
            <label className='text-xs font-medium uppercase mb-1 block text-[var(--admin-muted)]'>
              Üst Menü
            </label>
            <select
              value={formData.parent_id}
              onChange={e =>
                setFormData({
                  ...formData,
                  parent_id: parseInt(e.target.value)
                })
              }
              className='admin-input w-full text-sm'
            >
              <option value={0}>-- Ana Menü --</option>
              {availableParents.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {(p.label as any)?.tr || 'İsimsiz'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Aktiflik */}
        <div className='flex items-center gap-2'>
          <input
            type='checkbox'
            id='is_active'
            checked={formData.is_active}
            onChange={e =>
              setFormData({ ...formData, is_active: e.target.checked })
            }
            className='w-4 h-4 rounded border-gray-300 text-[var(--primary)]'
          />
          <label htmlFor='is_active' className='text-sm text-[var(--admin-fg)]'>
            Aktif
          </label>
        </div>
      </div>

      {/* FOOTER: Butonlar */}
      <div className='flex justify-end gap-3 border-t border-[var(--admin-card-border)] pt-4 mt-2'>
        <button
          type='button'
          onClick={onClose}
          className='px-4 py-2 text-sm font-medium text-[var(--admin-muted)] hover:text-[var(--admin-fg)] transition-colors'
        >
          İptal
        </button>
        <button
          type='submit'
          disabled={saving}
          className='btn-admin btn-admin-primary px-6 py-2'
        >
          <IoSave className='mr-2' /> {saving ? '...' : 'Kaydet'}
        </button>
      </div>
    </form>
  )
}
