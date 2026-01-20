'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useLanguage } from '@/components/LanguageProvider'

// Bileşenler
import ContactChannels from '@/app/_components/Contact/ContactChannels'
import MapArea from '@/app/_components/Contact/MapArea'
import ContactFormModal from '@/app/_components/Contact/ContactFormModal' // YENİ MODAL

const PAGE_TEXTS: Record<string, any> = {
  tr: {
    title: 'Bize Ulaşın',
    desc: 'Sorularınız mı var? Projenizi hayata geçirmek için buradayız. Dijital kanallarımızdan bize anında ulaşabilir veya mesaj bırakabilirsiniz.'
  },
  en: {
    title: 'Contact Us',
    desc: 'Have questions? We are here to bring your project to life. Reach us instantly via our digital channels or leave a message.'
  },
  de: {
    title: 'Kontaktieren Sie uns',
    desc: 'Haben Sie Fragen? Wir sind hier, um Ihr Projekt zum Leben zu erwecken. Erreichen Sie uns sofort über unsere digitalen Kanäle.'
  }
}

export default function ContactPage () {
  const { lang } = useLanguage()
  const t = PAGE_TEXTS[lang] || PAGE_TEXTS.tr

  // State: Harita aktif mi? (DB'den gelir)
  const [isMapActive, setIsMapActive] = useState(false)
  const [loadingSettings, setLoadingSettings] = useState(true)

  // State: Modal Açık mı?
  const [isFormOpen, setIsFormOpen] = useState(false)

  useEffect(() => {
    async function fetchSettings () {
      const supabase = createSupabaseBrowserClient()
      const { data } = await supabase
        .from('site_settings')
        .select('contact_map_active')
        .maybeSingle()

      if (data) {
        setIsMapActive(data.contact_map_active ?? false)
      }
      setLoadingSettings(false)
    }
    fetchSettings()
  }, [])

  return (
    <div className='relative w-full text-foreground transition-colors duration-300 overflow-x-hidden'>
      <div className='absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden'>
        <div className='absolute top-0 left-0'>
          <Image
            src='/h1-bg01.svg'
            alt='bg'
            width={600}
            height={600}
            className='object-cover opacity-30 dark:opacity-10 w-[300px] md:w-[600px]'
            priority
          />
        </div>
        <div className='absolute top-[30%] -right-[10%] rotate-90 opacity-20 dark:opacity-5'>
          <Image
            src='/h1-slider1.svg'
            alt='bg'
            width={800}
            height={800}
            className='object-cover w-[400px] md:w-[800px]'
          />
        </div>
      </div>

      {/* --- MODAL (Sayfanın en üstünde render edilir) --- */}
      <ContactFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />

      {/* --- ANA İÇERİK --- */}
      <main className='relative z-10 w-full'>
        {/* Header */}
        <section className='pt-10 md:pt-12 text-center'>
          <div className='max-w-7xl mx-auto px-6'>
            <span className='inline-block text-primary font-bold text-xs md:text-sm tracking-[0.3em] uppercase mb-4'>
              {lang === 'tr'
                ? 'İLETİŞİM'
                : lang === 'de'
                ? 'KONTAKT'
                : 'CONTACT'}
            </span>
            <h1 className='text-4xl md:text-6xl lg:text-7xl font-black text-foreground mb-6 tracking-tight leading-[1.1]'>
              {t.title}
            </h1>
            <p className='text-base md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium'>
              {t.desc}
            </p>
          </div>
        </section>

        {/* Dinamik Alan */}
        <section className='w-full mb-32 px-4 md:px-6'>
          <div className='max-w-7xl lg:max-w-screen-xl 2xl:max-w-[1800px] mx-auto'>
            <div
              className={`
                  relative w-full rounded-3xl backdrop-blur-sm overflow-hidden shadow-sm transition-all duration-500
                  ${
                    isMapActive
                      ? 'h-[500px] md:h-[600px] 2xl:h-[800px]'
                      : 'h-auto py-8 md:py-12'
                  }
                `}
            >
              {loadingSettings ? (
                <div className='w-full h-full flex items-center justify-center min-h-[300px]'>
                  <div className='animate-pulse flex flex-col items-center'>
                    <div className='h-4 w-4 bg-primary rounded-full mb-2'></div>
                    <span className='text-muted-foreground text-sm'>
                      Yükleniyor...
                    </span>
                  </div>
                </div>
              ) : isMapActive ? (
                <MapArea />
              ) : (
                <ContactChannels onOpenForm={() => setIsFormOpen(true)} />
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
