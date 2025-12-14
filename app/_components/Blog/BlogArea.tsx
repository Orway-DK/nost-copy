// C:\Projeler\nost-copy\app\_components\Blog\BlogArea.tsx
'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useLanguage } from '@/components/LanguageProvider'

const UI_TEXTS: Record<string, any> = {
  tr: {
    badge: 'EN YENİ MAKALELER',
    title_1: 'Son Eklenen',
    title_2: 'Blog Yazıları',
    desc: 'Hızlı, güvenilir ve yüksek kaliteli baskı hizmetleri almak için ihtiyacınız olan her şeye sahibiz.',
    btn: 'Tümünü Oku',
    read_more: 'Devamını Oku',
    comments: 'Yorum'
  },
  en: {
    badge: 'NEWEST ARTICLES',
    title_1: 'Read Our Latest',
    title_2: 'Blog Posts',
    desc: 'We have all the equipment, know-how and every thing you will need to receive fast, reliable printing services.',
    btn: 'Read More',
    read_more: 'Read More',
    comments: 'Comments'
  },
  de: {
    badge: 'NEUESTE ARTIKEL',
    title_1: 'Lesen Sie unsere',
    title_2: 'Blog-Beiträge',
    desc: 'Wir haben die Ausrüstung und das Know-how, um schnelle und zuverlässige Druckdienstleistungen zu bieten.',
    btn: 'Mehr Lesen',
    read_more: 'Weiterlesen',
    comments: 'Kommentare'
  }
}

type BlogPost = {
  id: number
  slug: string
  image_url: string
  author: string
  created_at: string
  title: string
  excerpt: string
}

export default function HomeBlogArea () {
  const { lang } = useLanguage()
  const t = UI_TEXTS[lang] || UI_TEXTS.tr
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPosts () {
      const supabase = createSupabaseBrowserClient()

      const { data, error } = await supabase
        .from('blog_posts')
        .select(
          `
          id, slug, image_url, author, created_at,
          blog_post_translations!inner (title, excerpt, lang_code)
        `
        )
        .order('created_at', { ascending: false })
        .limit(3)

      if (data && !error) {
        const formatted = data.map((item: any) => {
          const tr =
            item.blog_post_translations.find(
              (t: any) => t.lang_code === lang
            ) || item.blog_post_translations[0]

          return {
            id: item.id,
            slug: item.slug,
            image_url: item.image_url,
            author: item.author,
            created_at: item.created_at,
            title: tr?.title || 'Untitled',
            excerpt: tr?.excerpt || ''
          }
        })
        setPosts(formatted)
      }
      setLoading(false)
    }

    fetchPosts()
  }, [lang])

  return (
    <section className='py-0 md:py-24 bg-background overflow-hidden'>
      <div className='max-w-[1400px] mx-auto px-4'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20'>
          {/* SOL KOLON (Başlık & Açıklama) */}
          <div className='lg:col-span-4 relative text-center lg:text-left'>
            <div className='sticky top-24'>
              {/* Dekoratif Daire - Mobilde Gizle */}
              <div className='hidden lg:block absolute -top-20 -left-20 w-[300px] h-[300px] opacity-10 pointer-events-none'>
                <Image
                  src='/h1-bg01.svg'
                  alt='decoration'
                  width={300}
                  height={300}
                  className='animate-spin-slow'
                />
              </div>

              <div className='relative z-10'>
                <span className='text-xs md:text-sm font-bold tracking-widest text-muted uppercase mb-3 block'>
                  {t.badge}
                </span>
                <h2 className='text-3xl md:text-5xl font-bold text-foreground mb-4 md:mb-6 leading-tight'>
                  {t.title_1} <br className='hidden md:block' />
                  <span className='text-primary'>{t.title_2}</span>
                </h2>
                <p className='text-base md:text-lg text-muted mb-6 md:mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0'>
                  {t.desc}
                </p>

                <Link
                  href='/blog'
                  className='group inline-flex items-center gap-3 text-foreground font-bold hover:text-primary transition-colors mb-8 lg:mb-0'
                >
                  <span className='border-b-2 border-foreground group-hover:border-primary pb-1 transition-colors'>
                    {t.btn}
                  </span>
                  <span className='group-hover:translate-x-2 transition-transform duration-300'>
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* SAĞ KOLON (Blog Listesi) */}
          <div className='lg:col-span-8 flex flex-col gap-6 md:gap-10'>
            {loading
              ? // Loading Skeleton
                [1, 2, 3].map(i => (
                  <div
                    key={i}
                    className='flex flex-col md:flex-row gap-6 animate-pulse bg-card p-4 rounded-xl border border-border/50'
                  >
                    <div className='w-full md:w-[280px] h-[200px] bg-muted/20 rounded-lg'></div>
                    <div className='flex-1 space-y-4 py-2'>
                      <div className='h-4 bg-muted/20 rounded w-1/4'></div>
                      <div className='h-6 bg-muted/20 rounded w-3/4'></div>
                      <div className='h-4 bg-muted/20 rounded w-full'></div>
                    </div>
                  </div>
                ))
              : posts.map(post => (
                  <article
                    key={post.id}
                    // MOBİL DÜZELTMESİ:
                    // flex-col: Mobilde alt alta
                    // bg-card, border, shadow: Kart görünümü
                    // p-4: İç boşluk
                    className='group flex flex-col md:flex-row gap-6 items-start bg-card rounded-2xl border border-border/40 p-4 md:p-0 md:bg-transparent md:border-0 hover:border-primary/20 transition-all duration-300 shadow-sm md:shadow-none hover:shadow-md'
                  >
                    {/* Görsel */}
                    <Link
                      href={`/blog/${post.slug}`}
                      className='relative w-full md:w-[280px] aspect-[4/3] md:aspect-[4/3] lg:h-[220px] shrink-0 rounded-xl overflow-hidden bg-muted/10'
                    >
                      {post.image_url && (
                        <Image
                          src={post.image_url}
                          alt={post.title}
                          fill
                          className='object-cover transition-transform duration-500 group-hover:scale-105'
                        />
                      )}
                      {/* Tarih Rozeti (Mobilde Görselin Üzerinde) */}
                      <div className='absolute top-3 left-3 bg-background/95 backdrop-blur text-foreground text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-border/50'>
                        {new Date(post.created_at).toLocaleDateString(
                          lang === 'tr' ? 'tr-TR' : 'en-US'
                        )}
                      </div>
                    </Link>

                    {/* İçerik */}
                    <div className='flex-1 py-1 md:py-2 px-1 md:px-0 flex flex-col justify-between h-full'>
                      <div>
                        <div className='flex items-center gap-3 text-xs font-bold text-muted uppercase tracking-wider mb-3'>
                          <span className='text-primary flex items-center gap-1'>
                            <span className='w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px]'>
                              👤
                            </span>
                            {post.author}
                          </span>
                          <span className='w-1 h-1 rounded-full bg-muted'></span>
                          <span>3 {t.comments}</span>
                        </div>

                        <h3 className='text-lg md:text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2'>
                          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                        </h3>

                        <p className='text-sm md:text-base text-muted mb-4 line-clamp-2 md:line-clamp-2 leading-relaxed'>
                          {post.excerpt}
                        </p>
                      </div>

                      <Link
                        href={`/blog/${post.slug}`}
                        className='inline-flex items-center text-sm font-bold text-foreground hover:text-primary transition-colors mt-auto'
                      >
                        {t.read_more}{' '}
                        <span className='ml-2 group-hover:ml-3 transition-all'>
                          →
                        </span>
                      </Link>
                    </div>
                  </article>
                ))}
          </div>
        </div>
      </div>
    </section>
  )
}
