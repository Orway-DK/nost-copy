// C:\Projeler\nost-copy\app\_components\RelatedProducts.tsx
import { createSupabaseServerClient } from '@/lib/supabase/server-client'
import RelatedProductsProductCard from './RelatedProductsProductCard'

interface RelatedProductsProps {
  currentProductId: number
  categorySlug: string
}

export default async function RelatedProducts ({
  currentProductId,
  categorySlug
}: RelatedProductsProps) {
  const supabase = await createSupabaseServerClient()

  // Aynı kategorideki, mevcut ürün olmayan 4 ürünü çek
  const { data: products } = await supabase
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
    .eq('category_slug', categorySlug)
    .neq('id', currentProductId) // Kendini hariç tut
    .eq('active', true)
    .limit(4)

  if (!products || products.length === 0) return null

  // Veriyi ProductCard formatına çevir (Page.tsx'deki mantığın aynısı)
  const displayItems = products.map((p: any) => {
    // Varsayılan dil fallback (basitçe ilkini alıyoruz burada)
    const loc = p.product_localizations?.[0] || null

    let imageUrl = null
    if (p.product_media && p.product_media.length > 0) {
      const firstMedia = p.product_media.sort(
        (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
      )[0]
      const imgKey = firstMedia.image_key || ''

      // URL oluşturma mantığı (Page.tsx ile aynı)
      if (imgKey.startsWith('http')) {
        if (imgKey.includes('supabase.co')) imageUrl = imgKey
      } else if (imgKey.startsWith('/')) {
        imageUrl = imgKey
      } else {
        const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        imageUrl = `${projectUrl}/storage/v1/object/public/products/${imgKey}`
      }
    }

    let minPrice: number | null = null
    if (p.product_variants) {
      p.product_variants.forEach((v: any) => {
        v.product_prices?.forEach((price: any) => {
          if (price.amount && (minPrice === null || price.amount < minPrice)) {
            minPrice = price.amount
          }
        })
      })
    }

    return {
      slug: p.slug,
      name: loc?.name || p.slug,
      imageUrl,
      price: minPrice
    }
  })

  return (
    <div className='mt-16 pt-10 border-t border-border'>
      <h3 className='text-2xl font-bold mb-6'>Benzer Ürünler</h3>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {displayItems.map((item: any) => (
          <div key={item.slug} className='h-[350px]'>
            <RelatedProductsProductCard
              slug={item.slug}
              name={item.name}
              imageUrl={item.imageUrl}
              price={item.price}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
