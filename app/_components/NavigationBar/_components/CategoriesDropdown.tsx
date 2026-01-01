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
          absolute top-full right-0 mt-0 pt-4 w-64
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
  const itemRef = useRef<HTMLLIElement>(null)

  // Varsayılan olarak sağa açıyoruz ('right'). Eğer yer yoksa sola ('left') dönecek.
  const [subMenuDirection, setSubMenuDirection] = useState<'right' | 'left'>(
    'right'
  )

  const handleMouseEnter = () => {
    if (itemRef.current && hasChildren) {
      const rect = itemRef.current.getBoundingClientRect()
      const windowWidth = window.innerWidth
      const subMenuWidth = 250

      if (rect.right + subMenuWidth > windowWidth) {
        setSubMenuDirection('left')
      } else {
        setSubMenuDirection('right')
      }
    }
  }

  // ORTAK LINK STİLLERİ (Tutarlılık için değişkene atandı)
  const linkClasses =
    'flex items-center justify-between px-4 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted/50 hover:text-primary transition-colors w-full text-left whitespace-nowrap'

  return (
    <li
      ref={itemRef}
      className='group relative'
      onMouseEnter={handleMouseEnter}
    >
      {hasChildren ? (
        <>
          <Link href={item.href} onClick={closeMenu} className={linkClasses}>
            <span>{item.label}</span>
            <IoChevronForward className='text-muted-foreground/70' size={14} />
          </Link>

          {/* DİNAMİK AÇILAN ALT MENÜ */}
          <div
            className={`
              absolute top-0 hidden group-hover:block w-64 z-[101]
              ${
                subMenuDirection === 'right'
                  ? 'left-full pl-2'
                  : 'right-full pr-2'
              }
            `}
          >
            <div className='bg-white dark:bg-zinc-950 rounded-xl shadow-xl border border-border py-2 animate-in fade-in duration-200'>
              <ul>
                {item.children!.map(child => (
                  <li key={child.href}>
                    <Link
                      href={child.href}
                      onClick={closeMenu}
                      className={linkClasses}
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
