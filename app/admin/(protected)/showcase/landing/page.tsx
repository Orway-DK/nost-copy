// C:\Projeler\nost-copy\app\admin\(protected)\showcase\landing\page.tsx
import { adminSupabase } from '@/lib/supabase/admin'
import LandingPageClient from './landing-page-client'

export const dynamic = 'force-dynamic'

export default async function LandingAdminPage () {
  // Paralel veri çekme
  const slidesQuery = adminSupabase
    .from('landing_slides')
    .select(`*, landing_slide_translations (*)`)
    .order('order_no', { ascending: true })

  const highlightsQuery = adminSupabase
    .from('landing_highlights')
    .select(`*, landing_highlight_translations (*)`)
    .order('order_no', { ascending: true })

  const [slidesRes, hlRes] = await Promise.all([slidesQuery, highlightsQuery])

  return (
    <div className='pb-20'>
      {/* Header */}
      <div className='admin-page-header'>
        <div>
          <h1 className='admin-page-title'>Açılış Sayfası Yönetimi</h1>
          <p className='text-[var(--admin-muted)] text-sm'>
            Slider ve öne çıkan özellikler alanını buradan yönetebilirsiniz.
          </p>
        </div>
      </div>

      <LandingPageClient
        initialSlides={slidesRes.data || []}
        initialHighlights={hlRes.data || []}
      />
    </div>
  )
}
