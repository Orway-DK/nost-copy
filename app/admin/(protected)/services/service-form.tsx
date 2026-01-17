'use client'

import { useState } from 'react'
import {
  IoSave,
  IoSparkles,
  IoImageOutline,
  IoGlobeOutline
} from 'react-icons/io5'
import { toast } from 'react-hot-toast'
import { translateTextAction } from '@/app/actions/translate'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import ImageUploadModal from '../_components/image-upload-modal'
import Image from 'next/image'

// Slug oluşturucu yardımcı fonksiyon
const slugify = (text: string) => {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

export default function ServiceForm ({
  initialData,
  onSuccess,
  onCancel,
  filter
}: {
  initialData: any
  onSuccess: () => void
  onCancel: () => void
  filter?: string
}) {
  const [activeLang, setActiveLang] = useState('tr')
  const [loading, setLoading] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  // State yapısına slug eklendi
  const [formData, setFormData] = useState({
    image_url: initialData?.image_url || '',
    active: initialData?.active ?? true,
    translations: initialData?.service_translations?.reduce(
      (acc: any, t: any) => {
        acc[t.lang_code] = {
          title: t.title || '',
          content: t.content || '',
          slug: t.slug || ''
        }
        return acc
      },
      {
        tr: { title: '', content: '', slug: '' },
        en: { title: '', content: '', slug: '' },
        de: { title: '', content: '', slug: '' }
      }
    ) || {
      tr: { title: '', content: '', slug: '' },
      en: { title: '', content: '', slug: '' },
      de: { title: '', content: '', slug: '' }
    }
  })

  const updateTrans = (field: 'title' | 'content' | 'slug', value: string) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [activeLang]: { ...prev.translations[activeLang], [field]: value }
      }
    }))
  }

  const handleAutoTranslate = async () => {
    const source = formData.translations[activeLang]
    if (!source.title) return toast.error('Önce kaynak dilde bir başlık yazın.')

    setTranslating(true)
    const newTrans = { ...formData.translations }
    const targetLangs = (['tr', 'en', 'de'] as const).filter(
      l => l !== activeLang
    )

    try {
      for (const lang of targetLangs) {
        // Başlığı çevir
        const tTitle = await translateTextAction(source.title, lang)
        newTrans[lang].title = tTitle

        // Slug'ı çevrilen başlığa göre otomatik oluştur
        newTrans[lang].slug = slugify(tTitle)

        // İçeriği çevir
        if (source.content) {
          newTrans[lang].content = await translateTextAction(
            source.content,
            lang
          )
        }
      }
      setFormData(prev => ({ ...prev, translations: newTrans }))
      toast.success("Tüm diller ve URL'ler çevrildi! ✨")
    } catch (err) {
      toast.error('Çeviri sırasında bir hata oluştu.')
    } finally {
      setTranslating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createSupabaseBrowserClient()

    // Yeni tablo adlarını belirle
    const tableName = filter === 'products' ? 'nost-product-pages' : 'nost-service-pages'
    const translationsTable = filter === 'products' ? 'nost_product_page_translations' : 'nost_service_page_translations'

    try {
      // 1. Ana Sayfa Kaydı
      const { data: sData, error: sErr } = await supabase
        .from(tableName)
        .upsert({
          id: initialData?.id,
          image_url: formData.image_url,
          active: formData.active,
          // Ana tabloda slug (TR slug'ı kullan)
          slug: formData.translations.tr.slug
        })
        .select()
        .single()

      if (sErr) throw sErr

      // 2. Çevirileri Kaydet (Slug dahil)
      await supabase
        .from(translationsTable)
        .delete()
        .eq('page_id', sData.id)

      const transPayload = Object.entries(formData.translations).map(
        ([lang, val]: any) => ({
          page_id: sData.id,
          lang_code: lang,
          title: val.title,
          content: val.content,
          slug: val.slug // Dile özel slug kaydediliyor
        })
      )

      const { error: tErr } = await supabase
        .from(translationsTable)
        .insert(transPayload)
      if (tErr) throw tErr

      toast.success('Hizmet başarıyla kaydedildi.')
      onSuccess()
    } catch (err: any) {
      toast.error('Hata: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='space-y-8'>
      {/* Dil Seçici */}
      <div className='flex gap-1 bg-[var(--admin-input-bg)] p-1 rounded-xl w-fit border border-[var(--admin-card-border)]'>
        {['tr', 'en', 'de'].map(l => (
          <button
            key={l}
            type='button'
            onClick={() => setActiveLang(l)}
            className={`px-6 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
              activeLang === l
                ? 'bg-[var(--admin-card)] shadow-lg text-[var(--primary)]'
                : 'opacity-50 hover:opacity-100'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Başlık ve Çeviri Butonu */}
        <div>
          <div className='flex justify-between items-end mb-2'>
            <label className='text-xs font-bold uppercase opacity-60'>
              Sayfa Başlığı ({activeLang})
            </label>
            <button
              type='button'
              onClick={handleAutoTranslate}
              disabled={translating}
              className='text-xs font-bold text-blue-500 flex items-center gap-1 hover:text-blue-600 transition-colors'
            >
              <IoSparkles />{' '}
              {translating ? 'Çevriliyor...' : "Dillere ve URL'lere Çevir"}
            </button>
          </div>
          <input
            className='admin-input w-full text-lg font-bold'
            value={formData.translations[activeLang].title}
            onChange={e => {
              updateTrans('title', e.target.value)
              // Başlık yazılırken slug'ı da (eğer boşsa veya manuel düzenlenmiyorsa) güncelle
              if (activeLang === 'tr')
                updateTrans('slug', slugify(e.target.value))
            }}
            placeholder='Başlık girin...'
            required
          />
        </div>

        {/* Görsel ve URL (Slug) Alanı */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='md:col-span-1'>
            <label className='text-xs font-bold uppercase opacity-60 mb-2 block'>
              Kapak Görseli
            </label>
            <div
              onClick={() => setIsUploadOpen(true)}
              className='relative aspect-video rounded-xl border-2 border-dashed border-[var(--admin-card-border)] bg-[var(--admin-input-bg)] overflow-hidden cursor-pointer group hover:border-[var(--primary)] transition-all'
            >
              {formData.image_url ? (
                <>
                  <Image
                    src={formData.image_url}
                    alt='Kapak'
                    fill
                    className='object-cover'
                    sizes='300px'
                  />
                  <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity'>
                    Görseli Değiştir
                  </div>
                </>
              ) : (
                <div className='h-full flex flex-col items-center justify-center text-[var(--admin-muted)] gap-2'>
                  <IoImageOutline size={30} />
                  <span className='text-[10px]'>Görsel Yükle</span>
                </div>
              )}
            </div>
          </div>

          <div className='md:col-span-2 space-y-4'>
            <div>
              <label className='text-xs font-bold uppercase opacity-60 mb-1 block underline'>
                Dile Özel URL (Slug)
              </label>
              <div className='relative'>
                <span className='absolute left-3 top-1/2 -translate-y-1/2 text-[10px] opacity-40 font-mono'>
                  /{activeLang}/
                </span>
                <input
                  className='admin-input w-full font-mono text-sm pl-12'
                  value={formData.translations[activeLang].slug}
                  onChange={e => updateTrans('slug', slugify(e.target.value))}
                  placeholder='kutu-harf'
                  required
                />
              </div>
              <p className='text-[9px] mt-1 text-[var(--admin-muted)]'>
                Her dil için farklı bir URL tanımlayabilirsiniz.
              </p>
            </div>
            <div className='flex items-center gap-3 p-4 bg-[var(--admin-input-bg)] rounded-xl border border-[var(--admin-card-border)]'>
              <input
                type='checkbox'
                className='w-5 h-5 rounded'
                checked={formData.active}
                onChange={e =>
                  setFormData({ ...formData, active: e.target.checked })
                }
                id='active-check'
              />
              <label
                htmlFor='active-check'
                className='text-sm font-bold cursor-pointer'
              >
                Sitede Yayında
              </label>
            </div>
          </div>
        </div>

        {/* İçerik Area */}
        <div>
          <label className='text-xs font-bold uppercase opacity-60 mb-2 block'>
            İçerik Metni ({activeLang})
          </label>
          <textarea
            className='admin-input w-full min-h-[300px] text-sm leading-relaxed p-4 scrollbar-thin'
            value={formData.translations[activeLang].content}
            onChange={e => updateTrans('content', e.target.value)}
            placeholder='HTML etiketleri kullanabilirsiniz...'
          />
        </div>

        {/* Footer Butonlar */}
        <div className='flex justify-end gap-3 sticky bottom-0 bg-[var(--admin-card)] py-4 border-t border-[var(--admin-card-border)] z-10'>
          <button
            type='button'
            onClick={onCancel}
            className='px-6 py-2 text-sm font-bold opacity-50 hover:opacity-100 transition-opacity'
          >
            Vazgeç
          </button>
          <button
            type='submit'
            disabled={loading}
            className='btn-admin btn-admin-primary px-10 py-3 shadow-lg'
          >
            <IoSave className='mr-2' size={18} />{' '}
            {loading ? 'Kaydediliyor...' : 'Tüm Dilleri Kaydet'}
          </button>
        </div>
      </form>

      {/* MODAL */}
      {isUploadOpen && (
        <ImageUploadModal
          bucket={filter === 'products' ? 'products' : 'services'}
          onClose={() => setIsUploadOpen(false)}
          onSelect={url => setFormData({ ...formData, image_url: url })}
        />
      )}
    </div>
  )
}
