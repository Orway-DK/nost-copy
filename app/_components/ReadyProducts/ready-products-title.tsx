"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import SectionHeading from "./SectionHeading";

const TITLES = {
    tr: { text: "Muhteşem Ürünler Sizin İçin Hazır", highlight: "Ürünler" },
    en: { text: "Amazing Products Are Ready For You", highlight: "Products" },
    de: { text: "Tolle Produkte Sind Für Sie Bereit", highlight: "Produkte" },
};

export default function ReadyProductsTitle() {
    // --- HYDRATION FIX ---
    const [mounted, setMounted] = useState(false);
    const { lang } = useLanguage();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Eğer henüz client tarafında mount olmadıysak hiçbir şey döndürme (veya loading skeleton)
    // Bu sayede sunucu ile istemci arasındaki metin farkı hataya yol açmaz.
    if (!mounted) {
        return null;
        // İstersen layout kaymasını (CLS) önlemek için buraya 
        // boş ama aynı yükseklikte görünmez bir div de koyabilirsin.
    }

    // Geçerli dil yoksa varsayılan olarak 'en' kullan (veya tr)
    const currentLang = (lang && TITLES[lang as keyof typeof TITLES]) ? lang : "en";
    const content = TITLES[currentLang as keyof typeof TITLES];

    return (
        <SectionHeading
            text={content.text}
            highlight={content.highlight}
        />
    );
}