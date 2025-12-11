import React from "react";
import Image from "next/image";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import BlogSidebar from "@/app/_components/Blog/BlogSidebar";

// --- AYARLAR ---
const POSTS_PER_PAGE = 5;

// --- METADATA ---
export const metadata: Metadata = {
    title: "Blog & Haberler - Nost Copy",
    description: "En güncel baskı teknolojileri ve tasarım trendleri.",
};

// --- YARDIMCI: Çeviri Seçici ---
function getTranslation(translations: any[], lang: string) {
    if (!translations || translations.length === 0) return null;
    return (
        translations.find((t) => t.lang_code === lang) ||
        translations.find((t) => t.lang_code === "en") ||
        translations.find((t) => t.lang_code === "tr") ||
        translations[0]
    );
}

// --- YARDIMCI: Pagination Dizisi ---
const generatePagination = (currentPage: number, totalPages: number) => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, '...', totalPages - 1, totalPages];
    if (currentPage >= totalPages - 2) return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
};

// --- DATA FETCHING HELPERS ---
async function getSidebarData(lang: string) {
    const supabase = await createSupabaseServerClient();
    const { data: cats } = await supabase.from('blog_categories').select('id, slug, blog_category_translations(name, lang_code)');
    const { data: tags } = await supabase.from('blog_tags').select('id, slug, blog_tag_translations(name, lang_code)');
    const { data: recent } = await supabase.from('blog_posts').select('id, slug, image_url, created_at, blog_post_translations(title, lang_code)').eq('active', true).order('created_at', { ascending: false }).limit(3);

    return {
        categories: (cats || []).map(c => ({ ...c, translation: getTranslation(c.blog_category_translations, lang) })),
        tags: (tags || []).map(t => ({ ...t, translation: getTranslation(t.blog_tag_translations, lang) })),
        recent: (recent || []).map(r => ({ ...r, translation: getTranslation(r.blog_post_translations, lang) }))
    };
}

// --- ANA SAYFA ---
export default async function BlogStandardPage({ searchParams }: { searchParams: Promise<any> }) {
    const params = await searchParams;
    const currentPage = Number(params.page) || 1;
    const searchTerm = params.q || "";
    const categorySlug = params.cat || "";
    const tagSlug = params.tag || "";

    const cookieStore = await cookies();
    const langVal = cookieStore.get("lang")?.value;
    const lang = (langVal === "en" || langVal === "de") ? langVal : "tr";

    const sidebarData = await getSidebarData(lang);

    const supabase = await createSupabaseServerClient();

    // DÜZELTME: Filtreleme yapacağımız tabloları "!inner" ile çekiyoruz.
    // Bu sayede "sadece bu kategoriye sahip olanları getir" diyebiliriz.
    let query = supabase
        .from("blog_posts")
        .select(`
      id, slug, image_url, author, created_at, category_id,
      blog_post_translations!inner (title, excerpt, lang_code),
      blog_categories!inner (slug, blog_category_translations(name, lang_code)),
      blog_post_tags_pivot!inner (tag_id, blog_tags!inner(slug))
    `, { count: "exact" })
        .eq("active", true)
        .order("created_at", { ascending: false });

    // 1. Kategori Filtresi
    if (categorySlug) {
        query = query.eq('blog_categories.slug', categorySlug);
    }

    // 2. Etiket Filtresi
    // Pivot tablo üzerinden gidip tag slug'ına bakıyoruz
    if (tagSlug) {
        query = query.eq('blog_post_tags_pivot.blog_tags.slug', tagSlug);
    }

    // 3. Arama Filtresi
    if (searchTerm) {
        query = query.ilike('blog_post_translations.title', `%${searchTerm}%`);
    }

    const from = (currentPage - 1) * POSTS_PER_PAGE;
    const to = from + POSTS_PER_PAGE - 1;

    const { data: rawPosts, count, error } = await query.range(from, to);

    const totalPosts = count || 0;
    const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
    const paginationArray = generatePagination(currentPage, totalPages);

    const posts = (rawPosts || []).map((post: any) => {
        // !inner kullandığımız için direkt eşleşen çeviri gelebilir ama yine de kontrol iyidir
        // Eğer arama yapıldıysa sadece eşleşen dildeki satır gelir, bu yüzden fallback mantığını burada da kullanabiliriz
        // Ancak !inner join yaptığımız için array bazen tek elemanlı olabilir.

        // Güvenli çeviri seçimi:
        // 1. Array ise ve arama yapıldıysa Supabase sadece eşleşeni döndürebilir.
        // 2. Normal durumda hepsi döner.
        const transArray = Array.isArray(post.blog_post_translations)
            ? post.blog_post_translations
            : [post.blog_post_translations]; // Bazen object dönebilir

        const t = getTranslation(transArray, lang);
        const catT = getTranslation(post.blog_categories?.blog_category_translations, lang);

        return {
            ...post,
            title: t?.title || "Untitled",
            excerpt: t?.excerpt || "",
            categoryName: catT?.name || "General"
        };
    });

    const ui = {
        readMore: lang === "tr" ? "Devamını Oku" : lang === "de" ? "Weiterlesen" : "Read More",
        empty: lang === "tr" ? "Aradığınız kriterlere uygun yazı bulunamadı." : lang === "de" ? "Keine Beiträge gefunden." : "No posts found.",
        prev: "←",
        next: "→",
        clear: lang === "tr" ? "Filtreleri Temizle" : lang === "de" ? "Filter löschen" : "Clear Filters"
    };

    const createPageLink = (page: number | string) => {
        if (page === '...') return '#';
        const queryParams = new URLSearchParams();
        if (page) queryParams.set('page', page.toString());
        if (searchTerm) queryParams.set('q', searchTerm);
        if (categorySlug) queryParams.set('cat', categorySlug);
        if (tagSlug) queryParams.set('tag', tagSlug);
        return `/blog?${queryParams.toString()}`;
    };

    return (
        <div className="w-full min-h-screen bg-background text-foreground pb-20 pt-32">
            <div className="max-w-[1400px] mx-auto px-4">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* --- MAIN CONTENT --- */}
                    <div className="lg:col-span-8 flex flex-col gap-16">

                        {posts.length === 0 ? (
                            <div className="p-12 bg-card rounded-xl text-center border border-muted/10">
                                <p className="text-xl text-muted mb-6">{ui.empty}</p>
                                <Link href="/blog" className="px-6 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary-hover transition-colors">
                                    {ui.clear}
                                </Link>
                            </div>
                        ) : (
                            posts.map((post: any) => (
                                <article key={post.id} className="group flex flex-col gap-6">
                                    <Link href={`/blog/${post.slug}`} className="relative w-full aspect-video md:aspect-[2/1] overflow-hidden rounded-2xl bg-muted/20">
                                        {post.image_url && (
                                            <Image
                                                src={post.image_url}
                                                alt={post.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        )}
                                        <div className="absolute top-6 left-6 bg-primary text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider shadow-lg">
                                            {post.categoryName}
                                        </div>
                                    </Link>

                                    <div>
                                        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted mb-3">
                                            <span className="flex items-center gap-2">
                                                📅 {new Date(post.created_at).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                            <span className="w-1 h-1 bg-muted rounded-full"></span>
                                            <span className="flex items-center gap-2">
                                                👤 {post.author || "Admin"}
                                            </span>
                                        </div>

                                        <h2 className="text-3xl md:text-4xl font-bold mb-4 group-hover:text-primary transition-colors leading-tight">
                                            <Link href={`/blog/${post.slug}`}>
                                                {post.title}
                                            </Link>
                                        </h2>

                                        <p className="text-lg text-muted mb-6 leading-relaxed line-clamp-3">
                                            {post.excerpt}
                                        </p>

                                        <Link
                                            href={`/blog/${post.slug}`}
                                            className="inline-flex items-center gap-2 px-8 py-3 bg-foreground text-background font-bold rounded-full hover:bg-primary transition-all hover:gap-4"
                                        >
                                            {ui.readMore} <span>→</span>
                                        </Link>
                                    </div>

                                    <div className="w-full h-[1px] bg-muted/20 mt-8"></div>
                                </article>
                            ))
                        )}

                        {/* --- PAGINATION --- */}
                        {totalPages > 1 && (
                            <div className="flex flex-wrap justify-center items-center gap-2 mt-8">
                                <Link
                                    href={currentPage > 1 ? createPageLink(currentPage - 1) : '#'}
                                    className={`w-10 h-10 flex items-center justify-center rounded-lg border text-sm font-bold transition-colors ${currentPage > 1 ? 'bg-card border-muted/20 hover:border-primary hover:text-primary' : 'bg-muted/10 text-muted cursor-not-allowed border-transparent'
                                        }`}
                                >
                                    {ui.prev}
                                </Link>

                                {paginationArray.map((page, index) => {
                                    if (page === '...') return <span key={index} className="w-10 h-10 flex items-center justify-center text-muted font-bold">...</span>;
                                    const isActive = page === currentPage;
                                    return (
                                        <Link
                                            key={index}
                                            href={createPageLink(page)}
                                            className={`w-10 h-10 flex items-center justify-center rounded-lg border text-sm font-bold transition-all ${isActive ? 'bg-primary text-white border-primary shadow-md scale-105' : 'bg-card border-muted/20 text-foreground hover:border-primary hover:text-primary'
                                                }`}
                                        >
                                            {page}
                                        </Link>
                                    );
                                })}

                                <Link
                                    href={currentPage < totalPages ? createPageLink(currentPage + 1) : '#'}
                                    className={`w-10 h-10 flex items-center justify-center rounded-lg border text-sm font-bold transition-colors ${currentPage < totalPages ? 'bg-card border-muted/20 hover:border-primary hover:text-primary' : 'bg-muted/10 text-muted cursor-not-allowed border-transparent'
                                        }`}
                                >
                                    {ui.next}
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* --- SIDEBAR --- */}
                    <div className="lg:col-span-4 pl-0 lg:pl-10">
                        <div className="sticky top-32">
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
        </div>
    );
}