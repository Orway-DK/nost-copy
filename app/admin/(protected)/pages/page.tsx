import { createSupabaseServerClient } from '@/lib/supabase/server-client'
import Link from 'next/link'
import { IoPencil, IoEyeOutline, IoBusinessOutline } from 'react-icons/io5'

export const dynamic = 'force-dynamic'

export default async function AdminPagesList ({
  searchParams
}: {
  searchParams: Promise<any>
}) {
  const supabase = await createSupabaseServerClient()
  const params = await searchParams
  const filter = params.filter as string | undefined

  // Yeni tabloyu kullan
  const { data: pages, error } = await supabase
    .from('nost-corporate-pages')
    .select('*')
    .order('id', { ascending: true })
  
  if (error) {
    console.error('Error fetching pages:', error)
  }
  
  const pageTitle = filter === 'corporate' ? 'Kurumsal Sayfalar' : 'Sayfa Yönetimi'
  const pageDescription = filter === 'corporate' 
    ? 'Kurumsal sayfaları (Hakkımızda, Vizyon, Misyon, vb.) buradan yönetebilirsiniz.'
    : 'Statik içerik sayfalarını (KVKK, Sözleşmeler, vb.) buradan yönetebilirsiniz.'

  return (
    <div className='p-4 md:p-8 space-y-10 max-w-[1600px] mx-auto'>
      {/* Header */}
      <div className='flex justify-between items-end'>
        <div>
          <h1 className='text-2xl font-bold flex items-center gap-3'>
            {filter === 'corporate' && <IoBusinessOutline className='text-blue-500' />}
            {pageTitle}
          </h1>
          <p className='text-[var(--admin-muted)] text-xs mt-1'>
            {pageDescription}
          </p>
        </div>
        {/* Yeni Ekle butonu istenirse buraya eklenebilir */}
      </div>

      {/* Liste - Scroll edilebilir container */}
      <div className='bg-[var(--admin-card)] border border-[var(--admin-card-border)] rounded-xl shadow-sm overflow-hidden'>
        <div className='overflow-x-auto max-h-[calc(100vh-300px)] overflow-y-auto'>
          <table className='w-full text-left'>
            <thead className='bg-[var(--admin-input-bg)] text-xs uppercase font-semibold text-[var(--admin-muted)] border-b border-[var(--admin-card-border)]'>
              <tr>
                <th className='p-4'>Slug (URL)</th>
                <th className='p-4 w-24'>Hero Görsel</th>
                <th className='p-4 w-24 text-center'>Durum</th>
                <th className='p-4 w-32 text-right'>İşlem</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-[var(--admin-card-border)]'>
              {pages?.map((page: any) => (
                <tr key={page.id} className='hover:bg-black/5 transition-colors'>
                  <td className='p-4'>
                    <div className='font-bold text-sm'>/{page.slug}</div>
                    <div className='text-[10px] font-mono opacity-50'>
                      ID: {page.id}
                    </div>
                  </td>
                  <td className='p-4'>
                    {page.image_url ? (
                      <img
                        src={page.image_url}
                        alt='Hero'
                        className='w-16 h-10 object-cover rounded-md border border-[var(--admin-card-border)]'
                      />
                    ) : (
                      <span className='text-[var(--admin-muted)] text-xs'>-</span>
                    )}
                  </td>
                  <td className='p-4 text-center'>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        page.active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {page.active ? 'AKTİF' : 'PASİF'}
                    </span>
                  </td>
                  <td className='p-4 text-right'>
                    <div className='flex justify-end gap-2'>
                      <Link
                        href={`/${page.slug}`}
                        target='_blank'
                        className='p-2 text-[var(--admin-muted)] hover:text-[var(--admin-fg)]'
                        title='Sitede Gör'
                      >
                        <IoEyeOutline size={18} />
                      </Link>
                      <Link
                        href={`/admin/pages/${page.slug}`}
                        className='p-2 text-[var(--primary)]'
                        title='Düzenle'
                      >
                        <IoPencil size={18} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {(!pages || pages.length === 0) && (
                <tr>
                  <td colSpan={4} className='p-8 text-center text-[var(--admin-muted)]'>
                    Henüz hiç sayfa oluşturulmamış.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
