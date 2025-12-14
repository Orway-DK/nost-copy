// C:\Projeler\nost-copy\app\_components\ReadyProducts\index.tsx
'use client'

import useSWR from 'swr'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import ProductCarousel, { CarouselProduct } from './ProductCarousel'
import ReadyProductsTitle from './ready-products-title'

// Yardımcı fonksiyon: Resim URL'si oluşturma
const getImageUrl = (path: string | null) => {
  if (!path) return '/nost.png'
  if (path.startsWith('http') || path.startsWith('/')) return path
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${path}`
}

// Fetcher Fonksiyonu
const fetchReadyProducts = async () => {
  const supabase = createSupabaseBrowserClient()

  // Veriyi çek
  const { data, error } = await supabase
    .from('homepage_ready_products')
    .select(
      `
            price_try, price_usd, price_eur, custom_url,
            products (
                id, name, slug,
                product_media (image_key, sort_order),
                product_localizations (lang_code, name)
            )
        `
    )
    .eq('active', true)
    .order('sort_order', { ascending: true })

  if (error) throw error
  if (!data) return []

  // Veriyi işle ve formatla
  return data.map((item: any) => {
    const prod = item.products

    // Görseli bul
    const media = Array.isArray(prod.product_media) ? prod.product_media : []
    const sortedMedia = media.sort(
      (a: any, b: any) => a.sort_order - b.sort_order
    )
    const imageKey = sortedMedia[0]?.image_key || null

    // İsimleri hazırla
    const names: Record<string, string> = {
      tr: prod.name,
      en: prod.name,
      de: prod.name
    }

    if (Array.isArray(prod.product_localizations)) {
      prod.product_localizations.forEach((t: any) => {
        if (t.name) names[t.lang_code] = t.name
      })
    }

    return {
      id: prod.slug,
      names: names,
      image: getImageUrl(imageKey),
      price: {
        try: item.price_try,
        usd: item.price_usd,
        eur: item.price_eur
      },
      url: item.custom_url || `/product/${prod.slug}`
    }
  }) as CarouselProduct[]
}

export default function ReadyProducts () {
  const { data: products } = useSWR(
    'homepage-ready-products',
    fetchReadyProducts,
    {
      revalidateOnFocus: false,
      suspense: true
    }
  )

  if (!products || products.length === 0) return null

  return (
    <section className='py-12 md:py-20 bg-background transition-colors w-full overflow-hidden'>
      <div className='container mx-auto px-0 md:px-4'>
        {/* Başlık Bileşeni */}
        <div className='px-4 md:px-0'>
          <ReadyProductsTitle />
        </div>

        {/* Carousel */}
        <div className='mt-8 md:mt-10'>
          <ProductCarousel products={products} />
        </div>
      </div>
    </section>
  )
}
