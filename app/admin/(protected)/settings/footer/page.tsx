// C:\Projeler\nost-copy\app\admin\(protected)\settings\footer\page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { SlPlus, SlTrash, SlCheck, SlRefresh } from 'react-icons/sl'
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
      window.location.reload()
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
    <div className='pb-20 space-y-6'>
      <div className='card-admin flex flex-col md:flex-row justify-between items-center gap-4 sticky top-2 z-20 shadow-sm'>
        <div className='flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0'>
          {LANGUAGES.map(lang => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`px-4 py-1.5 rounded text-sm font-bold uppercase border transition-all ${
                activeLang === lang
                  ? 'bg-[var(--admin-accent)] text-[var(--admin-input-bg)] border-transparent'
                  : 'bg-[var(--admin-input-bg)] border-[var(--admin-border)]'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
        <div className='flex gap-2 w-full md:w-auto'>
          <button
            onClick={handleDistributeLanguage}
            disabled={translating}
            className='btn-admin btn-admin-secondary text-xs flex-1 md:flex-none justify-center'
          >
            <SlRefresh className={translating ? 'animate-spin' : ''} /> Çevir
          </button>
          <button
            onClick={handleSaveAll}
            disabled={translating}
            className='btn-admin btn-admin-primary text-xs flex-1 md:flex-none justify-center'
          >
            <SlCheck /> Kaydet
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
        {SECTIONS.map(sec => (
          <div key={sec.key} className='card-admin h-full flex flex-col'>
            <h3 className='font-bold text-lg border-b border-[var(--admin-border)] pb-3 mb-4'>
              {sec.label}
            </h3>
            <div className='flex-1 space-y-4'>
              {links
                .filter(l => l.section === sec.key)
                .map(link => (
                  <div
                    key={link.id}
                    className='bg-[var(--admin-bg)] p-3 rounded border border-[var(--admin-border)] space-y-2'
                  >
                    <div className='flex gap-2'>
                      <input
                        className='admin-input flex-1 font-semibold'
                        placeholder={`Başlık (${activeLang})`}
                        value={link.titles[activeLang] || ''}
                        onChange={e =>
                          handleTitleChange(link.id, e.target.value)
                        }
                      />
                      <input
                        type='checkbox'
                        checked={link.active}
                        onChange={e =>
                          handleGlobalChange(
                            link.id,
                            'active',
                            e.target.checked
                          )
                        }
                        className='w-5 h-5 accent-[var(--admin-success)] mt-2'
                      />
                    </div>
                    <div className='flex gap-2'>
                      <input
                        className='admin-input text-xs font-mono flex-1'
                        placeholder='URL'
                        value={link.url}
                        onChange={e =>
                          handleGlobalChange(link.id, 'url', e.target.value)
                        }
                      />
                      <button
                        onClick={() => handleDelete(link.id)}
                        className='btn-admin btn-admin-danger p-2'
                      >
                        <SlTrash />
                      </button>
                    </div>
                  </div>
                ))}
              {links.filter(l => l.section === sec.key).length === 0 && (
                <div className='text-center text-sm text-[var(--admin-muted)] py-4 border-2 border-dashed border-[var(--admin-border)] rounded'>
                  Link yok.
                </div>
              )}
            </div>
            <button
              onClick={() => handleAdd(sec.key)}
              className='btn-admin btn-admin-secondary w-full mt-4 border-dashed'
            >
              <SlPlus /> Ekle
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
