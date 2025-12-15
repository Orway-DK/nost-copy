'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  updateScrollingCategoriesAction,
  updateSliderSettingsAction // Yeni action importu
} from './actions'
import {
  IoSave,
  IoRefresh,
  IoEye,
  IoEyeOff,
  IoReorderTwo,
  IoSpeedometerOutline,
  IoPhonePortraitOutline,
  IoDesktopOutline
} from 'react-icons/io5'
import { toast } from 'react-hot-toast'

type CategoryItem = {
  id: number
  slug: string
  active: boolean
  sort: number
  name: string
}

type Settings = {
  duration_desktop: number
  duration_mobile: number
}

export default function ScrollingCategoriesList ({
  initialItems,
  initialSettings // Yeni prop
}: {
  initialItems: CategoryItem[]
  initialSettings: Settings | null
}) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [settings, setSettings] = useState<Settings>(
    initialSettings || { duration_desktop: 120, duration_mobile: 60 }
  )

  const [isDirtyList, setIsDirtyList] = useState(false)
  const [isDirtySettings, setIsDirtySettings] = useState(false)
  const [saving, setSaving] = useState(false)

  // Liste Güncelleme
  const handleLocalUpdate = (
    id: number,
    field: keyof CategoryItem,
    value: any
  ) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, [field]: value } : item))
    )
    setIsDirtyList(true)
  }

  // Ayar Güncelleme
  const handleSettingChange = (field: keyof Settings, value: number) => {
    setSettings(prev => ({ ...prev, [field]: value }))
    setIsDirtySettings(true)
  }

  // Kaydetme (Hem liste hem ayarlar)
  const handleSave = async () => {
    setSaving(true)

    const promises = []

    if (isDirtyList) {
      promises.push(updateScrollingCategoriesAction(items))
    }

    if (isDirtySettings) {
      promises.push(
        updateSliderSettingsAction(
          settings.duration_desktop,
          settings.duration_mobile
        )
      )
    }

    if (promises.length === 0) {
      setSaving(false)
      return
    }

    try {
      const results = await Promise.all(promises)
      const errors = results.filter(r => !r.success)

      if (errors.length > 0) {
        throw new Error(errors[0].message)
      }

      toast.success('Tüm değişiklikler kaydedildi.')
      setIsDirtyList(false)
      setIsDirtySettings(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Bir hata oluştu.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='space-y-6 pb-20'>
      {/* ÜST TOOLBAR VE AYARLAR */}
      <div className='bg-[var(--admin-card)] rounded-xl border border-[var(--admin-card-border)] overflow-hidden'>
        {/* Başlık ve Butonlar */}
        <div className='p-4 border-b border-[var(--admin-card-border)] flex flex-col sm:flex-row justify-between items-center gap-4'>
          <div className='text-sm font-medium text-[var(--admin-muted)]'>
            <span className='text-[var(--admin-fg)] font-bold'>
              {items.length}
            </span>{' '}
            kategori yönetiliyor.
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
              disabled={saving || (!isDirtyList && !isDirtySettings)}
              className={`btn-admin flex items-center gap-2 px-6 flex-1 sm:flex-none justify-center transition-all ${
                isDirtyList || isDirtySettings
                  ? 'btn-admin-primary shadow-lg scale-105'
                  : 'btn-admin-secondary opacity-50 cursor-not-allowed'
              }`}
            >
              <IoSave size={18} />
              {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </div>
        </div>

        {/* Hız Ayarları Formu */}
        <div className='p-4 bg-[var(--admin-input-bg)] flex flex-col md:flex-row gap-6 items-center'>
          <div className='flex items-center gap-2 text-[var(--admin-info)]'>
            <IoSpeedometerOutline size={24} />
            <span className='font-bold text-sm'>Animasyon Süresi</span>
          </div>

          <div className='flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full'>
            <div className='flex items-center gap-3'>
              <IoDesktopOutline className='text-[var(--admin-muted)]' />
              <div className='flex-1'>
                <label className='text-xs text-[var(--admin-muted)] block mb-1'>
                  Masaüstü (Saniye)
                </label>
                <input
                  type='number'
                  className='admin-input w-full'
                  value={settings.duration_desktop}
                  onChange={e =>
                    handleSettingChange(
                      'duration_desktop',
                      parseInt(e.target.value)
                    )
                  }
                  min={10}
                  max={300}
                />
                <span className='text-[10px] opacity-50'>
                  Düşük = Hızlı, Yüksek = Yavaş
                </span>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <IoPhonePortraitOutline className='text-[var(--admin-muted)]' />
              <div className='flex-1'>
                <label className='text-xs text-[var(--admin-muted)] block mb-1'>
                  Mobil (Saniye)
                </label>
                <input
                  type='number'
                  className='admin-input w-full'
                  value={settings.duration_mobile}
                  onChange={e =>
                    handleSettingChange(
                      'duration_mobile',
                      parseInt(e.target.value)
                    )
                  }
                  min={10}
                  max={300}
                />
                <span className='text-[10px] opacity-50'>
                  Genelde masaüstünün yarısı önerilir.
                </span>
              </div>
            </div>
          </div>
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
