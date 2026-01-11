'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useFavorites } from '@/app/_components/Favorites' // Yeni yol
import AddToFavButton from '@/app/_components/AddToFavorites' // Yeni yol
import { FaHeartBroken, FaShoppingCart } from 'react-icons/fa'

// Basit Tip Tanımlaması
type FavProduct = {
  id: number
  slug: string
  name: string
  image: string | null
  price: number | null
  currency: string
}

export default function FavoritesPage () {
  const { favoriteIds } = useFavorites()
  const [products, setProducts] = useState<FavProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFavoriteProducts = async () => {
      // 1. Favori listesi boşsa sorgu atma
      if (favoriteIds.length === 0) {
        setProducts([])
        setLoading(false)
        return
      }

      setLoading(true)
      const supabase = createSupabaseBrowserClient()
      const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

      // 2. ID'si favorilerde olan ürünleri çek
      const { data, error } = await supabase
        .from('products')
        .select(
          `
          id, slug, active,
          product_localizations(name, lang_code),
          product_media(image_key, sort_order),
          product_variants(product_prices(amount, currency))
        `
        )
        .in('id', favoriteIds)
        .eq('active', true)

      if (error) {
        console.error('Favoriler çekilemedi:', error)
        setLoading(false)
        return
      }

      // 3. Veriyi Formatla
      const formatted: FavProduct[] = data.map((p: any) => {
        const loc =
          p.product_localizations.find((l: any) => l.lang_code === 'tr') ||
          p.product_localizations[0]

        let imgUrl = null
        if (p.product_media?.length > 0) {
          const sorted = p.product_media.sort(
            (a: any, b: any) => a.sort_order - b.sort_order
          )
          const key = sorted[0].image_key
          if (key) {
            imgUrl = key.startsWith('http')
              ? key
              : `${projectUrl}/storage/v1/object/public/products/${key}`
          }
        }

        const priceObj = p.product_variants?.[0]?.product_prices?.[0]

        return {
          id: p.id,
          slug: p.slug,
          name: loc?.name || p.slug,
          image: imgUrl,
          price: priceObj?.amount || 0,
          currency: priceObj?.currency || 'TL'
        }
      })

      setProducts(formatted)
      setLoading(false)
    }

    fetchFavoriteProducts()
  }, [favoriteIds]) // ID listesi değişirse tekrar çek

  // --- RENDER ---
  return (
    <div className='min-h-[70vh] w-full bg-background py-10'>
      <div className='container mx-auto px-4 max-w-6xl'>
        <div className='mb-8 border-b border-border/50 pb-4'>
          <h1 className='text-3xl font-bold text-foreground'>Favorilerim</h1>
          <p className='text-muted-foreground mt-1'>
            {favoriteIds.length} adet ürün kayıtlı
          </p>
        </div>

        {loading ? (
          // SKELETON LOADING
          <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6'>
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className='aspect-[3/5] bg-muted/20 animate-pulse rounded-xl'
              ></div>
            ))}
          </div>
        ) : products.length > 0 ? (
          // ÜRÜN LİSTESİ
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'>
            {products.map(product => (
              <div
                key={product.id}
                className='group relative bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300'
              >
                {/* Resim Alanı */}
                <div className='relative aspect-[4/5] bg-muted/10 overflow-hidden'>
                  <Link href={`/${product.slug}`}>
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className='object-cover group-hover:scale-105 transition-transform duration-500'
                      />
                    ) : (
                      <div className='w-full h-full flex items-center justify-center text-muted-foreground text-xs'>
                        Görsel Yok
                      </div>
                    )}
                  </Link>

                  {/* Silme Butonu (Sağ Üst) */}
                  <div className='absolute top-2 right-2'>
                    <AddToFavButton
                      productId={product.id}
                      variant='icon'
                      className='bg-white/80 backdrop-blur shadow-sm hover:bg-white'
                    />
                  </div>
                </div>

                {/* Bilgi Alanı */}
                <div className='p-4 flex flex-col gap-2'>
                  <Link
                    href={`/${product.slug}`}
                    className='font-bold text-foreground text-sm line-clamp-2 hover:text-primary transition-colors h-10'
                  >
                    {product.name}
                  </Link>

                  <div className='text-lg font-bold text-primary'>
                    {product.price
                      ? new Intl.NumberFormat('tr-TR', {
                          style: 'currency',
                          currency: product.currency
                        }).format(product.price)
                      : 'Fiyat Alınız'}
                  </div>

                  <Link
                    href={`/${product.slug}`}
                    className='w-full mt-2 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg text-xs font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-2'
                  >
                    <FaShoppingCart /> Ürüne Git
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // BOŞ LİSTE
          <div className='flex flex-col items-center justify-center py-20 text-center opacity-70'>
            <div className='w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mb-6'>
              <FaHeartBroken size={40} className='text-muted-foreground' />
            </div>
            <h2 className='text-2xl font-bold text-foreground mb-2'>
              Listeniz Henüz Boş
            </h2>
            <p className='text-muted-foreground mb-8 max-w-md'>
              Beğendiğiniz ürünleri kalp ikonuna tıklayarak buraya ekleyebilir,
              daha sonra kolayca ulaşabilirsiniz.
            </p>
            <Link
              href='/c'
              className='px-8 py-3 bg-primary text-white rounded-full font-bold hover:shadow-lg hover:-translate-y-1 transition-all'
            >
              Alışverişe Başla
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
