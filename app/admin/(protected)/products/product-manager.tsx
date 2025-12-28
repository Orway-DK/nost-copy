'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IoAdd, IoShirtOutline } from 'react-icons/io5'
import SlideOver from '@/app/admin/_components/SlideOver'
import ProductListClient from './product-list-client'
import ProductForm from './[id]/product-form'
import { ProductTemplate, Material } from '@/types'

interface CategoryOption {
  name: string;
  slug: string;
}

interface Props {
  products: any[]
  templates: ProductTemplate[]
  categories: CategoryOption[]
  materials: Material[]
}

type ViewMode = 'LIST' | 'NEW_PRODUCT' | 'EDIT_PRODUCT'

export default function ProductManager({ products, templates, categories ,materials}: Props) {
  const router = useRouter()
  const [view, setView] = useState<ViewMode>('LIST')
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  
  const selectedProduct = products.find(p => p.id === selectedProductId)

  const closePanel = () => {
    setView('LIST')
    setSelectedProductId(null)
    router.refresh()
  }

  return (
    <div className='h-full flex flex-col gap-4'>
      {/* ÜST BAR */}
      <div className='shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-admin-card p-3 rounded-admin border border-admin-card-border shadow-sm'>
        <div>
          <h1 className='text-admin-lg font-bold flex items-center gap-2'>
            <IoShirtOutline className='text-admin-accent' />
            Ürün Yönetimi
          </h1>
        </div>

        <button
          onClick={() => {
            setSelectedProductId(null)
            setView('NEW_PRODUCT')
          }}
          className='btn-admin btn-admin-primary text-admin-tiny'
        >
          <IoAdd size={16} /> Yeni Ürün Ekle
        </button>
      </div>

      {/* LİSTE ALANI */}
      <div className='flex-1 bg-admin-card rounded-admin border border-admin-card-border overflow-hidden flex flex-col'>
        <ProductListClient
          initialProducts={products}
          onEdit={id => {
            setSelectedProductId(id)
            setView('EDIT_PRODUCT')
          }}
        />
      </div>

      {/* SLIDE OVER (FORM) */}
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
{(view === 'NEW_PRODUCT' || (view === 'EDIT_PRODUCT' && selectedProduct)) && (          
  <ProductForm
            isNew={view === 'NEW_PRODUCT'}
            categories={categories}
            templates={templates}
            initialProduct={selectedProduct || null}
            initialVariants={[]}
            initialLocalizations={[]}
            materials={materials}
          />
        )}
      </SlideOver>
    </div>
  )
}