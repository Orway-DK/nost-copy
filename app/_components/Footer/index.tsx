'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import useSWR from 'swr'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useLanguage } from '@/components/LanguageProvider'
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaPinterest,
  FaLinkedinIn,
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaClock
} from 'react-icons/fa'

// --- TİPLER ---
type SiteSettings = {
  id: number
  site_name: string | null
  logo_url: string | null
  footer_text: string | null
  phone: string | null
  email: string | null
  address: string | null
  working_hours: string | null
  store_location_url: string | null
}

type SocialLink = {
  code: string
  url: string
}

type FooterLink = {
  section: string
  title: string
  url: string
}

// --- FETCHER ---
const fetchFooterData = async (lang: string) => {
  const supabase = createSupabaseBrowserClient()

  const [settingsRes, socialRes, linksRes] = await Promise.all([
    supabase.from('site_settings').select('*').limit(1).maybeSingle(),
    supabase
      .from('site_social_links')
      .select('*')
      .eq('active', true)
      .order('sort', { ascending: true }),
    supabase
      .from('footer_links')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })
  ])

  let finalSettings = settingsRes.data as SiteSettings
  let finalLinks = (linksRes.data as any[]) || []
  const socials = (socialRes.data as SocialLink[]) || []

  if (finalSettings && lang) {
    const { data: settingTrans } = await supabase
      .from('site_settings_translations')
      .select('site_name, footer_text, address')
      .eq('settings_id', finalSettings.id)
      .eq('lang_code', lang)
      .maybeSingle()

    if (settingTrans) {
      finalSettings = {
        ...finalSettings,
        site_name: settingTrans.site_name || finalSettings.site_name,
        footer_text: settingTrans.footer_text || finalSettings.footer_text,
        address: settingTrans.address || finalSettings.address
      }
    }

    const { data: linkTrans } = await supabase
      .from('footer_links_translations')
      .select('link_id, title')
      .eq('lang_code', lang)

    if (linkTrans && linkTrans.length > 0) {
      finalLinks = finalLinks.map(link => {
        const tr = linkTrans.find((t: any) => t.link_id === link.id)
        return {
          ...link,
          title: tr?.title || link.title
        }
      })
    }
  }

  return {
    settings: finalSettings,
    socials: socials,
    links: finalLinks as FooterLink[]
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Footer () {
  // --- HYDRATION FIX ---
  const [mounted, setMounted] = useState(false)
  const { lang } = useLanguage()

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data, isLoading } = useSWR(
    mounted ? ['footer-data', lang] : null,
    () => fetchFooterData(lang),
    { revalidateOnFocus: false }
  )

  const { settings, socials, links } = data || {}

  const [email, setEmail] = useState('')
  const [subStatus, setSubStatus] = useState<
    'idle' | 'loading' | 'success' | 'error' | 'exists'
  >('idle')
  const [subMessage, setSubMessage] = useState('')
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const handleSubscribe = async () => {
    if (subStatus === 'loading') return
    if (!EMAIL_REGEX.test(email)) {
      setSubStatus('error')
      setSubMessage(
        lang === 'tr'
          ? 'Geçersiz e-posta adresi.'
          : lang === 'de'
          ? 'Ungültige E-Mail-Adresse.'
          : 'Invalid email address.'
      )
      return
    }
    setSubStatus('loading')
    setSubMessage('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale: lang, source: 'footer' })
      })
      const data = await res.json()

      if (res.ok && data.ok) {
        if (data.already) {
          setSubStatus('exists')
          setSubMessage(
            data.message ||
              (lang === 'tr' ? 'Zaten abonesiniz.' : 'Already subscribed.')
          )
        } else {
          setSubStatus('success')
          setSubMessage(
            data.message ||
              (lang === 'tr'
                ? 'Kaydolduğunuz için teşekkürler!'
                : 'Subscribed successfully!')
          )
          setEmail('')
        }
      } else {
        setSubStatus('error')
        setSubMessage(data.error || 'Error.')
      }
    } catch {
      setSubStatus('error')
      setSubMessage('Network error.')
    }
  }

  useEffect(() => {
    if (['success', 'exists', 'error'].includes(subStatus)) {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        setSubStatus('idle')
        setSubMessage('')
      }, 4000)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [subStatus])

  const getSocialIcon = (code: string) => {
    switch (code) {
      case 'facebook':
        return <FaFacebookF />
      case 'twitter':
      case 'x':
        return <FaTwitter />
      case 'instagram':
        return <FaInstagram />
      case 'pinterest':
        return <FaPinterest />
      case 'linkedin':
        return <FaLinkedinIn />
      case 'whatsapp':
        return <FaWhatsapp />
      default:
        return <FaFacebookF />
    }
  }

  // UI Metinleri
  const uiText = {
    signupTitle:
      lang === 'tr'
        ? 'Özel Fırsatlar İçin Kaydolun'
        : lang === 'de'
        ? 'Melden Sie sich für exklusive Angebote an'
        : 'Sign Up For Exclusive Offers',
    signupDesc:
      lang === 'tr'
        ? 'Topluluğumuza katılın, yeni ürün ve indirimlerden haberdar olun.'
        : lang === 'de'
        ? 'Treten Sie unserer Community bei und erhalten Sie Updates.'
        : 'Join our community and get updates on new products.',
    emailPlaceholder:
      lang === 'tr'
        ? 'eposta@adresiniz.com'
        : lang === 'de'
        ? 'ihre@email.com'
        : 'your@email.com',
    subscribeBtn:
      lang === 'tr' ? 'Abone Ol' : lang === 'de' ? 'Abonnieren' : 'Subscribe',
    contactTitle:
      lang === 'tr' ? 'İletişim' : lang === 'de' ? 'Kontakt' : 'Keep In Touch',
    workingHours:
      lang === 'tr'
        ? 'Çalışma Saatleri'
        : lang === 'de'
        ? 'Öffnungszeiten'
        : 'Working Hours',
    rightsReserved:
      lang === 'tr'
        ? 'Tüm hakları saklıdır.'
        : lang === 'de'
        ? 'Alle Rechte vorbehalten.'
        : 'All rights reserved.'
  }

  // --- HYDRATION FIX: MOUNTED KONTROLÜ ---
  if (!mounted) {
    return <div className='w-full bg-secondary h-[400px]'></div>
  }

  return (
    // Ana arka plan bg-secondary olarak ayarlandı (Koyu/Lacivert ton yerine tema rengi)
    // Metin rengi text-secondary-foreground
    <footer className='w-full bg-secondary text-secondary-foreground font-sans'>
      {/* 1. ABONELİK BÖLÜMÜ */}
      <div className='relative w-full overflow-hidden'>
        {/* Dalga Efekti SVG: Renkler temaya uyarlandı (fill-background ve bg-secondary) */}
        <div className='block border-none rotate-180 w-full overflow-hidden'>
          <svg
            className='bg-secondary h-[90px] w-[calc(100%+2px)]'
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 1000 100'
            preserveAspectRatio='none'
          >
            <path
              className='fill-background' // Sayfa arkaplan rengiyle birleşmesi için
              d='M500,97C126.7,96.3,0.8,19.8,0,0v100l1000,0V1C1000,19.4,873.3,97.8,500,97z'
            ></path>
          </svg>
        </div>

        <div className='bg-secondary'>
          <div className='relative z-10 max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8'>
            <div className='flex-1 text-center md:text-left'>
              <h2 className='text-2xl md:text-4xl font-bold leading-tight text-secondary-foreground'>
                {uiText.signupTitle}
              </h2>
              {/* text-muted-foreground kullanıldı */}
              <p className='text-muted-foreground mt-2'>{uiText.signupDesc}</p>
            </div>

            <div className='flex-1 w-full max-w-md'>
              <div className='flex relative shadow-lg rounded-full overflow-hidden bg-card'>
                <input
                  type='email'
                  placeholder={uiText.emailPlaceholder}
                  // Input metin ve arka plan renkleri
                  className='w-full py-3 px-6 text-card-foreground bg-card focus:outline-none placeholder:text-muted-foreground'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
                  disabled={subStatus === 'loading'}
                />
                <button
                  onClick={handleSubscribe}
                  disabled={subStatus === 'loading'}
                  className={`px-8 font-semibold text-primary-foreground transition-colors duration-300 border-l border-border ${
                    subStatus === 'success'
                      ? 'bg-green-600'
                      : subStatus === 'error'
                      ? 'bg-red-600'
                      : 'bg-primary hover:bg-primary-hover'
                  }`}
                >
                  {subStatus === 'loading'
                    ? '...'
                    : subStatus === 'success'
                    ? '✓'
                    : uiText.subscribeBtn}
                </button>
              </div>
              {subMessage && (
                <p
                  className={`text-xs mt-2 text-center md:text-right font-medium ${
                    subStatus === 'error'
                      ? 'text-red-400'
                      : subStatus === 'success'
                      ? 'text-green-400'
                      : 'text-yellow-400'
                  }`}
                >
                  {subMessage}
                </p>
              )}
            </div>
          </div>
        </div>

        <hr className='border-border border-2 opacity-10 mx-auto max-w-7xl my-8' />

        {/* 2. BİLGİ ALANI (Grid) */}
        <div className='max-w-7xl mx-auto px-6 pb-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8'>
          {/* KOLON 1: Logo & Açıklama */}
          <div className='space-y-6 lg:col-span-1 text-center md:text-left'>
            {isLoading ? (
              <div className='h-10 w-32 bg-muted animate-pulse rounded mx-auto md:mx-0'></div>
            ) : settings?.logo_url ? (
              <Image
                src={settings.logo_url}
                alt={settings.site_name || 'Logo'}
                width={160}
                height={50}
                className='object-contain mx-auto md:mx-0 opacity-90' // Logoyu beyaza çevirmek için (koyu zeminse) veya tema uyumu için
              />
            ) : (
              <span className='text-2xl font-bold text-secondary-foreground'>
                {settings?.site_name || 'Site Name'}
              </span>
            )}

            <p className='text-muted-foreground text-sm leading-relaxed'>
              {settings?.footer_text || 'Premium printing solutions.'}
            </p>

            {/* Social ikonlar */}
            <div className='flex flex-wrap gap-2 justify-center md:justify-start'>
              {socials?.map((s, idx) => (
                <a
                  key={idx}
                  href={s.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  // bg-card, hover:bg-primary
                  className='w-8 h-8 rounded-full bg-muted/20 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-muted-foreground text-sm'
                >
                  {getSocialIcon(s.code)}
                </a>
              ))}
            </div>
          </div>

          {/* KOLON 2, 3, 4: Link Grupları */}
          {['information', 'useful', 'about'].map(sectionKey => {
            const sectionLinks = links?.filter(l => l.section === sectionKey)
            let sectionTitle = 'Menu'
            // (Dil kontrolleri aynı kaldı)
            if (sectionKey === 'information')
              sectionTitle =
                lang === 'tr'
                  ? 'Bilgi'
                  : lang === 'de'
                  ? 'Informationen'
                  : 'Information'
            if (sectionKey === 'useful')
              sectionTitle =
                lang === 'tr'
                  ? 'Faydalı Linkler'
                  : lang === 'de'
                  ? 'Nützliche Links'
                  : 'Useful Links'
            if (sectionKey === 'about')
              sectionTitle =
                lang === 'tr'
                  ? 'Hakkımızda'
                  : lang === 'de'
                  ? 'Über uns'
                  : 'About Us'

            return (
              <div
                key={sectionKey}
                className='lg:col-span-1 text-center md:text-left'
              >
                <h3 className='text-lg font-semibold mb-6 text-secondary-foreground inline-block'>
                  {sectionTitle}
                </h3>
                <ul className='space-y-3 text-sm text-muted-foreground'>
                  {sectionLinks?.map((l, i) => (
                    <li key={i}>
                      <Link
                        href={l.url}
                        className='hover:text-primary hover:translate-x-1 transition-all duration-200 inline-block'
                      >
                        {l.title}
                      </Link>
                    </li>
                  ))}
                  {(!sectionLinks || sectionLinks.length === 0) &&
                    !isLoading && <li className='text-xs opacity-50'>-</li>}
                </ul>
              </div>
            )
          })}

          {/* KOLON 5: İletişim */}
          <div className='lg:col-span-1 text-center md:text-left'>
            <h3 className='text-lg font-semibold mb-6 text-secondary-foreground inline-block'>
              {uiText.contactTitle}
            </h3>
            <ul className='space-y-4 text-sm text-muted-foreground'>
              <li className='flex items-start gap-3 justify-center md:justify-start'>
                <FaMapMarkerAlt className='mt-1 text-primary flex-shrink-0' />
                <span className='leading-relaxed'>
                  {settings?.address ? (
                    settings.store_location_url ? (
                      <a
                        href={settings.store_location_url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='hover:text-primary transition-colors hover:underline decoration-primary'
                      >
                        {settings.address}
                      </a>
                    ) : (
                      settings.address
                    )
                  ) : (
                    'Loading...'
                  )}
                </span>
              </li>
              <li className='flex items-center gap-3 justify-center md:justify-start'>
                <FaPhone className='text-primary flex-shrink-0' />
                <a
                  href={`tel:${settings?.phone}`}
                  className='hover:text-primary transition-colors'
                >
                  {settings?.phone || 'Loading...'}
                </a>
              </li>
              <li className='flex items-center gap-3 justify-center md:justify-start'>
                <FaEnvelope className='text-primary flex-shrink-0' />
                <a
                  href={`mailto:${settings?.email}`}
                  className='hover:text-primary transition-colors'
                >
                  {settings?.email || 'Loading...'}
                </a>
              </li>
              {settings?.working_hours && (
                <li className='flex items-start gap-3 pt-2 border-t border-border/20 mt-2 justify-center md:justify-start'>
                  <FaClock className='mt-1 text-primary flex-shrink-0' />
                  <div>
                    <span className='block text-xs font-semibold text-muted-foreground uppercase opacity-70'>
                      {uiText.workingHours}
                    </span>
                    <span className='text-secondary-foreground'>
                      {settings.working_hours}
                    </span>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* 3. ALT BİLGİ */}
        {/* bg-secondary'nin bir ton koyusu veya aynısı, border ile ayrılmış */}
        <div className='bg-secondary/50 py-6 border-t border-border/10'>
          <div className='max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4'>
            <p className='text-xs text-muted-foreground text-center md:text-left'>
              © {new Date().getFullYear()}{' '}
              <strong className='text-secondary-foreground'>
                {settings?.site_name}
              </strong>
              . {uiText.rightsReserved}
            </p>
            <div className='opacity-80 grayscale hover:grayscale-0 transition-all duration-500'>
              <Image
                src='/payment.png'
                width={300}
                height={40}
                alt='Payment Methods'
                className='h-6 w-auto object-contain'
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
