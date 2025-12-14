// C:\Projeler\nost-copy\app\(site)\layout.tsx
import { ReactNode } from 'react'
import SiteEntry from './_components/SiteEntry'

export default function SiteLayout ({ children }: { children: ReactNode }) {
  return <SiteEntry>{children}</SiteEntry>
}
