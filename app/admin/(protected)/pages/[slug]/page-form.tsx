'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { IoSave, IoSparkles, IoImageOutline } from 'react-icons/io5'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import { updatePageAction } from '../actions'
import { translateTextAction } from '@/app/actions/translate'
import RichTextEditor from '@/app/admin/_components/RichTextEditor'
import ImageUploadModal from '../../_components/image-upload-modal'
import TemplateManagerModal from '../../_components/template-manager-modal'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

const LANGS = ['tr', 'en', 'de']

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

export default function PageForm ({ 
  initialData, 
  onSuccess, 
  onCancel 
}: { 
  initialData: any
  onSuccess?: () => void
  onCancel?: () => void
}) {
  const router = useRouter()
  // initialData'yı normalize et
  const normalizeInitialData = (data: any) => {
    if (!data) {
      return {
        id: null,
        slug: '',
        image_url: '',
        active: true,
        translations: {
          tr: { title: '', content: '' },
          en: { title: '', content: '' },
          de: { title: '', content: '' }
        }
      }
    }

    // Eğer data.nost_corporate_page_translations varsa onu translations'a çevir
    const translations = data.nost_corporate_page_translations?.reduce((acc: any, t: any) => {
      acc[t.lang_code] = {
        title: t.title || '',
        content: t.content || '',
        slug: t.slug || ''
      }
      return acc
    }, {
      tr: { title: '', content: '', slug: '' },
      en: { title: '', content: '', slug: '' },
      de: { title: '', content: '', slug: '' }
    }) || {
      tr: { title: '', content: '', slug: '' },
      en: { title: '', content: '', slug: '' },
      de: { title: '', content: '', slug: '' }
    }

    return {
      id: data.id,
      slug: data.slug,
      image_url: data.image_url || '',
      active: data.active ?? true,
      page_type: data.page_type || 'standard', // 'standard' veya 'manual'
      template: data.template || '', // boş veya template adı (grafik-tasarim)
      translations
    }
  }

  const [formData, setFormData] = useState(() => {
    const normalized = normalizeInitialData(initialData)
    return normalized
  })
  const [activeLang, setActiveLang] = useState('tr')
  const [saving, setSaving] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [templates, setTemplates] = useState<{ slug: string; name: string }[]>([])
  const supabase = createSupabaseBrowserClient()

  // Template'leri veritabanından çek
  useEffect(() => {
    const fetchTemplates = async () => {
      const { data, error } = await supabase
        .from('manual_page_templates')
        .select('slug, name')
        .eq('active', true)
        .order('name')

      if (error) {
        console.error('Template\'ler yüklenemedi:', error)
      } else {
        setTemplates(data || [])
      }
    }

    fetchTemplates()
  }, [supabase])

  // Input Change
  const handleMainChange = (key: string, val: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: val }))
  }

  // Translation Change
  const handleTransChange = (key: string, val: any) => {
    setFormData((prev: any) => {
      const currentLangData = prev.translations[activeLang] || { title: '', content: '', slug: '' }
      return {
        ...prev,
        translations: {
          ...prev.translations,
          [activeLang]: {
            ...currentLangData,
            [key]: val
          }
        }
      }
    })
  }

  // Otomatik Çeviri (sadece Türkçe'den diğer dillere)
  const handleAutoTranslate = async () => {
    if (activeLang !== 'tr') {
      toast.error('Çeviri sadece Türkçe dilinden yapılabilir. Lütfen aktif dili Türkçe yapın.')
      return
    }
    const source = formData.translations[activeLang]
    if (!source.title) {
      toast.error('Önce kaynak dilde bir başlık yazın.')
      return
    }

    setTranslating(true)
    const newTrans = { ...formData.translations }
    const targetLangs = LANGS.filter(l => l !== activeLang)

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
      setFormData((prev: any) => ({
        ...prev,
        translations: newTrans
      }))
      toast.success("Tüm diller ve URL'ler çevrildi! ✨")
    } catch (err) {
      toast.error('Çeviri sırasında bir hata oluştu.')
    } finally {
      setTranslating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    // Server Action Çağır
    const res = await updatePageAction(formData.id, formData)

    setSaving(false)

    if (res.success) {
      toast.success(res.message)
      router.refresh()
      if (onSuccess) onSuccess()
    } else {
      toast.error(res.message)
    }
  }

  const currentTrans = formData.translations[activeLang] || {
    title: '',
    content: '',
    slug: ''
  }

  return (
    <form onSubmit={handleSubmit} className='h-full flex flex-col gap-6'>
      {/* TOOLBAR */}
      <div className='sticky top-0 z-20 bg-[var(--admin-card)] p-4 rounded-xl border border-[var(--admin-card-border)] shadow-sm flex justify-between items-center backdrop-blur-sm bg-opacity-95'>
        <div className='flex items-center gap-4'>
          {/* Dil Seçimi */}
          <div className='flex gap-1 bg-[var(--admin-input-bg)] p-1 rounded-lg'>
            {LANGS.map(l => (
              <button
                key={l}
                type='button'
                onClick={() => setActiveLang(l)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                  activeLang === l
                    ? 'bg-[var(--admin-card)] text-[var(--admin-fg)] shadow-sm'
                    : 'text-[var(--admin-muted)] hover:text-[var(--admin-fg)]'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className='flex items-center gap-3'>
          <button
            type='button'
            onClick={handleAutoTranslate}
            disabled={translating}
            className='btn-admin btn-admin-secondary gap-2 text-sm'
          >
            <IoSparkles className={translating ? 'animate-spin' : ''} />
            {translating ? 'Çevriliyor...' : 'Diğer Dillere Çevir'}
          </button>

          <button
            type='submit'
            disabled={saving}
            className='btn-admin btn-admin-primary gap-2 px-6'
          >
            <IoSave />
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>

      <div className='flex flex-col lg:flex-row gap-6 pb-20'>
        {/* SOL: Genel Ayarlar */}
        <div className='w-full lg:w-1/3 space-y-6'>
          <div className='bg-[var(--admin-card)] p-5 rounded-xl border border-[var(--admin-card-border)]'>
            <h3 className='text-sm font-bold text-[var(--admin-fg)] mb-4 uppercase tracking-wider'>
              Genel Ayarlar
            </h3>

            <div className='space-y-4'>
              <div>
                <label className='text-xs font-medium text-[var(--admin-muted)] uppercase mb-1 block'>
                  Hero Görsel
                </label>
                <div
                  onClick={() => setIsUploadOpen(true)}
                  className='relative aspect-video rounded-xl border-2 border-dashed border-[var(--admin-card-border)] bg-[var(--admin-input-bg)] overflow-hidden cursor-pointer group hover:border-[var(--primary)] transition-all'
                >
                  {formData.image_url ? (
                    <>
                      <Image
                        src={formData.image_url}
                        alt='Hero'
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
                <input
                  type='text'
                  value={formData.image_url || ''}
                  onChange={e => handleMainChange('image_url', e.target.value)}
                  className='admin-input w-full text-sm mt-2'
                  placeholder='https://...'
                />
              </div>

              <div className='pt-4 border-t border-[var(--admin-card-border)]'>
                <label className='text-xs font-bold uppercase opacity-60 mb-1 block underline'>
                  Dile Özel URL (Slug)
                </label>
                <div className='relative'>
                  <span className='absolute left-3 top-1/2 -translate-y-1/2 text-[10px] opacity-40 font-mono'>
                    /{activeLang}/
                  </span>
                  <input
                    className='admin-input w-full font-mono text-sm pl-12'
                    value={formData.translations[activeLang]?.slug || ''}
                    onChange={e => handleTransChange('slug', e.target.value)}
                    placeholder='hakkimizda'
                    required
                  />
                </div>
                <p className='text-[9px] mt-1 text-[var(--admin-muted)]'>
                  Her dil için farklı bir URL tanımlayabilirsiniz.
                </p>
              </div>

              <div className='pt-4 border-t border-[var(--admin-card-border)]'>
                <label className='text-xs font-medium text-[var(--admin-muted)] uppercase mb-1 block'>
                  Sayfa Tipi
                </label>
                <select
                  value={formData.page_type || 'standard'}
                  onChange={e => handleMainChange('page_type', e.target.value)}
                  className='admin-input w-full text-sm'
                >
                  <option value='standard'>Standart (Rich Text)</option>
                  <option value='manual'>Manuel (Özel Template)</option>
                </select>
                <p className='text-[9px] mt-1 text-[var(--admin-muted)]'>
                  Manuel sayfalar özel component'ler içerir.
                </p>
              </div>

              {formData.page_type === 'manual' && (
                <div className='pt-2'>
                  <div className='flex items-center justify-between mb-1'>
                    <label className='text-xs font-medium text-[var(--admin-muted)] uppercase'>
                      Template Seçin
                    </label>
                    <button
                      type='button'
                      onClick={() => setIsTemplateModalOpen(true)}
                      className='text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1'
                    >
                      <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
                      </svg>
                      Yönet
                    </button>
                  </div>
                  <select
                    value={formData.template || ''}
                    onChange={e => handleMainChange('template', e.target.value)}
                    className='admin-input w-full text-sm'
                  >
                    <option value=''>Template Seçin</option>
                    {templates.map(t => (
                      <option key={t.slug} value={t.slug}>{t.name}</option>
                    ))}
                  </select>
                  <p className='text-[9px] mt-1 text-[var(--admin-muted)]'>
                    Template, sayfanın görünümünü belirler.
                  </p>
                </div>
              )}

              <div className='flex items-center gap-3 pt-2'>
                <input
                  type='checkbox'
                  id='isActive'
                  checked={formData.active}
                  onChange={e => handleMainChange('active', e.target.checked)}
                  className='w-4 h-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]'
                />
                <label
                  htmlFor='isActive'
                  className='text-sm font-medium text-[var(--admin-fg)] cursor-pointer'
                >
                  Sayfa Yayında (Aktif)
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* SAĞ: İçerik Editörü */}
        <div className='w-full lg:w-2/3'>
          <div className='bg-[var(--admin-card)] p-5 rounded-xl border border-[var(--admin-card-border)] h-full min-h-[500px]'>
            <div className='mb-4 flex justify-between items-center'>
              <h3 className='text-sm font-bold text-[var(--admin-fg)] uppercase tracking-wider'>
                İçerik ({activeLang.toUpperCase()})
              </h3>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='text-xs font-medium text-[var(--admin-muted)] uppercase mb-1 block'>
                  Sayfa Başlığı
                </label>
                <input
                  type='text'
                  value={currentTrans.title || ''}
                  onChange={e => handleTransChange('title', e.target.value)}
                  className='admin-input w-full text-lg font-bold'
                  placeholder='Başlık giriniz...'
                />
              </div>

              <div>
                <label className='text-xs font-medium text-[var(--admin-muted)] uppercase mb-2 block'>
                  Detaylı İçerik
                </label>
                {/* Rich Text Editor */}
                <div className='text-[var(--admin-fg)]'>
                  <RichTextEditor
                    key={activeLang} // Dil değiştiğinde yeniden mount et
                    value={currentTrans.content || ''}
                    onChange={val => handleTransChange('content', val)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Görsel Yükleme Modalı */}
      {isUploadOpen && (
        <ImageUploadModal
          bucket='services'
          onClose={() => setIsUploadOpen(false)}
          onSelect={(url) => {
            handleMainChange('image_url', url)
            setIsUploadOpen(false)
          }}
        />
      )}

      {/* Template Yönetim Modalı */}
      <TemplateManagerModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={(slug) => {
          handleMainChange('template', slug)
        }}
      />
    </form>
  )
}
