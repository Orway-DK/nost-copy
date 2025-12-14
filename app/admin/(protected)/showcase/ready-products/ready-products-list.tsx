// C:\Projeler\nost-copy\app\admin\(protected)\showcase\ready-products\ready-products-list.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  searchProductsAction,
  addReadyProductAction,
  bulkUpdateReadyProductsAction,
  deleteReadyProductAction
} from './actions'
import {
  IoTrash,
  IoAdd,
  IoSearch,
  IoClose,
  IoCubeOutline,
  IoSave,
  IoImageOutline
} from 'react-icons/io5'
import { toast } from 'react-hot-toast'

// YARDIMCI: URL OLUŞTURUCU
const getImageUrl = (path: string | null) => {
  if (!path) return null
  if (path.startsWith('http') || path.startsWith('/')) return path
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${path}`
}

type ReadyProductItem = {
  id: number
  product_id: number
  active: boolean
  sort_order: number
  price_try: number | null
  price_usd: number | null
  price_eur: number | null
  custom_url: string | null
  product_name: string
  product_sku: string
  main_image_url: string | null
}

export default function ReadyProductsList ({
  initialItems
}: {
  initialItems: ReadyProductItem[]
}) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [isDirty, setIsDirty] = useState(false)
  const [saving, setSaving] = useState(false)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [busyId, setBusyId] = useState<number | null>(null)

  // HANDLERS
  const handleLocalUpdate = (id: number, field: string, value: any) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, [field]: value } : item))
    )
    setIsDirty(true)
  }

  const handleBulkSave = async () => {
    setSaving(true)
    const promise = bulkUpdateReadyProductsAction(items)

    toast.promise(promise, {
      loading: 'Kaydediliyor...',
      success: res => {
        if (!res.success) throw new Error(res.message)
        setIsDirty(false)
        router.refresh()
        return res.message
      },
      error: err => err.message
    })

    try {
      await promise
    } finally {
      setSaving(false)
    }
  }

  const handleAdd = async (productId: number) => {
    const res = await addReadyProductAction(productId, items.length)
    if (res.success) {
      toast.success(res.message)
      setIsModalOpen(false)
      setSearchTerm('')
      setSearchResults([])
      router.refresh()
    } else {
      toast.error(res.message)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Silmek istediğinize emin misiniz?')) return
    setBusyId(id)
    const res = await deleteReadyProductAction(id)
    setBusyId(null)

    if (res.success) {
      toast.success(res.message)
      setItems(prev => prev.filter(i => i.id !== id))
      router.refresh()
    } else {
      toast.error(res.message)
    }
  }

  const handleSearch = async (term: string) => {
    setSearchTerm(term)
    if (term.length < 2) {
      setSearchResults([])
      return
    }
    setSearching(true)
    const existingIds = items.map(i => i.product_id)
    const res = await searchProductsAction(term, existingIds)
    setSearching(false)
    if (res.success) setSearchResults(res.data)
  }

  return (
    <div className='space-y-6'>
      {/* TOOLBAR */}
      <div
        className='flex flex-col sm:flex-row justify-between items-center bg-[var(--admin-card)] p-4 rounded-xl border gap-4 sm:gap-0 shadow-sm'
        style={{ borderColor: 'var(--admin-card-border)' }}
      >
        <div className='text-sm font-medium text-[var(--admin-muted)] flex items-center gap-2'>
          Toplam{' '}
          <span className='text-[var(--admin-fg)] font-bold'>
            {items.length}
          </span>{' '}
          ürün.
        </div>

        <div className='flex gap-2 w-full sm:w-auto'>
          <button
            onClick={() => setIsModalOpen(true)}
            className='btn-admin btn-admin-secondary flex-1 sm:flex-none justify-center gap-2'
          >
            <IoAdd size={18} /> Ürün Seç
          </button>

          <button
            onClick={handleBulkSave}
            disabled={saving || !isDirty}
            className={`btn-admin flex items-center gap-2 px-6 flex-1 sm:flex-none justify-center transition-all ${
              isDirty
                ? 'btn-admin-primary shadow-lg scale-105'
                : 'btn-admin-secondary opacity-50 cursor-not-allowed'
            }`}
          >
            <IoSave size={18} />
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>

      {/* --- LİSTE ALANI --- */}
      <div className='card-admin p-0 overflow-hidden bg-transparent border-0 shadow-none'>
        {/* 1. MOBİL KART GÖRÜNÜMÜ (md:hidden) */}
        <div className='block md:hidden space-y-4'>
          {items.map(item => {
            const imgUrl = getImageUrl(item.main_image_url)
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border flex flex-col gap-4 transition-colors bg-[var(--admin-card)] border-[var(--admin-card-border)] ${
                  !item.active ? 'opacity-75 bg-[var(--admin-input-bg)]' : ''
                }`}
              >
                {/* Üst: Görsel + İsim + Sıra */}
                <div className='flex gap-4'>
                  <div className='relative w-16 h-16 rounded-lg bg-[var(--admin-input-bg)] border border-[var(--admin-input-border)] overflow-hidden flex-shrink-0 flex items-center justify-center'>
                    {imgUrl ? (
                      <Image
                        src={imgUrl}
                        alt=''
                        fill
                        className='object-cover'
                        unoptimized
                      />
                    ) : (
                      <IoCubeOutline className='opacity-20' size={24} />
                    )}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='font-bold text-[var(--admin-fg)] truncate'>
                      {item.product_name}
                    </div>
                    <div className='text-xs font-mono text-[var(--admin-muted)] mt-0.5'>
                      {item.product_sku}
                    </div>

                    <div className='flex items-center gap-2 mt-2'>
                      <label className='text-xs text-[var(--admin-muted)]'>
                        Sıra:
                      </label>
                      <input
                        type='number'
                        className='admin-input h-7 w-16 text-center text-xs p-0'
                        value={item.sort_order}
                        onChange={e =>
                          handleLocalUpdate(
                            item.id,
                            'sort_order',
                            parseInt(e.target.value)
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* Aktiflik Toggle */}
                  <div>
                    <input
                      type='checkbox'
                      className='w-5 h-5 accent-[var(--admin-success)] cursor-pointer'
                      checked={item.active}
                      onChange={e =>
                        handleLocalUpdate(item.id, 'active', e.target.checked)
                      }
                    />
                  </div>
                </div>

                {/* Orta: Fiyatlar */}
                <div className='grid grid-cols-3 gap-2 bg-[var(--admin-input-bg)] p-3 rounded-lg border border-[var(--admin-card-border)]'>
                  <div>
                    <label className='text-[10px] text-[var(--admin-muted)] block mb-1'>
                      TRY
                    </label>
                    <input
                      type='number'
                      className='admin-input h-7 text-sm w-full p-1'
                      value={item.price_try || ''}
                      onChange={e =>
                        handleLocalUpdate(
                          item.id,
                          'price_try',
                          parseFloat(e.target.value)
                        )
                      }
                      placeholder='-'
                    />
                  </div>
                  <div>
                    <label className='text-[10px] text-[var(--admin-muted)] block mb-1'>
                      USD
                    </label>
                    <input
                      type='number'
                      className='admin-input h-7 text-sm w-full p-1'
                      value={item.price_usd || ''}
                      onChange={e =>
                        handleLocalUpdate(
                          item.id,
                          'price_usd',
                          parseFloat(e.target.value)
                        )
                      }
                      placeholder='-'
                    />
                  </div>
                  <div>
                    <label className='text-[10px] text-[var(--admin-muted)] block mb-1'>
                      EUR
                    </label>
                    <input
                      type='number'
                      className='admin-input h-7 text-sm w-full p-1'
                      value={item.price_eur || ''}
                      onChange={e =>
                        handleLocalUpdate(
                          item.id,
                          'price_eur',
                          parseFloat(e.target.value)
                        )
                      }
                      placeholder='-'
                    />
                  </div>
                </div>

                {/* Alt: Sil Butonu */}
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={busyId === item.id}
                  className='btn-admin btn-admin-danger w-full py-2 flex justify-center gap-2 text-sm'
                >
                  <IoTrash /> Sil
                </button>
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
                <th className='py-4 pl-4 w-20 text-center'>Sıra</th>
                <th className='py-4 px-2 w-20 text-center'>Görsel</th>
                <th className='py-4 px-4'>Ürün Bilgisi</th>
                <th className='py-4 px-2 w-28'>TRY</th>
                <th className='py-4 px-2 w-28'>USD</th>
                <th className='py-4 px-2 w-28'>EUR</th>
                <th className='py-4 px-4 w-24 text-center'>Durum</th>
                <th className='py-4 px-4 w-16 text-center'>Sil</th>
              </tr>
            </thead>
            <tbody
              className='divide-y'
              style={{ borderColor: 'var(--admin-card-border)' }}
            >
              {items.map(item => {
                const imgUrl = getImageUrl(item.main_image_url)
                return (
                  <tr
                    key={item.id}
                    className='group transition-colors hover:bg-[var(--admin-input-bg)]'
                  >
                    <td className='py-3 pl-4 text-center'>
                      <input
                        type='number'
                        className='admin-input text-center h-8 text-sm w-16 mx-auto'
                        value={item.sort_order}
                        onChange={e =>
                          handleLocalUpdate(
                            item.id,
                            'sort_order',
                            parseInt(e.target.value)
                          )
                        }
                      />
                    </td>
                    <td className='py-3 px-2 text-center'>
                      <div
                        className='relative w-10 h-10 rounded border mx-auto overflow-hidden flex items-center justify-center bg-[var(--admin-bg)]'
                        style={{ borderColor: 'var(--admin-card-border)' }}
                      >
                        {imgUrl ? (
                          <Image
                            src={imgUrl}
                            alt=''
                            fill
                            className='object-cover'
                            unoptimized
                          />
                        ) : (
                          <IoCubeOutline className='opacity-30' size={20} />
                        )}
                      </div>
                    </td>
                    <td className='py-3 px-4'>
                      <div className='font-medium text-[var(--admin-fg)]'>
                        {item.product_name}
                      </div>
                      <div className='text-xs font-mono opacity-60 text-[var(--admin-muted)]'>
                        {item.product_sku}
                      </div>
                    </td>
                    <td className='py-3 px-2'>
                      <input
                        type='number'
                        className='admin-input h-8 text-sm text-right'
                        value={item.price_try || ''}
                        onChange={e =>
                          handleLocalUpdate(
                            item.id,
                            'price_try',
                            parseFloat(e.target.value)
                          )
                        }
                        placeholder='0'
                      />
                    </td>
                    <td className='py-3 px-2'>
                      <input
                        type='number'
                        className='admin-input h-8 text-sm text-right'
                        value={item.price_usd || ''}
                        onChange={e =>
                          handleLocalUpdate(
                            item.id,
                            'price_usd',
                            parseFloat(e.target.value)
                          )
                        }
                        placeholder='0'
                      />
                    </td>
                    <td className='py-3 px-2'>
                      <input
                        type='number'
                        className='admin-input h-8 text-sm text-right'
                        value={item.price_eur || ''}
                        onChange={e =>
                          handleLocalUpdate(
                            item.id,
                            'price_eur',
                            parseFloat(e.target.value)
                          )
                        }
                        placeholder='0'
                      />
                    </td>
                    <td className='py-3 px-4 text-center'>
                      <input
                        type='checkbox'
                        className='w-5 h-5 accent-[var(--admin-success)] cursor-pointer'
                        checked={item.active}
                        onChange={e =>
                          handleLocalUpdate(item.id, 'active', e.target.checked)
                        }
                      />
                    </td>
                    <td className='py-3 px-4 text-center'>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={busyId === item.id}
                        className='w-8 h-8 flex items-center justify-center rounded-full transition-all hover:bg-[var(--admin-danger)]/10 text-[var(--admin-muted)] hover:text-[var(--admin-danger)] mx-auto'
                      >
                        <IoTrash size={18} />
                      </button>
                    </td>
                  </tr>
                )
              })}
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className='py-8 text-center opacity-50'
                    style={{ color: 'var(--admin-muted)' }}
                  >
                    Henüz ekli ürün yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in'>
          <div
            className='rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4 border flex flex-col max-h-[80vh]'
            style={{
              backgroundColor: 'var(--admin-card)',
              color: 'var(--admin-fg)',
              borderColor: 'var(--admin-card-border)'
            }}
          >
            <div className='flex justify-between items-center'>
              <h3 className='text-lg font-bold'>Ürün Ekle</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ color: 'var(--admin-muted)' }}
                className='p-2 hover:bg-[var(--admin-input-bg)] rounded-full'
              >
                <IoClose size={24} />
              </button>
            </div>

            <div className='relative'>
              <IoSearch className='absolute left-3 top-3 opacity-50' />
              <input
                className='admin-input pl-10'
                placeholder='Ürün adı veya SKU ara...'
                autoFocus
                value={searchTerm}
                onChange={e => handleSearch(e.target.value)}
              />
            </div>

            <div
              className='flex-1 overflow-y-auto space-y-2 border-t pt-2 scrollbar-thin'
              style={{ borderColor: 'var(--admin-card-border)' }}
            >
              {searching && (
                <p className='text-center py-4 text-sm opacity-50'>
                  Aranıyor...
                </p>
              )}

              {!searching &&
                searchResults.map(prod => {
                  const prodImg = getImageUrl(prod.image_key)
                  return (
                    <button
                      key={prod.id}
                      onClick={() => handleAdd(prod.id)}
                      className='w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors hover:bg-[var(--admin-input-bg)] group border border-transparent hover:border-[var(--admin-card-border)]'
                    >
                      <div
                        className='relative w-12 h-12 rounded overflow-hidden flex-shrink-0 border'
                        style={{
                          backgroundColor: 'var(--admin-bg)',
                          borderColor: 'var(--admin-card-border)'
                        }}
                      >
                        {prodImg ? (
                          <Image
                            src={prodImg}
                            alt=''
                            fill
                            className='object-cover'
                            unoptimized
                          />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center text-xs opacity-50'>
                            <IoImageOutline size={20} />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className='font-medium text-sm text-[var(--admin-fg)]'>
                          {prod.name}
                        </div>
                        <div className='text-xs opacity-60 font-mono text-[var(--admin-muted)]'>
                          {prod.sku}
                        </div>
                      </div>
                      <div className='ml-auto text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity text-[var(--admin-info)]'>
                        Seç
                      </div>
                    </button>
                  )
                })}
              {!searching &&
                searchTerm.length > 1 &&
                searchResults.length === 0 && (
                  <div className='text-center py-8 text-sm opacity-50 flex flex-col items-center'>
                    <IoSearch size={32} className='mb-2 opacity-20' />
                    Sonuç bulunamadı.
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
