'use client'

import { useState, useRef, useEffect } from 'react'
import { useTheme } from 'next-themes'
import {
  IoPersonCircle,
  IoLogOutOutline,
  IoMoon,
  IoSunny,
  IoDesktopOutline,
  IoChevronDown
} from 'react-icons/io5'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function UserProfile () {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  // Dışarı tıklayınca kapat
  useEffect(() => {
    function handleClickOutside (event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className='relative z-50' ref={dropdownRef}>
      {/* Tetikleyici Buton */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-[var(--admin-input-bg)] border border-transparent hover:border-[var(--admin-card-border)] transition-all'
      >
        <div className='w-8 h-8 rounded-full bg-[var(--admin-accent)]/10 text-[var(--admin-accent)] flex items-center justify-center'>
          <IoPersonCircle size={24} />
        </div>
        <div className='text-left hidden md:block'>
          <p className='text-xs font-bold text-[var(--admin-fg)]'>Admin</p>
          <p className='text-[10px] text-[var(--admin-muted)]'>Yönetici</p>
        </div>
        <IoChevronDown
          size={14}
          className={`text-[var(--admin-muted)] transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menü */}
      {isOpen && (
        <div className='absolute right-0 mt-2 w-56 rounded-xl shadow-xl bg-[var(--admin-card)] border border-[var(--admin-card-border)] animate-in fade-in slide-in-from-top-2 overflow-hidden'>
          {/* Kullanıcı Bilgisi */}
          <div className='px-4 py-3 border-b border-[var(--admin-card-border)] bg-[var(--admin-bg)]'>
            <p className='text-sm font-bold text-[var(--admin-fg)]'>Hesabım</p>
            <p className='text-xs text-[var(--admin-muted)] truncate'>
              admin@nostcopy.com
            </p>
          </div>

          {/* Tema Seçici */}
          <div className='p-3 border-b border-[var(--admin-card-border)]'>
            <p className='px-1 py-1 text-[10px] uppercase font-bold text-[var(--admin-muted)] tracking-wider'>
              Görünüm
            </p>
            <div className='grid grid-cols-3 gap-2 mt-2'>
              <button
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-xs transition-all border ${
                  theme === 'light'
                    ? 'bg-[var(--admin-input-bg)] border-[var(--admin-accent)] text-[var(--admin-accent)] shadow-sm'
                    : 'border-transparent hover:bg-[var(--admin-input-bg)] text-[var(--admin-fg)]'
                }`}
              >
                <IoSunny size={18} />
                <span className='font-medium'>Açık</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-xs transition-all border ${
                  theme === 'dark'
                    ? 'bg-[var(--admin-input-bg)] border-[var(--admin-accent)] text-[var(--admin-accent)] shadow-sm'
                    : 'border-transparent hover:bg-[var(--admin-input-bg)] text-[var(--admin-fg)]'
                }`}
              >
                <IoMoon size={18} />
                <span className='font-medium'>Koyu</span>
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-xs transition-all border ${
                  theme === 'system'
                    ? 'bg-[var(--admin-input-bg)] border-[var(--admin-accent)] text-[var(--admin-accent)] shadow-sm'
                    : 'border-transparent hover:bg-[var(--admin-input-bg)] text-[var(--admin-fg)]'
                }`}
              >
                <IoDesktopOutline size={18} />
                <span className='font-medium'>Oto</span>
              </button>
            </div>
          </div>

          {/* Çıkış Yap */}
          <div className='p-2'>
            <button
              onClick={handleLogout}
              className='w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--admin-danger)] hover:bg-[var(--admin-danger)]/10 rounded-lg transition-colors font-medium'
            >
              <IoLogOutOutline size={18} />
              Çıkış Yap
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
