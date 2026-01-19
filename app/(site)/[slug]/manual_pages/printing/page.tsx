'use client'

import React from 'react'
import Image from 'next/image'

export default function PrintingPage () {
  return (
    <div className='w-full min-h-screen bg-background text-foreground transition-colors duration-300'>
      {/* --- HERO BÖLÜMÜ --- */}
      <section className='relative h-[600px] w-full flex items-center justify-center overflow-hidden bg-secondary'>
        {/* Görsel Katmanı */}
        <div className='absolute inset-0 z-0'>
          <Image
            src='/images/printing-hero-special.jpg'
            alt='Printing Service Hero'
            fill
            className='object-cover opacity-40 dark:opacity-30'
            priority
          />
          {/* Alt kısımdaki içeriğe yumuşak geçiş için degrade overlay */}
          <div className='absolute inset-0 bg-gradient-to-b from-transparent via-secondary/20 to-secondary/80' />
        </div>

        <div className='relative z-10 text-center px-6 max-w-5xl'>
          <h1 className='text-5xl md:text-8xl font-black mb-6 tracking-tighter text-primary-foreground leading-none'>
            SINIRSIZ BASKI
          </h1>
          <p className='text-lg md:text-2xl font-medium text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed'>
            Hayal ettiğiniz her şeyi en yüksek kalite standartlarında kağıda
            döküyoruz.
          </p>

          <button className='mt-10 px-10 py-4 bg-primary text-primary-foreground font-black rounded-full hover:bg-primary-hover hover:-translate-y-1 transition-all shadow-xl shadow-primary/20 uppercase tracking-widest text-sm'>
            Hemen Teklif Al
          </button>
        </div>
      </section>

      {/* --- ÖZEL İÇERİK BÖLÜMÜ (Bento Tarzı) --- */}
      <section className='py-24 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center'>
        <div className='space-y-8'>
          <div className='inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-[0.2em]'>
            Amiral Gemisi Hizmetimiz
          </div>
          <h2 className='text-4xl md:text-5xl font-bold text-foreground leading-tight'>
            Neden Bizim Baskı <br />{' '}
            <span className='text-primary'>Çözümlerimiz?</span>
          </h2>

          <p className='text-lg text-slate-400 dark:text-slate-300 leading-relaxed font-medium'>
            Diğer hizmetlerimizden farklı olarak, baskı departmanımızda
            <span className='text-foreground font-bold'>
              {' '}
              Heidelberg XL-75
            </span>{' '}
            makineleri kullanıyoruz. Bu sayfa özel olarak tasarlandı çünkü baskı
            bizim uzmanlık alanımız.
          </p>

          <ul className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {[
              '24 Saatte Teslim',
              'Pantone Renk Garantisi',
              'Ücretsiz Numune',
              'Özel Kağıt Seçenekleri'
            ].map((item, i) => (
              <li
                key={i}
                className='flex items-center gap-3 text-foreground/90 font-bold text-sm'
              >
                <span className='w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs'>
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Video/Görsel Alanı - Glassmorphism efekti eklendi */}
        <div className='bg-card/80 backdrop-blur-md p-4 rounded-[2.5rem] h-[450px] border border-border/40 shadow-2xl relative group'>
          <div className='w-full h-full flex items-center justify-center text-muted-foreground border-2 border-dashed border-border/60 rounded-[2rem] bg-background/50 overflow-hidden'>
            <span className='text-sm font-bold tracking-widest uppercase opacity-40 group-hover:opacity-100 transition-opacity'>
              Özel Baskı Videoları Alanı
            </span>
          </div>
        </div>
      </section>

      {/* --- SÜREÇ BÖLÜMÜ --- */}
      <section className='bg-secondary/50 dark:bg-card/30 py-24 border-y border-border/20'>
        <div className='max-w-7xl mx-auto px-6 text-center'>
          <h3 className='text-3xl md:text-5xl font-black mb-16 text-foreground tracking-tight'>
            Baskı Sürecimiz <span className='text-primary'>Nasıl İşliyor?</span>
          </h3>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {[
              {
                step: '01',
                title: 'Dosyanı Yükle',
                desc: 'Tasarımını PDF veya AI formatında panelimize aktar.'
              },
              {
                step: '02',
                title: 'Onayla',
                desc: 'Uzmanlarımız dosyayı kontrol etsin ve onayını alsın.'
              },
              {
                step: '03',
                title: 'Teslim Al',
                desc: 'Hızla üretilen siparişin kapına kadar gelsin.'
              }
            ].map((item, i) => (
              <div
                key={i}
                className='group p-10 bg-card border border-border/40 rounded-[2rem] hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2'
              >
                <div className='text-primary font-black text-4xl mb-6 opacity-40 group-hover:opacity-100 transition-opacity'>
                  {item.step}
                </div>
                <h4 className='text-xl font-bold text-foreground mb-4'>
                  {item.title}
                </h4>
                <p className='text-sm text-muted-foreground leading-relaxed'>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
