"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createClient } from '@supabase/supabase-js';
import { useLanguage } from "@/components/LanguageProvider";

// Supabase Client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- YEDEK METİNLER (Veritabanı yüklenene kadar veya hata olursa görünür) ---
const FALLBACK_DEFAULTS: Record<string, any> = {
    tr: {
        heading: "Mesaj Gönderin",
        sub: "Size en kısa sürede dönüş yapacağız.",
        label_name: "Adınız Soyadınız",
        ph_name: "Ad Soyad",
        label_email: "E-posta Adresi",
        ph_email: "ornek@mail.com",
        label_phone: "Telefon Numarası",
        ph_phone: "+90 555...",
        label_msg: "Mesajınız",
        ph_msg: "Projenizden bahsedin...",
        btn: "Gönder",
        btn_sending: "Gönderiliyor...",
        success: "Mesajınız başarıyla iletildi!",
        error: "Bir hata oluştu, lütfen tekrar deneyin."
    }
};

type TranslationRow = {
    key_name: string;
    text_tr: string;
    text_en: string;
    text_de: string;
};

export default function ContactFormArea() {
    const { lang } = useLanguage();

    // Veritabanından gelen ham verileri tutacağımız state
    const [dbTranslations, setDbTranslations] = useState<TranslationRow[]>([]);

    // Form durumları
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

    // 1. Veritabanından Çevirileri Çek (Sadece component ilk açıldığında)
    useEffect(() => {
        async function fetchTranslations() {
            const { data, error } = await supabase
                .from('ui_translations')
                .select('*')
                .eq('section', 'contact_form');

            if (data && !error) {
                setDbTranslations(data);
            }
        }
        fetchTranslations();
    }, []);

    // 2. Dile Göre Metinleri Hazırla (lang veya dbTranslations değişince çalışır)
    const t = useMemo(() => {
        // Önce varsayılan Türkçe yedeği al (Hata olmasın diye)
        const currentTexts = { ...FALLBACK_DEFAULTS.tr };

        // Eğer veritabanından veri geldiyse üzerine yaz
        if (dbTranslations.length > 0) {
            dbTranslations.forEach((row) => {
                // Hangi kolonu okuyacağımızı belirle (text_tr, text_en, text_de)
                // Eğer o dilde kolon yoksa varsayılan olarak 'text_tr' kullan
                const langKey = `text_${lang}` as keyof TranslationRow;

                // Değeri al, eğer o dilde boşsa Türkçe'yi al
                const value = row[langKey] || row.text_tr;

                // Anahtarı (key_name) objeye ata
                if (value) {
                    currentTexts[row.key_name] = value;
                }
            });
        }

        return currentTexts;
    }, [dbTranslations, lang]);

    // Form Submit İşlemi
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simülasyon
        setTimeout(() => {
            setLoading(false);
            setStatus("success");
            setTimeout(() => setStatus("idle"), 3000);
        }, 1500);
    };

    return (
        <section className="pt-24 pb-32">
            <div className="max-w-3xl mx-auto px-4">

                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-900">{t.heading}</h2>
                    <p className="text-gray-500 mt-2">{t.sub}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-8 rounded-2xl shadow-sm border border-gray-100">

                    {/* İsim & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t.label_name}
                            </label>
                            <input
                                type="text"
                                required
                                placeholder={t.ph_name}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t.label_email}
                            </label>
                            <input
                                type="email"
                                required
                                placeholder={t.ph_email}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Telefon */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t.label_phone}
                        </label>
                        <input
                            type="tel"
                            placeholder={t.ph_phone}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    {/* Mesaj */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t.label_msg}
                        </label>
                        <textarea
                            rows={4}
                            required
                            placeholder={t.ph_msg}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                        ></textarea>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white font-semibold py-4 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? t.btn_sending : t.btn}
                    </button>

                    {/* Durum Mesajları */}
                    {status === "success" && (
                        <div className="p-4 bg-green-50 text-green-700 rounded-lg text-center font-medium border border-green-200">
                            {t.success}
                        </div>
                    )}
                    {status === "error" && (
                        <div className="p-4 bg-red-50 text-red-700 rounded-lg text-center font-medium border border-red-200">
                            {t.error}
                        </div>
                    )}

                </form>
            </div>
        </section>
    );
}