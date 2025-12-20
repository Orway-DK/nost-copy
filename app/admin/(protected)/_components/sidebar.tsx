'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  IoChevronDown,
  IoChevronBack,
  IoChevronForward,
  IoSettingsOutline,
  IoFolderOpenOutline,
  IoGridOutline,
  IoLayersOutline,
  IoSpeedometerOutline,
  IoPeopleOutline,
  IoLocationOutline,
  IoClose,
  IoBriefcaseOutline
} from 'react-icons/io5'

// --- TİP TANIMLAMALARI ---
type Match = 'exact' | 'startsWith'
type Lang = 'tr' | 'en'

function getCookie (name: string) {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  if (match) return match[2]
  return null
}

type TranslationKey =
  | 'dashboard'
  | 'site_settings'
  | 'general'
  | 'social_links'
  | 'footer'
  | 'top_info_bar'
  | 'components'
  | 'categories'
  | 'all_categories'
  | 'add_category'
  | 'products'
  | 'all_products'
  | 'add_product'
  | 'ready_products'
  | 'management'
  | 'users'
  | 'landing_page'
  | 'why_us'
  | 'logout'
  | 'showcase'
  | 'scrolling_cats'
  | 'testimonials_page'
  | 'make_it_easier'
  | 'locations'
  | 'services'
  | 'about_page'

type MenuItem = {
  key: string
  labelKey: TranslationKey
  icon?: any
  href?: string
  match?: Match
  children?: MenuItem[]
}

const DICTIONARY: Record<TranslationKey, { tr: string; en: string }> = {
  dashboard: { tr: 'Kontrol Paneli', en: 'Dashboard' },
  site_settings: { tr: 'Site Ayarları', en: 'Site Settings' },
  general: { tr: 'Genel Ayarlar', en: 'General Settings' },
  social_links: { tr: 'Sosyal Linkler', en: 'Social Links' },
  footer: { tr: 'Alt Bilgi (Footer)', en: 'Footer' },
  top_info_bar: { tr: 'Üst Bilgi Çubuğu', en: 'Top Info Bar' },
  components: { tr: 'Site Bileşenleri', en: 'Components' },
  categories: { tr: 'Kategoriler', en: 'Categories' },
  all_categories: { tr: 'Tüm Kategoriler', en: 'All Categories' },
  add_category: { tr: 'Kategori Ekle', en: 'Add New Category' },
  products: { tr: 'Ürünler', en: 'Products' },
  all_products: { tr: 'Tüm Ürünler', en: 'All Products' },
  add_product: { tr: 'Ürün Ekle', en: 'Add New Product' },
  ready_products: { tr: 'Hazır Ürünler', en: 'Ready Products' },
  management: { tr: 'Yönetim', en: 'Management' },
  users: { tr: 'Kullanıcılar', en: 'Users' },
  landing_page: { tr: 'Açılış Sayfası', en: 'Landing Page' },
  why_us: { tr: 'Neden Biz', en: 'Why Us' },
  logout: { tr: 'Çıkış Yap', en: 'Logout' },
  showcase: { tr: 'Vitrin Yönetimi', en: 'Showcase' },
  scrolling_cats: { tr: 'Kayan Kategoriler', en: 'Scrolling Categories' },
  testimonials_page: { tr: 'Referanslar', en: 'Testimonials' },
  make_it_easier: { tr: 'Kolaylaştır', en: 'Make It Easier' },
  locations: { tr: 'Lokasyonlar', en: 'Locations' },
  services: { tr: 'Hizmetler', en: 'Services' },
  about_page: { tr: 'Hakkımızda', en: 'About Us' }
}

const STORAGE_KEY_EXPANDED = 'admin.sidebar.expanded'

type AdminSidebarProps = {
  isOpen?: boolean
  onClose?: () => void
  isCollapsed: boolean
  toggleCollapse: () => void
}

export default function AdminSidebar ({
  isOpen = false,
  onClose,
  isCollapsed,
  toggleCollapse
}: AdminSidebarProps) {
  const pathname = usePathname()
  const [lang, setLang] = useState<Lang>('en')
  const [mounted, setMounted] = useState(false)
  const [expandedSubmenus, setExpandedSubmenus] = useState<
    Record<string, boolean>
  >({})

  useEffect(() => {
    setMounted(true)
    const cookieLang = getCookie('NEXT_LOCALE')
    if (cookieLang === 'tr' || cookieLang === 'en') {
      setLang(cookieLang as Lang)
    } else if (
      typeof window !== 'undefined' &&
      navigator.language?.startsWith('tr')
    ) {
      setLang('tr')
    }

    try {
      const storedExpanded = localStorage.getItem(STORAGE_KEY_EXPANDED)
      if (storedExpanded) setExpandedSubmenus(JSON.parse(storedExpanded))
    } catch {}
  }, [])

  const t = (key: TranslationKey) => DICTIONARY[key][lang]

  const menuItems = useMemo<MenuItem[]>(
    () => [
      {
        key: 'dashboard',
        labelKey: 'dashboard',
        icon: IoSpeedometerOutline,
        href: '/admin',
        match: 'exact'
      },
      // --- DÜZELTME: Settings artık bir dropdown ---
      {
        key: 'settings',
        labelKey: 'site_settings',
        icon: IoSettingsOutline,
        match: 'startsWith', // /admin/settings ile başlayan her şeyde aktif görünsün (parent)
        children: [
          {
            key: 'settings_general',
            labelKey: 'general',
            href: '/admin/settings', // Genel Ayarlar (Ana sayfa)
            match: 'exact'
          },
          {
            key: 'settings_social',
            labelKey: 'social_links',
            href: '/admin/settings/social',
            match: 'exact'
          },
          {
            key: 'settings_footer',
            labelKey: 'footer',
            href: '/admin/settings/footer',
            match: 'exact'
          },
          {
            key: 'settings_topbar',
            labelKey: 'top_info_bar',
            href: '/admin/settings/top-info-bar',
            match: 'exact'
          }
        ]
      },
      {
        key: 'about',
        labelKey: 'about_page',
        icon: IoLocationOutline,
        href: '/admin/about',
        match: 'exact'
      },
      {
        key: 'locations',
        labelKey: 'locations',
        icon: IoLocationOutline,
        href: '/admin/locations',
        match: 'exact'
      },
      {
        key: 'services',
        labelKey: 'services',
        icon: IoBriefcaseOutline,
        href: '/admin/services',
        match: 'exact'
      },
      {
        key: 'products',
        labelKey: 'products',
        icon: IoGridOutline,
        href: '/admin/products',
        match: 'startsWith',
        children: [
          {
            key: 'prod_all',
            labelKey: 'all_products',
            href: '/admin/products',
            match: 'exact'
          },
          {
            key: 'prod_add',
            labelKey: 'add_product',
            href: '/admin/products/new',
            match: 'exact'
          }
        ]
      },
      {
        key: 'categories',
        labelKey: 'categories',
        icon: IoFolderOpenOutline,
        href: '/admin/categories',
        match: 'startsWith',
        children: [
          {
            key: 'cat_all',
            labelKey: 'all_categories',
            href: '/admin/categories',
            match: 'exact'
          },
          {
            key: 'cat_add',
            labelKey: 'add_category',
            href: '/admin/categories/new',
            match: 'exact'
          }
        ]
      },
      {
        key: 'components',
        labelKey: 'components',
        icon: IoLayersOutline,
        match: 'startsWith',
        children: [
          {
            key: 'landing',
            labelKey: 'landing_page',
            href: '/admin/showcase/landing',
            match: 'exact'
          },
          {
            key: 'scrolling',
            labelKey: 'scrolling_cats',
            href: '/admin/showcase/scrolling-categories',
            match: 'exact'
          },
          {
            key: 'ready',
            labelKey: 'ready_products',
            href: '/admin/showcase/ready-products',
            match: 'exact'
          },
          {
            key: 'whyus',
            labelKey: 'why_us',
            href: '/admin/showcase/why-us',
            match: 'exact'
          },
          {
            key: 'makeiteasier',
            labelKey: 'make_it_easier',
            href: '/admin/showcase/make-it-easier',
            match: 'exact'
          },
          {
            key: 'testimonials',
            labelKey: 'testimonials_page',
            href: '/admin/showcase/testimonials',
            match: 'exact'
          }
        ]
      }
    ],
    [lang]
  )

  const toggleSubmenu = (key: string) => {
    if (isCollapsed) {
      toggleCollapse()
    }
    setExpandedSubmenus(prev => {
      const next = { ...prev, [key]: !prev[key] }
      localStorage.setItem(STORAGE_KEY_EXPANDED, JSON.stringify(next))
      return next
    })
  }

  const isActive = (href?: string, match: Match = 'startsWith') =>
    href
      ? match === 'exact'
        ? pathname === href
        : pathname.startsWith(href)
      : false

  if (!mounted) return null

  return (
    <>
      {/* MOBİL OVERLAY */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* SIDEBAR CONTAINER */}
      <aside
        className={`
            fixed top-0 left-0 z-50 h-full
            bg-[var(--admin-card)] border-r border-[var(--admin-card-border)]
            transition-all duration-300 ease-in-out
            lg:translate-x-0
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            ${isCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        {/* Header */}
        <div
          className={`h-16 flex items-center border-b border-[var(--admin-card-border)] ${
            isCollapsed ? 'justify-center px-0' : 'justify-between px-6'
          }`}
        >
          {!isCollapsed ? (
            <span className='font-bold text-xl tracking-tight text-[var(--admin-fg)] whitespace-nowrap overflow-hidden'>
              Nost<span className='text-[var(--admin-muted)]'>Copy</span>
            </span>
          ) : (
            <span className='font-bold text-xl text-[var(--admin-fg)]'>N</span>
          )}

          <button
            onClick={onClose}
            className='lg:hidden p-1 hover:bg-[var(--admin-input-bg)] rounded text-[var(--admin-muted)]'
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Menü */}
        <nav className='p-3 overflow-y-auto h-[calc(100vh-8rem)] scrollbar-hide'>
          <ul className='space-y-1'>
            {menuItems.map(item => {
              const hasChildren = item.children && item.children.length > 0
              const active = isActive(item.href, item.match)
              const open = expandedSubmenus[item.key]
              const Icon = item.icon

              // Parent (Ana Menü) aktif mi? (Alt sayfalardan biri seçiliyse parent da aktif görünsün)
              // match: 'startsWith' olduğu için pathname '/admin/settings/social' ise '/admin/settings' true döner.
              const isParentActive = hasChildren
                ? item.children?.some(child =>
                    isActive(child.href, child.match)
                  )
                : active

              return (
                <li key={item.key}>
                  <div
                    className={`
                        group flex items-center rounded-lg cursor-pointer select-none transition-all duration-200 relative
                        ${
                          isCollapsed
                            ? 'justify-center px-0 py-3'
                            : 'justify-between px-3 py-2.5'
                        }
                        ${
                          isParentActive && !open // Alt menü kapalıyken parent'ı vurgula
                            ? 'bg-[var(--admin-input-bg)] text-[var(--admin-fg)] font-medium'
                            : active && !hasChildren // Tekil link aktifse
                            ? 'bg-[var(--admin-accent)] text-[var(--admin-bg)] font-medium'
                            : 'text-[var(--admin-muted)] hover:bg-[var(--admin-input-bg)] hover:text-[var(--admin-fg)]'
                        }
                    `}
                    onClick={() =>
                      hasChildren ? toggleSubmenu(item.key) : onClose?.()
                    }
                    title={isCollapsed ? t(item.labelKey) : ''}
                  >
                    {item.href && !hasChildren ? (
                      <Link
                        href={item.href}
                        className={`flex items-center ${
                          isCollapsed ? 'justify-center w-full' : 'flex-1 gap-3'
                        }`}
                      >
                        {Icon && <Icon size={isCollapsed ? 22 : 18} />}
                        {!isCollapsed && <span>{t(item.labelKey)}</span>}
                      </Link>
                    ) : (
                      <div
                        className={`flex items-center ${
                          isCollapsed ? 'justify-center w-full' : 'flex-1 gap-3'
                        }`}
                      >
                        {Icon && <Icon size={isCollapsed ? 22 : 18} />}
                        {!isCollapsed && <span>{t(item.labelKey)}</span>}
                      </div>
                    )}

                    {!isCollapsed && hasChildren && (
                      <IoChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${
                          open ? 'rotate-180' : ''
                        }`}
                      />
                    )}

                    {isCollapsed && hasChildren && (
                      <div className='absolute right-1 top-1 w-1.5 h-1.5 bg-[var(--admin-muted)] rounded-full opacity-50' />
                    )}
                  </div>

                  {!isCollapsed && hasChildren && open && (
                    <ul className='mt-1 ml-4 pl-3 border-l border-[var(--admin-card-border)] space-y-1 animate-in slide-in-from-top-1 duration-200'>
                      {item.children!.map(child => {
                        const childActive = isActive(child.href, child.match)
                        return (
                          <li key={child.key}>
                            <Link
                              href={child.href || '#'}
                              onClick={onClose}
                              className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                                childActive
                                  ? 'text-[var(--admin-accent)] font-medium bg-[var(--admin-input-bg)]'
                                  : 'text-[var(--admin-muted)] hover:text-[var(--admin-fg)]'
                              }`}
                            >
                              {t(child.labelKey)}
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </li>
              )
            })}

            <li className='pt-4 pb-2'>
              {!isCollapsed && (
                <span className='px-3 text-xs font-bold uppercase tracking-wider opacity-40 text-[var(--admin-muted)] animate-in fade-in'>
                  {t('management')}
                </span>
              )}
              {isCollapsed && (
                <div className='h-[1px] mx-2 bg-[var(--admin-card-border)]'></div>
              )}
            </li>
            <li>
              <Link
                href='/admin/users'
                onClick={onClose}
                className={`flex items-center rounded-lg text-sm text-[var(--admin-muted)] hover:bg-[var(--admin-input-bg)] opacity-50 cursor-not-allowed
                    ${isCollapsed ? 'justify-center py-3' : 'px-3 py-2.5 gap-3'}
                `}
                title={isCollapsed ? t('users') : ''}
              >
                <IoPeopleOutline size={isCollapsed ? 22 : 18} />
                {!isCollapsed && <span>{t('users')}</span>}
              </Link>
            </li>
          </ul>
        </nav>

        {/* Footer Toggle */}
        <div className='absolute bottom-0 w-full p-4 border-t border-[var(--admin-card-border)] hidden lg:flex justify-end bg-[var(--admin-card)]'>
          <button
            onClick={toggleCollapse}
            className='p-2 rounded-lg hover:bg-[var(--admin-input-bg)] text-[var(--admin-muted)] hover:text-[var(--admin-fg)] transition-colors'
          >
            {isCollapsed ? (
              <IoChevronForward size={20} />
            ) : (
              <IoChevronBack size={20} />
            )}
          </button>
        </div>
      </aside>
    </>
  )
}
