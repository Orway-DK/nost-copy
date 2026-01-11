'use client'

import Link from 'next/link'
import { SlMenu } from 'react-icons/sl'
// Giriş ve Sepet iconlarını sildik, yerine Kalp ekledik
import { FaHeart } from 'react-icons/fa'
import { TranslationDictionary } from './types'
import WebsiteSearchInput from '../../WebsiteSeachInput'
// Context hook'umuzu ekledik
import { useFavorites } from '@/app/_components/Favorites'

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
  // Favori verisini çekiyoruz
  const { favoriteIds } = useFavorites()

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

        {/* Search Input */}
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
            {/* FAVORİLER BUTONU - Giriş ve Sepet yerine sadece bu kaldı */}
            <Link
              href='/favorites' // İleride yapacağın favori sayfası
              className='flex flex-col items-center gap-1 text-muted-foreground hover:text-danger transition-colors relative group'
            >
              <div className='relative'>
                <FaHeart
                  size={20}
                  className='group-hover:text-red-500 transition-colors'
                />

                {/* Badge Sayacı */}
                {favoriteIds.length > 0 && (
                  <span className='absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm'>
                    {favoriteIds.length}
                  </span>
                )}
              </div>
              <span className='text-[10px] font-bold uppercase'>Favoriler</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
