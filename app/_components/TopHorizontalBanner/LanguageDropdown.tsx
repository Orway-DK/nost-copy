'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/components/LanguageProvider'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useLoading } from '@/components/LoadingContext' // YENİ IMPORT

type Language = { code: string; name: string; is_default: boolean }

const FALLBACK_LANGUAGES: Language[] = [
  { code: 'tr', name: 'Türkçe', is_default: true },
  { code: 'en', name: 'English', is_default: false },
  { code: 'de', name: 'Deutsch', is_default: false }
]

const LS_KEY = 'app.languages.cache.v1'
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 saat

// --- CACHE HELPER FUNCTIONS (Component dışı) ---
function readCache (): Language[] | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { ts: number; data: Language[] }
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null
    if (!Array.isArray(parsed.data)) return null
    return parsed.data
  } catch {
    return null
  }
}

function writeCache (data: Language[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ ts: Date.now(), data }))
  } catch {
    // ignore
  }
}

export default function LanguageDropdown () {
  const { lang, setLang } = useLanguage()

  // State
  const [isOpen, setIsOpen] = useState(false)
  const [languages, setLanguages] = useState<Language[]>(FALLBACK_LANGUAGES)

  // Refs
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const popRef = useRef<HTMLDivElement | null>(null)

  // Loading System
  const { register, unregister } = useLoading()
  const COMPONENT_ID = 'LanguageDropdown'

  // --- 1. VERİ ÇEKME & LOADING ---
  useEffect(() => {
    let mounted = true

    const initLanguages = async () => {
      // Başlar başlamaz sisteme kaydol
      register(COMPONENT_ID)

      try {
        // A. Önce Cache Kontrolü
        const cached = readCache()
        if (cached && mounted) {
          setLanguages(cached)
          // Cache varsa işimiz bitti, loading'i kapat
          unregister(COMPONENT_ID)
          return // Supabase'e gitme
        }

        // B. Cache yoksa Supabase'den çek
        const supabase = createSupabaseBrowserClient()
        const { data, error } = await supabase
          .from('languages')
          .select('code,name,is_default')
          .order('is_default', { ascending: false })
          .order('code', { ascending: true })

        if (error) throw error

        if (mounted && data && data.length > 0) {
          setLanguages(data)
          writeCache(data)
        }
      } catch (err) {
        console.error('Language fetch error:', err)
        // Hata olsa bile Fallback diller zaten state'de var, devam et.
      } finally {
        // Her durumda (Hata, Başarı) loading kaydını sil
        if (mounted) unregister(COMPONENT_ID)
      }
    }

    initLanguages()

    return () => {
      mounted = false
      // Component unmount olursa loading'i temizle
      unregister(COMPONENT_ID)
    }
  }, [register, unregister])

  // --- 2. DİL DOĞRULAMA (Validation) ---
  // Eğer URL'den gelen dil (lang) listemizde yoksa varsayılana dön
  useEffect(() => {
    if (languages.length === 0) return

    const currentExists = languages.some(l => l.code === lang)
    if (!lang || !currentExists) {
      const def = languages.find(l => l.is_default) || languages[0]
      if (def && def.code !== lang) {
        setLang(def.code)
      }
    }
  }, [lang, languages, setLang])

  // --- 3. DIŞARI TIKLAMA (Click Outside) ---
  useEffect(() => {
    if (!isOpen) return
    const onMouseDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (popRef.current?.contains(t)) return
      if (btnRef.current?.contains(t)) return
      setIsOpen(false)
    }
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onEsc)
    }
  }, [isOpen])

  const onSelect = (code: string) => {
    setIsOpen(false)
    if (code !== lang) setLang(code)
  }

  // UI RENDER
  return (
    <div className='relative inline-block text-left'>
      <button
        ref={btnRef}
        type='button'
        onClick={() => setIsOpen(s => !s)}
        className='inline-flex items-center gap-2 text-background/90 dark:text-foreground hover:text-background transition-colors'
        aria-haspopup='listbox'
        aria-expanded={isOpen}
        aria-label='Change language'
      >
        <span className='font-semibold tracking-wide'>
          {lang.toUpperCase()}
        </span>
        <svg
          className={`w-2.5 h-2.5 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          viewBox='0 0 10 6'
          aria-hidden='true'
        >
          <path
            d='m1 1 4 4 4-4'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={popRef}
          className='absolute right-0 mt-2 w-44 rounded-lg shadow-xl bg-secondary border border-muted-light/20 z-50 overflow-hidden'
          role='listbox'
          aria-label='Languages'
        >
          <ul className='py-1 max-h-64 overflow-auto'>
            {languages.map(l => (
              <li key={l.code}>
                <button
                  onClick={() => onSelect(l.code)}
                  role='option'
                  aria-selected={lang === l.code}
                  className={`block w-full text-left px-4 py-2.5 text-sm transition-colors
                    ${
                      lang === l.code
                        ? 'font-bold text-white bg-foreground/20'
                        : 'text-foreground/80 hover:bg-muted/10 hover:text-foreground'
                    }`}
                >
                  {l.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
