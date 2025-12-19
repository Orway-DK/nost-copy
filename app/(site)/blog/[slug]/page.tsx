import React from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server-client'
import { cookies } from 'next/headers'
import type { Metadata } from 'next'
import BlogSidebar from '@/app/_components/Blog/BlogSidebar'

type Props = {
  params: Promise<{ slug: string }>
}

// --- YARDIMCI: Çeviri Seçici ---
function getTranslation (translations: any[], lang: string) {
  if (!translations || translations.length === 0) return null
  return (
    translations.find(t => t.lang_code === lang) ||
    translations.find(t => t.lang_code === 'en') ||
    translations.find(t => t.lang_code === 'tr') ||
    translations[0]
  )
}

// --- DATA FETCHING ---
async function getSidebarData (lang: string) {
  const supabase = await createSupabaseServerClient()
  const { data: cats } = await supabase
    .from('blog_categories')
    .select('id, slug, blog_category_translations(name, lang_code)')
  const { data: tags } = await supabase
    .from('blog_tags')
    .select('id, slug, blog_tag_translations(name, lang_code)')
  const { data: recent } = await supabase
    .from('blog_posts')
    .select(
      'id, slug, image_url, created_at, blog_post_translations(title, lang_code)'
    )
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(3)

  return {
    categories: (cats || []).map(c => ({
      ...c,
      translation: getTranslation(c.blog_category_translations, lang)
    })),
    tags: (tags || []).map(t => ({
      ...t,
      translation: getTranslation(t.blog_tag_translations, lang)
    })),
    recent: (recent || []).map(r => ({
      ...r,
      translation: getTranslation(r.blog_post_translations, lang)
    }))
  }
}

async function getAdjacentPosts (currentId: number, lang: string) {
  const supabase = await createSupabaseServerClient()
  const { data: prev } = await supabase
    .from('blog_posts')
    .select('slug, blog_post_translations(title, lang_code)')
    .lt('id', currentId)
    .eq('active', true)
    .order('id', { ascending: false })
    .limit(1)
    .single()
  const { data: next } = await supabase
    .from('blog_posts')
    .select('slug, blog_post_translations(title, lang_code)')
    .gt('id', currentId)
    .eq('active', true)
    .order('id', { ascending: true })
    .limit(1)
    .single()

  return {
    prev: prev
      ? {
          slug: prev.slug,
          title: getTranslation(prev.blog_post_translations, lang)?.title
        }
      : null,
    next: next
      ? {
          slug: next.slug,
          title: getTranslation(next.blog_post_translations, lang)?.title
        }
      : null
  }
}

// --- METADATA ---
export async function generateMetadata ({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const cookieStore = await cookies()
  const lang = cookieStore.get('lang')?.value || 'tr'
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('blog_post_translations(title, excerpt, lang_code)')
    .eq('slug', slug)
    .single()
  const t = getTranslation(data?.blog_post_translations || [], lang)
  if (!t) return { title: 'Blog Not Found' }
  return { title: `${t.title} - Nost Copy Blog`, description: t.excerpt }
}

// --- ANA COMPONENT ---
export default async function BlogPostPage ({ params }: Props) {
  const { slug } = await params
  const cookieStore = await cookies()
  const langVal = cookieStore.get('lang')?.value
  const lang = langVal === 'en' || langVal === 'de' ? langVal : 'tr'
  const supabase = await createSupabaseServerClient()

  const { data: post, error } = await supabase
    .from('blog_posts')
    .select(
      `
      id, slug, image_url, author, created_at, category_id,
      blog_post_translations (title, excerpt, content, lang_code),
      blog_categories (slug, blog_category_translations(name, lang_code)),
      blog_post_tags_pivot (blog_tags (slug, blog_tag_translations (name, lang_code)))
    `
    )
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (error || !post) notFound()

  const t = getTranslation(post.blog_post_translations, lang)
  if (!t) notFound()

  const categoryData = Array.isArray(post.blog_categories)
    ? post.blog_categories[0]
    : post.blog_categories
  const categoryT = getTranslation(
    categoryData?.blog_category_translations || [],
    lang
  )
  const tags = (post.blog_post_tags_pivot || []).map((pivot: any) => ({
    slug: pivot.blog_tags.slug,
    name:
      getTranslation(pivot.blog_tags?.blog_tag_translations || [], lang)
        ?.name || pivot.blog_tags.slug
  }))

  const sidebarData = await getSidebarData(lang)
  const adjacentPosts = await getAdjacentPosts(post.id, lang)

  const ui = {
    search: lang === 'tr' ? 'Ara' : lang === 'de' ? 'Suche' : 'Search',
    searchPlaceholder:
      lang === 'tr'
        ? 'Bir şeyler yazın...'
        : lang === 'de'
        ? 'Stichworte eingeben...'
        : 'Type keywords...',
    categories:
      lang === 'tr'
        ? 'Kategoriler'
        : lang === 'de'
        ? 'Kategorien'
        : 'Categories',
    recent:
      lang === 'tr'
        ? 'Son Yazılar'
        : lang === 'de'
        ? 'Neueste Beiträge'
        : 'Recent Posts',
    tags: lang === 'tr' ? 'Etiketler' : lang === 'de' ? 'Schlagwörter' : 'Tags',
    clear: lang === 'tr' ? 'Temizle' : lang === 'de' ? 'Löschen' : 'Clear',
    share: lang === 'tr' ? 'Paylaş' : lang === 'de' ? 'Teilen' : 'Share',
    prev:
      lang === 'tr'
        ? 'Önceki Yazı'
        : lang === 'de'
        ? 'Vorheriger Beitrag'
        : 'Previous Post',
    next:
      lang === 'tr'
        ? 'Sonraki Yazı'
        : lang === 'de'
        ? 'Nächster Beitrag'
        : 'Next Post'
  }

  const formattedDate = new Date(post.created_at).toLocaleDateString(
    lang === 'tr' ? 'tr-TR' : 'en-US',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )

  // OKUNABİLİRLİK: prose-slate ve prose-invert ile dark mode ayarı yapıldı
  const proseClasses = `
    prose prose-lg md:prose-xl max-w-none mb-12
    text-slate-400 dark:text-slate-300
    prose-headings:text-foreground prose-headings:font-bold
    prose-p:leading-relaxed
    prose-a:text-primary prose-a:font-bold hover:prose-a:text-primary-hover
    prose-strong:text-foreground prose-strong:font-black
    prose-blockquote:border-primary prose-blockquote:bg-muted/30 prose-blockquote:py-2 prose-blockquote:rounded-r-xl prose-blockquote:text-foreground/90 prose-blockquote:italic
    prose-li:marker:text-primary prose-img:rounded-[2rem] prose-img:shadow-2xl
  `

  return (
    <div className='w-full min-h-screen bg-background text-foreground pb-20 pt-32 transition-colors duration-300'>
      <div className='max-w-[1400px] mx-auto px-4'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16'>
          {/* --- ANA İÇERİK --- */}
          <main className='lg:col-span-8'>
            <article>
              <header className='mb-10'>
                <div className='flex flex-wrap items-center gap-4 text-xs md:text-sm font-black text-primary uppercase tracking-[0.2em] mb-6'>
                  {categoryT && categoryData && (
                    <Link
                      href={`/blog?cat=${categoryData.slug}`}
                      className='hover:underline'
                    >
                      {categoryT.name}
                    </Link>
                  )}
                  <span className='w-1.5 h-1.5 bg-border rounded-full'></span>
                  <span className='text-muted-foreground'>{formattedDate}</span>
                  {t.lang_code !== lang && (
                    <span className='ml-2 px-3 py-1 text-[10px] rounded-full border border-primary/30 text-primary font-bold'>
                      {t.lang_code.toUpperCase()} VERSION
                    </span>
                  )}
                </div>

                <h1 className='text-4xl md:text-6xl font-black text-foreground mb-8 leading-[1.1] tracking-tight'>
                  {t.title}
                </h1>

                <div className='flex items-center gap-4 py-6 border-y border-border/40 mb-10'>
                  <div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl shadow-inner'>
                    👤
                  </div>
                  <div>
                    <p className='text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1'>
                      Author
                    </p>
                    <p className='text-sm font-bold text-foreground'>
                      {post.author || 'Nost Copy Team'}
                    </p>
                  </div>
                </div>
              </header>

              {/* ÖNE ÇIKAN GÖRSEL */}
              <figure className='relative w-full aspect-[21/9] rounded-[2.5rem] overflow-hidden mb-16 bg-muted/20 border border-border/20 shadow-2xl'>
                {post.image_url ? (
                  <Image
                    src={post.image_url}
                    alt={t.title}
                    fill
                    className='object-cover'
                    priority
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center text-muted-foreground'>
                    No Featured Image
                  </div>
                )}
              </figure>

              {/* İÇERİK BLOĞU */}
              <div className={proseClasses}>
                {t.excerpt && (
                  <div className='text-xl md:text-2xl font-medium text-foreground/90 leading-relaxed mb-12 p-8 bg-secondary/30 rounded-[2rem] border-l-8 border-primary shadow-inner'>
                    {t.excerpt}
                  </div>
                )}
                <div
                  className='blog-content-rich-text'
                  dangerouslySetInnerHTML={{ __html: t.content || '' }}
                />
              </div>

              {/* TAGS & SHARE BAR */}
              <footer className='mt-16 pt-8 border-t border-border/40'>
                <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-card p-8 rounded-[2rem] border border-border/40'>
                  <div className='flex flex-wrap items-center gap-3'>
                    <span className='text-xs font-black text-muted-foreground uppercase tracking-widest mr-2'>
                      {ui.tags}:
                    </span>
                    {tags.map((tag: any) => (
                      <Link
                        key={tag.slug}
                        href={`/blog?tag=${tag.slug}`}
                        className='px-4 py-2 bg-background border border-border/60 text-[10px] font-black text-foreground/70 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all uppercase rounded-xl tracking-tighter'
                      >
                        #{tag.name}
                      </Link>
                    ))}
                  </div>

                  <div className='flex items-center gap-4'>
                    <span className='text-xs font-black text-muted-foreground uppercase tracking-widest'>
                      {ui.share}:
                    </span>
                    <div className='flex gap-2'>
                      {['FB', 'TW', 'IN'].map(social => (
                        <button
                          key={social}
                          className='w-10 h-10 rounded-xl bg-background border border-border/60 text-foreground flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all text-xs font-black'
                        >
                          {social}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </footer>

              {/* SONRAKİ/ÖNCEKİ NAVİGASYON */}
              <nav className='mt-12 grid grid-cols-1 md:grid-cols-2 gap-6'>
                {adjacentPosts.prev ? (
                  <Link
                    href={`/blog/${adjacentPosts.prev.slug}`}
                    className='group p-8 border border-border/40 rounded-[2rem] hover:border-primary/50 bg-card hover:bg-card-hover transition-all text-left shadow-sm hover:shadow-xl'
                  >
                    <span className='text-[10px] font-black text-primary uppercase mb-3 block tracking-widest'>
                      ← {ui.prev}
                    </span>
                    <h4 className='text-lg font-bold text-foreground leading-tight group-hover:translate-x-2 transition-transform'>
                      {adjacentPosts.prev.title}
                    </h4>
                  </Link>
                ) : (
                  <div />
                )}

                {adjacentPosts.next ? (
                  <Link
                    href={`/blog/${adjacentPosts.next.slug}`}
                    className='group p-8 border border-border/40 rounded-[2rem] hover:border-primary/50 bg-card hover:bg-card-hover transition-all text-right shadow-sm hover:shadow-xl'
                  >
                    <span className='text-[10px] font-black text-primary uppercase mb-3 block tracking-widest'>
                      {ui.next} →
                    </span>
                    <h4 className='text-lg font-bold text-foreground leading-tight group-hover:-translate-x-2 transition-transform'>
                      {adjacentPosts.next.title}
                    </h4>
                  </Link>
                ) : (
                  <div />
                )}
              </nav>
            </article>
          </main>

          {/* --- SIDEBAR --- */}
          <aside className='lg:col-span-4 pl-0 lg:pl-10'>
            <div className='sticky top-32'>
              <BlogSidebar
                lang={lang}
                categories={sidebarData.categories}
                tags={sidebarData.tags}
                recentPosts={sidebarData.recent}
                ui={ui}
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
