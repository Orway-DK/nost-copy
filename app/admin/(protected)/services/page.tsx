import { createSupabaseServerClient } from '@/lib/supabase/server-client'
import ServicesManager from './services-manager'
import { IoAlertCircleOutline } from 'react-icons/io5'

export const dynamic = 'force-dynamic'

export default async function ServicesPage ({
  searchParams
}: {
  searchParams: Promise<any>
}) {
  const supabase = await createSupabaseServerClient()
  const params = await searchParams
  const filter = params.filter as string | undefined

  // Yeni tablolara göre sorgu
  let tableName = 'nost-service-pages'
  let translationsTable = 'nost_service_page_translations'
  if (filter === 'products') {
    tableName = 'nost-product-pages'
    translationsTable = 'nost_product_page_translations'
  }
  
  console.log('DEBUG services/page.tsx:', { filter, tableName, translationsTable })
  
  // Sadece active = true olanları getir
  const { data: allServices } = await supabase
    .from(tableName)
    .select(`*, ${translationsTable}(*)`)
    .eq('active', true)
  const rawServices = allServices || []
  
  console.log('DEBUG rawServices count:', rawServices.length)
  
  // Property adını normalize et: translationsTable -> service_translations
  const services = rawServices.map((s: any) => ({
    ...s,
    service_translations: s[translationsTable] || []
  }))

  let allowedSlugs: string[] = []
  if (filter) {
    const targetId = filter === 'products' ? 50 : 3
    const { data: menuItems } = await supabase
      .from('classic_navigation_items')
      .select('url')
      .eq('parent_id', targetId)
    
    if (menuItems && menuItems.length > 0) {
      allowedSlugs = menuItems
        .map(m => m.url?.replace(/^\//, '').trim())
        .filter(Boolean) as string[]
    }
  }

  const filteredServices = filter && allowedSlugs.length > 0
    ? services.filter(
        (s: any) =>
          // Tam eşleşme veya kısmi eşleşme (örnek: "kutu-harf" ile "kutu-harf-sistemleri")
          allowedSlugs.some(allowedSlug => 
            s.slug?.includes(allowedSlug) ||
            s[translationsTable]?.some((t: any) => 
              t.slug?.includes(allowedSlug)
            )
          )
      )
    : services

  const missing = filter
    ? services.filter((s: any) => !filteredServices.find((fs: any) => fs.id === s.id))
    : []


  return (
    <div className='p-4 md:p-8 space-y-10 max-w-[1600px] mx-auto'>
      {/* Liste Alanı */}
      <ServicesManager
        services={filteredServices}
        filter={filter}
        pageTitle={filter === 'products' ? 'Ürün Yönetimi' : 'Hizmet Yönetimi'}
      />

      {/* Kayıp Ürünler Alanı */}
      {/* Uyarıyı gizle: Filtre varsa missing'leri gösterme, çünkü bu doğal */}
      {false && filter && missing.length > 0 && (
        <div className='p-6 bg-red-50 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-900/30 rounded-3xl animate-in fade-in slide-in-from-bottom-4'>
          <div className='flex items-center gap-3 text-red-600 mb-2 font-bold'>
            <IoAlertCircleOutline size={24} />
            <span>Görünmeyen Ürün Tespit Edildi ({missing.length})</span>
          </div>
          <p className='text-sm text-red-500 mb-4 opacity-80'>
            Bu ürünler veritabanında var ama menü linkleri (`url`) yanlış olduğu
            için listelenmiyor.
          </p>
          <div className='flex flex-wrap gap-2'>
            {missing.map(m => (
              <span
                key={m.id}
                className='px-4 py-1.5 bg-white dark:bg-black rounded-xl border border-red-200 text-sm font-mono shadow-sm'
              >
                {m.slug}
              </span>
            ))}
          </div>
          <div className='mt-4 p-3 bg-white/50 rounded-lg text-xs text-red-800 italic'>
            <strong>Çözüm:</strong> Menü Yönetimi'ne gidin ve ilgili öğenin
            URL'sini buradaki isimle aynı (Örn: `/kutu-harf`) yapın.
          </div>
        </div>
      )}
    </div>
  )
}
