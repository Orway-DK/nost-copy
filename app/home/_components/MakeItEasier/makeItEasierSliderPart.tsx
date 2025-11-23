"use client";

import Image from "next/image";
import useSWR from "swr";
import { useLanguage } from "@/components/LanguageProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";

type RawImageLink =
    | string
    | { url?: string; src?: string; image?: string }
    | null;

type ApiMakeItEasierSlider = {
    id: number;
    lang_code: string | null;
    title: string | null;
    text: string | null;
    image_links: RawImageLink[] | null;
    button_name: string | null;
    button_link: string | null;
};

const fetcher = async (lang: string): Promise<ApiMakeItEasierSlider[]> => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
        .from("make_it_easier_slider")
        .select("id, lang_code, title, text, image_links, button_name, button_link")
        .eq("lang_code", lang)
        .order("id", { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
};

const MAX_ATTEMPTS = 3;
const MIN_LOOP_LENGTH = 6;

const FALLBACK_DATA_URI =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="%232b3035"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239aa7bd" font-size="24" font-family="Arial">Görsel yüklenemedi</text></svg>';

export default function MakeItEasierSliderPart() {
    const { lang } = useLanguage();
    const {
        data: details,
        error,
        isLoading
    } = useSWR(`make-it-easier-slider-${lang}`, () => fetcher(lang), {
        revalidateOnFocus: false
    });

    const [imageAttempts, setImageAttempts] = useState<Record<string, number>>(
        {}
    );
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

    const sliderRef = useRef<HTMLDivElement | null>(null);
    const [sliderHeight, setSliderHeight] = useState<number>(0);

    // Orijinal görseller (normalize + flatten)
    const allImages: string[] = useMemo(() => {
        if (!details?.length) return [];
        return details.flatMap((row) => {
            if (!row.image_links || !Array.isArray(row.image_links)) return [];
            return row.image_links
                .map((entry): string | null => {
                    if (typeof entry === "string") return entry.trim();
                    if (entry && typeof entry === "object") {
                        return (
                            entry.url?.trim() ||
                            entry.src?.trim() ||
                            entry.image?.trim() ||
                            null
                        );
                    }
                    return null;
                })
                .filter((x): x is string => !!x);
        });
    }, [details]);
    console.log(details)

    // Azsa çoğalt
    const duplicatedImages = useMemo(() => {
        if (allImages.length === 0) return [];
        if (allImages.length >= MIN_LOOP_LENGTH) return allImages;
        let buff = [...allImages];
        while (buff.length < MIN_LOOP_LENGTH) {
            buff = buff.concat(allImages);
        }
        return buff;
    }, [allImages]);

    const header = details?.[0];

    const handleImageError = useCallback((url: string) => {
        setImageAttempts((prev) => {
            const current = prev[url] ?? 0;
            if (current >= MAX_ATTEMPTS) return prev;
            const next = current + 1;

            if (next <= MAX_ATTEMPTS) {
                console.warn(
                    `[ImageError] ${url} (deneme ${next}/${MAX_ATTEMPTS}) başarısız.`
                );
            }

            if (next >= MAX_ATTEMPTS) {
                setFailedImages((prevSet) => {
                    if (!prevSet.has(url)) {
                        const clone = new Set(prevSet);
                        clone.add(url);
                        return clone;
                    }
                    return prevSet;
                });
            }
            return { ...prev, [url]: next };
        });
    }, []);

    // Slider yüksekliğini gözlemle
    useEffect(() => {
        if (!sliderRef.current) return;
        const el = sliderRef.current;

        const applyHeight = () => {
            const h = el.offsetHeight;
            if (h && h !== sliderHeight) {
                setSliderHeight(h);
            }
        };

        applyHeight();

        const observer = new ResizeObserver(() => {
            applyHeight();
        });
        observer.observe(el);

        window.addEventListener("resize", applyHeight);
        return () => {
            observer.disconnect();
            window.removeEventListener("resize", applyHeight);
        };
    }, [sliderHeight]);

    if (isLoading)
        return <div className="py-8 text-center text-[#47597b]">Yükleniyor…</div>;
    if (error)
        return (
            <div className="py-8 text-center text-red-500">
                Bir hata oluştu: {error.message}
            </div>
        );
    if (!details?.length)
        return <div className="py-8 text-center">İçerik bulunamadı.</div>;

    return (
        <div className="w-full bg-[#212529] py-16">
            <div className="flex flex-col lg:flex-row gap-12 items-start">
                {/* SOL: Slider */}
                <div ref={sliderRef} className="w-full lg:w-1/2">
                    {duplicatedImages.length === 0 ? (
                        <div className="text-sm text-[#d1d7e6]">
                            Gösterilecek görsel bulunamadı.
                        </div>
                    ) : (
                        <Swiper
                            modules={[Autoplay]}
                            slidesPerView={2}
                            spaceBetween={10}
                            autoplay={{
                                delay: 3000,
                                disableOnInteraction: true,
                                pauseOnMouseEnter: true
                            }}
                            loop={duplicatedImages.length > 1}
                            speed={500}
                            breakpoints={{
                                480: { slidesPerView: 2, spaceBetween: 10 },
                                640: { slidesPerView: 2, spaceBetween: 10 },
                                768: { slidesPerView: 2, spaceBetween: 12 },
                                1024: { slidesPerView: 2, spaceBetween: 14 },
                                1280: { slidesPerView: 3, spaceBetween: 16 }
                            }}
                            className="select-none"
                        >
                            {duplicatedImages.map((url, idx) => {
                                const attempts = imageAttempts[url] ?? 0;
                                const exceeded = attempts >= MAX_ATTEMPTS;
                                return (
                                    <SwiperSlide key={`${url}-${idx}`}>
                                        <div className="relative w-full aspect-4/5 rounded-xl overflow-hidden bg-[#2b3035]">
                                            {!exceeded ? (
                                                <Image
                                                    src={url}
                                                    alt={`image_${idx + 1}`}
                                                    fill
                                                    className="object-cover image"
                                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                                    loading="lazy"
                                                    onError={() => handleImageError(url)}
                                                />
                                            ) : (
                                                <Image
                                                    src={FALLBACK_DATA_URI}
                                                    alt="fallback"
                                                    fill
                                                    className="object-contain"
                                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                                />
                                            )}
                                            {exceeded && (
                                                <div className="absolute bottom-1 left-1 bg-red-600/60 text-[10px] px-2 py-1 rounded">
                                                    başarısız
                                                </div>
                                            )}
                                        </div>
                                    </SwiperSlide>
                                );
                            })}
                        </Swiper>
                    )}

                    {failedImages.size > 0 && (
                        <div className="mt-3 text-xs text-red-400">
                            {failedImages.size} görsel yüklenemedi (her biri en fazla{" "}
                            {MAX_ATTEMPTS} denendi).
                        </div>
                    )}
                </div>

                {/* SAĞ: Metin (slider yüksekliğine göre dikey ortalı - lg ve üstü) */}
                <div
                    className="max-w-2xl lg:w-1/2 flex flex-col lg:justify-center"
                    style={sliderHeight ? { height: sliderHeight } : undefined}
                >
                    {header?.title && (
                        <h2 className="text-4xl xl:text-5xl font-semibold text-[#ecf2ff] leading-tight">
                            {header.title}
                        </h2>
                    )}
                    {header?.text && (
                        <p className="mt-6 ml-16 text-[#d1d7e6] text-base xl:text-lg leading-relaxed">
                            {header.text}
                        </p>
                    )}
                    <div className="mt-8 ml-16">
                        <a
                            href={header?.button_link || ""}
                            className="inline-flex items-center gap-2 bg-[#47597b] hover:bg-[#5b6e94] text-white text-sm font-medium px-6 py-3 rounded-full transition-colors"
                        >
                            {header?.text && (
                                <span>{header.button_name}</span>
                            )}
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="opacity-80"
                            >
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                            </svg>
                        </a>
                    </div>


                </div>

            </div>

        </div>
    );
}