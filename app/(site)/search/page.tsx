'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FaSearch, FaSpinner, FaArrowLeft } from 'react-icons/fa'
import {
  searchProducts,
  ProductUI
} from '../../_components/WebsiteSeachInput/types'
import { useLanguage } from '@/components/LanguageProvider'

function SearchContent () {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState<ProductUI[]>([])
  const [loading, setLoading] = useState(true)

  const { lang } = useLanguage()

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true)
      if (query) {
        const data = await searchProducts(query, lang)
        setResults(data)
      } else {
        setResults([])
      }
      setLoading(false)
    }

    fetchResults()
  }, [query, lang])

  return (
    <div className='container mx-auto px-4 py-8 min-h-[60vh]'>
      <div className='mb-8 border-b border-border/40 pb-4'>
        <h1 className='text-2xl font-bold text-foreground'>
          {lang === 'tr' ? 'Arama Sonuçları' : 'Search Results'}
        </h1>
        <p className='text-muted-foreground text-sm mt-1'>
          "<span className='font-semibold text-primary'>{query}</span>"
          {lang === 'tr' ? ' için bulunan sonuçlar:' : ' results found for:'}
        </p>
      </div>

      {loading ? (
        <div className='flex flex-col items-center justify-center py-20 opacity-70'>
          <FaSpinner className='animate-spin text-4xl text-primary mb-4' />
          <p className='text-sm font-medium'>
            {lang === 'tr' ? 'Ürünler aranıyor...' : 'Searching products...'}
          </p>
        </div>
      ) : results.length > 0 ? (
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6'>
          {results.map(product => (
            <Link
              key={product.id}
              href={`/${product.slug}`}
              className='group flex flex-col bg-white dark:bg-zinc-900 border border-border/40 rounded-xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300'
            >
              <div className='aspect-square relative bg-gray-100 dark:bg-zinc-800 overflow-hidden'>
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className='object-cover group-hover:scale-105 transition-transform duration-500'
                  sizes='(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw'
                />
                {product.priceDisplay === 'Teklif Al' && (
                  <span className='absolute top-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm'>
                    {lang === 'tr' ? 'Teklif' : 'Offer'}
                  </span>
                )}
              </div>

              <div className='p-4 flex flex-col flex-1'>
                <span className='text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1'>
                  {product.category}
                </span>
                <h3 className='text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-3'>
                  {product.name}
                </h3>

                <div className='mt-auto pt-3 border-t border-border/30 flex items-center justify-between'>
                  <span
                    className={`font-bold ${
                      product.priceDisplay === 'Teklif Al'
                        ? 'text-xs text-muted-foreground'
                        : 'text-lg text-primary'
                    }`}
                  >
                    {product.priceDisplay}
                  </span>
                  <span className='text-[10px] font-medium bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded text-foreground group-hover:bg-primary group-hover:text-white transition-colors'>
                    {lang === 'tr' ? 'İncele' : 'View'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center py-16 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-border/60'>
          <div className='w-16 h-16 bg-gray-200 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-muted-foreground'>
            <FaSearch size={24} />
          </div>
          <h2 className='text-lg font-semibold text-foreground'>
            {lang === 'tr' ? 'Sonuç Bulunamadı' : 'No Results Found'}
          </h2>
          <p className='text-muted-foreground text-sm max-w-md text-center mt-2 mb-6'>
            {lang === 'tr'
              ? 'Aradığınız kriterlere uygun bir ürün bulamadık. Lütfen farklı anahtar kelimeler deneyin.'
              : 'We could not find any products matching your criteria. Please try different keywords.'}
          </p>
          <Link
            href='/home'
            className='flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20'
          >
            <FaArrowLeft size={12} />
            {lang === 'tr' ? 'Anasayfaya Dön' : 'Back to Home'}
          </Link>
        </div>
      )}
    </div>
  )
}

export default function SearchPage () {
  return (
    <Suspense
      fallback={<div className='container mx-auto p-8 text-center'>...</div>}
    >
      <SearchContent />
    </Suspense>
  )
}
