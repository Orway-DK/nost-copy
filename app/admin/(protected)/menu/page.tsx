import { getMenuItemsAction } from './actions'
import MenuManager from './menu-manager'

export const dynamic = 'force-dynamic'

export default async function AdminMenuPage () {
  // Verileri sunucuda çek
  const res = await getMenuItemsAction()
  const items = res.success ? res.data : []

  // Client Component'e gönder
  return <MenuManager items={items} />
}
