// DÜZELTME: Fonksiyon ismi 'getServicesListAction' yerine 'getServicesAction' yapıldı
import { getServicesAction } from './actions'
import Link from 'next/link'
import { IoPencil, IoEyeOutline } from 'react-icons/io5'

export const dynamic = 'force-dynamic'

export default async function AdminServicesList () {
  // DÜZELTME: Çağrılan fonksiyon ismi güncellendi
  const res = await getServicesAction()
  const services = res.success ? res.data : []

  return (
    <div className='h-full w-full flex flex-col p-4 animate-in fade-in'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-[var(--admin-fg)]'>
          Hizmet Yönetimi
        </h1>
        <p className='text-[var(--admin-muted)] text-sm'>
          Hizmet detay sayfalarını buradan yönetebilirsiniz.
        </p>
      </div>
      <div className='h-1 w-12 bg-[var(--primary)] rounded-full mb-6 -mt-4'></div>

      <div className='bg-[var(--admin-card)] border border-[var(--admin-card-border)] rounded-xl overflow-hidden shadow-sm'>
        <table className='w-full text-left'>
          <thead className='bg-[var(--admin-input-bg)] text-xs uppercase font-semibold text-[var(--admin-muted)]'>
            <tr>
              <th className='p-4'>Hizmet Adı (TR)</th>
              <th className='p-4'>Slug</th>
              <th className='p-4 text-right'>İşlem</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-[var(--admin-card-border)]'>
            {services?.map((svc: any) => {
              // Null check ekleyerek güvenli hale getirelim
              const trTitle =
                svc.service_translations?.find((t: any) => t.lang_code === 'tr')
                  ?.title || 'Başlıksız'

              return (
                <tr
                  key={svc.id}
                  className='hover:bg-[var(--admin-input-bg)]/50 transition-colors'
                >
                  <td className='p-4 font-bold text-[var(--admin-fg)]'>
                    {trTitle}
                  </td>
                  <td className='p-4 text-sm font-mono text-[var(--primary)]'>
                    /services/{svc.slug}
                  </td>
                  <td className='p-4 text-right flex justify-end gap-2'>
                    <Link
                      href={`/services/${svc.slug}`}
                      target='_blank'
                      className='p-2 rounded hover:bg-[var(--admin-input-bg)] text-[var(--admin-muted)] hover:text-[var(--admin-fg)]'
                      title='Sitede Gör'
                    >
                      <IoEyeOutline size={18} />
                    </Link>
                    <Link
                      href={`/admin/services/${svc.id}`}
                      className='flex items-center gap-2 px-3 py-1.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded text-sm font-medium hover:brightness-110 transition-all'
                    >
                      <IoPencil size={14} /> Düzenle
                    </Link>
                  </td>
                </tr>
              )
            })}

            {(!services || services.length === 0) && (
              <tr>
                <td
                  colSpan={3}
                  className='p-8 text-center text-[var(--admin-muted)]'
                >
                  Henüz hiç hizmet eklenmemiş.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
