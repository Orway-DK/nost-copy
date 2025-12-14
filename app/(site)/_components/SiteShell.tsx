'use client'

import { useState, Suspense, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import LoadingOverlay from '@/components/LoadingOverlay'
import LoadingCompleter from '@/components/LoadingCompleter'

import TopHorizontalBanner from '@/app/_components/TopHorizontalBanner'
import NavigationBar from '@/app/_components/NavigationBar/NavigationBar'
import Footer from '@/app/_components/Footer'

export default function SiteShell ({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const [overlayVisible, setOverlayVisible] = useState(true)
  const [isFading, setIsFading] = useState(false)

  useEffect(() => {
    setOverlayVisible(true)
    setIsFading(false)
  }, [pathname])

  const handleLoadingComplete = useCallback(() => {
    const timer = setTimeout(() => {
      setIsFading(true)

      setTimeout(() => {
        setOverlayVisible(false)
      }, 700)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

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
          <NavigationBar />

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
