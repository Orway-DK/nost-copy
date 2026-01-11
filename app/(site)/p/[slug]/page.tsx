// C:\Projeler\nost-copy\app\(site)\product\[slug]\page.tsx

import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server-client'
import RelatedProducts from '@/app/_components/RelatedProducts'
import AddToFavButton from '@/app/_components/AddToFavorites'

import {
  FaChevronRight,
  FaShareAlt,
  FaStar,
  FaTruck,
  FaShieldAlt,
  FaCheck,
  FaImage
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
      .select(
        `
        slug,
        category_translations(lang_code, name)
      `
      )
      .eq('slug', product.category_slug)
      .single()

    if (categoryData) {
      const categoryWithTranslations = categoryData as CategoryWithTranslations
      const categoryTranslations =
        categoryWithTranslations.category_translations || []
      const foundTranslation =
        categoryTranslations.find(
          (t: CategoryTranslation) => t.lang_code === lang
        ) ||
        categoryTranslations.find(
          (t: CategoryTranslation) => t.lang_code === 'tr'
        )
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
    allProducts:
      lang === 'tr'
        ? 'Tüm Ürünler'
        : lang === 'de'
        ? 'Alle Produkte'
        : 'All Products'
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
    <div className='min-h-screen pb-20 flex flex-col items-center w-full'>
      {/* BREADCRUMB */}
      <div className='w-full border-b border-border/40 bg-background/30 backdrop-blur-sm'>
        <div className='w-full max-w-[1280px] mx-auto px-4 py-2.5 text-[11px] md:text-xs text-muted-foreground flex items-center gap-2'>
          <Link href='/' className='hover:text-primary transition-colors'>
            {breadcrumbTexts.home}
          </Link>
          <FaChevronRight size={8} />
          <Link href='/c' className='hover:text-primary transition-colors'>
            {breadcrumbTexts.allProducts}
          </Link>
          <FaChevronRight size={8} />
          {product.category_slug && categoryName && (
            <>
              <Link
                href={`/${product.category_slug}`}
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

      <div className='w-full max-w-[1280px] mx-auto px-4 py-6'>
        {/* ANA KART */}
        <div className='w-full grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 bg-background/60 dark:bg-card/40 backdrop-blur-xl rounded-2xl shadow-sm border border-border/50 overflow-hidden p-5 min-h-[500px]'>
          {/* SOL: GÖRSEL ALANI */}
          <div className='lg:col-span-5 w-full h-full'>
            <div className='sticky top-4 h-full'>
              {/* Aspect Ratio Koruyan Kapsayıcı */}
              <div className='relative aspect-[4/5] w-full rounded-lg overflow-hidden border border-border/40 mb-3 bg-white dark:bg-zinc-900 flex items-center justify-center shadow-sm'>
                {images.length > 0 ? (
                  <Image
                    src={images[0]}
                    alt={name}
                    fill
                    className='object-cover hover:scale-105 transition-transform duration-500'
                    priority
                    sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                  />
                ) : (
                  <div className='flex flex-col items-center justify-center text-muted-foreground/30 gap-4'>
                    <FaImage size={64} />
                    <span className='text-sm font-medium'>
                      Görsel Mevcut Değil
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnailler */}
              {images.length > 1 && (
                <div className='flex gap-2 overflow-x-auto pb-1 scrollbar-hide justify-center lg:justify-start w-full'>
                  {images.map((img, i) => (
                    <div
                      key={i}
                      className={`relative w-14 h-16 shrink-0 border rounded-md cursor-pointer overflow-hidden bg-background/50 ${
                        i === 0
                          ? 'border-primary ring-1 ring-primary/50'
                          : 'border-border/50 hover:border-primary/50'
                      }`}
                    >
                      <Image src={img} alt='' fill className='object-cover' />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SAĞ: BİLGİ VE SATIN ALMA */}
          <div className='lg:col-span-7 flex flex-col w-full h-full justify-between'>
            {/* Üst Kısım: Başlık, Fiyat, Özellikler */}
            <div>
              {/* Başlık & Rating */}
              <div className='mb-4 border-b border-border/40 pb-4'>
                <h1 className='text-2xl md:text-3xl font-black text-foreground mb-2 leading-tight tracking-tight'>
                  {name}
                </h1>
                <div className='flex items-center gap-1 text-rating text-xs'>
                  <FaStar size={14} className='text-yellow-400' />
                  <FaStar size={14} className='text-yellow-400' />
                  <FaStar size={14} className='text-yellow-400' />
                  <FaStar size={14} className='text-yellow-400' />
                  <FaStar className='text-muted' size={14} />
                  <span className='text-muted-foreground ml-2 opacity-80'>
                    (Yeni Ürün)
                  </span>
                </div>
              </div>

              {/* Fiyat Alanı */}
              <div className='mb-6 p-5 bg-gradient-to-r from-gray-50 to-white dark:from-zinc-900 dark:to-zinc-950 rounded-xl border border-border shadow-sm'>
                <h3 className='text-primary font-bold text-lg mb-1'>
                  Fiyat Alınız
                </h3>
                <div className='flex flex-wrap items-end gap-3'>
                  {minPrice ? (
                    <div className='flex items-baseline gap-1'>
                      <span className='text-4xl font-black text-foreground tracking-tighter'>
                        {new Intl.NumberFormat('tr-TR', {
                          minimumFractionDigits: 2
                        }).format(minPrice)}
                      </span>
                      <span className='text-lg font-semibold text-muted-foreground'>
                        {currencyCode}
                      </span>
                    </div>
                  ) : null}

                  {minPrice && (
                    <div className='flex flex-col text-xs leading-tight text-muted-foreground mb-1 ml-2'>
                      <span className='line-through opacity-60'>
                        {(minPrice * 1.2).toFixed(2)} {currencyCode}
                      </span>
                      <span className='text-red-500 font-bold bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full'>
                        %20 İndirim
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Öne Çıkan Özellikler */}
              {featureLines.length > 0 && (
                <div className='mb-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4'>
                    {featureLines.map((line, idx) => {
                      const [key, val] = line.split(':')
                      return (
                        <div
                          key={idx}
                          className='flex items-start gap-2 text-sm group'
                        >
                          <div className='min-w-[4px] h-[4px] mt-2 rounded-full bg-primary group-hover:scale-150 transition-transform'></div>
                          <div>
                            <span className='font-bold text-foreground'>
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
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6'>
                <div className='flex items-center gap-3 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30'>
                  <div className='p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-600 dark:text-blue-300'>
                    <FaTruck size={16} />
                  </div>
                  <div>
                    <span className='block text-xs font-bold text-foreground'>
                      Hızlı Teslimat
                    </span>
                    <span className='block text-[10px] text-muted-foreground'>
                      3 iş günü içinde kargoda
                    </span>
                  </div>
                </div>
                <div className='flex items-center gap-3 p-3 bg-green-50/50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/30'>
                  <div className='p-2 bg-green-100 dark:bg-green-900/50 rounded-full text-green-600 dark:text-green-300'>
                    <FaShieldAlt size={16} />
                  </div>
                  <div>
                    <span className='block text-xs font-bold text-foreground'>
                      Güvenli Alışveriş
                    </span>
                    <span className='block text-[10px] text-muted-foreground'>
                      %100 İade Garantisi
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alt Kısım: Aksiyon Butonları (GÜNCELLENEN KISIM) */}
            <div className='mt-4 pt-6 border-t border-border/40'>
              {/* ANA BUTON: Daha büyük, gölgeli ve canlı */}
              <button className='w-full py-4 bg-primary text-primary-foreground hover:bg-primary/90 font-black text-lg rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 active:scale-[0.99] mb-4 flex items-center justify-center gap-2'>
                {minPrice ? 'Sepete Ekle' : 'Fiyat Teklifi İste'}
                <FaChevronRight size={14} className='opacity-60' />
              </button>

              <div className='flex gap-4'>
                {/* FAVORİ BUTONU: Soluk değil, net çerçeveli ve hover efektli */}
                <AddToFavButton
                  productId={product.id}
                  variant='full'
                  className='flex-1 py-3 bg-white dark:bg-zinc-900 border-2 border-gray-200 dark:border-zinc-700 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm'
                />

                {/* PAYLAŞ BUTONU: Favori butonuyla uyumlu */}
                <button className='flex-1 py-3 bg-white dark:bg-zinc-900 border-2 border-gray-200 dark:border-zinc-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm'>
                  <FaShareAlt /> Paylaş
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ALT BÖLÜM: Detaylar */}
        <div className='mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8'>
          <div className='lg:col-span-9'>
            <div className='bg-background/60 dark:bg-card/40 backdrop-blur-xl rounded-2xl shadow-sm border border-border/50 p-6 min-h-[200px]'>
              <h2 className='text-lg font-bold mb-4 border-b border-border/40 pb-3 flex items-center gap-2'>
                <span className='bg-primary/10 text-primary p-1.5 rounded-md'>
                  <FaCheck size={12} />
                </span>
                Ürün Detayları
              </h2>
              <div className='prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-line leading-relaxed'>
                {normalDescription ||
                  description ||
                  'Bu ürün için henüz detaylı açıklama girilmemiştir.'}
              </div>
            </div>
          </div>

          <div className='lg:col-span-3 hidden lg:block'>
            <div className='sticky top-4'>
              <div className='bg-background/60 dark:bg-card/40 backdrop-blur-xl p-5 rounded-2xl border border-border/50 shadow-sm'>
                <h4 className='font-bold text-xs mb-4 uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2'>
                  AVANTAJLAR
                </h4>
                <ul className='text-xs space-y-3 text-foreground/80'>
                  <li className='flex items-center gap-2.5'>
                    <FaCheck className='text-success' />
                    <span className='font-medium'>Orijinal Ürün Garantisi</span>
                  </li>
                  <li className='flex items-center gap-2.5'>
                    <FaCheck className='text-success' />
                    <span className='font-medium'>14 Gün İade Hakkı</span>
                  </li>
                  <li className='flex items-center gap-2.5'>
                    <FaCheck className='text-success' />
                    <span className='font-medium'>7/24 Destek Hattı</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* BENZER ÜRÜNLER */}
        <div className='mt-10'>
          <h2 className='text-2xl font-bold mb-6'>Benzer Ürünler</h2>
          <RelatedProducts
            currentProductId={product.id}
            categorySlug={product.category_slug || ''}
          />
        </div>
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
