import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { getUnifiedData } from './lib/get-unified-data'
import ManualTemplateRenderer from './components/ManualTemplateRenderer'
import StandardPageTemplate from './components/StandardPageTemplate'

type Props = {
  params: Promise<{ slug: string }>
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
    notFound()
  }

  // Manuel sayfa template'leri
  if (data.page_type === 'manual') {
    return <ManualTemplateRenderer data={data} />
  }

  // STANDART SAYFA (mevcut tasarım)
  return <StandardPageTemplate data={data} lang={lang} />
}
