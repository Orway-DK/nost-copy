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
          `id, slug, image_url, author, created_at, blog_post_translations!inner (title, excerpt, lang_code)`
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
    // DÜZENLEME 1: Arkaplan şeffaf yapıldı (bg-transparent)
    <section className='py-12 md:py-24 bg-transparent transition-colors duration-300'>
      <div className='max-w-[1400px] mx-auto px-4'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20'>
          {/* SOL KOLON: Başlık Alanı */}
          <header className='lg:col-span-4 relative'>
            <div className='sticky top-24 text-center lg:text-left'>
              <span className='text-xs md:text-sm font-black tracking-[0.2em] text-primary uppercase mb-4 block'>
                {t.badge}
              </span>
              <h2 className='text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-[1.1]'>
                {t.title_1} <br className='hidden lg:block' />
                <span className='text-primary'>{t.title_2}</span>
              </h2>
              <p className='text-lg text-foreground/80 dark:text-muted-foreground mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0'>
                {t.desc}
              </p>
              <Link
                href='/blog'
                className='group inline-flex items-center gap-3 text-foreground font-bold hover:text-primary transition-all underline underline-offset-8 decoration-primary/30 hover:decoration-primary'
              >
                {t.btn}{' '}
                <span className='group-hover:translate-x-2 transition-transform'>
                  →
                </span>
              </Link>
            </div>
          </header>

          {/* SAĞ KOLON: Blog Yazıları */}
          <div className='lg:col-span-8 flex flex-col gap-8 md:gap-12'>
            {loading ? (
              <div className='space-y-8 animate-pulse'>
                {[1, 2].map(i => (
                  // Loading durumunda da glass effect korundu
                  <div
                    key={i}
                    className='h-64 bg-white/40 dark:bg-white/5 rounded-3xl backdrop-blur-sm'
                  />
                ))}
              </div>
            ) : (
              posts.map(post => (
                <article
                  key={post.id}
                  // DÜZENLEME 2: Kart Tasarımı (Glassmorphism)
                  // Light: bg-white/60, Dark: bg-[#212529]/40
                  className='
                    group flex flex-col md:flex-row gap-8 items-stretch 
                    bg-white/60 dark:bg-[#212529]/40 backdrop-blur-md
                    border border-black/5 dark:border-white/5
                    p-5 md:p-6 rounded-[2rem] 
                    hover:shadow-xl hover:border-primary/30 dark:hover:border-white/20 hover:bg-white/80 dark:hover:bg-[#212529]/60
                    transition-all duration-500
                  '
                >
                  {/* Görsel */}
                  <div className='relative w-full md:w-[320px] aspect-video md:aspect-[4/5] shrink-0 rounded-2xl overflow-hidden shadow-sm border border-black/5 dark:border-white/5'>
                    <Image
                      src={post.image_url || '/nost.png'}
                      alt={post.title}
                      fill
                      className='object-cover transition-transform duration-700 group-hover:scale-110'
                    />
                  </div>

                  {/* İçerik Alanı */}
                  <div className='flex flex-col justify-center py-2'>
                    <div className='flex items-center gap-4 mb-4'>
                      <span className='px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-widest'>
                        {new Date(post.created_at).toLocaleDateString(
                          lang === 'tr' ? 'tr-TR' : 'en-US'
                        )}
                      </span>
                      <span className='text-xs font-bold text-muted-foreground uppercase'>
                        by{' '}
                        <span className='text-foreground'>{post.author}</span>
                      </span>
                    </div>

                    <h3 className='text-2xl md:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors leading-tight'>
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>

                    <p className='text-base md:text-lg text-foreground/70 dark:text-muted-foreground leading-relaxed line-clamp-3 mb-6'>
                      {post.excerpt}
                    </p>

                    <Link
                      href={`/blog/${post.slug}`}
                      className='mt-auto flex items-center gap-2 text-sm font-black text-primary hover:gap-4 transition-all'
                    >
                      {t.read_more} <span>→</span>
                    </Link>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
