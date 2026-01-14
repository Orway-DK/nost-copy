import { getServiceByIdAction } from '../actions'
import ServiceForm from './service-form'
import { redirect } from 'next/navigation'

// Next.js 15'te params Promise olarak gelir
type Props = {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function ServiceEditPage ({ params }: Props) {
  // 1. ID'yi al
  const { id } = await params

  // ID geçerli bir sayı mı kontrol et
  const serviceId = parseInt(id)
  if (isNaN(serviceId)) {
    redirect('/admin/services')
  }

  // 2. Veriyi Sunucudan Çek
  const res = await getServiceByIdAction(serviceId)

  // Veri yoksa veya hata varsa listeye geri at
  if (!res.success || !res.data) {
    redirect('/admin/services')
  }

  return (
    <div className='h-full w-full flex flex-col p-4 animate-in fade-in'>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-[var(--admin-fg)] flex items-center gap-2'>
          Hizmet Düzenle:{' '}
          <span className='text-[var(--primary)] font-mono text-xl'>
            /{res.data.slug}
          </span>
        </h1>
        <p className='text-[var(--admin-muted)] text-sm'>
          Hizmet detaylarını, görsellerini ve çevirilerini buradan
          yönetebilirsiniz.
        </p>
      </div>

      {/* Form Alanı */}
      <div className='flex-1 min-h-0'>
        {/* Çekilen veriyi forma gönderiyoruz */}
        <ServiceForm initialData={res.data} />
      </div>
    </div>
  )
}
