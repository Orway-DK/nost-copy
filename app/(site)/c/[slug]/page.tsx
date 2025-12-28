// C:\Projeler\nost-copy\app\(site)\c\[slug]\page.tsx

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server-client'
import {
  FaBoxOpen,
  FaExclamationTriangle,
  FaChevronRight,
  FaFilter,
  FaSortAmountDown
} from 'react-icons/fa'
import ProductCard from '@/app/_components/ProductCard'
import CollectionFilter from '../_components/CollectionFilter'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

// ... Tip Tanımlamaları ...
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

export default async function CollectionPage({
  params,
  searchParams
}: PageProps) {
  const { slug } = await params
  const sp = await searchParams
  const langRaw = sp.lang
  const lang = Array.isArray(langRaw) ? langRaw[0] : langRaw || 'tr'

  const minFilter = sp.min ? parseFloat(sp.min as string) : 0
  const maxFilter = sp.max ? parseFloat(sp.max as string) : Infinity

  const supabase = await createSupabaseServerClient()

  const { data: settings } = await supabase.from('site_settings').select('is_category_filters_active, is_category_sorting_active').maybeSingle();

  const showFilters = settings?.is_category_filters_active ?? true;
  const showSorting = settings?.is_category_sorting_active ?? true;

  // 1. Kategori
  const { data: category, error: catErr } = await supabase
    .from('categories')
    .select('id, slug, active, name')
    .eq('slug', slug)
    .single()

  if (catErr || !category || category.active === false) notFound()

  // 2. Mapping
  const { data: mapRows, error: mapErr } = await supabase
    .from('product_category_map')
    .select('product_id')
    .eq('category_slug', slug)

  if (mapErr)
    return (
      <ErrorState message='Kategori Eşleme Hatası' detail={mapErr.message} />
    )

  const mappedIds = (mapRows ?? []).map(r => r.product_id)
  const uniqueIds = new Set<number>(mappedIds)

  // 3. Primary Products
  const { data: primaryProducts } = await supabase
    .from('products')
    .select('id')
    .eq('category_slug', slug)

  primaryProducts?.forEach(p => uniqueIds.add(p.id))

  // --- ANA SORGU ---
  let productList: ProductRow[] = []

  if (uniqueIds.size > 0) {
    const { data: productsData, error: prodErr } = await supabase
      .from('products')
      .select(
        `
        id, slug, active, attributes,
        product_localizations ( lang_code, name, description ),
        product_media ( image_key, sort_order ),
        product_variants ( product_prices ( amount, currency ) )
      `
      )
      .in('id', Array.from(uniqueIds))
      .order('sort_order', {
        referencedTable: 'product_media',
        ascending: true
      })

    if (prodErr)
      return (
        <ErrorState message='Ürün Verisi Hatası' detail={prodErr.message} />
      )
    productList = (productsData ?? []) as any as ProductRow[]
  }

  const activeProducts = productList.filter(p => p.active)

  // --- OTOMATİK FİLTRE OLUŞTURUCU (Sayılı) ---
  const attributeCounts: Record<string, Record<string, number>> = {}

  activeProducts.forEach(p => {
    if (p.attributes && typeof p.attributes === 'object') {
      Object.entries(p.attributes).forEach(([key, values]) => {
        if (!attributeCounts[key]) attributeCounts[key] = {}
        const valArray = Array.isArray(values) ? values : [values as string]
        valArray.forEach(v => {
          attributeCounts[key][v] = (attributeCounts[key][v] || 0) + 1
        })
      })
    }
  })

  const dynamicFilters: Record<string, { name: string; count: number }[]> = {}

  Object.keys(attributeCounts).forEach(key => {
    const options = Object.entries(attributeCounts[key])
      .map(([name, count]) => ({
        name,
        count
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    dynamicFilters[key] = options
  })

  // --- ÜRÜN İŞLEME VE FİLTRELEME ---
  const displayItems = activeProducts
    .map(p => {
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
    .filter(item => {
      // Filtreler kapalıysa bile logic çalışır ama UI görünmez.
      // İstersen burayı da if(showFilters) içine alabilirsin ama URL parametresi varsa çalışması daha doğrudur.
      
      // 1. Fiyat Kontrolü
      const price = item.price || 0
      if ((minFilter > 0 || maxFilter < Infinity) && item.price) {
        if (price < minFilter || price > maxFilter) return false
      }

      // 2. Dinamik Özellik Kontrolü
      for (const [key, value] of Object.entries(sp)) {
        if (['min', 'max', 'lang'].includes(key)) continue

        const selectedOptions = (value as string).split(',')
        const productAttributeValues = item.attributes
          ? item.attributes[key]
          : null

        if (!productAttributeValues) return false

        const productValuesArray = Array.isArray(productAttributeValues)
          ? productAttributeValues
          : [productAttributeValues as string]

        const hasMatch = selectedOptions.some(opt =>
          productValuesArray.includes(opt)
        )

        if (!hasMatch) return false
      }

      return true
    })

  return (
    <div className='min-h-screen w-full text-foreground transition-colors duration-300'>
      {/* BREADCRUMB */}
      <div className='border-b border-border w-full'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3 pt-4'>
          <nav
            className='flex items-center text-xs text-muted-foreground gap-2'
            aria-label='Breadcrumb'
          >
            <Link href='/' className='hover:text-primary transition-colors'>
              Anasayfa
            </Link>
            <FaChevronRight size={8} />
            <Link
              href={`/c/${category.slug}`}
              className='font-semibold text-foreground capitalize hover:text-primary transition-colors'
            >
              {category.name || category.slug}
            </Link>
          </nav>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* HEADER */}
        <div className='flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 border-b border-border/50 pb-6'>
          <div>
            <h1 className='text-3xl md:text-4xl font-black tracking-tight text-foreground uppercase'>
              {category.name || category.slug}
            </h1>
            <p className='text-sm text-muted-foreground mt-1'>
              {displayItems.length} ürün listeleniyor
            </p>
          </div>
        <div className='flex items-center gap-2'>
            {showSorting && (
              <button className='flex items-center gap-2 px-4 py-2 ...'>
                <FaSortAmountDown className='text-muted-foreground' />
                <span>Önerilen Sıralama</span>
              </button>
            )}
          </div>
        </div>

        {/* LAYOUT */}
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
          
          {/* SIDEBAR - Koşullu Render */}
          {showFilters && (
            <div className='hidden lg:block lg:col-span-1'>
              <div className='sticky top-4'>
                <CollectionFilter dynamicFilters={dynamicFilters} />
              </div>
            </div>
          )}

          {/* PRODUCTS - Dinamik Kolon Genişliği */}
          <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
            
            {/* Mobil Filtre Butonu - Koşullu Render */}
            {showFilters && (
              <button className='lg:hidden w-full mb-4 py-3 flex items-center justify-center gap-2 bg-card border border-border rounded-lg font-bold shadow-sm'>
                <FaFilter /> Filtrele ve Sırala
              </button>
            )}

            {!displayItems.length ? (
              <div className='flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-xl bg-card/30'>
                <div className='w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground'>
                  <FaBoxOpen className='text-3xl' />
                </div>
                <h3 className='text-lg font-bold text-foreground'>
                  Sonuç Bulunamadı
                </h3>
                <p className='text-sm text-muted-foreground mt-1'>
                  Seçilen kriterlere uygun ürün bulunmuyor.
                </p>
              </div>
            ) : (
              // Eğer sidebar yoksa (col-span-4), grid 4'lü olabilir, varsa 3'lü.
              <div className={`grid grid-cols-2 gap-4 ${showFilters ? 'md:grid-cols-3 lg:gap-6' : 'md:grid-cols-3 lg:grid-cols-4 lg:gap-6'}`}>
                {displayItems.map(item => (
                  <ProductCard key={item.slug} {...item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ErrorState({ message, detail }: { message: string; detail: string }) {
  return (
    <div className='w-full min-h-[50vh] flex flex-col items-center justify-center p-6 text-center'>
      <div className='bg-destructive/10 text-destructive p-6 rounded-xl border border-destructive/20 max-w-md'>
        <FaExclamationTriangle className='text-3xl mb-3 mx-auto' />
        <h1 className='text-lg font-bold'>{message}</h1>
        <p className='text-xs mt-2 opacity-80 font-mono bg-black/10 p-2 rounded'>
          {detail}
        </p>
      </div>
    </div>
  )
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return {
    title: `${slug} | Nost Copy`,
    description: `${slug} kategorisindeki ürünleri inceleyin.`
  }
}