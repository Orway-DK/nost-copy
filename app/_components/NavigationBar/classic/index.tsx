'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { SlMenu, SlClose } from 'react-icons/sl'
import { useLanguage } from '@/components/LanguageProvider'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import NavDropdown, { DropdownItem } from './NavDropdown'

type NavigationItemDB = {
  id: number
  parent_id: number | null
  type: 'link' | 'dropdown' | 'dynamic_services' | 'dynamic_categories'
  label: Record<string, string>
  url: string | null
  sort_order: number
}

type NavTreeNode = NavigationItemDB & {
  children: NavTreeNode[]
}

export default function NavigationBar () {
  const { lang } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [navTree, setNavTree] = useState<NavTreeNode[]>([])
  const [servicePages, setServicePages] = useState<any[]>([])
  const [corporatePages, setCorporatePages] = useState<any[]>([])
  const [productPages, setProductPages] = useState<any[]>([])
  const [siteName, setSiteName] = useState('Nost Copy')

  useEffect(() => {
    async function initData () {
      const supabase = createSupabaseBrowserClient()

      // 1. Menü Yapısını Çek
      const { data: navItems } = await supabase
        .from('classic_navigation_items')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      // 2. Hizmet Sayfalarını Çek (Sluglar dahil) - Yeni tablo
      const { data: serviceItems } = await supabase
        .from('nost-service-pages')
        .select('slug, nost_service_page_translations(title, slug, lang_code)')
        .eq('active', true)
        .order('id', { ascending: true })

      // 3. Kurumsal Sayfaları Çek
      const { data: corporateItems } = await supabase
        .from('nost-corporate-pages')
        .select('slug, nost_corporate_page_translations(title, slug, lang_code)')
        .eq('active', true)
        .order('id', { ascending: true })

      // 4. Ürün Sayfalarını Çek
      const { data: productItems } = await supabase
        .from('nost-product-pages')
        .select('slug, nost_product_page_translations(title, slug, lang_code)')
        .eq('active', true)
        .order('id', { ascending: true })

      // 5. Site Adını Çek
      const { data: settings } = await supabase
        .from('site_settings')
        .select('site_name')
        .maybeSingle()

      if (settings) setSiteName(settings.site_name)
      /*console.log('serviceItems:', serviceItems)
      console.log('productItems:', productItems)
      console.log('corporateItems:', corporateItems)*/
      if (serviceItems) setServicePages(serviceItems)
      if (corporateItems) setCorporatePages(corporateItems)
      if (productItems) setProductPages(productItems)

      if (navItems) {
        const itemMap = new Map<number, NavTreeNode>()
        const roots: NavTreeNode[] = []

        navItems.forEach((item: NavigationItemDB) => {
          itemMap.set(item.id, { ...item, children: [] })
        })

        navItems.forEach((item: NavigationItemDB) => {
          const node = itemMap.get(item.id)!
          if (item.parent_id === null) {
            roots.push(node)
          } else {
            const parent = itemMap.get(item.parent_id)
            if (parent) parent.children.push(node)
          }
        })

        const sortNodes = (nodes: NavTreeNode[]) => {
          nodes.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
          nodes.forEach(n => sortNodes(n.children))
        }
        sortNodes(roots)
        setNavTree(roots)
      }
    }

    initData()
  }, [lang])

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset'
  }, [mobileMenuOpen])

  const renderMenuItem = (item: NavTreeNode, isMobile = false) => {
    const label = item.label[lang] || item.label['tr'] || 'Menu'

    // 1. DİNAMİK SERVİSLER / KURUMSAL / ÜRÜNLER
    if (item.type === 'dynamic_services' || item.type === 'dynamic_categories') {
      // Hangi listeyi kullanacağız? item.id'ye göre belirle
      let sourceList: any[] = []
      if (item.id === 3) {
        // Hizmetler
        sourceList = servicePages
      } else if (item.id === 50) {
        // Ürünler
        sourceList = productPages
      } else {
        // Varsayılan: Kurumsal sayfalar (id=6 veya diğer)
        sourceList = corporatePages
      }

      const dropdownItems: DropdownItem[] = sourceList.map((s: any) => {
        // Çeviri tablosu adını belirle
        const translations = s.nost_service_page_translations || s.nost_corporate_page_translations || s.nost_product_page_translations || []
        // Dil bazlı çeviriyi bul
        const trans =
          translations.find((t: any) => t.lang_code === lang) ||
          translations.find((t: any) => t.lang_code === 'en') ||
          translations[0]
        // Slug: önce trans'ın slug'ı, yoksa ana slug (ana slug Türkçe olabilir)
        const targetSlug = trans?.slug || s.slug

        return {
          label: trans?.title || s.slug,
          // Dil bazlı slug kullan, dil prefix'i yok (dil cookie'den alınıyor)
          href: `/${targetSlug.replace(/^\//, '')}`
        }
      })

      if (isMobile) {
        return (
          <div key={item.id} className='flex flex-col gap-2'>
            <div className='text-xs font-bold text-muted-foreground uppercase tracking-widest mt-4 mb-1 pl-1'>
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
          <NavDropdown label={label} items={dropdownItems} />
        </li>
      )
    }

    // 2. NORMAL DROPDOWN
    if (item.children.length > 0) {
      const dropdownItems: DropdownItem[] = item.children.map(child => ({
        label: child.label[lang] || child.label['tr'],
        href: child.url?.startsWith('/') ? child.url : `/${child.url}`
      }))

      if (isMobile) {
        return (
          <div key={item.id} className='flex flex-col gap-2'>
            <div className='text-xs font-bold text-muted-foreground uppercase tracking-widest mt-4 mb-1 pl-1'>
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
          <NavDropdown label={label} items={dropdownItems} />
        </li>
      )
    }

    // 3. STANDART LİNK
    let href = item.url || '#'
    if (href !== '#' && !href.startsWith('/')) href = '/' + href

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

    return (
      <li key={item.id} className='h-full flex items-center'>
        <Link
          href={href}
          className='flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold font-sans text-foreground/80 hover:text-primary hover:bg-muted/30 transition-all'
        >
          {label}
        </Link>
      </li>
    )
  }

  return (
    <>
      <div className='w-full flex justify-center backdrop-blur-md border-b border-border/40 sticky top-0 z-50 bg-background/80'>
        <nav className='relative w-full max-w-7xl h-20 md:h-24 flex items-center justify-between px-4 lg:px-6 xl:px-0'>
          <div className='text-2xl md:text-3xl font-black tracking-tighter text-foreground z-50'>
            <Link href='/' onClick={() => setMobileMenuOpen(false)}>
              {siteName}
            </Link>
          </div>

          <ul className='hidden lg:flex space-x-1 items-center h-full'>
            {navTree.map(item => renderMenuItem(item, false))}
          </ul>

          <button
            className='lg:hidden text-2xl text-foreground p-2 z-50 focus:outline-none'
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
