// C:\Projeler\nost-copy\app\_components\ReadyProducts\ready-products-title.tsx
'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/components/LanguageProvider'

const UI_TEXTS = {
  tr: {
    subtitle: 'VİTRİN ÜRÜNLERİ',
    titleStart: 'Keşfetmeye Hazır',
    titleHighlight: 'Popüler Ürünler'
  },
  en: {
    subtitle: 'SHOWCASE',
    titleStart: 'Ready to Explore',
    titleHighlight: 'Popular Items'
  },
  de: {
    subtitle: 'SCHAUFENSTER',
    titleStart: 'Bereit zum Entdecken',
    titleHighlight: 'Beliebte Produkte'
  }
}

export default function ReadyProductsTitle () {
  const [mounted, setMounted] = useState(false)
  const { lang } = useLanguage()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className='h-24 w-full'></div>

  const ui = UI_TEXTS[lang as keyof typeof UI_TEXTS] || UI_TEXTS.en

  return (
    <div className='w-full'>
      {/* Subtitle */}
      <div className='text-xs md:text-sm font-bold tracking-[0.2em] text-muted-foreground uppercase mb-3'>
        {ui.subtitle}
      </div>

      {/* Main Title */}
      <h2 className='text-3xl md:text-4xl font-black text-foreground leading-tight'>
        {ui.titleStart}{' '}
        <span className='text-primary relative inline-block'>
          {ui.titleHighlight}
          {/* Dekoratif çizgi (Sağa yaslı olduğu için right-0) */}
          <span className='absolute bottom-1 right-0 w-full h-[30%] bg-primary/10 -z-10'></span>
        </span>
      </h2>
    </div>
  )
}
