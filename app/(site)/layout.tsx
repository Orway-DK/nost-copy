// C:\Projeler\nost-copy\app\(site)\layout.tsx
import { ReactNode } from 'react'
import SiteEntry from './_components/SiteEntry'
import GlobalBackground from '../_components/GlobalBackground/page'

export default function SiteLayout ({ children }: { children: ReactNode }) {
  return (
    <>
      <GlobalBackground />
      <SiteEntry>{children}</SiteEntry>
    </>
  )
}
