'use client'

import React, { useState } from 'react'
import { IoPencil, IoAdd, IoListOutline, IoClose } from 'react-icons/io5'
import { useRouter } from 'next/navigation'
import MenuForm from './[id]/menu-form'

export default function MenuManager ({ items }: { items: any[] }) {
  const router = useRouter()

  // STATE: Modal açık mı? Hangi item düzenleniyor?
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any | null>(null)

  const handleAddNew = () => {
    setEditingItem(null) // Yeni kayıt için boş gönder
    setIsModalOpen(true)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item) // Düzenlenecek veriyi gönder
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingItem(null)
  }

  const handleSuccess = () => {
    handleClose()
    router.refresh() // Server Component'i yenile (Tablo güncellensin)
  }

  // --- RECURSIVE RENDER ROW ---
  const roots = items.filter((i: any) => i.parent_id === null)

  const renderRows = (nodes: any[], level = 0) => {
    return nodes.map(item => {
      const children = items.filter((i: any) => i.parent_id === item.id)
      const paddingLeft = level * 40 + 16

      return (
        <React.Fragment key={item.id}>
          <tr className='hover:bg-[var(--admin-input-bg)]/50 transition-colors border-b border-[var(--admin-card-border)] last:border-0 group'>
            {/* 1. Etiket */}
            <td
              className='py-2.5 pr-4'
              style={{ paddingLeft: `${paddingLeft}px` }}
            >
              <div className='flex items-center gap-2'>
                {level > 0 && (
                  <span className='text-[var(--admin-muted)] text-lg leading-none'>
                    ↳
                  </span>
                )}
                <span
                  className={`font-medium ${
                    level === 0
                      ? 'text-[var(--primary)]'
                      : 'text-[var(--admin-fg)]'
                  }`}
                >
                  {item.label?.tr || item.label?.en || 'İsimsiz'}
                </span>
                {item.type === 'dropdown' && (
                  <span className='text-[9px] bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-[var(--admin-muted)] uppercase tracking-wider border border-gray-200 dark:border-white/5'>
                    Dropdown
                  </span>
                )}
              </div>
            </td>

            {/* 2. URL */}
            <td className='p-4 text-xs font-mono text-[var(--admin-muted)] hidden sm:table-cell'>
              {item.url || '-'}
            </td>

            {/* 3. Sıra */}
            <td className='p-4 text-center'>
              <span className='inline-block px-2 py-0.5 bg-[var(--admin-input-bg)] rounded text-xs font-bold text-[var(--admin-fg)]'>
                {item.sort_order}
              </span>
            </td>

            {/* 4. Durum */}
            <td className='p-4 text-center'>
              <div
                className={`w-2 h-2 rounded-full mx-auto ${
                  item.is_active
                    ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]'
                    : 'bg-red-400'
                }`}
              ></div>
            </td>

            {/* 5. İşlemler */}
            <td className='p-4 text-right'>
              <button
                onClick={() => handleEdit(item)}
                className='inline-flex items-center gap-1 px-3 py-1.5 bg-[var(--admin-input-bg)] hover:bg-[var(--primary)] hover:text-white text-[var(--admin-fg)] rounded-lg text-xs font-bold transition-all'
              >
                <IoPencil size={13} />{' '}
                <span className='hidden sm:inline'>Düzenle</span>
              </button>
            </td>
          </tr>
          {children.length > 0 && renderRows(children, level + 1)}
        </React.Fragment>
      )
    })
  }

  return (
    <>
      <div className='h-full w-full flex flex-col p-4 animate-in fade-in overflow-hidden relative'>
        {/* HEADER */}
        <div className='mb-6 flex justify-between items-end flex-shrink-0'>
          <div>
            <h1 className='text-2xl font-bold text-[var(--admin-fg)] flex items-center gap-2'>
              <IoListOutline /> Menü Yönetimi
            </h1>
            <p className='text-[var(--admin-muted)] text-sm'>
              Navigasyon barındaki linkleri yönetin.
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className='btn-admin btn-admin-primary gap-2 px-4'
          >
            <IoAdd size={20} />{' '}
            <span className='hidden sm:inline'>Yeni Ekle</span>
          </button>
        </div>

        {/* TABLO */}
        <div className='flex-1 min-h-0 overflow-y-auto bg-[var(--admin-card)] border border-[var(--admin-card-border)] rounded-xl shadow-sm relative scrollbar-thin'>
          <table className='w-full text-left border-collapse'>
            <thead className='bg-[var(--admin-input-bg)] text-xs uppercase font-semibold text-[var(--admin-muted)] sticky top-0 z-10 shadow-sm backdrop-blur-sm bg-opacity-95'>
              <tr>
                <th className='p-4 w-1/3'>Başlık</th>
                <th className='p-4 hidden sm:table-cell'>URL</th>
                <th className='p-4 text-center w-16'>Sıra</th>
                <th className='p-4 text-center w-16'>D</th>
                <th className='p-4 text-right w-24'>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {renderRows(roots)}
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className='p-10 text-center text-[var(--admin-muted)] flex flex-col items-center gap-2'
                  >
                    <IoListOutline size={40} className='opacity-20' />
                    <span>Menü henüz boş.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className='fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6'>
          {/* Backdrop */}
          <div
            className='absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity'
            onClick={handleClose}
          />

          {/* Modal Content */}
          <div className='relative w-full max-w-lg bg-[var(--admin-card)] rounded-2xl shadow-2xl border border-[var(--admin-card-border)] flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200'>
            {/* Modal Header */}
            <div className='flex items-center justify-between p-5 border-b border-[var(--admin-card-border)]'>
              <h2 className='text-lg font-bold text-[var(--admin-fg)]'>
                {editingItem ? 'Menü Düzenle' : 'Yeni Menü Ekle'}
              </h2>
              <button
                onClick={handleClose}
                className='p-1 rounded-full hover:bg-[var(--admin-input-bg)] text-[var(--admin-muted)] transition-colors'
              >
                <IoClose size={24} />
              </button>
            </div>

            {/* Modal Body (Scrollable Form) */}
            <div className='p-6 overflow-y-auto'>
              <MenuForm
                initialData={editingItem}
                parentOptions={items}
                onClose={handleClose}
                onSuccess={handleSuccess}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
