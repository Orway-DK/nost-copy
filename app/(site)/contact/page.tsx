'use client'

import React from 'react'
import Image from 'next/image'
import { useLanguage } from '@/components/LanguageProvider'

import ContactFormArea from '@/app/_components/Contact/ContactFormArea'
import WorldMapLocations from '@/app/_components/Contact/WorldMapLocations'

// --- SAYFA METİNLERİ ---
const PAGE_TEXTS: Record<string, any> = {
  tr: {
    title: 'Bize Ulaşın',
    desc: 'Sorularınız mı var? Projenizi hayata geçirmek için buradayız. Aşağıdaki formu doldurun veya dünya çapındaki ofislerimizi ziyaret edin.'
  },
  en: {
    title: 'Contact Us',
    desc: 'Have questions? We are here to bring your project to life. Fill out the form below or visit our offices worldwide.'
  },
  de: {
    title: 'Kontaktieren Sie uns',
    desc: 'Haben Sie Fragen? Wir sind hier, um Ihr Projekt zum Leben zu erwecken. Füllen Sie das untenstehende Formular aus oder besuchen Sie unsere weltweiten Büros.'
  }
}

export default function ContactPage () {
  const { lang } = useLanguage()
  const t = PAGE_TEXTS[lang] || PAGE_TEXTS.tr

  return (
    <div className='relative w-full min-h-screen bg-background text-foreground transition-colors duration-300 overflow-x-hidden'>
      {/* --- BACKGROUND ELEMENTLERİ --- */}
      <div className='absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden'>
        <div className='absolute top-0 left-0'>
          <Image
            src='/h1-bg01.svg'
            alt='bg'
            width={600}
            height={600}
            className='object-cover opacity-30 dark:opacity-10 w-[300px] md:w-[600px] transition-opacity'
            priority
          />
        </div>
        <div className='absolute top-[30%] -right-[10%] rotate-90 opacity-20 dark:opacity-5'>
          <Image
            src='/h1-slider1.svg'
            alt='bg'
            width={800}
            height={800}
            className='object-cover w-[400px] md:w-[800px] transition-opacity'
          />
        </div>
        <div className='absolute top-0 right-0 opacity-30 dark:opacity-10'>
          <Image
            src='/h1-slider2.svg'
            alt='bg'
            width={700}
            height={700}
            className='object-cover w-[300px] md:w-[700px] transition-opacity'
          />
        </div>
      </div>

      {/* --- ANA İÇERİK --- */}
      <main className='relative z-10 w-full'>
        {/* Header / Banner Bölümü */}
        <section className='py-20 md:py-32 text-center'>
          <div className='max-w-7xl mx-auto px-6'>
            {/* Kategori Badge (Opsiyonel Stil Katkısı) */}
            <span className='inline-block text-primary font-bold text-xs md:text-sm tracking-[0.3em] uppercase mb-4'>
              {lang === 'tr'
                ? 'İLETİŞİM'
                : lang === 'de'
                ? 'KONTAKT'
                : 'CONTACT'}
            </span>

            {/* DİNAMİK BAŞLIK: text-foreground kullanımı */}
            <h1 className='text-4xl md:text-6xl lg:text-7xl font-black text-foreground mb-8 tracking-tight leading-[1.1]'>
              {t.title}
            </h1>

            {/* DİNAMİK AÇIKLAMA: text-muted-foreground ile dengeli kontrast */}
            <p className='text-base md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium'>
              {t.desc}
            </p>
          </div>
        </section>

        {/* Harita Bölümü */}
        <section className='w-full mb-20'>
          <WorldMapLocations />
        </section>

        {/* Form Alanı Bölümü */}
        <section className='pb-20'>
          <ContactFormArea />
        </section>
      </main>
    </div>
  )
}
