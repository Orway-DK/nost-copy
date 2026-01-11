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
    { revalidateOnFocus: false }
  )

  // Loading Skeleton (Tasarımı diğer slider'a benzettim)
  if (isLoading) {
    return (
      <div className='py-12 md:py-20 w-full flex justify-end overflow-hidden'>
        <div className='w-full md:w-[90%] px-4 flex gap-6 justify-end'>
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className='w-[280px] h-[350px] bg-muted/20 animate-pulse rounded-xl flex-shrink-0'
            ></div>
          ))}
        </div>
      </div>
    )
  }

  if (!products || products.length === 0) return null

  return (
    <section className='py-12 md:py-20 bg-background transition-colors w-full overflow-hidden'>
      {/* DEĞİŞİKLİK BURADA: 
         - md:pr-[10vw] ile sağdan boşluk bıraktık (diğer slider soldan bırakmıştı).
         - md:pl-0 ile solu sıfırladık.
      */}
      <div className='w-full px-0 md:pr-[10vw] min-w-0'>
        {/* Başlık Bileşeni - Sağa Yaslı */}
        <div className='px-4 md:px-0 flex flex-col items-center md:items-end text-center md:text-right mb-8 md:mb-10'>
          <ReadyProductsTitle />
        </div>

        {/* Carousel */}
        <div className='mt-0'>
          <ProductCarousel products={products} />
        </div>
      </div>
    </section>
  )
}
