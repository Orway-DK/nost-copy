import { adminSupabase } from '@/lib/supabase/admin'
import MaterialManager from './material-manager'

export const dynamic = 'force-dynamic'

export default async function MaterialsPage() {
  const { data } = await adminSupabase
    .from('materials')
    .select('*')
    .order('category_slug', { ascending: true }) // Önce kağıtlar gelsin
    .order('weight_g', { ascending: true })      // Sonra gramaja göre

  return <MaterialManager materials={data || []} />
}