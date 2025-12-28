// C:\Projeler\nost-copy\app\admin\(protected)\about\about-form.tsx
'use client'

import { useState } from 'react'
import { IoSave, IoSparkles } from 'react-icons/io5'
import { toast } from 'react-hot-toast'
import { updateAboutContentAction } from './actions'
import { translateTextAction } from '@/app/admin/actions'

const LANGS = ['tr', 'en', 'de']

type Props = {
  initialData: Record<string, any>
}

// ... (FIELD_GROUPS sabiti aynı kalacak) ...
const FIELD_GROUPS = [
  {
    title: 'Hero (Üst Alan)',
    fields: [
      { key: 'hero_title', label: 'Başlık' },
      { key: 'hero_subtitle', label: 'Alt Başlık' }
    ]
  },
  {
    title: 'Sol Kutu (Ekip)',
    fields: [
      { key: 'grid_title', label: 'Başlık' },
      { key: 'grid_role', label: 'Rol / Açıklama' }
    ]
  },
  {
    title: 'İstatistikler',
    fields: [
      { key: 'stat_1_val', label: 'Değer 1' },
      { key: 'stat_1_label', label: 'Etiket 1' },
      { key: 'stat_2_val', label: 'Değer 2' },
      { key: 'stat_2_label', label: 'Etiket 2' },
      { key: 'stat_3_val', label: 'Değer 3' },
      { key: 'stat_3_label', label: 'Etiket 3' }
    ]
  },
  {
    title: 'Biyografi (Orta)',
    fields: [
      { key: 'bio_title', label: 'Başlık' },
      { key: 'bio_text', label: 'Metin', type: 'textarea' }
    ]
  },
  {
    title: 'Tanıtım & Alıntı (Sağ)',
    fields: [
      { key: 'intro_text', label: 'Tanıtım Metni', type: 'textarea' },
      { key: 'quote_text', label: 'Alıntı Sözü', type: 'textarea' },
      { key: 'quote_author', label: 'Alıntı Sahibi' }
    ]
  },
  {
    title: 'Footer (Alt Kısım)',
    fields: [
      { key: 'footer_title', label: 'Başlık' },
      { key: 'footer_text', label: 'Metin', type: 'textarea' }
    ]
  }
]

export default function AboutForm ({ initialData }: Props) {
  const [formData, setFormData] = useState(initialData)
  const [activeLang, setActiveLang] = useState('tr')
  const [saving, setSaving] = useState(false)
  const [translating, setTranslating] = useState(false)

  const handleChange = (key: string, val: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [activeLang]: val
      }
    }))
  }

  const handleAutoTranslate = async () => {
    if (
      !confirm(
        'Türkçe dışındaki alanlar otomatik çevrilecek. Onaylıyor musunuz?'
      )
    )
      return

    setTranslating(true)
    const loadingToast = toast.loading('Çeviriliyor...')

    try {
      const newFormData = JSON.parse(JSON.stringify(formData))
      const targetLangs = LANGS.filter(l => l !== 'tr')

      const tasks: Promise<void>[] = []

      for (const key of Object.keys(newFormData)) {
        const sourceText = newFormData[key]?.['tr'] // Null check eklendi
        if (!sourceText) continue

        for (const targetLang of targetLangs) {
          tasks.push(
            translateTextAction(sourceText, targetLang, 'tr').then(res => {
              if (res.success) {
                if (!newFormData[key]) newFormData[key] = {}
                newFormData[key][targetLang] = res.text
              }
            })
          )
        }
      }

      await Promise.all(tasks)
      setFormData(newFormData)
      toast.success('Çeviri tamamlandı!', { id: loadingToast })
    } catch (e) {
      toast.error('Çeviri sırasında hata oluştu.', { id: loadingToast })
    } finally {
      setTranslating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await updateAboutContentAction(formData)
    setSaving(false)

    if (res.success) {
      toast.success(res.message)
    } else {
      toast.error(res.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6 pr-4'>
      
      {/* Sticky Toolbar */}
      {/* top-0 sticky çalışması için üst kapsayıcının overflow-auto olması gerekir (ki bunu page.tsx'te yaptık) */}
      <div className='sticky top-0 z-20 bg-[var(--admin-card)] p-4 rounded-xl border border-[var(--admin-card-border)] shadow-md flex flex-col sm:flex-row justify-between items-center gap-4'>
        
        {/* Dil Seçimi */}
        <div className='flex gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0'>
          {LANGS.map(l => (
            <button
              key={l}
              type='button'
              onClick={() => setActiveLang(l)}
              className={`px-4 py-2 rounded-lg text-sm font-bold uppercase transition-all whitespace-nowrap ${
                activeLang === l
                  ? 'bg-[var(--admin-accent)] text-white shadow-md' // admin-primary yerine admin-accent (Standardizasyon)
                  : 'bg-[var(--admin-input-bg)] text-[var(--admin-muted)] hover:bg-[var(--admin-bg)] border border-transparent hover:border-[var(--admin-card-border)]'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Aksiyonlar */}
        <div className='flex gap-3 w-full sm:w-auto'>
          <button
            type='button'
            onClick={handleAutoTranslate}
            disabled={translating}
            className='btn-admin btn-admin-secondary text-xs gap-2 flex-1 sm:flex-none justify-center'
          >
            <IoSparkles
              className={
                translating ? 'animate-spin text-yellow-500' : 'text-yellow-500'
              }
            />
            {translating ? 'Çevriliyor...' : 'Oto. Çevir'}
          </button>

          <button
            type='submit'
            disabled={saving}
            className='btn-admin btn-admin-primary gap-2 px-6 flex-1 sm:flex-none justify-center'
          >
            <IoSave />
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>

      {/* Form Alanları Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
        {FIELD_GROUPS.map((group, idx) => (
          <div
            key={idx}
            className='bg-[var(--admin-card)] rounded-xl border border-[var(--admin-card-border)] p-6 space-y-4 shadow-sm h-full flex flex-col'
          >
            <h3 className='text-lg font-bold text-[var(--admin-fg)] border-b border-[var(--admin-card-border)] pb-2 mb-4'>
              {group.title}
            </h3>

            <div className='space-y-4 flex-1'>
              {group.fields.map(field => {
                const val = formData[field.key]?.[activeLang] || ''

                return (
                  <div key={field.key}>
                    <label className='block text-xs font-semibold text-[var(--admin-muted)] uppercase mb-1.5'>
                      {field.label}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        className='admin-textarea min-h-[100px] w-full'
                        value={val}
                        onChange={e => handleChange(field.key, e.target.value)}
                        placeholder={`${field.label} (${activeLang.toUpperCase()})`}
                      />
                    ) : (
                      <input
                        className='admin-input w-full'
                        value={val}
                        onChange={e => handleChange(field.key, e.target.value)}
                        placeholder={`${field.label} (${activeLang.toUpperCase()})`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </form>
  )
}