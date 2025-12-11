import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import BlogSidebar from "@/app/_components/Blog/BlogSidebar";

type Props = {
    params: Promise<{ slug: string }>;
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

// --- DATA FETCHING ---
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

async function getAdjacentPosts(currentId: number, lang: string) {
    const supabase = await createSupabaseServerClient();

    const { data: prev } = await supabase.from('blog_posts').select('slug, blog_post_translations(title, lang_code)').lt('id', currentId).eq('active', true).order('id', { ascending: false }).limit(1).single();
    const { data: next } = await supabase.from('blog_posts').select('slug, blog_post_translations(title, lang_code)').gt('id', currentId).eq('active', true).order('id', { ascending: true }).limit(1).single();

    return {
        prev: prev ? { slug: prev.slug, title: getTranslation(prev.blog_post_translations, lang)?.title } : null,
        next: next ? { slug: next.slug, title: getTranslation(next.blog_post_translations, lang)?.title } : null
    };
}

// --- METADATA ---
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const cookieStore = await cookies();
    const lang = cookieStore.get("lang")?.value || "tr";
    const supabase = await createSupabaseServerClient();

    const { data } = await supabase
        .from("blog_posts")
        .select("blog_post_translations(title, excerpt, lang_code)")
        .eq("slug", slug)
        .single();

    const t = getTranslation(data?.blog_post_translations || [], lang);
    if (!t) return { title: "Blog Not Found" };

    return {
        title: `${t.title} - Nost Copy Blog`,
        description: t.excerpt,
    };
}

// --- ANA COMPONENT ---
export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const cookieStore = await cookies();
    const langVal = cookieStore.get("lang")?.value;
    const lang = (langVal === "en" || langVal === "de") ? langVal : "tr";

    const supabase = await createSupabaseServerClient();

    // 1. Post Verisini Çek
    const { data: post, error } = await supabase
        .from("blog_posts")
        .select(`
      id, slug, image_url, author, created_at, category_id,
      blog_post_translations (title, excerpt, content, lang_code),
      blog_categories (slug, blog_category_translations(name, lang_code)),
      blog_post_tags_pivot (blog_tags (slug, blog_tag_translations (name, lang_code)))
    `)
        .eq("slug", slug)
        .eq("active", true)
        .single();

    if (error || !post) notFound();

    // 2. Çevirileri İşle
    const t = getTranslation(post.blog_post_translations, lang);
    if (!t) notFound();

    // FIX 1: Access the first item of the array for translations
    const categoryT = getTranslation(post.blog_categories?.[0]?.blog_category_translations || [], lang);

    const tags = (post.blog_post_tags_pivot || []).map((pivot: any) => {
        const tagT = getTranslation(pivot.blog_tags?.blog_tag_translations || [], lang);
        return { slug: pivot.blog_tags.slug, name: tagT?.name || pivot.blog_tags.slug };
    });

    const sidebarData = await getSidebarData(lang);
    const adjacentPosts = await getAdjacentPosts(post.id, lang);

    // UI Metinleri
    const ui = {
        search: lang === "tr" ? "Ara" : lang === "de" ? "Suche" : "Search",
        searchPlaceholder: lang === "tr" ? "Bir şeyler yazın..." : lang === "de" ? "Stichworte eingeben..." : "Type keywords...",
        categories: lang === "tr" ? "Kategoriler" : lang === "de" ? "Kategorien" : "Categories",
        recent: lang === "tr" ? "Son Yazılar" : lang === "de" ? "Neueste Beiträge" : "Recent Posts",
        tags: lang === "tr" ? "Etiketler" : lang === "de" ? "Schlagwörter" : "Tags",
        clear: lang === "tr" ? "Temizle" : lang === "de" ? "Löschen" : "Clear",
        share: lang === "tr" ? "Paylaş" : lang === "de" ? "Teilen" : "Share",
        prev: lang === "tr" ? "Önceki Yazı" : lang === "de" ? "Vorheriger Beitrag" : "Previous Post",
        next: lang === "tr" ? "Sonraki Yazı" : lang === "de" ? "Nächster Beitrag" : "Next Post",
    };

    const formattedDate = new Date(post.created_at).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });

    const proseClasses = `
    prose prose-lg max-w-none mb-12
    text-foreground/80
    prose-headings:text-foreground
    prose-a:text-primary hover:prose-a:text-primary-hover
    prose-strong:text-foreground
    prose-blockquote:border-primary prose-blockquote:text-muted
    prose-li:marker:text-primary
  `;

    return (
        <div className="w-full min-h-screen bg-background text-foreground pb-20 pt-32">
            <div className="max-w-[1400px] mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* --- SOL KOLON (Ana İçerik) --- */}
                    <main className="lg:col-span-8">
                        <article>
                            {/* META & BAŞLIK */}
                            <div className="mb-6">
                                <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-muted uppercase tracking-wider mb-3">
                                    {/* FIX 2: Added ?.[0] here as well to access the slug from the array */}
                                    {categoryT && post.blog_categories?.[0] && (
                                        <Link href={`/blog?cat=${post.blog_categories[0].slug}`} className="text-primary hover:underline">
                                            {categoryT.name}
                                        </Link>
                                    )}
                                    <span className="w-1 h-1 bg-muted rounded-full"></span>
                                    <span className="text-muted">{formattedDate}</span>

                                    {t.lang_code !== lang && (
                                        <span className="ml-2 px-2 py-0.5 text-xs rounded border border-primary text-primary bg-card">
                                            {t.lang_code.toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-4xl md:text-5xl font-black text-foreground mb-6 leading-tight">
                                    {t.title}
                                </h1>
                            </div>

                            {/* GÖRSEL ALANI */}
                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-10 bg-card shadow-sm border border-muted-light/20">
                                {post.image_url ? (
                                    <Image src={post.image_url} alt={t.title} fill className="object-cover" priority />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted">No Image</div>
                                )}
                            </div>

                            {/* İÇERİK ALANI */}
                            <div className={proseClasses}>
                                {t.excerpt && (
                                    <p className="text-xl font-medium text-foreground italic border-l-4 border-primary pl-4 mb-8">
                                        {t.excerpt}
                                    </p>
                                )}
                                <div dangerouslySetInnerHTML={{ __html: t.content || "" }} />
                            </div>

                            {/* FOOTER (Tags & Share) */}
                            <div className="border-t border-b border-muted-light/30 py-6 flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-foreground mr-2">{ui.tags}:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map((tag: any) => (
                                            <Link key={tag.slug} href={`/blog?tag=${tag.slug}`} className="px-3 py-1 bg-card text-xs font-bold text-muted hover:text-background hover:bg-primary transition-colors uppercase rounded-md">
                                                #{tag.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-bold text-foreground">{ui.share}:</span>
                                    <div className="flex gap-3">
                                        <button className="w-8 h-8 rounded-full bg-card text-foreground flex items-center justify-center hover:bg-primary hover:text-background transition-all text-xs font-bold">F</button>
                                        <button className="w-8 h-8 rounded-full bg-card text-foreground flex items-center justify-center hover:bg-primary hover:text-background transition-all text-xs font-bold">X</button>
                                        <button className="w-8 h-8 rounded-full bg-card text-foreground flex items-center justify-center hover:bg-primary hover:text-background transition-all text-xs font-bold">in</button>
                                    </div>
                                </div>
                            </div>

                            {/* PREV / NEXT NAVIGATION */}
                            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {adjacentPosts.prev ? (
                                    <Link href={`/blog/${adjacentPosts.prev.slug}`} className="group p-6 border border-muted-light/30 rounded-xl hover:border-primary/50 bg-card/30 hover:bg-card transition-all text-left">
                                        <span className="text-xs font-bold text-muted uppercase mb-2 block group-hover:text-primary transition-colors">← {ui.prev}</span>
                                        <h4 className="font-bold text-foreground line-clamp-1 group-hover:translate-x-1 transition-transform">{adjacentPosts.prev.title}</h4>
                                    </Link>
                                ) : <div></div>}

                                {adjacentPosts.next ? (
                                    <Link href={`/blog/${adjacentPosts.next.slug}`} className="group p-6 border border-muted-light/30 rounded-xl hover:border-primary/50 bg-card/30 hover:bg-card transition-all text-right">
                                        <span className="text-xs font-bold text-muted uppercase mb-2 block group-hover:text-primary transition-colors">{ui.next} →</span>
                                        <h4 className="font-bold text-foreground line-clamp-1 group-hover:-translate-x-1 transition-transform">{adjacentPosts.next.title}</h4>
                                    </Link>
                                ) : <div></div>}
                            </div>

                        </article>
                    </main>

                    {/* --- SIDEBAR --- */}
                    <aside className="lg:col-span-4 pl-0 lg:pl-10">
                        <div className="sticky top-32">
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
    );
}