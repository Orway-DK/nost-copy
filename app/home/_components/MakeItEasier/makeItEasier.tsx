"use client";

import Image from "next/image";
import useSWR from "swr";
import { useLanguage } from "@/components/LanguageProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import { useState, useCallback } from "react";
import { Icon } from "@iconify/react";
import MakeItEasierSliderPart from "./makeItEasierSliderPart";

// Framer Motion v11+: motion() deprecated -> motion.create()
const MotionImage = motion.create(Image);

type Tip = { icon?: string; title: string; text: string };
type ApiRow = {
    id: number;
    image_link: string;
    order_no: number;
    make_it_easier_translations: {
        lang_code: string;
        title: string;
        titletext: string;
        tip1_icon: string | null;
        tip1_title: string | null;
        tip1_text: string | null;
        tip2_icon: string | null;
        tip2_title: string | null;
        tip2_text: string | null;
        tip3_icon: string | null;
        tip3_title: string | null;
        tip3_text: string | null;
    }[];
};

const fetcher = async (lang: string): Promise<{
    title: string;
    titletext: string;
    image_link: string;
    tips: Tip[];
}> => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
        .from("make_it_easier_sections")
        .select(
            "id, image_link, order_no, make_it_easier_translations(lang_code,title,titletext,tip1_icon,tip1_title,tip1_text,tip2_icon,tip2_title,tip2_text,tip3_icon,tip3_title,tip3_text)"
        )
        .eq("active", true)
        .eq("make_it_easier_translations.lang_code", lang)
        .order("order_no", { ascending: true });

    if (error) throw new Error(error.message);

    const row = (data ?? [])[0] as ApiRow | undefined;
    if (!row) {
        const { data: enData } = await supabase
            .from("make_it_easier_sections")
            .select(
                "id, image_link, order_no, make_it_easier_translations(lang_code,title,titletext,tip1_icon,tip1_title,tip1_text,tip2_icon,tip2_title,tip2_text,tip3_icon,tip3_title,tip3_text)"
            )
            .eq("active", true)
            .eq("make_it_easier_translations.lang_code", "en")
            .order("order_no", { ascending: true });
        const enRow = (enData ?? [])[0] as ApiRow | undefined;
        if (!enRow) throw new Error("No MakeItEasier content found");
        const tr = enRow.make_it_easier_translations.find(
            (t) => t.lang_code === "en"
        )!;
        const tips: Tip[] = [
            { icon: tr.tip1_icon || undefined, title: tr.tip1_title || "", text: tr.tip1_text || "" },
            { icon: tr.tip2_icon || undefined, title: tr.tip2_title || "", text: tr.tip2_text || "" },
            { icon: tr.tip3_icon || undefined, title: tr.tip3_title || "", text: tr.tip3_text || "" },
        ];
        return { title: tr.title, titletext: tr.titletext, image_link: enRow.image_link, tips };
    }

    const tr = row.make_it_easier_translations.find((t) => t.lang_code === lang)!;
    const tips: Tip[] = [
        { icon: tr.tip1_icon || undefined, title: tr.tip1_title || "", text: tr.tip1_text || "" },
        { icon: tr.tip2_icon || undefined, title: tr.tip2_title || "", text: tr.tip2_text || "" },
        { icon: tr.tip3_icon || undefined, title: tr.tip3_title || "", text: tr.tip3_text || "" },
    ];

    return {
        title: tr.title,
        titletext: tr.titletext,
        image_link: row.image_link,
        tips,
    };
};

export default function MakeItEasier() {
    const { lang } = useLanguage();
    const { data: details, error, isLoading } = useSWR(
        ["make-it-easier", lang],
        () => fetcher(lang),
        { revalidateOnFocus: false }
    );

    const prefersReduced = useReducedMotion();
    const [imgLoaded, setImgLoaded] = useState(false);
    const handleLoaded = useCallback(() => setImgLoaded(true), []);

    if (isLoading)
        return (
            <div className="py-8 flex justify-center animate-pulse text-[#47597b]">
                Yükleniyor…
            </div>
        );
    if (error)
        return (
            <div className="py-8 text-center text-red-500">
                Bir hata oluştu: {error.message}
            </div>
        );
    if (!details)
        return <div className="py-8 text-center">İçerik bulunamadı.</div>;

    const imageUrl = details.image_link || "";

    const circleVariants: Variants = {
        hidden: prefersReduced ? { x: "0%", opacity: 1 } : { x: "100%", opacity: 0 },
        visible: prefersReduced
            ? { x: "0%", opacity: 1 }
            : { x: "0%", opacity: 1, transition: { duration: 1.4, ease: [0.25, 0.1, 0.25, 1] } },
    };

    const imageVariants: Variants = {
        hidden: prefersReduced ? { x: "0%", opacity: 1 } : { x: "40%", opacity: 0 },
        visible: prefersReduced
            ? { x: "0%", opacity: 1 }
            : {
                x: "0%",
                opacity: 1,
                transition: { duration: 1.0, ease: [0.25, 0.1, 0.25, 1], delay: 0.05 },
            },
    };

    const tipVariants: Variants = {
        hidden: prefersReduced ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 },
        visible: (i: number) =>
            prefersReduced
                ? { y: 0, opacity: 1 }
                : {
                    y: 0,
                    opacity: 1,
                    transition: { duration: 0.6, delay: 0.25 + i * 0.15, ease: [0.25, 0.1, 0.25, 1] },
                },
    };

    return (
        <div className="mt-10 w-full overflow-hidden">
            {/* Üst kıvrım */}
            <div className="block border-none rotate-180 w-full overflow-hidden">
                <svg
                    className="bg-[#212529] h-[90px] w-[calc(100%+2px)]"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1000 100"
                    preserveAspectRatio="none"
                >
                    <path
                        className="fill-[#ecf2ff]"
                        d="M500,97C126.7,96.3,0.8,19.8,0,0v100l1000,0V1C1000,19.4,873.3,97.8,500,97z"
                    ></path>
                </svg>
            </div>

            <div className="bg-[#212529] w-full flex flex-wrap justify-center items-center gap-8">
                {/* Sol metin */}
                <div className="w-full max-w-xl h-[50vh] flex flex-col justify-center text-[#ecf2ff] px-6">
                    <h2 className="text-4xl sm:text-5xl font-semibold">{details.title}</h2>
                    <p className="text-lg sm:text-xl mt-6 max-w-prose">{details.titletext}</p>
                </div>

                {/* Görsel ve dekor alanı */}
                <div className="relative h-[50vh] flex items-center justify-center px-6">
                    {/* Daire */}
                    <motion.div
                        className="absolute bg-[#47597b] rounded-full w-[30rem] h-[30rem] top-60 -right-70 -translate-x-1/2 -translate-y-1/2 z-0 overflow-hidden"
                        variants={circleVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        style={{ willChange: "transform, opacity" }}
                    />

                    {/* Resim */}
                    <MotionImage
                        src={imageUrl}
                        alt={details.title || "/h1-banner3.png"}
                        width={1000}
                        height={1000}
                        className="max-w-[750px] h-auto object-contain z-10 select-none"
                        priority
                        onLoad={handleLoaded}
                        variants={imageVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        style={{ willChange: "transform, opacity" }}
                    />

                    {!imageUrl && (
                        <div className="absolute inset-0 flex items-center justify-center text-sm text-red-400">
                            Görsel linki boş
                        </div>
                    )}
                    {imageUrl && !imgLoaded && (
                        <div className="absolute bottom-2 right-2 text-xs text-[#ecf2ff] opacity-70">
                            Yükleniyor...
                        </div>
                    )}
                </div>
            </div>

            {/* Alt içerik */}
            <div className="w-full bg-[#212529]">
                <div className="max-w-7xl mx-auto pb-20 px-6 py-24 grid grid-cols-1 sm:grid-cols-3 gap-8 items-start">
                    {(details.tips || []).slice(0, 3).map((tip, idx) => (
                        <motion.div
                            key={idx}
                            className="flex items-start gap-4"
                            custom={idx}
                            variants={tipVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.15 }}
                        >
                            <span className="flex-shrink-0 bg-[#ecf2ff] text-[#212529] rounded-full w-24 h-24 flex items-center justify-center">
                                {tip.icon ? <Icon icon={tip.icon} width="48" height="48" /> : <span className="text-xs font-semibold">?</span>}
                            </span>
                            <div>
                                <h3 className="text-white text-lg font-semibold">{tip.title}</h3>
                                <p className="font-normal text-sm text-[#d1d7e6]">{tip.text}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <MakeItEasierSliderPart />

            {/* Alt kıvrım */}
            <div className="block border-none w-full overflow-hidden">
                <svg
                    className="bg-[#212529] h-[90px] w-[calc(100%+2px)]"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1000 100"
                    preserveAspectRatio="none"
                >
                    <path
                        className="fill-[#ecf2ff]"
                        d="M500,97C126.7,96.3,0.8,19.8,0,0v100l1000,0V1C1000,19.4,873.3,97.8,500,97z"
                    ></path>
                </svg>
            </div>
        </div>
    );
}