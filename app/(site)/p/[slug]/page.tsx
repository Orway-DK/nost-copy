// C:\Projeler\nost-copy\app\(site)\product\[slug]\page.tsx
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server-client'
import RelatedProducts from '@/app/_components/RelatedProducts'
import {
  FaChevronRight,
  FaRegHeart,
  FaShareAlt,
  FaStar,
  FaTruck,
  FaShieldAlt,
  FaCheck
} from 'react-icons/fa'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

// --- TİP TANIMLAMALARI ---
type LocalizationRow = {
  lang_code: string
  name: string
  description?: string | null
}
type MediaRow = { image_key: string; sort_order: number }
type PriceRow = { amount: number; currency: string }
type VariantRow = { product_prices: PriceRow[] | null }
type ProductDetail = {
  id: number
  slug: string
  active: boolean
  category_slug: string | null
  product_localizations: LocalizationRow[] | null
  product_media: MediaRow[]
  product_variants: VariantRow[]
}

type CategoryTranslation = {
  lang_code: string
  name: string
}

type CategoryWithTranslations = {
  slug: string
  category_translations: CategoryTranslation[]
}

export default async function ProductDetailPage ({
  params,
  searchParams
}: PageProps) {
  const { slug } = await params
  const sp = await searchParams
  const langRaw = sp.lang
  const lang = Array.isArray(langRaw) ? langRaw[0] : langRaw || 'tr'

  const supabase = await createSupabaseServerClient()

  const { data: productData, error } = await supabase
    .from('products')
    .select(
      `
      id, slug, active, category_slug,
      product_localizations ( lang_code, name, description ),
      product_media ( image_key, sort_order ),
      product_variants ( product_prices ( amount, currency ) )
    `
    )
    .eq('slug', slug)
    .single()

  if (error || !productData || productData.active === false) {
    notFound()
  }

  const product = productData as unknown as ProductDetail

  // Kategori adını bul (eğer category_slug varsa)
  let categoryName = product.category_slug || ''
  if (product.category_slug) {
    const { data: categoryData } = await supabase
      .from('categories')
      .select(`
        slug,
        category_translations(lang_code, name)
      `)
      .eq('slug', product.category_slug)
      .single()
    
    if (categoryData) {
      const categoryWithTranslations = categoryData as CategoryWithTranslations
      const categoryTranslations = categoryWithTranslations.category_translations || []
      const foundTranslation = categoryTranslations.find((t: CategoryTranslation) => t.lang_code === lang) ||
                              categoryTranslations.find((t: CategoryTranslation) => t.lang_code === 'tr')
      categoryName = foundTranslation?.name || product.category_slug
    }
  }

  // Dil ve İçerik
  const loc =
    product.product_localizations?.find(l => l.lang_code === lang) ||
    product.product_localizations?.[0] ||
    null

  const name = loc?.name || product.slug
  const description = loc?.description || ''

  // Breadcrumb metinleri
  const breadcrumbTexts = {
    home: lang === 'tr' ? 'Ana Sayfa' : lang === 'de' ? 'Startseite' : 'Home',
    allProducts: lang === 'tr' ? 'Tüm Ürünler' : lang === 'de' ? 'Alle Produkte' : 'All Products'
  }

  // Özellik Ayrıştırma
  const descriptionLines = description
    .split('\n')
    .filter(line => line.trim() !== '')
  const featureLines = descriptionLines.filter(line => line.includes(':'))
  const normalDescription = descriptionLines
    .filter(line => !line.includes(':'))
    .join('\n')

  // Görseller
  let images: string[] = []
  if (product.product_media && product.product_media.length > 0) {
    const sortedMedia = product.product_media.sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
    )
    images = sortedMedia
      .map(media => {
        const imgKey = media.image_key || ''
        if (imgKey.startsWith('http')) {
          if (imgKey.includes('supabase.co')) return imgKey
          return ''
        }
        if (imgKey.startsWith('/')) return imgKey
        const projectUrl =
          process.env.NEXT_PUBLIC_SUPABASE_URL ||
          'https://SENIN_PROJE_ID.supabase.co'
        return `${projectUrl}/storage/v1/object/public/products/${imgKey}`
      })
      .filter(url => url !== '')
  }

  // Fiyat
  let minPrice: number | null = null
  let currencyCode = 'TL'
  if (product.product_variants && product.product_variants.length > 0) {
    product.product_variants.forEach(variant => {
      variant.product_prices?.forEach(price => {
        if (price.amount && (minPrice === null || price.amount < minPrice)) {
          minPrice = price.amount
          currencyCode = price.currency || 'TL'
        }
      })
    })
  }

  return (
    <div className='min-h-screen pb-20'>
      {/* BREADCRUMB */}
      <div className='w-full border-b border-border/40 bg-background/30 backdrop-blur-sm'>
        <div className='max-w-[1280px] mx-auto px-4 py-2.5 text-[11px] md:text-xs text-muted-foreground flex items-center gap-2'>
          <Link href='/' className='hover:text-primary transition-colors'>
            {breadcrumbTexts.home}
          </Link>
          <FaChevronRight size={8} />
          <Link
            href='/c'
            className='hover:text-primary transition-colors'
          >
            {breadcrumbTexts.allProducts}
          </Link>
          <FaChevronRight size={8} />
          {product.category_slug && categoryName && (
            <>
              <Link
                href={`/c/${product.category_slug}`}
                className='hover:text-primary capitalize'
              >
                {categoryName}
              </Link>
              <FaChevronRight size={8} />
            </>
          )}
          <span className='font-medium text-foreground truncate max-w-[200px] opacity-80'>
            {name}
          </span>
        </div>
      </div>

      <div className='max-w-[1280px] mx-auto px-4 py-6'>
        {/* ANA KART */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 bg-background/60 dark:bg-card/40 backdrop-blur-xl rounded-2xl shadow-sm border border-border/50 overflow-hidden p-5'>
          {/* SOL: GÖRSEL ALANI */}
          <div className='lg:col-span-5'>
            <div className='sticky top-4'>
              <div className='relative aspect-[4/5] w-full max-h-[450px] bg-background/50 rounded-lg overflow-hidden border border-border/40 mb-3'>
                {images.length > 0 ? (
                  <Image
                    src={images[0]}
                    alt={name}
                    fill
                    className='object-contain p-2 hover:scale-105 transition-transform duration-500'
                    priority
                  />
                ) : (
                  <div className='absolute inset-0 flex items-center justify-center text-muted-foreground text-sm'>
                    Görsel Yok
                  </div>
                )}
              </div>
              {/* Thumbnailler */}
              {images.length > 1 && (
                <div className='flex gap-2 overflow-x-auto pb-1 scrollbar-hide justify-center lg:justify-start'>
                  {images.map((img, i) => (
                    <div
                      key={i}
                      className={`relative w-14 h-16 shrink-0 border rounded-md cursor-pointer overflow-hidden bg-background/50 ${
                        i === 0
                          ? 'border-primary ring-1 ring-primary/50'
                          : 'border-border/50 hover:border-primary/50'
                      }`}
                    >
                      <Image
                        src={img}
                        alt=''
                        fill
                        className='object-contain p-1'
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SAĞ: BİLGİ VE SATIN ALMA */}
          <div className='lg:col-span-7 flex flex-col'>
            {/* Başlık & Rating */}
            <div className='mb-3 border-b border-border/40 pb-3'>
              <h1 className='text-2xl md:text-3xl font-bold text-foreground mb-1.5 leading-tight'>
                {name}
              </h1>
              <div className='flex items-center gap-1 text-rating text-xs'>
                <FaStar size={12} />
                <FaStar size={12} />
                <FaStar size={12} />
                <FaStar size={12} />
                <FaStar className='text-muted' size={12} />
                <span className='text-muted-foreground ml-1.5 opacity-80'>
                  (Yeni Ürün)
                </span>
              </div>
            </div>

            {/* Fiyat Alanı */}
            <div className='flex flex-wrap items-end gap-3 mb-5'>
              <div className='flex items-baseline gap-1'>
                <span className='text-3xl font-bold text-price'>
                  {minPrice
                    ? new Intl.NumberFormat('tr-TR', {
                        minimumFractionDigits: 2
                      }).format(minPrice)
                    : 'Fiyat Alınız'}
                </span>

                {/* DÜZELTME: Para birimi (TL) sadece fiyat varsa görünür */}
                {minPrice && (
                  <span className='text-sm font-semibold text-muted-foreground'>
                    {currencyCode}
                  </span>
                )}
              </div>

              {minPrice && (
                <div className='flex flex-col text-[10px] leading-tight text-muted-foreground mb-1'>
                  <span className='line-through opacity-60'>
                    {(minPrice * 1.2).toFixed(2)} {currencyCode}
                  </span>
                  <span className='text-success font-bold'>%20 İndirim</span>
                </div>
              )}
            </div>

            {/* Öne Çıkan Özellikler */}
            {featureLines.length > 0 && (
              <div className='mb-5'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-y-1.5 gap-x-4'>
                  {featureLines.map((line, idx) => {
                    const [key, val] = line.split(':')
                    return (
                      <div key={idx} className='flex items-start gap-2 text-xs'>
                        <div className='min-w-[3px] h-[3px] mt-1.5 rounded-full bg-primary/70'></div>
                        <div>
                          <span className='font-semibold text-foreground/90'>
                            {key}:
                          </span>
                          <span className='text-muted-foreground ml-1'>
                            {val}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Stok / Güvence Kutusu */}
            <div className='grid grid-cols-2 gap-3 mb-6 p-3 bg-info/10 rounded-lg border border-info/20'>
              <div className='flex items-center gap-2.5'>
                <FaTruck className='text-info text-lg' />
                <div>
                  <span className='block text-[11px] font-bold text-foreground'>
                    Hızlı Teslimat
                  </span>
                  <span className='block text-[10px] text-muted-foreground'>
                    3 iş günü içinde kargoda
                  </span>
                </div>
              </div>
              <div className='flex items-center gap-2.5'>
                <FaShieldAlt className='text-success text-lg' />
                <div>
                  <span className='block text-[11px] font-bold text-foreground'>
                    Güvenli Alışveriş
                  </span>
                  <span className='block text-[10px] text-muted-foreground'>
                    %100 İade Garantisi
                  </span>
                </div>
              </div>
            </div>

            {/* Aksiyon Butonları */}
            <div className='mt-auto flex flex-col gap-2.5'>
              <button className='w-full py-3.5 bg-price text-price-foreground hover:brightness-110 font-bold text-base rounded-lg shadow-md transition-all active:scale-[0.99]'>
                {minPrice ? 'Sepete Ekle' : 'Teklif İste'}
              </button>
              <div className='flex gap-2'>
                <button className='flex-1 py-2.5 border border-border/60 bg-background/50 rounded-lg text-xs font-semibold hover:bg-muted/50 transition-colors flex items-center justify-center gap-1.5'>
                  <FaRegHeart /> Listeme Ekle
                </button>
                <button className='flex-1 py-2.5 border border-border/60 bg-background/50 rounded-lg text-xs font-semibold hover:bg-muted/50 transition-colors flex items-center justify-center gap-1.5'>
                  <FaShareAlt /> Paylaş
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ALT BÖLÜM: Detaylar */}
        <div className='mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6'>
          <div className='lg:col-span-9'>
            <div className='bg-background/60 dark:bg-card/40 backdrop-blur-xl rounded-xl shadow-sm border border-border/50 p-5'>
              <h2 className='text-lg font-bold mb-3 border-b border-border/40 pb-2 flex items-center gap-2'>
                <span className='bg-primary/10 text-primary p-1 rounded'>
                  <FaCheck size={10} />
                </span>
                Ürün Detayları
              </h2>
              <div className='prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-line text-sm leading-relaxed'>
                {normalDescription || description}
              </div>
            </div>
          </div>

          <div className='lg:col-span-3 hidden lg:block'>
            <div className='sticky top-4'>
              <div className='bg-background/60 dark:bg-card/40 backdrop-blur-xl p-4 rounded-xl border border-border/50 shadow-sm'>
                <h4 className='font-bold text-xs mb-3 uppercase tracking-wider text-muted-foreground'>
                  Avantajlar
                </h4>
                <ul className='text-[11px] space-y-2.5 text-foreground/80'>
                  <li className='flex items-center gap-2'>
                    <FaCheck className='text-success text-xs' /> Orijinal Ürün
                    Garantisi
                  </li>
                  <li className='flex items-center gap-2'>
                    <FaCheck className='text-success text-xs' /> 14 Gün İade
                    Hakkı
                  </li>
                  <li className='flex items-center gap-2'>
                    <FaCheck className='text-success text-xs' /> 7/24 Destek
                    Hattı
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* BENZER ÜRÜNLER */}
        <RelatedProducts
          currentProductId={product.id}
          categorySlug={product.category_slug || ''}
        />
      </div>
    </div>
  )
}

export async function generateMetadata ({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return {
    title: `Ürün - ${slug}`,
    description: `${slug} detayları`
  }
}
