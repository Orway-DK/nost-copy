'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IoAdd, IoSettingsOutline, IoShirtOutline } from 'react-icons/io5'
import SlideOver from '@/app/admin/_components/SlideOver'
import ProductListClient from './product-list-client'
import ProductForm from './[id]/product-form'
import TemplateBuilder from '../templates/template-builder'
import { ProductTemplate } from '@/types'

interface Props {
  products: any[]
  templates: ProductTemplate[]
}

type ViewMode = 'LIST' | 'NEW_PRODUCT' | 'EDIT_PRODUCT' | 'TEMPLATES'

export default function ProductManager ({ products, templates }: Props) {
  const router = useRouter()
  const [view, setView] = useState<ViewMode>('LIST')
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  )
  const selectedProduct = products.find(p => p.id === selectedProductId)

  const closePanel = () => {
    setView('LIST')
    setSelectedProductId(null)
    router.refresh()
  }

  return (
    // FULL HEIGHT CONTAINER: h-full flex flex-col
    <div className='h-full flex flex-col gap-4'>
      {/* ÜST BAR (Sabit) */}
      <div className='shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-admin-card p-3 rounded-admin border border-admin-card-border shadow-sm'>
        <div>
          <h1 className='text-admin-lg font-bold flex items-center gap-2'>
            <IoShirtOutline className='text-admin-accent' />
            Ürün Yönetimi
          </h1>
        </div>

        <div className='flex gap-2'>
          <button
            onClick={() => setView('TEMPLATES')}
            className='btn-admin btn-admin-secondary text-admin-tiny'
          >
            <IoSettingsOutline /> Şablonlar
          </button>

          <button
            onClick={() => {
              setSelectedProductId(null)
              setView('NEW_PRODUCT')
            }}
            className='btn-admin btn-admin-primary text-admin-tiny'
          >
            <IoAdd size={16} /> Yeni Ekle
          </button>
        </div>
      </div>

      {/* LİSTE ALANI (Esnek ve Scrollable) */}
      {/* flex-1 ve overflow-hidden diyerek bu div'in taşmasını engelliyoruz */}
      <div className='flex-1 bg-admin-card rounded-admin border border-admin-card-border overflow-hidden flex flex-col'>
        {/* ProductListClient artık yüksekliği dolduracak şekilde ayarlandı */}
        <ProductListClient
          initialProducts={products}
          onEdit={id => {
            setSelectedProductId(id)
            setView('EDIT_PRODUCT')
          }}
        />
      </div>

      {/* SLIDE OVERS (Modallar) - Bunlar zaten fixed pozisyonda olduğu için sorun yok */}
      <SlideOver
        isOpen={view === 'NEW_PRODUCT' || view === 'EDIT_PRODUCT'}
        onClose={closePanel}
        title={
          view === 'NEW_PRODUCT'
            ? 'Yeni Ürün Ekle'
            : `Ürünü Düzenle #${selectedProductId}`
        }
        width='2xl'
      >
        {(view === 'NEW_PRODUCT' ||
          (view === 'EDIT_PRODUCT' && selectedProduct)) && (
          <ProductForm
            isNew={view === 'NEW_PRODUCT'}
            categories={[]}
            templates={templates}
            initialProduct={selectedProduct || null}
            initialVariants={[]}
            initialLocalizations={[]}
          />
        )}
      </SlideOver>

      <SlideOver
        isOpen={view === 'TEMPLATES'}
        onClose={closePanel}
        title='Ürün Şablonları'
        width='2xl'
      >
        <div className='space-y-8'>
          <TemplateBuilder />
        </div>
      </SlideOver>
    </div>
  )
}
