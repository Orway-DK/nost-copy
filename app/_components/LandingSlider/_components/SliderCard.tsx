// C:\Projeler\nost-copy\app\_components\LandingSlider\_components\SliderCard.tsx
'use client'

import Image from 'next/image'
import Reveal from './Reveal'
import CircularText from './CircularText/CircularText'

type SliderCardProps = {
  title: string
  title2: string
  description: string
  ctaText?: string
  imageSrc: string
  imageAlt?: string
  isActive?: boolean
  href?: string
  tips?: string[]
}

export default function SliderCard ({
  title,
  title2,
  description,
  ctaText = 'Detaylar',
  imageSrc,
  imageAlt = '',
  isActive = false,
  href = '#',
  tips = []
}: SliderCardProps) {
  return (
    <section className='w-full max-w-full flex justify-center px-4 md:px-0 overflow-visible'>
      <div className='max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 items-center gap-10 md:gap-4'>
        {/* --- SOL METİN ALANI --- */}
        <div className='flex flex-col gap-6 md:gap-6 text-center md:text-left items-center md:items-start order-2 md:order-1 w-full min-w-0'>
          {/* TITLE 1 */}
          <Reveal
            direction='down'
            delayMs={200}
            once={true}
            priority={true}
            className='w-full'
          >
            <h2 className='text-4xl sm:text-5xl md:text-8xl leading-snug md:leading-tight font-[onest] font-semibold md:-mb-8 break-words text-foreground'>
              {title}
            </h2>
          </Reveal>

          {/* CIRCULAR + TITLE 2 */}
          <div className='flex flex-col sm:flex-row items-center gap-6 sm:gap-4 w-full justify-center md:justify-start'>
            {/* Circular Text */}
            <div className='scale-90 sm:scale-100 shrink-0 relative z-10 text-foreground'>
              <CircularText text='- PRINTING SERVICE - PRINTING SERVICE ' />
            </div>

            {/* TITLE 2 */}
            <Reveal direction='left' delayMs={600} once={true} priority={true}>
              <h2 className='text-4xl sm:text-5xl md:text-8xl font-semibold leading-snug md:leading-tight font-[onest] break-words text-foreground'>
                {title2}
              </h2>
            </Reveal>
          </div>

          {/* DESCRIPTION */}
          <Reveal direction='up' delayMs={1000} once={true} priority={true}>
            <p className='text-base md:text-lg text-muted-foreground max-w-md md:max-w-none mx-auto md:mx-0 leading-relaxed'>
              {description}
            </p>
          </Reveal>

          {/* CTA & TIPS */}
          <Reveal
            direction='up'
            delayMs={1320}
            once={true}
            priority={true}
            className='flex flex-col sm:flex-row gap-6 w-full items-center md:items-start mt-4'
          >
            <a
              href={href}
              className='min-w-[140px] inline-flex items-center justify-center rounded-full border border-foreground px-8 py-3
                        text-sm font-medium text-foreground hover:bg-foreground hover:text-background transition-colors'
            >
              {ctaText}
            </a>

            <ul className='flex flex-wrap flex-row gap-2 w-full justify-center md:justify-start items-center'>
              {tips.map((tip, idx) => (
                <Reveal
                  key={`${tip}-${idx}`}
                  direction='up'
                  delayMs={1500 + idx * 300}
                  once={true}
                  priority={true}
                >
                  <li className='bg-card/80 backdrop-blur-sm px-4 py-2 md:px-6 md:py-3 md:rounded-full rounded-xl text-xs md:text-sm shadow-sm border border-border/20 whitespace-nowrap text-foreground/80 font-medium'>
                    {tip}
                  </li>
                </Reveal>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* --- SAĞ GÖRSEL ALANI --- */}
        <div className='order-1 md:order-2 w-full flex justify-center relative overflow-visible py-4 md:py-0'>
          <Reveal
            direction='right'
            delayMs={0}
            once={true}
            priority={true}
            className='w-full flex justify-center'
          >
            <div className='relative w-full max-w-[300px] md:max-w-none aspect-square md:aspect-auto md:h-[min(60vh,40rem)] flex items-center justify-center'>
              {/* DÜZELTME BURADA: Glassmorphism Blob */}
              <div
                className='z-0 absolute w-[280px] h-[280px] md:w-[600px] md:h-[600px] rounded-full origin-center animate-pulse-scale 
                            bg-white/25 backdrop-blur-3xl border border-white/45 shadow-2xl shadow-white/10'
              ></div>

              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                sizes='(max-width: 768px) 100vw, 50vw'
                className='object-contain w-auto drop-shadow-2xl z-10'
                priority={isActive}
                draggable={false}
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
