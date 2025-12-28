'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteTemplateAction } from '@/app/admin/actions/template-actions'
import { IoPencil, IoTrash, IoLayersOutline } from 'react-icons/io5'
import { ProductTemplate } from '@/types'
import { DataTable } from '@/app/admin/_components/DataTable'
import { ColumnDef } from '@tanstack/react-table'

interface Props {
  initialTemplates: ProductTemplate[]
  onEdit?: (id: number) => void
}

export default function TemplateListClient({ initialTemplates, onEdit }: Props) {
  const router = useRouter()
  const [busyId, setBusyId] = useState<number | null>(null)

  // --- SİLME İŞLEMİ ---
  const handleDelete = async (id: number) => {
    if (
      !confirm(
        'Bu şablonu silmek istediğinize emin misiniz? Buna bağlı ürünler varsa silinemez.'
      )
    )
      return

    setBusyId(id)
    const res = await deleteTemplateAction(id)
    setBusyId(null)

    if (res.success) {
      router.refresh()
    } else {
      alert('Hata: ' + res.message)
    }
  }

  // --- KOLON TANIMLARI ---
  const columns: ColumnDef<ProductTemplate>[] = [
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
      accessorKey: 'name',
      header: 'Şablon Adı',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
            <div className="w-8 h-8 rounded-admin bg-admin-input-bg border border-admin-input-border flex items-center justify-center text-admin-muted">
                <IoLayersOutline />
            </div>
            <span className='font-medium text-admin-fg'>
              {row.getValue('name')}
            </span>
        </div>
      )
    },
    {
      accessorKey: 'schema',
      header: 'Alan Sayısı',
      cell: ({ row }) => {
        const schema = row.original.schema || [];
        return (
          <span className='badge-admin badge-admin-default bg-admin-input-bg border border-admin-card-border'>
            {schema.length} Özellik
          </span>
        )
      }
    },
    {
      id: 'actions',
      header: 'İşlem',
      cell: ({ row }) => {
        const t = row.original
        return (
          <div className='flex items-center gap-2'>
            <button
              onClick={() => onEdit?.(t.id)}
              className='p-1.5 rounded hover:bg-admin-info hover:text-white text-admin-info transition-colors'
              title='Düzenle'
            >
              <IoPencil size={16} />
            </button>
            <button
              onClick={() => handleDelete(t.id)}
              disabled={busyId === t.id}
              className='p-1.5 rounded hover:bg-admin-danger hover:text-white text-admin-muted hover:opacity-100 transition-colors disabled:opacity-30'
              title='Sil'
            >
              <IoTrash size={16} />
            </button>
          </div>
        )
      }
    }
  ]

  return (
    <DataTable 
        columns={columns} 
        data={initialTemplates} 
        searchKey="name" 
    />
  )
}