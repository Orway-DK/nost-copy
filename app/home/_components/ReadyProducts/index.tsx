"use client";

import Image from "next/image";
import useSWR from "swr";
import { useLanguage } from "@/components/LanguageProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import ProductCarousel from "./ProductCarousel";
import SectionHeading from "./SectionHeading";

type HeadingRow = {
    id: number;
    section_code: string;
    active: boolean;
    // translations nested
    ready_products_heading_translations: { lang_code: string; text: string; highlight: string | null }[];
};

function normalizeLang(raw?: string) {
    const two = (raw || "en").slice(0, 2).toLowerCase();
    return ["tr", "en", "de"].includes(two) ? two : "en";
}

const fetchHeading = async (sectionCode: string): Promise<HeadingRow | null> => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
        .from("ready_products_headings")
        .select("id, section_code, active, ready_products_heading_translations(lang_code, text, highlight)")
        .eq("section_code", sectionCode)
        .eq("active", true)
        .limit(1)
        .maybeSingle();

    if (error) throw new Error(error.message);
    return data ?? null;
};

export default function ReadyProducts() {
    const { lang_code } = useLanguage();
    const lang = normalizeLang(lang_code);

    const { data: headingRow } = useSWR(
        ["ready-products-heading", "home_featured"],
        () => fetchHeading("home_featured"),
        { revalidateOnFocus: false }
    );

    // Resolve localized text
    const tr = headingRow?.ready_products_heading_translations ?? [];
    const order = [lang, "tr", "en", "de"];
    const chosen =
        order
            .map((lc) => tr.find((t) => t.lang_code === lc))
            .find(Boolean) || null;

    const headingText = chosen?.text ?? "Amazing Products Are Ready For You";
    const headingHighlight = chosen?.highlight ?? "Products";

    return (
        <div className="w-full h-auto flex flex-col justify-center items-center gap-4 overflow-hidden mt-30">
            <div className="relative z-10">
                <Image src={"/h1-banner8.png"} alt="book_placeholder" width={500} height={500} className="absolute top-0 right-0 w-60 h-60" />
            </div>

            {/* Badge */}
            <div className="flex flex-col justify-center items-center">
                <span className="bg-[#e1e5ff] px-4 py-2 rounded-full text-sm text-[#5d45ff] font-semibold">
                    FEATURE PRODUCTS
                </span>
            </div>

            {/* Elementor-like heading restored and localized */}
            <SectionHeading
                text={headingText}
                highlight={headingHighlight}
                highlightColor="var(--e-global-color-primary)"
                as="h2"
                align="center"
                className="mt-2"
            />

            {/* Carousel */}
            <div className="w-full">
                <ProductCarousel />
            </div>
        </div>
    );
}