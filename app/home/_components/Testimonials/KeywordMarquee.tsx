"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./KeywordMarquee.module.css";
import { useLanguage } from "@/components/LanguageProvider";

interface KeywordMarqueeProps {
    // Override keywords directly (already localized)
    keywordsOverride?: string[];
    // Async loader: (lang) => string[]
    loadKeywords?: (lang: string) => Promise<string[]>;
    // Visual / behavior props
    speedSeconds?: number;
    direction?: "left" | "right";
    pauseOnHover?: boolean;
    uppercase?: boolean;
    autoResizeShift?: boolean;
    duplicates?: number;
    className?: string;
    textColor?: string;
    bulletColor?: string;
    bulletSizePx?: number;
    gapRem?: number;
    // Character used between words (default bullet)
    separatorBullet?: string;
}

function normalizeLang(raw?: string) {
    const two = (raw || "").slice(0, 2).toLowerCase();
    return ["tr", "en", "de"].includes(two) ? two : "en";
}

// Built‑in defaults (short keywords only)
const DEFAULT_KEYWORDS: Record<string, string[]> = {
    tr: ["REFERANSLAR", "YORUMLAR", "KREDİLER"],
    en: ["TESTIMONIALS", "REVIEWS", "CREDITS"],
    de: ["REFERENZEN", "BEWERTUNGEN", "CREDITS"]
};

export default function KeywordMarquee({
    keywordsOverride,
    loadKeywords,
    speedSeconds = 40,
    direction = "left",
    pauseOnHover = true,
    uppercase = true,
    autoResizeShift = true,
    duplicates = 4,
    className = "",
    textColor = "rgba(81,55,255,0.10)",
    bulletColor = "rgba(81,55,255,0.10)",
    bulletSizePx = 200,
    gapRem = 2,
    separatorBullet = "•"
}: KeywordMarqueeProps) {
    const { lang_code } = useLanguage();
    const lang = normalizeLang(lang_code);

    const [loadedKeywords, setLoadedKeywords] = useState<string[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        async function run() {
            if (!loadKeywords) return;
            try {
                setLoading(true);
                setLoadError(null);
                const data = await loadKeywords(lang).catch(() => null);
                if (!active) return;
                setLoadedKeywords(data);
            } catch (e: any) {
                if (!active) return;
                setLoadError(e?.message || "Yükleme hatası");
            } finally {
                if (active) setLoading(false);
            }
        }
        run();
        return () => {
            active = false;
        };
    }, [loadKeywords, lang]);

    const keywords = useMemo(() => {
        const provided = keywordsOverride ?? loadedKeywords;
        if (provided && provided.length > 0) return provided;
        const base = DEFAULT_KEYWORDS[lang] ?? DEFAULT_KEYWORDS.en;
        return uppercase ? base.map(k => k.toUpperCase()) : base;
    }, [keywordsOverride, loadedKeywords, lang, uppercase]);

    // Prepare track items (keywords + separator bullet)
    const trackItems = useMemo(() => {
        return keywords.map((k) => k);
    }, [keywords]);

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
    }, [autoResizeShift, trackItems]);

    const wrapperClasses = [
        styles.marqWrapper,
        direction === "right" ? styles.marqDirectionRight : "",
        pauseOnHover ? styles.marqPauseOnHover : "",
        className
    ].filter(Boolean).join(" ");

    const style: React.CSSProperties = {
        ["--marq-speed" as any]: `${speedSeconds}s`,
        ["--marq-text-color" as any]: textColor,
        ["--marq-bullet-color" as any]: bulletColor,
        ["--marq-bullet-size" as any]: `${bulletSizePx}px`,
        ["--marq-gap-rem" as any]: gapRem.toString()
    };

    const groups = useMemo(
        () => Array.from({ length: Math.max(2, duplicates) }),
        [duplicates]
    );

    return (
        <div className={wrapperClasses} style={style}>
            <div ref={trackRef} className={styles.marqTrack}>
                {groups.map((_, gi) => (
                    <div key={`group-${gi}`} className={styles.marqGroup}>
                        {trackItems.map((text, idx) => (
                            <div key={`${gi}-${idx}-${text}`} className={styles.marqItem}>
                                <span className={styles.marqText}>{text}</span>
                                <span className={styles.marqBullet} aria-hidden="true">
                                    {separatorBullet}
                                </span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {loading && <div className={styles.stateOverlay}><span className={styles.stateText}>Yükleniyor…</span></div>}
            {loadError && <div className={styles.stateOverlay}><span className={styles.stateError}>Hata: {loadError}</span></div>}
            {!loading && !loadError && trackItems.length === 0 && (
                <div className={styles.stateOverlay}><span className={styles.stateEmpty}>İçerik yok</span></div>
            )}
        </div>
    );
}