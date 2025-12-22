// C:\Projeler\nost-copy\app\admin\layout.tsx
import React from 'react'
import './admin-theme.css'
import { AdminThemeProvider } from './_components/AdminThemeProvider'
export default function AdminShellLayout ({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AdminThemeProvider>
        <div className='admin-root antialiased'>{children}</div>
      </AdminThemeProvider>
    </>
  )
}
