import Link from 'next/link'
import { IoAdd, IoPencil } from 'react-icons/io5'
import { adminSupabase } from '@/lib/supabase/admin'
import TemplateListClient from './template-list-client'

export const dynamic = 'force-dynamic'

export default async function TemplatesPage () {
  // Veritabanından şablonları çek
  const { data: templates, error } = await adminSupabase
    .from('product_templates')
    .select('*')
    .order('name')

  if (error) {
    return <div className='p-4 text-red-500'>Hata: {error.message}</div>
  }

  return (
    <div className='grid gap-6'>
      <div className='flex items-center justify-between'>
        <h2
          className='text-2xl font-semibold'
          style={{ color: 'var(--admin-fg)' }}
        >
          Ürün Şablonları (Class)
        </h2>
        <Link
          href='/admin/templates/new'
          className='btn-admin btn-admin-primary gap-2'
        >
          <IoAdd size={18} /> Yeni Şablon
        </Link>
      </div>

      <div className='card-admin p-0 overflow-hidden'>
        <TemplateListClient initialTemplates={templates || []} />
      </div>
    </div>
  )
}
