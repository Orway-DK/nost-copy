import React from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { createSupabaseServerClient } from '@/lib/supabase/server-client'
import { cookies } from 'next/headers'

type Props = {
  params: Promise<{ slug: string }>
}

// Ortak Veri Tipi
type UnifiedData = {
  title: string
  description?: string // Hizmetlerde var, sayfalarda boş gelebilir
  content: string
  image_url: string | null
  lang_code: string
  source: 'page' | 'service' // Kaynağı bilmek gerekirse diye
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
async function getUnifiedData (
  slug: string,
  lang: string
): Promise<UnifiedData | null> {
  const supabase = await createSupabaseServerClient()
  console.log('DEBUG getUnifiedData:', { slug, lang })

  // 1. Önce 'nost-corporate-pages' tablosuna bak (Kurumsal sayfalar)
  const { data: corporatePageData } = await supabase
    .from('nost-corporate-pages')
    .select('image_url, active, nost_corporate_page_translations(title, content, lang_code, slug)')
    .ilike('slug', slug)
    .maybeSingle()

  console.log('DEBUG corporatePageData:', corporatePageData)

  if (corporatePageData && corporatePageData.active === true) {
    const t = getTranslation(corporatePageData.nost_corporate_page_translations, lang)
    if (t) {
      return {
        source: 'page',
        title: t.title,
        content: t.content,
        image_url: corporatePageData.image_url,
        lang_code: t.lang_code,
        description: '' // Sayfalarda description yok
      }
    }
  }

  // 2. Bulamazsan 'nost-service-pages' tablosuna bak (Hizmetler)
  const { data: servicePageData } = await supabase
    .from('nost-service-pages')
    .select(
      'image_url, active, nost_service_page_translations(title, description, content, lang_code, slug)'
    )
    .ilike('slug', slug)
    .maybeSingle()

  console.log('DEBUG servicePageData:', servicePageData)

  if (servicePageData && servicePageData.active === true) {
    const t = getTranslation(servicePageData.nost_service_page_translations, lang)
    console.log('DEBUG service translation:', t)
    if (t) {
      return {
        source: 'service',
        title: t.title,
        description: t.description,
        content: t.content,
        image_url: servicePageData.image_url,
        lang_code: t.lang_code
      }
    }
  }

  // 3. Bulamazsan 'nost-product-pages' tablosuna bak (Ürünler)
  const { data: productPageData } = await supabase
    .from('nost-product-pages')
    .select('*')
    .ilike('slug', slug)
    .maybeSingle()

  console.log('DEBUG productPageData:', productPageData)

  if (productPageData && productPageData.active === true) {
    // Translations'ları ayrıca çek
    const { data: translations } = await supabase
      .from('nost_product_page_translations')
      .select('*')
      .eq('page_id', productPageData.id)
    
    console.log('DEBUG translations:', translations)
    
    const t = getTranslation(translations || [], lang)
    console.log('DEBUG product translation:', t)
    if (t) {
      return {
        source: 'service', // ürün de bir tür hizmet gibi
        title: t.title,
        description: t.description,
        content: t.content,
        image_url: productPageData.image_url,
        lang_code: t.lang_code
      }
    }
  }

  // 4. Hiçbir yerde yok
  console.log('DEBUG getUnifiedData: no data found for slug', slug)
  return null
}

// --- METADATA (SEO) ---
export async function generateMetadata ({ params }: Props) {
  const { slug } = await params
  const cookieStore = await cookies()
  const langVal = cookieStore.get('lang')?.value
  const lang = langVal === 'en' || langVal === 'de' ? langVal : 'tr'

  const data = await getUnifiedData(slug, lang)

  if (!data) return { title: 'Sayfa Bulunamadı' }

  return {
    title: `${data.title} - Nost Copy`,
    description: data.description || `${data.title} hakkında detaylı bilgi.`
  }
}

// --- ANA BİLEŞEN ---
export default async function UnifiedPage ({ params }: Props) {
  const { slug } = await params
  const cookieStore = await cookies()
  const langVal = cookieStore.get('lang')?.value
  const lang = langVal === 'en' || langVal === 'de' ? langVal : 'tr'

  // Veriyi çek
  const data = await getUnifiedData(slug, lang)

  // Veri yoksa 404
  if (!data) {
    console.log('DEBUG UnifiedPage: data is null, triggering notFound')
    notFound()
  }

  return (
    // GenericContentPage ile AYNI TASARIM
    <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-8 md:pt-12 min-h-screen'>
      {/* 1. HERO / BANNER */}
      <div className='relative w-full h-[300px] md:h-[450px] flex items-center justify-center overflow-hidden rounded-[2rem] shadow-2xl border border-black/5 dark:border-white/10 mb-10 group'>
        <div className='absolute inset-0'>
          {data.image_url ? (
            <Image
              src={data.image_url}
              alt={data.title}
              fill
              className='object-cover transition-transform duration-1000 group-hover:scale-105'
              priority
            />
          ) : (
            <div className='w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-black' />
          )}
          <div className='absolute inset-0 bg-black/40 mix-blend-multiply'></div>
        </div>

        <div className='relative z-10 text-center px-4 max-w-4xl'>
          <h1 className='text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight drop-shadow-2xl animate-in fade-in slide-in-from-bottom-6'>
            {data.title}
          </h1>
          <div className='w-24 h-1.5 bg-primary mx-auto rounded-full shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]'></div>
        </div>
      </div>

      {/* 2. İÇERİK ALANI (Glassmorphism) */}
      <div
        className='
        w-full
        bg-white/60 dark:bg-[#212529]/40 backdrop-blur-md 
        rounded-[2rem] 
        border border-black/5 dark:border-white/5 
        shadow-lg
        p-6 sm:p-10 lg:p-12
      '
      >
        {/* Dil Uyarısı */}
        {data.lang_code !== lang && (
          <div className='mb-6 p-3 bg-yellow-50/50 border border-yellow-200/50 text-yellow-700 dark:text-yellow-400 text-sm rounded-lg backdrop-blur-sm'>
            ⚠️ İçerik varsayılan dilde ({data.lang_code.toUpperCase()})
            gösteriliyor.
          </div>
        )}

        {/* Kısa Açıklama (Varsa) */}
        {data.description && (
          <p className='text-xl text-gray-600 dark:text-gray-300 font-medium mb-8 border-l-4 border-primary pl-4 italic leading-relaxed'>
            {data.description}
          </p>
        )}

        {/* HTML İçerik */}
        <div
          className='
            prose prose-lg dark:prose-invert max-w-none w-full
            break-words overflow-hidden
            prose-headings:font-bold prose-headings:text-foreground
            prose-h2:text-3xl prose-h2:mt-8
            prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-2xl prose-img:shadow-md prose-img:mx-auto prose-img:max-w-full
          '
          dangerouslySetInnerHTML={{ __html: data.content || '' }}
        />
      </div>
    </div>
  )
}
