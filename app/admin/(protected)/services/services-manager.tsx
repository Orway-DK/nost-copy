'use client'

import React, { useState } from 'react'
import {
  IoAdd,
  IoCubeOutline,
  IoConstructOutline,
  IoPencil,
  IoImageOutline,
  IoClose
} from 'react-icons/io5'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import ServiceForm from './service-form'

export default function ServicesManager ({
  services,
  filter,
  pageTitle
}: {
  services: any[]
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
      {' '}
      {/* overflow-hidden ve h-full kaldırıldı */}
      <div className='flex justify-between items-end'>
        <div>
          <h1 className='text-2xl font-bold flex items-center gap-3'>
            {filter === 'products' ? (
              <IoCubeOutline className='text-blue-500' />
            ) : (
              <IoConstructOutline className='text-orange-500' />
            )}
            {pageTitle}
          </h1>
          <p className='text-[var(--admin-muted)] text-xs mt-1'>
            {services.length} kayıt listeleniyor.
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
                <th className='p-4 w-16 text-center'>Görsel</th>
                <th className='p-4'>İsim / URL</th>
                <th className='p-4 w-24 text-center'>Durum</th>
                <th className='p-4 w-20 text-right'>İşlem</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-[var(--admin-card-border)]'>
              {services.map(item => (
                <tr key={item.id} className='hover:bg-black/5 transition-colors'>
                  <td className='p-3'>
                    <div className='w-12 h-12 relative rounded-lg overflow-hidden bg-gray-100 mx-auto'>
                      {item.image_url && (
                        <Image
                          src={item.image_url}
                          alt=''
                          fill
                          className='object-cover'
                          sizes='48px'
                        />
                      )}
                    </div>
                  </td>
                  <td className='p-3'>
                    <div className='font-bold text-sm'>
                      {item.service_translations?.find(
                        (t: any) => t.lang_code === 'tr'
                      )?.title || item.slug}
                    </div>
                    <div className='text-[10px] font-mono opacity-50'>
                      /{item.slug}
                    </div>
                  </td>
                  <td className='p-3 text-center'>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {item.active ? 'AKTİF' : 'PASİF'}
                    </span>
                  </td>
                  <td className='p-3 text-right'>
                    <button
                      onClick={() => handleEdit(item)}
                      className='p-2 text-[var(--primary)]'
                    >
                      <IoPencil size={18} />
                    </button>
                  </td>
                </tr>
              ))}
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
          <div className='absolute inset-y-0 right-0 w-full max-w-2xl bg-[var(--admin-card)] shadow-2xl animate-in slide-in-from-right'>
            <div className='h-full flex flex-col'>
              <div className='p-6 border-b flex justify-between items-center bg-[var(--admin-input-bg)]'>
                <h2 className='font-bold text-xl'>
                  {editingItem ? 'Düzenle' : 'Yeni Ekle'}
                </h2>
                <button onClick={() => setIsPanelOpen(false)}>
                  <IoClose size={24} />
                </button>
              </div>
              <div className='flex-1 overflow-y-auto p-6'>
                <ServiceForm
                  initialData={editingItem}
                  filter={filter}
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
