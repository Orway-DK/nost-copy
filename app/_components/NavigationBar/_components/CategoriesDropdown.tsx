// C:\Projeler\nost-copy\app\_components\NavigationBar\_components\CategoriesDropdown.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { IoChevronForward } from 'react-icons/io5'
import { NavItem } from '../NavigationBar'

interface CategoriesDropdownProps {
  label: string
  items: NavItem[]
  loading: boolean
  error: boolean
  emptyLabel?: string
}

export default function CategoriesDropdown ({
  label,
  items,
  loading,
  error,
  emptyLabel
}: CategoriesDropdownProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false)
    }, 200)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className='relative inline-block h-full flex items-center'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type='button'
        onClick={() => setOpen(prev => !prev)}
        className={`
          flex items-center gap-1 
          text-sm font-bold font-sans 
          transition-colors duration-200
          ${open ? 'text-primary' : 'text-foreground/80 hover:text-primary'}
        `}
        aria-haspopup='true'
        aria-expanded={open}
      >
        <span>{label}</span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          viewBox='0 0 10 6'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <path d='m1 1 4 4 4-4' />
        </svg>
      </button>

      {/* ANA DROPDOWN MENÜSÜ */}
      <div
        className={`
          absolute top-full right-0 mt-0 pt-4 w-80
          transition-all duration-200 origin-top-right z-[100]
          ${
            open
              ? 'opacity-100 visible translate-y-0'
              : 'opacity-0 invisible -translate-y-2'
          }
        `}
      >
        <div className='bg-white dark:bg-zinc-950 rounded-xl shadow-xl border border-border overflow-visible py-2'>
          <ul className='flex flex-col'>
            {loading && (
              <li className='px-4 py-3 text-sm text-muted-foreground animate-pulse font-medium'>
                Yükleniyor...
              </li>
            )}

            {error && !loading && (
              <li className='px-4 py-3 text-sm text-destructive font-medium'>
                Hata oluştu.
              </li>
            )}

            {!loading && !error && items.length === 0 && (
              <li className='px-4 py-3 text-sm text-muted-foreground italic font-medium'>
                {emptyLabel || 'Veri yok'}
              </li>
            )}

            {/* Tüm Kategoriler Linki */}
            <li>
              <Link
                href="/c"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-4 py-2.5 text-sm font-bold text-primary hover:bg-muted/50 hover:text-primary-hover transition-colors w-full text-left border-b border-border/50 mb-1"
              >
                <span>Tüm Kategoriler</span>
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </li>

            {!loading &&
              !error &&
              items.map(item => (
                <MenuItem
                  key={item.href}
                  item={item}
                  closeMenu={() => setOpen(false)}
                />
              ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

// --- ALT BİLEŞEN: TEKİL MENÜ ÖĞESİ ---
function MenuItem ({
  item,
  closeMenu
}: {
  item: NavItem
  closeMenu: () => void
}) {
  const hasChildren = item.children && item.children.length > 0

  // ORTAK LINK STİLLERİ (Tutarlılık için değişkene atandı)
  const linkClasses =
    'flex items-center justify-between px-4 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted/50 hover:text-primary transition-colors w-full text-left whitespace-nowrap'

  return (
    <li className='group relative'>
      {hasChildren ? (
        <>
          <Link href={item.href} onClick={closeMenu} className={linkClasses}>
            <span>{item.label}</span>
            <IoChevronForward className='text-muted-foreground/70 group-hover:rotate-90 transition-transform' size={14} />
          </Link>

          {/* ALT KATEGORİLER - AŞAĞIYA AÇILAN */}
          <div className='absolute top-full left-0 hidden group-hover:block w-full z-[101] pt-1'>
            <div className='bg-white dark:bg-zinc-950 rounded-lg shadow-lg border border-border py-2 animate-in fade-in duration-200'>
              <ul>
                {item.children!.map(child => (
                  <li key={child.href}>
                    <Link
                      href={child.href}
                      onClick={closeMenu}
                      className='flex items-center px-4 py-2 text-sm font-medium text-foreground/80 hover:bg-muted/50 hover:text-primary transition-colors w-full text-left pl-6'
                    >
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      ) : (
        <Link href={item.href} onClick={closeMenu} className={linkClasses}>
          {item.label}
        </Link>
      )}
    </li>
  )
}
