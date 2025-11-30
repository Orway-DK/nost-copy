"use client";

import React, { useMemo } from "react";
import useSWRImmutable from "swr/immutable";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./TestimonialsCarousel.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

/*
  ÖNEMLİ: Swiper CSS globalde (layout.tsx) import edilmeli:
    import "swiper/css";
    import "swiper/css/pagination";
*/

type RawTestimonialRow = {
    id: number;
    order_no: number | null;
    stars: number;
    image_url: string | null;
    image_alt: string | null;
    author_name: string | null;
    author_job: string | null;
    testimonial_translations: { lang_code: string; content: string }[];
};

export interface LocalizedTestimonial {
    id: number;
    stars: number;
    image_url: string | null;
    image_alt: string;
    author_name: string;
    author_job: string;
    content: string;
}

interface TestimonialsCarouselProps {
    sectionCode?: string;
    autoplayDelayMs?: number;
    pauseOnHover?: boolean;
    showPagination?: boolean;
    className?: string;
    slidesPerViewDesktop?: number;
    slidesPerViewTablet?: number;
    slidesPerViewMobile?: number;
    testimonialsOverride?: LocalizedTestimonial[];
    loop?: boolean;
    limit?: number;
    disableAutoplay?: boolean;
    starActiveColor?: string;
    starInactiveColor?: string;
    // Yıldız yerine SVG kullanmak istersen devre dışı bırak
    useUnicodeStars?: boolean;
}

function normalizeLang(raw?: string) {
    if (!raw) return "en";
    const two = raw.slice(0, 2).toLowerCase();
    return ["tr", "en", "de"].includes(two) ? two : "en";
}

async function fetchTestimonials(
    section: string,
    lang: string,
    limit?: number
): Promise<LocalizedTestimonial[]> {
    const supabase = createSupabaseBrowserClient();
    const query = supabase
        .from("testimonials")
        .select(
            "id, order_no, stars, image_url, image_alt, author_name, author_job, testimonial_translations(lang_code, content)"
        )
        .eq("section_code", section)
        .eq("active", true)
        .order("order_no", { ascending: true });

    if (limit) query.limit(limit);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const rows = (data ?? []) as RawTestimonialRow[];

    return rows.map((row) => {
        const order = [lang, "tr", "en", "de"];
        const chosen =
            order
                .map((lc) =>
                    row.testimonial_translations.find((t) => t.lang_code === lc)
                )
                .find(Boolean) || null;

        return {
            id: row.id,
            stars: row.stars,
            image_url: row.image_url,
            image_alt: row.image_alt || "",
            author_name: row.author_name || "",
            author_job: row.author_job || "",
            content: chosen?.content || "",
        };
    });
}

export default function TestimonialsCarousel({
    sectionCode = "home_testimonials",
    autoplayDelayMs = 5000,
    pauseOnHover = true,
    showPagination = true,
    className = "",
    slidesPerViewDesktop = 4,
    slidesPerViewTablet = 2,
    slidesPerViewMobile = 1,
    testimonialsOverride,
    loop,
    limit,
    disableAutoplay = false,
    starActiveColor = "#f5b400",
    starInactiveColor = "#d1d5db",
    useUnicodeStars = true,
}: TestimonialsCarouselProps) {
    const { lang_code } = useLanguage();
    const lang = normalizeLang(lang_code);

    const { data, error, isLoading } = useSWRImmutable(
        ["testimonials", sectionCode, lang, limit ?? "all"],
        () => fetchTestimonials(sectionCode, lang, limit),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            revalidateIfStale: false,
        }
    );

    const testimonials: LocalizedTestimonial[] = useMemo(
        () => testimonialsOverride ?? data ?? [],
        [testimonialsOverride, data]
    );

    const effectiveLoop =
        typeof loop === "boolean" ? loop : testimonials.length > 1;

    return (
        <div
            className={`${styles.wrapper} ${className}`}
            style={
                {
                    "--star-active-color": starActiveColor,
                    "--star-inactive-color": starInactiveColor,
                } as React.CSSProperties
            }
        >
            {isLoading && <div className={styles.stateLoading}>Yükleniyor…</div>}
            {error && <div className={styles.stateError}>Hata: {error.message}</div>}
            {!isLoading && !error && testimonials.length === 0 && (
                <div className={styles.stateEmpty}>Henüz bir yorum yok</div>
            )}

            {!isLoading && !error && testimonials.length > 0 && (
                <Swiper
                    modules={[Autoplay, Pagination]}
                    breakpoints={{
                        0: { slidesPerView: slidesPerViewMobile, spaceBetween: 16 },
                        640: { slidesPerView: slidesPerViewTablet, spaceBetween: 20 },
                        1024: { slidesPerView: slidesPerViewDesktop, spaceBetween: 24 },
                    }}
                    loop={effectiveLoop}
                    autoplay={
                        disableAutoplay
                            ? false
                            : {
                                delay: autoplayDelayMs,
                                disableOnInteraction: true,
                                pauseOnMouseEnter: pauseOnHover,
                            }
                    }
                    className={styles.swiperRoot}
                >
                    {testimonials.map((t) => (
                        <SwiperSlide key={t.id}>
                            <div className={styles.card}>
                                <div className={styles.ratingRow} aria-label={`${t.stars} / 5 yıldız`}>
                                    {Array.from({ length: 5 }).map((_, i) => {
                                        const active = i < t.stars;
                                        if (useUnicodeStars) {
                                            return (
                                                <span
                                                    key={i}
                                                    className={
                                                        active
                                                            ? `${styles.star} ${styles.starActive}`
                                                            : `${styles.star} ${styles.starInactive}`
                                                    }
                                                    aria-hidden="true"
                                                >
                                                    ★
                                                </span>
                                            );
                                        }
                                        return (
                                            <svg
                                                key={i}
                                                className={
                                                    active
                                                        ? `${styles.starSvg} ${styles.starActive}`
                                                        : `${styles.starSvg} ${styles.starInactive}`
                                                }
                                                viewBox="0 0 24 24"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                                                    fill="currentColor"
                                                />
                                            </svg>
                                        );
                                    })}
                                </div>

                                <div className={styles.content}>
                                    {t.content ? `“${t.content}”` : ""}
                                </div>

                                <div className={styles.caption}>
                                    <div className={styles.details}>
                                        <span className={styles.name}>{t.author_name}</span>
                                        <span className={styles.job}>{t.author_job}</span>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            )}
        </div>
    );
}