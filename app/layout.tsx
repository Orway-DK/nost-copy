// C:\Projeler\nost-copy\app\layout.tsx
import type { Metadata } from 'next'
import { Geist, Oswald, Poppins, Onest } from 'next/font/google'
import './globals.css'
import './styles/marquee.css'

import { LanguageProvider } from '@/components/LanguageProvider'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap'
})
const onest = Onest({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
  weight: ['100', '200', '400', '700', '900']
})
const oswald = Oswald({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-oswald',
  display: 'swap'
})
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'Nost Copy',
  description: 'Nost Copy - Soner Coşkun'
}

export default function RootLayout ({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='tr'>
      <body
        className={`${geistSans.variable} ${oswald.variable} ${poppins.variable} ${onest.variable} antialiased`}
      >
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  )
}
