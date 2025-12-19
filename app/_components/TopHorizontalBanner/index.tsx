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
 * Fetcher
 */
const fetcher = async (lang: string) => {
  const supabase = createSupabaseBrowserClient()

  // 1. İletişim Bilgilerini Çek
  const { data: contactData, error: contactError } = await supabase
    .from('site_contact_info')
    .select('phone, email, location_url, location_label')
    .eq('lang_code', lang)
    .maybeSingle()

  if (contactError) throw contactError

  // 2. Banner Çevirisini Çek
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

  return {
    contact: contactData as ContactInfoRow,
    banner
  }
}

export default function TopHorizontalBanner () {
  const { lang } = useLanguage()

  const { data } = useSWR(
    ['top-horizontal-banner-v2', lang],
    () => fetcher(lang),
    {
      revalidateOnFocus: false,
      suspense: true
    }
  )

  const contact = data?.contact
  const banner = data?.banner

  if (!contact && !banner) return null

  return (
    <div className='bg-primary dark:bg-secondary border-b border-border/10 px-4 py-2 min-h-[40px] w-full flex justify-center font-sans font-medium text-primary-foreground dark:text-card-foreground relative z-[60] transition-colors duration-300'>
      <div className='flex flex-row justify-between items-center w-full max-w-7xl text-xs md:text-sm'>
        {/* --- SOL KISIM --- */}
        <div className='flex flex-row gap-4 md:gap-8 items-center'>
          {contact?.phone && (
            <a
              href={`tel:${contact.phone.replace(/\s/g, '')}`}
              className='flex flex-row items-center gap-2 hover:opacity-80 transition-opacity'
            >
              <FaPhone className='text-xs' />
              <span className='whitespace-nowrap'>{contact.phone}</span>
            </a>
          )}

          {contact?.email && (
            <a
              href={`mailto:${contact.email}`}
              className='hidden sm:flex flex-row items-center gap-2 hover:opacity-80 transition-opacity'
            >
              <FaEnvelope />
              <span>{contact.email}</span>
            </a>
          )}
        </div>

        {/* --- ORTA KISIM --- */}
        {/* Değişiklik: hidden xl:flex kullanılarak 1280px altına kadar gizlendi */}
        <div className='hidden xl:flex flex-row gap-2 items-center'>
          {banner?.promo_text && (
            <a
              href={banner.promo_url ?? '#'}
              className='hover:underline text-center'
            >
              {banner.promo_text}
            </a>
          )}
          {banner?.promo_text && banner?.promo_cta && (
            <span className='opacity-50 mx-1'>|</span>
          )}
          {banner?.promo_cta && (
            <a
              href={banner.promo_url ?? '#'}
              className='font-bold underline decoration-current/50 hover:decoration-current transition-all whitespace-nowrap'
            >
              {banner.promo_cta}
            </a>
          )}
        </div>

        {/* --- SAĞ KISIM --- */}
        <div className='flex flex-row items-center gap-3 md:gap-4'>
          <Dropdown />
          {contact?.location_url && (
            <>
              <span className='opacity-50'>|</span>
              <a
                href={contact.location_url}
                target='_blank'
                rel='noopener noreferrer'
                className='hover:opacity-80 transition-opacity flex items-center gap-1'
                title={contact.location_label || 'Location'}
              >
                <FaMapMarkerAlt className='sm:hidden text-sm' />
                <span className='hidden sm:inline whitespace-nowrap'>
                  {contact.location_label || 'Location'}
                </span>
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
