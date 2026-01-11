// C:\Projeler\nost-copy\app\_components\ReadyProducts\ProductCarousel.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
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
  products = []
}: ProductCarouselProps) {
  const [mounted, setMounted] = useState(false)
  const { lang, currency } = useLanguage()

  // Navigation State
  const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null)
  const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null)

  const currencyCode = (currency || 'USD').toUpperCase()
  const effectiveCurrency = ['TRY', 'USD', 'EUR'].includes(currencyCode)
    ? currencyCode
    : 'USD'

  // --- INFINITE LOOP MANTIĞI ---
  // Eğer ürün sayısı azsa, Swiper loop yapamaz.
  // Bu yüzden listeyi yapay olarak çoğaltıyoruz (Minimum 12 item olana kadar).
  const loopedProducts = useMemo(() => {
    if (products.length === 0) return []

    let items = [...products]
    // Ürün sayısı 12'den az olduğu sürece listeyi kendine ekle (Clone)
    while (items.length < 12) {
      items = [...items, ...products]
    }
    return items
  }, [products])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!products || products.length === 0) return null
  if (!mounted) return <div className='h-[400px] w-full bg-transparent'></div>

  return (
    <div className='w-full h-auto relative group/carousel px-4 md:px-0'>
      {/* Sol Ok */}
      <button
        ref={node => setPrevEl(node)}
        className='hidden md:block absolute z-20 top-1/2 -translate-y-1/2 left-0 lg:-left-12 text-foreground/50 hover:text-primary transition-all scale-0 group-hover/carousel:scale-100 duration-300 cursor-pointer'
        type='button'
        aria-label='Previous Slide'
      >
        <IoIosArrowDropleftCircle className='w-10 h-10 drop-shadow-md bg-background rounded-full' />
      </button>

      {/* Sağ Ok */}
      <button
        ref={node => setNextEl(node)}
        className='hidden md:block absolute z-20 top-1/2 -translate-y-1/2 right-0 lg:-right-12 text-foreground/50 hover:text-primary transition-all scale-0 group-hover/carousel:scale-100 duration-300 cursor-pointer'
        type='button'
        aria-label='Next Slide'
      >
        <IoIosArrowDroprightCircle className='w-10 h-10 drop-shadow-md bg-background rounded-full' />
      </button>

      <Swiper
        modules={[Autoplay, Navigation]}
        navigation={{
          prevEl,
          nextEl
        }}
        // Loop ARTIK HEP AÇIK (Çünkü ürünleri çoğalttık, bozulmaz)
        loop={true}
        slidesPerView={1.3}
        spaceBetween={16}
        centeredSlides={false}
        // Loop modunda key sorunu yaşamamak için bu ayar önemlidir
        loopedSlides={loopedProducts.length}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        }}
        breakpoints={{
          640: { slidesPerView: 2.2, spaceBetween: 20 },
          768: { slidesPerView: 3.2, spaceBetween: 24 },
          1024: { slidesPerView: 4.2, spaceBetween: 28 },
          1280: { slidesPerView: 4.5, spaceBetween: 32 }
        }}
        className='product-carousel select-none !pb-12'
      >
        {loopedProducts.map((p, index) => {
          const displayName =
            p.names[lang] || p.names['en'] || p.names['tr'] || 'Product'
          const priceVal =
            effectiveCurrency === 'TRY'
              ? p.price.try
              : effectiveCurrency === 'EUR'
              ? p.price.eur
              : p.price.usd

          // KEY ÖNEMLİ: Aynı ID'li ürünler olacağı için index'i key'e ekliyoruz.
          return (
            <SwiperSlide key={`${p.id}-${index}`} className='h-auto !flex'>
              <div className='group relative w-full flex flex-col bg-transparent rounded-xl overflow-hidden'>
                {/* Görsel Alanı */}
                <div className='relative w-full aspect-[3/4] rounded-xl overflow-hidden mb-4 bg-muted/10 border border-border/50'>
                  <Link href={p.url} className='block w-full h-full relative'>
                    <Image
                      src={p.image}
                      alt={displayName}
                      fill
                      sizes='(max-width: 640px) 75vw, (max-width: 1024px) 33vw, 25vw'
                      className='object-cover transition-transform duration-700 group-hover:scale-110'
                      unoptimized
                    />
                    <div className='absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300' />
                  </Link>

                  {/* Fiyat Etiketi */}
                  <div className='absolute top-3 left-3 bg-background/95 backdrop-blur-md text-foreground px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm z-10 border border-border/50'>
                    {formatPrice(priceVal, effectiveCurrency)}
                  </div>
                </div>

                {/* İçerik Alanı */}
                <div className='flex flex-col items-start px-1'>
                  <h3 className='text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1'>
                    <Link href={p.url}>{displayName}</Link>
                  </h3>

                  <div className='w-full h-px bg-border/60 my-2.5 relative overflow-hidden'>
                    <div className='absolute top-0 left-0 h-full w-full bg-primary -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out' />
                  </div>

                  <Link
                    href={p.url}
                    className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest group-hover:text-primary transition-colors flex items-center gap-1.5'
                  >
                    Ürünü İncele{' '}
                    <span className='text-base leading-none -mt-0.5 transition-transform group-hover:translate-x-1'>
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          )
        })}
      </Swiper>
    </div>
  )
}
