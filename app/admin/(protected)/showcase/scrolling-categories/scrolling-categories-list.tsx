// C:\Projeler\nost-copy\app\admin\(protected)\showcase\scrolling-categories\scrolling-categories-list.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateScrollingCategoriesAction } from './actions'
import {
  IoSave,
  IoRefresh,
  IoEye,
  IoEyeOff,
  IoReorderTwo
} from 'react-icons/io5'
import { toast } from 'react-hot-toast'

type CategoryItem = {
  id: number
  slug: string
  active: boolean
  sort: number
  name: string
}

export default function ScrollingCategoriesList ({
  initialItems
}: {
  initialItems: CategoryItem[]
}) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [isDirty, setIsDirty] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleLocalUpdate = (
    id: number,
    field: keyof CategoryItem,
    value: any
  ) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, [field]: value } : item))
    )
    setIsDirty(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const promise = updateScrollingCategoriesAction(items)

    toast.promise(promise, {
      loading: 'Kaydediliyor...',
      success: res => {
        if (!res.success) throw new Error(res.message)
        setIsDirty(false)
        router.refresh()
        return res.message || 'Başarıyla güncellendi!'
      },
      error: err => err.message || 'Bir hata oluştu.'
    })

    try {
      await promise
    } catch {
      // Hata toast.promise içinde handle edildi
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='space-y-6 pb-20'>
      {/* TOOLBAR */}
      <div
        className='flex flex-col sm:flex-row justify-between items-center bg-[var(--admin-card)] p-4 rounded-xl border gap-4 sm:gap-0 shadow-sm'
        style={{ borderColor: 'var(--admin-card-border)' }}
      >
        <div className='text-sm font-medium text-[var(--admin-muted)]'>
          Toplam{' '}
          <span className='text-[var(--admin-fg)] font-bold'>
            {items.length}
          </span>{' '}
          kategori listeleniyor.
        </div>
        <div className='flex gap-2 w-full sm:w-auto'>
          <button
            onClick={() => router.refresh()}
            className='btn-admin btn-admin-secondary flex-1 sm:flex-none justify-center'
            title='Yenile'
          >
            <IoRefresh size={18} />
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className={`btn-admin flex items-center gap-2 px-6 flex-1 sm:flex-none justify-center transition-all ${
              isDirty
                ? 'btn-admin-primary shadow-lg scale-105'
                : 'btn-admin-secondary opacity-50 cursor-not-allowed'
            }`}
          >
            <IoSave size={18} />
            {saving ? 'Kaydediliyor...' : 'Sıralamayı Kaydet'}
          </button>
        </div>
      </div>

      {/* LISTE ALANI */}
      <div className='card-admin overflow-hidden p-0 bg-transparent border-0 shadow-none'>
        {/* --- MOBİL GÖRÜNÜM (KARTLAR) --- */}
        <div className='block md:hidden space-y-3'>
          {items.map(item => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border flex flex-col gap-3 transition-colors ${
                item.active
                  ? 'bg-[var(--admin-card)] border-[var(--admin-card-border)]'
                  : 'bg-[var(--admin-input-bg)] border-dashed border-[var(--admin-input-border)] opacity-80'
              }`}
            >
              {/* Üst Kısım: İsim ve Slug */}
              <div className='flex justify-between items-start'>
                <div>
                  <div className='font-bold text-[var(--admin-fg)] text-lg'>
                    {item.name}
                  </div>
                  <div className='text-xs font-mono text-[var(--admin-muted)] mt-0.5'>
                    {item.slug}
                  </div>
                </div>

                {/* Aktiflik Butonu */}
                <button
                  onClick={() =>
                    handleLocalUpdate(item.id, 'active', !item.active)
                  }
                  className={`p-2 rounded-lg transition-colors ${
                    item.active
                      ? 'text-[var(--admin-success)] bg-[var(--admin-success)]/10'
                      : 'text-[var(--admin-muted)] bg-[var(--admin-input-bg)] border border-[var(--admin-card-border)]'
                  }`}
                  title={item.active ? 'Yayında' : 'Gizli'}
                >
                  {item.active ? <IoEye size={20} /> : <IoEyeOff size={20} />}
                </button>
              </div>

              {/* Alt Kısım: Sıra Input */}
              <div className='flex items-center gap-3 pt-3 border-t border-[var(--admin-card-border)]'>
                <div className='text-sm font-medium text-[var(--admin-muted)] flex items-center gap-1'>
                  <IoReorderTwo size={16} /> Sıra:
                </div>
                <input
                  type='number'
                  className='admin-input h-10 flex-1 font-bold text-center'
                  value={item.sort}
                  onChange={e =>
                    handleLocalUpdate(item.id, 'sort', parseInt(e.target.value))
                  }
                />
              </div>
            </div>
          ))}
        </div>

        {/* --- MASAÜSTÜ GÖRÜNÜM (TABLO) --- */}
        <div className='hidden md:block bg-[var(--admin-card)] rounded-xl border border-[var(--admin-card-border)] overflow-hidden'>
          <table className='w-full text-left border-collapse'>
            <thead
              style={{
                backgroundColor: 'var(--admin-input-bg)',
                borderBottom: '1px solid var(--admin-card-border)'
              }}
            >
              <tr className='text-xs uppercase font-semibold text-[var(--admin-muted)]'>
                <th className='py-4 pl-6 w-24 text-center'>Sıra</th>
                <th className='py-4 px-4 w-24 text-center'>Durum</th>
                <th className='py-4 px-4'>Kategori Adı</th>
                <th className='py-4 px-4'>Slug</th>
              </tr>
            </thead>
            <tbody
              className='divide-y'
              style={{ borderColor: 'var(--admin-card-border)' }}
            >
              {items.map(item => (
                <tr
                  key={item.id}
                  className={`group transition-colors hover:bg-[var(--admin-input-bg)] ${
                    !item.active ? 'opacity-60 bg-[var(--admin-bg)]' : ''
                  }`}
                >
                  {/* SIRA INPUT */}
                  <td className='py-3 pl-6 text-center'>
                    <input
                      type='number'
                      className='admin-input text-center h-9 font-medium w-full max-w-[80px] mx-auto'
                      value={item.sort}
                      onChange={e =>
                        handleLocalUpdate(
                          item.id,
                          'sort',
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </td>

                  {/* AKTİFLİK TOGGLE */}
                  <td className='py-3 px-4 text-center'>
                    <button
                      onClick={() =>
                        handleLocalUpdate(item.id, 'active', !item.active)
                      }
                      className={`p-2 rounded-lg transition-colors flex items-center justify-center mx-auto ${
                        item.active
                          ? 'text-[var(--admin-success)] bg-[var(--admin-success)]/10 hover:bg-[var(--admin-success)]/20'
                          : 'text-[var(--admin-muted)] bg-[var(--admin-input-bg)] hover:bg-[var(--admin-card-border)]'
                      }`}
                      title={item.active ? 'Yayında' : 'Gizli'}
                    >
                      {item.active ? (
                        <IoEye size={20} />
                      ) : (
                        <IoEyeOff size={20} />
                      )}
                    </button>
                  </td>

                  {/* BİLGİLER */}
                  <td className='py-3 px-4 font-medium text-[var(--admin-fg)]'>
                    {item.name}
                  </td>
                  <td className='py-3 px-4 text-sm font-mono opacity-60 text-[var(--admin-muted)]'>
                    {item.slug}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className='p-8 text-center text-[var(--admin-muted)]'
                  >
                    Listelenecek kategori bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
