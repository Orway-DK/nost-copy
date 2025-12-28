import { adminSupabase } from '@/lib/supabase/admin'
import ProductManager from './product-manager'

export const dynamic = 'force-dynamic'

export default async function ProductsPage() {
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

  // 3. Kategorileri Çek (Dropdown için) - ARTIK AKTİF
  const categoriesQuery = adminSupabase
    .from('categories')
    .select('slug, name') // <--- BURASI DEĞİŞTİ
    .eq('active', true)
    .order('name') // İsme göre sıralamak daha mantıklı

    const materialsQuery = adminSupabase
    .from('materials')
    .select('*')
    .order('weight_g')

const [prodRes, templRes, catRes, matRes] = await Promise.all([
    productsQuery,
    templatesQuery,
    categoriesQuery,
    materialsQuery
])

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

// Kategorileri obje dizisi olarak alıyoruz
  const categories = catRes.data?.map(c => ({
    name: c.name,
    slug: c.slug
  })) || []

  return (
    <ProductManager 
      products={products} 
      templates={templRes.data || []} 
      categories={categories}
      materials={matRes.data || []} // <--- EKLENDİ
    />
  )
}