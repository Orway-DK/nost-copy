'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import AdminNavbar from './navbar'
import AdminSidebar from './sidebar'
import { IoMenu } from 'react-icons/io5'

const STORAGE_KEY_COLLAPSED = 'admin.sidebar.collapsed'

export default function AdminLayoutClient ({
  children
}: {
  children: React.ReactNode
}) {
  // State: Mobilde sidebar açık mı?
  const [isSidebarOpen, setSidebarOpen] = useState(false)

  // State: Masaüstünde sidebar daraltılmış (ikon modu) mı?
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Hydration fix için
  const [mounted, setMounted] = useState(false)

  const pathname = usePathname()

  // 1. Mount olduğunda LocalStorage'dan tercihi oku
  useEffect(() => {
    setMounted(true)
    try {
      const storedCollapsed = localStorage.getItem(STORAGE_KEY_COLLAPSED)
      if (storedCollapsed) {
        setIsCollapsed(JSON.parse(storedCollapsed))
      }
    } catch (e) {
      console.error('LocalStorage error:', e)
    }
  }, [])

  // 2. Sayfa değiştiğinde mobilde sidebar'ı kapat
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // 3. Sidebar daraltma/genişletme fonksiyonu
  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY_COLLAPSED, JSON.stringify(next))
      return next
    })
  }

  if (!mounted) {
    // Hydration mismatch olmaması için boş veya loading dönebiliriz,
    // ya da varsayılan bir yapı render edebiliriz.
    return <div className='min-h-screen bg-[var(--admin-bg)]' />
  }

  return (
    <div className='min-h-screen bg-[var(--admin-bg)] text-[var(--admin-fg)] font-sans flex relative'>
      {/* SIDEBAR */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
      />

      {/* ANA İÇERİK ALANI */}
      {/* lg:ml-20 -> Sidebar daraltılmışsa (80px)
          lg:ml-64 -> Sidebar açıksa (256px)
          transition-all -> Yumuşak geçiş sağlar
      */}
      <div
        className={`
            flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out
            ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
        `}
      >
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

          {/* Desktop Navbar */}
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
