import { createSupabaseServerClient } from '@/lib/supabase/server-client'
import PagesManager from './pages-manager'

export const dynamic = 'force-dynamic'

export default async function AdminPagesList ({
  searchParams
}: {
  searchParams: Promise<any>
}) {
  const supabase = await createSupabaseServerClient()
  const params = await searchParams
  const filter = params.filter as string | undefined

  // Yeni tabloyu kullan, çevirileri de getir
  const { data: pages, error } = await supabase
    .from('nost-corporate-pages')
    .select('*, nost_corporate_page_translations(*)')
    .order('id', { ascending: true })
  
  if (error) {
    console.error('Error fetching pages:', error)
  }
  
  const pageTitle = filter === 'corporate' ? 'Kurumsal Sayfalar' : 'Sayfa Yönetimi'

  return (
    <div className='p-4 md:p-8 max-w-[1600px] mx-auto'>
      <PagesManager 
        pages={pages || []} 
        filter={filter}
        pageTitle={pageTitle}
      />
    </div>
  )
}
