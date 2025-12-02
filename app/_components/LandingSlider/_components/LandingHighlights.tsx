"use client";

import useSWR from "swr";
import { Icon } from "@iconify/react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";
import Reveal from "./Reveal";

type Highlight = {
    id: number;
    icon: string;
    text: string;
};

const fetchHighlights = async (lang: string): Promise<Highlight[]> => {
    const supabase = createSupabaseBrowserClient();

    const { data, error } = await supabase
        .from("landing_highlights")
        .select("id, icon, landing_highlight_translations(text, lang_code)")
        .eq("active", true)
        .eq("landing_highlight_translations.lang_code", lang)
        .order("order_no", { ascending: true });

    if (error) throw error;

    return (data || []).map((item: any) => ({
        id: item.id,
        icon: item.icon,
        // Çeviri dizisinden ilkini al (zaten dille filtreledik)
        text: item.landing_highlight_translations?.[0]?.text || "",
    }));
};

export default function LandingHighlights() {
    const { lang } = useLanguage();

    const { data: items } = useSWR(
        ["landing-highlights", lang],
        () => fetchHighlights(lang),
        { revalidateOnFocus: false }
    );

    if (!items || items.length === 0) return null;

    return (
        <div className="w-full max-w-7xl mb-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-between ">
                {items.map((item, idx) => (
                    <Reveal
                        key={item.id}
                        direction="up"
                        delayMs={200 + (idx * 100)}
                        once={true}
                        className="flex flex-row items-center text-center gap-3 p-4 rounded-xl hover:bg-white/50 transition-colors group"
                    >
                        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                            {/* Iconify ile dinamik ikon render */}
                            <Icon icon={item.icon} width="24" height="24" />
                        </div>
                        <span className="text-lg font-light text-nowrap text-gray-700 leading-tight">
                            {item.text}
                        </span>
                    </Reveal>
                ))}
            </div>
        </div>
    );
}