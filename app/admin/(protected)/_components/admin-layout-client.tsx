'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import AdminNavbar from './navbar'
import AdminSidebar from './sidebar'
import { IoMenu } from 'react-icons/io5'

export default function AdminLayoutClient ({
  children
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Sayfa değiştiğinde sidebar'ı mobilde kapat
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  return (
    <div className='min-h-screen bg-[var(--admin-bg)] text-[var(--admin-fg)] font-sans flex relative'>
      {/* SIDEBAR */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ANA İÇERİK ALANI */}
      {/* lg:ml-64: Masaüstünde sidebar kadar boşluk bırak */}
      <div className='flex-1 flex flex-col min-w-0 lg:ml-64 transition-all duration-300'>
        {/* NAVBAR */}
        <div className='sticky top-0 z-20'>
          {/* Mobilde hamburger menü */}
          <div className='lg:hidden bg-[var(--admin-card)] border-b border-[var(--admin-card-border)] p-4 flex items-center gap-4'>
            <button
              onClick={() => setSidebarOpen(true)}
              className='p-2 -ml-2 text-[var(--admin-fg)] hover:bg-[var(--admin-input-bg)] rounded-md'
            >
              <IoMenu size={24} />
            </button>
            <span className='font-bold text-lg'>Admin Panel</span>
          </div>

          <div className='hidden lg:block'>
            <AdminNavbar />
          </div>
        </div>

        {/* CONTENT */}
        <main className='p-4 md:p-8 w-full max-w-[1600px] mx-auto'>
          {children}
        </main>
      </div>
    </div>
  )
}
