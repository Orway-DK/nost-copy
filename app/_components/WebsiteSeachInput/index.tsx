'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FaSearch, FaSpinner, FaArrowRight } from 'react-icons/fa'
import Link from 'next/link'
import { searchProducts, ProductUI, SearchResultMode } from './types'
import Image from 'next/image'

interface WebsiteSearchInputProps {
  placeholder?: string
  className?: string
  mode?: SearchResultMode
  currentLang?: string
}

export default function WebsiteSearchInput ({
  placeholder = 'Ara...',
  className = '',
  mode = 'list',
  currentLang = 'tr'
}: WebsiteSearchInputProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ProductUI[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const router = useRouter()
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 3) {
        setIsLoading(true)
        setIsOpen(true)
        try {
          const data = await searchProducts(query, currentLang)
          setResults(data)
        } catch (error) {
          console.error('Arama hatası', error)
        } finally {
          setIsLoading(false)
        }
      } else {
        setResults([])
        setIsOpen(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [query, currentLang])

  useEffect(() => {
    function handleClickOutside (event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setIsOpen(false)
      // Arama sonuç sayfasına yönlendirme (Dil kodu yok)
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div
      ref={wrapperRef}
      className={`flex flex-1 max-w-xl relative ${className}`}
    >
      <form onSubmit={handleSubmit} className='w-full relative z-20'>
        <input
          type='text'
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          className='w-full h-11 pl-4 pr-12 bg-gray-100 dark:bg-zinc-900 border border-transparent focus:border-primary/30 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all'
        />
        <button
          type='submit'
          className='absolute right-2 top-2 h-7 w-7 bg-white dark:bg-zinc-800 rounded-md flex items-center justify-center text-primary shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors'
        >
          {isLoading ? (
            <FaSpinner className='animate-spin text-muted-foreground' />
          ) : (
            <FaSearch size={14} />
          )}
        </button>
      </form>

      {isOpen && (
        <div
          className={`absolute top-full mt-2 bg-white dark:bg-zinc-950 border border-border/50 rounded-lg shadow-2xl overflow-hidden z-50
            ${
              mode === 'grid'
                ? 'w-[600px] -left-20 lg:left-0 p-4'
                : 'w-full py-2 left-0'
            }
          `}
        >
          {results.length > 0 ? (
            <>
              {mode === 'list' && (
                <ul className='flex flex-col'>
                  {results.map(product => (
                    <li key={product.id}>
                      <Link
                        href={`/${product.slug}`}
                        onClick={() => setIsOpen(false)}
                        className='flex items-center gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors group border-b border-border/30 last:border-0'
                      >
                        <div className='w-12 h-12 rounded-md bg-gray-100 relative overflow-hidden shrink-0 border border-border/50'>
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className='object-cover'
                            sizes='48px'
                          />
                        </div>
                        <div className='flex flex-col flex-1 min-w-0'>
                          <span className='text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate'>
                            {product.name}
                          </span>
                          <span className='text-[10px] text-muted-foreground uppercase tracking-wider'>
                            {product.category}
                          </span>
                        </div>
                        <div
                          className={`text-sm font-bold whitespace-nowrap ${
                            product.priceDisplay === 'Teklif Al'
                              ? 'text-muted-foreground text-xs'
                              : 'text-primary'
                          }`}
                        >
                          {product.priceDisplay}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {mode === 'grid' && (
                <div>
                  <h3 className='text-xs font-bold text-muted-foreground uppercase mb-3 px-1'>
                    Önerilen Ürünler
                  </h3>
                  <div className='grid grid-cols-3 gap-3'>
                    {results.map(product => (
                      <Link
                        key={product.id}
                        href={`/${product.slug}`}
                        onClick={() => setIsOpen(false)}
                        className='flex flex-col gap-2 p-2 rounded-lg border border-border/40 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all group relative'
                      >
                        <div className='w-full aspect-square rounded-md bg-gray-100 relative overflow-hidden'>
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className='object-cover transition-transform group-hover:scale-105'
                            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 33vw'
                          />
                          {product.priceDisplay === 'Teklif Al' && (
                            <div className='absolute bottom-0 left-0 w-full bg-black/60 text-white text-[9px] py-1 text-center backdrop-blur-sm'>
                              Teklif Al
                            </div>
                          )}
                        </div>
                        <div className='space-y-0.5'>
                          <h4 className='text-xs font-semibold truncate group-hover:text-primary leading-tight'>
                            {product.name}
                          </h4>
                          <p className='text-[10px] text-muted-foreground truncate'>
                            {product.category}
                          </p>
                          {product.priceDisplay !== 'Teklif Al' && (
                            <p className='text-xs font-bold text-primary mt-1'>
                              {product.priceDisplay}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className='mt-2 pt-2 border-t border-border/40 text-center bg-gray-50/50 dark:bg-zinc-900/30 -mx-4 -mb-2 py-2'>
                <button
                  onClick={handleSubmit}
                  className='text-xs font-medium text-primary hover:underline flex items-center justify-center gap-1 w-full h-full'
                >
                  Tüm sonuçları gör <FaArrowRight size={10} />
                </button>
              </div>
            </>
          ) : (
            !isLoading && (
              <div className='py-8 px-4 text-center'>
                <div className='bg-gray-100 dark:bg-zinc-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-muted-foreground'>
                  <FaSearch size={20} />
                </div>
                <p className='text-sm font-medium text-foreground'>
                  Sonuç Bulunamadı
                </p>
                <p className='text-xs text-muted-foreground mt-1'>
                  "{query}" ile eşleşen ürün yok.
                </p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
