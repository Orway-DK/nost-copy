'use client'

import React from 'react'
import Image from 'next/image'

// --- ÖRNEK GÖRSELLER ---
const ARTWORKS = [
  {
    id: 1,
    title: 'Abstract Flow',
    src: 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=1000&auto=format&fit=crop',
    color: 'bg-blue-500'
  },
  {
    id: 2,
    title: 'Geometric Harmony',
    src: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop',
    color: 'bg-primary'
  },
  {
    id: 3,
    title: 'Minimalist Lines',
    src: 'https://images.unsplash.com/photo-1717748347101-0bbee4b75fd5?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    color: 'bg-orange-500'
  }
]

export default function HangingGallery () {
  return (
    <section className='py-32 w-full min-h-screen bg-background transition-colors duration-300 overflow-hidden'>
      <div className='max-w-7xl mx-auto px-6'>
        <div className='text-center mb-24'>
          <span className='inline-block text-primary font-bold text-xs md:text-sm tracking-[0.3em] uppercase mb-4'>
            Sergimiz
          </span>
          <h2 className='text-4xl md:text-6xl font-black text-foreground mb-6 tracking-tight'>
            Duvarlarımızdaki <span className='text-primary italic'>Sanat</span>
          </h2>
          <p className='text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed'>
            İşçiliğimizin kalitesini dijital bir müze deneyimiyle inceleyin.
            <span className='hidden md:inline'>
              {' '}
              (Resimlerin üzerine gelerek sallanma efektini görün)
            </span>
          </p>
        </div>

        {/* GALERİ GRID */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-20 md:gap-12 mt-12'>
          {ARTWORKS.map((art, index) => (
            <HangingFrame key={art.id} art={art} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

function HangingFrame ({
  art,
  index
}: {
  art: typeof ARTWORKS[0]
  index: number
}) {
  const delayClass =
    index === 0
      ? 'delay-0'
      : index === 1
      ? 'delay-150'
      : index === 2
      ? 'delay-300'
      : ''

  return (
    <div className='relative group w-full flex justify-center h-[520px]'>
      {/* PIVOT NOKTASI */}
      <div
        className={`relative w-[300px] origin-top transition-transform duration-[2000ms] ease-in-out group-hover:rotate-6 group-hover:duration-500 ${delayClass} will-change-transform`}
      >
        {/* --- ÇİVİ VE İPLER --- */}
        <div className='absolute -top-[70px] left-1/2 -translate-x-1/2 w-full h-[70px] z-10'>
          {/* Çivi: Dark mode'da daha belirgin olması için border-primary/20 eklendi */}
          <div className='absolute top-0 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-foreground rounded-full shadow-lg z-20 border-2 border-background'></div>

          {/* İpler: Tema foreground rengini kullanarak dinamik hale getirildi */}
          <div className='absolute top-2 left-1/2 w-[1.5px] h-[80px] bg-gradient-to-b from-foreground/40 to-transparent origin-top -rotate-[28deg] -translate-x-full'></div>
          <div className='absolute top-2 left-1/2 w-[1.5px] h-[80px] bg-gradient-to-b from-foreground/40 to-transparent origin-top rotate-[28deg]'></div>
        </div>

        {/* --- ÇERÇEVE (FRAME) --- */}
        <div className='relative bg-card p-4 pb-16 shadow-2xl rounded-sm border-[6px] border-card-hover/50 dark:border-white/5 overflow-hidden transition-colors duration-300'>
          {/* Resim Konteynırı */}
          <div className='relative w-full aspect-[3/4] overflow-hidden bg-muted transition-colors duration-300'>
            <Image
              src={art.src}
              alt={art.title}
              fill
              className='object-cover transition-transform duration-1000 group-hover:scale-110'
            />

            {/* Müze Camı Efekti */}
            <div className='absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none'></div>
          </div>

          {/* Alt Etiket (Müze Künyesi) */}
          <div className='absolute bottom-5 left-0 w-full text-center px-4'>
            <h3 className='font-poppins text-lg font-bold text-foreground uppercase tracking-[0.1em]'>
              {art.title}
            </h3>
            <div
              className={`w-10 h-1 ${art.color} mx-auto mt-3 rounded-full shadow-sm`}
            ></div>
          </div>

          {/* Bant Efekti (Retro Görünüm) */}
          <div className='absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-background/40 backdrop-blur-md rotate-1 shadow-sm border border-foreground/5 pointer-events-none'></div>
        </div>

        {/* --- YERDEKİ GÖLGE --- */}
        <div className='absolute top-[105%] left-1/2 -translate-x-1/2 w-[85%] h-6 bg-black/30 dark:bg-black/60 blur-2xl rounded-[100%] transition-all duration-700 group-hover:translate-x-12 group-hover:opacity-10'></div>
      </div>
    </div>
  )
}
