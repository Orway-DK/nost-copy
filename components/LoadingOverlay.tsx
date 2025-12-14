// C:\Projeler\nost-copy\components\LoadingOverlay.tsx
'use client'

import React from 'react'
import Image from 'next/image'
import { useLanguage } from '@/components/LanguageProvider' // 1. Hook'u import et

// Dil Çevirileri
const LOAD_TEXTS: Record<string, string> = {
  tr: 'YÜKLENİYOR',
  en: 'LOADING',
  de: 'LÄDT'
}

export default function LoadingOverlay ({
  isFadingOut = false
}: {
  isFadingOut?: boolean
}) {
  // 2. Aktif dili context'ten çek
  // Eğer context henüz yüklenmediyse varsayılan olarak 'en' veya 'tr' kullanır
  const { lang } = useLanguage()

  // Seçili dile uygun metni al, yoksa İngilizce göster
  const currentText = LOAD_TEXTS[lang] || LOAD_TEXTS['en']

  return (
    <div
      className={`
        fixed inset-0 z-[9999] flex flex-col items-center justify-center 
        bg-[#ecf2ff] dark:bg-[#0f172a] text-slate-900 dark:text-white 
        w-screen h-screen
        transition-opacity duration-700 ease-in-out
        ${isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}
      `}
    >
      <div className='relative w-24 h-24 mb-8'>
        {/* Dış Halka */}
        <div className='absolute inset-0 rounded-full border-4 border-slate-300 dark:border-slate-700 opacity-30'></div>

        {/* Dönen Halka */}
        <div className='absolute inset-0 rounded-full border-4 border-red-500 border-t-transparent animate-spin'></div>

        {/* Logo */}
        <div className='absolute inset-0 flex items-center justify-center p-2 animate-pulse'>
          <Image
            src={'/nost.png'}
            alt='FirmLogo'
            width={100}
            height={100}
            className='object-contain w-full h-full'
            priority
          />
        </div>
      </div>

      {/* Dinamik Metin */}
      <h2 className='text-lg font-medium tracking-[0.2em] font-[oswald] uppercase'>
        {currentText}
      </h2>
    </div>
  )
}
