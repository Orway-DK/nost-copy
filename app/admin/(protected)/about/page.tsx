// C:\Projeler\nost-copy\app\admin\(protected)\about\page.tsx

import { getAboutContentAction } from './actions'
import AboutForm from './about-form'

export const dynamic = 'force-dynamic'

export default async function AboutAdminPage () {
  const res = await getAboutContentAction()
  const data = res.success ? res.data : {}

  return (
    // DÜZELTME: 
    // 1. 'h-full' ile mevcut yüksekliği kaplamasını sağladık.
    // 2. 'overflow-y-auto' ile dikey scroll açtık.
    // 3. 'p-1' ekleyerek scrollbar'ın içeriğe yapışmasını engelledik (opsiyonel).
    <div className='h-full w-full overflow-y-auto space-y-6'>
      
      {/* Header */}
      <div className='admin-page-header'>
        <div>
          <h1 className='admin-page-title'>Hakkımızda Sayfası</h1>
          <p className='text-[var(--admin-muted)] text-sm'>
            Hakkımızda sayfasındaki metinleri ve istatistikleri buradan
            yönetebilirsiniz.
          </p>
        </div>
      </div>

      {/* Form */}
      <AboutForm initialData={data || {}} />
    </div>
  )
}