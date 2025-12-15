'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useLanguage } from '@/components/LanguageProvider'
import Image from 'next/image'

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
    // BG rengi kaldırıldı, ana temadan (hafif cyan) beslenecek.
    <section className='min-h-screen py-12 md:py-20 font-sans text-foreground'>
      <div className='max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8'>
        {/* --- HEADER IMAGE SECTION --- */}
        <div className='relative w-full h-[400px] md:h-[500px] mb-6 overflow-hidden group shadow-lg rounded-xl'>
          {/* Görselin üzerine temanın primary rengiyle hafif bir overlay atıyoruz */}
          <div className='absolute inset-0 bg-primary/40 z-10' />

          <div className='absolute inset-0 bg-black/20 z-0'>
            <Image
              src='https://images.unsplash.com/photo-1562577309-4932fdd64cd1?q=80&w=2070&auto=format&fit=crop'
              alt='Nost Copy Printing Workshop'
              fill
              className='object-cover opacity-90 group-hover:scale-105 transition-transform duration-700'
            />
          </div>

          <div className='absolute inset-0 flex items-center justify-center z-20'>
            <div className='border border-white/30 backdrop-blur-md bg-black/30 px-12 py-8 md:px-24 md:py-12 text-center text-white shadow-xl rounded-lg'>
              <h1 className='text-3xl md:text-5xl font-bold tracking-[0.2em] uppercase mb-2 drop-shadow-md'>
                {t.hero_title}
              </h1>
              <p className='text-sm md:text-base tracking-widest font-light opacity-90'>
                {t.hero_subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* --- BENTO GRID LAYOUT --- */}
        <div className='grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-min'>
          {/* --- SOL KOLON --- */}
          <div className='md:col-span-4 lg:col-span-3 flex flex-col gap-6'>
            {/* Koyu Blok: bg-primary */}
            <div className='bg-primary text-primary-foreground p-8 md:p-10 flex flex-col justify-center min-h-[200px] shadow-sm rounded-xl'>
              <h2 className='text-2xl md:text-3xl font-light mb-2'>
                {t.grid_title}
              </h2>
              <p className='text-xs uppercase tracking-widest opacity-80'>
                {t.grid_role}
              </p>
            </div>

            {/* İstatistikler: bg-secondary */}
            <div className='bg-secondary text-secondary-foreground p-8 flex flex-col justify-between gap-8 shadow-sm rounded-xl'>
              {[
                { val: t.stat_1_val, label: t.stat_1_label },
                { val: t.stat_2_val, label: t.stat_2_label },
                { val: t.stat_3_val, label: t.stat_3_label }
              ].map((stat, idx) => (
                <div key={idx} className='text-center'>
                  <span className='block text-4xl font-light text-primary'>
                    {stat.val}
                  </span>
                  <span className='text-[10px] uppercase tracking-wide opacity-70'>
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Küçük Bilgi: bg-card veya bg-muted */}
            <div className='bg-muted text-muted-foreground p-8 shadow-sm rounded-xl'>
              <p className='text-sm font-light leading-relaxed opacity-90'>
                "Teknolojiyi zanaatla birleştiriyoruz."
              </p>
              <span className='block mt-4 text-xs text-primary font-semibold cursor-pointer hover:underline'>
                Daha fazla bilgi →
              </span>
            </div>
          </div>

          {/* --- ORTA KOLON --- */}
          <div className='md:col-span-4 lg:col-span-4 flex flex-col gap-6'>
            {/* Portre Fotoğraf */}
            <div className='relative aspect-[3/4] w-full bg-muted shadow-sm overflow-hidden rounded-xl'>
              <Image
                src='https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1888&auto=format&fit=crop'
                alt='Creative Director'
                fill
                className='object-cover grayscale hover:grayscale-0 transition-all duration-700'
              />
            </div>

            {/* Metin Bloğu: bg-card */}
            <div className='bg-card text-card-foreground p-8 shadow-sm rounded-xl border border-border/50'>
              <h3 className='text-xs uppercase tracking-widest text-muted-foreground mb-4'>
                {t.bio_title}
              </h3>
              <p className='text-sm leading-7 font-light'>{t.bio_text}</p>
            </div>
          </div>

          {/* --- SAĞ KOLON --- */}
          <div className='md:col-span-4 lg:col-span-5 flex flex-col gap-6'>
            {/* Büyük Metin: bg-secondary */}
            <div className='bg-secondary text-secondary-foreground p-8 md:p-12 min-h-[300px] flex items-center shadow-sm rounded-xl'>
              <p className='text-lg md:text-xl font-light leading-snug'>
                {t.intro_text}
              </p>
            </div>

            {/* Vurgulu Blok (Alıntı): bg-accent */}
            <div className='bg-accent text-accent-foreground p-8 md:p-12 flex flex-col justify-center min-h-[250px] shadow-sm rounded-xl'>
              <p className='text-lg font-medium leading-relaxed italic'>
                "{t.quote_text}"
              </p>
              <span className='block mt-4 text-xs uppercase tracking-widest opacity-80'>
                — {t.quote_author}
              </span>
            </div>

            {/* Footer / Avatarlar: bg-card */}
            <div className='bg-card text-card-foreground p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm rounded-xl border border-border/50'>
              <div className='flex -space-x-3'>
                <div className='w-10 h-10 rounded-full border-2 border-background bg-muted overflow-hidden relative'>
                  <Image
                    src='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
                    alt='Client 1'
                    fill
                    className='object-cover'
                  />
                </div>
                <div className='w-10 h-10 rounded-full border-2 border-background bg-muted overflow-hidden relative'>
                  <Image
                    src='https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
                    alt='Client 2'
                    fill
                    className='object-cover'
                  />
                </div>
                <div className='w-10 h-10 rounded-full border-2 border-background bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold'>
                  +500
                </div>
              </div>
              <div className='text-center sm:text-left'>
                <h4 className='font-bold text-sm mb-1'>{t.footer_title}</h4>
                <p className='text-xs text-muted-foreground leading-relaxed max-w-xs'>
                  {t.footer_text}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
