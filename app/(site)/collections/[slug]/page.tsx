// C:\Projeler\nost-copy\app\(site)\collections\[slug]\page.tsx
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server-client'
import { FaBoxOpen, FaExclamationTriangle } from 'react-icons/fa'
import ProductCard from '@/app/_components/ProductCard'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

// --- TİP TANIMLAMALARI ---
type LocalizationRow = {
  lang_code: string
  name: string
  description?: string | null
}

type MediaRow = {
  image_key: string
  sort_order: number
}

type PriceRow = {
  amount: number
  currency: string
}

type VariantRow = {
  product_prices: PriceRow[] | null
}

type ProductRow = {
  id: number
  slug: string
  active: boolean
  media_base_path: string | null
  product_localizations: LocalizationRow[] | null
  product_media: MediaRow[]
  product_variants: VariantRow[]
}

export default async function CollectionPage ({
  params,
  searchParams
}: PageProps) {
  const { slug } = await params
  const sp = await searchParams
  const langRaw = sp.lang
  const lang = Array.isArray(langRaw) ? langRaw[0] : langRaw || 'tr'

  const supabase = await createSupabaseServerClient()

  // 1. Kategori Bilgisi
  const { data: category, error: catErr } = await supabase
    .from('categories')
    .select('id, slug, active, name')
    .eq('slug', slug)
    .single()

  if (catErr || !category || category.active === false) {
    notFound()
  }

  // 2. Mapping
  const { data: mapRows, error: mapErr } = await supabase
    .from('product_category_map')
    .select('product_id')
    .eq('category_slug', slug)

  if (mapErr) {
    return (
      <div className='w-full min-h-[50vh] flex flex-col items-center justify-center p-6 text-center'>
        <div className='bg-destructive/10 text-destructive p-8 rounded-2xl border border-destructive/20 max-w-lg'>
          <FaExclamationTriangle className='text-4xl mb-4 mx-auto' />
          <h1 className='text-xl font-bold'>Kategori Eşleme Hatası</h1>
          <p className='text-sm mt-2 opacity-80 font-mono bg-black/10 p-2 rounded'>
            {mapErr.message}
          </p>
        </div>
      </div>
    )
  }

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
        id,
        slug,
        active,
        media_base_path,
        product_localizations ( lang_code, name, description ),
        product_media ( image_key, sort_order ),
        product_variants (
           product_prices ( amount, currency )
        )
      `
      )
      .in('id', Array.from(uniqueIds))
      .order('sort_order', {
        referencedTable: 'product_media',
        ascending: true
      })

    if (prodErr) {
      return (
        <div className='w-full min-h-[50vh] flex flex-col items-center justify-center p-6 text-center'>
          <div className='bg-destructive/10 text-destructive p-8 rounded-2xl border border-destructive/20 max-w-lg'>
            <FaExclamationTriangle className='text-4xl mb-4 mx-auto' />
            <h1 className='text-xl font-bold'>Ürün Verisi Hatası</h1>
            <p className='text-sm mt-2 opacity-80 font-mono bg-black/10 p-2 rounded'>
              {prodErr.message}
            </p>
          </div>
        </div>
      )
    }
    productList = (productsData ?? []) as any as ProductRow[]
  }

  const activeProducts = productList.filter(p => p.active)

  // 4. Veriyi UI için işle
  const displayItems = activeProducts.map(p => {
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

      if (imgKey.startsWith('http') || imgKey.startsWith('https')) {
        if (imgKey.includes('supabase.co')) {
          imageUrl = imgKey
        }
      } else if (imgKey.startsWith('/')) {
        imageUrl = imgKey
      } else {
        const projectUrl =
          process.env.NEXT_PUBLIC_SUPABASE_URL ||
          'https://SENIN_PROJE_ID.supabase.co'
        imageUrl = `${projectUrl}/storage/v1/object/public/products/${imgKey}`
      }
    }

    let minPrice: number | null = null
    if (p.product_variants && p.product_variants.length > 0) {
      p.product_variants.forEach(variant => {
        if (variant.product_prices) {
          variant.product_prices.forEach(price => {
            if (price.amount) {
              if (minPrice === null || price.amount < minPrice) {
                minPrice = price.amount
              }
            }
          })
        }
      })
    }

    return {
      slug: p.slug,
      name: loc?.name || p.slug,
      description: loc?.description || null,
      imageUrl: imageUrl,
      price: minPrice
    }
  })

  return (
    <div className='min-h-screen w-full bg-background text-foreground transition-colors duration-300 flex flex-col items-center'>
      {/* HEADER ALANI */}
      {/* w-full max-w-7xl mx-auto: İçerik genişliğini sabitler ve ortalar */}
      <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8'>
        <div className='flex flex-col gap-2 items-start text-left w-full'>
          <span className='text-sm font-bold tracking-[0.2em] text-primary uppercase'>
            KOLEKSİYON
          </span>
          <h1 className='text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground uppercase'>
            {category.name || category.slug}
          </h1>
        </div>
        <div className='mt-6 h-1 w-24 bg-foreground/10 rounded-full'></div>
      </div>

      {/* ÜRÜN LİSTESİ */}
      {/* w-full max-w-7xl mx-auto: Header ile aynı hizada olmasını garanti eder */}
      <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24'>
        {!displayItems.length ? (
          // Empty State
          <div className='w-full min-h-[400px] flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-3xl bg-card/30'>
            <div className='w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6 text-muted-foreground'>
              <FaBoxOpen className='text-4xl' />
            </div>
            <h3 className='text-2xl font-bold text-foreground'>
              Henüz Ürün Yok
            </h3>
            <p className='text-muted-foreground mt-2 max-w-sm mx-auto'>
              Bu koleksiyona henüz aktif ürün eklenmemiş.
            </p>
          </div>
        ) : (
          // Product Grid
          // w-full: Grid'in kapsayıcıyı tam doldurmasını sağlar (sola yaslı kalması için)
          // justify-items-start: GEREKSİZ OLABİLİR, KALDIRILDI. Default stretch daha iyi görünür.
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 w-full'>
            {displayItems.map(item => (
              <ProductCard
                key={item.slug}
                slug={item.slug}
                name={item.name}
                description={item.description}
                imageUrl={item.imageUrl}
                price={item.price}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export async function generateMetadata ({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return {
    title: `Koleksiyon - ${slug}`,
    description: `${slug} koleksiyonundaki özel ürünleri inceleyin.`
  }
}
