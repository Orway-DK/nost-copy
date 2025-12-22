'use client'

import { useState } from 'react'
import Image from 'next/image'
import { deleteProductAction } from './actions'
import {
  IoPencil,
  IoTrash,
  IoImageOutline,
  IoClose,
  IoCopyOutline
} from 'react-icons/io5'
import { DataTable } from '@/app/admin/_components/DataTable' // Yeni bileşeni import et
import { ColumnDef } from '@tanstack/react-table' // Tip için gerekli

interface Props {
  initialProducts: any[]
  onEdit?: (id: number) => void
}

export default function ProductListClient ({ initialProducts, onEdit }: Props) {
  const [products, setProducts] = useState(initialProducts)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  // --- KOLON TANIMLARI ---
  // Tablonun hangi veriyi nasıl göstereceğini burada tanımlıyoruz
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => (
        <span className='opacity-50 font-mono text-xs'>
          #{row.getValue('id')}
        </span>
      )
    },
    {
      accessorKey: 'main_image_url',
      header: 'Görsel',
      cell: ({ row }) => {
        const url = row.getValue('main_image_url') as string
        return url ? (
          <div
            className='w-10 h-10 relative rounded overflow-hidden border border-[var(--admin-card-border)] cursor-pointer hover:scale-110 transition-transform'
            onClick={() => setPreviewImage(url)}
          >
            <Image
              src={url}
              alt='img'
              fill
              className='object-cover'
              unoptimized
            />
          </div>
        ) : (
          <div className='w-10 h-10 rounded border border-[var(--admin-card-border)] flex items-center justify-center bg-[var(--admin-input-bg)] opacity-30'>
            <IoImageOutline />
          </div>
        )
      }
    },
    {
      accessorKey: 'name',
      header: 'Ürün Adı',
      cell: ({ row }) => (
        <span className='font-medium text-[var(--admin-fg)]'>
          {row.getValue('name')}
        </span>
      )
    },
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ row }) => (
        <span className='text-sm opacity-70'>{row.getValue('sku') || '-'}</span>
      )
    },
    {
      accessorKey: 'category_slug',
      header: 'Kategori',
      cell: ({ row }) => (
        <span className='badge-admin badge-admin-default bg-[var(--admin-input-bg)] border border-[var(--admin-card-border)]'>
          {row.getValue('category_slug')}
        </span>
      )
    },
    {
      accessorKey: 'active',
      header: 'Durum',
      cell: ({ row }) => {
        const isActive = row.getValue('active')
        return isActive ? (
          <span className='badge-admin badge-admin-success'>Yayında</span>
        ) : (
          <span className='badge-admin badge-admin-default opacity-50'>
            Pasif
          </span>
        )
      }
    },
    {
      id: 'actions',
      header: 'İşlem',
      cell: ({ row }) => {
        const id = row.original.id
        return (
          <div className='flex items-center gap-2'>
            <button
              onClick={() => onEdit?.(id)}
              className='p-1.5 rounded hover:bg-[var(--admin-info)] hover:text-white text-[var(--admin-info)] transition-colors'
              title='Düzenle'
            >
              <IoPencil size={16} />
            </button>
            <button
              onClick={() => handleDelete(id)}
              className='p-1.5 rounded hover:bg-[var(--admin-danger)] hover:text-white text-[var(--admin-muted)] hover:opacity-100 transition-colors'
              title='Sil'
            >
              <IoTrash size={16} />
            </button>
          </div>
        )
      }
    }
  ]

  const handleDelete = async (id: number) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return
    const res = await deleteProductAction(id)
    if (res.success) {
      setProducts(prev => prev.filter(p => p.id !== id))
    } else {
      alert('Hata: ' + res.message)
    }
  }

  return (
    <>
      {/* VERİ TABLOSU BİLEŞENİ */}
      <DataTable
        columns={columns}
        data={products}
        searchKey='name' // "name" kolonunda arama yapar
      />

      {/* GÖRSEL ÖNİZLEME (Aynı kaldı) */}
      {previewImage && (
        <div
          className='fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200'
          onClick={() => setPreviewImage(null)}
        >
          <div className='relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center'>
            <Image
              src={previewImage}
              alt='preview'
              fill
              className='object-contain'
              unoptimized
            />
          </div>
        </div>
      )}
    </>
  )
}
