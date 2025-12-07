"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { useLanguage } from "@/components/LanguageProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "./Testimonials.module.css";

// Swiper CSS
import "swiper/css";
import "swiper/css/pagination";

// --- TİPLER ---
type Testimonial = {
    id: number;
    stars: number;
    image_url: string | null;
    image_alt: string | null;
    author_name: string;
    author_job: string;
    content: string;
};

// --- DATA FETCHING ---
async function fetchTestimonials(lang: string): Promise<Testimonial[]> {
    const supabase = createSupabaseBrowserClient();

    const { data: rawData, error } = await supabase
        .from("testimonials")
        .select(`
      id, stars, image_url, image_alt, author_name, author_job, order_no,
      testimonial_translations (lang_code, content)
    `)
        .eq("section_code", "home_testimonials")
        .eq("active", true)
        .order("order_no", { ascending: true });

    if (error) {
        console.error("Testimonial fetch error:", error);
        return [];
    }

    return rawData.map((item: any) => {
        const translations = item.testimonial_translations || [];
        const t = translations.find((x: any) => x.lang_code === lang)
            || translations.find((x: any) => x.lang_code === "tr") // Fallback TR
            || translations.find((x: any) => x.lang_code === "en") // Fallback EN
            || { content: "" };

        return {
            id: item.id,
            stars: item.stars,
            image_url: item.image_url,
            image_alt: item.image_alt || item.author_name,
            author_name: item.author_name || "Müşteri",
            author_job: item.author_job || "",
            content: t.content,
        };
    });
}

export default function TestimonialsSection() {
    const { lang_code } = useLanguage();
    const lang = (lang_code || "tr").slice(0, 2);

    const [items, setItems] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        let active = true;
        async function load() {
            setLoading(true);
            const data = await fetchTestimonials(lang);
            if (active) {
                setItems(data);
                setLoading(false);
            }
        }
        load();
        return () => { active = false; };
    }, [lang]);

    // --- MARQUEE METNİ ---
    const marqueeText = useMemo(() => {
        if (lang === "tr") return "YORUMLAR • REFERANSLAR •";
        if (lang === "de") return "KUNDENBEWERTUNGEN • REFERENZEN •";
        return "TESTIMONIALS • REVIEWS •";
    }, [lang]);

    // Metni ekranda boşluk kalmayacak kadar tekrarla (Örn: 10 kere)
    const repeatedText = Array(10).fill(marqueeText);

    if (!mounted) return null;

    return (
        <section className={styles.sectionWrapper}>

            {/* --- KAYAN BAŞLIK (MARQUEE) --- */}
            <div className={styles.marqueeContainer}>
                <div className={styles.marqueeTrack}>
                    {/* Metin bloğu 1 */}
                    {repeatedText.map((text, i) => (
                        <span key={`t1-${i}`} className={styles.marqueeText}>{text}</span>
                    ))}
                    {/* Metin bloğu 2 (Kesintisiz döngü için tekrar) */}
                    {repeatedText.map((text, i) => (
                        <span key={`t2-${i}`} className={styles.marqueeText}>{text}</span>
                    ))}
                </div>
            </div>

            {/* --- KART SLIDER --- */}
            <div className="container mx-auto px-4 relative z-10">
                <div className={styles.sliderContainer}>
                    {loading ? (
                        <div className={styles.loadingState}>Yükleniyor...</div>
                    ) : items.length === 0 ? (
                        <div className={styles.loadingState}>Henüz yorum bulunmuyor.</div>
                    ) : (
                        <Swiper
                            modules={[Autoplay, Pagination]}
                            // Desktop: Ortada 1 tam, yanlarda 1.5'ar kesik kart (Toplam ~4 birimlik alan)
                            slidesPerView={1.2}
                            centeredSlides={true}
                            loop={items.length > 2}
                            spaceBetween={20}
                            speed={1000}
                            autoplay={{
                                delay: 4000,
                                disableOnInteraction: false,
                                pauseOnMouseEnter: true, // Mouse üzerine gelince durur
                            }}
                            breakpoints={{
                                640: { slidesPerView: 2, spaceBetween: 30, centeredSlides: true },
                                1024: { slidesPerView: 3, spaceBetween: 40, centeredSlides: true },
                                1280: { slidesPerView: 3.8, spaceBetween: 50, centeredSlides: true } // Geniş ekranda o "kesik" efekti verir
                            }}
                        >
                            {items.map((item) => (
                                <SwiperSlide key={item.id} className="h-auto py-10"> {/* py-10 gölgelerin kesilmemesi için */}
                                    <div className={styles.card}>
                                        {/* Yıldızlar */}
                                        <div className={styles.stars}>
                                            {"★".repeat(item.stars)}
                                        </div>

                                        {/* İçerik */}
                                        <p className={styles.content}>“{item.content}”</p>

                                        {/* Yazar */}
                                        <div className={styles.author}>
                                            {item.image_url ? (
                                                <Image
                                                    src={item.image_url}
                                                    alt={item.image_alt || "User"}
                                                    width={60}
                                                    height={60}
                                                    className={styles.avatar}
                                                />
                                            ) : (
                                                <div className={styles.avatarPlaceholder}>
                                                    {item.author_name.charAt(0)}
                                                </div>
                                            )}
                                            <div className={styles.authorInfo}>
                                                <span className={styles.authorName}>{item.author_name}</span>
                                                {item.author_job && (
                                                    <span className={styles.authorJob}>{item.author_job}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    )}
                </div>
            </div>
        </section>
    );
}