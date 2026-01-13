'use client'

import { useState, useMemo } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  FaEdit,
  FaTrash,
  FaArrowUp,
  FaArrowDown,
  FaPlus,
  FaLanguage,
  FaSave,
  FaTimes,
  FaMagic,
  FaFolderOpen,
  FaHome,
  FaChevronRight
} from 'react-icons/fa'
import { translateText } from './actions'

// --- TİPLER ---
type NavItem = {
  id: number
  parent_id: number | null
  type: 'link' | 'dropdown' | 'dynamic_categories' | 'dynamic_services' // 'dropdown' eklendi
  label: { tr: string; en: string; de: string }
  url: string | null
  sort_order: number
  is_active: boolean
}

export default function NavManager ({ initialItems }: { initialItems: any[] }) {
  const [items, setItems] = useState<NavItem[]>(initialItems)
  const [currentParentId, setCurrentParentId] = useState<number | null>(null) // Hangi seviyedeyiz?

  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [translating, setTranslating] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  // --- CURRENT VIEW (Filtrelenmiş Liste) ---
  // Sadece şu anki klasörün (parent'ın) içindeki öğeleri göster
  const visibleItems = useMemo(() => {
    return items
      .filter(i => i.parent_id === currentParentId)
      .sort((a, b) => a.sort_order - b.sort_order)
  }, [items, currentParentId])

  // --- BREADCRUMB (Gezinti Yolu) ---
  const breadcrumbs = useMemo(() => {
    const path = []
    let curr = currentParentId
    while (curr !== null) {
      const parent = items.find(i => i.id === curr)
      if (parent) {
        path.unshift(parent)
        curr = parent.parent_id
      } else {
        break
      }
    }
    return path
  }, [items, currentParentId])

  // Boş Form
  const emptyForm: NavItem = {
    id: 0,
    parent_id: currentParentId, // Yeni eklenen, o anki parent'a eklensin
    type: 'link',
    label: { tr: '', en: '', de: '' },
    url: '',
    sort_order: visibleItems.length + 1,
    is_active: true
  }
  const [formData, setFormData] = useState<NavItem>(emptyForm)

  // --- İŞLEMLER ---

  const handleAutoTranslate = async () => {
    if (!formData.label.tr) return alert('Lütfen önce Türkçe başlığı girin.')
    setTranslating(true)
    try {
      const en = await translateText(formData.label.tr, 'en')
      const de = await translateText(formData.label.tr, 'de')
      setFormData(prev => ({ ...prev, label: { ...prev.label, en, de } }))
    } catch (error) {
      console.error(error)
      alert('Çeviri hatası')
    } finally {
      setTranslating(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const dataToSave = {
        parent_id: formData.parent_id,
        type: formData.type,
        label: formData.label,
        url: formData.type === 'link' ? formData.url : null, // Dropdown ise URL boş olsun
        sort_order: formData.sort_order,
        is_active: formData.is_active
      }

      if (formData.id === 0) {
        // INSERT
        const { data, error } = await supabase
          .from('classic_navigation_items')
          .insert(dataToSave)
          .select()
          .single()
        if (error) throw error
        setItems(prev => [...prev, data as NavItem]) // Local update
      } else {
        // UPDATE
        const { error } = await supabase
          .from('classic_navigation_items')
          .update(dataToSave)
          .eq('id', formData.id)
        if (error) throw error
        setItems(prev =>
          prev.map(i => (i.id === formData.id ? { ...i, ...dataToSave } : i))
        ) // Local update
      }

      setIsEditing(false)
      router.refresh()
    } catch (error: any) {
      alert('Hata: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    // Alt menüsü var mı kontrol et
    const hasChildren = items.some(i => i.parent_id === id)
    if (hasChildren)
      return alert(
        'Bu menünün altında elemanlar var. Önce onları silmelisiniz.'
      )

    if (!confirm('Silmek istediğinize emin misiniz?')) return
    const { error } = await supabase
      .from('classic_navigation_items')
      .delete()
      .eq('id', id)
    if (!error) {
      setItems(prev => prev.filter(i => i.id !== id))
      router.refresh()
    }
  }

  const handleMove = async (currentIndex: number, direction: 'up' | 'down') => {
    const sortedVisible = [...visibleItems]
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= sortedVisible.length) return

    const itemA = sortedVisible[currentIndex]
    const itemB = sortedVisible[targetIndex]

    // Swap Sort Order
    const tempSort = itemA.sort_order
    itemA.sort_order = itemB.sort_order
    itemB.sort_order = tempSort

    // Update Local State (Tüm liste içinde güncellememiz lazım)
    const newItems = items.map(i => {
      if (i.id === itemA.id) return itemA
      if (i.id === itemB.id) return itemB
      return i
    })
    setItems(newItems)

    // Update DB
    await supabase
      .from('classic_navigation_items')
      .upsert([{ ...itemA }, { ...itemB }])
    router.refresh()
  }

  const openEdit = (item: NavItem) => {
    setFormData(item)
    setIsEditing(true)
  }
  const openNew = () => {
    setFormData({ ...emptyForm, sort_order: visibleItems.length + 1 })
    setIsEditing(true)
  }

  return (
    <div>
      {/* --- BREADCRUMB (Gezinti Çubuğu) --- */}
      <div className='mb-6 bg-white dark:bg-zinc-900 border border-border p-3 rounded-xl flex items-center justify-between shadow-sm'>
        <div className='flex items-center gap-2 text-sm'>
          <button
            onClick={() => setCurrentParentId(null)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md transition ${
              currentParentId === null
                ? 'font-bold text-primary bg-primary/10'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <FaHome /> Ana Menü
          </button>
          {breadcrumbs.map(crumb => (
            <div key={crumb.id} className='flex items-center gap-2'>
              <FaChevronRight className='text-muted-foreground/40 text-xs' />
              <button
                onClick={() => setCurrentParentId(crumb.id)} // Üst klasöre tıklayınca git
                className={`px-2 py-1 rounded-md transition ${
                  currentParentId === crumb.id
                    ? 'font-bold text-primary bg-primary/10'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {crumb.label.tr}
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={openNew}
          className='flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold hover:brightness-110 transition shadow-md'
        >
          <FaPlus /> Ekle
        </button>
      </div>

      {/* --- LİSTE --- */}
      <div className='space-y-3'>
        {visibleItems.length === 0 && (
          <div className='text-center py-12 text-muted-foreground bg-muted/5 rounded-xl border border-dashed border-border'>
            Bu menü boş. Yeni bir öğe ekleyin.
          </div>
        )}

        {visibleItems.map((item, index) => (
          <div
            key={item.id}
            className={`
                flex items-center justify-between bg-background border p-4 rounded-xl transition-all duration-200
                ${
                  !item.is_active
                    ? 'opacity-60 border-dashed'
                    : 'border-border hover:border-primary/50 shadow-sm'
                }
            `}
          >
            {/* Sol Taraf: İsim ve Bilgi */}
            <div className='flex items-center gap-4'>
              <div className='bg-muted/50 p-2 rounded-lg text-xs font-bold w-8 h-8 flex items-center justify-center text-muted-foreground'>
                {index + 1}
              </div>
              <div>
                <h3 className='font-bold text-foreground flex items-center gap-2 text-lg'>
                  {item.label.tr}
                  {item.type === 'dropdown' && (
                    <span className='text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full border border-orange-200'>
                      DROPDOWN
                    </span>
                  )}
                  {item.type.includes('dynamic') && (
                    <span className='text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full border border-blue-200'>
                      OTO
                    </span>
                  )}
                </h3>
                {item.type === 'link' && (
                  <div className='text-xs text-muted-foreground font-mono'>
                    {item.url}
                  </div>
                )}
              </div>
            </div>

            {/* Sağ Taraf: Aksiyonlar */}
            <div className='flex items-center gap-2'>
              {/* ALT MENÜLERE GİT BUTONU (Sadece Dropdown ise) */}
              {item.type === 'dropdown' && (
                <button
                  onClick={() => setCurrentParentId(item.id)} // İçeri Gir
                  className='flex items-center gap-2 px-3 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg text-xs font-bold mr-2 border border-orange-200 transition-colors'
                >
                  <FaFolderOpen /> Alt Menüler (
                  {items.filter(i => i.parent_id === item.id).length})
                </button>
              )}

              {/* Sıralama */}
              <div className='flex flex-col gap-1 bg-muted/30 p-1 rounded-lg mr-2'>
                <button
                  onClick={() => handleMove(index, 'up')}
                  disabled={index === 0}
                  className='p-0.5 hover:text-primary disabled:opacity-30'
                >
                  <FaArrowUp size={10} />
                </button>
                <button
                  onClick={() => handleMove(index, 'down')}
                  disabled={index === visibleItems.length - 1}
                  className='p-0.5 hover:text-primary disabled:opacity-30'
                >
                  <FaArrowDown size={10} />
                </button>
              </div>

              <button
                onClick={() => openEdit(item)}
                className='p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg'
              >
                <FaEdit />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className='p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg'
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- EDIT MODAL --- */}
      {isEditing && (
        <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
          <div className='rounded-2xl shadow-2xl w-full max-w-lg border border-border flex flex-col max-h-[90vh]'>
            <div className='bg-muted/30 px-6 py-4 border-b border-border flex justify-between items-center'>
              <h2 className='text-lg font-bold'>
                {formData.id === 0 ? 'Yeni Öğe Ekle' : 'Düzenle'}
              </h2>
              <button onClick={() => setIsEditing(false)}>
                <FaTimes />
              </button>
            </div>

            <div className='p-6 space-y-5 overflow-y-auto'>
              {/* Tip Seçimi */}
              <div>
                <label className='text-xs font-bold text-muted-foreground uppercase mb-2 block'>
                  Tip Seçimi
                </label>
                <div className='grid grid-cols-2 gap-2'>
                  <button
                    onClick={() => setFormData({ ...formData, type: 'link' })}
                    className={`p-2 text-sm border rounded-lg ${
                      formData.type === 'link'
                        ? 'bg-primary text-white border-primary'
                        : 'bg-background'
                    }`}
                  >
                    Sabit Link
                  </button>
                  <button
                    onClick={() =>
                      setFormData({ ...formData, type: 'dropdown' })
                    }
                    className={`p-2 text-sm border rounded-lg ${
                      formData.type === 'dropdown'
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-background'
                    }`}
                  >
                    Manuel Dropdown
                  </button>
                  {currentParentId === null && (
                    <>
                      <button
                        onClick={() =>
                          setFormData({
                            ...formData,
                            type: 'dynamic_categories'
                          })
                        }
                        className={`p-2 text-xs border rounded-lg ${
                          formData.type === 'dynamic_categories'
                            ? 'bg-blue-500 text-white'
                            : ''
                        }`}
                      >
                        Oto: Kategoriler
                      </button>
                      <button
                        onClick={() =>
                          setFormData({ ...formData, type: 'dynamic_services' })
                        }
                        className={`p-2 text-xs border rounded-lg ${
                          formData.type === 'dynamic_services'
                            ? 'bg-blue-500 text-white'
                            : ''
                        }`}
                      >
                        Oto: Hizmetler
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* İsimler ve Çeviri */}
              <div className='space-y-3 bg-muted/10 p-4 rounded-xl border border-border/50'>
                <div className='flex justify-between'>
                  <label className='text-sm font-bold'>Menü Başlığı</label>
                  <button
                    onClick={handleAutoTranslate}
                    disabled={translating}
                    className='text-xs text-primary flex items-center gap-1 font-bold'
                  >
                    {translating ? (
                      '...'
                    ) : (
                      <>
                        <FaMagic /> Otomatik Çevir
                      </>
                    )}
                  </button>
                </div>
                <input
                  value={formData.label.tr}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      label: { ...formData.label, tr: e.target.value }
                    })
                  }
                  placeholder='Türkçe (Örn: Kurumsal)'
                  className='w-full p-2 text-sm border rounded-md'
                />
                <div className='grid grid-cols-2 gap-2'>
                  <input
                    value={formData.label.en}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        label: { ...formData.label, en: e.target.value }
                      })
                    }
                    placeholder='English'
                    className='w-full p-2 text-sm border rounded-md'
                  />
                  <input
                    value={formData.label.de}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        label: { ...formData.label, de: e.target.value }
                      })
                    }
                    placeholder='Deutsch'
                    className='w-full p-2 text-sm border rounded-md'
                  />
                </div>
              </div>

              {/* URL Input (Sadece Link ise) */}
              {formData.type === 'link' && (
                <div>
                  <label className='text-xs font-bold text-muted-foreground uppercase mb-1 block'>
                    Yönlendirilecek URL
                  </label>
                  <input
                    value={formData.url || ''}
                    onChange={e =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                    placeholder='/hakkimizda'
                    className='w-full p-2 border rounded-md'
                  />
                </div>
              )}

              {/* Aktiflik */}
              <label className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={formData.is_active}
                  onChange={e =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className='w-4 h-4'
                />
                <span className='text-sm'>Menüde Göster</span>
              </label>
            </div>

            <div className='bg-muted/30 px-6 py-4 border-t border-border flex justify-end gap-2'>
              <button
                onClick={() => setIsEditing(false)}
                className='px-4 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300'
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className='px-4 py-2 text-sm bg-primary text-white rounded-lg hover:brightness-110 shadow-lg'
              >
                {loading ? '...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
