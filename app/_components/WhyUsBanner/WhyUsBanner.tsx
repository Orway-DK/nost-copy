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
      <div className='h-96 w-full bg-muted animate-pulse my-20 rounded-xl container mx-auto'></div>
    )

  const base = data?.base
  const tr = data?.tr

  const img1Src = getImageUrl(base?.image1_url)
  const img2Src = getImageUrl(base?.image2_url)

  return (
    <section
      ref={sectionRef}
      className='container mx-auto px-4 py-12 md:py-20 lg:py-24 overflow-hidden'
    >
      <div className='flex flex-col lg:flex-row items-center gap-12 md:gap-16 lg:gap-12 xl:gap-20'>
        {/* --- SOL BLOK (GÖRSELLER) --- */}
        <div className='w-full lg:w-1/2 relative min-h-[400px] md:min-h-[500px] lg:min-h-[550px] flex items-center justify-center lg:justify-start'>
          {/* Görsel 1 */}
          <div
            className='relative lg:absolute lg:left-0 lg:-top-12 w-full max-w-[450px] lg:w-4/5 z-10 transition-all duration-1000 ease-out'
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translate(0, 0)' : 'translateY(40px)'
            }}
          >
            <Image
              src={img1Src}
              alt='Factory'
              width={600}
              height={600}
              className='rounded-3xl w-full h-auto object-cover shadow-2xl border border-border/50'
              unoptimized
            />
          </div>

          {/* Görsel 2: Masaüstü ve Geniş Tablette görünür */}
          <div
            className='hidden md:block absolute right-0 bottom-4 lg:-right-4 lg:bottom-0 w-1/2 lg:w-3/5 z-20 transition-all duration-1000 ease-out delay-200'
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(60px)'
            }}
          >
            <Image
              src={img2Src}
              alt='Process'
              width={450}
              height={450}
              className='rounded-3xl w-full h-auto object-cover shadow-2xl border-4 border-background'
              unoptimized
            />
          </div>

          {/* Badge (Deneyim Kartı) */}
          <div
            className='absolute -bottom-4 md:bottom-10 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-8 z-30 p-5 rounded-2xl flex flex-col items-center transition-all duration-700 delay-500 bg-background dark:bg-secondary shadow-2xl border border-border min-w-[150px]'
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'scale(1)' : 'scale(0.8)'
            }}
          >
            <span className='text-4xl lg:text-5xl font-bold text-primary'>
              {years}+
            </span>
            <span className='text-xs lg:text-sm text-muted-foreground font-semibold uppercase tracking-wider text-center'>
              {lang === 'tr'
                ? 'Yıl Deneyim'
                : lang === 'de'
                ? 'Jahre Erfahrung'
                : 'Years Experience'}
            </span>
          </div>
        </div>

        {/* --- SAĞ BLOK (İÇERİK) --- */}
        <div className='w-full lg:w-1/2 flex flex-col items-start space-y-6 lg:space-y-8'>
          <span className='rounded-full bg-primary/10 dark:bg-primary/20 px-4 py-2 text-primary font-bold text-xs tracking-widest uppercase self-start'>
            {tr?.badge_label ?? base?.badge_code ?? 'BEST PRINTING COMPANY'}
          </span>

          <h2 className='text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground leading-tight'>
            {tr?.headline_prefix ?? 'Reason To'}{' '}
            <span className='text-primary'>
              {tr?.headline_emphasis ?? 'Get Printing'}
            </span>{' '}
            {tr?.headline_suffix ?? 'Started With Us'}
          </h2>

          <p className='text-lg text-muted-foreground leading-relaxed max-w-xl'>
            {tr?.description ??
              'We are 100+ professional printing experts with more than 10 years of experience.'}
          </p>

          <ul className='grid gap-4 md:gap-6 mt-2 w-full max-w-2xl'>
            {[
              {
                icon: BiDollarCircle,
                title: tr?.item1_title,
                text: tr?.item1_text,
                defTitle: 'High Profit Margin'
              },
              {
                icon: BiWorld,
                title: tr?.item2_title,
                text: tr?.item2_text,
                defTitle: 'Global Shipping'
              },
              {
                icon: BiTrendingUp,
                title: tr?.item3_title,
                text: tr?.item3_text,
                defTitle: 'Trending Products'
              }
            ].map((item, i) => (
              <li
                key={i}
                className='flex items-start gap-5 p-4 md:p-5 rounded-2xl hover:bg-muted/50 dark:hover:bg-muted/20 transition-all border border-transparent hover:border-border'
              >
                <div className='p-3 bg-primary/10 dark:bg-primary/20 rounded-xl text-primary shrink-0'>
                  <item.icon className='text-3xl' />
                </div>
                <div>
                  <h3 className='font-bold text-xl text-foreground'>
                    {item.title ?? item.defTitle}
                  </h3>
                  <p className='text-muted-foreground mt-1 text-sm md:text-base leading-snug'>
                    {item.text ??
                      'Effective optimization of cost and process...'}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
