'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import AdminNavbar from './navbar'
import AdminSidebar from './sidebar'
import { IoMenu } from 'react-icons/io5'
import { Toaster } from 'react-hot-toast'
import { AdminProgressBar } from "./AdminProgressBar"

const STORAGE_KEY_COLLAPSED = 'admin.sidebar.collapsed'

export default function AdminLayoutClient ({
  children
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    const storedCollapsed = localStorage.getItem(STORAGE_KEY_COLLAPSED)
    if (storedCollapsed) setIsCollapsed(JSON.parse(storedCollapsed))
  }, [])

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  const toggleCollapse = () => {
    const next = !isCollapsed
    setIsCollapsed(next)
    localStorage.setItem(STORAGE_KEY_COLLAPSED, JSON.stringify(next))
  }

  if (!mounted) return <div className='min-h-screen bg-admin-bg' />

  return (
    // 1. ANA KAPSAYICI
    <div className='h-screen w-screen bg-admin-bg text-admin-fg font-sans flex overflow-hidden'>
      
      {/* LOADER BURAYA EKLENDİ - Artık rengini CSS'ten dinamik alacak */}
      <AdminProgressBar />

      <Toaster
        position='top-right'
        toastOptions={{
          className: 'text-sm font-medium shadow-md',
          duration: 4000,
          style: {
            background: 'var(--admin-card)',
            color: 'var(--admin-fg)',
            border: '1px solid var(--admin-card-border)'
          }
        }}
      />

      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
      />

      {/* 2. İÇERİK KOLONU */}
      <div
        className={`
        flex-1 flex flex-col min-w-0 h-full
        transition-[margin] duration-300 ease-in-out 
        ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
      `}
      >
        {/* NAVBAR */}
        <div className='shrink-0 z-40 flex flex-col border-b border-admin-card-border'>
          <div className='lg:hidden bg-admin-card p-4 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <button
                onClick={() => setSidebarOpen(true)}
                className='p-2 -ml-2 text-admin-fg hover:bg-admin-input-bg rounded-md'
              >
                <IoMenu size={24} />
              </button>
              <span className='font-bold text-lg'>Admin Panel</span>
            </div>
          </div>
          <div className='hidden lg:block'>
            <AdminNavbar />
          </div>
        </div>

        {/* 3. SAYFA ALANI (MAIN) */}
        <main className='flex-1 overflow-hidden p-4 w-full h-full relative'>
          {children}
        </main>
      </div>
    </div>
  )
}