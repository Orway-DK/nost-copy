// C:\Projeler\nost-copy\app\_components\WhyUsBanner\WhyUsBanner.tsx
'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { BiWorld, BiTrendingUp, BiDollarCircle } from 'react-icons/bi'
import useSWR from 'swr'
import { useLanguage } from '@/components/LanguageProvider'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

// --- URL HELPER ---
const STORAGE_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/why_us/`
  : ''

const getImageUrl = (path: string | null | undefined) => {
  if (!path) return '/h1-banner01.jpg'
  if (path.startsWith('http')) return path
  if (path.startsWith('/')) return path
  return `${STORAGE_BASE}${path}`
}

type WhyUsRow = {
  image1_url: string
  image2_url: string
  years_experience: number
  badge_code: string
}

type WhyUsTranslation = {
  badge_label: string
  headline_prefix: string
  headline_emphasis: string
  headline_suffix: string
  description: string
  item1_title: string
  item1_text: string
  item2_title: string
  item2_text: string
  item3_title: string
  item3_text: string
  lang_code: string
}

type ApiResult = {
  base: WhyUsRow | null
  tr: WhyUsTranslation | null
}

const fetcher = async (lang: string): Promise<ApiResult> => {
  const supabase = createSupabaseBrowserClient()
  const { data: baseRow } = await supabase
    .from('why_us')
    .select('*')
    .eq('active', true)
    .limit(1)
    .maybeSingle()
  const { data: trRow } = await supabase
    .from('why_us_translations')
    .select('*')
    .eq('lang_code', lang)
    .limit(1)
    .maybeSingle()

  return { base: baseRow, tr: trRow }
}

export default function WhyUs () {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { lang } = useLanguage()
  const [visible, setVisible] = useState(false)
  const [years, setYears] = useState(0)

  const { data, isLoading } = useSWR<ApiResult>(
    ['why-us', lang],
    () => fetcher(lang),
    { revalidateOnFocus: false }
  )

  useEffect(() => {
    if (isLoading) return

    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.1 }
    )

    observer.observe(el)

    return () => observer.disconnect()
  }, [isLoading])

  useEffect(() => {
    if (!visible || !data?.base) return
    const targetYears = data.base.years_experience || 10
    let start = 0
    const duration = 2000
    const stepTime = Math.abs(Math.floor(duration / targetYears))

    const timer = setInterval(() => {
      start += 1
      setYears(start)
      if (start >= targetYears) clearInterval(timer)
    }, stepTime)

    return () => clearInterval(timer)
  }, [visible, data])

  if (isLoading)
    return (
      <div className='h-96 w-full bg-gray-100 animate-pulse my-20 rounded-xl'></div>
    )

  const base = data?.base
  const tr = data?.tr

  const img1Src = getImageUrl(base?.image1_url)
  const img2Src = getImageUrl(base?.image2_url)

  return (
    <section
      ref={sectionRef}
      className='container mx-auto px-4 py-0 lg:py-24 overflow-hidden'
    >
      {/* Flex-col mobilde alt alta, lg:flex-row masaüstünde yan yana */}
      <div className='flex flex-col lg:flex-row items-center gap-12 lg:gap-20'>
        {/* --- SOL BLOK (GÖRSELLER) --- */}
        {/* min-h değerini mobilde biraz düşürdük, masaüstünde artırdık */}
        <div className='w-full lg:w-1/2 relative min-h-[350px] lg:min-h-[500px] flex items-center justify-center'>
          {/* Görsel 1: Mobilde ortada (relative), Masaüstünde solda (absolute) */}
          <div
            className='relative lg:absolute lg:left-0 lg:top:-12 lg:-top-12 w-full max-w-[400px] lg:max-w-none lg:w-3/4 z-10 transition-all duration-1000 ease-out'
            style={{
              opacity: visible ? 1 : 0,
              // Mobilde translateY efekti, Masaüstünde translateX efekti veriyoruz
              transform: visible
                ? 'translate(0, 0)'
                : typeof window !== 'undefined' && window.innerWidth < 1024
                ? 'translateY(50px)'
                : 'translateX(-100px)'
            }}
          >
            <Image
              src={img1Src}
              alt='Factory'
              width={500}
              height={500}
              className='rounded-3xl w-full h-auto object-cover shadow-xl'
              unoptimized
            />
          </div>

          {/* Görsel 2: SADECE Masaüstünde görünür (hidden lg:block) */}
          <div
            className='hidden lg:block absolute right-0 bottom-0 lg:top-40 w-2/3 z-20 transition-all duration-1000 ease-out delay-200'
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(100px)'
            }}
          >
            <Image
              src={img2Src}
              alt='Process'
              width={400}
              height={400}
              className='rounded-3xl w-full h-auto object-cover shadow-xl border-4 border-white'
              unoptimized
            />
          </div>

          {/* Badge: Mobilde görselin altına ortalanır, Masaüstünde sol alta geçer */}
          <div
            className='absolute -bottom-6 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-10 z-30 p-4 rounded-xl flex flex-col items-center transition-all duration-700 delay-500 bg-white shadow-lg border border-gray-100 min-w-[140px]'
            style={{
              opacity: visible ? 1 : 0,
              transform: visible
                ? typeof window !== 'undefined' && window.innerWidth < 1024
                  ? 'translateX(-50%) scale(1)'
                  : 'scale(1)'
                : 'scale(0.5)'
            }}
          >
            <span className='text-4xl lg:text-5xl font-bold text-blue-700'>
              {years}+
            </span>
            <span className='text-sm lg:text-lg text-gray-600 font-medium whitespace-nowrap'>
              {lang === 'tr'
                ? 'Yıl Deneyim'
                : lang === 'de'
                ? 'Jahre Erfahrung'
                : 'Years Experience'}
            </span>
          </div>
        </div>

        {/* --- SAĞ BLOK (İÇERİK) --- */}
        {/* Mobilde text-center veya text-left tercih edilebilir, şu an left bıraktık ama w-full yaptık */}
        <div className='w-full lg:w-1/2 flex flex-col items-start space-y-6 mt-4 lg:mt-0'>
          <span className='rounded-full bg-blue-50 px-4 py-2 text-blue-700 font-bold text-sm tracking-wide uppercase self-start'>
            {tr?.badge_label ?? base?.badge_code ?? 'BEST PRINTING COMPANY'}
          </span>

          <h2 className='text-3xl lg:text-5xl font-extrabold text-gray-900 leading-tight'>
            {tr?.headline_prefix ?? 'Reason To'}{' '}
            <span className='text-blue-700'>
              {tr?.headline_emphasis ?? 'Get Printing'}
            </span>{' '}
            {tr?.headline_suffix ?? 'Started With Us'}
          </h2>

          <p className='text-lg text-gray-600 leading-relaxed'>
            {tr?.description ??
              'We are 100+ professional printing experts with more than 10 years of experience.'}
          </p>

          <ul className='grid gap-6 mt-4 w-full'>
            <li className='flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors'>
              <div className='p-3 bg-blue-100 rounded-lg text-blue-700 shrink-0'>
                <BiDollarCircle className='text-3xl' />
              </div>
              <div>
                <h3 className='font-bold text-xl text-gray-900'>
                  {tr?.item1_title ?? 'High Profit Margin'}
                </h3>
                <p className='text-gray-500 mt-1 text-sm lg:text-base'>
                  {tr?.item1_text ?? 'Effective optimization of cost...'}
                </p>
              </div>
            </li>
            <li className='flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors'>
              <div className='p-3 bg-blue-100 rounded-lg text-blue-700 shrink-0'>
                <BiWorld className='text-3xl' />
              </div>
              <div>
                <h3 className='font-bold text-xl text-gray-900'>
                  {tr?.item2_title ?? 'Global Shipping'}
                </h3>
                <p className='text-gray-500 mt-1 text-sm lg:text-base'>
                  {tr?.item2_text ?? 'Reach the global market easily...'}
                </p>
              </div>
            </li>
            <li className='flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors'>
              <div className='p-3 bg-blue-100 rounded-lg text-blue-700 shrink-0'>
                <BiTrendingUp className='text-3xl' />
              </div>
              <div>
                <h3 className='font-bold text-xl text-gray-900'>
                  {tr?.item3_title ?? 'Trending Products'}
                </h3>
                <p className='text-gray-500 mt-1 text-sm lg:text-base'>
                  {tr?.item3_text ?? 'Maximize your sales volume...'}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
