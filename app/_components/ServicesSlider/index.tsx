// C:\Projeler\nost-copy\app\_components\ServicesSlider\index.tsx
'use client'

import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import ServiceCard, { ServiceItem } from './ServiceCard'

import 'swiper/css'
import 'swiper/css/pagination'

const SERVICES: ServiceItem[] = [
  {
    id: 1,
    title: 'POD For Online Stores',
    slug: 'pod-for-online-stores',
    image: '/services/h1-service1.jpg',
    index: '01'
  },
  {
    id: 2,
    title: 'Digital Scanning',
    slug: 'digital-scanning',
    image: '/services/h1-service2.jpg',
    index: '02'
  },
  {
    id: 3,
    title: 'Stickers And Labels',
    slug: 'stickers-and-labels',
    image: '/services/h1-service3.jpg',
    index: '03'
  },
  {
    id: 4,
    title: 'Printing Service',
    slug: 'printing-service',
    image: '/services/h1-service4.jpg',
    index: '04'
  },
  {
    id: 5,
    title: 'Brand Strategy',
    slug: 'brand-strategy',
    image: '/services/h1-service1.jpg',
    index: '05'
  }
]

export default function ServicesSlider () {
  return (
    <section className='py-12 md:py-24 w-full max-w-full overflow-x-hidden'>
      {/* min-w-0: Flex container içinde taşmayı önler */}
      <div className='w-full px-0 md:pl-[16vw] min-w-0'>
        <div className='mb-8 md:mb-12 px-4 md:px-0 text-center md:text-left'>
          <div className='text-sm font-bold tracking-widest text-muted uppercase mb-2'>
            OUR BEST SERVICES
          </div>
          <h2 className='text-3xl md:text-5xl font-bold text-foreground leading-tight'>
            Premier One-Stop Custom{' '}
            <span className='text-primary'>Print Solutions</span>
          </h2>
        </div>

        <Swiper
          modules={[Autoplay, Pagination]}
          // --- MOBİL AYARI ---
          // 'auto' YERİNE '1.3' KULLANDIK.
          // Matematiksel olarak: 1 kart tam sığar + 0.3 kart yanlardan görünür.
          // Bu, kartın genişliğini otomatik olarak ekranın ~%75'ine ayarlar.
          slidesPerView={1.3}
          centeredSlides={true} // Artık kesinlikle ortalar
          loop={true}
          spaceBetween={16}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
          }}
          pagination={{ clickable: true, dynamicBullets: true }}
          breakpoints={{
            // 640px üstü (Tablet)
            640: {
              slidesPerView: 2,
              centeredSlides: false,
              spaceBetween: 20
            },
            // 1024px üstü (Masaüstü)
            1024: {
              slidesPerView: 3,
              centeredSlides: false,
              spaceBetween: 24
            },
            // 1280px üstü
            1280: {
              slidesPerView: 3.5,
              centeredSlides: false,
              spaceBetween: 24
            },
            // 1600px üstü
            1600: {
              slidesPerView: 3.5,
              centeredSlides: false,
              spaceBetween: 30
            }
          }}
          className='pb-12 md:pb-16 w-full service-slider'
        >
          {SERVICES.map(service => (
            <SwiperSlide
              key={service.id}
              // DÜZELTME: 'w-[75%]' ve diğer genişlik sınıfları SİLİNDİ.
              // Genişliği artık tamamen 'slidesPerView' yönetiyor.
              // Böylece CSS çakışması olmuyor ve ortalama bozulmuyor.
              className='h-auto'
            >
              <ServiceCard service={service} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}
