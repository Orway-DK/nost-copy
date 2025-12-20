'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useLanguage } from '@/components/LanguageProvider'
import Image from 'next/image'
// HeroBackground bileşenini artık kullanmıyoruz veya sayfa yapısından gelmesini bekliyoruz.
// Eğer sayfa yapısında varsa buradaki importu kaldırabilirsiniz.

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
    <div className='relative w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16'>
      {/* --- HERO SECTION (Yatay & Kompakt) --- */}
      <header className='relative w-full h-[300px] lg:h-[400px] mb-6 overflow-hidden rounded-3xl shadow-xl group border border-border/20'>
        <div className='absolute inset-0 bg-black/40 z-10' />
        <Image
          src='https://fdhmxyqxkezkfmcjaanz.supabase.co/storage/v1/object/public/services/photo-1642480532034-362360552ccb.avif'
          alt='Printing Press'
          fill
          className='object-cover group-hover:scale-105 transition-transform duration-1000'
          priority
        />
        <div className='absolute inset-0 flex flex-col items-center justify-center z-20 text-center text-white p-4'>
          <h1 className='text-4xl md:text-6xl font-black tracking-tight uppercase mb-2 drop-shadow-lg'>
            {t.hero_title}
          </h1>
          <div className='h-1 w-20 bg-primary rounded-full mb-3'></div>
          <p className='text-sm md:text-lg tracking-[0.3em] font-light uppercase opacity-90'>
            {t.hero_subtitle}
          </p>
        </div>
      </header>

      {/* --- BENTO GRID (Yatay Kurgu) --- */}
      {/* 4 Kolonlu Grid Yapısı: lg:grid-cols-4 */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 auto-rows-[minmax(180px,auto)]'>
        {/* 1. KUTU: Başlık & Rol (Sol Üst) - 2 birim genişlik */}
        <div className='lg:col-span-2 bg-primary text-primary-foreground p-8 rounded-3xl flex flex-col justify-center shadow-lg min-h-[200px]'>
          <h2 className='text-2xl md:text-4xl font-light mb-2 leading-tight'>
            {t.grid_title}
          </h2>
          <p className='text-xs uppercase tracking-[0.2em] font-bold opacity-80'>
            {t.grid_role}
          </p>
        </div>

        {/* 2. KUTU: İstatistikler (Sağ Üst) - 2 birim genişlik */}
        <div className='lg:col-span-2 bg-secondary text-secondary-foreground p-8 rounded-3xl flex items-center justify-around shadow-md border border-border/20 min-h-[200px]'>
          {[
            { val: t.stat_1_val, label: t.stat_1_label },
            { val: t.stat_2_val, label: t.stat_2_label },
            { val: t.stat_3_val, label: t.stat_3_label }
          ].map((stat, idx) => (
            <div key={idx} className='text-center'>
              <span className='block text-3xl md:text-5xl font-black text-primary mb-1'>
                {stat.val}
              </span>
              <p className='text-[10px] md:text-xs uppercase tracking-widest font-bold opacity-60'>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* 3. KUTU: Makine Görseli (Sol Orta) - 1 birim genişlik, 2 birim yükseklik */}
        <div className='lg:col-span-1 lg:row-span-2 relative min-h-[300px] lg:min-h-full rounded-3xl overflow-hidden shadow-lg border border-border/20 group'>
          <Image
            src='https://fdhmxyqxkezkfmcjaanz.supabase.co/storage/v1/object/public/services/vecteezy_modern-printing-press-produces-multi-colored-printouts_24654893.jpg'
            alt='Printing Machine Detail'
            fill
            className='object-cover transition-transform duration-700 group-hover:scale-110'
          />
          <div className='absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-95' />
          <div className='absolute bottom-6 left-6 text-white'>
            <p className='text-xs font-bold uppercase tracking-widest text-primary mb-1'>
              Teknoloji
            </p>
            <p className='text-lg font-medium leading-tight'>
              Son teknoloji baskı makineleri.
            </p>
          </div>
        </div>

        {/* 4. KUTU: Hikaye Metni (Orta) - 2 birim genişlik */}
        <div className='lg:col-span-2 bg-card text-card-foreground p-8 rounded-3xl shadow-sm border border-border/40 flex flex-col justify-center'>
          <h3 className='text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4'>
            {t.bio_title}
          </h3>
          <p className='text-sm md:text-base leading-relaxed font-medium text-muted-foreground'>
            {t.bio_text}
          </p>
        </div>

        {/* 5. KUTU: Küçük Bilgi (Sağ Orta) - 1 birim genişlik */}
        <div className='bg-muted/50 text-foreground p-8 rounded-3xl flex flex-col justify-center border border-border/10'>
          <p className='text-sm font-medium italic mb-4'>
            "Kalite asla tesadüf değildir."
          </p>
          <button className='text-xs font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all'>
            Daha Fazla <span className='text-lg'>→</span>
          </button>
        </div>
        {/* 6. KUTU: Geniş Motto (Alt Sol) - 3 birim genişlik */}
        <div className='lg:col-span-3 bg-secondary/80 backdrop-blur-md text-secondary-foreground p-8 flex items-center rounded-3xl border border-border/20'>
          <h2 className='text-lg md:text-xl font-light leading-snug tracking-tight'>
            {t.intro_text}
          </h2>
        </div>
      </div>
    </div>
  )
}
