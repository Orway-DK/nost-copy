// /app/_components/AdsBar.tsx
"use client";

import useSWR from "swr";
import { Icon } from "@iconify/react";
import { useLanguage } from "@/components/LanguageProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AdItem = {
    text: string;
    icon: string;
};

const fetcher = async (lang: string): Promise<AdItem[]> => {
    const supabase = createSupabaseBrowserClient();

    const { data, error } = await supabase
        .from("ads_below_landing")
        .select("text, icon")
        .eq("lang_code", lang)
        .order("id", { ascending: true });

    if (error) throw error;
    return data ?? [];
};

export default function AdsBar() {
    const { lang } = useLanguage();

    const { data: ads, error, isLoading } = useSWR(
        `ads-${lang}`,
        () => fetcher(lang),
        { revalidateOnFocus: false }
    );

    if (isLoading) {
        return <div className="py-10 text-center text-gray-500">Yükleniyor…</div>;
    }

    if (error) {
        return (
            <div className="py-10 text-center text-red-500">
                Veriler alınamadı.
            </div>
        );
    }

    return (
        <ul className="flex flex-row w-full max-w-7xl justify-between py-10 text-md font-poppins font-light">
            {ads?.map((a, i) => (
                <li
                    key={`${a.icon}-${i}`}
                    className="px-4 py-2 whitespace-nowrap cursor-pointer"
                >
                    <span className="flex flex-row gap-2 items-center hover:text-blue-400">
                        {a.icon ? (
                            <Icon icon={a.icon} className="text-blue-400 text-[18px]" />
                        ) : null}
                        {a.text}
                    </span>
                </li>
            ))}
        </ul>
    );
}
