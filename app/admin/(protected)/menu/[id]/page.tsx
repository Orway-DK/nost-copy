import { getMenuItemByIdAction, getMenuItemsAction } from '../actions'
import MenuForm from './menu-form'
import { redirect } from 'next/navigation'

type Props = {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function AdminMenuEdit ({ params }: Props) {
  const { id } = await params

  // Formda "Parent" seçebilmek için tüm menüyü de çekmemiz lazım
  const allItemsRes = await getMenuItemsAction()
  const allItems = (allItemsRes.success && allItemsRes.data) ? allItemsRes.data : []

  let initialData = null

  // Eğer id "new" değilse veriyi çek
  if (id !== 'new') {
    const menuItemId = parseInt(id)
    if (!isNaN(menuItemId)) {
      const res = await getMenuItemByIdAction(menuItemId)
      if (res.success && res.data) {
        initialData = res.data
      }
    }
  }

  // Dummy functions for MenuForm props (empty for server component)
  const dummyOnClose = () => {
    // Do nothing, will be handled by client-side in MenuForm
  }
  const dummyOnSuccess = () => {
    // Do nothing, will be handled by client-side in MenuForm
  }

  return (
    <div className='h-full w-full flex flex-col p-4'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-[var(--admin-fg)]'>
          {id === 'new' ? 'Yeni Menü Öğesi' : 'Menü Düzenle'}
        </h1>
      </div>

      <div className='flex-1 min-h-0'>
        <MenuForm
          initialData={initialData}
          parentOptions={allItems} // Parent seçimi için listeyi gönder
          onClose={dummyOnClose}
          onSuccess={dummyOnSuccess}
        />
      </div>
    </div>
  )
}
