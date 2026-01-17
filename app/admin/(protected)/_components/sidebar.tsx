'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import {
  IoChevronDown,
  IoChevronBack,
  IoChevronForward,
  IoSettingsOutline,
  IoFolderOpenOutline,
  IoSpeedometerOutline,
  IoClose,
  IoDocumentsOutline,
  IoBusinessOutline,
  IoConstructOutline,
  IoListOutline,
  IoCubeOutline,
  IoLayersOutline
} from 'react-icons/io5'

export default function AdminSidebar ({
  isOpen = false,
  onClose,
  isCollapsed,
  toggleCollapse,
  mainMenus = []
}: {
  isOpen?: boolean
  onClose?: () => void
  isCollapsed: boolean
  toggleCollapse: () => void
  mainMenus: any[]
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [expandedSubmenus, setExpandedSubmenus] = useState<
    Record<string, boolean>
  >({ pages: true })

  // Dil tespiti (Hata riskine karşı en basit hali)
  const lang =
    typeof document !== 'undefined' &&
    document.cookie.includes('NEXT_LOCALE=de')
      ? 'de'
      : typeof document !== 'undefined' &&
        document.cookie.includes('NEXT_LOCALE=en')
      ? 'en'
      : 'tr'

  const menuItems = useMemo(() => {
    // Veritabanından gelen Dinamik Sayfalar
    const dynamicLinks = (mainMenus || [])
      .filter(menu => {
        const labelData = menu?.label || {}
        const labelLower = JSON.stringify(labelData).toLowerCase()
        // Sadece ürün, hizmet, kurumsal içerenleri göster
        return (
          labelLower.includes('ürün') ||
          labelLower.includes('hizmet') ||
          labelLower.includes('kurumsal')
        )
      })
      .map(menu => {
        const labelData = menu?.label || {}
        const labelText =
          typeof labelData === 'string'
            ? labelData
            : labelData[lang] || labelData['tr'] || 'Adsız'
        const labelLower = JSON.stringify(labelData).toLowerCase()

        // currentSlug için url'yi kullan (örn: "/home" -> "home")
        const currentSlug = menu.url ? menu.url.replace(/^\//, '').split('?')[0] : ''
        
        let href = `/admin/pages?slug=${currentSlug}`
        let icon = IoFolderOpenOutline

        if (labelLower.includes('ürün')) {
          href = `/admin/services?filter=products`
          icon = IoCubeOutline
        } else if (labelLower.includes('hizmet')) {
          href = `/admin/services?filter=services`
          icon = IoConstructOutline
        } else if (labelLower.includes('kurumsal')) {
          href = `/admin/pages?filter=corporate`
          icon = IoBusinessOutline
        }

        return { key: `dyn_${menu.id}`, label: labelText, href, icon }
      })

    // Sabit Menü Yapısı
    return [
      {
        key: 'dash',
        label: 'Panel',
        icon: IoSpeedometerOutline,
        href: '/admin'
      },
      {
        key: 'menu',
        label: 'Menü Yönetimi',
        icon: IoListOutline,
        href: '/admin/menu'
      },
      {
        key: 'pages',
        label: 'Sayfalar',
        icon: IoDocumentsOutline,
        children: dynamicLinks
      },
      {
        key: 'settings',
        label: 'Ayarlar',
        icon: IoSettingsOutline,
        children: [
          { key: 'gen', label: 'Genel', href: '/admin/settings' },
          { key: 'loc', label: 'Lokasyonlar', href: '/admin/locations' }
        ]
      },
      {
        key: 'comp',
        label: 'Bileşenler',
        icon: IoLayersOutline,
        children: [
          { key: 'lnd', label: 'Açılış', href: '/admin/showcase/landing' },
          { key: 'mke', label: 'Kolaylaştır', href: '/admin/showcase/make-it-easier' },
          { key: 'rdy', label: 'Hazır Ürünler', href: '/admin/showcase/ready-products' },
          { key: 'scr', label: 'Kayanlar', href: '/admin/showcase/scrolling-categories' },
          { key: 'tst', label: 'Referanslar', href: '/admin/showcase/testimonials' },
          { key: 'why', label: 'Neden Biz', href: '/admin/showcase/why-us' }
        ]
      }
    ]
  }, [lang, mainMenus])

  const isActive = (href?: string) => {
    if (!href) return false
    const [path, query] = href.split('?')
    if (pathname !== path) return false
    if (query) {
      const params = new URLSearchParams(query)
      return Array.from(params.entries()).every(
        ([k, v]) => searchParams.get(k) === v
      )
    }
    return true
  }

  return (
    <>
      {/* Mobil Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-[60] lg:hidden ${
          isOpen ? 'block' : 'hidden'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed top-0 left-0 z-[70] h-full bg-[#1a1a1a] text-white transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className='h-12 flex items-center justify-between px-6 border-b border-white/10'>
          {!isCollapsed && (
            <span className='font-black tracking-tighter text-xl'>
              NOST COPY
            </span>
          )}
          <button onClick={onClose} className='lg:hidden'>
            <IoClose size={20} />
          </button>
        </div>

        <nav className='p-4 space-y-2 overflow-y-auto h-[calc(100vh-10rem)]'>
          {menuItems.map(item => {
            const hasChildren = item.children && item.children.length > 0
            const open = expandedSubmenus[item.key]
            const isChildActive =
              hasChildren && item.children?.some(c => isActive(c.href))
            const active = isActive(item.href) || isChildActive

            return (
              <div key={item.key} className='relative'>
                <div
                  onClick={() =>
                    hasChildren &&
                    setExpandedSubmenus(prev => ({
                      ...prev,
                      [item.key]: !prev[item.key]
                    }))
                  }
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    active
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon size={22} className='flex-shrink-0' />
                  {!isCollapsed && (
                    <span className='flex-1 font-semibold text-sm truncate'>
                      {item.label}
                    </span>
                  )}
                  {!isCollapsed && hasChildren && (
                    <IoChevronDown
                      className={`transition-transform ${
                        open ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                  {item.href && !hasChildren && (
                    <Link href={item.href} className='absolute inset-0' />
                  )}
                </div>

                {!isCollapsed && hasChildren && open && (
                  <div className='ml-9 mt-2 space-y-1 border-l border-white/10 pl-3'>
                    {item.children?.map(child => (
                      <Link
                        key={child.key}
                        href={child.href || '#'}
                        className={`block p-2 text-xs rounded-lg transition-colors ${
                          isActive(child.href)
                            ? 'text-blue-400 font-bold'
                            : 'text-gray-500 hover:text-white'
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <button
          onClick={toggleCollapse}
          className='absolute bottom-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-xl hidden lg:block border border-white/10'
        >
          {isCollapsed ? (
            <IoChevronForward size={20} />
          ) : (
            <IoChevronBack size={20} />
          )}
        </button>
      </aside>
    </>
  )
}
