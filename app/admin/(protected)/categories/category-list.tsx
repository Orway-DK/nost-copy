'use client'

import { useState, Fragment } from 'react'
import Link from 'next/link'
import { IoPencil, IoTrash, IoFolderOpen } from 'react-icons/io5'
import { deleteCategoryAction } from './actions'
import { useRouter } from 'next/navigation'

export default function CategoryList ({ initialData }: { initialData: any[] }) {
  const router = useRouter()
  const [busyId, setBusyId] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        'Bu kategoriyi silmek istediğinize emin misiniz? Alt kategoriler de silinecektir!'
      )
    )
      return
    setBusyId(id)
    const res = await deleteCategoryAction(id)
    if (res.success) {
      router.refresh()
    } else {
      alert(res.message)
    }
    setBusyId(null)
  }

  const renderRow = (cat: any, level = 0) => (
    <Fragment key={cat.id}>
      <tr className='transition-colors hover:bg-[var(--admin-input-bg)] group'>
        <td className='py-3 px-4'>
          <div
            className='flex items-center gap-2'
            style={{ paddingLeft: `${level * 24}px` }}
          >
            {level > 0 && <span className='opacity-30'>└─</span>}
            <IoFolderOpen className='text-yellow-500 flex-shrink-0' />
            <span className='font-medium text-[var(--admin-fg)] whitespace-nowrap'>
              {cat.name}
            </span>
          </div>
        </td>
        <td className='py-3 px-4 text-xs opacity-60 font-mono'>{cat.slug}</td>
        <td className='py-3 px-4 text-sm text-center'>{cat.sort}</td>
        <td className='py-3 px-4 text-center'>
          {cat.active ? (
            <span className='badge-admin badge-admin-success'>Aktif</span>
          ) : (
            <span className='badge-admin badge-admin-default opacity-60'>
              Pasif
            </span>
          )}
        </td>
        <td className='py-3 px-4 text-right'>
          <div className='flex justify-end gap-2'>
            <Link
              href={`/admin/categories/${cat.id}`}
              className='btn-admin btn-admin-secondary p-2 leading-none'
            >
              <IoPencil size={16} />
            </Link>
            <button
              onClick={() => handleDelete(cat.id)}
              disabled={busyId === cat.id}
              className='btn-admin btn-admin-danger p-2 leading-none'
            >
              <IoTrash size={16} />
            </button>
          </div>
        </td>
      </tr>
      {/* Recursive Render */}
      {cat.children?.map((child: any) => renderRow(child, level + 1))}
    </Fragment>
  )

  return (
    <div className='card-admin p-0 overflow-hidden'>
      <div className='table-responsive'>
        <table className='w-full text-left border-collapse min-w-[600px]'>
          <thead>
            <tr className='bg-[var(--admin-input-bg)] border-b border-[var(--admin-card-border)] text-[var(--admin-muted)] text-sm uppercase tracking-wider'>
              <th className='py-3 px-4 font-semibold'>Kategori Adı</th>
              <th className='py-3 px-4 font-semibold'>Slug</th>
              <th className='py-3 px-4 font-semibold w-24 text-center'>Sıra</th>
              <th className='py-3 px-4 font-semibold w-24 text-center'>
                Durum
              </th>
              <th className='py-3 px-4 font-semibold w-32 text-right'>İşlem</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-[var(--admin-card-border)]'>
            {initialData.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className='p-8 text-center text-[var(--admin-muted)]'
                >
                  Kayıt bulunamadı.
                </td>
              </tr>
            ) : (
              initialData.map(cat => renderRow(cat))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
