// app_components\slidingBand\DualScrollingCategories.tsx
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

const DEFAULT_SPEEDS = {
  desktop: 120,
  mobile: 60
}

const FALLBACK: CategoryItem[] = [
  { id: -1, label: 'Dress shirt', href: '#', slug: 'dress-shirt', sort: 0 },
  { id: -2, label: 'New Products', href: '#', slug: 'new-products', sort: 1 }
]

export default function DualScrollingCategories () {
  const { lang } = useLanguage()
  const [items, setItems] = useState<CategoryItem[]>(FALLBACK)
  const [speeds, setSpeeds] = useState(DEFAULT_SPEEDS)
  const [isMobile, setIsMobile] = useState(false)

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
              href: `/${c.slug}`
            } as CategoryItem
          })
          if (mounted) {
            if (mapped.length === 0) setItems(FALLBACK)
            else setItems(mapped)
          }
        }

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

  const currentDuration = isMobile ? `${speeds.mobile}s` : `${speeds.desktop}s`

  return (
    // Ana kapsayıcı bg-background yerine bg-transparent yapıldı ki arkadaki görsel görünsün
    <div className='relative w-full overflow-hidden py-12 md:py-24 bg-transparent'>
      {/* ALT BANT (Sola Kayan) */}
      <div className='absolute inset-x-0 top-1/2 -translate-y-1/2 -mx-20 bg-transparent text-foreground/70 py-4 rotate-6 lg:rotate-3 border-y border-foreground/10 z-0 backdrop-blur-[2px]'>
        <div className='px-4 group flex overflow-hidden select-none'>
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
      <div className='absolute inset-x-0 top-1/2 -translate-y-1/2 bg-transparent text-foreground py-4 -rotate-4 lg:-rotate-2 z-10 border-y border-foreground/10 backdrop-blur-[2px]'>
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
        <div key={`${cat.id}-${i}`} className='flex items-center mx-6'>
          <Link
            href={cat.href}
            className='text-sm sm:text-base font-black tracking-[0.2em] uppercase hover:text-primary transition-colors whitespace-nowrap'
          >
            {cat.label}
          </Link>
          {/* Nokta rengi de uyumlu hale getirildi */}
          <span className='ml-12 text-[8px] text-foreground/20'>◆</span>
        </div>
      ))}
    </div>
  )
}
