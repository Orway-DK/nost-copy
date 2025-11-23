"use client";

import Image from "next/image";
import useSWR from "swr";
import { useLanguage } from "@/components/LanguageProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import ProductCarousel from "./ProductCarousel";

type Tip = { icon?: string; title: string; text: string };
type ApiMakeItEasier = {
    id: number;
    lang_code: string;
    title: string;
    titletext: string;
    image_link: string;
    tips: Tip[];
};

const fetcher = async (lang: string): Promise<ApiMakeItEasier[]> => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
        .from("ready_product_showcase_slider")
        .select("id, lang_code, title, titletext, image_link, tips")
        .eq("lang_code", lang)
        .order("id", { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
};

export default function ReadyProducts() {
    const { lang } = useLanguage();
    const {
        data: details,
        error,
        isLoading
    } = useSWR(`make-it-easier-${lang}`, () => fetcher(lang), {
        revalidateOnFocus: false
    });

    return (
        <div className="w-full h-auto flex flex-col justify-center items-center gap-4 overflow-hidden mt-30">
            <div className="relative z-10">
                <Image src={"/h1-banner8.png"} alt="book_placeholder" width={500} height={500} className="absolute top-0 right-0 w-60 h-60" />
            </div>
            <div className="flex flex-col justify-center items-center">
                <span className="bg-[#e1e5ff] px-4 py-2 rounded-full text-sm text-[#5d45ff] font-semibold">FEATURE PRODUCTS</span>
                <div className="h-auto flex flex-col items-center text-5xl leading-16">
                    <span>
                        Amazing <span className="text-[#5d45ff]">Products</span> Are
                    </span>
                    <span>
                        Ready For You
                    </span>
                </div>
            </div>
            <div>
                <ProductCarousel />
            </div>
        </div>
    );
}