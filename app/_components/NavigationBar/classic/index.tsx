// app/_components/NavigationBar/classic/index.tsx
'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { SlMenu, SlClose } from 'react-icons/sl'
import { useLanguage } from '@/components/LanguageProvider'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import NavDropdown, { DropdownItem } from './NavDropdown'

// --- TİP TANIMLARI ---
type NavigationItemDB = {
  id: number
  parent_id: number | null
  type: 'link' | 'dropdown' | 'dynamic_categories' | 'dynamic_services'
  label: Record<string, string>
  url: string | null
  sort_order: number
}

// Render için kullanılacak Ağaç Yapısı
type NavTreeNode = NavigationItemDB & {
  children: NavTreeNode[]
}

// --- DATA FETCHING ---
const fetchNavigationStructure = async () => {
  const supabase = createSupabaseBrowserClient()
  const { data } = await supabase
    .from('classic_navigation_items')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  return (data ?? []) as NavigationItemDB[]
}

const fetchCategories = async (lang: string) => {
  const supabase = createSupabaseBrowserClient()
  const { data } = await supabase
    .from('categories')
    .select(
      'id, parent_id, slug, sort, active, category_translations(name, lang_code)'
    )
    .eq('active', true)
    .order('sort', { ascending: true })
  return data || []
}

const fetchServices = async () => {
  const supabase = createSupabaseBrowserClient()
  const { data } = await supabase
    .from('services')
    .select('id, slug, service_translations(title, lang_code)')
    .eq('active', true)
    .order('id', { ascending: true })
  return data || []
}

const fetchSiteName = async () => {
  const supabase = createSupabaseBrowserClient()
  const { data } = await supabase
    .from('site_settings')
    .select('site_name')
    .maybeSingle()
  return data?.site_name || 'Nost Copy'
}

export default function NavigationBar () {
  const { lang } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  const { data: rawNavItems } = useSWR(
    'nav_structure_v2',
    fetchNavigationStructure,
    { revalidateOnFocus: false }
  )
  const { data: categories, isLoading: catLoading } = useSWR(
    ['categories-nav', lang],
    () => fetchCategories(lang),
    { revalidateOnFocus: false }
  )
  const { data: services } = useSWR('services-nav', fetchServices, {
    revalidateOnFocus: false
  })
  const { data: siteName = 'Nost Copy' } = useSWR('site_name', fetchSiteName)

  // --- DİNAMİK VERİ HAZIRLAMA ---
  const dynamicCategoryItems: DropdownItem[] = useMemo(() => {
    if (!categories) return []
    return categories
      .filter(c => c.parent_id === null)
      .sort((a, b) => (a.sort || 0) - (b.sort || 0))
      .slice(0, 8)
      .map(c => ({
        label:
          (
            c.category_translations.find((t: any) => t.lang_code === lang) ||
            c.category_translations[0]
          )?.name || c.slug,
        href: `/${c.slug}`
      }))
  }, [categories, lang])

  const dynamicServiceItems: DropdownItem[] = useMemo(() => {
    if (!services) return []
    return services.map((s: any) => ({
      label:
        (
          s.service_translations.find((t: any) => t.lang_code === lang) ||
          s.service_translations[0]
        )?.title || s.slug,
      href: `/services/${s.slug}`
    }))
  }, [services, lang])

  // --- AĞAÇ YAPISINI OLUŞTURMA (Tree Builder) ---
  const navTree = useMemo(() => {
    if (!rawNavItems) return []

    const itemMap = new Map<number, NavTreeNode>()
    const roots: NavTreeNode[] = []

    // 1. Tüm öğeleri Map'e at ve children array'i başlat
    rawNavItems.forEach(item => {
      itemMap.set(item.id, { ...item, children: [] })
    })

    // 2. İlişkileri kur
    rawNavItems.forEach(item => {
      const node = itemMap.get(item.id)!
      if (item.parent_id === null) {
        roots.push(node)
      } else {
        const parent = itemMap.get(item.parent_id)
        if (parent) {
          parent.children.push(node)
        } else {
          // Babası yoksa (silinmişse) root gibi davranmasın
        }
      }
    })

    // 3. Sıralama (Sort Order)
    const sortNodes = (nodes: NavTreeNode[]) => {
      nodes.sort((a, b) => a.sort_order - b.sort_order)
      nodes.forEach(node => sortNodes(node.children))
    }
    sortNodes(roots)

    return roots
  }, [rawNavItems])

  // --- MENU RENDER MANTIĞI ---
  const renderMenuItem = (item: NavTreeNode, isMobile = false) => {
    const label =
      item.label[lang] || item.label['en'] || item.label['tr'] || 'Menu'

    // 1. LINK TİPİ
    if (item.type === 'link') {
      const href = item.url || '#'
      if (isMobile) {
        return (
          <Link
            key={item.id}
            href={href}
            onClick={() => setMobileMenuOpen(false)}
            className='text-xl font-bold text-foreground border-b border-border/30 pb-3 hover:text-primary block'
          >
            {label}
          </Link>
        )
      }

      // --- GÜNCELLENEN KISIM BURASI (MASAÜSTÜ) ---
      // NavDropdown'daki stilin aynısını buraya uyguladık.
      return (
        <li key={item.id} className='h-full flex items-center'>
          <Link
            href={href}
            className={`
              flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold font-sans transition-all duration-200
              text-foreground/80 hover:text-primary hover:bg-muted/30
            `}
          >
            {label}
          </Link>
        </li>
      )
    }

    // 2. DROPDOWN TİPLERİ (Manuel, Kategori, Servis)
    let dropdownItems: DropdownItem[] = []
    let isLoading = false

    if (item.type === 'dynamic_categories') {
      dropdownItems = [
        ...dynamicCategoryItems,
        { label: 'Tümünü Gör →', href: '/c' }
      ]
      isLoading = catLoading
    } else if (item.type === 'dynamic_services') {
      dropdownItems = dynamicServiceItems
    } else if (item.type === 'dropdown') {
      // Manuel Dropdown'ın çocuklarını formatla
      dropdownItems = item.children.map(child => ({
        label: child.label[lang] || child.label['tr'],
        href: child.url || '#'
      }))
    }

    if (isMobile) {
      return (
        <div key={item.id} className='flex flex-col gap-2'>
          <div className='text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2 mb-1'>
            {label}
          </div>
          {dropdownItems.map((sub, i) => (
            <Link
              key={i}
              href={sub.href}
              onClick={() => setMobileMenuOpen(false)}
              className='text-lg text-foreground/90 pl-3 border-l-2 border-border/40 hover:border-primary py-1 block'
            >
              {sub.label}
            </Link>
          ))}
        </div>
      )
    }

    return (
      <li key={item.id} className='h-full flex items-center'>
        <NavDropdown
          label={label}
          items={dropdownItems}
          isLoading={isLoading}
        />
      </li>
    )
  }

  return (
    <>
      <div className='w-full flex justify-center backdrop-blur-md border-b border-border/40 sticky top-0 z-50 transition-all duration-300 shadow-sm bg-background/80'>
        <nav className='relative w-full max-w-7xl h-20 md:h-24 flex items-center justify-between px-4 lg:px-6 xl:px-0'>
          <div className='text-2xl md:text-3xl font-black tracking-tighter text-foreground z-50'>
            <Link href='/home' onClick={() => setMobileMenuOpen(false)}>
              {siteName}
            </Link>
          </div>

          {/* Masaüstü Menü */}
          <ul className='hidden lg:flex space-x-2 xl:space-x-3 items-center text-sm font-bold h-full'>
            {navTree.map(item => renderMenuItem(item, false))}
          </ul>

          <button
            className='lg:hidden text-2xl text-foreground p-2 z-50 focus:outline-none hover:bg-muted/20 rounded-md transition-colors'
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <SlClose /> : <SlMenu />}
          </button>
        </nav>
      </div>

      <div
        className={`fixed inset-0 z-40 bg-background/98 backdrop-blur-xl flex flex-col pt-32 px-6 gap-6 overflow-y-auto transition-all duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen
            ? 'opacity-100 visible translate-y-0'
            : 'opacity-0 invisible -translate-y-5 pointer-events-none'
        }`}
      >
        {navTree.map(item => renderMenuItem(item, true))}
      </div>
    </>
  )
}
