// app/_components/Footer/Footer.tsx
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
  FaMapMarkerAlt
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
        ...settingTrans
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
        lang === 'tr' ? 'Geçersiz e-posta adresi.' : 'Invalid email address.'
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
            data.message || (lang === 'tr' ? 'Teşekkürler!' : 'Subscribed!')
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

  const uiText = {
    signupTitle:
      lang === 'tr'
        ? 'Özel Fırsatlar İçin Kaydolun'
        : 'Sign Up For Exclusive Offers',
    signupDesc:
      lang === 'tr'
        ? 'Topluluğumuza katılın, indirimlerden haberdar olun.'
        : 'Join our community and get updates.',
    emailPlaceholder: lang === 'tr' ? 'eposta@adresiniz.com' : 'your@email.com',
    subscribeBtn: lang === 'tr' ? 'Abone Ol' : 'Subscribe',
    contactTitle: lang === 'tr' ? 'İletişim' : 'Keep In Touch',
    workingHours: lang === 'tr' ? 'Çalışma Saatleri' : 'Working Hours',
    rightsReserved:
      lang === 'tr' ? 'Tüm hakları saklıdır.' : 'All rights reserved.'
  }

  if (!mounted) return null

  return (
    // DEĞİŞİKLİK 1: Footer Ana Rengi (Light: Gray-100, Dark: #111)
    <footer className='w-full bg-gray-100 dark:bg-[#111] text-gray-800 dark:text-[#e5e5e5] font-sans relative mt-20 transition-colors duration-300'>
      {/* 1. KIVRIMLI GEÇİŞ (SVG) */}
      <div className='absolute -top-[48px] md:-top-[88px] left-0 w-full overflow-hidden leading-none z-10'>
        <svg
          className='h-[50px] md:h-[90px] w-full'
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 1200 120'
          preserveAspectRatio='none'
        >
          {/* DEĞİŞİKLİK 2: SVG Fill Rengi Footer ile aynı olmalı */}
          <path
            className='fill-gray-100 dark:fill-[#111] transition-colors duration-300'
            d='M0,60 C200,10 400,0 600,0 C800,0 1000,10 1200,60 V120 H0 Z'
          ></path>
        </svg>
      </div>

      {/* 2. ABONELİK BÖLÜMÜ */}
      <div className='relative z-20 border-b border-gray-200 dark:border-white/5'>
        <div className='max-w-7xl mx-auto px-6 py-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-8'>
          <div className='flex-1 text-center md:text-left'>
            <h2 className='text-2xl md:text-4xl font-bold leading-tight text-gray-900 dark:text-white mb-2'>
              {uiText.signupTitle}
            </h2>
            <p className='text-gray-500 dark:text-gray-400'>
              {uiText.signupDesc}
            </p>
          </div>

          <div className='flex-1 w-full max-w-md'>
            {/* DEĞİŞİKLİK 3: Input Alanı Light/Dark uyumu */}
            <div className='flex relative shadow-xl rounded-full overflow-hidden bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 focus-within:border-primary/50 transition-colors'>
              <input
                type='email'
                placeholder={uiText.emailPlaceholder}
                className='w-full py-4 px-6 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none'
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
                disabled={subStatus === 'loading'}
              />
              <button
                onClick={handleSubscribe}
                disabled={subStatus === 'loading'}
                className={`px-8 font-bold text-white transition-all duration-300 ${
                  subStatus === 'success'
                    ? 'bg-green-600'
                    : subStatus === 'error'
                    ? 'bg-red-600'
                    : 'bg-primary hover:brightness-110'
                }`}
              >
                {subStatus === 'loading'
                  ? '...'
                  : subStatus === 'success'
                  ? '✓'
                  : '→'}
              </button>
            </div>
            {subMessage && (
              <p
                className={`text-xs mt-3 text-center md:text-right font-medium ${
                  subStatus === 'error'
                    ? 'text-red-500 dark:text-red-400'
                    : subStatus === 'success'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-yellow-600 dark:text-yellow-400'
                }`}
              >
                {subMessage}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 3. ANA LİNKLER & BİLGİ */}
      <div className='max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10'>
        {/* Logo & Sosyal Medya */}
        <div className='lg:col-span-2 space-y-6 text-center md:text-left'>
          {isLoading ? (
            <div className='h-10 w-32 bg-gray-200 dark:bg-white/10 animate-pulse rounded mx-auto md:mx-0'></div>
          ) : settings?.logo_url ? (
            <div className='relative h-12 w-48 mx-auto md:mx-0'>
              {/* Light/Dark modda logo görünürlüğü için opacity ayarı veya css filter kullanılabilir */}
              <Image
                src={settings.logo_url}
                alt={settings.site_name || 'Logo'}
                fill
                className='object-contain object-left dark:opacity-90'
              />
            </div>
          ) : (
            <span className='text-2xl font-black text-gray-900 dark:text-white tracking-tight'>
              {settings?.site_name || 'NOST COPY'}
            </span>
          )}

          <p className='text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-sm mx-auto md:mx-0'>
            {settings?.footer_text ||
              'Premium printing solutions suited for your business needs.'}
          </p>

          <div className='flex flex-wrap gap-3 justify-center md:justify-start pt-2'>
            {socials?.map((s, idx) => (
              <a
                key={idx}
                href={s.url}
                target='_blank'
                rel='noopener noreferrer'
                // DEĞİŞİKLİK 4: Sosyal İkon Renkleri
                className='w-10 h-10 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-all duration-300 text-gray-500 dark:text-gray-400'
              >
                {getSocialIcon(s.code)}
              </a>
            ))}
          </div>
        </div>

        {/* Link Kolonları */}
        {['information', 'useful', 'about'].map(sectionKey => {
          const sectionLinks = links?.filter(l => l.section === sectionKey)
          let sectionTitle = 'Menu'
          if (sectionKey === 'information')
            sectionTitle = lang === 'tr' ? 'Bilgi' : 'Information'
          if (sectionKey === 'useful')
            sectionTitle = lang === 'tr' ? 'Faydalı Linkler' : 'Useful Links'
          if (sectionKey === 'about')
            sectionTitle = lang === 'tr' ? 'Hakkımızda' : 'About Us'

          return (
            <div key={sectionKey} className='text-center md:text-left'>
              <h3 className='text-gray-900 dark:text-white font-bold mb-6 text-lg tracking-wide'>
                {sectionTitle}
              </h3>
              <ul className='space-y-3 text-sm text-gray-500 dark:text-gray-400'>
                {sectionLinks?.map((l, i) => (
                  <li key={i}>
                    <Link
                      href={l.url}
                      className='hover:text-primary hover:pl-2 transition-all duration-200 block'
                    >
                      {l.title}
                    </Link>
                  </li>
                ))}
                {(!sectionLinks || sectionLinks.length === 0) && !isLoading && (
                  <li>-</li>
                )}
              </ul>
            </div>
          )
        })}
      </div>

      {/* 4. İLETİŞİM & ALT BİLGİ */}
      <div className='border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-black/20'>
        <div className='max-w-7xl mx-auto px-6 py-8'>
          {/* İletişim Bilgileri */}
          <div className='flex flex-col md:flex-row justify-between items-center gap-6 mb-8 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/5 pb-8 w-full'>
            {settings?.address && (
              <div className='flex items-center gap-3'>
                <FaMapMarkerAlt className='text-primary' />
                <span>{settings.address}</span>
              </div>
            )}
            {settings?.phone && (
              <div className='flex items-center gap-3'>
                <FaPhone className='text-primary' />
                <a
                  href={`tel:${settings.phone}`}
                  className='hover:text-gray-900 dark:hover:text-white transition-colors'
                >
                  {settings.phone}
                </a>
              </div>
            )}
            {settings?.email && (
              <div className='flex items-center gap-3'>
                <FaEnvelope className='text-primary' />
                <a
                  href={`mailto:${settings.email}`}
                  className='hover:text-gray-900 dark:hover:text-white transition-colors'
                >
                  {settings.email}
                </a>
              </div>
            )}
          </div>

          <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
            <p className='text-xs text-gray-500 text-center md:text-left'>
              © {new Date().getFullYear()}{' '}
              <strong className='text-gray-700 dark:text-gray-300'>
                {settings?.site_name}
              </strong>
              . {uiText.rightsReserved}
            </p>
            <div className='opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500'>
              <Image
                src='/payment.png'
                width={250}
                height={30}
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
