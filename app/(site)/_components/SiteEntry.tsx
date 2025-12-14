// C:\Projeler\nost-copy\app\(site)\_components\SiteEntry.tsx
'use client'

import dynamic from 'next/dynamic'
import LoadingOverlay from '@/components/LoadingOverlay'
import { ReactNode } from 'react'

const SiteShell = dynamic(() => import('./SiteShell'), {
  ssr: false,
  loading: () => <LoadingOverlay />
})

export default function SiteEntry ({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>
}
