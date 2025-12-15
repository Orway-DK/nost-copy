import ScrollingCategoriesList from './scrolling-categories-list'
import {
  getScrollingCategoriesAction,
  getSliderSettingsAction
} from './actions'

export const dynamic = 'force-dynamic'

export default async function ScrollingCategoriesPage () {
  // Paralel veri çekme
  const [catRes, setRes] = await Promise.all([
    getScrollingCategoriesAction(),
    getSliderSettingsAction()
  ])

  const categories = catRes.success ? catRes.data : []
  const settings = setRes.success ? setRes.data : null

  return (
    <div className='space-y-6 pb-20'>
      {/* Header */}
      <div className='admin-page-header'>
        <div>
          <h1 className='admin-page-title'>Kayan Kategoriler</h1>
          <p className='text-[var(--admin-muted)] text-sm'>
            Anasayfadaki kayan bantta görünecek kategorileri ve animasyon hızını
            ayarlayın.
          </p>
        </div>
      </div>

      <ScrollingCategoriesList
        initialItems={categories}
        initialSettings={settings}
      />
    </div>
  )
}
