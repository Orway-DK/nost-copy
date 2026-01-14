'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useLanguage } from '@/components/LanguageProvider'

type PageData = {
  image_url: string | null
  title: string
  content: string
}

export default function GenericContentPage ({ slug }: { slug: string }) {
  const { lang } = useLanguage()
  const [data, setData] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPage () {
      setLoading(true)
      const supabase = createSupabaseBrowserClient()

      const { data: pageRow, error } = await supabase
        .from('pages')
        .select('image_url, page_translations(lang_code, title, content)')
        .eq('slug', slug)
        .eq('active', true)
        .maybeSingle()

      if (error || !pageRow) {
        setLoading(false)
        return
      }

      const tr =
        pageRow.page_translations.find((t: any) => t.lang_code === lang) ||
        pageRow.page_translations.find((t: any) => t.lang_code === 'en') ||
        pageRow.page_translations.find((t: any) => t.lang_code === 'tr')

      setData({
        image_url: pageRow.image_url,
        title: tr?.title || 'Başlıksız Sayfa',
        content: tr?.content || ''
      })
      setLoading(false)
    }

    fetchPage()
  }, [slug, lang])

  if (loading)
    return <div className='py-20 text-center animate-pulse'>Yükleniyor...</div>
  if (!data) return <div className='py-20 text-center'>Sayfa bulunamadı.</div>

  return (
    <div className='w-full min-h-screen bg-transparent pb-20'>
      {/* 1. ÜST GÖRSEL (Banner) */}
      <div className='relative w-full h-[300px] md:h-[400px] lg:h-[500px]'>
        {data.image_url ? (
          <Image
            src={data.image_url}
            alt={data.title}
            fill
            className='object-cover'
            priority
          />
        ) : (
          <div className='w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-400'>
            Görsel Yok
          </div>
        )}
        {/* Görsel Üzeri Karartma ve Başlık (Opsiyonel: İstersen başlığı resmin üzerine koyabiliriz) */}
        <div className='absolute inset-0 bg-black/40 flex items-center justify-center'>
          <h1 className='text-4xl md:text-5xl font-bold text-white text-center px-4 drop-shadow-lg'>
            {data.title}
          </h1>
        </div>
      </div>

      <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10'>
        <div className='bg-white dark:bg-[#1a1a1a] rounded-xl shadow-xl p-8 md:p-12 border border-gray-200 dark:border-white/5'>
          {/* GÜNCELLEME BURADA: className içine 'break-words', 'w-full' ve 'overflow-hidden' eklendi */}
          <div
            className='
          prose prose-lg dark:prose-invert max-w-none w-full
          break-words overflow-hidden 
          prose-headings:font-bold prose-headings:text-primary
          prose-a:text-blue-600 dark:prose-a:text-blue-400
          prose-img:rounded-lg prose-img:shadow-md prose-img:mx-auto prose-img:max-w-full
        '
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
        </div>
      </div>
    </div>
  )
}
