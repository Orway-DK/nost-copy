import Image from 'next/image'
import { UnifiedData } from '../lib/get-unified-data'

type Props = {
  data: UnifiedData
  lang: string
}

export default function StandardPageTemplate ({ data, lang }: Props) {
  return (
    // GenericContentPage ile AYNI TASARIM
    <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-8 md:pt-12 min-h-screen'>
      {/* 1. HERO / BANNER */}
      <div className='relative w-full h-[300px] md:h-[450px] flex items-center justify-center overflow-hidden rounded-[2rem] shadow-2xl border border-black/5 dark:border-white/10 mb-10 group'>
        <div className='absolute inset-0'>
          {data.image_url ? (
            <Image
              src={data.image_url}
              alt={data.title}
              fill
              className='object-cover transition-transform duration-1000 group-hover:scale-105'
              priority
            />
          ) : (
            <div className='w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-black' />
          )}
          <div className='absolute inset-0 bg-black/40 mix-blend-multiply'></div>
        </div>

        <div className='relative z-10 text-center px-4 max-w-4xl'>
          <h1 className='text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight drop-shadow-2xl animate-in fade-in slide-in-from-bottom-6'>
            {data.title}
          </h1>
          <div className='w-24 h-1.5 bg-primary mx-auto rounded-full shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]'></div>
        </div>
      </div>

      {/* 2. İÇERİK ALANI (Glassmorphism) */}
      <div
        className='
        w-full
        bg-white/60 dark:bg-[#212529]/40 backdrop-blur-md 
        rounded-[2rem] 
        border border-black/5 dark:border-white/5 
        shadow-lg
        p-6 sm:p-10 lg:p-12
      '
      >
        {/* Dil Uyarısı */}
        {data.lang_code !== lang && (
          <div className='mb-6 p-3 bg-yellow-50/50 border border-yellow-200/50 text-yellow-700 dark:text-yellow-400 text-sm rounded-lg backdrop-blur-sm'>
            ⚠️ İçerik varsayılan dilde ({data.lang_code.toUpperCase()})
            gösteriliyor.
          </div>
        )}

        {/* Kısa Açıklama (Varsa) */}
        {data.description && (
          <p className='text-xl text-gray-600 dark:text-gray-300 font-medium mb-8 border-l-4 border-primary pl-4 italic leading-relaxed'>
            {data.description}
          </p>
        )}

        {/* HTML İçerik */}
        <div
          className='
            text-gray-700 dark:text-gray-300
            break-words overflow-hidden
            [&_h1]:font-bold [&_h1]:text-foreground [&_h1]:text-4xl [&_h1]:mt-8 [&_h1]:mb-4
            [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:text-3xl [&_h2]:mt-8 [&_h2]:mb-4
            [&_h3]:font-bold [&_h3]:text-foreground [&_h3]:text-2xl [&_h3]:mt-6 [&_h3]:mb-3
            [&_p]:leading-relaxed [&_p]:mb-4
            [&_a]:text-primary [&_a]:no-underline hover:[&_a]:underline
            [&_img]:rounded-2xl [&_img]:shadow-md [&_img]:mx-auto [&_img]:max-w-full
            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-4
            [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-4
            [&_li]:my-1
            whitespace-pre-wrap
          '
          dangerouslySetInnerHTML={{ __html: data.content || '' }}
        />
      </div>
    </div>
  )
}
