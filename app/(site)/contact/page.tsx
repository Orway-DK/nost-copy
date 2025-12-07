"use client";

import React from "react";
import Image from "next/image";
// Kendi LanguageProvider yolunuza göre import edin
import { useLanguage } from "@/components/LanguageProvider";

import ContactFormArea from "@/app/_components/Contact/ContactFormArea";
import WorldMapLocations from "@/app/_components/Contact/WorldMapLocations";

// --- SAYFA METİNLERİ ---
const PAGE_TEXTS: Record<string, any> = {
    tr: {
        title: "Bize Ulaşın",
        desc: "Sorularınız mı var? Projenizi hayata geçirmek için buradayız. Aşağıdaki formu doldurun veya dünya çapındaki ofislerimizi ziyaret edin."
    },
    en: {
        title: "Contact Us",
        desc: "Have questions? We are here to bring your project to life. Fill out the form below or visit our offices worldwide."
    },
    de: {
        title: "Kontaktieren Sie uns",
        desc: "Haben Sie Fragen? Wir sind hier, um Ihr Projekt zum Leben zu erwecken. Füllen Sie das untenstehende Formular aus oder besuchen Sie unsere weltweiten Büros."
    }
};

export default function ContactPage() {
    // 1. Dili Çek
    const { lang } = useLanguage();
    // 2. Metinleri Seç
    const t = PAGE_TEXTS[lang] || PAGE_TEXTS.tr;

    return (
        <div className="relative w-screen min-h-screen left-1/2 -translate-x-1/2 overflow-x-hidden">

            {/* --- BACKGROUND ELEMENTLERİ (Aynı kaldı) --- */}
            <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-0 left-0">
                    <Image
                        src="/h1-bg01.svg"
                        alt="bg"
                        width={600}
                        height={600}
                        className="object-cover opacity-60 w-[300px] md:w-[600px]"
                        priority
                    />
                </div>
                <div className="absolute top-[30%] -right-[10%] rotate-90 opacity-40">
                    <Image
                        src="/h1-slider1.svg"
                        alt="bg"
                        width={800}
                        height={800}
                        className="object-cover w-[400px] md:w-[800px]"
                    />
                </div>
                <div className="absolute top-0 right-0 opacity-50">
                    <Image
                        src="/h1-slider2.svg"
                        alt="bg"
                        width={700}
                        height={700}
                        className="object-cover w-[300px] md:w-[700px]"
                    />
                </div>
            </div>

            {/* --- ANA İÇERİK --- */}
            <main className="relative z-10 w-full">

                {/* Banner */}
                <section className="py-20 md:py-28 text-center">
                    <div className="max-w-7xl mx-auto px-4">
                        {/* DİNAMİK BAŞLIK */}
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                            {t.title}
                        </h1>
                        {/* DİNAMİK AÇIKLAMA */}
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            {t.desc}
                        </p>
                    </div>
                </section>

                {/* Harita (Zaten dinamik yapmıştık) */}
                <WorldMapLocations />

                {/* Form Alanı (Şimdi bunu güncelleyeceğiz) */}
                <ContactFormArea />
            </main>
        </div>
    );
}