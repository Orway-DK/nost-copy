"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

// TİPLER
type SidebarProps = {
    lang: string;
    categories: any[];
    tags: any[];
    recentPosts: any[];
    ui: any;
};

export default function BlogSidebar({ lang, categories, tags, recentPosts, ui }: SidebarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");

    // Arama Fonksiyonu
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        if (searchTerm.trim()) {
            params.set("q", searchTerm);
        } else {
            params.delete("q");
        }
        // Sayfa 1'e dön ve aramayı yap
        params.delete("page");
        router.push(`/blog?${params.toString()}`);
    };

    return (
        <aside className="w-full flex flex-col gap-12">

            {/* 1. SEARCH BOX */}
            <div className="bg-card p-8 rounded-xl border border-muted/10">
                <h3 className="text-xl font-bold mb-6 text-foreground relative inline-block">
                    {ui.search}
                    <span className="absolute -bottom-2 left-0 w-10 h-1 bg-primary"></span>
                </h3>
                <form onSubmit={handleSearch} className="relative">
                    <input
                        type="text"
                        placeholder={ui.searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-4 pr-12 py-3 bg-background border border-muted/20 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary">
                        🔍
                    </button>
                </form>
            </div>

            {/* 2. CATEGORIES */}
            <div className="bg-card p-8 rounded-xl border border-muted/10">
                <h3 className="text-xl font-bold mb-6 text-foreground relative inline-block">
                    {ui.categories}
                    <span className="absolute -bottom-2 left-0 w-10 h-1 bg-primary"></span>
                </h3>
                <ul className="space-y-3">
                    {categories.map((cat) => (
                        <li key={cat.id}>
                            <Link
                                href={`/blog?cat=${cat.slug}`}
                                className={`flex justify-between items-center group ${searchParams.get('cat') === cat.slug ? 'text-primary font-bold' : 'text-muted hover:text-foreground'}`}
                            >
                                <span className="transition-colors">
                                    {cat.translation?.name || cat.slug}
                                </span>
                                <span className="w-6 h-6 rounded-full bg-background flex items-center justify-center text-xs border border-muted/10 group-hover:border-primary group-hover:text-primary transition-all">
                                    →
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* 3. RECENT POSTS */}
            <div className="bg-card p-8 rounded-xl border border-muted/10">
                <h3 className="text-xl font-bold mb-6 text-foreground relative inline-block">
                    {ui.recent}
                    <span className="absolute -bottom-2 left-0 w-10 h-1 bg-primary"></span>
                </h3>
                <div className="flex flex-col gap-6">
                    {recentPosts.map((post) => (
                        <Link key={post.id} href={`/blog/${post.slug}`} className="flex gap-4 group">
                            <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden">
                                {post.image_url ? (
                                    <Image src={post.image_url} alt="thumb" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full bg-muted/20"></div>
                                )}
                            </div>
                            <div>
                                <span className="text-xs text-muted mb-1 block">
                                    {new Date(post.created_at).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US')}
                                </span>
                                <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                                    {post.translation?.title}
                                </h4>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* 4. TAGS */}
            <div className="bg-card p-8 rounded-xl border border-muted/10">
                <h3 className="text-xl font-bold mb-6 text-foreground relative inline-block">
                    {ui.tags}
                    <span className="absolute -bottom-2 left-0 w-10 h-1 bg-primary"></span>
                </h3>
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                        <Link
                            key={tag.id}
                            href={`/blog?tag=${tag.slug}`}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md border transition-all ${searchParams.get('tag') === tag.slug
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-background text-muted border-muted/20 hover:border-primary hover:text-primary'
                                }`}
                        >
                            #{tag.translation?.name || tag.slug}
                        </Link>
                    ))}
                    {/* Filtre Temizle */}
                    {(searchParams.get('tag') || searchParams.get('cat') || searchParams.get('q')) && (
                        <Link href="/blog" className="px-3 py-1.5 text-xs font-bold text-red-500 hover:underline">
                            ✕ {ui.clear}
                        </Link>
                    )}
                </div>
            </div>

        </aside>
    );
}