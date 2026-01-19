import { createSupabaseServerClient } from '@/lib/supabase/server-client'

// Ortak Veri Tipi
export type UnifiedData = {
  title: string
  description?: string // Hizmetlerde var, sayfalarda boş gelebilir
  content: string
  image_url: string | null
  lang_code: string
  source: 'page' | 'service' // Kaynağı bilmek gerekirse diye
  page_type?: string // 'standard' veya 'manual'
  template?: string // template adı
}

// --- YARDIMCI: Dil Seçimi ---
function getTranslation (translations: any[], lang: string) {
  if (!translations || translations.length === 0) return null
  return (
    translations.find(t => t.lang_code === lang) ||
    translations.find(t => t.lang_code === 'en') ||
    translations.find(t => t.lang_code === 'tr') ||
    translations[0]
  )
}

// --- YARDIMCI: Veri Çekme Motoru ---
export async function getUnifiedData (
  slug: string,
  lang: string
): Promise<UnifiedData | null> {
  const supabase = await createSupabaseServerClient()

  // 1. Önce 'nost-corporate-pages' tablosuna bak (Kurumsal sayfalar)
  let corporatePageData: any = null
  let corporateTranslations: any[] = []
  
  const { data: corporatePageBySlug } = await supabase
    .from('nost-corporate-pages')
    .select('*')
    .ilike('slug', slug)
    .maybeSingle()

  if (corporatePageBySlug && corporatePageBySlug.active === true) {
    corporatePageData = corporatePageBySlug
  } else {
    // Ana tabloda bulunamazsa translations tablosunda slug ile ara
    const { data: translationMatch } = await supabase
      .from('nost_corporate_page_translations')
      .select('*')
      .ilike('slug', slug)
      .maybeSingle()
    
    if (translationMatch) {
      // translationMatch.page_id ile ana kaydı getir
      const { data: page } = await supabase
        .from('nost-corporate-pages')
        .select('*')
        .eq('id', translationMatch.page_id)
        .maybeSingle()
      if (page && page.active === true) {
        corporatePageData = page
      }
    }
  }

  if (corporatePageData) {
    // Translations'ları çek
    const { data: translations } = await supabase
      .from('nost_corporate_page_translations')
      .select('*')
      .eq('page_id', corporatePageData.id)
    
    corporateTranslations = translations || []
    
    const t = getTranslation(corporateTranslations, lang)
    if (t) {
      return {
        source: 'page',
        title: t.title,
        content: t.content,
        image_url: corporatePageData.image_url,
        lang_code: t.lang_code,
        description: '', // Sayfalarda description yok
        page_type: corporatePageData.page_type || 'standard',
        template: corporatePageData.template || ''
      }
    }
  }

  // 2. Bulamazsan 'nost-service-pages' tablosuna bak (Hizmetler)
  let servicePageData: any = null
  let serviceTranslations: any[] = []
  
  const { data: servicePageBySlug } = await supabase
    .from('nost-service-pages')
    .select('*')
    .ilike('slug', slug)
    .maybeSingle()

  if (servicePageBySlug && servicePageBySlug.active === true) {
    servicePageData = servicePageBySlug
  } else {
    // Ana tabloda bulunamazsa translations tablosunda slug ile ara
    const { data: translationMatch } = await supabase
      .from('nost_service_page_translations')
      .select('*')
      .ilike('slug', slug)
      .maybeSingle()
    
    if (translationMatch) {
      // translationMatch.page_id ile ana kaydı getir
      const { data: page } = await supabase
        .from('nost-service-pages')
        .select('*')
        .eq('id', translationMatch.page_id)
        .maybeSingle()
      if (page && page.active === true) {
        servicePageData = page
      }
    }
  }

  if (servicePageData) {
    // Translations'ları çek
    const { data: translations } = await supabase
      .from('nost_service_page_translations')
      .select('*')
      .eq('page_id', servicePageData.id)
    
    serviceTranslations = translations || []
    
    const t = getTranslation(serviceTranslations, lang)
    if (t) {
      return {
        source: 'service',
        title: t.title,
        description: t.description,
        content: t.content,
        image_url: servicePageData.image_url,
        lang_code: t.lang_code,
        page_type: servicePageData.page_type || 'standard',
        template: servicePageData.template || ''
      }
    }
  }

  // 3. Bulamazsan 'nost-product-pages' tablosuna bak (Ürünler)
  // Önce ana tabloda slug ile ara
  let productPageData: any = null
  let productTranslations: any[] = []
  
  const { data: productPageBySlug } = await supabase
    .from('nost-product-pages')
    .select('*')
    .ilike('slug', slug)
    .maybeSingle()

  if (productPageBySlug && productPageBySlug.active === true) {
    productPageData = productPageBySlug
  } else {
    // Ana tabloda bulunamazsa translations tablosunda slug ile ara
    const { data: translationMatch } = await supabase
      .from('nost_product_page_translations')
      .select('*')
      .ilike('slug', slug)
      .maybeSingle()
    
    if (translationMatch) {
      // translationMatch.page_id ile ana kaydı getir
      const { data: page } = await supabase
        .from('nost-product-pages')
        .select('*')
        .eq('id', translationMatch.page_id)
        .maybeSingle()
      if (page && page.active === true) {
        productPageData = page
      }
    }
  }

  if (productPageData) {
    // Translations'ları çek
    const { data: translations } = await supabase
      .from('nost_product_page_translations')
      .select('*')
      .eq('page_id', productPageData.id)
    
    productTranslations = translations || []
    
    const t = getTranslation(productTranslations, lang)
    if (t) {
      return {
        source: 'service', // ürün de bir tür hizmet gibi
        title: t.title,
        description: t.description,
        content: t.content,
        image_url: productPageData.image_url,
        lang_code: t.lang_code,
        page_type: productPageData.page_type || 'standard',
        template: productPageData.template || ''
      }
    }
  }

  // 4. Hiçbir yerde yok
  return null
}
