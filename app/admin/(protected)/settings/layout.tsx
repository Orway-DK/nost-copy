// C:\Projeler\nost-copy\app\admin\(protected)\settings\layout.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SlSettings, SlShare, SlList, SlInfo } from 'react-icons/sl'

export default function SettingsLayout ({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const tabs = [
    { name: 'Genel', href: '/admin/settings', icon: <SlSettings /> },
    { name: 'Sosyal Medya', href: '/admin/settings/social', icon: <SlShare /> },
    { name: 'Footer Menü', href: '/admin/settings/footer', icon: <SlList /> },
    {
      name: 'Üst Bilgi',
      href: '/admin/settings/top-info-bar',
      icon: <SlInfo />
    }
  ]

  return (
    <div className='space-y-6'>
      {/* HEADER */}
      <div className='admin-page-header'>
        <div>
          <h1 className='admin-page-title'>Site Ayarları</h1>
          <p className='text-[var(--admin-muted)] text-sm'>
            Genel site yapılandırması ve içerik yönetimi.
          </p>
        </div>
      </div>

      {/* TABS (Mobil Scrollable) */}
      <div className='border-b border-[var(--admin-card-border)] overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0'>
        <div className='flex space-x-1 min-w-max'>
          {tabs.map(tab => {
            const isActive = pathname === tab.href
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`
                    flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all
                    ${
                      isActive
                        ? 'border-[var(--admin-accent)] text-[var(--admin-accent)] bg-[var(--admin-input-bg)] rounded-t-lg'
                        : 'border-transparent text-[var(--admin-muted)] hover:text-[var(--admin-fg)] hover:bg-[var(--admin-bg)]'
                    }
                `}
              >
                <span className='text-lg'>{tab.icon}</span>
                {tab.name}
              </Link>
            )
          })}
        </div>
      </div>

      {/* CONTENT */}
      <div className='animate-in fade-in slide-in-from-bottom-2 duration-300'>
        {children}
      </div>
    </div>
  )
}
