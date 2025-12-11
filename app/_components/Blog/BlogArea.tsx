"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";

const UI_TEXTS: Record<string, any> = {
    tr: {
        badge: "EN YENİ MAKALELER",
        title_1: "Son Eklenen",
        title_2: "Blog Yazıları",
        desc: "Hızlı, güvenilir ve yüksek kaliteli baskı hizmetleri almak için ihtiyacınız olan her şeye sahibiz.",
        btn: "Tümünü Oku",
        read_more: "Devamını Oku",
        comments: "Yorum"
    },
    en: {
        badge: "NEWEST ARTICLES",
        title_1: "Read Our Latest",
        title_2: "Blog Posts",
        desc: "We have all the equipment, know-how and every thing you will need to receive fast, reliable printing services.",
        btn: "Read More",
        read_more: "Read More",
        comments: "Comments"
    },
    de: {
        badge: "NEUESTE ARTIKEL",
        title_1: "Lesen Sie unsere",
        title_2: "Blog-Beiträge",
        desc: "Wir haben die Ausrüstung und das Know-how, um schnelle und zuverlässige Druckdienstleistungen zu bieten.",
        btn: "Mehr Lesen",
        read_more: "Weiterlesen",
        comments: "Kommentare"
    }
};

type BlogPost = {
    id: number;
    slug: string;
    image_url: string;
    author: string;
    created_at: string;
    title: string;
    excerpt: string;
};

export default function HomeBlogArea() {
    const { lang } = useLanguage();
    const t = UI_TEXTS[lang] || UI_TEXTS.tr;
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPosts() {
            const supabase = createSupabaseBrowserClient();

            const { data, error } = await supabase
                .from('blog_posts')
                .select(`
          id, slug, image_url, author, created_at,
          blog_post_translations!inner (title, excerpt, lang_code)
        `)
                //.eq('active', true)
                .order('created_at', { ascending: false })
                .limit(3);

            console.log("SUPABASE YANITI:", { data, error }); // <--- BUNU EKLE

            if (data && !error) {
                const formatted = data.map((item: any) => {
                    const tr = item.blog_post_translations.find((t: any) => t.lang_code === lang)
                        || item.blog_post_translations[0];

                    return {
                        id: item.id,
                        slug: item.slug,
                        image_url: item.image_url,
                        author: item.author,
                        created_at: item.created_at,
                        title: tr?.title || "Untitled",
                        excerpt: tr?.excerpt || ""
                    };
                });
                setPosts(formatted);
            }
            setLoading(false);
        }

        fetchPosts();
    }, [lang]);

    return (
        <section className="py-24 bg-background overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-4">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
                    <div className="lg:col-span-4 relative">
                        <div className="sticky top-24">
                            <div className="absolute -top-20 -left-20 w-[300px] h-[300px] opacity-10 pointer-events-none">
                                <Image src="/h1-bg01.svg" alt="decoration" width={300} height={300} className="animate-spin-slow" />
                            </div>

                            <div className="relative z-10">
                                <span className="text-sm font-bold tracking-widest text-muted uppercase mb-4 block">
                                    {t.badge}
                                </span>
                                <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                                    {t.title_1} <br />
                                    <span className="text-primary">{t.title_2}</span>
                                </h2>
                                <p className="text-lg text-muted mb-8 leading-relaxed">
                                    {t.desc}
                                </p>

                                <Link
                                    href="/blog"
                                    className="group inline-flex items-center gap-3 text-foreground font-bold hover:text-primary transition-colors"
                                >
                                    <span className="border-b-2 border-foreground group-hover:border-primary pb-1 transition-colors">
                                        {t.btn}
                                    </span>
                                    <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* --- SAĞ KOLON (Blog Listesi) --- */}
                    <div className="lg:col-span-8 flex flex-col gap-10">
                        {loading ? (
                            // Loading İskeleti
                            [1, 2, 3].map(i => (
                                <div key={i} className="flex flex-col md:flex-row gap-6 animate-pulse">
                                    <div className="w-full md:w-[300px] h-[200px] bg-card rounded-xl"></div>
                                    <div className="flex-1 space-y-4 py-2">
                                        <div className="h-4 bg-card rounded w-1/4"></div>
                                        <div className="h-6 bg-card rounded w-3/4"></div>
                                        <div className="h-4 bg-card rounded w-full"></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            posts.map((post) => (
                                <article key={post.id} className="group flex flex-col md:flex-row gap-6 items-start">

                                    {/* Görsel */}
                                    <Link href={`/blog/${post.slug}`} className="relative w-full md:w-[300px] h-[220px] shrink-0 rounded-2xl overflow-hidden bg-card">
                                        {post.image_url && (
                                            <Image
                                                src={post.image_url}
                                                alt={post.title}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        )}
                                        {/* Tarih Rozeti */}
                                        <div className="absolute top-4 left-4 bg-background/90 backdrop-blur text-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                                            {new Date(post.created_at).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US')}
                                        </div>
                                    </Link>

                                    {/* İçerik */}
                                    <div className="flex-1 py-2">
                                        <div className="flex items-center gap-4 text-xs font-bold text-muted uppercase tracking-wider mb-3">
                                            <span className="text-primary flex items-center gap-1">
                                                👤 {post.author}
                                            </span>
                                            <span>•</span>
                                            <span>3 {t.comments}</span>
                                        </div>

                                        <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                            <Link href={`/blog/${post.slug}`}>
                                                {post.title}
                                            </Link>
                                        </h3>

                                        <p className="text-muted mb-4 line-clamp-2 leading-relaxed">
                                            {post.excerpt}
                                        </p>

                                        <Link
                                            href={`/blog/${post.slug}`}
                                            className="inline-flex items-center text-sm font-bold text-foreground hover:text-primary transition-colors"
                                        >
                                            {t.read_more} <span className="ml-2 group-hover:ml-3 transition-all">→</span>
                                        </Link>
                                    </div>

                                </article>
                            ))
                        )}
                    </div>

                </div>
            </div>
        </section>
    );
}