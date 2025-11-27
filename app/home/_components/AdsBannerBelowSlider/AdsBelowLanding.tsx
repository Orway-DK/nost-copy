"use client";

import useSWR from "swr";
import { Icon } from "@iconify/react";
import { useLanguage } from "@/components/LanguageProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import React from "react";

type Highlight = {
    id: number;
    icon: string;
    text: string;
    order_no: number;
};

type HighlightRow = {
    id: number;
    icon: string;
    order_no: number;
    landing_highlight_translations: Array<{
        text: string;
        lang_code: string;
    }>;
};

const fetchHighlights = async (lang: string): Promise<Highlight[]> => {
    const supabase = createSupabaseBrowserClient();
    // Normalleştirilmiş yapı: base + translations
    const { data, error } = await supabase
        .from("landing_highlights")
        .select(
            "id, icon, order_no, landing_highlight_translations(text, lang_code)"
        )
        .eq("active", true)
        .eq("landing_highlight_translations.lang_code", lang)
        .order("order_no", { ascending: true });

    if (error) throw error;

    // Dil filtresi zaten nested select’te uygulandı; yine de güvence
    return (data ?? []).map((row: HighlightRow) => {
        const tr = row.landing_highlight_translations?.find(
            (t: { text: string; lang_code: string }) => t.lang_code === lang
        );
        return {
            id: row.id,
            icon: row.icon,
            order_no: row.order_no,
            text: tr?.text ?? "",
        };
    });
};

// Eski tabloyu henüz silemediysen fallback (Opsiyonel):
// const fetchLegacyAds = async (lang: string): Promise<Highlight[]> => {
//   const supabase = createSupabaseBrowserClient();
//   const { data, error } = await supabase
//     .from("ads_below_landing")
//     .select("id, icon, order_no, text")
//     .eq("lang_code", lang)
//     .order("order_no", { ascending: true });
//   if (error) throw error;
//   return (data ?? []).map((r: any) => ({
//     id: r.id,
//     icon: r.icon,
//     order_no: r.order_no,
//     text: r.text,
//   }));
// };

export default function AdsBar() {
    const { lang } = useLanguage();

    const {
        data: highlights,
        error,
        isLoading,
    } = useSWR<Highlight[]>(["landing-highlights", lang], () => fetchHighlights(lang), {
        revalidateOnFocus: false,
    });

    if (isLoading) {
        return (
            <ul className="flex flex-row w-full max-w-7xl justify-between py-10 text-md font-poppins font-light">
                {[...Array(4)].map((_, i) => (
                    <li
                        key={i}
                        className="px-4 py-2 w-full animate-pulse text-gray-400 flex items-center gap-2"
                    >
                        <div className="h-5 w-5 rounded-full bg-gray-200" />
                        <div className="h-4 w-32 rounded bg-gray-200" />
                    </li>
                ))}
            </ul>
        );
    }

    if (error) {
        return (
            <div className="py-10 text-center text-red-500">
                {lang === "tr"
                    ? "Veriler alınamadı."
                    : lang === "de"
                        ? "Daten konnten nicht geladen werden."
                        : "Failed to load data."}
            </div>
        );
    }

    if (!highlights?.length) {
        return (
            <div className="py-10 text-center text-gray-500">
                {lang === "tr"
                    ? "İçerik bulunamadı."
                    : lang === "de"
                        ? "Kein Inhalt gefunden."
                        : "No highlights found."}
            </div>
        );
    }

    return (
        <ul className="flex flex-row w-full max-w-7xl justify-between py-10 text-md font-poppins font-light">
            {highlights.map((h) => (
                <li
                    key={h.id}
                    className="px-4 py-2 whitespace-nowrap cursor-pointer"
                >
                    <span className="flex flex-row gap-2 items-center hover:text-blue-400 transition-colors">
                        {h.icon && (
                            <Icon
                                icon={h.icon}
                                className="text-blue-400 text-[18px] shrink-0"
                            />
                        )}
                        <span>{h.text}</span>
                    </span>
                </li>
            ))}
        </ul>
    );
}