// C:\Projeler\nost-copy\app\admin\(protected)\services\page.tsx
import { getServicesAction } from './actions'
import ServicesList from './services-list'

export const dynamic = 'force-dynamic'

export default async function ServicesAdminPage () {
  const res = await getServicesAction()
  const services = res.success ? res.data : []

  return (
    <div className='space-y-6 pb-20'>
      {/* Header */}
      <div className='admin-page-header'>
        <div>
          <h1 className='admin-page-title'>Hizmetler</h1>
          <p className='text-[var(--admin-muted)] text-sm'>
            Web sitesinde listelenen hizmetleri, açıklamaları ve görselleri
            yönetin.
          </p>
        </div>
      </div>

      <ServicesList initialData={services || []} />
    </div>
  )
}
