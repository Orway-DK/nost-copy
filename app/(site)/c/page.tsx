// app/(site)/c/page.tsx - Tüm Ürünler Sayfası
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server-client'
import { FaBoxes, FaChevronRight, FaExclamationTriangle } from 'react-icons/fa'
import ProductCard from '@/app/_components/ProductCard'

export const dynamic = 'force-dynamic'

// Tip Tanımlamaları
type LocalizationRow = {
  lang_code: string
  name: string
  description?: string | null
}
type MediaRow = { image_key: string; sort_order: number }
type PriceRow = { amount: number; currency: string }
type VariantRow = { product_prices: PriceRow[] | null }
type ProductRow = {
  id: number
  slug: string
  active: boolean
  attributes: Record<string, string[] | string> | null
  product_localizations: LocalizationRow[] | null
  product_media: MediaRow[]
  product_variants: VariantRow[]
}

export default async function AllProductsPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const langRaw = sp?.lang
  const lang = Array.isArray(langRaw) ? langRaw[0] : langRaw || 'tr'

  const supabase = await createSupabaseServerClient()

  // Tüm aktif ürünleri getir
  const { data: productsData, error } = await supabase
    .from('products')
    .select(`
      id, slug, active, attributes,
      product_localizations ( lang_code, name, description ),
      product_media ( image_key, sort_order ),
      product_variants ( product_prices ( amount, currency ) )
    `)
    .eq('active', true)
    .order('id', { ascending: false })

  if (error) {
    console.error('Ürün verisi alınamadı:', error)
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center p-8 bg-destructive/10 border border-destructive/20 rounded-xl">
          <FaExclamationTriangle className="text-3xl text-destructive mb-3 mx-auto" />
          <h1 className="text-xl font-bold text-destructive mb-2">Hata</h1>
          <p className="text-muted-foreground">Ürünler yüklenirken bir hata oluştu.</p>
        </div>
      </div>
    )
  }

  const productList = (productsData || []) as ProductRow[]

  // Ürünleri işle
  const displayItems = productList.map(p => {
    const loc =
      p.product_localizations?.find(l => l.lang_code === lang) ||
      p.product_localizations?.[0] ||
      null

    let imageUrl = null
    if (p.product_media && p.product_media.length > 0) {
      const firstMedia = p.product_media.sort(
        (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
      )[0]
      const imgKey = firstMedia.image_key || ''
      if (imgKey.startsWith('http')) {
        if (imgKey.includes('supabase.co')) imageUrl = imgKey
      } else if (imgKey.startsWith('/')) {
        imageUrl = imgKey
      } else {
        const projectUrl =
          process.env.NEXT_PUBLIC_SUPABASE_URL ||
          'fdhmxyqxkezkfmcjaanz.supabase.co'
        imageUrl = `${projectUrl}/storage/v1/object/public/products/${imgKey}`
      }
    }

    let minPrice: number | null = null
    if (p.product_variants && p.product_variants.length > 0) {
      p.product_variants.forEach(variant => {
        variant.product_prices?.forEach(price => {
          if (
            price.amount &&
            (minPrice === null || price.amount < minPrice)
          ) {
            minPrice = price.amount
          }
        })
      })
    }

    return {
      slug: p.slug,
      name: loc?.name || p.slug,
      description: loc?.description || null,
      imageUrl: imageUrl,
      price: minPrice,
      attributes: p.attributes
    }
  })

  // Breadcrumb metinleri
  const breadcrumbTexts = {
    home: lang === 'tr' ? 'Ana Sayfa' : lang === 'de' ? 'Startseite' : 'Home',
    allProducts: lang === 'tr' ? 'Tüm Ürünler' : lang === 'de' ? 'Alle Produkte' : 'All Products'
  }

  // Sayfa başlığı
  const pageTitle = lang === 'tr' ? 'Tüm Baskı Ürünleri' : lang === 'de' ? 'Alle Druckprodukte' : 'All Printing Products'

  return (
    <div className="min-h-screen w-full text-foreground transition-colors duration-300">
      {/* Breadcrumb */}
      <div className="border-b border-border w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3 pt-4">
          <nav className="flex items-center text-xs text-muted-foreground gap-2" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary transition-colors">
              {breadcrumbTexts.home}
            </Link>
            <FaChevronRight size={8} />
            <span className="font-semibold text-foreground">{breadcrumbTexts.allProducts}</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 border-b border-border/50 pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground uppercase">
              {pageTitle}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {displayItems.length} ürün listeleniyor
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FaBoxes className="text-primary text-xl" />
            </div>
          </div>
        </div>

        {/* Ürün Grid */}
        {displayItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-xl bg-card/30">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
              <FaBoxes className="text-3xl" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              Ürün Bulunamadı
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Henüz aktif ürün bulunmuyor.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {displayItems.map(item => (
              <ProductCard key={item.slug} {...item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export async function generateMetadata() {
  return {
    title: 'Tüm Baskı Ürünleri | Nost Copy',
    description: 'Tüm baskı ürünlerini keşfedin. Her türlü baskı ürünü için doğru ürünü bulun.'
  }
}
