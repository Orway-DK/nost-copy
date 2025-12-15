// C:\Projeler\nost-copy\app\_components\LandingSlider\_components\SliderItem.tsx
'use client'

import { useEffect } from 'react'
import useSWR from 'swr'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import SliderCard from './SliderCard'
import { useLanguage } from '@/components/LanguageProvider'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useLoading } from '@/components/LoadingContext'

// --- TYPES ---
type RawTranslation = {
  title1: string | null
  title2: string | null
  text: string | null
  button_link: string | null
  tips: string[] | null
  lang_code: string
}

type RawSlide = {
  id: number
  order_no: number
  image_link: string
  landing_slide_translations: RawTranslation[]
}

type Slide = {
  id: number
  title1: string
  title2: string
  description: string
  image_link: string
  button_link: string | null
  tips: string[]
}

const fetchSlides = async (lang: string): Promise<Slide[]> => {
  const supabase = createSupabaseBrowserClient()

  const { data, error } = await supabase
    .from('landing_slides')
    .select(
      'id, order_no, image_link, landing_slide_translations(title1,title2,text,button_link,tips,lang_code)'
    )
    .eq('active', true)
    .eq('landing_slide_translations.lang_code', lang)
    .order('order_no', { ascending: true })

  if (error) throw new Error(error.message)

  const rows: RawSlide[] = (data ?? []) as RawSlide[]

  return rows.map(row => {
    const tr = row.landing_slide_translations.find(t => t.lang_code === lang)
    return {
      id: row.id,
      title1: tr?.title1 ?? '',
      title2: tr?.title2 ?? '',
      description: tr?.text ?? '',
      image_link: row.image_link,
      button_link: tr?.button_link ?? null,
      tips: tr?.tips ?? []
    }
  })
}

export default function SliderItem () {
  const { lang } = useLanguage()

  // Loading Logic
  const { register, unregister } = useLoading()
  const COMPONENT_ID = 'SliderItem'

  const {
    data: slides,
    error,
    isLoading
  } = useSWR<Slide[]>(['landing-slides', lang], () => fetchSlides(lang), {
    revalidateOnFocus: false,
    suspense: true // Suspense modunda olduğu için isLoading kontrolüne gerek yok
  })

  // --- LOADING REGISTRATION ---
  // Suspense modu kullansak da, component mount olduğunda sisteme kayıt olması iyidir.
  useEffect(() => {
    register(COMPONENT_ID)
    // Veri geldiğinde (Suspense geçtiğinde)
    unregister(COMPONENT_ID)
    return () => unregister(COMPONENT_ID)
  }, [register, unregister])

  if (!slides?.length) {
    // Veri yoksa null dön (LoadingOverlay zaten gösteriliyor olacak)
    return null
  }

  const ctaDefault =
    lang === 'tr' ? 'Devamı' : lang === 'de' ? 'Mehr' : 'Learn more'

  return (
    <section className='w-full max-w-full h-full pb-0 md:pb-10 overflow-hidden'>
      <Swiper
        modules={[Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        loop
        autoplay={{ delay: 8000, disableOnInteraction: false }}
        breakpoints={{
          768: { spaceBetween: 30 },
          1024: { spaceBetween: 40 }
        }}
        className='pb-12 w-full'
      >
        {slides.map((s, i) => (
          <SwiperSlide key={`slide-${s.id}-${i}`} className='!w-full'>
            {({ isActive }) => (
              <div className='py-4 md:py-8 w-full'>
                {/* SİHİRLİ DOKUNUŞ: key={isActive ? 'active' : 'inactive'}
                  Bu sayede slide aktif olduğunda component 'remount' olur (yeniden doğar).
                  Yeniden doğduğu için animasyonlar baştan başlar.
                */}
                <SliderCard
                  key={isActive ? 'active' : 'inactive'}
                  isActive={isActive}
                  title={s.title1}
                  title2={s.title2}
                  description={s.description}
                  ctaText={ctaDefault}
                  imageSrc={s.image_link}
                  imageAlt={`${s.title1} ${s.title2}`}
                  href={s.button_link ?? '#'}
                  tips={s.tips}
                />
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}
