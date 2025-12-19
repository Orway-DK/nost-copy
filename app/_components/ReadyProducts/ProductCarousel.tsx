// C:\Projeler\nost-copy\app\_components\ReadyProducts\ProductCarousel.tsx
'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import {
  IoIosArrowDroprightCircle,
  IoIosArrowDropleftCircle
} from 'react-icons/io'
import { useLanguage } from '@/components/LanguageProvider'

export type CarouselProduct = {
  id: string
  names: Record<string, string>
  image: string
  price: {
    try: number | null
    usd: number | null
    eur: number | null
  }
  url: string
}

interface ProductCarouselProps {
  title?: string
  showTitle?: boolean
  className?: string
  products: CarouselProduct[]
}

function formatPrice (amount: number | null, currency: string) {
  if (!amount) return '—'
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency
    }).format(amount)
  } catch {
    return `${amount} ${currency}`
  }
}

export default function ProductCarousel ({
  title = '',
  showTitle = true,
  className = '',
  products = []
}: ProductCarouselProps) {
  const [mounted, setMounted] = useState(false)
  const { lang, currency } = useLanguage()

  const currencyCode = (currency || 'USD').toUpperCase()
  const effectiveCurrency = ['TRY', 'USD', 'EUR'].includes(currencyCode)
    ? currencyCode
    : 'USD'

  const prevRef = useRef<HTMLButtonElement | null>(null)
  const nextRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!products || products.length === 0) return null

  if (!mounted) {
    return <div className='h-[400px] w-full bg-transparent'></div>
  }

  return (
    <div className={`w-full h-auto relative ${className}`}>
      <div className='max-w-7xl mx-auto px-0 md:px-1 relative group/carousel'>
        {showTitle && title && (
          <div className='mb-6 px-4 md:px-0 flex items-center justify-between'>
            <h2 className='text-2xl md:text-3xl font-bold tracking-tight text-foreground'>
              {title}
            </h2>
          </div>
        )}

        {/* Navigation Buttons - Dark Mode Uyumlu */}
        <button
          ref={prevRef}
          className='hidden md:block absolute z-20 top-1/2 -translate-y-1/2 -left-4 lg:-left-12 text-primary hover:text-primary-hover transition-all disabled:opacity-0 scale-0 group-hover/carousel:scale-100 duration-300'
          type='button'
          aria-label='Previous Slide'
        >
          <IoIosArrowDropleftCircle className='w-12 h-12 drop-shadow-md bg-card rounded-full' />
        </button>
        <button
          ref={nextRef}
          className='hidden md:block absolute z-20 top-1/2 -translate-y-1/2 -right-4 lg:-right-12 text-primary hover:text-primary-hover transition-all disabled:opacity-0 scale-0 group-hover/carousel:scale-100 duration-300'
          type='button'
          aria-label='Next Slide'
        >
          <IoIosArrowDroprightCircle className='w-12 h-12 drop-shadow-md bg-card rounded-full' />
        </button>

        <Swiper
          modules={[Autoplay, Navigation]}
          slidesPerView={1.3}
          centeredSlides={true}
          spaceBetween={16}
          autoplay={{
            delay: 4000,
            disableOnInteraction: true,
            pauseOnMouseEnter: true
          }}
          navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
          onBeforeInit={swiper => {
            // @ts-ignore
            if (
              swiper.params.navigation &&
              typeof swiper.params.navigation !== 'boolean'
            ) {
              // @ts-ignore
              swiper.params.navigation.prevEl = prevRef.current
              // @ts-ignore
              swiper.params.navigation.nextEl = nextRef.current
            }
          }}
          breakpoints={{
            640: { slidesPerView: 2, centeredSlides: false, spaceBetween: 20 },
            768: { slidesPerView: 3, centeredSlides: false, spaceBetween: 24 },
            1024: { slidesPerView: 4, centeredSlides: false, spaceBetween: 28 },
            1280: { slidesPerView: 4, centeredSlides: false, spaceBetween: 32 }
          }}
          className='product-carousel select-none !pb-10 !px-0 md:!px-1'
        >
          {products.map(p => {
            const displayName =
              p.names[lang] || p.names['en'] || p.names['tr'] || 'Product'
            const priceVal =
              effectiveCurrency === 'TRY'
                ? p.price.try
                : effectiveCurrency === 'EUR'
                ? p.price.eur
                : p.price.usd

            return (
              <SwiperSlide key={p.id} className='h-auto !flex'>
                {/* DÜZELTME: bg-card, border-border, shadow-sm ve hover:bg-card-hover kullanıldı */}
                <div className='group relative w-full flex flex-col bg-card hover:bg-card-hover rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border/50'>
                  {/* Görsel Alanı */}
                  <div className='relative w-full aspect-[4/5] bg-muted/30 overflow-hidden'>
                    <Link href={p.url} className='block w-full h-full relative'>
                      <Image
                        src={p.image}
                        alt={displayName}
                        fill
                        sizes='(max-width: 640px) 75vw, (max-width: 1024px) 33vw, 25vw'
                        className='object-cover transition-transform duration-700 group-hover:scale-110'
                        unoptimized
                      />
                    </Link>
                  </div>

                  {/* İçerik Alanı */}
                  <div className='flex flex-col flex-grow p-4 text-center'>
                    <h3 className='text-sm md:text-base font-semibold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem] flex items-center justify-center mb-2'>
                      <Link href={p.url}>{displayName}</Link>
                    </h3>

                    <div className='mt-auto pt-2 border-t border-border/30 w-full'>
                      <span className='text-base md:text-lg font-bold text-primary block'>
                        {formatPrice(priceVal, effectiveCurrency)}
                      </span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            )
          })}
        </Swiper>
      </div>
    </div>
  )
}
