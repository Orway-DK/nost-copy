'use client'

import { useMemo, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import useSWR from 'swr'
import { useLanguage } from '@/components/LanguageProvider'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { NavItem, ProductPreview } from './types'

import NavbarHeader from './NavbarHeader'
import MegaMenuItem from './MegaMenuItem'
import MobileMenu from './MobileMenu'

// --- DATA FETCHING ---
const fetchCategories = async (lang: string) => {
  const supabase = createSupabaseBrowserClient()

  // Ürünleri çekerken filtre koymuyoruz, ilişkiden veri gelip gelmediğini görmek istiyoruz
  const { data, error } = await supabase
    .from('categories')
    .select(
      `
      id, parent_id, slug, image_path, sort, active,
      category_translations(name, lang_code),
      products (
        id, slug, active, category_slug,
        product_localizations(name, lang_code),
        product_media(image_key, sort_order),
        product_variants(product_prices(amount))
      )
    `
    )
    .eq('active', true)
    .order('sort', { ascending: true })

  if (error) {
    console.error('❌ [MegaNavbar] SQL Hatası:', error)
    return []
  }

  return (data ?? []) as any[]
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

export default function MegaNavbar () {
  const { lang } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // --- GÜNCELLENEN KISIM ---
  const t = useMemo(
    () => ({
      langCode: lang, // <-- Artık dil kodunu NavbarHeader'a gönderiyoruz
      searchPlaceholder:
        lang === 'tr' ? 'Ürün ara... (Örn: Kartvizit)' : 'Search products...',
      login: lang === 'tr' ? 'Giriş' : 'Login',
      cart: lang === 'tr' ? 'Sepet' : 'Cart',
      allProducts: lang === 'tr' ? 'Tüm Ürünler' : 'All Products'
    }),
    [lang]
  )
  // -------------------------

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  // SWR Key'ini değiştirdim: "v2-debug" (Cache'i yenilesin diye)
  const { data: categories } = useSWR(['categories-nav-v2-debug', lang], () =>
    fetchCategories(lang)
  )
  const { data: siteName = 'Nost Copy' } = useSWR('site_name', fetchSiteName)

  // --- LOGIC: VERİ İŞLEME ---
  const categoryTree = useMemo(() => {
    if (!categories) return []

    // DEBUG İÇİN: Konsola gelen veriyi yazdırıyoruz
    // F12 tuşuna basıp Console sekmesinden kontrol edebilirsin.
    console.log('📢 [MegaNavbar] Gelen Ham Veri:', categories)

    const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    // Helper: Ürün Dönüştürücü
    const transformProduct = (p: any): ProductPreview | null => {
      // Pasif ürünleri gizle (Null veya False ise)
      if (!p.active) return null

      const pLoc =
        p.product_localizations.find((l: any) => l.lang_code === lang) ||
        p.product_localizations[0]

      let imgUrl = null
      if (p.product_media && p.product_media.length > 0) {
        // En düşük sort_order'a sahip görseli al
        const firstMedia = p.product_media.sort(
          (a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)
        )[0]

        if (firstMedia?.image_key) {
          imgUrl = firstMedia.image_key.startsWith('http')
            ? firstMedia.image_key
            : `${projectUrl}/storage/v1/object/public/products/${firstMedia.image_key}`
        }
      }

      let price = 0
      if (p.product_variants?.[0]?.product_prices?.[0]?.amount) {
        price = p.product_variants[0].product_prices[0].amount
      }

      return {
        id: p.id,
        slug: p.slug,
        name: pLoc?.name || p.slug,
        image_url: imgUrl,
        price
      }
    }

    // 1. Kategorileri Map'le
    const mappedCategories = categories.map(c => {
      const tr =
        c.category_translations.find((t: any) => t.lang_code === lang) ||
        c.category_translations.find((t: any) => t.lang_code === 'tr')

      // Ürünleri dönüştür
      const products = (c.products || [])
        .map(transformProduct)
        .filter((p: any): p is ProductPreview => p !== null)

      return {
        id: c.id,
        parent_id: c.parent_id,
        label: tr?.name || c.slug,
        href: `/c/${c.slug}`,
        image_path: c.image_path,
        children: [] as NavItem[],
        previewProducts: products,
        allPreviewProducts: [] as ProductPreview[]
      }
    })

    // 2. Ağacı Kur
    const lookup = new Map(mappedCategories.map(c => [c.id, c]))
    const tree: NavItem[] = []

    mappedCategories.forEach(cat => {
      if (cat.parent_id === null) {
        tree.push(cat)
      } else {
        const parent = lookup.get(cat.parent_id)
        if (parent) {
          parent.children!.push(cat)
        } else {
          tree.push(cat)
        }
      }
    })

    // 3. Aggregation (En önemli kısım: Ürünleri ana kategoriye taşı)
    tree.forEach(rootCat => {
      // Kendi ürünlerini al
      let aggregated = [...(rootCat.previewProducts || [])]

      // Alt kategorilerin ürünlerini de ekle
      rootCat.children?.forEach(child => {
        if (child.previewProducts) {
          aggregated = [...aggregated, ...child.previewProducts]
        }
      })

      // Benzersiz ürünleri seç
      const uniqueProducts = Array.from(
        new Map(aggregated.map(item => [item.id, item])).values()
      )

      // Ana kategoriye ata
      rootCat.allPreviewProducts = uniqueProducts.slice(0, 8)
    })

    return tree
  }, [categories, lang])

  return (
    <div className='w-full flex flex-col bg-white dark:bg-zinc-950 shadow-sm sticky top-0 z-50 font-sans'>
      <NavbarHeader
        siteName={siteName}
        t={t}
        onMobileMenuOpen={() => setMobileMenuOpen(true)}
      />

      <div className='hidden lg:block bg-white dark:bg-zinc-950 border-b border-gray-100 dark:border-zinc-800 shadow-sm relative z-40'>
        <div className='container mx-auto'>
          <nav className='flex items-center justify-center'>
            {categoryTree.map(category => (
              <MegaMenuItem
                key={category.id}
                item={category}
                isActive={
                  pathname === category.href ||
                  pathname.startsWith(category.href + '/')
                }
                t={t}
              />
            ))}
          </nav>
        </div>
      </div>

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        siteName={siteName}
        categoryTree={categoryTree}
      />
    </div>
  )
}
