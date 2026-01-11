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
  url: string
}

interface ProductCarouselProps {
  products: CarouselProduct[]
}

export default function ProductCarousel ({
  products = []
}: ProductCarouselProps) {
  const [mounted, setMounted] = useState(false)
  const { lang } = useLanguage()

  // Navigation State
  const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null)
  const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null)

  // --- INFINITE LOOP DUPLICATION ---
  const loopedProducts = useMemo(() => {
    if (products.length === 0) return []
    let items = [...products]
    while (items.length < 12) {
      items = [...items, ...products]
    }
    return items
  }, [products])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!products || products.length === 0) return null
  if (!mounted) return <div className='h-[300px] w-full bg-transparent'></div>

  return (
    <div className='w-full h-auto relative group/carousel px-4 md:px-0'>
      {/* Navigation Buttons (Konumları korundu) */}
      <button
        ref={node => setPrevEl(node)}
        className='hidden md:block absolute z-20 top-1/2 -translate-y-1/2 left-0 lg:-left-12 text-foreground/50 hover:text-primary transition-all scale-0 group-hover/carousel:scale-100 duration-300 cursor-pointer'
        type='button'
        aria-label='Previous Slide'
      >
        <IoIosArrowDropleftCircle className='w-12 h-12 drop-shadow-xl bg-background rounded-full' />
      </button>

      <button
        ref={node => setNextEl(node)}
        className='hidden md:block absolute z-20 top-1/2 -translate-y-1/2 right-0 lg:-right-12 text-foreground/50 hover:text-primary transition-all scale-0 group-hover/carousel:scale-100 duration-300 cursor-pointer'
        type='button'
        aria-label='Next Slide'
      >
        <IoIosArrowDroprightCircle className='w-12 h-12 drop-shadow-xl bg-background rounded-full' />
      </button>

      <Swiper
        modules={[Autoplay, Navigation]}
        navigation={{ prevEl, nextEl }}
        // Loop açık
        loop={true}
        // HATA VEREN SATIRI SİLİYORUZ:
        // loopedSlides={loopedProducts.length}

        // Başlangıç (Mobil)
        slidesPerView={1.3}
        spaceBetween={16}
        centeredSlides={false}
        autoplay={{
          delay: 4500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        }}
        // BREAKPOINTS: FeaturedCategories ile aynı
        breakpoints={{
          640: { slidesPerView: 2.2, spaceBetween: 20 },
          1024: { slidesPerView: 3.2, spaceBetween: 24 },
          1280: { slidesPerView: 4.2, spaceBetween: 24 },
          1600: { slidesPerView: 5.2, spaceBetween: 30 }
        }}
        className='product-carousel select-none !pb-12'
      >
        {loopedProducts.map((p, index) => {
          const displayName =
            p.names[lang] || p.names['en'] || p.names['tr'] || 'Product'

          return (
            <SwiperSlide key={`${p.id}-${index}`} className='h-auto !flex'>
              {/* YENİ KART TASARIMI: ServiceCard ile benzer yapıda */}
              <Link
                href={p.url}
                className='group relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-muted shadow-sm hover:shadow-xl transition-all duration-500'
              >
                {/* 1. Görsel */}
                <Image
                  src={p.image}
                  alt={displayName}
                  fill
                  sizes='(max-width: 640px) 75vw, (max-width: 1024px) 33vw, 25vw'
                  className='object-cover transition-transform duration-700 group-hover:scale-110'
                  unoptimized
                />

                {/* 2. Gradient Overlay (Yazının okunması için) */}
                <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300' />

                {/* 3. İçerik Alanı (En altta) */}
                <div className='absolute bottom-0 left-0 w-full p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300'>
                  {/* Ürün İsmi */}
                  <h3 className='text-xl font-bold text-white group-hover:text-primary-light transition-colors leading-tight mb-2 line-clamp-2'>
                    {displayName}
                  </h3>

                  {/* Alt Çizgi Animasyonu */}
                  <div className='w-10 h-1 bg-primary scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 mb-2' />

                  {/* İncele Linki (Opsiyonel, şık durur) */}
                  <span className='text-xs font-bold text-white/80 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100'>
                    Ürünü İncele →
                  </span>
                </div>

                {/* Sağ Üst Köşe İkonu (Opsiyonel - Vitrin Havası Katar) */}
                <div className='absolute top-4 right-4 bg-white/10 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={2}
                    stroke='currentColor'
                    className='w-4 h-4 text-white'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25'
                    />
                  </svg>
                </div>
              </Link>
            </SwiperSlide>
          )
        })}
      </Swiper>
    </div>
  )
}
