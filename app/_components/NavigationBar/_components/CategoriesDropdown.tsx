// C:\Projeler\nost-copy\app\_components\NavigationBar\_components\CategoriesDropdown.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

/**
 * Kategoriler için basit dropdown.
 * Props:
 * - label: Üst buton yazısı (Kategoriler / Categories / Kategorien)
 * - items: { label, href }[]
 * - loading: yükleniyor mu
 * - error: hata oldu mu
 */
export default function CategoriesDropdown ({
  label,
  items,
  loading,
  error
}: {
  label: string
  items: { label: string; href: string }[]
  loading: boolean
  error: boolean
}) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const popRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const handleDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (popRef.current?.contains(t)) return
      if (btnRef.current?.contains(t)) return
      setOpen(false)
    }
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleDown)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleDown)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [open])

  return (
    <div className='relative inline-block'>
      <button
        ref={btnRef}
        type='button'
        onClick={() => setOpen(o => !o)}
        className='inline-flex items-center gap-1.5 text-foreground/80 hover:text-primary transition-colors font-bold'
        aria-haspopup='true'
        aria-expanded={open}
      >
        <span>{label}</span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          viewBox='0 0 10 6'
          aria-hidden='true'
        >
          <path
            d='m1 1 4 4 4-4'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </button>

      {open && (
        <div
          ref={popRef}
          /* DÜZELTME: 'left-auto right-0' eklenerek menünün sola doğru açılması sağlandı */
          className='absolute right-0 left-auto mt-3 bg-popover text-popover-foreground rounded-xl shadow-xl ring-1 ring-border/50 z-[100] min-w-[14rem] overflow-hidden animate-in fade-in zoom-in-95 duration-200'
        >
          <ul className='py-2 max-h-[70vh] overflow-y-auto'>
            {loading && (
              <li className='px-4 py-3 text-sm text-muted-foreground animate-pulse'>
                Yükleniyor...
              </li>
            )}
            {error && !loading && (
              <li className='px-4 py-3 text-sm text-destructive font-medium'>
                Kategoriler alınamadı
              </li>
            )}
            {!loading &&
              !error &&
              items.map(it => (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    className='block px-4 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors whitespace-nowrap'
                    onClick={() => setOpen(false)}
                  >
                    {it.label}
                  </Link>
                </li>
              ))}
            {!loading && !error && items.length === 0 && (
              <li className='px-4 py-3 text-sm text-muted-foreground italic'>
                Kategori Yok
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
