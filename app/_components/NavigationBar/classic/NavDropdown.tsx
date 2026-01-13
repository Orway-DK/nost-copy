// app\_components\NavigationBar\classic\NavDropdown.tsx
'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { IoChevronDown } from 'react-icons/io5'

export type DropdownItem = {
  label: string
  href: string
  children?: DropdownItem[] // İç içe menü desteği
}

type NavDropdownProps = {
  label: string
  items: DropdownItem[]
  isLoading?: boolean
}

export default function NavDropdown ({
  label,
  items,
  isLoading
}: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 200) // Kullanıcı mouse'u kaçırırsa hemen kapanmasın diye tolerans
  }

  return (
    <div
      className='relative h-full flex items-center'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Tetikleyici Buton */}
      <button
        className={`
          flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold font-sans transition-all duration-200
          ${
            isOpen
              ? 'text-primary bg-primary/5'
              : 'text-foreground/80 hover:text-primary hover:bg-muted/30'
          }
        `}
      >
        {label}
        <IoChevronDown
          size={12}
          className={`transition-transform duration-300 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        />
      </button>

      {/* Dropdown Panel */}
      <div
        className={`
          absolute top-full right-0 mt-2 w-64 pt-2 z-50 origin-top-right
          transition-all duration-200 ease-out
          ${
            isOpen
              ? 'opacity-100 visible translate-y-0 scale-100'
              : 'opacity-0 invisible -translate-y-2 scale-95'
          }
        `}
      >
        <div className='bg-white dark:bg-zinc-900 rounded-xl shadow-xl shadow-black/5 border border-border/50 overflow-hidden p-1.5 ring-1 ring-black/5'>
          {isLoading ? (
            <div className='px-4 py-3 text-xs text-muted-foreground animate-pulse'>
              Yükleniyor...
            </div>
          ) : items.length > 0 ? (
            <div className='flex flex-col gap-0.5'>
              {items.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className='group flex items-center justify-between px-3 py-2.5 text-sm font-medium text-foreground/80 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors'
                >
                  {item.label}
                  {/* Hover olunca çıkan küçük ok */}
                  <span className='opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-primary'>
                    →
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className='px-4 py-3 text-xs text-muted-foreground italic text-center'>
              Veri bulunamadı
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
