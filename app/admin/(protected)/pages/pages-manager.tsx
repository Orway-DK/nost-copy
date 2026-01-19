'use client'

import React, { useState } from 'react'
import {
  IoAdd,
  IoBusinessOutline,
  IoPencil,
  IoEyeOutline,
  IoClose
} from 'react-icons/io5'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import PageForm from './[slug]/page-form'

export default function PagesManager ({
  pages,
  filter,
  pageTitle
}: {
  pages: any[]
  filter?: string
  pageTitle: string
}) {
  const router = useRouter()
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any | null>(null)

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setIsPanelOpen(true)
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex justify-between items-end'>
        <div>
          <h1 className='text-2xl font-bold flex items-center gap-3'>
            {filter === 'corporate' && <IoBusinessOutline className='text-blue-500' />}
            {pageTitle}
          </h1>
          <p className='text-[var(--admin-muted)] text-xs mt-1'>
            {pages.length} kayıt listeleniyor.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null)
            setIsPanelOpen(true)
          }}
          className='btn-admin btn-admin-primary px-4 gap-2'
        >
          <IoAdd size={18} /> Yeni Ekle
        </button>
      </div>
      <div className='bg-[var(--admin-card)] border border-[var(--admin-card-border)] rounded-xl shadow-sm overflow-hidden'>
        <div className='overflow-x-auto max-h-[calc(100vh-300px)] overflow-y-auto'>
          <table className='w-full text-left'>
            <thead className='bg-[var(--admin-input-bg)] text-xs uppercase font-semibold text-[var(--admin-muted)] border-b border-[var(--admin-card-border)]'>
              <tr>
                <th className='p-4'>Slug (URL)</th>
                <th className='p-4 w-24'>Hero Görsel</th>
                <th className='p-4 w-24 text-center'>Durum</th>
                <th className='p-4 w-32 text-right'>İşlem</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-[var(--admin-card-border)]'>
              {pages.map(page => (
                <tr key={page.id} className='hover:bg-black/5 transition-colors'>
                  <td className='p-4'>
                    <div className='font-bold text-sm'>/{page.slug}</div>
                    <div className='text-[10px] font-mono opacity-50'>
                      ID: {page.id}
                    </div>
                  </td>
                  <td className='p-4'>
                    {page.image_url ? (
                      <div className='w-16 h-10 relative rounded-md overflow-hidden border border-[var(--admin-card-border)]'>
                        <Image
                          src={page.image_url}
                          alt='Hero'
                          fill
                          className='object-cover'
                          sizes='64px'
                        />
                      </div>
                    ) : (
                      <span className='text-[var(--admin-muted)] text-xs'>-</span>
                    )}
                  </td>
                  <td className='p-4 text-center'>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        page.active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {page.active ? 'AKTİF' : 'PASİF'}
                    </span>
                  </td>
                  <td className='p-4 text-right'>
                    <div className='flex justify-end gap-2'>
                      <a
                        href={`/${page.slug}`}
                        target='_blank'
                        className='p-2 text-[var(--admin-muted)] hover:text-[var(--admin-fg)]'
                        title='Sitede Gör'
                      >
                        <IoEyeOutline size={18} />
                      </a>
                      <button
                        onClick={() => handleEdit(page)}
                        className='p-2 text-[var(--primary)]'
                        title='Düzenle'
                      >
                        <IoPencil size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr>
                  <td colSpan={4} className='p-8 text-center text-[var(--admin-muted)]'>
                    Henüz hiç sayfa oluşturulmamış.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* SLIDING PANEL */}
      {isPanelOpen && (
        <div className='fixed inset-0 z-[100]'>
          <div
            className='absolute inset-0 bg-black/40 backdrop-blur-sm'
            onClick={() => setIsPanelOpen(false)}
          />
          <div className='absolute inset-y-0 right-0 w-[60%] bg-[var(--admin-card)] shadow-2xl animate-in slide-in-from-right'>
            <div className='h-full flex flex-col'>
              <div className='p-6 border-b flex justify-between items-center bg-[var(--admin-input-bg)]'>
                <h2 className='font-bold text-xl'>
                  {editingItem ? 'Sayfa Düzenle' : 'Yeni Sayfa Ekle'}
                </h2>
                <button onClick={() => setIsPanelOpen(false)}>
                  <IoClose size={24} />
                </button>
              </div>
              <div className='flex-1 overflow-y-auto p-6'>
                <PageForm
                  initialData={editingItem || {
                    id: null,
                    slug: '',
                    image_url: '',
                    active: true,
                    translations: {
                      tr: { title: '', content: '' },
                      en: { title: '', content: '' },
                      de: { title: '', content: '' }
                    }
                  }}
                  onSuccess={() => {
                    setIsPanelOpen(false)
                    router.refresh()
                  }}
                  onCancel={() => setIsPanelOpen(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
