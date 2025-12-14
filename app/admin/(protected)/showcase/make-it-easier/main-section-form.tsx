// C:\Projeler\nost-copy\app\admin\(protected)\showcase\make-it-easier\main-section-form.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { saveMakeItEasierAction } from './actions'
import { translateTextAction } from '@/app/admin/actions'
import { IoSave, IoSparkles, IoImageOutline } from 'react-icons/io5'
import MediaPickerModal from '@/app/admin/(protected)/_components/MediaPickerModal'
import { toast } from 'react-hot-toast'

const LANGS = ['tr', 'en', 'de']

const getImageUrl = (path: string | null) => {
  if (!path) return null
  if (path.startsWith('http') || path.startsWith('/')) return path
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/homepage/${path}`
}

export default function MainSectionForm ({ initialData }: { initialData: any }) {
  const router = useRouter()
  const [activeLang, setActiveLang] = useState('tr')
  const [saving, setSaving] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [isMediaOpen, setIsMediaOpen] = useState(false)

  const [form, setForm] = useState(() => {
    const translations = LANGS.map(l => {
      const found = initialData?.make_it_easier_translations?.find(
        (t: any) => t.lang_code === l
      )
      return {
        lang_code: l,
        id: found?.id,
        title: found?.title || '',
        titletext: found?.titletext || '',
        tip1_icon: found?.tip1_icon || 'fa6-solid:bolt',
        tip1_title: found?.tip1_title || '',
        tip1_text: found?.tip1_text || '',
        tip2_icon: found?.tip2_icon || 'mdi:shield-check',
        tip2_title: found?.tip2_title || '',
        tip2_text: found?.tip2_text || '',
        tip3_icon: found?.tip3_icon || 'fa6-solid:handshake',
        tip3_title: found?.tip3_title || '',
        tip3_text: found?.tip3_text || ''
      }
    })

    return {
      id: initialData?.id,
      image_link: initialData?.image_link || '',
      translations
    }
  })

  const currentTrans = form.translations.find(t => t.lang_code === activeLang)!

  const updateMain = (key: string, val: any) => {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  const updateTrans = (key: string, val: any) => {
    setForm(prev => ({
      ...prev,
      translations: prev.translations.map(t =>
        t.lang_code === activeLang ? { ...t, [key]: val } : t
      )
    }))
  }

  const handleAutoTranslate = async () => {
    if (!currentTrans.title) {
      toast.error(`Lütfen önce ${activeLang.toUpperCase()} içeriğini doldurun.`)
      return
    }

    if (
      !confirm(
        `Mevcut (${activeLang.toUpperCase()}) içerik kaynak alınarak diğer diller otomatik doldurulacak. Onaylıyor musunuz?`
      )
    )
      return

    setTranslating(true)
    const loadingToast = toast.loading('Çeviriler yapılıyor...')

    try {
      const newTranslations = [...form.translations]
      const textFields = [
        'title',
        'titletext',
        'tip1_title',
        'tip1_text',
        'tip2_title',
        'tip2_text',
        'tip3_title',
        'tip3_text'
      ]

      const tasks = newTranslations.map(async (target, index) => {
        if (target.lang_code === activeLang) return

        for (const field of textFields) {
          // @ts-ignore
          const sourceText = currentTrans[field]
          if (sourceText && sourceText.trim() !== '') {
            const res = await translateTextAction(
              sourceText,
              target.lang_code,
              activeLang
            )
            if (res.success && res.text) {
              // @ts-ignore
              newTranslations[index][field] = res.text
            }
          }
        }

        newTranslations[index].tip1_icon = currentTrans.tip1_icon
        newTranslations[index].tip2_icon = currentTrans.tip2_icon
        newTranslations[index].tip3_icon = currentTrans.tip3_icon
      })

      await Promise.all(tasks)
      setForm(prev => ({ ...prev, translations: newTranslations }))
      toast.success('Çeviriler tamamlandı!', { id: loadingToast })
    } catch (error) {
      console.error(error)
      toast.error('Çeviri sırasında hata oluştu.', { id: loadingToast })
    } finally {
      setTranslating(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    const promise = saveMakeItEasierAction(form)

    toast.promise(promise, {
      loading: 'Kaydediliyor...',
      success: res => {
        if (!res.success) throw new Error(res.message)
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

  const imgUrl = getImageUrl(form.image_link)

  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
      {/* SOL: Görsel */}
      <div className='lg:col-span-1 space-y-4'>
        <div className='card-admin p-4'>
          <label className='admin-label mb-2 block'>Yan Görsel</label>
          <div
            className='relative aspect-square w-full rounded-lg overflow-hidden border flex items-center justify-center bg-[var(--admin-input-bg)]'
            style={{ borderColor: 'var(--admin-input-border)' }}
          >
            {imgUrl ? (
              <Image
                src={imgUrl}
                alt='preview'
                fill
                className='object-contain p-2'
                unoptimized
              />
            ) : (
              <div className='flex flex-col items-center opacity-30'>
                <IoImageOutline size={48} />
                <span className='text-xs mt-2'>Görsel Yok</span>
              </div>
            )}
            <button
              onClick={() => setIsMediaOpen(true)}
              className='absolute inset-0 bg-black/5 hover:bg-black/20 transition-colors flex items-center justify-center text-transparent hover:text-white font-medium'
            >
              Değiştir
            </button>
          </div>
          <input
            className='admin-input mt-2 text-xs'
            value={form.image_link}
            readOnly
          />
        </div>
      </div>

      {/* SAĞ: İçerik */}
      <div className='lg:col-span-2 space-y-6'>
        <div className='card-admin p-6 space-y-6'>
          <div
            className='flex flex-wrap justify-between items-center border-b pb-4 gap-4'
            style={{ borderColor: 'var(--admin-card-border)' }}
          >
            {/* DİL SEKMELERİ */}
            <div className='flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0'>
              <div className='flex gap-2'>
                {LANGS.map(l => (
                  <button
                    key={l}
                    onClick={() => setActiveLang(l)}
                    className={`px-4 py-2 text-sm font-bold rounded transition-colors whitespace-nowrap ${
                      activeLang === l
                        ? 'bg-[var(--admin-accent)] text-[var(--admin-bg)]'
                        : 'bg-[var(--admin-input-bg)] text-[var(--admin-muted)]'
                    }`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>

              <button
                onClick={handleAutoTranslate}
                disabled={translating}
                className='btn-admin btn-admin-secondary text-xs py-2 px-3 flex items-center gap-2 whitespace-nowrap'
                title={`Mevcut (${activeLang.toUpperCase()}) içeriği diğer dillere çevir`}
              >
                <IoSparkles
                  className={
                    translating
                      ? 'animate-spin text-yellow-500'
                      : 'text-yellow-500'
                  }
                />
                {translating ? 'Çevriliyor...' : 'Diğerlerine Dağıt'}
              </button>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className='btn-admin btn-admin-primary px-6 gap-2 w-full sm:w-auto'
            >
              <IoSave /> Kaydet
            </button>
          </div>

          <div className='space-y-4'>
            <div>
              <label className='admin-label'>Ana Başlık</label>
              <input
                className='admin-input'
                value={currentTrans.title}
                onChange={e => updateTrans('title', e.target.value)}
              />
            </div>
            <div>
              <label className='admin-label'>Alt Metin</label>
              <textarea
                className='admin-textarea h-24'
                value={currentTrans.titletext}
                onChange={e => updateTrans('titletext', e.target.value)}
              />
            </div>
          </div>

          {/* MADDELER */}
          <div
            className='grid gap-4 pt-4 border-t'
            style={{ borderColor: 'var(--admin-card-border)' }}
          >
            <h4
              className='font-semibold text-sm'
              style={{ color: 'var(--admin-fg)' }}
            >
              3 Adım (İpuçları)
            </h4>

            {[1, 2, 3].map(num => (
              <div
                key={num}
                className='p-4 rounded border grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-[var(--admin-input-bg)]'
                style={{ borderColor: 'var(--admin-input-border)' }}
              >
                <div className='sm:col-span-1 text-center font-bold opacity-50 text-xl sm:text-base'>
                  {num}
                </div>
                <div className='sm:col-span-3'>
                  <label className='text-xs opacity-60 block mb-1'>
                    İkon (Iconify)
                  </label>
                  <input
                    className='admin-input text-xs font-mono'
                    // @ts-ignore
                    value={currentTrans[`tip${num}_icon`]}
                    onChange={e =>
                      updateTrans(`tip${num}_icon`, e.target.value)
                    }
                  />
                </div>
                <div className='sm:col-span-4'>
                  <label className='text-xs opacity-60 block mb-1'>
                    Başlık
                  </label>
                  <input
                    className='admin-input text-sm'
                    // @ts-ignore
                    value={currentTrans[`tip${num}_title`]}
                    onChange={e =>
                      updateTrans(`tip${num}_title`, e.target.value)
                    }
                  />
                </div>
                <div className='sm:col-span-4'>
                  <label className='text-xs opacity-60 block mb-1'>
                    Açıklama
                  </label>
                  <input
                    className='admin-input text-sm'
                    // @ts-ignore
                    value={currentTrans[`tip${num}_text`]}
                    onChange={e =>
                      updateTrans(`tip${num}_text`, e.target.value)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <MediaPickerModal
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        onSelect={url => updateMain('image_link', url)}
        bucketName='homepage'
      />
    </div>
  )
}
