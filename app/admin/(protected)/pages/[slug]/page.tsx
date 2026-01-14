import { getPageDetailAction } from '../actions'
import PageForm from './page-form'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminPageEdit ({
  params
}: {
  params: { slug: string }
}) {
  // Params await edilmeli (Next.js 15)
  const { slug } = await params

  const res = await getPageDetailAction(slug)

  if (!res.success || !res.data) {
    redirect('/admin/pages')
  }

  return (
    <div className='h-full w-full flex flex-col p-4'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-[var(--admin-fg)] flex items-center gap-2'>
          Sayfa Düzenle:{' '}
          <span className='text-[var(--primary)] font-mono text-xl'>
            /{res.data.slug}
          </span>
        </h1>
        <p className='text-[var(--admin-muted)] text-sm'>
          Sayfa içeriğini, başlığını ve görsellerini yönetin.
        </p>
      </div>

      <div className='flex-1 min-h-0'>
        <PageForm initialData={res.data} />
      </div>
    </div>
  )
}
