"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { BiWorld } from "react-icons/bi";
import useSWR from "swr";
import { useLanguage } from "@/components/LanguageProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type WhyUsRow = {
    image1_url: string;
    image2_url: string;
    years_experience: number;
    badge_code: string;
};

type WhyUsTranslation = {
    badge_label: string;
    headline_prefix: string;
    headline_emphasis: string;
    headline_suffix: string;
    description: string;
    item1_title: string;
    item1_text: string;
    item2_title: string;
    item2_text: string;
    item3_title: string;
    item3_text: string;
    lang_code: string;
};

type ApiResult = {
    base: WhyUsRow | null;
    tr: WhyUsTranslation | null;
};

const fetcher = async (lang: string): Promise<ApiResult> => {
    const supabase = createSupabaseBrowserClient();

    // Tek kayıt base
    const { data: baseRow, error: baseErr } = await supabase
        .from("why_us")
        .select("image1_url,image2_url,years_experience,badge_code")
        .eq("active", true)
        .limit(1)
        .maybeSingle();

    if (baseErr) throw baseErr;

    // Çeviri
    const { data: trRow, error: trErr } = await supabase
        .from("why_us_translations")
        .select(
            "badge_label,headline_prefix,headline_emphasis,headline_suffix,description,item1_title,item1_text,item2_title,item2_text,item3_title,item3_text,lang_code"
        )
        .eq("lang_code", lang)
        .limit(1)
        .maybeSingle();

    if (trErr) throw trErr;

    return {
        base: baseRow ?? null,
        tr: trRow ?? null,
    };
};

export default function WhyUs() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const { lang } = useLanguage();

    const [visible, setVisible] = useState(false);
    const [years, setYears] = useState(1);

    const { data, error, isLoading } = useSWR<ApiResult>(
        ["why-us", lang],
        () => fetcher(lang),
        { revalidateOnFocus: false }
    );

    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.target === el && entry.isIntersecting && !visible) {
                        setVisible(true);
                        observer.unobserve(el);
                    }
                });
            },
            { threshold: 0.5 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [visible]);

    useEffect(() => {
        if (!visible) return;

        const baseYears = data?.base?.years_experience ?? 24;
        const duration = 1000; // 1s
        const startValue = 1;
        const endValue = baseYears;
        const diff = endValue - startValue;
        let startTime: number | null = null;
        let rafId: number;

        const tick = (now: number) => {
            if (startTime === null) startTime = now;
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.round(startValue + diff * progress);
            setYears(current);
            if (progress < 1) {
                rafId = requestAnimationFrame(tick);
            } else {
                setYears(endValue);
            }
        };

        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, [visible, data?.base?.years_experience]);

    if (error) {
        return (
            <div className="flex justify-center items-center w-full max-w-7xl h-[60vh] my-20 text-red-500">
                {lang === "tr"
                    ? "İçerik yüklenemedi."
                    : lang === "de"
                        ? "Inhalt konnte nicht geladen werden."
                        : "Failed to load content."}
            </div>
        );
    }

    const base = data?.base;
    const tr = data?.tr;

    return (
        <div ref={sectionRef} className="flex flex-row w-full max-w-7xl h-[60vh] my-20">
            {/* Sol blok */}
            <div className="w-4xl relative">
                <div
                    className="z-10 transition-transform duration-1000 ease-out"
                    style={{
                        transform: visible ? "translateX(0)" : "translateX(-750px)",
                        opacity: visible ? 1 : 0,
                    }}
                >
                    <Image
                        src={base?.image1_url ?? "/h1-banner01.jpg"}
                        alt="bannerImage1"
                        width={500}
                        height={500}
                        className="rounded-3xl w-auto absolute"
                        loading="lazy"
                    />
                </div>

                <div
                    className="z-10 transition-transform duration-1000 ease-out"
                    style={{
                        transform: visible ? "translateY(0)" : "translateY(300px)",
                        opacity: visible ? 1 : 0,
                    }}
                >
                    <Image
                        src={base?.image2_url ?? "/h1-banner02.jpg"}
                        alt="bannerImage2"
                        width={400}
                        height={400}
                        className="rounded-3xl w-auto absolute top-50 right-0"
                        loading="eager"
                    />
                </div>

                <div className="absolute bottom-15 flex flex-col ml-10">
                    <span className="text-5xl text-blue-700">
                        {years}+
                    </span>
                    <span className="text-lg">
                        {lang === "tr"
                            ? "Yıl Deneyim"
                            : lang === "de"
                                ? "Jahre Erfahrung"
                                : "Years Of Experience"}
                    </span>
                </div>
            </div>

            {/* Sağ blok */}
            <div className="w-4xl">
                <div className="flex flex-col ml-5">
                    <span className="rounded-full bg-blue-100 w-fit py-1 px-2 text-blue-700 font-semibold uppercase ml-2">
                        {tr?.badge_label ?? base?.badge_code ?? "BEST PRINTING COMPANY"}
                    </span>
                    <span className="text-5xl mt-2">
                        {tr?.headline_prefix ?? "Reason To"}{" "}
                        <span className="text-blue-700">
                            {tr?.headline_emphasis ?? "Get Printing"}
                        </span>{" "}
                        {tr?.headline_suffix ?? "Started With Us"}
                    </span>
                </div>

                <div className="flex flex-col text-xl font-normal mt-8 ml-20">
                    <span>
                        {tr?.description ??
                            "We are 100+ professional printing experts with more than 10 years of experience in product design. Believe it because you’ve seen it. Here are real numbers."}
                    </span>

                    <ul className="gap-2 mt-2">
                        <li className="flex flex-row px-4 py-2 gap-4">
                            <BiWorld className="text-6xl text-blue-700" />
                            <div className="flex flex-col">
                                <span className="font-bold text-xl">
                                    {tr?.item1_title ?? "High Profit Margin"}
                                </span>
                                <span className="font-normal text-md">
                                    {tr?.item1_text ??
                                        "Effective optimization of cost and quality that makes you highly profitable."}
                                </span>
                            </div>
                        </li>

                        <li className="flex flex-row px-4 py-2 gap-4">
                            <BiWorld className="text-6xl text-blue-700" />
                            <div className="flex flex-col">
                                <span className="font-bold text-xl">
                                    {tr?.item2_title ?? "Global Shipping"}
                                </span>
                                <span className="font-normal text-md">
                                    {tr?.item2_text ??
                                        "Reach the global market easily with our fast and flexible shipping solution."}
                                </span>
                            </div>
                        </li>

                        <li className="flex flex-row px-4 py-2 gap-4">
                            <BiWorld className="text-6xl text-blue-700" />
                            <div className="flex flex-col">
                                <span className="font-bold text-xl">
                                    {tr?.item3_title ?? "Trending Products"}
                                </span>
                                <span className="font-normal text-md">
                                    {tr?.item3_text ??
                                        "Maximize your sales volume with our high market-demand products."}
                                </span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}