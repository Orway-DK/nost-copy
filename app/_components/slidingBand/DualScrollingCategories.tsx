'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/components/LanguageProvider'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import './slidingBands.css'

type CategoryItem = {
  id: number
  slug: string
  label: string
  href: string
  sort: number
}

// Varsayılan hızlar (Eğer DB'den gelmezse)
const DEFAULT_SPEEDS = {
  desktop: 120,
  mobile: 60
}

const FALLBACK: CategoryItem[] = [
  { id: -1, label: 'Dress shirt', href: '#', slug: 'dress-shirt', sort: 0 },
  { id: -2, label: 'New Products', href: '#', slug: 'new-products', sort: 1 }
  // ... diğer fallbackler
]

export default function DualScrollingCategories () {
  const { lang } = useLanguage()
  const [items, setItems] = useState<CategoryItem[]>(FALLBACK)
  const [speeds, setSpeeds] = useState(DEFAULT_SPEEDS)
  const [isMobile, setIsMobile] = useState(false)

  // Mobil kontrolü (SSR uyumlu)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const supabase = createSupabaseBrowserClient()

        // Paralel istek: Hem kategoriler hem ayarlar
        const [catRes, setRes] = await Promise.all([
          supabase
            .from('categories')
            .select(
              'id, slug, sort, active, category_translations(name, lang_code)'
            )
            .eq('active', true)
            .eq('category_translations.lang_code', lang)
            .order('sort', { ascending: true }),

          supabase
            .from('slider_settings')
            .select('duration_desktop, duration_mobile')
            .eq('section_key', 'scrolling_categories')
            .single()
        ])

        if (catRes.error) {
          if (mounted) setItems(FALLBACK)
        } else {
          const mapped = (catRes.data ?? []).map((c: any, idx: number) => {
            const tr = (c.category_translations ?? []).find(
              (t: any) => t.lang_code === lang
            )
            return {
              id: c.id,
              slug: c.slug,
              sort: c.sort ?? idx,
              label: tr?.name ?? c.slug,
              href: `/collections/${c.slug}`
            } as CategoryItem
          })
          if (mounted) {
            if (mapped.length === 0) setItems(FALLBACK)
            else setItems(mapped)
          }
        }

        // Hız ayarlarını uygula
        if (!setRes.error && setRes.data) {
          if (mounted) {
            setSpeeds({
              desktop: setRes.data.duration_desktop,
              mobile: setRes.data.duration_mobile
            })
          }
        }
      } catch (err) {
        if (mounted) setItems(FALLBACK)
      }
    })()
    return () => {
      mounted = false
    }
  }, [lang])

  // Aktif Süreyi Belirle
  const currentDuration = isMobile ? `${speeds.mobile}s` : `${speeds.desktop}s`

  return (
    <div className='relative w-full overflow-hidden py-12 md:py-24 bg-background'>
      {/* ALT BANT (Sola Kayan) */}
      <div className='absolute inset-x-0 top-1/2 -translate-y-1/2 -mx-20 bg-fuchsia-100 text-black py-3 rotate-6 lg:rotate-3 shadow-sm border-y border-black/5 z-0'>
        <div className='px-4 group flex overflow-hidden select-none'>
          {/* Style ile animationDuration'ı eziyoruz */}
          <div
            className='flex min-w-full shrink-0 w-max animate-marquee group-hover:[animation-play-state:paused]'
            style={{ animationDuration: currentDuration }}
          >
            <CategoryStrip items={items} />
            <CategoryStrip items={items} />
            <CategoryStrip items={items} />
            <CategoryStrip items={items} />
          </div>
          <div
            aria-hidden='true'
            className='flex min-w-full shrink-0 w-max animate-marquee group-hover:[animation-play-state:paused]'
            style={{ animationDuration: currentDuration }}
          >
            <CategoryStrip items={items} />
            <CategoryStrip items={items} />
            <CategoryStrip items={items} />
            <CategoryStrip items={items} />
          </div>
        </div>
      </div>

      {/* ÜST BANT (Sağa Kayan - Reverse) */}
      <div className='absolute inset-x-0 top-1/2 -translate-y-1/2 bg-yellow-50 text-black py-3 -rotate-4 lg:-rotate-2 z-10 shadow-lg border-y border-black/5'>
        <div className='px-4 group flex overflow-hidden select-none'>
          <div
            className='flex min-w-full shrink-0 w-max animate-marquee-reverse group-hover:[animation-play-state:paused]'
            style={{ animationDuration: currentDuration }}
          >
            <CategoryStrip items={items} />
            <CategoryStrip items={items} />
            <CategoryStrip items={items} />
            <CategoryStrip items={items} />
          </div>
          <div
            aria-hidden='true'
            className='flex min-w-full shrink-0 w-max animate-marquee-reverse group-hover:[animation-play-state:paused]'
            style={{ animationDuration: currentDuration }}
          >
            <CategoryStrip items={items} />
            <CategoryStrip items={items} />
            <CategoryStrip items={items} />
            <CategoryStrip items={items} />
          </div>
        </div>
      </div>
    </div>
  )
}

function CategoryStrip ({ items }: { items: CategoryItem[] }) {
  return (
    <div className='flex items-center'>
      {items.map((cat, i) => (
        <div key={`${cat.id}-${i}`} className='flex items-center mx-4'>
          <Link
            href={cat.href}
            className='text-xs sm:text-sm font-bold tracking-widest uppercase hover:text-primary transition-colors whitespace-nowrap'
          >
            {cat.label}
          </Link>
          <span className='ml-8 text-[10px] text-black/30'>●</span>
        </div>
      ))}
    </div>
  )
}
