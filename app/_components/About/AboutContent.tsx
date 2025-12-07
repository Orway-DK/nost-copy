"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createClient } from '@supabase/supabase-js';
import { useLanguage } from "@/components/LanguageProvider";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// YEDEK METİNLER (Veritabanı gelmezse)
const FALLBACKS: Record<string, any> = {
    tr: {
        hero_title: "Hikayemiz",
        hero_sub: "Baskı dünyasında yenilikçi çözümler.",
        mission_title: "Misyonumuz",
        mission_desc: "Kaliteli hizmet sunmak.",
        vision_title: "Vizyonumuz",
        vision_desc: "Global lider olmak.",
        stat_clients: "Mutlu Müşteri",
        stat_projects: "Proje"
    }
};

type TranslationRow = {
    key_name: string;
    text_tr: string;
    text_en: string;
    text_de: string;
};

export default function AboutContent() {
    const { lang } = useLanguage();
    const [dbData, setDbData] = useState<TranslationRow[]>([]);

    // Verileri Çek
    useEffect(() => {
        async function getData() {
            const { data } = await supabase
                .from('ui_translations')
                .select('*')
                .eq('section', 'about_page');
            if (data) setDbData(data);
        }
        getData();
    }, []);

    // Dile Göre Eşle
    const t = useMemo(() => {
        const texts = { ...FALLBACKS.tr };
        if (dbData.length > 0) {
            dbData.forEach(row => {
                const langKey = `text_${lang}` as keyof TranslationRow;
                const val = row[langKey] || row.text_tr;
                if (val) texts[row.key_name] = val;
            });
        }
        return texts;
    }, [dbData, lang]);

    return (
        <section className="relative py-16 md:py-24">
            <div className="max-w-7xl mx-auto px-4">

                {/* --- ÜST KISIM (Hero) --- */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-blue-600 font-semibold tracking-wide uppercase text-sm mb-3">
                        Nost Copy
                    </h2>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                        {t.hero_title}
                    </h1>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        {t.hero_sub}
                    </p>
                </div>

                {/* --- MİSYON & VİZYON KARTLARI --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                    {/* Misyon */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">{t.mission_title}</h3>
                        <p className="text-gray-600 leading-relaxed">
                            {t.mission_desc}
                        </p>
                    </div>

                    {/* Vizyon */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">{t.vision_title}</h3>
                        <p className="text-gray-600 leading-relaxed">
                            {t.vision_desc}
                        </p>
                    </div>
                </div>

                {/* --- İSTATİSTİKLER (Opsiyonel Süsleme) --- */}
                <div className="bg-gray-900 rounded-3xl p-10 md:p-16 text-white text-center">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <div className="text-4xl font-bold text-blue-400 mb-2">10+</div>
                            <div className="text-sm opacity-70">Yıl Deneyim</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-blue-400 mb-2">5k+</div>
                            <div className="text-sm opacity-70">{t.stat_projects}</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-blue-400 mb-2">98%</div>
                            <div className="text-sm opacity-70">{t.stat_clients}</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-blue-400 mb-2">4</div>
                            <div className="text-sm opacity-70">Global Ofis</div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}