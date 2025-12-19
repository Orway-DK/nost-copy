'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { IoChevronDown } from 'react-icons/io5'

type DropdownItem = {
  label: string
  href: string
}

type DropdownProps = {
  label: string
  items: DropdownItem[]
  emptyLabel?: string
  errorLabel?: string
}

export default function Dropdown ({
  label,
  items,
  emptyLabel,
  errorLabel
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Dışarı tıklandığında kapatma mantığı
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 150)
  }

  // Tıklama ile aç/kapat mantığı
  const handleButtonClick = (e: React.MouseEvent) => {
    // Hover durumunda zaten açıksa, tıklama ile kapatma imkanı verir
    setIsOpen(prev => !prev)
  }

  return (
    <div
      ref={containerRef}
      className='relative group h-full flex items-center'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={handleButtonClick}
        className={`
          flex items-center gap-1 
          text-sm font-bold font-sans 
          transition-colors duration-200
          ${isOpen ? 'text-primary' : 'text-foreground/80 hover:text-primary'}
        `}
      >
        {label}
        <IoChevronDown
          className={`transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          size={14}
        />
      </button>

      <div
        className={`
          absolute right-0 top-full pt-4 w-56
          transition-all duration-200 origin-top-right z-[100]
          ${
            isOpen
              ? 'opacity-100 visible scale-100 translate-y-0'
              : 'opacity-0 invisible scale-95 -translate-y-2'
          }
        `}
      >
        <div className='bg-background/95 backdrop-blur-xl border border-border/40 rounded-xl shadow-xl overflow-hidden py-2 ring-1 ring-black/5'>
          {items && items.length > 0 ? (
            items.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className='block px-4 py-2.5 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-muted/30 transition-colors whitespace-nowrap'
              >
                {item.label}
              </Link>
            ))
          ) : (
            <div className='px-4 py-3 text-sm text-muted-foreground italic text-center'>
              {items === undefined ? errorLabel : emptyLabel}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
