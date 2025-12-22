import { notFound } from 'next/navigation'
import { adminSupabase } from '@/lib/supabase/admin'
import TemplateBuilder from '../template-builder'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditTemplatePage (props: PageProps) {
  const params = await props.params

  // Veriyi çek
  const { data: template, error } = await adminSupabase
    .from('product_templates')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !template) {
    return notFound()
  }

  return <TemplateBuilder initialData={template} />
}
