import { getPagesListAction } from './actions'
import Link from 'next/link'
import { IoPencil, IoEyeOutline } from 'react-icons/io5'

export const dynamic = 'force-dynamic'

export default async function AdminPagesList () {
  const res = await getPagesListAction()
  const pages = res.success ? res.data : []

  return (
    <div className='h-full w-full flex flex-col p-4 animate-in fade-in'>
      {/* Header */}
      <div className='mb-6 flex justify-between items-end'>
        <div>
          <h1 className='text-2xl font-bold text-[var(--admin-fg)]'>
            Sayfa Yönetimi
          </h1>
          <p className='text-[var(--admin-muted)] text-sm'>
            Statik içerik sayfalarını (KVKK, Sözleşmeler, vb.) buradan
            yönetebilirsiniz.
          </p>
        </div>
        {/* Yeni Ekle butonu istenirse buraya eklenebilir */}
      </div>
      <div className='h-1 w-12 bg-[var(--primary)] rounded-full mb-6 -mt-4'></div>

      {/* Liste */}
      <div className='bg-[var(--admin-card)] border border-[var(--admin-card-border)] rounded-xl overflow-hidden shadow-sm'>
        <table className='w-full text-left border-collapse'>
          <thead className='bg-[var(--admin-input-bg)] text-[var(--admin-muted)] text-xs uppercase font-semibold'>
            <tr>
              <th className='p-4 border-b border-[var(--admin-card-border)]'>
                Slug (URL)
              </th>
              <th className='p-4 border-b border-[var(--admin-card-border)]'>
                Hero Görsel
              </th>
              <th className='p-4 border-b border-[var(--admin-card-border)]'>
                Durum
              </th>
              <th className='p-4 border-b border-[var(--admin-card-border)] text-right'>
                İşlem
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-[var(--admin-card-border)]'>
            {pages?.map((page: any) => (
              <tr
                key={page.id}
                className='hover:bg-[var(--admin-input-bg)]/50 transition-colors'
              >
                <td className='p-4 font-mono text-sm text-[var(--primary)] font-medium'>
                  /{page.slug}
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
                <td className='p-4'>
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-bold ${
                      page.active
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    {page.active ? 'Aktif' : 'Pasif'}
                  </span>
                </td>
                <td className='p-4 text-right'>
                  <div className='flex justify-end gap-2'>
                    <Link
                      href={`/${page.slug}`}
                      target='_blank'
                      className='p-2 rounded-lg text-[var(--admin-muted)] hover:text-[var(--admin-fg)] hover:bg-[var(--admin-input-bg)] transition-colors'
                      title='Sitede Gör'
                    >
                      <IoEyeOutline size={18} />
                    </Link>
                    <Link
                      href={`/admin/pages/${page.slug}`}
                      className='flex items-center gap-2 px-3 py-1.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg text-sm font-medium hover:brightness-110 transition-all'
                    >
                      <IoPencil size={14} /> Düzenle
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {pages?.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className='p-8 text-center text-[var(--admin-muted)]'
                >
                  Henüz hiç sayfa oluşturulmamış. Veritabanından ekleme yapın.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
