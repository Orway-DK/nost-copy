"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./TestimonialSlidingText.module.css";
import { useLanguage } from "@/components/LanguageProvider";

/* Types */
type TestimonialRow = {
    id: number | string;
    stars: number;
    image_url?: string | null;
    image_alt?: string | null;
    author_name?: string | null;
    author_job?: string | null;
    content: string;
};

interface TestimonialSlidingTextProps {
    testimonials?: TestimonialRow[];                  // optionally provide testimonials directly
    loadTestimonials?: (lang: string) => Promise<TestimonialRow[]>; // async loader
    speedSeconds?: number;                            // marquee speed
    direction?: "left" | "right";                     // scroll direction
    pauseOnHover?: boolean;
    uppercase?: boolean;
    autoResizeShift?: boolean;
    duplicates?: number;                              // track duplication count to create continuous scroll
    textColor?: string;
    bulletColor?: string;
    bulletSizePx?: number;
    className?: string;
    maxLengthPerItem?: number;                        // truncate testimonial text length
    showStars?: boolean;                              // prepend stars representation
    showAuthor?: boolean;                             // append author name
    separatorBullet?: string;                         // bullet char (• default)
}

/* Language normalization */
function normalizeLang(raw?: string) {
    const two = (raw || "").slice(0, 2).toLowerCase();
    return ["tr", "en", "de"].includes(two) ? two : "en";
}

/* Built-in localized fallback testimonials (short form) */
const FALLBACK_TESTIMONIALS: Record<string, TestimonialRow[]> = {
    tr: [
        {
            id: "fb-tr-1",
            stars: 5,
            author_name: "Elif Yılmaz",
            author_job: "Pazarlama Müdürü",
            content: "Renk tutarlılığı ve baskı kalitesi beklentimizin üzerinde."
        },
        {
            id: "fb-tr-2",
            stars: 5,
            author_name: "Ahmet Demir",
            author_job: "Ajans Sahibi",
            content: "Kurumsal kimlik setlerinde fiyat/performans harika."
        }
    ],
    en: [
        {
            id: "fb-en-1",
            stars: 5,
            author_name: "Elif Yılmaz",
            author_job: "Marketing Manager",
            content: "Color consistency and print quality exceeded expectations."
        },
        {
            id: "fb-en-2",
            stars: 5,
            author_name: "Ahmet Demir",
            author_job: "Agency Owner",
            content: "Great price/performance on brand identity sets."
        }
    ],
    de: [
        {
            id: "fb-de-1",
            stars: 5,
            author_name: "Elif Yılmaz",
            author_job: "Marketing Managerin",
            content: "Farbkonstanz und Druckqualität übertrafen Erwartungen."
        },
        {
            id: "fb-de-2",
            stars: 5,
            author_name: "Ahmet Demir",
            author_job: "Agenturinhaber",
            content: "Tolles Preis‑Leistungs‑Verhältnis bei CI-Sets."
        }
    ]
};

export default function TestimonialSlidingText({
    testimonials,
    loadTestimonials,
    speedSeconds = 40,
    direction = "left",
    pauseOnHover = true,
    uppercase = false,
    autoResizeShift = true,
    duplicates = 3,
    textColor = "rgba(81,55,255,0.063)",
    bulletColor = "rgba(81,55,255,0.063)",
    bulletSizePx = 200,
    className = "",
    maxLengthPerItem = 140,
    showStars = true,
    showAuthor = true,
    separatorBullet = "•",
}: TestimonialSlidingTextProps) {
    const { lang_code } = useLanguage();
    const lang = normalizeLang(lang_code);

    const [loaded, setLoaded] = useState<TestimonialRow[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        async function run() {
            if (!loadTestimonials) return;
            try {
                setLoading(true);
                setLoadError(null);
                const data = await loadTestimonials(lang).catch(() => null);
                if (!active) return;
                setLoaded(data);
            } catch (e: any) {
                if (!active) return;
                setLoadError(e?.message || "Load error");
            } finally {
                if (active) setLoading(false);
            }
        }
        run();
        return () => {
            active = false;
        };
    }, [loadTestimonials, lang]);

    // Decide final dataset with fallbacks
    const baseData = testimonials ?? loaded ?? FALLBACK_TESTIMONIALS[lang] ?? FALLBACK_TESTIMONIALS.en;
    const finalData = baseData.filter(t => t.content && t.content.trim().length > 0);

    // Transform testimonials into marquee display items
    const marqueeItems = useMemo(() => {
        return finalData.map(t => {
            let text = t.content.trim();
            if (maxLengthPerItem > 0 && text.length > maxLengthPerItem) {
                text = text.slice(0, maxLengthPerItem - 1).trim() + "…";
            }

            const starsStr = showStars
                ? "★".repeat(Math.min(5, Math.max(0, t.stars || 0)))
                : "";

            const authorStr = showAuthor && t.author_name
                ? `— ${t.author_name}`
                : "";

            const combined = [starsStr, text, authorStr]
                .filter(Boolean)
                .join("  ");

            return uppercase ? combined.toUpperCase() : combined;
        });
    }, [finalData, maxLengthPerItem, showStars, showAuthor, uppercase]);

    // Marquee logic
    const trackRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!autoResizeShift || !trackRef.current) return;
        const el = trackRef.current;
        let raf = 0;

        const applyShift = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const total = el.scrollWidth;
                const view = el.parentElement?.clientWidth ?? 0;
                let shiftPercent = -50;
                if (total > view * 4) shiftPercent = -33.333;
                if (total > view * 6) shiftPercent = -25;
                el.style.setProperty("--marq-shift", `${shiftPercent}%`);
            });
        };

        applyShift();
        const ro = new ResizeObserver(applyShift);
        ro.observe(el);
        const onResize = () => applyShift();
        window.addEventListener("resize", onResize);
        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
            window.removeEventListener("resize", onResize);
        };
    }, [autoResizeShift, marqueeItems]);

    const wrapperClasses = [
        styles.marqWrapper,
        direction === "right" ? styles.marqDirectionRight : "",
        pauseOnHover ? styles.marqPauseOnHover : "",
        className,
    ].filter(Boolean).join(" ");

    const style: React.CSSProperties = {
        ["--marq-speed" as any]: `${speedSeconds}s`,
        ["--marq-text-color" as any]: textColor,
        ["--marq-bullet-color" as any]: bulletColor,
        ["--marq-bullet-size" as any]: `${bulletSizePx}px`,
    };

    const groups = useMemo(
        () => Array.from({ length: Math.max(2, duplicates) }),
        [duplicates]
    );

    return (
        <div className={wrapperClasses} style={style}>
            <div ref={trackRef} className={`${styles.marqTrack} items-center`}>
                {groups.map((_, gi) => (
                    <div key={`group-${gi}`} className={styles.marqGroup}>
                        {marqueeItems.map((text, idx) => (
                            <div key={gi + "-" + idx} className={styles.marqItem}>
                                <span className={styles.marqText}>{text}</span>
                                <span className={styles.marqBullet} aria-hidden="true">
                                    {separatorBullet}
                                </span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* States (optional) */}
            {loading && (
                <div className={styles.stateOverlay}>
                    <span className={styles.stateText}>Yükleniyor…</span>
                </div>
            )}
            {loadError && (
                <div className={styles.stateOverlay}>
                    <span className={styles.stateError}>Hata: {loadError}</span>
                </div>
            )}
            {!loading && !loadError && marqueeItems.length === 0 && (
                <div className={styles.stateOverlay}>
                    <span className={styles.stateEmpty}>Henüz içerik yok</span>
                </div>
            )}
        </div>
    );
}