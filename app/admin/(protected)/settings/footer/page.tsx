// C:\Projeler\nost-copy\app\admin\(protected)\footer\page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import {
  SlPlus,
  SlTrash,
  SlCheck,
  SlRefresh,
  SlMenu,
  SlLink
} from 'react-icons/sl'
import { translateTextAction } from '@/app/admin/actions'

const SECTIONS = [
  { key: 'information', label: 'Information (Sol)' },
  { key: 'useful', label: 'Useful Links (Orta)' },
  { key: 'about', label: 'About Us (Sağ)' }
]

const LANGUAGES = ['tr', 'en', 'de'] as const
type LangCode = typeof LANGUAGES[number]

type FooterLink = {
  id: string
  section: string
  url: string
  sort_order: number
  active: boolean
  titles: Record<LangCode, string>
}

export default function FooterSettingsPage () {
  const supabase = createSupabaseBrowserClient()
  const [links, setLinks] = useState<FooterLink[]>([])
  const [loading, setLoading] = useState(true)
  const [activeLang, setActiveLang] = useState<LangCode>('tr')
  const [translating, setTranslating] = useState(false)

  // --- VERİ YÜKLEME ---
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data: rawLinks } = await supabase
        .from('footer_links')
        .select('*')
        .order('sort_order', { ascending: true })
      if (rawLinks) {
        const { data: translations } = await supabase
          .from('footer_links_translations')
          .select('*')
        const merged = rawLinks.map((l: any) => {
          const tMap: Record<string, string> = { tr: '', en: '', de: '' }
          translations
            ?.filter((t: any) => t.link_id === l.id)
            .forEach((t: any) => (tMap[t.lang_code] = t.title || ''))
          if (!tMap.tr && l.title) tMap.tr = l.title
          if (!tMap.en && l.title) tMap.en = l.title
          return { ...l, id: l.id.toString(), titles: tMap }
        })
        setLinks(merged)
      }
      setLoading(false)
    }
    load()
  }, [])

  // --- HANDLERS ---
  const handleAdd = (section: string) => {
    const sectionLinks = links.filter(l => l.section === section)
    const newSort =
      sectionLinks.length > 0
        ? Math.max(...sectionLinks.map(l => l.sort_order)) + 1
        : 0
    const newLink: FooterLink = {
      id: `temp-${Date.now()}`,
      section,
      url: '/',
      sort_order: newSort,
      active: true,
      titles: { tr: '', en: '', de: '' }
    }
    setLinks([...links, newLink])
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Silmek istediğinize emin misiniz?')) return
    if (!id.startsWith('temp-'))
      await supabase.from('footer_links').delete().eq('id', id)
    setLinks(prev => prev.filter(l => l.id !== id))
  }

  const handleGlobalChange = (
    id: string,
    field: keyof FooterLink,
    value: any
  ) => {
    setLinks(prev =>
      prev.map(l => (l.id === id ? { ...l, [field]: value } : l))
    )
  }

  const handleTitleChange = (id: string, value: string) => {
    setLinks(prev =>
      prev.map(l =>
        l.id === id ? { ...l, titles: { ...l.titles, [activeLang]: value } } : l
      )
    )
  }

  const handleDistributeLanguage = async () => {
    if (
      !confirm(
        `Şu anki (${activeLang.toUpperCase()}) başlıkları diğer dillere çevirip dağıtmak istiyor musunuz?`
      )
    )
      return
    setTranslating(true)
    const toastId = toast.loading('Çeviriliyor...')
    try {
      const updatedLinks = await Promise.all(
        links.map(async link => {
          const sourceText = link.titles[activeLang]
          if (!sourceText) return link
          const newTitles = { ...link.titles }
          for (const lang of LANGUAGES) {
            if (lang !== activeLang) {
              const res = await translateTextAction(
                sourceText,
                lang,
                activeLang
              )
              newTitles[lang] = res.success ? res.text : sourceText
            }
          }
          return { ...link, titles: newTitles }
        })
      )
      setLinks(updatedLinks)
      toast.success('Çevrildi!', { id: toastId })
    } catch (error) {
      toast.error('Hata oluştu', { id: toastId })
    } finally {
      setTranslating(false)
    }
  }

  const handleSaveAll = async () => {
    const toastId = toast.loading('Kaydediliyor...')
    try {
      const globalUpserts = links.map(l => ({
        id: l.id.startsWith('temp-') ? undefined : parseInt(l.id),
        section: l.section,
        title: l.titles.tr || l.titles.en,
        url: l.url,
        sort_order: l.sort_order,
        active: l.active
      }))
      const { data: savedLinks, error: linkError } = await supabase
        .from('footer_links')
        .upsert(globalUpserts)
        .select()
      if (linkError) throw linkError

      const translationUpserts: any[] = []
      savedLinks.forEach(saved => {
        const original = links.find(
          l =>
            l.section === saved.section &&
            l.sort_order === saved.sort_order &&
            l.url === saved.url
        )
        if (original) {
          LANGUAGES.forEach(lang => {
            const title = original.titles[lang]
            if (title)
              translationUpserts.push({
                link_id: saved.id,
                lang_code: lang,
                title: title
              })
          })
        }
      })
      await supabase
        .from('footer_links_translations')
        .upsert(translationUpserts, { onConflict: 'link_id, lang_code' })
      toast.success('Kaydedildi!', { id: toastId })
    } catch (e: any) {
      toast.error(e.message, { id: toastId })
    }
  }

  if (loading)
    return (
      <div className='text-center p-10 text-[var(--admin-muted)]'>
        Yükleniyor...
      </div>
    )

  return (
    <div className='pb-20 space-y-6 w-full'>
      {/* --- HEADER --- */}
      <div className='sticky top-2 z-20 bg-[var(--admin-card)] p-4 rounded-xl border border-[var(--admin-card-border)] shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4'>
        {/* Dil Seçimi */}
        <div className='flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-hide'>
          {LANGUAGES.map(lang => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`px-4 py-2 rounded-lg text-sm font-bold uppercase border transition-all ${
                activeLang === lang
                  ? 'bg-[var(--admin-accent)] text-white shadow-md border-transparent'
                  : 'bg-[var(--admin-input-bg)] border-transparent text-[var(--admin-muted)] hover:text-[var(--admin-fg)]'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Aksiyonlar */}
        <div className='flex gap-2 w-full sm:w-auto'>
          <button
            onClick={handleDistributeLanguage}
            disabled={translating}
            className='btn-admin btn-admin-secondary text-xs flex-1 sm:flex-none justify-center gap-2'
          >
            <SlRefresh className={translating ? 'animate-spin' : ''} />
            <span className='hidden sm:inline'>Çevir</span>
          </button>
          <button
            onClick={handleSaveAll}
            disabled={translating}
            className='btn-admin btn-admin-primary text-xs flex-1 sm:flex-none justify-center px-6 gap-2'
          >
            <SlCheck /> Kaydet
          </button>
        </div>
      </div>

      {/* --- KOLONLAR --- */}
      <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
        {SECTIONS.map(sec => (
          <div
            key={sec.key}
            className='card-admin h-full flex flex-col bg-[var(--admin-card)] border border-[var(--admin-card-border)] rounded-xl shadow-sm'
          >
            {/* Kolon Başlığı */}
            <h3 className='font-bold text-lg border-b border-[var(--admin-card-border)] pb-3 mb-4 px-1 text-[var(--admin-fg)]'>
              {sec.label}
            </h3>

            {/* Link Listesi */}
            <div className='flex-1 space-y-3 min-h-[100px]'>
              {links.filter(l => l.section === sec.key).length === 0 && (
                <div className='h-full flex flex-col items-center justify-center text-sm text-[var(--admin-muted)] border-2 border-dashed border-[var(--admin-input-border)] rounded-lg p-6'>
                  <span className='opacity-60'>Link eklenmemiş.</span>
                </div>
              )}

              {links
                .filter(l => l.section === sec.key)
                .map(link => (
                  <div
                    key={link.id}
                    className='group relative bg-[var(--admin-input-bg)] hover:bg-[var(--admin-bg)] p-3 rounded-lg border border-transparent hover:border-[var(--admin-card-border)] transition-all duration-200 shadow-sm'
                  >
                    {/* Üst Satır: Tutma Yeri, Başlık, Toggle, Sil */}
                    <div className='flex items-center gap-3 mb-2'>
                      {/* Drag Handle */}
                      <SlMenu className='text-[var(--admin-muted)] cursor-grab hover:text-[var(--admin-fg)] flex-shrink-0' />

                      {/* Başlık Input */}
                      <input
                        className='flex-1 bg-transparent font-semibold text-[var(--admin-fg)] placeholder-[var(--admin-muted)]/50 focus:outline-none focus:border-b focus:border-[var(--admin-accent)] transition-colors'
                        placeholder={`Başlık (${activeLang})`}
                        value={link.titles[activeLang] || ''}
                        onChange={e =>
                          handleTitleChange(link.id, e.target.value)
                        }
                      />

                      {/* --- DÜZELTİLEN TOGGLE --- */}
                      <label className='relative inline-flex items-center cursor-pointer flex-shrink-0'>
                        <input
                          type='checkbox'
                          className='sr-only peer'
                          checked={link.active}
                          onChange={e =>
                            handleGlobalChange(
                              link.id,
                              'active',
                              e.target.checked
                            )
                          }
                        />
                        {/* Değişiklik Yapıldı:
                            - translate-x-full YERİNE translate-x-4
                            - w-8 (32px) kapsayıcı, w-3 (12px) daire.
                            - Sol: 2px. 
                            - Sağ hedef: 16px kayma ile 18px sol pozisyonu (30px sağ kenar).
                            - Kalan sağ boşluk: 32-30 = 2px. Simetrik.
                        */}
                        <div
                          className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 
                                        peer-checked:after:translate-x-4 
                                        peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                        after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 
                                        after:transition-all dark:border-gray-600 peer-checked:bg-[var(--admin-success)]"
                        ></div>
                      </label>

                      {/* Sil Butonu */}
                      <button
                        onClick={() => handleDelete(link.id)}
                        className='text-[var(--admin-muted)] hover:text-[var(--admin-danger)] transition-colors p-1'
                        title='Sil'
                      >
                        <SlTrash size={14} />
                      </button>
                    </div>

                    {/* Alt Satır: URL Input */}
                    <div className='flex items-center gap-2 pl-7'>
                      <SlLink size={10} className='text-[var(--admin-muted)]' />
                      <input
                        className='w-full text-xs font-mono text-[var(--admin-muted)] bg-transparent focus:text-[var(--admin-fg)] focus:outline-none focus:border-b focus:border-[var(--admin-accent)] placeholder-[var(--admin-muted)]/40'
                        placeholder='/url-adresi'
                        value={link.url}
                        onChange={e =>
                          handleGlobalChange(link.id, 'url', e.target.value)
                        }
                      />
                    </div>
                  </div>
                ))}
            </div>

            {/* Ekle Butonu */}
            <button
              onClick={() => handleAdd(sec.key)}
              className='btn-admin btn-admin-secondary w-full mt-4 border-dashed justify-center text-sm py-2.5 opacity-70 hover:opacity-100'
            >
              <SlPlus /> Yeni Link Ekle
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
