// C:\Projeler\nost-copy\app\admin\(protected)\showcase\ready-products\page.tsx
import { adminSupabase } from '@/lib/supabase/admin'
import ReadyProductsList from './ready-products-list'

export const dynamic = 'force-dynamic'

export default async function ReadyProductsPage () {
  const { data } = await adminSupabase
    .from('homepage_ready_products')
    .select(
      `
        *,
        products (
            id, name, sku,
            product_media (image_key, sort_order)
        )
    `
    )
    .order('sort_order', { ascending: true })

  // Flatten Data
  const items = (data || []).map((item: any) => {
    const media =
      item.products?.product_media?.find((m: any) => m.sort_order === 0) ||
      item.products?.product_media?.[0]
    return {
      ...item,
      product_name: item.products?.name || 'Bilinmeyen Ürün',
      product_sku: item.products?.sku || '-',
      main_image_url: media?.image_key || null
    }
  })

  return (
    <div className='space-y-6 pb-20'>
      {/* Header */}
      <div className='admin-page-header'>
        <div>
          <h1 className='admin-page-title'>Hazır Ürünler</h1>
          <p className='text-[var(--admin-muted)] text-sm'>
            Anasayfada listelenen özel fiyatlı ürünleri buradan yönetin.
          </p>
        </div>
      </div>

      <ReadyProductsList initialItems={items} />
    </div>
  )
}
