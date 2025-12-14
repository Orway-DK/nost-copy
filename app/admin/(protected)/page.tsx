import { adminSupabase } from '@/lib/supabase/admin'
import {
  IoCubeOutline,
  IoFolderOpenOutline,
  IoImagesOutline,
  IoFlashOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard () {
  // Paralel veri çekimi
  const [
    { count: productsCount },
    { count: categoriesCount },
    { count: readyCount },
    { count: slidesCount }
  ] = await Promise.all([
    adminSupabase.from('products').select('*', { count: 'exact', head: true }),
    adminSupabase
      .from('categories')
      .select('*', { count: 'exact', head: true }),
    adminSupabase
      .from('homepage_ready_products')
      .select('*', { count: 'exact', head: true }),
    adminSupabase
      .from('landing_slides')
      .select('*', { count: 'exact', head: true })
  ])

  const stats = [
    {
      label: 'Toplam Ürün',
      count: productsCount || 0,
      icon: IoCubeOutline,
      href: '/admin/products',
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      label: 'Kategoriler',
      count: categoriesCount || 0,
      icon: IoFolderOpenOutline,
      href: '/admin/categories',
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-900/20'
    },
    {
      label: 'Hazır Ürünler',
      count: readyCount || 0,
      icon: IoFlashOutline,
      href: '/admin/ready-products',
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      label: 'Slider Görselleri',
      count: slidesCount || 0,
      icon: IoImagesOutline,
      href: '/admin/landing',
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20'
    }
  ]

  return (
    <div className='space-y-8 animate-in fade-in duration-500'>
      {/* Header */}
      <div className='admin-page-header'>
        <div>
          <h2 className='admin-page-title'>Kontrol Paneli</h2>
          <p className='text-[var(--admin-muted)] text-sm'>
            Site durumuna genel bakış.
          </p>
        </div>
      </div>

      {/* İSTATİSTİK KARTLARI (Responsive Grid) */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
        {stats.map(stat => (
          <Link
            key={stat.label}
            href={stat.href}
            className='card-admin p-6 flex items-center justify-between hover:border-[var(--admin-accent)] transition-colors group'
          >
            <div>
              <p className='text-sm font-medium text-[var(--admin-muted)]'>
                {stat.label}
              </p>
              <p className='text-3xl font-bold mt-2 text-[var(--admin-fg)]'>
                {stat.count}
              </p>
            </div>
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}
            >
              <stat.icon />
            </div>
          </Link>
        ))}
      </div>

      {/* ALT BÖLÜM (2 Kolonlu) */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Sistem Durumu */}
        <div className='card-admin lg:col-span-2'>
          <h3 className='text-lg font-bold mb-4 text-[var(--admin-fg)]'>
            Sistem Durumu
          </h3>
          <div className='space-y-4'>
            {/* Status Item */}
            <div className='flex items-center gap-4 p-4 rounded-lg bg-[var(--admin-input-bg)] border border-[var(--admin-card-border)]'>
              <div className='p-2 bg-green-100 text-green-600 rounded-full'>
                <IoCheckmarkCircleOutline size={24} />
              </div>
              <div className='flex-1'>
                <h4 className='font-medium text-[var(--admin-fg)]'>
                  Veritabanı
                </h4>
                <p className='text-xs text-[var(--admin-muted)]'>
                  Supabase bağlantısı aktif.
                </p>
              </div>
              <span className='badge-admin badge-admin-success'>ONLINE</span>
            </div>
          </div>
        </div>

        {/* Hızlı İpucu vs. */}
        <div className='card-admin'>
          <h3 className='text-lg font-bold mb-4 text-[var(--admin-fg)]'>
            Ziyaretçiler
          </h3>
          <div className='flex flex-col items-center justify-center h-48 text-[var(--admin-muted)] text-sm text-center'>
            <p>Analitik verileri buraya gelecek.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
