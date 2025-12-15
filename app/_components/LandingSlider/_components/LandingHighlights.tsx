'use client'

import { useEffect } from 'react'
import useSWR from 'swr'
import { Icon } from '@iconify/react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useLanguage } from '@/components/LanguageProvider'
import { useAppLoading } from '@/components/AppLoadingProvider'
import Reveal from './Reveal'

type Highlight = {
  id: number
  icon: string
  text: string
}

const fetchHighlights = async (lang: string): Promise<Highlight[]> => {
  const supabase = createSupabaseBrowserClient()

  const { data, error } = await supabase
    .from('landing_highlights')
    .select('id, icon, landing_highlight_translations(text, lang_code)')
    .eq('active', true)
    .eq('landing_highlight_translations.lang_code', lang)
    .order('order_no', { ascending: true })

  if (error) throw error

  return (data || []).map((item: any) => ({
    id: item.id,
    icon: item.icon,
    text: item.landing_highlight_translations?.[0]?.text || ''
  }))
}

export default function LandingHighlights () {
  const { lang } = useLanguage()
  const { start, stop } = useAppLoading()

  const { data: items, isLoading } = useSWR(
    ['landing-highlights', lang],
    () => fetchHighlights(lang),
    { revalidateOnFocus: false }
  )

  useEffect(() => {
    if (isLoading) start()
    else stop()
  }, [isLoading, start, stop])

  if (isLoading) return <div className='h-32 w-full invisible'></div>

  if (!items || items.length === 0) return null

  return (
    <div className='w-full max-w-7xl mb-16 px-4 md:px-0'>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 justify-between'>
        {items.map((item, idx) => (
          <Reveal
            key={item.id}
            direction='up'
            delayMs={100 + idx * 100}
            once={true}
            // RENK DÜZELTMESİ:
            // bg-white/40 -> bg-card/40 (Dark mode'da şeffaf koyu zemin)
            // hover:bg-white/60 -> hover:bg-card/60
            // hover:border-blue-100 -> hover:border-primary/20
            className='flex flex-row items-center text-left md:text-center gap-4 p-4 rounded-xl bg-card/40 md:bg-transparent hover:bg-card/60 transition-colors group border border-transparent hover:border-primary/20 backdrop-blur-sm'
          >
            {/* İKON KUTUSU: Primary Rengine Bağlandı */}
            <div className='w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform'>
              <Icon icon={item.icon} width='24' height='24' />
            </div>

            {/* METİN: Muted Foreground */}
            <span className='text-base md:text-lg font-light text-muted-foreground leading-tight'>
              {item.text}
            </span>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
