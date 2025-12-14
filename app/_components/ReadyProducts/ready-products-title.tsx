// C:\Projeler\nost-copy\app\_components\ReadyProducts\ready-products-title.tsx
'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/components/LanguageProvider'
import SectionHeading from './SectionHeading'

const TITLES = {
  tr: { text: 'Muhteşem Ürünler Sizin İçin Hazır', highlight: 'Ürünler' },
  en: { text: 'Amazing Products Are Ready For You', highlight: 'Products' },
  de: { text: 'Tolle Produkte Sind Für Sie Bereit', highlight: 'Produkte' }
}

export default function ReadyProductsTitle () {
  const [mounted, setMounted] = useState(false)
  const { lang } = useLanguage()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Hydration mismatch önleme
  if (!mounted) return <div className='h-16 w-full'></div>

  const currentLang = lang && TITLES[lang as keyof typeof TITLES] ? lang : 'en'
  const content = TITLES[currentLang as keyof typeof TITLES]

  return (
    <SectionHeading
      text={content.text}
      highlight={content.highlight}
      // Global CSS değişkenini kullanıyoruz, böylece tema değişirse bu da değişir
      highlightColor='var(--primary)'
    />
  )
}
