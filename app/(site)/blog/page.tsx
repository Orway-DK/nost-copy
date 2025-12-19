import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server-client'
import { cookies } from 'next/headers'
import type { Metadata } from 'next'
import BlogSidebar from '@/app/_components/Blog/BlogSidebar'

// --- AYARLAR ---
const POSTS_PER_PAGE = 5

// --- METADATA ---
export const metadata: Metadata = {
  title: 'Blog & Haberler - Nost Copy',
  description: 'En güncel baskı teknolojileri ve tasarım trendleri.'
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

// --- YARDIMCI: Pagination Dizisi ---
const generatePagination = (currentPage: number, totalPages: number) => {
  if (totalPages <= 7)
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  if (currentPage <= 3) return [1, 2, 3, '...', totalPages - 1, totalPages]
  if (currentPage >= totalPages - 2)
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages]
  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages
  ]
}

// --- DATA FETCHING HELPERS ---
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

// --- ANA SAYFA ---
export default async function BlogStandardPage ({
  searchParams
}: {
  searchParams: Promise<any>
}) {
  const params = await searchParams
  const currentPage = Number(params.page) || 1
  const searchTerm = params.q || ''
  const categorySlug = params.cat || ''
  const tagSlug = params.tag || ''

  const cookieStore = await cookies()
  const langVal = cookieStore.get('lang')?.value
  const lang = langVal === 'en' || langVal === 'de' ? langVal : 'tr'

  const sidebarData = await getSidebarData(lang)
  const supabase = await createSupabaseServerClient()

  let query = supabase
    .from('blog_posts')
    .select(
      `
      id, slug, image_url, author, created_at, category_id,
      blog_post_translations!inner (title, excerpt, lang_code),
      blog_categories!inner (slug, blog_category_translations(name, lang_code)),
      blog_post_tags_pivot!inner (tag_id, blog_tags!inner(slug))
    `,
      { count: 'exact' }
    )
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (categorySlug) query = query.eq('blog_categories.slug', categorySlug)
  if (tagSlug) query = query.eq('blog_post_tags_pivot.blog_tags.slug', tagSlug)
  if (searchTerm)
    query = query.ilike('blog_post_translations.title', `%${searchTerm}%`)

  const from = (currentPage - 1) * POSTS_PER_PAGE
  const to = from + POSTS_PER_PAGE - 1

  const { data: rawPosts, count } = await query.range(from, to)
  const totalPosts = count || 0
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE)
  const paginationArray = generatePagination(currentPage, totalPages)

  const posts = (rawPosts || []).map((post: any) => {
    const transArray = Array.isArray(post.blog_post_translations)
      ? post.blog_post_translations
      : [post.blog_post_translations]
    const t = getTranslation(transArray, lang)
    const catT = getTranslation(
      post.blog_categories?.blog_category_translations,
      lang
    )

    return {
      ...post,
      title: t?.title || 'Untitled',
      excerpt: t?.excerpt || '',
      categoryName: catT?.name || 'General'
    }
  })

  const ui = {
    readMore:
      lang === 'tr'
        ? 'Devamını Oku'
        : lang === 'de'
        ? 'Weiterlesen'
        : 'Read More',
    empty:
      lang === 'tr'
        ? 'Aradığınız kriterlere uygun yazı bulunamadı.'
        : lang === 'de'
        ? 'Keine Beiträge gefunden.'
        : 'No posts found.',
    prev: '←',
    next: '→',
    clear:
      lang === 'tr'
        ? 'Filtreleri Temizle'
        : lang === 'de'
        ? 'Filter löschen'
        : 'Clear Filters',
    search: lang === 'tr' ? 'Arama' : lang === 'de' ? 'Suche' : 'Search',
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
    tags: lang === 'tr' ? 'Etiketler' : lang === 'de' ? 'Tags' : 'Tags',
    searchPlaceholder:
      lang === 'tr'
        ? 'Blogda ara...'
        : lang === 'de'
        ? 'Blog durchsuchen...'
        : 'Search in blog...'
  }

  const createPageLink = (page: number | string) => {
    if (page === '...') return '#'
    const queryParams = new URLSearchParams()
    if (page) queryParams.set('page', page.toString())
    if (searchTerm) queryParams.set('q', searchTerm)
    if (categorySlug) queryParams.set('cat', categorySlug)
    if (tagSlug) queryParams.set('tag', tagSlug)
    return `/blog?${queryParams.toString()}`
  }

  return (
    <main className='w-full min-h-screen bg-background text-foreground pb-20 pt-32 transition-colors duration-300'>
      <div className='max-w-[1400px] mx-auto px-4'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16'>
          {/* --- MAIN CONTENT --- */}
          <div className='lg:col-span-8 flex flex-col gap-16 md:gap-24'>
            {posts.length === 0 ? (
              <div className='p-12 md:p-20 bg-card rounded-[2.5rem] text-center border border-border/40 shadow-xl'>
                <p className='text-xl md:text-2xl text-muted-foreground mb-8 font-medium'>
                  {ui.empty}
                </p>
                <Link
                  href='/blog'
                  className='px-10 py-4 bg-primary text-primary-foreground rounded-full font-bold hover:bg-primary-hover hover:-translate-y-1 transition-all shadow-lg shadow-primary/20'
                >
                  {ui.clear}
                </Link>
              </div>
            ) : (
              posts.map((post: any) => (
                <article key={post.id} className='group flex flex-col gap-8'>
                  {/* SEO & Görsel: Aspect-ratio iyileştirildi */}
                  <Link
                    href={`/blog/${post.slug}`}
                    className='relative w-full aspect-[21/9] overflow-hidden rounded-[2.5rem] bg-muted/20 border border-border/20 shadow-2xl'
                  >
                    {post.image_url && (
                      <Image
                        src={post.image_url}
                        alt={post.title}
                        fill
                        className='object-cover transition-transform duration-1000 group-hover:scale-105'
                        priority={posts.indexOf(post) < 2}
                      />
                    )}
                    {/* Kategori Badge */}
                    <div className='absolute top-8 left-8 bg-primary text-primary-foreground text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-[0.2em] shadow-2xl'>
                      {post.categoryName}
                    </div>
                  </Link>

                  <div className='px-2 md:px-4'>
                    {/* Meta Bilgileri: text-muted-foreground yerine contrastlı foreground/70 */}
                    <div className='flex flex-wrap items-center gap-6 text-xs md:text-sm font-bold text-foreground/70 uppercase tracking-widest mb-6'>
                      <span className='flex items-center gap-2'>
                        <span className='opacity-50'>📅</span>{' '}
                        {new Date(post.created_at).toLocaleDateString(
                          lang === 'tr' ? 'tr-TR' : 'en-US',
                          { day: 'numeric', month: 'long', year: 'numeric' }
                        )}
                      </span>
                      <span className='w-1.5 h-1.5 bg-primary rounded-full opacity-40'></span>
                      <span className='flex items-center gap-2'>
                        <span className='opacity-50'>👤</span>{' '}
                        {post.author || 'Admin'}
                      </span>
                    </div>

                    <h2 className='text-3xl md:text-5xl font-bold mb-6 group-hover:text-primary transition-colors leading-[1.1] tracking-tight'>
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>

                    {/* Özet: text-slate-400 (Dark Mode'da slate-300) contrast için eklendi */}
                    <p className='text-base md:text-xl text-slate-400 dark:text-slate-300 mb-8 leading-relaxed line-clamp-3 font-medium'>
                      {post.excerpt}
                    </p>

                    <Link
                      href={`/blog/${post.slug}`}
                      className='inline-flex items-center gap-3 px-10 py-4 bg-foreground text-background dark:bg-primary dark:text-primary-foreground font-black rounded-full hover:bg-primary hover:text-primary-foreground transition-all hover:gap-6 shadow-xl'
                    >
                      {ui.readMore} <span>→</span>
                    </Link>
                  </div>

                  {/* Ayırıcı Çizgi */}
                  <div className='w-full h-px bg-gradient-to-r from-transparent via-border/40 to-transparent mt-8'></div>
                </article>
              ))
            )}

            {/* --- PAGINATION --- */}
            {totalPages > 1 && (
              <div className='flex flex-wrap justify-center items-center gap-3 mt-4'>
                <Link
                  href={currentPage > 1 ? createPageLink(currentPage - 1) : '#'}
                  className={`w-12 h-12 flex items-center justify-center rounded-2xl border text-lg font-black transition-all ${
                    currentPage > 1
                      ? 'bg-card border-border/40 text-foreground hover:border-primary hover:text-primary shadow-sm'
                      : 'bg-muted/10 text-muted-foreground/30 cursor-not-allowed border-transparent'
                  }`}
                >
                  {ui.prev}
                </Link>

                {paginationArray.map((page, index) => {
                  if (page === '...')
                    return (
                      <span
                        key={index}
                        className='w-12 h-12 flex items-center justify-center text-muted-foreground font-bold'
                      >
                        ...
                      </span>
                    )
                  const isActive = page === currentPage
                  return (
                    <Link
                      key={index}
                      href={createPageLink(page)}
                      className={`w-12 h-12 flex items-center justify-center rounded-2xl border text-sm font-black transition-all ${
                        isActive
                          ? 'bg-primary text-primary-foreground border-primary shadow-xl scale-110'
                          : 'bg-card border-border/40 text-foreground/70 hover:border-primary hover:text-primary shadow-sm'
                      }`}
                    >
                      {page}
                    </Link>
                  )
                })}

                <Link
                  href={
                    currentPage < totalPages
                      ? createPageLink(currentPage + 1)
                      : '#'
                  }
                  className={`w-12 h-12 flex items-center justify-center rounded-2xl border text-lg font-black transition-all ${
                    currentPage < totalPages
                      ? 'bg-card border-border/40 text-foreground hover:border-primary hover:text-primary shadow-sm'
                      : 'bg-muted/10 text-muted-foreground/30 cursor-not-allowed border-transparent'
                  }`}
                >
                  {ui.next}
                </Link>
              </div>
            )}
          </div>

          {/* --- SIDEBAR --- */}
          <div className='lg:col-span-4 pl-0 lg:pl-10'>
            <div className='sticky top-32'>
              <BlogSidebar
                lang={lang}
                categories={sidebarData.categories}
                tags={sidebarData.tags}
                recentPosts={sidebarData.recent}
                ui={ui}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
