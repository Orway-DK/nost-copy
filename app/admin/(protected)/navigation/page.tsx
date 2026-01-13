import { createSupabaseServerClient } from '@/lib/supabase/server-client'
import NavManager from './NavManager'

export default async function AdminNavigationPage () {
  const supabase = await createSupabaseServerClient()

  // Fetch items ordered by sort_order
  const { data: items } = await supabase
    .from('classic_navigation_items')
    .select('*')
    .order('sort_order', { ascending: true })

  return (
    <div className='p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-muted/10'>
      <div className='flex justify-between items-center mb-8'>
        <div>
          <h1 className='text-3xl font-black text-foreground tracking-tight'>
            Navigasyon Yönetimi
          </h1>
          <p className='text-muted-foreground mt-2'>
            Ana menü öğelerini sıralayın, düzenleyin ve otomatik çevirin.
          </p>
        </div>
      </div>

      <div className='bg-card border border-border rounded-xl shadow-sm p-6'>
        <NavManager initialItems={items || []} />
      </div>
    </div>
  )
}
