// /home/dorukhan/Desktop/NostCopy/nost-copy/app/_components/slidingBand/DualScrollingCategories.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import "./slidingBands.css";

type CategoryItem = {
    id: number;
    slug: string;
    label: string;
    href: string;
    sort: number;
};

const FALLBACK: CategoryItem[] = [
    { id: -1, label: "Dress shirt", href: "#", slug: "dress-shirt", sort: 0 },
    { id: -2, label: "New Products", href: "#", slug: "new-products", sort: 1 },
    { id: -3, label: "Infants & toddlers", href: "#", slug: "infants-toddlers", sort: 2 },
    { id: -4, label: "Tank tops", href: "#", slug: "tank-tops", sort: 3 },
    { id: -5, label: "Men's shirts", href: "#", slug: "mens-shirts", sort: 4 },
    { id: -6, label: "Women's shirts", href: "#", slug: "womens-shirts", sort: 5 },
    { id: -7, label: "Bags & accessories", href: "#", slug: "bags-accessories", sort: 6 },
];

export default function DualScrollingCategories() {
    const { lang } = useLanguage();
    const [items, setItems] = useState<CategoryItem[]>(FALLBACK);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const supabase = createSupabaseBrowserClient();

                // categories + translations (dil filtreli). Sadece active olanlar.
                const { data, error } = await supabase
                    .from("categories")
                    .select("id, slug, sort, active, category_translations(name, lang_code)")
                    .eq("active", true)
                    .eq("category_translations.lang_code", lang)
                    .order("sort", { ascending: true });

                if (error) {
                    console.error("categories fetch error:", error);
                    if (mounted) setItems(FALLBACK);
                    return;
                }

                const mapped =
                    (data ?? []).map((c: any, idx: number) => {
                        const tr = (c.category_translations ?? []).find(
                            (t: any) => t.lang_code === lang
                        );
                        const label = tr?.name ?? c.slug;
                        // Filtreleyen link yapısı (Next.js route tasarımı):
                        // Önerilen: /collections/[slug]
                        const href = `/collections/${c.slug}`;
                        return {
                            id: c.id as number,
                            slug: c.slug as string,
                            sort: c.sort ?? idx,
                            label,
                            href,
                        } as CategoryItem;
                    }) ?? [];

                if (!mounted) return;

                if (mapped.length === 0) {
                    // Dil için sonuç yoksa EN diline düş
                    const { data: enData, error: enErr } = await supabase
                        .from("categories")
                        .select("id, slug, sort, active, category_translations(name, lang_code)")
                        .eq("active", true)
                        .eq("category_translations.lang_code", "en")
                        .order("sort", { ascending: true });

                    if (!enErr && enData && enData.length > 0 && mounted) {
                        const m2 = enData.map((c: any, idx: number) => {
                            const tr = (c.category_translations ?? []).find(
                                (t: any) => t.lang_code === "en"
                            );
                            const label = tr?.name ?? c.slug;
                            const href = `/collections/${c.slug}`;
                            return {
                                id: c.id,
                                slug: c.slug,
                                sort: c.sort ?? idx,
                                label,
                                href,
                            } as CategoryItem;
                        });
                        setItems(m2);
                        return;
                    }
                    setItems(FALLBACK);
                } else {
                    setItems(mapped);
                }
            } catch (err) {
                console.error(err);
                if (mounted) setItems(FALLBACK);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [lang]);

    return (
        <div className="relative w-full overflow-hidden py-20">
            {/* ALT BANT */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 -mx-20 bg-fuchsia-100 text-black py-3 rotate-6 lg:rotate-3">
                <div className="px-24 group marquee-mask">
                    <div className="marquee-track -md:dk-marquee-fast dk-marquee">
                        <div className="marquee-strip">
                            <CategoryStrip items={items} />
                            <CategoryStrip items={items} />
                        </div>
                        <div className="marquee-strip" aria-hidden="true">
                            <CategoryStrip items={items} />
                            <CategoryStrip items={items} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ÜST BANT */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-yellow-50 text-black py-3 -rotate-4 lg:-rotate-2 z-10">
                <div className="px-24 group marquee-mask">
                    <div className="marquee-track -md:dk-marquee-reverse-fast dk-marquee-reverse">
                        <div className="marquee-strip">
                            <CategoryStrip items={items} />
                            <CategoryStrip items={items} />
                        </div>
                        <div className="marquee-strip" aria-hidden="true">
                            <CategoryStrip items={items} />
                            <CategoryStrip items={items} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CategoryStrip({ items }: { items: CategoryItem[] }) {
    return (
        <div className="flex gap-2 items-center">
            {items.map((cat) => (
                <div key={cat.id ?? cat.slug} className="flex items-center gap-2">
                    <Link
                        href={cat.href}
                        title={cat.label}
                        className="text-xs sm:text-sm 
              font-semibold tracking-wide uppercase 
              hover:underline hover:text-amber-500 
              transition-colors inline-block"
                    >
                        {cat.label}
                    </Link>
                    {/* seam dot */}
                    <span className="pb-1">●</span>
                </div>
            ))}
        </div>
    );
}