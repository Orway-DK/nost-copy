import { getAboutContentAction } from './actions'
import AboutForm from './about-form'

export const dynamic = 'force-dynamic'

export default async function AboutAdminPage () {
  const res = await getAboutContentAction()
  const data = res.success ? res.data : {}

  return (
    // DÜZELTME: max-w-5xl kaldırıldı, w-full eklendi.
    <div className='w-full space-y-6'>
      <div className='admin-page-header'>
        <div>
          <h1 className='admin-page-title'>Hakkımızda Sayfası</h1>
          <p className='text-[var(--admin-muted)] text-sm'>
            Hakkımızda sayfasındaki metinleri ve istatistikleri buradan
            yönetebilirsiniz.
          </p>
        </div>
      </div>
      <AboutForm initialData={data || {}} />{' '}
    </div>
  )
}
