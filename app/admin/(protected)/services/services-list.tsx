'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { deleteServiceAction } from './actions'
import {
  IoAdd,
  IoPencil,
  IoTrash,
  IoClose,
  IoImageOutline,
  IoEye,
  IoEyeOff
} from 'react-icons/io5'
import { toast } from 'react-hot-toast'
import ServiceForm from './service-form'

export default function ServicesList ({ initialData }: { initialData: any[] }) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  // Handlers
  const handleAddNew = () => {
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bu hizmeti silmek istediğinize emin misiniz?')) return
    setBusyId(id)
    const res = await deleteServiceAction(id)
    setBusyId(null)
    if (res.success) {
      toast.success(res.message)
      router.refresh()
    } else {
      toast.error(res.message)
    }
  }

  const handleSuccess = () => {
    setIsModalOpen(false)
    router.refresh()
  }

  return (
    <div className='space-y-6'>
      {/* Toolbar */}
      <div
        className='flex justify-between items-center bg-[var(--admin-card)] p-4 rounded-xl border shadow-sm'
        style={{ borderColor: 'var(--admin-card-border)' }}
      >
        <div className='text-sm text-[var(--admin-muted)]'>
          Toplam{' '}
          <strong className='text-[var(--admin-fg)]'>
            {initialData.length}
          </strong>{' '}
          hizmet.
        </div>
        <button
          onClick={handleAddNew}
          className='btn-admin btn-admin-primary gap-2'
        >
          <IoAdd size={18} /> Yeni Hizmet
        </button>
      </div>

      {/* --- LISTE ALANI --- */}
      <div className='card-admin p-0 overflow-hidden bg-transparent border-0 shadow-none'>
        {initialData.length === 0 ? (
          <div
            className='p-12 text-center border-2 border-dashed rounded-xl'
            style={{ borderColor: 'var(--admin-input-border)' }}
          >
            <p className='text-[var(--admin-muted)]'>
              Henüz hizmet eklenmemiş.
            </p>
          </div>
        ) : (
          <>
            {/* 1. MOBİL KART GÖRÜNÜMÜ (md:hidden) */}
            <div className='block md:hidden space-y-4'>
              {initialData.map(item => {
                const trTitle =
                  item.service_translations?.find(
                    (t: any) => t.lang_code === 'tr'
                  )?.title || '(Başlıksız)'
                const enTitle = item.service_translations?.find(
                  (t: any) => t.lang_code === 'en'
                )?.title

                return (
                  <div
                    key={item.id}
                    className='card-admin p-4 flex flex-col gap-4 bg-[var(--admin-card)]'
                  >
                    <div className='flex gap-4'>
                      {/* Resim */}
                      <div className='relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--admin-input-bg)] border border-[var(--admin-card-border)]'>
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt=''
                            fill
                            className='object-cover'
                            unoptimized
                          />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center opacity-30'>
                            <IoImageOutline size={24} />
                          </div>
                        )}
                      </div>

                      {/* Bilgi */}
                      <div className='flex-1 min-w-0'>
                        <h3 className='font-bold text-[var(--admin-fg)] truncate'>
                          {trTitle}
                        </h3>
                        {enTitle && (
                          <p className='text-xs text-[var(--admin-muted)] truncate'>
                            {enTitle}
                          </p>
                        )}
                        <div className='mt-2 flex items-center gap-2'>
                          <span
                            className={`badge-admin ${
                              item.active
                                ? 'badge-admin-success'
                                : 'badge-admin-default'
                            }`}
                          >
                            {item.active ? 'Aktif' : 'Pasif'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Butonlar */}
                    <div className='grid grid-cols-2 gap-3 pt-3 border-t border-[var(--admin-card-border)]'>
                      <button
                        onClick={() => handleEdit(item)}
                        className='btn-admin btn-admin-secondary justify-center text-sm gap-2'
                      >
                        <IoPencil /> Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={busyId === item.id}
                        className='btn-admin btn-admin-danger justify-center text-sm gap-2'
                      >
                        <IoTrash /> Sil
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 2. MASAÜSTÜ TABLO GÖRÜNÜMÜ (hidden md:block) */}
            <div className='hidden md:block bg-[var(--admin-card)] rounded-xl border border-[var(--admin-card-border)] overflow-hidden'>
              <table className='w-full text-left border-collapse'>
                <thead
                  style={{
                    backgroundColor: 'var(--admin-input-bg)',
                    borderBottom: '1px solid var(--admin-card-border)'
                  }}
                >
                  <tr className='text-xs uppercase font-semibold text-[var(--admin-muted)]'>
                    <th className='py-4 pl-6 w-24 text-center'>Görsel</th>
                    <th className='py-4 px-4'>Hizmet Başlığı</th>
                    <th className='py-4 px-4'>Slug</th>
                    <th className='py-4 px-4 w-32 text-center'>Durum</th>
                    <th className='py-4 px-4 w-32 text-center'>İşlem</th>
                  </tr>
                </thead>
                <tbody
                  className='divide-y'
                  style={{ borderColor: 'var(--admin-card-border)' }}
                >
                  {initialData.map(item => {
                    const trTitle =
                      item.service_translations?.find(
                        (t: any) => t.lang_code === 'tr'
                      )?.title || '(Başlıksız)'
                    return (
                      <tr
                        key={item.id}
                        className='group transition-colors hover:bg-[var(--admin-input-bg)]'
                      >
                        <td className='py-3 pl-6'>
                          <div
                            className='relative w-12 h-12 rounded border overflow-hidden bg-[var(--admin-bg)]'
                            style={{ borderColor: 'var(--admin-card-border)' }}
                          >
                            {item.image_url ? (
                              <Image
                                src={item.image_url}
                                alt=''
                                fill
                                className='object-cover'
                                unoptimized
                              />
                            ) : (
                              <div className='w-full h-full flex items-center justify-center opacity-30'>
                                <IoImageOutline size={20} />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className='py-3 px-4 font-medium text-[var(--admin-fg)]'>
                          {trTitle}
                        </td>
                        <td className='py-3 px-4 text-sm font-mono text-[var(--admin-muted)]'>
                          {item.slug}
                        </td>
                        <td className='py-3 px-4 text-center'>
                          <span
                            className={`badge-admin ${
                              item.active
                                ? 'badge-admin-success'
                                : 'badge-admin-default'
                            }`}
                          >
                            {item.active ? 'Yayında' : 'Pasif'}
                          </span>
                        </td>
                        <td className='py-3 px-4 text-center'>
                          <div className='flex items-center justify-center gap-2'>
                            <button
                              onClick={() => handleEdit(item)}
                              className='p-2 rounded-lg text-[var(--admin-muted)] hover:bg-[var(--admin-bg)] hover:text-[var(--admin-info)] transition-colors'
                            >
                              <IoPencil size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className='p-2 rounded-lg text-[var(--admin-muted)] hover:bg-[var(--admin-bg)] hover:text-[var(--admin-danger)] transition-colors'
                            >
                              <IoTrash size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in'>
          <div className='card-admin w-full max-w-4xl h-[90vh] flex flex-col p-0 shadow-2xl relative overflow-hidden bg-[var(--admin-card)]'>
            <div className='p-5 border-b border-[var(--admin-card-border)] flex justify-between items-center bg-[var(--admin-input-bg)]'>
              <h2 className='text-xl font-bold text-[var(--admin-fg)]'>
                {editingItem ? 'Hizmeti Düzenle' : 'Yeni Hizmet Ekle'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className='text-[var(--admin-muted)] hover:text-[var(--admin-fg)]'
              >
                <IoClose size={24} />
              </button>
            </div>
            <ServiceForm
              initialData={editingItem}
              onClose={() => setIsModalOpen(false)}
              onSuccess={handleSuccess}
            />
          </div>
        </div>
      )}
    </div>
  )
}
