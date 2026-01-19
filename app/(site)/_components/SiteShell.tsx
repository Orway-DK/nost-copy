'use client'

import { useState, Suspense, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import useSWR from 'swr' // Veri çekmek için
import { createSupabaseBrowserClient } from '@/lib/supabase/client' // Supabase client

import LoadingOverlay from '@/components/LoadingOverlay'
import LoadingCompleter from '@/components/LoadingCompleter'

import TopHorizontalBanner from '@/app/_components/TopHorizontalBanner'
import Footer from '@/app/_components/Footer'

import NavigationBar from '@/app/_components/NavigationBar/classic' // Klasik (V1)
import MegaNavbar from '@/app/_components/NavigationBar/mega' // Mega (V2)

// --- NAVBAR AYARINI ÇEKEN FONKSİYON ---
const fetchNavbarStyle = async () => {
  const supabase = createSupabaseBrowserClient()
  const { data } = await supabase
    .from('site_settings')
    .select('navbar_style')
    .limit(1)
    .maybeSingle()

  // Eğer veri yoksa veya null ise varsayılan olarak 'v1' döndür
  return data?.navbar_style || 'v1'
}

export default function SiteShell ({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const [overlayVisible, setOverlayVisible] = useState(true)
  const [isFading, setIsFading] = useState(false)

  // Navbar Stilini Çek (v1 veya v2)
  const { data: navbarStyle } = useSWR(
    'navbar_style_setting',
    fetchNavbarStyle,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000 // 1 dakika cache
    }
  )

  // --- HATA DÜZELTME KISMI ---
  useEffect(() => {
    // State güncellemesini setTimeout içine alarak "Synchronous render" hatasını engelliyoruz.
    // Bu işlem, güncellemeyi bir sonraki 'tick'e atar.
    const timer = setTimeout(() => {
      setOverlayVisible(true)
      setIsFading(false)
    }, 0)

    return () => clearTimeout(timer)
  }, [pathname])

  const handleLoadingComplete = useCallback(() => {
    const timer = setTimeout(() => {
      setIsFading(true)

      setTimeout(() => {
        setOverlayVisible(false)
      }, 700)
    }, 2500) // 1500ms -> 2500ms, navbar'ın yüklenmesi için ekstra süre

    return () => clearTimeout(timer)
  }, [])

  // Navbar stil bilgisi yüklendikten sonra loading'i biraz daha geciktir
  useEffect(() => {
    if (navbarStyle !== undefined) {
      // Navbar stil bilgisi geldi, navbar'ın kendisi yüklenene kadar bekle
      const timer = setTimeout(() => {
        // LoadingCompleter zaten çalışacak, ekstra bir şey yapma
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [navbarStyle])

  return (
    <>
      {overlayVisible && <LoadingOverlay isFadingOut={isFading} />}

      {/* SUSPENSE */}
      <Suspense fallback={null}>
        <div
          key={pathname}
          className='min-h-screen flex flex-col w-full max-w-full overflow-x-hidden'
        >
          <TopHorizontalBanner />

          {/* --- NAVBAR SEÇİM MANTIĞI --- */}
          {navbarStyle === undefined ? (
            <div className='h-16 bg-[var(--admin-input-bg)] animate-pulse' />
          ) : navbarStyle === 'v2' ? (
            <MegaNavbar />
          ) : (
            <NavigationBar />
          )}

          <main className='flex-1 w-full flex flex-col items-center'>
            {children}
          </main>

          <Footer />

          <LoadingCompleter onComplete={handleLoadingComplete} />
        </div>
      </Suspense>
    </>
  )
}
