// C:\Projeler\nost-copy\app\admin\(protected)\services\page.tsx
import { getServicesAction } from './actions'
import ServicesList from './services-list'

export const dynamic = 'force-dynamic'

export default async function ServicesAdminPage() {
  const res = await getServicesAction()
  const services = res.success ? res.data : []

  return (
    // ANA KAPSAYICI: Tam yükseklik, Flex kolon, Taşma gizli
    <div className='h-full flex flex-col gap-4'>
      
      {/* HEADER (Sabit) */}
      <div className='shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-admin-card p-3 rounded-admin border border-admin-card-border shadow-sm'>
        <div>
          <h1 className='text-admin-lg font-bold text-admin-fg'>Hizmetler</h1>
          <p className='text-admin-muted text-admin-sm mt-1'>
            Web sitesindeki hizmet içerikleri ve çevirileri.
          </p>
        </div>
      </div>

      {/* İÇERİK (Esnek - Scroll ServicesList içinde olacak) */}
      <div className='flex-1 overflow-hidden bg-admin-card rounded-admin border border-admin-card-border flex flex-col'>
        <ServicesList initialData={services || []} />
      </div>
    </div>
  )
}