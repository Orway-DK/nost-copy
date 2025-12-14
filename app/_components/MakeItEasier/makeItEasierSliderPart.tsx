// C:\Projeler\nost-copy\app\_components\MakeItEasier\makeItEasierSliderPart.tsx
'use client'

import Image from 'next/image'
import useSWR from 'swr'
import { useLanguage } from '@/components/LanguageProvider'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'

type RawImageLink =
  | string
  | { url?: string; src?: string; image?: string }
  | null

type TranslationRow = {
  lang_code: string
  title: string | null
  text: string | null
  button_name: string | null
  button_link: string | null
}

type ApiSection = {
  id: number
  order_no: number | null
  active: boolean
  image_links: RawImageLink[] | null
  make_it_easier_slider_translations: TranslationRow[]
}

type UiData = {
  title: string | null
  text: string | null
  image_links: string[]
  button_name: string | null
  button_link: string | null
}

const normalizeEntry = (entry: RawImageLink): string | null => {
  if (!entry) return null
  if (typeof entry === 'string') return entry.trim()
  if (typeof entry === 'object') {
    return entry.url?.trim() || entry.src?.trim() || entry.image?.trim() || null
  }
  return null
}

const fetcher = async (lang: string): Promise<UiData[]> => {
  const supabase = createSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('make_it_easier_slider_sections')
    .select(
      'id, order_no, active, image_links, make_it_easier_slider_translations(lang_code, title, text, button_name, button_link)'
    )
    .eq('active', true)
    .order('order_no', { ascending: true })

  if (error) throw new Error(error.message)

  const rows = (data ?? []) as ApiSection[]

  const localized = rows
    .map(row => {
      const tr = row.make_it_easier_slider_translations.find(
        t => t.lang_code === lang
      )
      const images = (row.image_links ?? [])
        .map(normalizeEntry)
        .filter((x): x is string => !!x)
      return {
        title: tr?.title ?? null,
        text: tr?.text ?? null,
        image_links: images,
        button_name: tr?.button_name ?? null,
        button_link: tr?.button_link ?? null
      } as UiData
    })
    .filter(s => s.image_links.length > 0)

  if (!localized.length) {
    const { data: enData } = await supabase
      .from('make_it_easier_slider_sections')
      .select(
        'id, order_no, active, image_links, make_it_easier_slider_translations(lang_code, title, text, button_name, button_link)'
      )
      .eq('active', true)
      .order('order_no', { ascending: true })
    const enRows = (enData ?? []) as ApiSection[]
    return enRows
      .map(row => {
        const tr = row.make_it_easier_slider_translations.find(
          t => t.lang_code === 'en'
        )
        const images = (row.image_links ?? [])
          .map(normalizeEntry)
          .filter((x): x is string => !!x)
        return {
          title: tr?.title ?? null,
          text: tr?.text ?? null,
          image_links: images,
          button_name: tr?.button_name ?? null,
          button_link: tr?.button_link ?? null
        } as UiData
      })
      .filter(s => s.image_links.length > 0)
  }
  return localized
}

const MAX_ATTEMPTS = 3
const MIN_LOOP_LENGTH = 6
const FALLBACK_DATA_URI =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="%232b3035"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239aa7bd" font-size="24" font-family="Arial">Görsel yüklenemedi</text></svg>'

export default function MakeItEasierSliderPart () {
  const { lang } = useLanguage()
  const {
    data: sections,
    error,
    isLoading
  } = useSWR(['make-it-easier-slider', lang], () => fetcher(lang), {
    revalidateOnFocus: false
  })

  const [imageAttempts, setImageAttempts] = useState<Record<string, number>>({})
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  const sliderRef = useRef<HTMLDivElement | null>(null)
  const [sliderHeight, setSliderHeight] = useState<number>(0)
  const [isDesktop, setIsDesktop] = useState(false)

  const allImages: string[] = useMemo(() => {
    if (!sections?.length) return []
    return sections.flatMap(s => s.image_links)
  }, [sections])

  const duplicatedImages = useMemo(() => {
    if (allImages.length === 0) return []
    if (allImages.length >= MIN_LOOP_LENGTH) return allImages
    let buff = [...allImages]
    while (buff.length < MIN_LOOP_LENGTH) {
      buff = buff.concat(allImages)
    }
    return buff
  }, [allImages])

  const header = sections?.[0]

  const handleImageError = useCallback((url: string) => {
    setImageAttempts(prev => {
      const current = prev[url] ?? 0
      const next = current + 1
      if (next >= MAX_ATTEMPTS) {
        setFailedImages(prevSet => {
          if (!prevSet.has(url)) {
            const clone = new Set(prevSet)
            clone.add(url)
            return clone
          }
          return prevSet
        })
      }
      return { ...prev, [url]: next }
    })
  }, [])

  useEffect(() => {
    if (!sliderRef.current) return
    const el = sliderRef.current
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    const applyHeight = () => {
      const h = el.offsetHeight
      if (h && h !== sliderHeight) {
        setSliderHeight(h)
      }
    }
    checkDesktop()
    applyHeight()
    const resizeObserver = new ResizeObserver(() => applyHeight())
    resizeObserver.observe(el)
    window.addEventListener('resize', () => {
      checkDesktop()
      applyHeight()
    })
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', applyHeight)
    }
  }, [sliderHeight])

  if (isLoading)
    return <div className='py-8 text-center text-[#47597b]'>Yükleniyor…</div>
  if (error)
    return (
      <div className='py-8 text-center text-red-500'>
        Bir hata oluştu: {error.message}
      </div>
    )
  if (!sections?.length)
    return <div className='py-8 text-center'>İçerik bulunamadı.</div>

  return (
    <div className='w-full bg-[#212529] py-12 lg:py-16'>
      <div className='max-w-7xl mx-auto px-6'>
        <div className='flex flex-col lg:flex-row gap-8 lg:gap-16 items-center lg:items-center'>
          {/* SOL: Slider */}
          {/* min-w-0 ekledik ki flex içinde swiper ezilmesin */}
          <div ref={sliderRef} className='w-full lg:w-1/2 px-0 min-w-0'>
            {duplicatedImages.length === 0 ? (
              <div className='text-sm text-[#d1d7e6] px-4'>
                Gösterilecek görsel bulunamadı.
              </div>
            ) : (
              <Swiper
                modules={[Autoplay]}
                // --- MOBİL AYARI ---
                // 1.6 kart göster. Kart genişliği ~%62 olur.
                // Ortalı olduğu için sağdan ve soldan %19'ar boşluk kalır.
                slidesPerView={1.6}
                centeredSlides={true}
                spaceBetween={16}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: true,
                  pauseOnMouseEnter: true
                }}
                loop={duplicatedImages.length > 1}
                speed={500}
                breakpoints={{
                  1024: {
                    slidesPerView: 2,
                    centeredSlides: false,
                    spaceBetween: 24
                  },
                  1280: {
                    slidesPerView: 2.5,
                    centeredSlides: false,
                    spaceBetween: 32
                  }
                }}
                className='select-none w-full'
              >
                {duplicatedImages.map((url, idx) => {
                  const attempts = imageAttempts[url] ?? 0
                  const exceeded = attempts >= MAX_ATTEMPTS
                  return (
                    // DÜZELTME: Genişlik sınıfları silindi.
                    <SwiperSlide key={`${url}-${idx}`}>
                      <div className='relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-[#2b3035] shadow-lg'>
                        {!exceeded ? (
                          <Image
                            src={url}
                            alt={`image_${idx + 1}`}
                            fill
                            className='object-cover image'
                            sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
                            loading='lazy'
                            onError={() => handleImageError(url)}
                          />
                        ) : (
                          <Image
                            src={FALLBACK_DATA_URI}
                            alt='fallback'
                            fill
                            className='object-contain'
                          />
                        )}
                      </div>
                    </SwiperSlide>
                  )
                })}
              </Swiper>
            )}
          </div>

          {/* SAĞ: Metin */}
          <div
            className='w-full lg:w-1/2 flex flex-col justify-center text-center lg:text-left'
            style={
              isDesktop && sliderHeight ? { height: sliderHeight } : undefined
            }
          >
            {header?.title && (
              <h2 className='text-3xl md:text-4xl xl:text-5xl font-semibold text-[#ecf2ff] leading-tight'>
                {header.title}
              </h2>
            )}
            {header?.text && (
              <p className='mt-6 text-[#d1d7e6] text-base md:text-lg leading-relaxed'>
                {header.text}
              </p>
            )}
            {(header?.button_name || header?.button_link) && (
              <div className='mt-8'>
                <a
                  href={header?.button_link || ''}
                  className='inline-flex items-center gap-2 bg-[#47597b] hover:bg-[#5b6e94] text-white text-sm font-medium px-8 py-3 rounded-full transition-colors'
                >
                  {header?.button_name && <span>{header.button_name}</span>}
                  <svg
                    width='16'
                    height='16'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='opacity-80'
                  >
                    <line x1='5' y1='12' x2='19' y2='12' />
                    <polyline points='12 5 19 12 12 19' />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
