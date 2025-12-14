// C:\Projeler\nost-copy\app\admin\(protected)\showcase\scrolling-categories\page.tsx
import ScrollingCategoriesList from './scrolling-categories-list'
import { getScrollingCategoriesAction } from './actions'

export const dynamic = 'force-dynamic'

export default async function ScrollingCategoriesPage () {
  // Veriyi action üzerinden çekiyoruz
  const res = await getScrollingCategoriesAction()
  const categories = res.success ? res.data : []

  return (
    <div className='space-y-6 pb-20'>
      {/* Header */}
      <div className='admin-page-header'>
        <div>
          <h1 className='admin-page-title'>Kayan Kategoriler</h1>
          <p className='text-[var(--admin-muted)] text-sm'>
            Anasayfadaki kayan bantta görünecek kategorilerin sırasını ve
            görünürlüğünü ayarlayın.
          </p>
        </div>
      </div>

      <ScrollingCategoriesList initialItems={categories} />
    </div>
  )
}
