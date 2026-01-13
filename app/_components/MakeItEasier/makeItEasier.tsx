// app\_components\MakeItEasier\makeItEasier.tsx
'use client'

import Image from 'next/image'
import useSWR from 'swr'
import { useLanguage } from '@/components/LanguageProvider'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { motion, useReducedMotion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { useState, useCallback } from 'react'
import { Icon } from '@iconify/react'
import MakeItEasierSliderPart from './makeItEasierSliderPart'

const MotionImage = motion.create(Image)

// --- TYPE VE FETCHER (Değişmedi, yer kaplamaması için kısaltıyorum) ---
type Tip = { icon?: string; title: string; text: string }
type ApiRow = {
  id: number
  image_link: string
  order_no: number
  make_it_easier_translations: {
    lang_code: string
    title: string
    titletext: string
    tip1_icon: string | null
    tip1_title: string | null
    tip1_text: string | null
    tip2_icon: string | null
    tip2_title: string | null
    tip2_text: string | null
    tip3_icon: string | null
    tip3_title: string | null
    tip3_text: string | null
  }[]
}

const fetcher = async (lang: string) => {
  const supabase = createSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('make_it_easier_sections')
    .select(
      'id, image_link, order_no, make_it_easier_translations(lang_code,title,titletext,tip1_icon,tip1_title,tip1_text,tip2_icon,tip2_title,tip2_text,tip3_icon,tip3_title,tip3_text)'
    )
    .eq('active', true)
    .eq('make_it_easier_translations.lang_code', lang)
    .order('order_no', { ascending: true })

  if (error) throw new Error(error.message)

  const row = (data ?? [])[0] as ApiRow | undefined
  if (!row) {
    const { data: enData } = await supabase
      .from('make_it_easier_sections')
      .select(
        'id, image_link, order_no, make_it_easier_translations(lang_code,title,titletext,tip1_icon,tip1_title,tip1_text,tip2_icon,tip2_title,tip2_text,tip3_icon,tip3_title,tip3_text)'
      )
      .eq('active', true)
      .eq('make_it_easier_translations.lang_code', 'en')
      .order('order_no', { ascending: true })
    const enRow = (enData ?? [])[0] as ApiRow | undefined
    if (!enRow) throw new Error('No MakeItEasier content found')
    const tr = enRow.make_it_easier_translations.find(
      t => t.lang_code === 'en'
    )!
    const tips: Tip[] = [
      {
        icon: tr.tip1_icon || undefined,
        title: tr.tip1_title || '',
        text: tr.tip1_text || ''
      },
      {
        icon: tr.tip2_icon || undefined,
        title: tr.tip2_title || '',
        text: tr.tip2_text || ''
      },
      {
        icon: tr.tip3_icon || undefined,
        title: tr.tip3_title || '',
        text: tr.tip3_text || ''
      }
    ]
    return {
      title: tr.title,
      titletext: tr.titletext,
      image_link: enRow.image_link,
      tips
    }
  }

  const tr = row.make_it_easier_translations.find(t => t.lang_code === lang)!
  const tips: Tip[] = [
    {
      icon: tr.tip1_icon || undefined,
      title: tr.tip1_title || '',
      text: tr.tip1_text || ''
    },
    {
      icon: tr.tip2_icon || undefined,
      title: tr.tip2_title || '',
      text: tr.tip2_text || ''
    },
    {
      icon: tr.tip3_icon || undefined,
      title: tr.tip3_title || '',
      text: tr.tip3_text || ''
    }
  ]
  return {
    title: tr.title,
    titletext: tr.titletext,
    image_link: row.image_link,
    tips
  }
}

export default function MakeItEasier () {
  const { lang } = useLanguage()
  const {
    data: details,
    error,
    isLoading
  } = useSWR(['make-it-easier', lang], () => fetcher(lang), {
    revalidateOnFocus: false
  })

  const prefersReduced = useReducedMotion()
  const [imgLoaded, setImgLoaded] = useState(false)
  const handleLoaded = useCallback(() => setImgLoaded(true), [])

  if (isLoading)
    return (
      <div className='py-8 flex justify-center animate-pulse text-muted-foreground'>
        Yükleniyor…
      </div>
    )
  if (error)
    return (
      <div className='py-8 text-center text-red-500'>
        Bir hata oluştu: {error.message}
      </div>
    )
  if (!details)
    return (
      <div className='py-8 text-center text-muted-foreground'>
        İçerik bulunamadı.
      </div>
    )

  const imageUrl = details.image_link || ''

  const circleVariants: Variants = {
    hidden: prefersReduced
      ? { x: '0%', opacity: 1 }
      : { x: '100%', opacity: 0 },
    visible: prefersReduced
      ? { x: '0%', opacity: 1 }
      : {
          x: '0%',
          opacity: 1,
          transition: { duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }
        }
  }
  const imageVariants: Variants = {
    hidden: prefersReduced ? { x: '0%', opacity: 1 } : { x: '40%', opacity: 0 },
    visible: prefersReduced
      ? { x: '0%', opacity: 1 }
      : {
          x: '0%',
          opacity: 1,
          transition: { duration: 1.0, ease: [0.25, 0.1, 0.25, 1], delay: 0.05 }
        }
  }
  const tipVariants: Variants = {
    hidden: prefersReduced ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 },
    visible: (i: number) =>
      prefersReduced
        ? { y: 0, opacity: 1 }
        : {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.6,
              delay: 0.25 + i * 0.15,
              ease: [0.25, 0.1, 0.25, 1]
            }
          }
  }

  return (
    <div className='w-full overflow-hidden'>
      {/* 1. ÜST KIVRIM (SVG)
         Light: fill-gray-100/90
         Dark: fill-[#212529]/60
      */}
      <div className='block border-none w-full overflow-hidden leading-none'>
        <svg
          className='bg-transparent h-[50px] md:h-[90px] w-full'
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 1200 120'
          preserveAspectRatio='none'
        >
          <path
            className='fill-gray-100/90 dark:fill-[#212529]/60 transition-colors duration-300'
            d='M0,60 C200,10 400,0 600,0 C800,0 1000,10 1200,60 V120 H0 Z'
          ></path>
        </svg>
      </div>

      {/* 2. ORTA İÇERİK ALANI
         Light: bg-gray-100/90
         Dark: bg-[#212529]/60
      */}
      <div className='bg-gray-100/90 dark:bg-[#212529]/60 backdrop-blur-sm w-full flex flex-wrap justify-center items-center gap-8 py-10 lg:py-0 transition-colors duration-300'>
        {/* Sol metin */}
        <div className='w-full max-w-xl h-auto lg:h-[50vh] flex flex-col justify-center text-center lg:text-left order-1'>
          <h2 className='text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight drop-shadow-sm text-gray-900 dark:text-[#ecf2ff]'>
            {details.title}
          </h2>
          <p className='text-base sm:text-lg lg:text-xl mt-4 sm:mt-6 max-w-prose mx-auto lg:mx-0 text-gray-600 dark:text-gray-300'>
            {details.titletext}
          </p>
        </div>

        {/* Görsel Alanı */}
        <div className='relative w-full lg:w-auto h-auto min-h-[350px] lg:h-[50vh] flex items-center justify-center px-6 order-2'>
          <motion.div
            // Circle: Light'ta primary/10, Dark'ta özel mavi
            className='absolute bg-primary/10 dark:bg-[#47597b] rounded-full w-64 h-64 md:w-[25rem] md:h-[25rem] lg:w-[30rem] lg:h-[30rem] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 lg:top-60 lg:-right-70 lg:translate-x-0 lg:-translate-y-1/2 z-0 overflow-hidden transition-colors duration-300'
            variants={circleVariants}
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, amount: 0.2 }}
            style={{ willChange: 'transform, opacity' }}
          />
          <MotionImage
            src={imageUrl}
            alt={details.title || 'Make it easier'}
            width={1000}
            height={1000}
            className='w-full max-w-[280px] sm:max-w-[400px] lg:max-w-[750px] h-auto object-contain z-10 select-none drop-shadow-2xl'
            priority
            onLoad={handleLoaded}
            variants={imageVariants}
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, amount: 0.2 }}
            style={{ willChange: 'transform, opacity' }}
          />
          {imageUrl && !imgLoaded && (
            <div className='absolute bottom-2 right-2 text-xs text-muted-foreground opacity-70'>
              Yükleniyor...
            </div>
          )}
        </div>
      </div>

      {/* 3. ALT İÇERİK (TIPS) VE SLIDER
         Light: bg-gray-100/90
         Dark: bg-[#212529]/60
      */}
      <div className='w-full bg-gray-100/90 dark:bg-[#212529]/60 backdrop-blur-sm transition-colors duration-300'>
        <div className='max-w-7xl mx-auto pb-20 px-6 py-12 lg:py-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start'>
          {(details.tips || []).slice(0, 3).map((tip, idx) => (
            <motion.div
              key={idx}
              className='flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left'
              custom={idx}
              variants={tipVariants}
              initial='hidden'
              whileInView='visible'
              viewport={{ once: true, amount: 0.15 }}
            >
              {/* İkon Kutusu: Light'ta primary, Dark'ta açık mavi */}
              <span className='flex-shrink-0 bg-primary text-white dark:bg-[#ecf2ff] dark:text-[#212529] rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center shadow-lg transition-colors duration-300'>
                {tip.icon ? (
                  <Icon
                    icon={tip.icon}
                    width='40'
                    height='40'
                    className='sm:w-[48px] sm:h-[48px]'
                  />
                ) : (
                  <span className='text-xs font-semibold'>?</span>
                )}
              </span>
              <div>
                <h3 className='text-gray-900 dark:text-white text-lg font-semibold mb-2'>
                  {tip.title}
                </h3>
                <p className='font-normal text-sm text-gray-600 dark:text-[#d1d7e6] leading-relaxed'>
                  {tip.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className='w-full'>
          <MakeItEasierSliderPart />
        </div>
      </div>

      {/* 4. ALT KIVRIM (SVG) 
         Light: fill-gray-100/90
         Dark: fill-[#212529]/60
      */}
      <div className='block border-none w-full overflow-hidden leading-none rotate-180'>
        <svg
          className='bg-transparent h-[50px] md:h-[90px] w-full'
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 1200 120'
          preserveAspectRatio='none'
        >
          <path
            className='fill-gray-100/90 dark:fill-[#212529]/60 transition-colors duration-300'
            d='M0,60 C200,10 400,0 600,0 C800,0 1000,10 1200,60 V120 H0 Z'
          ></path>
        </svg>
      </div>
    </div>
  )
}
