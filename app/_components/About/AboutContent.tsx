// C:\Projeler\nost-copy\app\_components\AboutPage\AboutContent.tsx
'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useLanguage } from '@/components/LanguageProvider'
import Image from 'next/image'
import HeroBackground from '../HeroBackground' // Doğru yoldan import ettiğinden emin ol

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const FALLBACKS: Record<string, any> = {
  tr: {
    hero_title: 'NOST COPY',
    hero_subtitle: 'Baskı Sanatında Ustalık',
    grid_title: 'Nost Copy Ekibi',
    grid_role: 'Profesyonel Baskı Çözümleri',
    stat_1_val: '10+',
    stat_1_label: 'Yıllık Deneyim',
    stat_2_val: '5K+',
    stat_2_label: 'Tamamlanan Proje',
    stat_3_val: '4',
    stat_3_label: 'Hizmet Verilen Ülke',
    bio_title: 'Kuruluş Hikayemiz',
    bio_text:
      'Küçük bir matbaa atölyesinden başlayarak, bugün global ölçekte hizmet veren bir baskı merkezine dönüştük. Her pikselde hassasiyet, her kağıtta kalite arayışımız hiç bitmedi.',
    intro_text:
      'Kurulduğumuz günden beri işimiz sadece baskı yapmak değil, markaların hikayelerini kağıda dökmek. Tasarım ve baskı süreçlerinde mükemmelliyetçilik bizim standartımız.',
    quote_text:
      'Sanatçı, tasarımcı ve üretici olarak biliyoruz ki; ekstra özen, işin kendisidir.',
    quote_author: 'Nost Copy Vizyonu',
    footer_title: 'Birlikte Başarıyoruz',
    footer_text:
      'Müşterilerimizin fikirlerini alıyor, onları somut ve etkileyici baskı ürünlerine dönüştürüyoruz.'
  }
}

type TranslationRow = {
  key_name: string
  text_tr: string
  text_en: string
  text_de: string
}

export default function AboutContent () {
  const { lang } = useLanguage()
  const [dbData, setDbData] = useState<TranslationRow[]>([])

  useEffect(() => {
    async function getData () {
      const { data } = await supabase
        .from('ui_translations')
        .select('*')
        .eq('section', 'about_page')
      if (data) setDbData(data)
    }
    getData()
  }, [])

  const t = useMemo(() => {
    const texts = { ...FALLBACKS.tr }
    if (dbData.length > 0) {
      dbData.forEach(row => {
        const langKey = `text_${lang}` as keyof TranslationRow
        const val = row[langKey] || row.text_tr
        if (val) texts[row.key_name] = val
      })
    }
    return texts
  }, [dbData, lang])

  return (
    <main className='relative min-h-screen py-8 md:py-12 lg:py-20 font-sans text-foreground transition-colors duration-300 overflow-hidden'>
      {/* --- BACKGROUND DESIGNS --- */}
      <HeroBackground />

      <div className='relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8'>
        {/* --- HERO SECTION --- */}
        <header className='relative w-full h-[350px] md:h-[450px] lg:h-[550px] mb-8 overflow-hidden group shadow-2xl rounded-2xl md:rounded-3xl border border-border/20'>
          <div className='absolute inset-0 bg-primary/30 dark:bg-primary/50 z-10' />
          <div className='absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 z-10' />

          <Image
            src='https://images.unsplash.com/photo-1562577309-4932fdd64cd1?q=80&w=2070&auto=format&fit=crop'
            alt={`${t.hero_title} - ${t.hero_subtitle}`}
            fill
            className='object-cover z-0 group-hover:scale-105 transition-transform duration-1000'
            priority
          />

          <div className='absolute inset-0 flex items-center justify-center z-20 px-4'>
            <div className='border border-white/20 backdrop-blur-xl bg-black/30 dark:bg-white/5 px-8 py-10 md:px-20 md:py-14 text-center text-white shadow-2xl rounded-2xl'>
              <h1 className='text-3xl md:text-5xl lg:text-7xl font-bold tracking-[0.15em] uppercase mb-4 drop-shadow-2xl'>
                {t.hero_title}
              </h1>
              <p className='text-xs md:text-sm lg:text-base tracking-[0.4em] font-light opacity-90 uppercase'>
                {t.hero_subtitle}
              </p>
            </div>
          </div>
        </header>

        {/* --- BENTO GRID LAYOUT --- */}
        <div className='grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 auto-rows-min'>
          {/* --- SOL KOLON --- */}
          <aside className='md:col-span-12 lg:col-span-3 flex flex-col gap-4 lg:gap-6'>
            <div className='bg-primary text-primary-foreground p-8 lg:p-10 flex flex-col justify-center min-h-[180px] shadow-lg rounded-2xl md:rounded-3xl'>
              <h2 className='text-2xl md:text-3xl lg:text-4xl font-light mb-3 leading-tight'>
                {t.grid_title}
              </h2>
              <p className='text-[10px] uppercase tracking-[0.2em] font-bold opacity-80'>
                {t.grid_role}
              </p>
            </div>

            <section className='bg-secondary/80 backdrop-blur-sm text-secondary-foreground p-8 flex flex-row lg:flex-col justify-around lg:justify-between gap-6 shadow-md rounded-2xl md:rounded-3xl border border-border/50'>
              {[
                { val: t.stat_1_val, label: t.stat_1_label },
                { val: t.stat_2_val, label: t.stat_2_label },
                { val: t.stat_3_val, label: t.stat_3_label }
              ].map((stat, idx) => (
                <article key={idx} className='text-center lg:py-4'>
                  <span className='block text-3xl md:text-4xl font-bold text-primary mb-1'>
                    {stat.val}
                  </span>
                  <p className='text-[9px] md:text-[10px] uppercase tracking-widest font-bold opacity-60'>
                    {stat.label}
                  </p>
                </article>
              ))}
            </section>

            <div className='hidden md:block bg-muted/80 backdrop-blur-sm text-muted-foreground p-8 shadow-inner rounded-2xl md:rounded-3xl border border-border/20'>
              <p className='text-sm font-medium leading-relaxed italic'>
                "Teknolojiyi zanaatla birleştiriyoruz."
              </p>
              <button
                aria-label='Learn more'
                className='mt-6 text-xs text-primary font-bold hover:gap-2 flex items-center transition-all group'
              >
                Daha fazla bilgi{' '}
                <span className='ml-1 group-hover:translate-x-1 transition-transform'>
                  →
                </span>
              </button>
            </div>
          </aside>

          {/* --- ORTA KOLON --- */}
          <div className='md:col-span-6 lg:col-span-4 flex flex-col gap-4 lg:gap-6'>
            <figure className='relative aspect-[4/5] md:aspect-[3/4] w-full bg-muted shadow-xl overflow-hidden rounded-2xl md:rounded-3xl border border-border/20'>
              <Image
                src='https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1888&auto=format&fit=crop'
                alt='Creative Director'
                fill
                className='object-cover grayscale hover:grayscale-0 transition-all duration-1000'
              />
            </figure>

            <article className='bg-card/90 backdrop-blur-md text-card-foreground p-8 lg:p-10 shadow-lg rounded-2xl md:rounded-3xl border border-border/50 flex-grow'>
              <h3 className='text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-6'>
                {t.bio_title}
              </h3>
              <p className='text-sm md:text-base leading-8 font-medium text-foreground/80'>
                {t.bio_text}
              </p>
            </article>
          </div>

          {/* --- SAĞ KOLON --- */}
          <section className='md:col-span-6 lg:col-span-5 flex flex-col gap-4 lg:gap-6'>
            <div className='bg-secondary/80 backdrop-blur-md text-secondary-foreground p-8 md:p-12 lg:p-16 min-h-[250px] md:min-h-[300px] flex items-center shadow-lg rounded-2xl md:rounded-3xl border border-border/40'>
              <h2 className='text-xl md:text-2xl lg:text-3xl font-light leading-snug tracking-tight text-foreground/90'>
                {t.intro_text}
              </h2>
            </div>

            <blockquote className='bg-muted/50 dark:bg-secondary/40 backdrop-blur-sm text-foreground p-8 md:p-12 flex flex-col justify-center min-h-[220px] shadow-inner rounded-2xl md:rounded-3xl border-l-4 border-primary'>
              <p className='text-lg md:text-xl font-medium leading-relaxed italic opacity-90'>
                "{t.quote_text}"
              </p>
              <footer className='block mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-primary'>
                — {t.quote_author}
              </footer>
            </blockquote>

            <div className='bg-card/90 backdrop-blur-md text-card-foreground p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-2xl rounded-2xl md:rounded-3xl border border-border/50'>
              <div className='flex -space-x-4'>
                {[
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
                ].map((src, i) => (
                  <div
                    key={i}
                    className='w-12 h-12 rounded-full border-4 border-card bg-muted overflow-hidden relative shadow-lg'
                  >
                    <Image
                      src={src}
                      alt='Client'
                      fill
                      className='object-cover'
                    />
                  </div>
                ))}
                <div className='w-12 h-12 rounded-full border-4 border-card bg-primary text-primary-foreground flex items-center justify-center text-[11px] font-black shadow-lg'>
                  +500
                </div>
              </div>
              <div className='text-center sm:text-left'>
                <h4 className='font-black text-sm uppercase tracking-wider mb-1'>
                  {t.footer_title}
                </h4>
                <p className='text-xs text-muted-foreground leading-relaxed max-w-xs font-medium'>
                  {t.footer_text}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
