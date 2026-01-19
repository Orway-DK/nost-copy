'use client'

import { UnifiedData } from '../lib/get-unified-data'
import { useEffect, useState } from 'react'

type Props = {
  data: UnifiedData
}

export default function ManualTemplateRenderer ({ data }: Props) {
  const [Component, setComponent] = useState<React.ComponentType | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!data.template) {
      setComponent(null)
      return
    }

    const templateMap: Record<string, string> = {
      'grafik-tasarim': '../manual_pages/graphic-design/page',
      printing: '../manual_pages/printing/page',
      kutu: '../manual_pages/kutu/page'
    }

    const modulePath = templateMap[data.template]
    if (!modulePath) {
      setComponent(null)
      return
    }

    setLoading(true)
    // Dynamic import
    import(/* @vite-ignore */ modulePath)
      .then(module => {
        setComponent(() => module.default)
        setError(null)
      })
      .catch(err => {
        console.error('Template yüklenemedi:', err)
        setError('Template yüklenemedi.')
        setComponent(null)
      })
      .finally(() => setLoading(false))
  }, [data.template])

  if (loading) {
    return (
      <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-8 md:pt-12 min-h-screen flex items-center justify-center'>
        <div className='text-lg'>Template yükleniyor...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-8 md:pt-12 min-h-screen'>
        <div className='text-red-500'>Hata: {error}</div>
      </div>
    )
  }

  if (Component) {
    return <Component />
  }

  // Varsayılan manuel template
  return (
    <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-8 md:pt-12 min-h-screen'>
      <h1 className='text-4xl font-bold mb-6'>{data.title}</h1>
      <div
        className='prose max-w-none'
        dangerouslySetInnerHTML={{ __html: data.content || '' }}
      />
    </div>
  )
}
