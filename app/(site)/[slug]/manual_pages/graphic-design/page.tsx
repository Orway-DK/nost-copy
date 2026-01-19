// app/services/design/page.tsx
'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import TiltGallery from './TiltGallery'

// --- SCROLL REVEAL COMPONENT ---
function Reveal ({
  children,
  className = '',
  direction = 'up',
  delay = 0,
  duration = 0.8
}: {
  children?: React.ReactNode
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right'
  delay?: number
  duration?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.15 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const transforms = {
    up: 'translate-y-12',
    down: '-translate-y-12',
    left: '-translate-x-12',
    right: 'translate-x-12'
  }

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${className}`}
      style={{
        transitionDuration: `${duration}s`,
        transitionDelay: `${delay}ms`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate(0,0)' : transforms[direction]
      }}
    >
      {children}
    </div>
  )
}

// --- GEOMETRİK AYIRAÇ ---
function CreativeSeparator () {
  return (
    <div className='w-full py-24 flex justify-center items-center gap-12 md:gap-32 overflow-hidden opacity-60 dark:opacity-40 transition-opacity'>
      {/* Daire */}
      <div className='relative w-20 h-20 md:w-32 md:h-32 border-[1px] border-foreground rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite]'>
        <div className='w-4 h-4 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]'></div>
      </div>

      {/* Kare */}
      <div className='w-20 h-20 md:w-32 md:h-32 border-[1px] border-primary bg-primary/5 rotate-12 animate-[pulse_4s_ease-in-out_infinite]'></div>

      {/* Üçgen */}
      <div
        className='w-0 h-0 
            border-l-[40px] md:border-l-[60px] border-l-transparent
            border-b-[70px] md:border-b-[100px] border-b-foreground/60
            border-r-[40px] md:border-r-[60px] border-r-transparent
            animate-[bounce_3s_infinite]
        '
      ></div>
    </div>
  )
}

export default function DesignPage () {
  return (
    <div className='w-full min-h-screen bg-background text-foreground transition-colors duration-300 overflow-x-hidden'>
      {/* --- HERO SECTION --- */}
      <section className='relative min-h-[90vh] flex flex-col justify-center px-6 pt-20'>
        <div className='max-w-[1400px] mx-auto w-full relative z-10'>
          <Reveal
            direction='right'
            delay={100}
            className='w-24 h-2 bg-primary mb-8 rounded-full'
          />

          <h1 className='text-7xl md:text-[10rem] font-black tracking-tighter leading-[0.85] mb-8'>
            <Reveal direction='up' delay={200}>
              <span className='block text-foreground drop-shadow-sm'>
                VISUAL
              </span>
            </Reveal>
            <Reveal direction='up' delay={400}>
              {/* Dark mode uyumlu mix-blend ve blur efekti */}
              <span className='block text-primary transition-all duration-700 hover:blur-[4px] hover:scale-[1.02] cursor-default mix-blend-plus-lighter dark:mix-blend-lighten'>
                ALCHEMY
              </span>
            </Reveal>
          </h1>

          <TiltGallery />

          <Reveal
            direction='up'
            delay={600}
            className='flex flex-col md:flex-row gap-8 mt-12 items-start'
          >
            <p className='text-xl md:text-2xl text-muted-foreground max-w-xl font-light leading-relaxed'>
              Tasarım, zekanın görünür halidir. Markanızın ruhunu,{' '}
              <strong className='text-foreground border-b-2 border-primary/50'>
                sanatsal bir dille
              </strong>{' '}
              tercüme ediyoruz.
            </p>
            <div className='w-16 h-16 rounded-full border border-primary/30 flex items-center justify-center animate-[spin_8s_linear_infinite] text-primary'>
              <span className='text-2xl font-light'>↓</span>
            </div>
          </Reveal>
        </div>

        {/* Arkaplan Soyut Görsel - Dark mode'da daha düşük opacity */}
        <div className='absolute top-0 right-0 w-full md:w-2/3 h-full -z-10 opacity-30 dark:opacity-10 pointer-events-none transition-opacity duration-1000'>
          <div className='relative w-full h-full gradient-mask-l'>
            <Image
              src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop'
              alt='Abstract Fluid Art'
              fill
              className='object-cover'
              priority
            />
          </div>
        </div>
      </section>

      {/* --- GEOMETRİK AYIRAÇ --- */}
      <Reveal delay={200}>
        <CreativeSeparator />
      </Reveal>

      {/* --- GALLERY SECTION --- */}
      <section className='py-20 px-6'>
        <div className='max-w-[1400px] mx-auto'>
          <Reveal
            direction='up'
            className='mb-16 flex justify-between items-end'
          >
            <h2 className='text-sm font-black tracking-[0.5em] text-primary uppercase'>
              Selected Works
            </h2>
            <div className='hidden md:block w-32 h-[1px] bg-border'></div>
          </Reveal>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-[400px]'>
            {/* Kart 1: Branding */}
            <Reveal
              delay={100}
              className='lg:col-span-2 group relative overflow-hidden rounded-[2.5rem] bg-card border border-border/40 shadow-xl'
            >
              <Image
                src='https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=2000&auto=format&fit=crop'
                alt='Minimalist Branding'
                fill
                className='object-cover transition-transform duration-1000 group-hover:scale-105'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-[2px]'>
                <h3 className='text-5xl font-black text-foreground tracking-tighter uppercase italic'>
                  BRANDING
                </h3>
              </div>
            </Reveal>

            {/* Kart 2: Graphic Art */}
            <Reveal
              delay={200}
              className='group relative overflow-hidden rounded-[2.5rem] bg-card border border-border/40 shadow-xl'
            >
              <Image
                src='https://images.unsplash.com/vector-1742739891335-8c946e23aa48?q=80&w=764&auto=format&fit=crop'
                alt='Graphic Design'
                fill
                className='object-cover transition-transform duration-1000 group-hover:rotate-3 group-hover:scale-110'
              />
              <div className='absolute bottom-8 left-8 bg-background/80 px-6 py-3 rounded-2xl backdrop-blur-xl border border-border/50 shadow-2xl'>
                <span className='text-foreground font-black text-xs tracking-widest uppercase'>
                  GRAPHIC ART
                </span>
              </div>
            </Reveal>

            {/* Kart 3: Tech UI */}
            <Reveal
              delay={300}
              className='group relative overflow-hidden rounded-[2.5rem] bg-card border border-border/40 shadow-xl'
            >
              <Image
                src='https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop'
                alt='Tech UI'
                fill
                className='object-cover transition-transform duration-1000 group-hover:scale-105 grayscale dark:opacity-80 group-hover:grayscale-0 group-hover:opacity-100'
              />
              <div className='absolute top-8 right-8 w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-black text-sm shadow-2xl animate-pulse'>
                UI
              </div>
            </Reveal>

            {/* Kart 4: Digital Experiences */}
            <Reveal
              delay={400}
              className='lg:col-span-2 group relative overflow-hidden rounded-[2.5rem] bg-secondary border border-border/40 flex flex-col justify-center p-12 lg:p-20 shadow-2xl'
            >
              <div className='absolute right-0 top-0 w-96 h-96 bg-primary blur-[120px] opacity-10 group-hover:opacity-30 transition-opacity duration-700' />
              <h3 className='text-4xl md:text-6xl font-black mb-6 relative z-10 text-foreground tracking-tight leading-none'>
                Digital <br /> Experiences
              </h3>
              <p className='text-lg text-muted-foreground max-w-md relative z-10 font-medium leading-relaxed'>
                Kullanıcı deneyimini (UX) merkeze alan, estetik ve
                fonksiyonelliği sanatsal bir çizgide birleştiren web arayüzleri.
              </p>
              <Link
                href='/contact'
                className='mt-10 inline-flex items-center gap-4 text-primary font-black uppercase tracking-widest text-sm hover:gap-6 transition-all relative z-10 group/btn'
              >
                Projeyi İncele{' '}
                <span className='transition-transform group-hover/btn:translate-x-1'>
                  →
                </span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* --- SERVICES LIST --- */}
      <section className='py-24 bg-card/30 border-y border-border/20'>
        <div className='max-w-5xl mx-auto px-6'>
          <Reveal>
            <h2 className='text-5xl md:text-8xl font-black mb-20 text-center tracking-tighter leading-none'>
              WHAT WE{' '}
              <span className='text-transparent text-stroke text-stroke-foreground/30 dark:text-stroke-foreground/20 italic'>
                CRAFT
              </span>
            </h2>
          </Reveal>

          <div className='divide-y divide-border/30 border-t border-border/30'>
            {[
              {
                id: '01',
                title: 'Visual Identity',
                desc: 'Logo, Renk Paleti, Tipografi'
              },
              {
                id: '02',
                title: 'Web & Mobile UI',
                desc: 'Arayüz Tasarımı, Prototipleme'
              },
              {
                id: '03',
                title: 'Print & Packaging',
                desc: 'Ambalaj, Katalog, Dergi'
              },
              {
                id: '04',
                title: 'Motion Graphics',
                desc: 'Animasyon, Video Kurgu'
              }
            ].map((item, i) => (
              <Reveal
                key={item.id}
                delay={i * 100}
                className='group py-12 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-primary/[0.03] transition-all px-6 cursor-pointer'
              >
                <div className='flex items-baseline gap-8'>
                  <span className='text-sm font-black text-primary/40 group-hover:text-primary transition-colors tracking-tighter'>
                    /{item.id}
                  </span>
                  <h3 className='text-4xl md:text-6xl font-bold group-hover:translate-x-4 transition-transform duration-500 text-foreground/90 group-hover:text-foreground'>
                    {item.title}
                  </h3>
                </div>
                <p className='mt-6 md:mt-0 text-muted-foreground group-hover:text-foreground font-medium text-lg text-right md:max-w-xs leading-tight transition-colors'>
                  {item.desc}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className='py-40 px-6 relative overflow-hidden bg-background'>
        <div className='absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent opacity-50 dark:opacity-20' />

        <div className='max-w-5xl mx-auto text-center relative z-10'>
          <Reveal direction='up'>
            <h2 className='text-6xl md:text-9xl font-black mb-12 leading-tight tracking-tighter'>
              LET'S MAKE <br />
              <span className='text-primary blur-sm hover:blur-none transition-all duration-700 cursor-pointer italic'>
                MAGIC.
              </span>
            </h2>
            <Link
              href='/contact'
              className='group relative inline-flex items-center justify-center px-16 py-6 text-sm font-black uppercase tracking-[0.3em] text-primary-foreground bg-primary rounded-full overflow-hidden transition-all hover:scale-105 shadow-2xl shadow-primary/20'
            >
              <span className='absolute w-0 h-0 transition-all duration-700 ease-out bg-white rounded-full group-hover:w-[30rem] group-hover:h-[30rem] opacity-10'></span>
              <span className='relative'>Start a Project</span>
            </Link>
          </Reveal>
        </div>
      </section>

      <style jsx global>{`
        .gradient-mask-l {
          mask-image: linear-gradient(
            to right,
            rgba(0, 0, 0, 1) 30%,
            rgba(0, 0, 0, 0) 100%
          );
          -webkit-mask-image: linear-gradient(
            to right,
            rgba(0, 0, 0, 1) 30%,
            rgba(0, 0, 0, 0) 100%
          );
        }
      `}</style>
    </div>
  )
}
