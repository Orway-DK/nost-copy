// C:\Projeler\nost-copy\app\admin\(protected)\showcase\landing\_components\SlidesManager.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { upsertSlideAction, deleteSlideAction } from '../actions'
import {
  IoAdd,
  IoPencil,
  IoTrash,
  IoClose,
  IoSave,
  IoImageOutline
} from 'react-icons/io5'
import MediaPickerModal from '@/app/admin/(protected)/_components/MediaPickerModal'

const LANGS = ['tr', 'en', 'de']

// YARDIMCI: Image URL
const getImageUrl = (path: string | null) => {
  if (!path) return null
  if (path.startsWith('http') || path.startsWith('/')) return path
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sliders/${path}`
}

export default function SlidesManager ({
  initialSlides
}: {
  initialSlides: any[]
}) {
  const router = useRouter()
  const [editing, setEditing] = useState<any | null>(null)
  const [isMediaOpen, setIsMediaOpen] = useState(false)
  const [activeLang, setActiveLang] = useState('tr')
  const [saving, setSaving] = useState(false)

  // Yeni Ekleme
  const handleAddNew = () => {
    setEditing({
      id: null,
      image_link: '',
      order_no: initialSlides.length + 1,
      active: true,
      translations: LANGS.map(l => ({
        lang_code: l,
        title1: '',
        title2: '',
        text: '',
        button_link: '',
        tips: []
      }))
    })
  }

  // Düzenleme Moduna Geç
  const handleEdit = (slide: any) => {
    const transMap: any = {}
    slide.landing_slide_translations.forEach(
      (t: any) => (transMap[t.lang_code] = t)
    )

    const translations = LANGS.map(l => ({
      lang_code: l,
      id: transMap[l]?.id,
      title1: transMap[l]?.title1 || '',
      title2: transMap[l]?.title2 || '',
      text: transMap[l]?.text || '',
      button_link: transMap[l]?.button_link || '',
      tips: transMap[l]?.tips || []
    }))

    setEditing({ ...slide, translations })
  }

  // Kaydet
  const handleSave = async () => {
    if (!editing) return
    setSaving(true)

    const res = await upsertSlideAction(editing)
    setSaving(false)

    if (res.success) {
      setEditing(null)
      router.refresh()
    } else {
      alert('Hata: ' + res.message)
    }
  }

  // Sil
  const handleDelete = async (id: number) => {
    if (!confirm('Silmek istediğinize emin misiniz?')) return
    const res = await deleteSlideAction(id)
    if (res.success) router.refresh()
    else alert(res.message)
  }

  // Form Helper
  const updateMain = (k: string, v: any) => setEditing({ ...editing, [k]: v })
  const updateTrans = (lang: string, k: string, v: any) => {
    const newTrans = editing.translations.map((t: any) =>
      t.lang_code === lang ? { ...t, [k]: v } : t
    )
    setEditing({ ...editing, translations: newTrans })
  }
  const updateTips = (lang: string, val: string) => {
    const arr = val.split('\n')
    updateTrans(lang, 'tips', arr)
  }

  // --- FORM VIEW ---
  if (editing) {
    const tData = editing.translations.find(
      (t: any) => t.lang_code === activeLang
    )
    const imgUrl = getImageUrl(editing.image_link)

    return (
      <div className='card-admin p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 shadow-lg'>
        <div
          className='flex justify-between items-center border-b pb-4'
          style={{ borderColor: 'var(--admin-card-border)' }}
        >
          <h3
            className='text-lg font-bold'
            style={{ color: 'var(--admin-fg)' }}
          >
            {editing.id ? 'Slayt Düzenle' : 'Yeni Slayt'}
          </h3>
          <button
            onClick={() => setEditing(null)}
            className='p-2 hover:bg-[var(--admin-input-bg)] rounded-full transition-colors'
            style={{ color: 'var(--admin-muted)' }}
          >
            <IoClose size={24} />
          </button>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Görsel Seçimi */}
          <div className='space-y-3'>
            <label className='admin-label'>Görsel</label>
            <div className='flex gap-2'>
              <input
                className='admin-input flex-1'
                value={editing.image_link}
                readOnly
                placeholder='Dosya seçin...'
              />
              <button
                onClick={() => setIsMediaOpen(true)}
                className='btn-admin btn-admin-secondary whitespace-nowrap'
              >
                Seç
              </button>
            </div>
            <div
              className='relative aspect-video w-full rounded-lg border mt-2 flex items-center justify-center bg-[var(--admin-input-bg)] overflow-hidden'
              style={{ borderColor: 'var(--admin-card-border)' }}
            >
              {imgUrl ? (
                <Image
                  src={imgUrl}
                  alt='preview'
                  fill
                  className='object-cover'
                  unoptimized
                />
              ) : (
                <div className='flex flex-col items-center opacity-30'>
                  <IoImageOutline size={48} />
                  <span className='text-xs mt-2'>Önizleme Yok</span>
                </div>
              )}
            </div>

            <div className='grid grid-cols-2 gap-4 pt-2'>
              <div>
                <label className='admin-label'>Sıra</label>
                <input
                  type='number'
                  className='admin-input'
                  value={editing.order_no}
                  onChange={e =>
                    updateMain('order_no', parseInt(e.target.value))
                  }
                />
              </div>
              <div>
                <label className='admin-label'>Durum</label>
                <select
                  className='admin-select'
                  value={editing.active ? 'true' : 'false'}
                  onChange={e =>
                    updateMain('active', e.target.value === 'true')
                  }
                >
                  <option value='true'>Aktif</option>
                  <option value='false'>Pasif</option>
                </select>
              </div>
            </div>
          </div>

          {/* İçerik ve Çeviri */}
          <div
            className='border rounded-xl p-5'
            style={{
              backgroundColor: 'var(--admin-bg)',
              borderColor: 'var(--admin-card-border)'
            }}
          >
            <div
              className='flex gap-2 border-b mb-6 overflow-x-auto pb-1'
              style={{ borderColor: 'var(--admin-card-border)' }}
            >
              {LANGS.map(l => (
                <button
                  key={l}
                  onClick={() => setActiveLang(l)}
                  className={`px-4 py-2 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                    activeLang === l
                      ? 'border-[var(--admin-accent)] text-[var(--admin-accent)]'
                      : 'border-transparent text-[var(--admin-muted)] hover:text-[var(--admin-fg)]'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            <div className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='admin-label'>Başlık 1 (Büyük)</label>
                  <input
                    className='admin-input'
                    value={tData.title1}
                    onChange={e =>
                      updateTrans(activeLang, 'title1', e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className='admin-label'>Başlık 2 (İnce)</label>
                  <input
                    className='admin-input'
                    value={tData.title2}
                    onChange={e =>
                      updateTrans(activeLang, 'title2', e.target.value)
                    }
                  />
                </div>
              </div>

              <div>
                <label className='admin-label'>Açıklama Metni</label>
                <textarea
                  className='admin-textarea h-24'
                  value={tData.text}
                  onChange={e =>
                    updateTrans(activeLang, 'text', e.target.value)
                  }
                />
              </div>

              <div>
                <label className='admin-label'>Buton Linki</label>
                <input
                  className='admin-input'
                  value={tData.button_link}
                  onChange={e =>
                    updateTrans(activeLang, 'button_link', e.target.value)
                  }
                  placeholder='/...'
                />
              </div>

              <div>
                <label className='admin-label flex justify-between'>
                  İpuçları (Her satıra bir tane)
                  <span className='text-xs font-normal opacity-50'>
                    Örn: Hızlı Kargo
                  </span>
                </label>
                <textarea
                  className='admin-textarea h-24 font-mono text-sm'
                  value={tData.tips.join('\n')}
                  onChange={e => updateTips(activeLang, e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          className='flex justify-end pt-6 gap-3 border-t'
          style={{ borderColor: 'var(--admin-card-border)' }}
        >
          <button
            onClick={() => setEditing(null)}
            className='btn-admin btn-admin-secondary px-6'
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className='btn-admin btn-admin-primary px-8 flex items-center gap-2 shadow-md'
          >
            <IoSave /> {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>

        <MediaPickerModal
          isOpen={isMediaOpen}
          onClose={() => setIsMediaOpen(false)}
          onSelect={url => updateMain('image_link', url)}
          bucketName='sliders'
        />
      </div>
    )
  }

  // --- LIST VIEW ---
  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h2 className='text-lg font-bold text-[var(--admin-fg)]'>
          Slider Listesi
        </h2>
        <button
          onClick={handleAddNew}
          className='btn-admin btn-admin-primary flex items-center gap-2'
        >
          <IoAdd size={18} /> Yeni Slayt
        </button>
      </div>

      <div className='grid gap-4'>
        {initialSlides.map(slide => {
          const imgUrl = getImageUrl(slide.image_link)
          return (
            <div
              key={slide.id}
              className='flex flex-col sm:flex-row items-center gap-4 card-admin p-4 shadow-sm hover:shadow-md transition-all group border-l-4 border-transparent hover:border-l-[var(--admin-accent)]'
            >
              {/* Görsel */}
              <div
                className='relative w-full sm:w-40 aspect-video bg-[var(--admin-input-bg)] rounded-lg overflow-hidden flex-shrink-0 border'
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
                  <div className='w-full h-full flex items-center justify-center opacity-20'>
                    <IoImageOutline size={32} />
                  </div>
                )}
                <div className='absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded font-mono'>
                  #{slide.order_no}
                </div>
              </div>

              {/* İçerik */}
              <div className='flex-1 w-full text-center sm:text-left'>
                <div className='font-bold text-sm mb-1 text-[var(--admin-fg)] line-clamp-1'>
                  {slide.landing_slide_translations?.find(
                    (t: any) => t.lang_code === 'tr'
                  )?.title1 || '(Başlık Yok)'}
                </div>
                <div className='text-xs text-[var(--admin-muted)] line-clamp-2'>
                  {slide.landing_slide_translations?.find(
                    (t: any) => t.lang_code === 'tr'
                  )?.text || '-'}
                </div>
                {!slide.active && (
                  <span className='badge-admin badge-admin-default mt-2'>
                    Pasif
                  </span>
                )}
              </div>

              {/* Butonlar */}
              <div
                className='flex gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0'
                style={{ borderColor: 'var(--admin-card-border)' }}
              >
                <button
                  onClick={() => handleEdit(slide)}
                  className='btn-admin btn-admin-secondary p-2 aspect-square flex items-center justify-center'
                  title='Düzenle'
                >
                  <IoPencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(slide.id)}
                  className='btn-admin btn-admin-danger p-2 aspect-square flex items-center justify-center'
                  title='Sil'
                >
                  <IoTrash size={16} />
                </button>
              </div>
            </div>
          )
        })}
        {initialSlides.length === 0 && (
          <div
            className='text-center py-12 border-2 border-dashed rounded-xl'
            style={{ borderColor: 'var(--admin-card-border)' }}
          >
            <p className='text-[var(--admin-muted)]'>Henüz slayt eklenmemiş.</p>
          </div>
        )}
      </div>
    </div>
  )
}
