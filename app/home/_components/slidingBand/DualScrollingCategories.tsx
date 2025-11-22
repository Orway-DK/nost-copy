"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";

import "./slidingBands.css";

type Category = {
    id?: number;
    label: string;
    link: string;
    order_no?: number;
};

const FALLBACK: Category[] = [
    { label: "Dress shirt", link: "#", order_no: 0 },
    { label: "New Products", link: "#", order_no: 1 },
    { label: "Infants & toddlers", link: "#", order_no: 2 },
    { label: "Tank tops", link: "#", order_no: 3 },
    { label: "Men's shirts", link: "#", order_no: 4 },
    { label: "Women's shirts", link: "#", order_no: 5 },
    { label: "Bags & accessories", link: "#", order_no: 6 },
];

export default function DualScrollingCategories() {
    // useLocale must be called directly (like LandingSlider). Fallback router.locale
    const router = useRouter();
    // prefer router.locale (Next i18n), fallback to browser locale, then 'en'
    const { lang } = useLanguage();
    const [categories, setCategories] = useState<Category[]>(FALLBACK);
    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                // Expect lang_code stored in lowercase in DB; query by exact match
                const { data, error } = await supabase
                    .from("sliding_categories")
                    .select("id, label, link, order_no, lang_code")
                    .eq("lang_code", lang)
                    .order("order_no", { ascending: true });
                //console.debug("sliding_categories fetched:", data?.length);

                if (error) {
                    console.error("sliding_categories fetch error:", error);
                    return;
                }
                if (!mounted) return;

                if (!data || data.length === 0) {
                    // seçili dil için veri yoksa en'e düş veya fallback göster
                    if (lang !== "en") {
                        const { data: enData } = await supabase
                            .from("sliding_categories")
                            .select("id, label, link, order_no, lang_code")
                            .eq("lang_code", "en")
                            .order("order_no", { ascending: true });
                        if (mounted && enData && enData.length > 0) {
                            setCategories(enData.map((d: any, i: number) => ({
                                id: d.id,
                                label: d.label ?? `item-${i}`,
                                link: d.link ?? "#",
                                order_no: d.order_no ?? i,
                            })));
                            return;
                        }
                    }
                    setCategories(FALLBACK);
                } else {
                    setCategories(
                        data.map((d: any, idx: number) => ({
                            id: d.id,
                            label: d.label ?? `item-${idx}`,
                            link: d.link ?? "#",
                            order_no: d.order_no ?? idx,
                        }))
                    );
                }
            } catch (err) {
                console.error(err);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [supabase, lang]);

    return (
        <div className="relative w-full overflow-hidden py-20">
            {/* ALT BANT */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 -mx-20 bg-fuchsia-100 text-black py-3 rotate-6 lg:rotate-3">
                <div className="px-24 group marquee-mask">
                    <div className="marquee-track -md:dk-marquee-fast dk-marquee">
                        <div className="marquee-strip">
                            <CategoryStrip items={categories} />
                            <CategoryStrip items={categories} />
                        </div>
                        <div className="marquee-strip" aria-hidden="true">
                            <CategoryStrip items={categories} />
                            <CategoryStrip items={categories} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ÜST BANT */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-yellow-50 text-black py-3 -rotate-4 lg:-rotate-2 z-10">
                <div className="px-24 group marquee-mask">
                    <div className="marquee-track -md:dk-marquee-reverse-fast dk-marquee-reverse">
                        <div className="marquee-strip">
                            <CategoryStrip items={categories} />
                            <CategoryStrip items={categories} />
                        </div>
                        <div className="marquee-strip" aria-hidden="true">
                            <CategoryStrip items={categories} />
                            <CategoryStrip items={categories} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CategoryStrip({ items }: { items: Category[] }) {
    return (
        <div className="flex  gap-2 items-center">
            {items.map((cat, idx) => (
                <div key={cat.id ?? cat.label} className="flex items-center gap-2">
                    <Link
                        href={cat.link ?? "#"}
                        title={cat.label}
                        className="text-xs sm:text-sm 
                        font-semibold tracking-wide uppercase 
                        hover:underline hover:text-amber-500 
                        transition-colors inline-block"
                    >
                        {cat.label}
                    </Link>
                    {/* always render separator after each item (including last) so seam shows dot */}
                    <span className="pb-1">●</span>
                </div>
            ))}
        </div>
    );
}
