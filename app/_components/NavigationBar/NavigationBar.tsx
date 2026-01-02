// C:\Projeler\nost-copy\app\_components\NavigationBar\NavigationBar.tsx
'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { SlMenu, SlClose } from 'react-icons/sl'
import { useLanguage } from '@/components/LanguageProvider'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import Dropdown from './_components/Dropdown'
import CategoriesDropdown from './_components/CategoriesDropdown'

// --- TİP TANIMLARI ---
type CategoryRow = {
  id: number
  parent_id: number | null
  slug: string
  sort: number
  active: boolean
  category_translations: { name: string; lang_code: string }[]
}

type ServiceRow = {
  id: number
  slug: string
  service_translations: { title: string; lang_code: string }[]
}

// Navigasyon ağacı için tip (Diğer bileşenlerde kullanmak üzere export edilebilir)
export type NavItem = {
  id: number
  label: string
  href: string
  children?: NavItem[]
}

// --- DATA FETCHING ---
const fetchCategories = async (lang: string) => {
  const supabase = createSupabaseBrowserClient()
  const { data } = await supabase
    .from('categories')
    .select('id, parent_id, slug, sort, active, category_translations(name, lang_code)')
    .eq('active', true)
    .order('sort', { ascending: true })
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

  // Dil verileri
  const menuData = useMemo(() => {
    const t = (tr: string, en: string, de: string) =>
      lang === 'tr' ? tr : lang === 'de' ? de : en

    return {
      home: { label: t('Anasayfa', 'Home', 'Startseite'), href: '/home' },
      about: { label: t('Hakkımızda', 'About Us', 'Über uns'), href: '/about' },
      contact: { label: t('İletişim', 'Contact', 'Kontakt'), href: '/contact' },
      labels: {
        categories: t('Kategoriler', 'Categories', 'Kategorien'),
        services: t('Hizmetler', 'Services', 'Dienstleistungen'),
        empty: t('Veri Yok', 'No Data', 'Keine Daten'),
        error: t('Hata', 'Error', 'Fehler')
      }
    }
  }, [lang])

  // Mobil menü açıldığında scroll kilitleme
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

  // Veri Çekme
  const {
    data: categories,
    isLoading: catLoading,
    error: catError
  } = useSWR(['categories-nav', lang], () => fetchCategories(lang), {
    revalidateOnFocus: false
  })

  const { data: services } = useSWR('services-nav', fetchServices, {
    revalidateOnFocus: false,
    suspense: true
  })

  const { data: siteName = 'Nost Copy' } = useSWR('site_name', fetchSiteName, {
    revalidateOnFocus: false,
    suspense: true
  })

  const closeMobileMenu = () => setMobileMenuOpen(false)

  // --- 1. MASAÜSTÜ İÇİN AĞAÇ YAPISI (HIERARCHY) ---
  const categoryTree = useMemo(() => {
    if (!categories) return []

    // Önce tüm kategorileri NavItem formatına çevir
    const mappedCategories = categories.map(c => {
      const tr =
        c.category_translations.find(t => t.lang_code === lang) ||
        c.category_translations.find(t => t.lang_code === 'tr')

      return {
        id: c.id,
        parent_id: c.parent_id,
        label: tr?.name || c.slug,
        href: `/${c.slug}`,
        children: [] as NavItem[]
      }
    })

    // Parent-Child ilişkisini kur
    const tree: NavItem[] = []
    const lookup = new Map(mappedCategories.map(c => [c.id, c]))

    // Özel düzenleme: Açık Hava (Display) (id:43) Kurumsal Ürünler (id:33) altına taşı
    const openAirItem = lookup.get(43)
    const corporateItem = lookup.get(33)
    if (openAirItem && corporateItem) {
      openAirItem.parent_id = 33
    }

    mappedCategories.forEach(cat => {
      if (cat.parent_id === null) {
        tree.push(cat)
      } else {
        const parent = lookup.get(cat.parent_id)
        if (parent) {
          parent.children!.push(cat)
        } else {
          // Babası yoksa root'a ekle (güvenlik için)
          tree.push(cat)
        }
      }
    })

    // Özel düzenleme: Max 6 ana kategori göster
    // Öncelik sırası: Kartvizit (22), Etiket & Sticker (36), Broşür & İlan (72) ilk sıralarda
    const priorityOrder = [22, 36, 72] // Kartvizit, Etiket & Sticker, Broşür & İlan
    
    // Ana kategorileri sırala
    const sortedTree = tree.sort((a, b) => {
      const aPriority = priorityOrder.indexOf(a.id)
      const bPriority = priorityOrder.indexOf(b.id)
      
      // Öncelikli kategoriler önce gelsin
      if (aPriority !== -1 && bPriority !== -1) {
        return aPriority - bPriority
      }
      if (aPriority !== -1) return -1
      if (bPriority !== -1) return 1
      
      // Diğerleri sort değerine göre sırala
      const catA = categories?.find(c => c.id === a.id)
      const catB = categories?.find(c => c.id === b.id)
      return (catA?.sort || 0) - (catB?.sort || 0)
    })

    // Max 6 kategori
    const limitedTree = sortedTree.slice(0, 6)

    console.log('categoryTree (limited to 6):', limitedTree)
    return limitedTree
  }, [categories, lang])

  // --- 2. MOBİL İÇİN DÜZ LİSTE (FLAT LIST) ---
  const categoryListMobile = useMemo(() => {
    if (!categories) return []
    
    // Ana kategorileri filtrele (parent_id: null) ve aktif olanları al
    const mainCategories = categories.filter(c => c.parent_id === null && c.active !== false)
    
    // Öncelik sırası: Kartvizit (22), Etiket & Sticker (36), Broşür & İlan (72) ilk sıralarda
    const priorityOrder = [22, 36, 72]
    
    // Ana kategorileri sırala
    const sortedCategories = mainCategories.sort((a, b) => {
      const aPriority = priorityOrder.indexOf(a.id)
      const bPriority = priorityOrder.indexOf(b.id)
      
      // Öncelikli kategoriler önce gelsin
      if (aPriority !== -1 && bPriority !== -1) {
        return aPriority - bPriority
      }
      if (aPriority !== -1) return -1
      if (bPriority !== -1) return 1
      
      // Diğerleri sort değerine göre sırala
      return (a.sort || 0) - (b.sort || 0)
    })
    
    // Max 6 kategori
    const limitedCategories = sortedCategories.slice(0, 6)
    
    const list = limitedCategories.map(c => {
      const tr =
        c.category_translations.find(t => t.lang_code === lang) ||
        c.category_translations.find(t => t.lang_code === 'tr')
      return { label: tr?.name || c.slug, href: `/${c.slug}` }
    })
    
    console.log('categoryListMobile (limited to 6):', list)
    return list
  }, [categories, lang])

  // --- HİZMETLER LİSTESİ ---
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
      <div className='w-full flex justify-center backdrop-blur-md border-b border-border/40 sticky top-0 z-50 transition-all duration-300 shadow-primary/20 shadow-md'>
        <nav className='relative w-full max-w-7xl h-20 md:h-24 flex items-center justify-between px-4 lg:px-6 xl:px-0 font-sans font-medium'>
          <div className='text-2xl md:text-3xl font-bold tracking-tight text-primary z-50'>
            <Link href='/home' onClick={closeMobileMenu}>
              {siteName}
            </Link>
          </div>

          {/* MASAÜSTÜ MENÜ */}
          <ul className='hidden lg:flex space-x-6 xl:space-x-8 items-center text-sm font-bold'>
            <li className='text-foreground/80 hover:text-primary transition-colors'>
              <Link href={menuData.home.href}>{menuData.home.label}</Link>
            </li>
            <li className='text-foreground/80 hover:text-primary transition-colors'>
              <Link href={menuData.about.href}>{menuData.about.label}</Link>
            </li>

            {/* Hizmetler Dropdown */}
            <li>
              <Dropdown
                label={menuData.labels.services}
                items={serviceItems}
                emptyLabel={menuData.labels.empty}
                errorLabel={menuData.labels.error}
              />
            </li>

            {/* Kategoriler Dropdown (AĞAÇ YAPISI) */}
            <li>
              <CategoriesDropdown
                label={menuData.labels.categories}
                items={categoryTree}
                loading={catLoading}
                error={!!catError}
                emptyLabel={menuData.labels.empty}
              />
            </li>

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

      {/* MOBİL MENÜ */}
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

        {/* Mobil Kategoriler (DÜZ LİSTE - Okunabilirlik için) */}
        <div className='flex flex-col gap-3'>
          <div className='text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1'>
            {menuData.labels.categories}
          </div>
          {/* Tüm Kategoriler Linki */}
          <Link
            href="/c"
            onClick={closeMobileMenu}
            className='text-lg font-bold text-primary pl-3 border-l-2 border-primary py-2 hover:border-primary-hover'
          >
            Tüm Kategoriler
          </Link>
          {categoryListMobile.map((item, i) => (
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
