'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deleteTemplateAction } from '@/app/admin/actions/template-actions'
import { IoPencil, IoTrash } from 'react-icons/io5'
import { ProductTemplate } from '@/types'

export default function TemplateListClient ({
  initialTemplates
}: {
  initialTemplates: ProductTemplate[]
}) {
  const router = useRouter()
  const [busyId, setBusyId] = useState<number | null>(null)

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

  if (initialTemplates.length === 0) {
    return (
      <div className='p-8 text-center opacity-50'>
        Henüz hiç şablon oluşturulmamış.
      </div>
    )
  }

  return (
    <table className='table-admin'>
      <thead className='thead-admin'>
        <tr>
          <th className='th-admin w-16'>ID</th>
          <th className='th-admin'>Şablon Adı</th>
          <th className='th-admin'>Alan Sayısı</th>
          <th className='th-admin w-32 text-center'>İşlem</th>
        </tr>
      </thead>
      <tbody>
        {initialTemplates.map(t => (
          <tr key={t.id} className='tr-admin'>
            <td className='td-admin opacity-50 text-xs font-mono'>{t.id}</td>
            <td className='td-admin font-bold'>{t.name}</td>
            <td className='td-admin'>
              <span className='badge-admin badge-admin-default bg-[var(--admin-input-bg)]'>
                {t.schema?.length || 0} Özellik
              </span>
            </td>
            <td className='td-admin text-center'>
              <div className='flex items-center justify-center gap-2'>
                <Link
                  href={`/admin/templates/${t.id}`}
                  className='p-2 rounded hover:bg-[var(--admin-info)] hover:text-white text-[var(--admin-info)] transition-colors'
                >
                  <IoPencil />
                </Link>
                <button
                  onClick={() => handleDelete(t.id)}
                  disabled={busyId === t.id}
                  className='p-2 rounded hover:bg-[var(--admin-danger)] hover:text-white text-[var(--admin-muted)] transition-colors'
                >
                  <IoTrash />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
