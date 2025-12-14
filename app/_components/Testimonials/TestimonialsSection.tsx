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

  // Marquee Metni (Masaüstü için)
  const marqueeText = useMemo(() => {
    if (lang === 'tr') return 'YORUMLAR • REFERANSLAR •'
    if (lang === 'de') return 'KUNDENBEWERTUNGEN • REFERENZEN •'
    return 'TESTIMONIALS • REVIEWS •'
  }, [lang])

  // Mobil Başlık Metinleri
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

  const repeatedText = Array(10).fill(marqueeText)

  if (!mounted) return null

  return (
    <section className={styles.sectionWrapper}>
      {/* --- MASAÜSTÜ: KAYAN BAŞLIK --- */}
      {/* CSS'te mobilde display: none yapıldı */}
      <div className={styles.marqueeContainer}>
        <div className={styles.marqueeTrack}>
          {repeatedText.map((text, i) => (
            <span key={`t1-${i}`} className={styles.marqueeText}>
              {text}
            </span>
          ))}
          {repeatedText.map((text, i) => (
            <span key={`t2-${i}`} className={styles.marqueeText}>
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* --- MOBİL: STATİK BAŞLIK --- */}
      {/* CSS'te masaüstünde display: none yapıldı */}
      <div className={styles.mobileHeader}>
        <span className={styles.mobileSubtitle}>{mobileSubtitle}</span>
        <h2 className={styles.mobileTitle}>{mobileTitle}</h2>
      </div>

      {/* --- SLIDER --- */}
      <div className='container mx-auto px-0 md:px-4 relative z-10'>
        <div className={styles.sliderContainer}>
          {loading ? (
            <div className={styles.loadingState}>...</div>
          ) : items.length === 0 ? (
            <div className={styles.loadingState}>...</div>
          ) : (
            <Swiper
              modules={[Autoplay, Pagination]}
              // MOBİL VARSAYILAN:
              // 1.2 kart göster (Ortala + yanlardan kesik göster)
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
              breakpoints={{
                // Tablet
                640: {
                  slidesPerView: 2,
                  spaceBetween: 30,
                  centeredSlides: true
                },
                // Masaüstü
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 40,
                  centeredSlides: true
                },
                // Geniş Ekran
                1280: {
                  slidesPerView: 3.8, // Kenarlardan taşma efekti için küsuratlı
                  spaceBetween: 50,
                  centeredSlides: true
                }
              }}
            >
              {items.map(item => (
                <SwiperSlide key={item.id} className='h-auto py-10'>
                  <div className={styles.card}>
                    {/* Yıldızlar */}
                    <div className={styles.stars}>{'★'.repeat(item.stars)}</div>

                    {/* İçerik */}
                    <p className={styles.content}>“{item.content}”</p>

                    {/* Yazar Bilgisi */}
                    <div className={styles.author}>
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.image_alt || 'User'}
                          width={56}
                          height={56}
                          className={styles.avatar}
                        />
                      ) : (
                        <div className={styles.avatarPlaceholder}>
                          {item.author_name.charAt(0)}
                        </div>
                      )}
                      <div className={styles.authorInfo}>
                        <span className={styles.authorName}>
                          {item.author_name}
                        </span>
                        {item.author_job && (
                          <span className={styles.authorJob}>
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
