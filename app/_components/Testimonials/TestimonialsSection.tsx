// C:\Projeler\nost-copy\app\_components\Testimonials\TestimonialsSection.tsx
'use client'

import React, { useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import { useLanguage } from '@/components/LanguageProvider'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import styles from './Testimonials.module.css'

import 'swiper/css'
import 'swiper/css/pagination'

// --- TİP TANIMLARI ---
type Testimonial = {
  id: number
  stars: number
  image_url: string | null
  image_alt: string | null
  author_name: string
  author_job: string
  content: string
}

async function fetchTestimonials (lang: string): Promise<Testimonial[]> {
  const supabase = createSupabaseBrowserClient()

  const { data: rawData, error } = await supabase
    .from('testimonials')
    .select(
      `
      id, stars, image_url, image_alt, author_name, author_job, order_no,
      testimonial_translations (lang_code, content)
    `
    )
    .eq('section_code', 'home_testimonials')
    .eq('active', true)
    .order('order_no', { ascending: true })

  if (error) {
    console.error('Testimonial fetch error:', error)
    return []
  }

  return rawData.map((item: any) => {
    const translations = item.testimonial_translations || []
    const t = translations.find((x: any) => x.lang_code === lang) ||
      translations.find((x: any) => x.lang_code === 'tr') ||
      translations.find((x: any) => x.lang_code === 'en') || { content: '' }

    return {
      id: item.id,
      stars: item.stars,
      image_url: item.image_url,
      image_alt: item.image_alt || item.author_name,
      author_name: item.author_name || 'Müşteri',
      author_job: item.author_job || '',
      content: t.content
    }
  })
}

export default function TestimonialsSection () {
  const { lang_code } = useLanguage()
  const lang = (lang_code || 'tr').slice(0, 2)

  const [items, setItems] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    let active = true
    async function load () {
      setLoading(true)
      const data = await fetchTestimonials(lang)
      if (active) {
        setItems(data)
        setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [lang])

  // Marquee Metni
  const marqueeText = useMemo(() => {
    if (lang === 'tr') return 'YORUMLAR • REFERANSLAR • '
    if (lang === 'de') return 'KUNDENBEWERTUNGEN • REFERENZEN • '
    return 'TESTIMONIALS • REVIEWS • '
  }, [lang])

  const mobileTitle = useMemo(() => {
    if (lang === 'tr') return 'Müşteri Yorumları'
    if (lang === 'de') return 'Kundenbewertungen'
    return 'Customer Reviews'
  }, [lang])

  const mobileSubtitle = useMemo(() => {
    if (lang === 'tr') return 'Sizden Gelenler'
    if (lang === 'de') return 'Was Kunden sagen'
    return 'What Clients Say'
  }, [lang])

  const repeatedText = Array(8).fill(marqueeText)

  if (!mounted) return null

  return (
    <section className='relative w-full py-20 md:py-32 overflow-hidden bg-transparent'>
      {/* --- MASAÜSTÜ: KAYAN BAŞLIK --- */}
      <div
        className={`${styles.marqueeContainer} hidden md:flex mb-16 md:mb-24 pointer-events-none select-none`}
      >
        <div className={styles.marqueeTrack}>
          {repeatedText.map((text, i) => (
            // DÜZELTME: Light mode için text-black/5, Dark mode için text-white/10
            <span
              key={`t1-${i}`}
              className='text-[6rem] lg:text-[8rem] font-black text-black/5 dark:text-white/10 whitespace-nowrap px-4 tracking-tighter transition-colors duration-300'
            >
              {text}
            </span>
          ))}
          {repeatedText.map((text, i) => (
            <span
              key={`t2-${i}`}
              className='text-[6rem] lg:text-[8rem] font-black text-black/5 dark:text-white/10 whitespace-nowrap px-4 tracking-tighter transition-colors duration-300'
            >
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* --- MOBİL: STATİK BAŞLIK --- */}
      <div className='md:hidden text-center mb-12 px-6'>
        <span className='text-primary text-sm font-bold tracking-widest uppercase block mb-2'>
          {mobileSubtitle}
        </span>
        {/* DÜZELTME: Mobilde başlık rengi dinamikleştirildi */}
        <h2 className='text-3xl font-black text-foreground'>{mobileTitle}</h2>
      </div>

      {/* --- SLIDER --- */}
      <div className='container mx-auto px-0 md:px-4 relative z-10'>
        <div className='w-full'>
          {loading ? (
            <div className='flex justify-center text-muted-foreground animate-pulse'>
              Yükleniyor...
            </div>
          ) : items.length === 0 ? (
            <div className='text-center text-muted-foreground'>
              Henüz yorum yok.
            </div>
          ) : (
            <Swiper
              modules={[Autoplay, Pagination]}
              slidesPerView={1.2}
              centeredSlides={true}
              spaceBetween={20}
              loop={items.length > 2}
              speed={800}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
              }}
              pagination={{
                clickable: true,
                dynamicBullets: true
              }}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                  spaceBetween: 30,
                  centeredSlides: true
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 40,
                  centeredSlides: true
                },
                1280: {
                  slidesPerView: 3.5,
                  spaceBetween: 50,
                  centeredSlides: true
                }
              }}
              className='testimonials-swiper !pb-14'
            >
              {items.map(item => (
                <SwiperSlide key={item.id} className='h-auto'>
                  {/* DÜZELTME: KART TASARIMI 
                      Light: bg-white/60, Koyu Kenarlık
                      Dark: bg-[#212529]/40, Açık Kenarlık
                  */}
                  <div
                    className='
                    h-full flex flex-col justify-between
                    bg-white/60 dark:bg-[#212529]/40 
                    backdrop-blur-md 
                    border border-black/5 dark:border-white/5 
                    rounded-2xl p-8 
                    hover:border-primary/30 dark:hover:border-white/20 
                    hover:bg-white/80 dark:hover:bg-[#212529]/60 
                    transition-all duration-300 group
                    shadow-sm dark:shadow-none
                  '
                  >
                    <div>
                      {/* Yıldızlar */}
                      <div className='flex gap-1 text-yellow-500 mb-6 text-sm'>
                        {'★'.repeat(item.stars)}
                      </div>

                      {/* İçerik */}
                      {/* Light: text-gray-600, Dark: text-[#d1d7e6] */}
                      <p className='text-gray-600 dark:text-[#d1d7e6] text-lg leading-relaxed italic mb-8 font-light'>
                        “{item.content}”
                      </p>
                    </div>

                    {/* Yazar Bilgisi */}
                    <div className='flex items-center gap-4 pt-6 border-t border-black/5 dark:border-white/5'>
                      {item.image_url ? (
                        <div className='relative w-12 h-12 rounded-full overflow-hidden border border-black/5 dark:border-white/10 shrink-0'>
                          <Image
                            src={item.image_url}
                            alt={item.image_alt || 'User'}
                            fill
                            className='object-cover'
                          />
                        </div>
                      ) : (
                        <div className='w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg shrink-0'>
                          {item.author_name.charAt(0)}
                        </div>
                      )}

                      <div className='flex flex-col'>
                        {/* Light: text-gray-900, Dark: text-white */}
                        <span className='text-gray-900 dark:text-white font-bold text-base tracking-wide group-hover:text-primary transition-colors'>
                          {item.author_name}
                        </span>
                        {item.author_job && (
                          <span className='text-gray-500 dark:text-white/40 text-xs font-medium uppercase tracking-wider mt-0.5'>
                            {item.author_job}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </div>
    </section>
  )
}
