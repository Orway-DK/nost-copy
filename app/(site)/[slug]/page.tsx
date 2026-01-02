import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server-client'
import CategoryPage from '../c/[slug]/page'
import ProductPage from '../p/[slug]/page'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function DynamicSlugPage({
  params,
  searchParams
}: PageProps) {
  const { slug } = await params
  const sp = await searchParams
  const langRaw = sp.lang
  const lang = Array.isArray(langRaw) ? langRaw[0] : langRaw || 'tr'

  const supabase = await createSupabaseServerClient()

  // Önce kategoriyi kontrol et
  const { data: category, error: catErr } = await supabase
    .from('categories')
    .select(`
      id, 
      slug, 
      active, 
      name,
      category_translations(lang_code, name)
    `)
    .eq('slug', slug)
    .eq('active', true)
    .single()

  // Kategori bulundu ve aktifse kategori sayfasını göster
  if (category && !catErr) {
    return <CategoryPage params={Promise.resolve({ slug })} searchParams={Promise.resolve(sp)} />
  }

  // Kategori bulunamadıysa ürünü kontrol et
  const { data: product, error: prodErr } = await supabase
    .from('products')
    .select(`
      id, slug, active, category_slug,
      product_localizations ( lang_code, name, description ),
      product_media ( image_key, sort_order ),
      product_variants ( product_prices ( amount, currency ) )
    `)
    .eq('slug', slug)
    .eq('active', true)
    .single()

  // Ürün bulundu ve aktifse ürün sayfasını göster
  if (product && !prodErr) {
    return <ProductPage params={Promise.resolve({ slug })} searchParams={Promise.resolve(sp)} />
  }

  // Hiçbiri bulunamadıysa 404
  notFound()
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return {
    title: `${slug} | Nost Copy`,
    description: `${slug} sayfası`
  }
}
