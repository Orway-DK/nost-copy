// app/_components/Header/TopHorizontalBanner.tsx
'use client'

import useSWR from 'swr'
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'
import Dropdown from './LanguageDropdown'
import { useLanguage } from '@/components/LanguageProvider'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

/* Types */
type ContactInfoRow = {
  phone: string | null
  email: string | null
  location_url: string | null
  location_label: string | null
} | null

type BannerTranslation = {
  promo_text: string | null
  promo_cta: string | null
  promo_url: string | null
} | null

/**
 * Fetcher Fonksiyonu
 */
const fetcher = async (lang: string) => {
  const supabase = createSupabaseBrowserClient()

  // 1. İLETİŞİM BİLGİLERİ
  let { data: locData, error: locError } = await supabase
    .from('contact_locations')
    .select('phone, email, map_url, title')
    .eq('is_default', true)
    .eq('lang_code', lang)
    .maybeSingle()

  if (!locData) {
    const { data: fallbackData } = await supabase
      .from('contact_locations')
      .select('phone, email, map_url, title')
      .eq('is_default', true)
      .eq('lang_code', 'tr')
      .maybeSingle()

    if (fallbackData) locData = fallbackData
  }

  if (locError && locError.code !== 'PGRST116') throw locError

  const contact: ContactInfoRow = locData
    ? {
        phone: locData.phone,
        email: locData.email,
        location_url: locData.map_url,
        location_label: locData.title
      }
    : null

  // 2. BANNER ÇEVİRİSİ
  const { data: bannerJoin, error: bannerError } = await supabase
    .from('banner_translations')
    .select('promo_text,promo_cta,promo_url,banners!inner(code,active)')
    .eq('lang_code', lang)
    .eq('banners.code', 'top_horizontal')
    .eq('banners.active', true)
    .maybeSingle()

  if (bannerError && bannerError.code !== 'PGRST116') {
    throw bannerError
  }

  const banner: BannerTranslation = bannerJoin
    ? {
        promo_text: bannerJoin.promo_text,
        promo_cta: bannerJoin.promo_cta,
        promo_url: bannerJoin.promo_url
      }
    : null

  return { contact, banner }
}

export default function TopHorizontalBanner () {
  const { lang } = useLanguage()

  const { data, isLoading } = useSWR(
    ['top-horizontal-banner-v5', lang],
    () => fetcher(lang),
    { revalidateOnFocus: false }
  )

  if (isLoading)
    return <div className='bg-primary min-h-[40px] w-full animate-pulse'></div>

  const contact = data?.contact
  const banner = data?.banner

  if (!contact && !banner) return null

  return (
    // DEĞİŞİKLİK 1: Renkler
    // Light: bg-primary (Marka Rengi), Text: White
    // Dark: bg-[#111] (Footer ile aynı), Text: Gray-300
    <div className='bg-primary dark:bg-[#111] text-white dark:text-gray-300 border-b border-white/10 dark:border-white/5 px-4 py-2 min-h-[40px] w-full flex justify-center font-sans font-medium relative z-[60] transition-colors duration-300'>
      <div className='flex flex-row justify-between items-center w-full max-w-7xl text-xs md:text-sm'>
        {/* SOL: İletişim */}
        <div className='flex flex-row gap-4 md:gap-6 items-center'>
          {contact?.phone && (
            <a
              href={`tel:${contact.phone.replace(/\s/g, '')}`}
              className='flex flex-row items-center gap-2 hover:text-white hover:opacity-100 opacity-90 transition-all'
            >
              <FaPhone className='text-[10px] md:text-xs' />
              <span className='whitespace-nowrap'>{contact.phone}</span>
            </a>
          )}

          {contact?.email && (
            <a
              href={`mailto:${contact.email}`}
              className='hidden sm:flex flex-row items-center gap-2 hover:text-white hover:opacity-100 opacity-90 transition-all'
            >
              <FaEnvelope className='text-[10px] md:text-xs' />
              <span className='truncate max-w-[150px] md:max-w-none'>
                {contact.email}
              </span>
            </a>
          )}
        </div>

        {/* ORTA: Banner */}
        <div className='hidden xl:flex flex-row gap-2 items-center justify-center absolute left-1/2 -translate-x-1/2'>
          {banner?.promo_text && (
            <a
              href={banner.promo_url ?? '#'}
              className='hover:underline text-center flex items-center gap-2'
            >
              {banner.promo_text}
            </a>
          )}
          {banner?.promo_text && banner?.promo_cta && (
            <span className='opacity-40 text-[10px]'>|</span>
          )}
          {banner?.promo_cta && (
            <a
              href={banner.promo_url ?? '#'}
              className='font-bold underline decoration-white/50 hover:decoration-white transition-all whitespace-nowrap text-white'
            >
              {banner.promo_cta}
            </a>
          )}
        </div>

        {/* SAĞ: Dil & Konum */}
        <div className='flex flex-row items-center gap-3 md:gap-4'>
          <Dropdown />
          {contact?.location_url && (
            <div className='hidden sm:flex items-center gap-3'>
              <span className='opacity-30 h-4 w-px bg-current'></span>
              <a
                href={contact.location_url}
                target='_blank'
                rel='noopener noreferrer'
                className='hover:text-white hover:opacity-100 opacity-90 transition-all flex items-center gap-1.5'
                title={contact.location_label || 'Location'}
              >
                <FaMapMarkerAlt className='text-xs' />
                <span className='hidden md:inline whitespace-nowrap max-w-[100px] lg:max-w-none truncate'>
                  {contact.location_label || 'Ofis'}
                </span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
