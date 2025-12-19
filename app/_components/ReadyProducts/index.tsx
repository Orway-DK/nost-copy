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

  return data.map((item: any) => {
    const prod = item.products
    const media = Array.isArray(prod.product_media) ? prod.product_media : []
    const sortedMedia = media.sort(
      (a: any, b: any) => a.sort_order - b.sort_order
    )
    const imageKey = sortedMedia[0]?.image_key || null

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
  const { data: products, isLoading } = useSWR(
    'homepage-ready-products',
    fetchReadyProducts,
    {
      revalidateOnFocus: false
      // suspense: true kaldırıldı, hata buna sebep oluyordu
    }
  )

  // Yükleme durumu için skeleton veya boş div
  if (isLoading) {
    return (
      <div className='py-12 md:py-20 w-full flex justify-center'>
        <div className='container mx-auto px-4'>
          <div className='h-12 w-64 bg-muted animate-pulse rounded-lg mb-10' />
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className='aspect-[4/5] bg-muted animate-pulse rounded-xl'
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

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
