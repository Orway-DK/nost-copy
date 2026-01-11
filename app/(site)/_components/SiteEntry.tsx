'use client'

import dynamic from 'next/dynamic'
import { ReactNode } from 'react'
import LoadingOverlay from '@/components/LoadingOverlay'

import { FavoritesProvider } from '@/app/_components/Favorites'

const SiteShell = dynamic(() => import('./SiteShell'), {
  ssr: false,
  loading: () => <LoadingOverlay />
})

export default function SiteEntry ({ children }: { children: ReactNode }) {
  return (
    <FavoritesProvider>
      <SiteShell>{children}</SiteShell>
    </FavoritesProvider>
  )
}
