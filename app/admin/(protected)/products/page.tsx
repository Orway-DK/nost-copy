import { adminSupabase } from '@/lib/supabase/admin'
import ProductManager from './product-manager'

export const dynamic = 'force-dynamic'

export default async function ProductsPage () {
  // 1. Ürünleri Çek
  const productsQuery = adminSupabase
    .from('products')
    .select(`*, product_media (image_key, sort_order)`)
    .order('id', { ascending: false })

  // 2. Şablonları Çek
  const templatesQuery = adminSupabase
    .from('product_templates')
    .select('*')
    .order('name')

  // 3. Kategorileri Çek (Dropdown için)
  // const categoriesQuery = adminSupabase.from("categories").select("*");

  const [prodRes, templRes] = await Promise.all([productsQuery, templatesQuery])

  // Veriyi Formatla (Görsel URL çıkarma)
  const products = (prodRes.data || []).map((item: any) => {
    const media =
      item.product_media?.find((m: any) => m.sort_order === 0) ||
      item.product_media?.[0]
    return {
      ...item,
      main_image_url: media?.image_key || null
    }
  })

  return <ProductManager products={products} templates={templRes.data || []} />
}
