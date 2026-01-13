// C:\Projeler\nost-copy\app\_components\ServicesSlider\index.tsx
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

// UI Metinleri (Başlıklar için)
const UI_TEXTS = {
  tr: {
    subtitle: 'EN İYİ HİZMETLERİMİZ',
    titleStart: 'Birinci Sınıf Özel',
    titleHighlight: 'Baskı Çözümleri'
  },
  en: {
    subtitle: 'OUR BEST SERVICES',
    titleStart: 'Premier One-Stop Custom',
    titleHighlight: 'Print Solutions'
  },
  de: {
    subtitle: 'UNSERE BESTEN DIENSTLEISTUNGEN',
    titleStart: 'Erstklassige Maßgeschneiderte',
    titleHighlight: 'Drucklösungen'
  }
}

// Resim URL Yardımcısı
const getImageUrl = (path: string | null) => {
  if (!path) return '/placeholder-service.jpg'
  if (path.startsWith('http') || path.startsWith('/')) return path
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/services/${path}`
}

// Fetcher
const fetchServices = async (lang: string): Promise<ServiceItem[]> => {
  const supabase = createSupabaseBrowserClient()

  // Servisleri ve seçili dildeki çevirilerini çek
  const { data, error } = await supabase
    .from('services')
    .select(
      `
            id, slug, image_url, created_at,
            service_translations (lang_code, title)
        `
    )
    .eq('active', true)
    .order('id', { ascending: true }) // ID'ye göre veya özel bir sort_order alanına göre sırala

  if (error) {
    console.error('Services fetch error:', error)
    return []
  }

  return (data || []).map((item: any, index: number) => {
    // Çeviriyi bul (Seçili dil -> İngilizce -> İlk bulduğu)
    const translations = item.service_translations || []
    const tr =
      translations.find((t: any) => t.lang_code === lang) ||
      translations.find((t: any) => t.lang_code === 'en') ||
      translations[0]

    return {
      id: item.id,
      title: tr?.title || 'Service', // Çeviri yoksa varsayılan
      slug: item.slug,
      image: getImageUrl(item.image_url),
      index: String(index + 1).padStart(2, '0') // 01, 02, 03...
    }
  })
}

export default function ServicesSlider () {
  const { lang } = useLanguage()
  const [mounted, setMounted] = useState(false)

  // UI Metinlerini seç
  const ui = UI_TEXTS[lang as keyof typeof UI_TEXTS] || UI_TEXTS.en

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: services, isLoading } = useSWR(
    mounted ? ['services-list', lang] : null,
    () => fetchServices(lang),
    { revalidateOnFocus: false }
  )

  if (!mounted)
    return <div className='py-24 w-full min-h-[500px]'></div>

  return (
    <section className='py-12 md:py-24 w-full max-w-full overflow-x-hidden'>
      <div className='w-full px-0 md:pl-[16vw] min-w-0'>
        {/* Başlık Alanı */}
        <div className='mb-8 md:mb-12 px-4 md:px-0 text-center md:text-left'>
          <div className='text-sm font-bold tracking-widest text-foreground/80 uppercase mb-2'>
            {ui.subtitle}
          </div>
          <h2 className='text-3xl md:text-5xl font-bold text-foreground leading-tight'>
            {ui.titleStart}{' '}
            <span className='text-primary'>{ui.titleHighlight}</span>
          </h2>
        </div>

        {/* Loading Durumu */}
        {isLoading ? (
          <div className='flex gap-4 px-4 md:px-0 overflow-hidden'>
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className='w-[300px] h-[300px] bg-muted/10 animate-pulse rounded-xl flex-shrink-0'
              ></div>
            ))}
          </div>
        ) : !services || services.length === 0 ? (
          <div className='px-4 text-muted'>Hizmet bulunamadı.</div>
        ) : (
          <Swiper
            modules={[Autoplay, Pagination]}
            // Mobil Ayarları: 1.3 slide (Ortalı ve yanlardan taşmalı)
            slidesPerView={1.3}
            centeredSlides={true}
            loop={services.length > 2} // Eleman azsa loop sorun çıkarabilir
            spaceBetween={16}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }}
            breakpoints={{
              // Tablet
              640: {
                slidesPerView: 2,
                centeredSlides: false,
                spaceBetween: 20
              },
              // Masaüstü
              1024: {
                slidesPerView: 3,
                centeredSlides: false,
                spaceBetween: 24
              },
              // Geniş Ekran
              1280: {
                slidesPerView: 3.5,
                centeredSlides: false,
                spaceBetween: 24
              },
              // Ultra Geniş
              1600: {
                slidesPerView: 4.5,
                centeredSlides: false,
                spaceBetween: 30
              }
            }}
            className='pb-12 md:pb-16 w-full service-slider'
          >
            {services.map(service => (
              <SwiperSlide key={service.id} className='h-auto'>
                <ServiceCard service={service} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  )
}
