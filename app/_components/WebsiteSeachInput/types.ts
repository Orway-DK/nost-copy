// DİKKAT: MegaNavbar'da çalışan client yolunu buraya da koyuyoruz.
// Eğer senin projende bu yol "@/lib/supabase/client" ise onu kullan,
// yoksa "@/utils/supabase/client" ise onu kullan ama "BrowserClient" olduğundan emin ol.
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export type SearchResultMode = 'list' | 'grid'

export interface ProductSearchResult {
  id: number
  slug: string
  name: string
  category_slug: string
  image_key: string | null
  min_price: number | null
  currency: string
}

export interface ProductUI {
  id: number
  name: string
  slug: string
  priceDisplay: string
  image: string
  category: string
}

export const searchProducts = async (
  query: string,
  langCode: string = 'tr'
): Promise<ProductUI[]> => {
  // Client oluşturma (Browser Client kullandığından emin ol)
  const supabase = createSupabaseBrowserClient()

  console.log(`🔎 Arama Başlıyor: Term="${query}", Lang="${langCode}"`)

  try {
    const { data, error } = await supabase.rpc('get_search_results', {
      search_term: query,
      target_lang: langCode
    })

    if (error) {
      // Hatayı JSON string olarak yazdırırsak detayları görebiliriz
      console.error(
        '❌ Supabase RPC Hatası (Detaylı):',
        JSON.stringify(error, null, 2)
      )
      console.error('Ham Hata:', error)
      return []
    }

    if (!data) {
      console.warn('⚠️ Data boş döndü.')
      return []
    }

    console.log(`✅ Arama Başarılı. ${data.length} sonuç bulundu.`)

    return data.map((item: ProductSearchResult) => {
      const image = item.image_key
        ? item.image_key.startsWith('http')
          ? item.image_key
          : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${item.image_key}`
        : '/nost.png'

      let priceDisplay = 'Teklif Al'
      if (item.min_price !== null && item.min_price > 0) {
        try {
          const formattedPrice = new Intl.NumberFormat(langCode, {
            style: 'currency',
            currency: item.currency
          }).format(item.min_price)
          priceDisplay = formattedPrice
        } catch (e) {
          priceDisplay = `${item.min_price} ${item.currency}`
        }
      }

      return {
        id: item.id,
        name: item.name || 'İsimsiz Ürün',
        slug: item.slug,
        category: item.category_slug || 'Genel',
        priceDisplay: priceDisplay,
        image: image
      }
    })
  } catch (err) {
    console.error('🔥 Beklenmeyen Javascript Hatası:', err)
    return []
  }
}
