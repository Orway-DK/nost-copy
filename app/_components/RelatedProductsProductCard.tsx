// C:\Projeler\nost-copy\app\_components\ProductCard.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FaShoppingBag } from 'react-icons/fa'

interface ProductCardProps {
  slug: string
  name: string
  description?: string | null
  imageUrl?: string | null
  price?: number | null
  currency?: string
}

export default function RelatedProductsProductCard ({
  slug,
  name,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  description, // Açıklamayı kartta göstermiyoruz, o yüzden kullanılmadı olarak işaretledim
  imageUrl,
  price,
  currency = 'TL'
}: ProductCardProps) {
  return (
    <Link href={`/product/${slug}`} className='group block h-full'>
      <div className='relative h-full bg-card border border-border/40 rounded-xl transition-all duration-300 hover:shadow-xl hover:border-primary/30 flex flex-col'>
        <div className='p-2'>
          <div className='relative aspect-[4/5] w-full bg-muted/50 overflow-hidden rounded-lg border border-border/50 transition-colors duration-300 group-hover:border-primary/40'>
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={name}
                fill
                // rounded-lg eklendi ki görsel köşelerden taşmasın
                className='object-cover rounded-lg transition-transform duration-500 group-hover:scale-105'
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
              />
            ) : (
              <div className='absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/30'>
                <svg
                  className='w-12 h-12 mb-2 opacity-50'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={1}
                    d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                  />
                </svg>
                <span className='text-[10px] font-medium uppercase tracking-wider opacity-70'>
                  Görsel Yok
                </span>
              </div>
            )}

            {/* Hover Overlay Aksiyonu (Hafif karartma) */}
            <div className='absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg' />
          </div>
        </div>

        {/* --- İÇERİK ALANI --- */}
        <div className='absolute bottom-0 left-0 bg-background/80 rounded-r-2xl p-4 pt-1 flex flex-col gap-2 flex-1 justify-between'>
          <h3 className='text-sm font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors mt-2'>
            {name}
          </h3>

          {/* Fiyat Alanı */}
          <div className='flex item-center justify-between mt-auto border-t border-border/30'>
            {price ? (
              <div className='flex flex-col'>
                <span className='text-[10px] text-muted-foreground font-medium'>
                  Fiyat
                </span>
                <div className='flex items-baseline gap-1'>
                  <span className='text-lg font-bold text-orange-600 dark:text-orange-500'>
                    {new Intl.NumberFormat('tr-TR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }).format(price)}
                  </span>
                  <span className='text-xs font-medium text-muted-foreground'>
                    {currency}
                  </span>
                </div>
              </div>
            ) : (
              <span className='text-xs font-semibold text-primary/80 hover:text-primary hover:underline transition-all flex items-center gap-1'>
                Ürünü İncele
              </span>
            )}

            {/* Sepet İkonu (Gizli) */}
            <div className='hidden w-9 h-9 rounded-full bg-primary/10 text-primary items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0'>
              <FaShoppingBag size={14} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
