'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { SlMenu, SlClose } from 'react-icons/sl'
import { useLanguage } from '@/components/LanguageProvider'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import Dropdown from './_components/Dropdown'

// --- TİP TANIMLARI ---
type CategoryRow = {
  id: number
  parent_id: number | null
  slug: string
  category_translations: { name: string; lang_code: string }[]
}

type ServiceRow = {
  id: number
  slug: string
  service_translations: { title: string; lang_code: string }[]
}

// --- DATA FETCHING ---
const fetchCategories = async (lang: string) => {
  const supabase = createSupabaseBrowserClient()
  const { data } = await supabase
    .from('categories')
    .select('id, parent_id, slug, category_translations(name, lang_code)')
    .eq('active', true)
    .order('slug', { ascending: true })
  return (data ?? []) as CategoryRow[]
}

const fetchServices = async () => {
  const supabase = createSupabaseBrowserClient()
  const { data } = await supabase
    .from('services')
    .select('id, slug, service_translations(title, lang_code)')
    .eq('active', true)
    .order('id', { ascending: true })
  return (data ?? []) as ServiceRow[]
}

const fetchSiteName = async () => {
  const supabase = createSupabaseBrowserClient()
  const { data } = await supabase
    .from('site_settings')
    .select('site_name')
    .limit(1)
    .maybeSingle()
  return data?.site_name || 'Nost Copy'
}

function useStaticMenu (lang: string) {
  return useMemo(() => {
    const t = (tr: string, en: string, de: string) =>
      lang === 'tr' ? tr : lang === 'de' ? de : en

    return [
      { label: t('Anasayfa', 'Home', 'Startseite'), href: '/home' },
      { label: t('Hakkımızda', 'About Us', 'Über uns'), href: '/about' },
      { label: t('İletişim', 'Contact', 'Kontakt'), href: '/contact' }
    ]
  }, [lang])
}

export default function NavigationBar () {
  const { lang } = useLanguage()
  const staticMenu = useStaticMenu(lang)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Mobil menü açıldığında body scroll'u kilitle
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  const { data: categories } = useSWR(
    ['categories-nav', lang],
    () => fetchCategories(lang),
    {
      revalidateOnFocus: false,
      suspense: true
    }
  )
  const { data: services } = useSWR('services-nav', fetchServices, {
    revalidateOnFocus: false,
    suspense: true
  })
  const { data: siteName = 'Nost Copy' } = useSWR('site_name', fetchSiteName, {
    revalidateOnFocus: false,
    suspense: true
  })

  const closeMobileMenu = () => setMobileMenuOpen(false)

  const categoryItems = useMemo(() => {
    if (!categories) return []
    return categories.map(c => {
      const tr =
        c.category_translations.find(t => t.lang_code === lang) ||
        c.category_translations.find(t => t.lang_code === 'tr')
      return { label: tr?.name || c.slug, href: `/collections/${c.slug}` }
    })
  }, [categories, lang])

  const serviceItems = useMemo(() => {
    if (!services) return []
    return services.map(s => {
      const translation =
        s.service_translations.find(t => t.lang_code === lang) ||
        s.service_translations.find(t => t.lang_code === 'en') ||
        s.service_translations[0]
      return {
        label: translation?.title || s.slug,
        href: `/services/${s.slug}`
      }
    })
  }, [services, lang])

  const labels = useMemo(() => {
    const isTr = lang === 'tr'
    const isDe = lang === 'de'
    return {
      categories: isTr ? 'Kategoriler' : isDe ? 'Kategorien' : 'Categories',
      services: isTr ? 'Hizmetler' : isDe ? 'Dienstleistungen' : 'Services',
      empty: isTr ? 'Veri Yok' : isDe ? 'Keine Daten' : 'No Data',
      error: isTr ? 'Hata' : isDe ? 'Fehler' : 'Error',
      blog: 'Blog'
    }
  }, [lang])

  return (
    <>
      {/* DÜZELTME 1: Navbar Kapsayıcısı (Sticky Header)
        backdrop-blur burada kalıyor ama menü buradan çıkarıldı.
      */}
      <div className='w-full flex justify-center bg-background/80 backdrop-blur-md border-b border-border/40 shadow-sm sticky top-0 z-50 transition-all duration-300'>
        <nav className='relative w-full max-w-7xl h-20 md:h-24 flex items-center justify-between px-4 md:px-0 font-sans font-medium'>
          {/* LOGO */}
          <div className='text-2xl md:text-3xl font-bold tracking-tight text-primary z-50'>
            <Link href='/home' onClick={closeMobileMenu}>
              {siteName}
            </Link>
          </div>

          {/* DESKTOP MENU */}
          <ul className='hidden md:flex space-x-8 items-center text-sm font-bold'>
            {staticMenu.map((item, i) => (
              <li
                key={i}
                className='text-foreground/80 hover:text-primary transition-colors'
              >
                <Link href={item.href!}>{item.label}</Link>
              </li>
            ))}

            <li>
              <Dropdown
                label={labels.services}
                items={serviceItems}
                emptyLabel={labels.empty}
                errorLabel={labels.error}
              />
            </li>
            <li>
              <Dropdown
                label={labels.categories}
                items={categoryItems}
                emptyLabel={labels.empty}
                errorLabel={labels.error}
              />
            </li>
            <li className='text-foreground/80 hover:text-primary transition-colors'>
              <Link href='/blog'>{labels.blog}</Link>
            </li>
          </ul>

          {/* MOBILE HAMBURGER BUTTON */}
          <button
            className='md:hidden text-2xl text-foreground p-2 z-50 focus:outline-none hover:bg-muted/20 rounded-md transition-colors'
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <SlClose /> : <SlMenu />}
          </button>
        </nav>
      </div>

      {/* DÜZELTME 2: MOBİL MENÜ (PORTAL GİBİ DIŞARI ALINDI)
        Artık 'sticky' kapsayıcının dışında olduğu için tüm ekranı kaplayabilir.
        Z-Index 49 yapıldı (Header 50'de kalsın diye, butona basılabilsin).
      */}
      <div
        className={`fixed inset-0 z-40 bg-background/95 backdrop-blur-xl flex flex-col pt-32 px-6 gap-8 overflow-y-auto transition-all duration-300 ease-in-out md:hidden ${
          mobileMenuOpen
            ? 'opacity-100 visible translate-y-0'
            : 'opacity-0 invisible -translate-y-5 pointer-events-none'
        }`}
      >
        {/* Statik Linkler */}
        <div className='flex flex-col gap-4'>
          {staticMenu.map((item, i) => (
            <Link
              key={i}
              href={item.href!}
              onClick={closeMobileMenu}
              className='text-2xl font-bold text-foreground border-b border-border/30 pb-3 hover:text-primary transition-colors'
            >
              {item.label}
            </Link>
          ))}
          <Link
            href='/blog'
            onClick={closeMobileMenu}
            className='text-2xl font-bold text-foreground border-b border-border/30 pb-3 hover:text-primary transition-colors'
          >
            {labels.blog}
          </Link>
        </div>

        {/* Mobil Hizmetler */}
        <div className='flex flex-col gap-3'>
          <div className='text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1'>
            {labels.services}
          </div>
          {serviceItems.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              onClick={closeMobileMenu}
              className='text-lg text-foreground/90 pl-3 border-l-2 border-border/40 hover:border-primary hover:text-primary transition-all py-1'
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Mobil Kategoriler */}
        <div className='flex flex-col gap-3 pb-10'>
          <div className='text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1'>
            {labels.categories}
          </div>
          {categoryItems.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              onClick={closeMobileMenu}
              className='text-lg text-foreground/90 pl-3 border-l-2 border-border/40 hover:border-primary hover:text-primary transition-all py-1'
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
