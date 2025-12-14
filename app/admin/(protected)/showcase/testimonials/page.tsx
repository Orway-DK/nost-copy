'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import {
  SlPencil,
  SlTrash,
  SlCheck,
  SlClose,
  SlPlus,
  SlRefresh,
  SlPicture,
  SlArrowDown,
  SlArrowUp,
  SlCalender,
  SlStar
} from 'react-icons/sl'
import Image from 'next/image'
import { toast } from 'react-hot-toast'

// --- TİPLER ---
type Translation = {
  id?: number
  lang_code: string
  content: string
}

type Testimonial = {
  id: number
  section_code: string
  order_no: number
  active: boolean
  stars: number
  image_url: string | null
  image_alt: string | null
  author_name: string | null
  author_job: string | null
  created_at: string
  testimonial_translations: Translation[]
}

const DEFAULT_FORM: Partial<Testimonial> = {
  section_code: 'home_testimonials',
  order_no: 0,
  active: false,
  stars: 5,
  image_url: '',
  image_alt: '',
  author_name: '',
  author_job: '',
  testimonial_translations: [
    { lang_code: 'tr', content: '' },
    { lang_code: 'en', content: '' },
    { lang_code: 'de', content: '' }
  ]
}

export default function AdminTestimonials () {
  const supabase = createSupabaseBrowserClient()

  // State
  const [items, setItems] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'approved' | 'pending'>('approved')
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] =
    useState<Partial<Testimonial>>(DEFAULT_FORM)
  const [isSaving, setIsSaving] = useState(false)
  const [translationTab, setTranslationTab] = useState('tr')

  // --- VERİ ÇEKME ---
  const fetchItems = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('testimonials')
      .select(
        `
        *,
        testimonial_translations (id, lang_code, content)
      `
      )
      .order('order_no', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Veriler yüklenirken hata oluştu.')
    } else {
      setItems(data as Testimonial[])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const filteredItems = items.filter(item =>
    activeTab === 'approved' ? item.active : !item.active
  )

  const toggleRow = (id: number) => {
    if (expandedRowId === id) setExpandedRowId(null)
    else setExpandedRowId(id)
  }

  // --- CRUD İŞLEMLERİ ---
  const handleCreateNew = () => {
    setEditingItem(JSON.parse(JSON.stringify(DEFAULT_FORM)))
    setIsModalOpen(true)
  }

  const handleEdit = (item: Testimonial) => {
    const existingTrans = item.testimonial_translations || []
    const mergedTrans = ['tr', 'en', 'de'].map(code => {
      const found = existingTrans.find(t => t.lang_code === code)
      return found ? found : { lang_code: code, content: '' }
    })

    setEditingItem({ ...item, testimonial_translations: mergedTrans })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bu yorumu kalıcı olarak silmek istiyor musunuz?')) return
    const { error } = await supabase.from('testimonials').delete().eq('id', id)
    if (error) toast.error('Hata: ' + error.message)
    else {
      toast.success('Silindi.')
      fetchItems()
    }
  }

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from('testimonials')
      .update({ active: !currentStatus })
      .eq('id', id)
    if (error) toast.error('Hata oluştu')
    else {
      toast.success(currentStatus ? 'Pasife alındı' : 'Yayına alındı')
      fetchItems()
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const baseData = {
        section_code: editingItem.section_code,
        order_no: editingItem.order_no,
        active: editingItem.active,
        stars: editingItem.stars,
        image_url: editingItem.image_url || null,
        image_alt: editingItem.image_alt || editingItem.author_name,
        author_name: editingItem.author_name,
        author_job: editingItem.author_job
      }

      let testimonialId = editingItem.id
      if (testimonialId) {
        const { error } = await supabase
          .from('testimonials')
          .update(baseData)
          .eq('id', testimonialId)
        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('testimonials')
          .insert(baseData)
          .select()
          .single()
        if (error) throw error
        testimonialId = data.id
      }

      if (editingItem.testimonial_translations && testimonialId) {
        const translationsToUpsert = editingItem.testimonial_translations
          .filter(t => t.content.trim() !== '')
          .map(t => ({
            testimonial_id: testimonialId,
            lang_code: t.lang_code,
            content: t.content,
            ...(t.id ? { id: t.id } : {})
          }))

        if (translationsToUpsert.length > 0) {
          const { error: transError } = await supabase
            .from('testimonial_translations')
            .upsert(translationsToUpsert, {
              onConflict: 'testimonial_id, lang_code'
            })
          if (transError) throw transError
        }
      }
      toast.success('Kaydedildi!')
      setIsModalOpen(false)
      fetchItems()
    } catch (err: any) {
      toast.error('Hata: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAutoTranslate = () => {
    const trText = editingItem.testimonial_translations?.find(
      t => t.lang_code === 'tr'
    )?.content
    if (!trText) {
      toast.error('Türkçe içerik giriniz.')
      return
    }
    const newTrans = editingItem.testimonial_translations?.map(t =>
      t.lang_code !== 'tr' && t.content.length < 3
        ? { ...t, content: `[${t.lang_code.toUpperCase()}] ${trText}` }
        : t
    )
    setEditingItem({ ...editingItem, testimonial_translations: newTrans })
    toast.success('Taslak çeviri yapıldı.')
  }

  const updateTranslation = (lang: string, val: string) => {
    const updated = editingItem.testimonial_translations?.map(t =>
      t.lang_code === lang ? { ...t, content: val } : t
    )
    setEditingItem({ ...editingItem, testimonial_translations: updated })
  }

  return (
    <div className='space-y-6 pb-20'>
      {/* Header */}
      <div className='admin-page-header'>
        <div>
          <h1 className='admin-page-title'>Yorum Yönetimi</h1>
          <p className='text-[var(--admin-muted)] text-sm'>
            Müşteri yorumlarını listeleyin ve yönetin.
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className='btn-admin btn-admin-primary gap-2 w-full sm:w-auto justify-center'
        >
          <SlPlus /> Yeni Ekle
        </button>
      </div>

      {/* Tabs */}
      <div className='flex gap-2 border-b border-[var(--admin-card-border)] pb-1 overflow-x-auto scrollbar-hide'>
        <button
          onClick={() => {
            setActiveTab('approved')
            setExpandedRowId(null)
          }}
          className={`btn-admin whitespace-nowrap ${
            activeTab === 'approved'
              ? 'btn-admin-primary'
              : 'btn-admin-secondary border-transparent shadow-none'
          }`}
        >
          Yayındakiler{' '}
          <span className='ml-2 badge-admin badge-admin-success bg-white/20 text-current'>
            {items.filter(i => i.active).length}
          </span>
        </button>
        <button
          onClick={() => {
            setActiveTab('pending')
            setExpandedRowId(null)
          }}
          className={`btn-admin whitespace-nowrap ${
            activeTab === 'pending'
              ? 'btn-admin-primary'
              : 'btn-admin-secondary border-transparent shadow-none'
          }`}
        >
          Taslaklar{' '}
          <span className='ml-2 badge-admin badge-admin-default bg-black/10 text-current'>
            {items.filter(i => !i.active).length}
          </span>
        </button>
      </div>

      {/* --- LİSTE ALANI --- */}
      <div className='card-admin p-0 overflow-hidden bg-transparent border-0 shadow-none'>
        {loading ? (
          <div className='p-10 text-center text-[var(--admin-muted)]'>
            Yükleniyor...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className='p-10 text-center text-[var(--admin-muted)] border-2 border-dashed rounded-lg border-[var(--admin-input-border)]'>
            Kayıt bulunamadı.
          </div>
        ) : (
          <>
            {/* 1. MOBİL KART GÖRÜNÜMÜ (md:hidden) */}
            <div className='block md:hidden space-y-4'>
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className='card-admin p-4 flex flex-col gap-4 bg-[var(--admin-card)]'
                >
                  {/* Üst: Profil ve Info */}
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex items-center gap-3'>
                      <div className='w-12 h-12 rounded-full bg-[var(--admin-input-bg)] overflow-hidden flex-shrink-0 relative border border-[var(--admin-card-border)]'>
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt=''
                            fill
                            className='object-cover'
                          />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center font-bold opacity-40 text-lg'>
                            {item.author_name?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className='font-bold text-[var(--admin-fg)]'>
                          {item.author_name}
                        </h3>
                        <div className='text-xs text-[var(--admin-muted)]'>
                          {item.author_job}
                        </div>
                        <div className='flex items-center gap-1 text-[var(--admin-info)] text-xs mt-1'>
                          <SlStar /> {item.stars}
                        </div>
                      </div>
                    </div>
                    <div className='font-mono text-xs opacity-50 bg-[var(--admin-input-bg)] px-2 py-1 rounded'>
                      #{item.order_no}
                    </div>
                  </div>

                  {/* İçerik Özeti */}
                  <div className='bg-[var(--admin-input-bg)] p-3 rounded-lg text-sm text-[var(--admin-muted)] italic line-clamp-3'>
                    "
                    {item.testimonial_translations.find(
                      t => t.lang_code === 'tr'
                    )?.content || 'İçerik yok'}
                    "
                  </div>

                  {/* Aksiyonlar */}
                  <div className='grid grid-cols-2 gap-2 mt-auto'>
                    <button
                      onClick={() => handleEdit(item)}
                      className='btn-admin btn-admin-secondary justify-center text-sm gap-2'
                    >
                      <SlPencil /> Düzenle
                    </button>
                    <button
                      onClick={() => handleToggleStatus(item.id, item.active)}
                      className={`btn-admin justify-center text-sm gap-2 ${
                        item.active
                          ? 'btn-admin-secondary text-[var(--admin-danger)] border-[var(--admin-danger)]'
                          : 'btn-admin-success text-white'
                      }`}
                    >
                      {item.active ? 'Kaldır' : 'Yayınla'}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className='btn-admin btn-admin-danger col-span-2 justify-center text-sm gap-2'
                    >
                      <SlTrash /> Sil
                    </button>
                  </div>
                </div>
              ))}
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
                    <th className='py-4 pl-4 w-16 text-center'>#ID</th>
                    <th className='py-4 px-4'>Kişi / Yazar</th>
                    <th className='py-4 px-4'>Meslek</th>
                    <th className='py-4 px-4 w-24'>Puan</th>
                    <th className='py-4 px-4 w-20 text-center'>Sıra</th>
                    <th className='py-4 px-4 w-28 text-center'>Durum</th>
                    <th className='py-4 px-4 w-16 text-center'>Detay</th>
                  </tr>
                </thead>
                <tbody
                  className='divide-y'
                  style={{ borderColor: 'var(--admin-card-border)' }}
                >
                  {filteredItems.map(item => {
                    const isExpanded = expandedRowId === item.id
                    const trContent = item.testimonial_translations.find(
                      t => t.lang_code === 'tr'
                    )?.content

                    return (
                      <React.Fragment key={item.id}>
                        <tr
                          className={`group transition-colors hover:bg-[var(--admin-input-bg)] cursor-pointer ${
                            isExpanded ? 'bg-[var(--admin-input-bg)]' : ''
                          }`}
                          onClick={() => toggleRow(item.id)}
                        >
                          <td className='py-3 pl-4 text-center font-mono opacity-50'>
                            {item.id}
                          </td>
                          <td className='py-3 px-4'>
                            <div className='flex items-center gap-3'>
                              <div className='w-9 h-9 rounded-full bg-[var(--admin-input-bg)] overflow-hidden flex-shrink-0 relative border border-[var(--admin-card-border)]'>
                                {item.image_url ? (
                                  <Image
                                    src={item.image_url}
                                    alt=''
                                    fill
                                    className='object-cover'
                                  />
                                ) : (
                                  <div className='w-full h-full flex items-center justify-center font-bold opacity-40'>
                                    {item.author_name?.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <span className='font-medium text-[var(--admin-fg)]'>
                                {item.author_name}
                              </span>
                            </div>
                          </td>
                          <td className='py-3 px-4 text-sm text-[var(--admin-muted)]'>
                            {item.author_job}
                          </td>
                          <td className='py-3 px-4 text-[var(--admin-info)] font-bold text-sm'>
                            {item.stars} ★
                          </td>
                          <td className='py-3 px-4 text-center font-mono text-sm opacity-60'>
                            {item.order_no}
                          </td>
                          <td className='py-3 px-4 text-center'>
                            <span
                              className={`badge-admin ${
                                item.active
                                  ? 'badge-admin-success'
                                  : 'badge-admin-default'
                              }`}
                            >
                              {item.active ? 'Aktif' : 'Pasif'}
                            </span>
                          </td>
                          <td className='py-3 px-4 text-center opacity-50'>
                            {isExpanded ? <SlArrowUp /> : <SlArrowDown />}
                          </td>
                        </tr>

                        {/* EXPANDED ROW (Masaüstü Detay) */}
                        {isExpanded && (
                          <tr className='bg-[var(--admin-bg)]'>
                            <td colSpan={7} className='p-0'>
                              <div className='p-6 border-b border-[var(--admin-card-border)] flex gap-6'>
                                <div className='flex-1 space-y-2'>
                                  <h4 className='text-xs font-bold uppercase text-[var(--admin-muted)]'>
                                    Yorum İçeriği (TR)
                                  </h4>
                                  <div className='p-4 rounded-lg bg-[var(--admin-card)] border border-[var(--admin-card-border)] italic text-[var(--admin-fg)] opacity-90'>
                                    "{trContent || 'İçerik girilmemiş'}"
                                  </div>
                                  <div className='flex items-center gap-2 text-xs text-[var(--admin-muted)] mt-2'>
                                    <SlCalender />{' '}
                                    {new Date(
                                      item.created_at
                                    ).toLocaleDateString('tr-TR')}
                                  </div>
                                </div>
                                <div className='flex flex-col gap-2 min-w-[180px] border-l pl-6 border-[var(--admin-card-border)]'>
                                  <h4 className='text-xs font-bold uppercase text-[var(--admin-muted)] mb-1'>
                                    İşlemler
                                  </h4>
                                  <button
                                    onClick={e => {
                                      e.stopPropagation()
                                      handleEdit(item)
                                    }}
                                    className='btn-admin btn-admin-secondary justify-start gap-2 text-sm'
                                  >
                                    <SlPencil /> Düzenle
                                  </button>
                                  <button
                                    onClick={e => {
                                      e.stopPropagation()
                                      handleToggleStatus(item.id, item.active)
                                    }}
                                    className='btn-admin btn-admin-secondary justify-start gap-2 text-sm'
                                  >
                                    {item.active ? (
                                      <>
                                        <SlClose /> Yayından Kaldır
                                      </>
                                    ) : (
                                      <>
                                        <SlCheck /> Yayına Al
                                      </>
                                    )}
                                  </button>
                                  <button
                                    onClick={e => {
                                      e.stopPropagation()
                                      handleDelete(item.id)
                                    }}
                                    className='btn-admin btn-admin-danger justify-start gap-2 text-sm mt-auto'
                                  >
                                    <SlTrash /> Sil
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in'>
          <div className='card-admin w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 shadow-2xl relative bg-[var(--admin-card)]'>
            {/* Header */}
            <div className='p-5 border-b border-[var(--admin-card-border)] flex justify-between items-center bg-[var(--admin-input-bg)]'>
              <h2 className='text-lg font-bold text-[var(--admin-fg)]'>
                {editingItem.id ? 'Yorumu Düzenle' : 'Yeni Yorum Ekle'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className='text-[var(--admin-muted)] hover:text-[var(--admin-fg)] p-1'
              >
                <SlClose size={24} />
              </button>
            </div>

            {/* Body */}
            <div className='p-6 overflow-y-auto flex-1'>
              <form
                id='testimonialForm'
                onSubmit={handleSave}
                className='space-y-6'
              >
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <label className='admin-label'>Ad Soyad</label>
                    <input
                      required
                      className='admin-input'
                      value={editingItem.author_name || ''}
                      onChange={e =>
                        setEditingItem({
                          ...editingItem,
                          author_name: e.target.value
                        })
                      }
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='admin-label'>Ünvan / Meslek</label>
                    <input
                      className='admin-input'
                      value={editingItem.author_job || ''}
                      onChange={e =>
                        setEditingItem({
                          ...editingItem,
                          author_job: e.target.value
                        })
                      }
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                  <div className='space-y-2'>
                    <label className='admin-label'>Puan (Yıldız)</label>
                    <select
                      className='admin-select'
                      value={editingItem.stars}
                      onChange={e =>
                        setEditingItem({
                          ...editingItem,
                          stars: Number(e.target.value)
                        })
                      }
                    >
                      {[5, 4, 3, 2, 1].map(s => (
                        <option key={s} value={s}>
                          {s} Yıldız
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className='space-y-2'>
                    <label className='admin-label'>Sıralama</label>
                    <input
                      type='number'
                      className='admin-input'
                      value={editingItem.order_no}
                      onChange={e =>
                        setEditingItem({
                          ...editingItem,
                          order_no: Number(e.target.value)
                        })
                      }
                    />
                  </div>
                  <div className='space-y-2 flex items-end pb-2'>
                    <label className='flex items-center gap-2 cursor-pointer select-none'>
                      <input
                        type='checkbox'
                        className='w-5 h-5 accent-[var(--admin-success)]'
                        checked={editingItem.active}
                        onChange={e =>
                          setEditingItem({
                            ...editingItem,
                            active: e.target.checked
                          })
                        }
                      />
                      <span className='text-sm font-medium text-[var(--admin-fg)]'>
                        Yayında
                      </span>
                    </label>
                  </div>
                </div>

                <div className='space-y-2'>
                  <label className='admin-label flex items-center gap-2'>
                    <SlPicture /> Profil Resmi URL
                  </label>
                  <input
                    type='text'
                    className='admin-input'
                    placeholder='https://...'
                    value={editingItem.image_url || ''}
                    onChange={e =>
                      setEditingItem({
                        ...editingItem,
                        image_url: e.target.value
                      })
                    }
                  />
                </div>

                {/* Çeviri Alanı */}
                <div className='border-t border-[var(--admin-card-border)] pt-4 mt-2'>
                  <div className='flex justify-between items-center mb-3'>
                    <div className='flex gap-2'>
                      {['tr', 'en', 'de'].map(l => (
                        <button
                          type='button'
                          key={l}
                          onClick={() => setTranslationTab(l)}
                          className={`px-3 py-1 text-xs font-bold uppercase rounded border transition-colors ${
                            translationTab === l
                              ? 'bg-[var(--admin-accent)] text-[var(--admin-bg)] border-transparent'
                              : 'bg-[var(--admin-input-bg)] text-[var(--admin-muted)] border-[var(--admin-input-border)] hover:text-[var(--admin-fg)]'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                    <button
                      type='button'
                      onClick={handleAutoTranslate}
                      className='text-xs text-[var(--admin-info)] hover:underline flex items-center gap-1'
                    >
                      <SlRefresh /> Otomatik Çevir
                    </button>
                  </div>

                  <textarea
                    className='admin-textarea h-32'
                    placeholder={`${translationTab.toUpperCase()} dilinde yorum içeriği...`}
                    value={
                      editingItem.testimonial_translations?.find(
                        t => t.lang_code === translationTab
                      )?.content || ''
                    }
                    onChange={e =>
                      updateTranslation(translationTab, e.target.value)
                    }
                  />
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className='p-5 border-t border-[var(--admin-card-border)] bg-[var(--admin-input-bg)] flex justify-end gap-3'>
              <button
                type='button'
                onClick={() => setIsModalOpen(false)}
                className='btn-admin btn-admin-secondary px-6'
              >
                İptal
              </button>
              <button
                form='testimonialForm'
                type='submit'
                disabled={isSaving}
                className='btn-admin btn-admin-primary px-6 gap-2'
              >
                <SlCheck /> {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
