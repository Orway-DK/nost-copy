'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { upsertProductAction, getProductDetailsAction } from '../actions' // Yeni action import edildi
import {
  IoImageOutline,
  IoCubeOutline,
  IoConstructOutline,
  IoLanguageOutline,
  IoSave,
  IoRefresh
} from 'react-icons/io5'
import ProductVariantsDynamic from './product-variants-dynamic'
import ProductLocalizations from './product-localizations'
import MediaPickerModal from '@/app/admin/(protected)/_components/MediaPickerModal'
import DynamicSchemaRender from '@/app/admin/(protected)/_components/DynamicSchemaRender'
import { ProductTemplate } from '@/types'

type Props = {
  isNew: boolean
  categories: string[]
  templates?: ProductTemplate[]
  initialProduct: any
  initialVariants: any[]
  initialLocalizations: any[]
}

export default function ProductForm ({
  isNew,
  categories,
  templates = [],
  initialProduct,
  initialVariants = [],
  initialLocalizations = []
}: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<
    'general' | 'variants' | 'localizations' | 'media'
  >('general')
  const [saving, setSaving] = useState(false)
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)

  // --- STATE YÖNETİMİ ---
  // Prop'tan gelen veriyi state'e alıyoruz ki sonradan fetch edip güncelleyebilelim
  const [variants, setVariants] = useState(initialVariants)
  const [localizations, setLocalizations] = useState(initialLocalizations)

  // Form State
  const [form, setForm] = useState({
    id: initialProduct?.id,
    template_id:
      initialProduct?.template_id ||
      (templates.length > 0 ? templates[0].id : null),
    name: initialProduct?.name || '',
    sku: initialProduct?.sku || '',
    category_slug: initialProduct?.category_slug || '',
    description: initialProduct?.description || '',
    active: initialProduct?.active ?? true,
    slug: initialProduct?.slug || '',
    main_image_url: initialProduct?.main_image_url || '',
    attributes: initialProduct?.attributes || {}
  })

  // Seçili şablonu bul
  const selectedTemplate = templates.find(
    t => t.id === Number(form.template_id)
  )

  // --- DATA FETCHING (SLIDEOVER İÇİN) ---
  useEffect(() => {
    // Eğer ürün yeniyse veya zaten varyantlar dolu geldiyse (SSR sayfası) gerek yok.
    // Ama SlideOver'da variants boş gelir, bu yüzden çekmemiz lazım.
    const shouldFetch = !isNew && form.id && initialVariants.length === 0

    if (shouldFetch) {
      const fetchData = async () => {
        setLoadingDetails(true)
        const res = await getProductDetailsAction(form.id)
        if (res.success && res.data) {
          setVariants(res.data.variants)
          setLocalizations(res.data.localizations)
        }
        setLoadingDetails(false)
      }
      fetchData()
    } else {
      // Eğer props dolu geldiyse state'i senkronize et (Edit sayfasından gelirse)
      setVariants(initialVariants)
      setLocalizations(initialLocalizations)
    }
  }, [form.id, isNew, initialVariants, initialLocalizations]) // Bağımlılıklar önemli

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!form.name || !form.category_slug)
      return alert('Ad ve Kategori zorunlu.')

    setSaving(true)
    const res = await upsertProductAction(form)
    setSaving(false)

    if (res.success) {
      alert('✅ ' + res.message)
      // Eğer yeni ürünse ve ID döndüyse state'i güncelle ki varyant ekleyebilelim
      if (isNew && res.data?.id) {
        setForm(prev => ({ ...prev, id: res.data.id }))
        // URL'i değiştirmeden SPA modunda kalabiliriz veya router.refresh yapabiliriz
        // SlideOver modunda olduğumuz için router.refresh ana listeyi günceller, bu iyi.
        router.refresh()
      } else {
        router.refresh()
      }
    } else {
      alert('❌ ' + res.message)
    }
  }

  return (
    <div className='grid gap-6 pb-20 relative'>
      {/* Loading Overlay (Detaylar Yüklenirken) */}
      {loadingDetails && (
        <div className='absolute top-0 right-0 p-2 bg-yellow-50 text-yellow-700 text-xs rounded z-10 flex items-center gap-2'>
          <IoRefresh className='animate-spin' /> Veriler yükleniyor...
        </div>
      )}

      {/* TABS */}
      <div
        className='border-b'
        style={{ borderColor: 'var(--admin-card-border)' }}
      >
        <nav className='flex space-x-6 overflow-x-auto'>
          {[
            { id: 'general', label: 'Genel Bilgiler', icon: IoCubeOutline },
            {
              id: 'variants',
              label: `Varyasyonlar (${variants.length})`,
              icon: IoConstructOutline,
              disabled: isNew && !form.id
            },
            {
              id: 'localizations',
              label: 'Çeviriler',
              icon: IoLanguageOutline,
              disabled: isNew && !form.id
            },
            {
              id: 'media',
              label: 'Medya',
              icon: IoImageOutline,
              disabled: isNew && !form.id
            }
          ].map((tab: any) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={`pb-3 flex items-center gap-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[var(--admin-accent)] text-[var(--admin-accent)]'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
              style={{ cursor: tab.disabled ? 'not-allowed' : 'pointer' }}
            >
              <tab.icon /> {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* --- GENEL SEKME --- */}
      {activeTab === 'general' && (
        <form onSubmit={handleSave} className='grid gap-8 animate-in fade-in'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* SOL: Temel Bilgiler */}
            <div className='lg:col-span-2 space-y-6'>
              {/* 1. Şablon Seçimi */}
              <div className='p-4 rounded-xl border border-[var(--admin-accent)]/20 bg-[var(--admin-accent)]/5'>
                <div className='flex justify-between items-center mb-2'>
                  <label className='text-xs font-bold text-[var(--admin-accent)] uppercase tracking-wide'>
                    Ürün Şablonu (Class)
                  </label>
                  <a
                    href='/admin/templates'
                    target='_blank'
                    className='text-xs hover:underline opacity-60'
                  >
                    + Yönet
                  </a>
                </div>
                <select
                  className='admin-select font-bold'
                  value={form.template_id || ''}
                  onChange={e =>
                    setForm({ ...form, template_id: Number(e.target.value) })
                  }
                >
                  <option value=''>-- Şablon Seçiniz --</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='admin-label'>Ürün Adı</label>
                  <input
                    className='admin-input'
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder='Örn: Seramik Kupa'
                  />
                </div>
                <div>
                  <label className='admin-label'>SKU (Stok Kodu)</label>
                  <input
                    className='admin-input'
                    value={form.sku}
                    onChange={e => setForm({ ...form, sku: e.target.value })}
                    placeholder='Örn: KUPA-001'
                  />
                </div>
              </div>

              <div>
                <label className='admin-label'>Açıklama</label>
                <textarea
                  className='admin-textarea'
                  rows={3}
                  value={form.description}
                  onChange={e =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              {/* 2. DİNAMİK GENEL ÖZELLİKLER (Attributes) */}
              {selectedTemplate && (
                <div className='mt-6 pt-6 border-t border-dashed border-[var(--admin-border)]'>
                  <h4 className='font-bold mb-4 opacity-80 text-sm'>
                    Genel Özellikler (Filtreleme)
                  </h4>
                  <DynamicSchemaRender
                    schema={selectedTemplate.schema}
                    values={form.attributes}
                    onChange={newAttrs =>
                      setForm({ ...form, attributes: newAttrs })
                    }
                  />
                </div>
              )}

              {/* 3. Diğer Ayarlar */}
              <div className='grid grid-cols-2 gap-4'>
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
                <div className='flex items-end pb-3'>
                  <div
                    className='flex items-center gap-2 cursor-pointer'
                    onClick={() => setForm({ ...form, active: !form.active })}
                  >
                    <input
                      type='checkbox'
                      checked={form.active}
                      onChange={e =>
                        setForm({ ...form, active: e.target.checked })
                      }
                      className='w-5 h-5 accent-[var(--admin-accent)] cursor-pointer'
                    />
                    <span className='text-sm select-none'>
                      Yayında (Active)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SAĞ: Medya (Kapak) */}
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

      {/* VARYANT SEKMESİ */}
      {activeTab === 'variants' && (
        <div className='animate-in fade-in'>
          <ProductVariantsDynamic
            productId={form.id!}
            initialVariants={variants} // State'ten gelen veri
            template={selectedTemplate || null}
          />
        </div>
      )}

      {/* ÇEVİRİ SEKMESİ */}
      {activeTab === 'localizations' && (
        <div className='animate-in fade-in'>
          <ProductLocalizations
            productId={form.id!}
            defaultName={form.name}
            defaultDescription={form.description}
            initialLocalizations={localizations} // State'ten gelen veri
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
