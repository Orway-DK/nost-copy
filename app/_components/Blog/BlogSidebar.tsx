// C:\Projeler\nost-copy\app\_components\Blog\BlogSidebar.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

type SidebarProps = {
  lang: string
  categories: any[]
  tags: any[]
  recentPosts: any[]
  ui: any
}

export default function BlogSidebar ({
  lang,
  categories,
  tags,
  recentPosts,
  ui
}: SidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (searchTerm.trim()) params.set('q', searchTerm)
    else params.delete('q')
    router.push(`/blog?${params.toString()}`)
  }

  return (
    <aside className='flex flex-col gap-8 sticky top-24'>
      {/* 1. ARAMA: bg-secondary-den ayrışması için bg-card kullanıldı */}
      <div className='bg-card p-8 rounded-[2rem] border border-border/40 shadow-sm'>
        <h3 className='text-xl font-bold mb-6 text-foreground border-l-4 border-primary pl-4'>
          {ui.search}
        </h3>
        <form onSubmit={handleSearch} className='relative'>
          <input
            type='text'
            placeholder={ui.searchPlaceholder}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='w-full px-5 py-4 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-foreground text-sm font-medium'
          />
          <button
            type='submit'
            className='absolute right-4 top-1/2 -translate-y-1/2 text-primary text-xl'
          >
            🔍
          </button>
        </form>
      </div>

      {/* 2. KATEGORİLER: Yazı okunurluğu için text-foreground/80 kullanıldı */}
      <div className='bg-card p-8 rounded-[2rem] border border-border/40 shadow-sm'>
        <h3 className='text-xl font-bold mb-6 text-foreground border-l-4 border-primary pl-4'>
          {ui.categories}
        </h3>
        <ul className='space-y-3'>
          {categories.map(cat => (
            <li key={cat.id}>
              <Link
                href={`/blog?cat=${cat.slug}`}
                className={`flex justify-between items-center px-4 py-3 rounded-xl transition-all border ${
                  searchParams.get('cat') === cat.slug
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-[1.02]'
                    : 'bg-secondary/50 text-foreground/80 hover:bg-secondary hover:text-primary border-transparent'
                }`}
              >
                <span className='font-bold text-sm'>
                  {cat.translation?.name || cat.slug}
                </span>
                <span className='opacity-50'>→</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* 3. SON YAZILAR: Metinler bg-card üzerinde foreground olarak ayarlandı */}
      <div className='bg-card p-8 rounded-[2rem] border border-border/40 shadow-sm'>
        <h3 className='text-xl font-bold mb-6 text-foreground border-l-4 border-primary pl-4'>
          {ui.recent}
        </h3>
        <div className='space-y-6'>
          {recentPosts.map(post => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className='flex gap-4 group'
            >
              <div className='relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-border/50 bg-muted/20'>
                <Image
                  src={post.image_url || '/nost.png'}
                  alt='thumb'
                  fill
                  className='object-cover group-hover:scale-110 transition-duration-500'
                />
              </div>
              <div className='flex flex-col justify-center'>
                <span className='text-[10px] font-black text-primary uppercase tracking-tighter mb-1'>
                  {new Date(post.created_at).toLocaleDateString(
                    lang === 'tr' ? 'tr-TR' : 'en-US'
                  )}
                </span>
                <h4 className='text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2'>
                  {post.translation?.title}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  )
}
