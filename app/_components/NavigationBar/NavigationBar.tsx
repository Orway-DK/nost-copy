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

export default function NavigationBar () {
  const { lang } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Çok dilli etiketleri ve linkleri tek bir hook içinde topladık
  const menuData = useMemo(() => {
    const t = (tr: string, en: string, de: string) =>
      lang === 'tr' ? tr : lang === 'de' ? de : en

    return {
      home: { label: t('Anasayfa', 'Home', 'Startseite'), href: '/home' },
      about: { label: t('Hakkımızda', 'About Us', 'Über uns'), href: '/about' },
      contact: { label: t('İletişim', 'Contact', 'Kontakt'), href: '/contact' },
      //blog: { label: 'Blog', href: '/blog' },
      labels: {
        categories: t('Kategoriler', 'Categories', 'Kategorien'),
        services: t('Hizmetler', 'Services', 'Dienstleistungen'),
        empty: t('Veri Yok', 'No Data', 'Keine Daten'),
        error: t('Hata', 'Error', 'Fehler')
      }
    }
  }, [lang])

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
    { revalidateOnFocus: false, suspense: true }
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

  return (
    <>
      <div className='w-full flex justify-center backdrop-blur-md  border-b border-border/40 sticky top-0 z-50 transition-all duration-300
      shadow-primary/20 shadow-md'>
        <nav className='relative w-full max-w-7xl h-20 md:h-24 flex items-center justify-between px-4 lg:px-6 xl:px-0 font-sans font-medium'>
          <div className='text-2xl md:text-3xl font-bold tracking-tight text-primary z-50'>
            <Link href='/home' onClick={closeMobileMenu}>
              {siteName}
            </Link>
          </div>

          {/* MASAÜSTÜ MENÜ - SIRALAMA GÜNCELLENDİ */}
          <ul className='hidden lg:flex space-x-6 xl:space-x-8 items-center text-sm font-bold'>
            <li className='text-foreground/80 hover:text-primary transition-colors'>
              <Link href={menuData.home.href}>{menuData.home.label}</Link>
            </li>
            <li className='text-foreground/80 hover:text-primary transition-colors'>
              <Link href={menuData.about.href}>{menuData.about.label}</Link>
            </li>

            {/* Dinamik Dropdown'lar Ortada */}
            <li>
              <Dropdown
                label={menuData.labels.services}
                items={serviceItems}
                emptyLabel={menuData.labels.empty}
                errorLabel={menuData.labels.error}
              />
            </li>
            <li>
              <Dropdown
                label={menuData.labels.categories}
                items={categoryItems}
                emptyLabel={menuData.labels.empty}
                errorLabel={menuData.labels.error}
              />
            </li>

            {/* İletişim ve Blog En Sonda 
            <li className='text-foreground/80 hover:text-primary transition-colors'>
              <Link href={menuData.blog.href}>{menuData.blog.label}</Link>
            </li>
            */}
            <li className='text-foreground/80 hover:text-primary transition-colors'>
              <Link href={menuData.contact.href}>{menuData.contact.label}</Link>
            </li>
          </ul>

          <button
            className='lg:hidden text-2xl text-foreground p-2 z-50 focus:outline-none hover:bg-muted/20 rounded-md transition-colors'
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <SlClose /> : <SlMenu />}
          </button>
        </nav>
      </div>

      {/* MOBİL MENÜ - SIRALAMA GÜNCELLENDİ */}
      <div
        className={`fixed inset-0 z-40 bg-background/95 backdrop-blur-xl flex flex-col pt-32 px-6 gap-8 overflow-y-auto transition-all duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen
            ? 'opacity-100 visible translate-y-0'
            : 'opacity-0 invisible -translate-y-5 pointer-events-none'
        }`}
      >
        <div className='flex flex-col gap-4'>
          <Link
            href={menuData.home.href}
            onClick={closeMobileMenu}
            className='text-2xl font-bold text-foreground border-b border-border/30 pb-3 hover:text-primary'
          >
            {menuData.home.label}
          </Link>
          <Link
            href={menuData.about.href}
            onClick={closeMobileMenu}
            className='text-2xl font-bold text-foreground border-b border-border/30 pb-3 hover:text-primary'
          >
            {menuData.about.label}
          </Link>
        </div>

        {/* Mobil Hizmetler */}
        <div className='flex flex-col gap-3'>
          <div className='text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1'>
            {menuData.labels.services}
          </div>
          {serviceItems.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              onClick={closeMobileMenu}
              className='text-lg text-foreground/90 pl-3 border-l-2 border-border/40 hover:border-primary py-1'
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Mobil Kategoriler */}
        <div className='flex flex-col gap-3'>
          <div className='text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1'>
            {menuData.labels.categories}
          </div>
          {categoryItems.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              onClick={closeMobileMenu}
              className='text-lg text-foreground/90 pl-3 border-l-2 border-border/40 hover:border-primary py-1'
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className='flex flex-col gap-4 pb-10'>
          {/* Mobil Alt Linkler (Blog & İletişim)
          <Link
            href={menuData.blog.href}
            onClick={closeMobileMenu}
            className='text-2xl font-bold text-foreground border-b border-border/30 pb-3 hover:text-primary'
          >
            {menuData.blog.label}
          </Link>
           */}
          <Link
            href={menuData.contact.href}
            onClick={closeMobileMenu}
            className='text-2xl font-bold text-foreground border-b border-border/30 pb-3 hover:text-primary'
          >
            {menuData.contact.label}
          </Link>
        </div>
      </div>
    </>
  )
}
