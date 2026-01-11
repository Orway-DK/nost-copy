// app/_components/FeaturedCategories/index.tsx
'use client'

import React, { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import ServiceCard, { ServiceItem } from './ServiceCard'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useLanguage } from '@/components/LanguageProvider'

import 'swiper/css'
import 'swiper/css/pagination'

// UI Metinlerini Güncelledik
const UI_TEXTS = {
  tr: {
    subtitle: 'ÜRÜN GRUPLARIMIZ',
    titleStart: 'İhtiyacınız Olan',
    titleHighlight: 'Tüm Baskı Çözümleri'
  },
  en: {
    subtitle: 'OUR CATEGORIES',
    titleStart: 'All The Printing',
    titleHighlight: 'Solutions You Need'
  },
  de: {
    subtitle: 'UNSERE KATEGORIEN',
    titleStart: 'Alle Drucklösungen,',
    titleHighlight: 'Die Sie Benötigen'
  }
}

// Resim URL Yardımcısı (Kategorilerde image_path kullanıyorduk)
const getImageUrl = (path: string | null) => {
  if (!path) return '/placeholder-category.jpg' // Placeholder değiştirilmeli
  if (path.startsWith('http') || path.startsWith('/')) return path
  // Kategori resimleri muhtemelen 'categories' bucket'ındadır, yoksa 'services' mı kontrol et
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/categories/${path}`
}

// Fetcher: Artık Kategorileri Çekiyor
const fetchFeaturedCategories = async (
  lang: string
): Promise<ServiceItem[]> => {
  const supabase = createSupabaseBrowserClient()

  // Sadece ana kategorileri (parent_id is null) çekiyoruz
  const { data, error } = await supabase
    .from('categories')
    .select(
      `
        id, slug, image_path, sort,
        category_translations (lang_code, name)
    `
    )
    .eq('active', true)
    .is('parent_id', null) // Sadece ana kategoriler
    .order('sort', { ascending: true })

  if (error) {
    console.error('Categories fetch error:', error)
    return []
  }

  return (data || []).map((item: any, index: number) => {
    // Çeviri mantığı
    const translations = item.category_translations || []
    const tr =
      translations.find((t: any) => t.lang_code === lang) ||
      translations.find((t: any) => t.lang_code === 'tr') || // Varsayılan TR olsun
      translations[0]

    return {
      id: item.id,
      title: tr?.name || item.slug, // Title artık kategori adı
      slug: item.slug, // Linkleme için slug
      image: getImageUrl(item.image_path),
      index: String(index + 1).padStart(2, '0')
    }
  })
}

export default function FeaturedCategories () {
  const { lang } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const ui = UI_TEXTS[lang as keyof typeof UI_TEXTS] || UI_TEXTS.en

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: categories, isLoading } = useSWR(
    mounted ? ['featured-categories-list', lang] : null,
    () => fetchFeaturedCategories(lang),
    { revalidateOnFocus: false }
  )

  if (!mounted)
    return <div className='py-24 w-full bg-background min-h-[500px]'></div>

  return (
    <section className='py-12 md:py-20 w-full max-w-full overflow-x-hidden bg-background'>
      <div className='w-full px-0 md:pl-[10vw] min-w-0'>
        {' '}
        {/* Padding ayarı biraz daha merkeze alındı */}
        {/* Başlık Alanı */}
        <div className='mb-8 md:mb-10 px-4 md:px-0 text-center md:text-left'>
          <div className='text-xs md:text-sm font-bold tracking-[0.2em] text-muted-foreground uppercase mb-3'>
            {ui.subtitle}
          </div>
          <h2 className='text-3xl md:text-4xl font-black text-foreground leading-tight'>
            {ui.titleStart}{' '}
            <span className='text-primary relative inline-block'>
              {ui.titleHighlight}
              {/* Altına dekoratif çizgi eklenebilir */}
              <span className='absolute bottom-1 left-0 w-full h-[30%] bg-primary/10 -z-10'></span>
            </span>
          </h2>
        </div>
        {/* Loading ve Slider Alanı */}
        {isLoading ? (
          <div className='flex gap-4 px-4 md:px-0 overflow-hidden'>
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className='w-[280px] h-[350px] bg-muted/20 animate-pulse rounded-xl flex-shrink-0'
              ></div>
            ))}
          </div>
        ) : !categories || categories.length === 0 ? (
          <div className='px-4 text-muted'>Kategori bulunamadı.</div>
        ) : (
          <Swiper
            modules={[Autoplay, Pagination]}
            slidesPerView={1.2}
            centeredSlides={false} // Mobilde de sola yaslı daha modern durabilir
            loop={categories.length > 4} // Eleman sayısı yeterliyse loop yap
            spaceBetween={16}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }}
            breakpoints={{
              640: { slidesPerView: 2.2, spaceBetween: 20 },
              1024: { slidesPerView: 3.2, spaceBetween: 24 },
              1280: { slidesPerView: 4.2, spaceBetween: 24 },
              1600: { slidesPerView: 5.2, spaceBetween: 30 }
            }}
            className='pb-12 !pl-4 md:!pl-0' // Swiper padding ayarı
          >
            {categories.map(cat => (
              <SwiperSlide key={cat.id} className='h-auto'>
                {/* ServiceCard bileşenini CategoryCard olarak yeniden adlandırabilirsin ama yapısı aynı kalsın */}
                <ServiceCard service={cat} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  )
}
