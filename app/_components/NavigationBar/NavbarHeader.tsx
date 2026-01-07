'use client'

import Link from 'next/link'
import { SlMenu } from 'react-icons/sl'
import { FaUser, FaShoppingCart } from 'react-icons/fa'
import { TranslationDictionary } from './types'
import WebsiteSearchInput from '../WebsiteSeachInput'

interface NavbarHeaderProps {
  siteName: string
  t: TranslationDictionary
  onMobileMenuOpen: () => void
}

export default function NavbarHeader ({
  siteName,
  t,
  onMobileMenuOpen
}: NavbarHeaderProps) {
  return (
    <div className='border-b border-border/40 bg-white dark:bg-zinc-950 relative z-50'>
      <div className='container mx-auto px-4 h-20 flex items-center justify-between gap-6'>
        {/* Logo */}
        <Link
          href='/home'
          className='text-2xl font-black tracking-tighter text-foreground shrink-0'
        >
          {siteName}
        </Link>

        {/* Search Input - Liste modu aktif */}
        <WebsiteSearchInput
          placeholder={t.searchPlaceholder}
          mode='list'
          currentLang={t.langCode || 'tr'}
        />

        {/* Icons & Mobile Toggle */}
        <div className='flex items-center gap-4 shrink-0'>
          <button className='lg:hidden text-2xl p-2' onClick={onMobileMenuOpen}>
            <SlMenu />
          </button>
          <div className='hidden lg:flex items-center gap-6'>
            <Link
              href='/login'
              className='flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors'
            >
              <FaUser size={18} />
              <span className='text-[10px] font-bold uppercase'>{t.login}</span>
            </Link>
            <Link
              href='/cart'
              className='flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors relative'
            >
              <div className='relative'>
                <FaShoppingCart size={18} />
                <span className='absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full'>
                  0
                </span>
              </div>
              <span className='text-[10px] font-bold uppercase'>{t.cart}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
