// C:\Projeler\nost-copy\app\admin\(protected)\products\[id]\product-form.tsx
'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { upsertProductAction } from '../actions'
import {
  IoImageOutline,
  IoCubeOutline,
  IoConstructOutline,
  IoLanguageOutline,
  IoSave
} from 'react-icons/io5'
import ProductVariants from './product-variants'
import ProductLocalizations from './product-localizations'
import MediaPickerModal from '@/app/admin/(protected)/_components/MediaPickerModal'
import ProductAttributeEditor from './product-attribute-editor' // YENİ IMPORT

type Props = {
  isNew: boolean
  categories: string[]
  initialProduct: any
  initialVariants: any[]
  initialLocalizations: any[]
}

export default function ProductForm ({
  isNew,
  categories,
  initialProduct,
  initialVariants,
  initialLocalizations
}: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<
    'general' | 'variants' | 'localizations' | 'media'
  >('general')
  const [saving, setSaving] = useState(false)
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)

  // Form State
  const [form, setForm] = useState({
    id: initialProduct?.id,
    name: initialProduct?.name || '',
    sku: initialProduct?.sku || '',
    category_slug: initialProduct?.category_slug || '',
    description: initialProduct?.description || '',
    size: initialProduct?.size || '35x50',
    min_quantity: initialProduct?.min_quantity || 20,
    media_base_path:
      initialProduct?.media_base_path || '/public/media/products',
    active: initialProduct?.active ?? true,
    slug: initialProduct?.slug || '',
    main_image_url: initialProduct?.main_image_url || '', // Boş bırak, Image component aşağıda handle edecek
    attributes: initialProduct?.attributes || {} // YENİ: attributes eklendi
  })

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!form.name || !form.category_slug)
      return alert('Ad ve Kategori zorunlu.')

    setSaving(true)
    const res = await upsertProductAction(form)
    setSaving(false)

    if (res.success) {
      alert('✅ ' + res.message)
      if (isNew && res.data?.id) {
        router.replace(`/admin/products/${res.data.id}`)
      } else {
        router.refresh()
      }
    } else {
      alert('❌ ' + res.message)
    }
  }

  return (
    <div className='grid gap-6 pb-20'>
      {/* TABS */}
      <div
        className='border-b'
        style={{ borderColor: 'var(--admin-card-border)' }}
      >
        <nav className='flex space-x-6'>
          {[
            { id: 'general', label: 'Genel Bilgiler', icon: IoCubeOutline },
            {
              id: 'variants',
              label: 'Varyasyonlar',
              icon: IoConstructOutline,
              disabled: isNew
            },
            {
              id: 'localizations',
              label: 'Çeviriler',
              icon: IoLanguageOutline,
              disabled: isNew
            },
            {
              id: 'media',
              label: 'Medya',
              icon: IoImageOutline,
              disabled: isNew
            }
          ].map((tab: any) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={`pb-3 flex items-center gap-2 font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-[var(--admin-accent)]'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
              style={{
                color:
                  activeTab === tab.id
                    ? 'var(--admin-accent)'
                    : 'var(--admin-muted)',
                cursor: tab.disabled ? 'not-allowed' : 'pointer'
              }}
            >
              <tab.icon /> {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* --- GENEL SEKME --- */}
      {activeTab === 'general' && (
        <form
          onSubmit={handleSave}
          className='card-admin grid gap-8 animate-in fade-in'
        >
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* SOL: Inputs */}
            <div className='lg:col-span-2 space-y-6'>
              {/* ... INPUTLAR AYNI KALDI ... */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='admin-label'>Ürün Adı</label>
                  <input
                    className='admin-input'
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className='admin-label'>SKU</label>
                  <input
                    className='admin-input'
                    value={form.sku}
                    onChange={e => setForm({ ...form, sku: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className='admin-label'>Açıklama</label>
                <textarea
                  className='admin-textarea'
                  rows={4}
                  value={form.description}
                  onChange={e =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              <div className='grid grid-cols-3 gap-4'>
                <div>
                  <label className='admin-label'>Kategori</label>
                  <select
                    className='admin-select'
                    value={form.category_slug}
                    onChange={e =>
                      setForm({ ...form, category_slug: e.target.value })
                    }
                  >
                    <option value=''>Seçiniz</option>
                    {categories.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className='admin-label'>Boyut</label>
                  <input
                    className='admin-input'
                    value={form.size}
                    onChange={e => setForm({ ...form, size: e.target.value })}
                  />
                </div>
                <div>
                  <label className='admin-label'>Min. Adet</label>
                  <input
                    type='number'
                    className='admin-input'
                    value={form.min_quantity}
                    onChange={e =>
                      setForm({ ...form, min_quantity: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div>
                <ProductAttributeEditor
                  initialAttributes={form.attributes}
                  onChange={newAttrs =>
                    setForm({ ...form, attributes: newAttrs })
                  }
                />
              </div>

              <div
                className='flex items-center gap-3 border p-3 rounded'
                style={{ borderColor: 'var(--admin-input-border)' }}
              >
                <input
                  type='checkbox'
                  checked={form.active}
                  onChange={e => setForm({ ...form, active: e.target.checked })}
                  className='w-5 h-5 accent-[var(--admin-accent)]'
                />
                <label>Yayında (Active)</label>
              </div>
            </div>

            {/* SAĞ: Medya (GÖRSEL ALANI) */}
            <div>
              <div
                className='p-4 rounded-xl border'
                style={{
                  backgroundColor: 'var(--admin-input-bg)',
                  borderColor: 'var(--admin-card-border)'
                }}
              >
                <label className='admin-label mb-2 block'>Kapak Görseli</label>
                <div
                  className='relative aspect-square w-full bg-[var(--admin-card)] rounded-lg overflow-hidden border flex items-center justify-center group'
                  style={{ borderColor: 'var(--admin-card-border)' }}
                >
                  {/* Görseli direkt form.main_image_url'den alıyoruz */}
                  {form.main_image_url ? (
                    <Image
                      src={form.main_image_url}
                      alt='cover'
                      fill
                      className='object-contain p-2'
                      unoptimized
                    />
                  ) : (
                    <div className='text-gray-400 flex flex-col items-center'>
                      <IoImageOutline size={40} />
                      <span className='text-xs mt-2'>Görsel Yok</span>
                    </div>
                  )}

                  <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                    <button
                      type='button'
                      onClick={() => setIsMediaModalOpen(true)}
                      className='btn-admin btn-admin-secondary text-xs shadow-lg'
                    >
                      Değiştir
                    </button>
                  </div>
                </div>
                <div
                  className='mt-2 text-xs opacity-50 truncate'
                  title={form.main_image_url}
                >
                  {form.main_image_url
                    ? form.main_image_url.split('/').pop()
                    : 'Seçili değil'}
                </div>
              </div>
            </div>
          </div>

          <div
            className='flex justify-end pt-4 border-t'
            style={{ borderColor: 'var(--admin-card-border)' }}
          >
            <button
              type='submit'
              disabled={saving}
              className='btn-admin btn-admin-primary px-8'
            >
              <IoSave size={18} className='mr-2' />
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      )}

      {/* Diğer sekmeler aynı... */}
      {activeTab === 'variants' && (
        <div className='animate-in fade-in'>
          <ProductVariants
            productId={form.id!}
            initialVariants={initialVariants}
          />
        </div>
      )}

      {activeTab === 'localizations' && (
        <div className='animate-in fade-in'>
          <ProductLocalizations
            productId={form.id!}
            defaultName={form.name}
            defaultDescription={form.description}
            initialLocalizations={initialLocalizations}
          />
        </div>
      )}

      <MediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={url => setForm({ ...form, main_image_url: url })}
        bucketName='products'
      />
    </div>
  )
}
