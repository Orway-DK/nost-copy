'use client'

import { ThemeProvider } from 'next-themes'
import { useEffect, useState } from 'react'

export function AdminThemeProvider ({
  children
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className='admin-root'>{children}</div>
  }

  return (
    <ThemeProvider
      attribute='class'
      defaultTheme='system'
      enableSystem
      // disableTransitionOnChange  <-- BU SATIRI SİLİYORUZ!
    >
      {children}
    </ThemeProvider>
  )
}
