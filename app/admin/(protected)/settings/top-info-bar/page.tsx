"use client";

import React, { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";
import { FaSave, FaGlobe, FaPhone, FaBullhorn, FaMapMarkerAlt } from "react-icons/fa";
import { SlCheck } from "react-icons/sl";

// --- TİPLER ---
type Language = "tr" | "en" | "de";

type FormData = {
    [key in Language]: {
        // İletişim
        phone: string;
        email: string;
        location_url: string;
        location_label: string;
        // Banner
        promo_text: string;
        promo_cta: string;
        promo_url: string;
    };
};

const INITIAL_DATA = {
    phone: "",
    email: "",
    location_url: "",
    location_label: "",
    promo_text: "",
    promo_cta: "",
    promo_url: "",
};

export default function TopInfoBarSettings() {
    const supabase = createSupabaseBrowserClient();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Language>("tr");

    // Banner Aktif/Pasif Durumu
    const [isBannerActive, setIsBannerActive] = useState(true);

    // Form Verileri
    const [formData, setFormData] = useState<FormData>({
        tr: { ...INITIAL_DATA },
        en: { ...INITIAL_DATA },
        de: { ...INITIAL_DATA },
    });

    // --- VERİLERİ ÇEK ---
    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // 1. Banner Ana Durumunu Çek
                const { data: bannerMain } = await supabase
                    .from("banners")
                    .select("id, active")
                    .eq("code", "top_horizontal")
                    .single();

                if (bannerMain) setIsBannerActive(bannerMain.active);

                // 2. İletişim Bilgilerini Çek
                const { data: contactData } = await supabase.from("site_contact_info").select("*");

                // 3. Banner Çevirilerini Çek
                const { data: bannerData } = await supabase
                    .from("banner_translations")
                    .select("*")
                    .eq("banner_id", bannerMain?.id || 0);

                // State'i Doldur
                const newFormData = { ...formData };

                // Contact Verilerini Eşle
                contactData?.forEach((item: any) => {
                    if (["tr", "en", "de"].includes(item.lang_code)) {
                        const lang = item.lang_code as Language;
                        newFormData[lang] = {
                            ...newFormData[lang],
                            phone: item.phone || "",
                            email: item.email || "",
                            location_url: item.location_url || "",
                            location_label: item.location_label || "",
                        };
                    }
                });

                // Banner Verilerini Eşle
                bannerData?.forEach((item: any) => {
                    if (["tr", "en", "de"].includes(item.lang_code)) {
                        const lang = item.lang_code as Language;
                        newFormData[lang] = {
                            ...newFormData[lang],
                            promo_text: item.promo_text || "",
                            promo_cta: item.promo_cta || "",
                            promo_url: item.promo_url || "",
                        };
                    }
                });

                setFormData(newFormData);

            } catch (error) {
                console.error("Veri çekme hatası:", error);
                toast.error("Veriler yüklenirken hata oluştu.");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // --- KAYDET ---
    const handleSave = async () => {
        const toastId = toast.loading("Kaydediliyor...");
        try {
            // 1. Banner Aktifliğini Güncelle (veya oluştur)
            let { data: banner } = await supabase
                .from("banners")
                .select("id")
                .eq("code", "top_horizontal")
                .maybeSingle();

            if (!banner) {
                const { data: newBanner } = await supabase
                    .from("banners")
                    .insert({ code: "top_horizontal", active: isBannerActive })
                    .select()
                    .single();
                banner = newBanner;
            } else {
                await supabase
                    .from("banners")
                    .update({ active: isBannerActive })
                    .eq("id", banner!.id);
            }

            // 2. Her dil için döngüye girip güncelle
            for (const lang of ["tr", "en", "de"] as Language[]) {
                const data = formData[lang];

                // A. İletişim Bilgisi Upsert
                await supabase.from("site_contact_info").upsert(
                    {
                        lang_code: lang,
                        phone: data.phone,
                        email: data.email,
                        location_url: data.location_url,
                        location_label: data.location_label,
                    },
                    { onConflict: "lang_code" }
                );

                // B. Banner Çevirisi Upsert
                if (banner) {
                    await supabase.from("banner_translations").upsert(
                        {
                            banner_id: banner.id,
                            lang_code: lang,
                            promo_text: data.promo_text,
                            promo_cta: data.promo_cta,
                            promo_url: data.promo_url
                        },
                        { onConflict: "banner_id, lang_code" }
                    );
                }
            }

            toast.success("Başarıyla kaydedildi!", { id: toastId });

        } catch (error: any) {
            console.error("Kaydetme hatası:", error);
            toast.error("Hata: " + error.message, { id: toastId });
        }
    };

    // --- INPUT HELPER ---
    const handleChange = (field: keyof FormData["tr"], value: string) => {
        setFormData((prev) => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                [field]: value,
            },
        }));
    };

    if (loading) return <div className="text-center p-10 text-[var(--admin-muted)]">Yükleniyor...</div>;

    return (
        <div className="card-admin w-full">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-semibold border-b border-[var(--admin-card-border)] pb-2 pr-4 inline-block text-[var(--admin-fg)]">
                        Üst Bilgi Çubuğu Yönetimi
                    </h3>
                    <p className="text-[var(--admin-muted)] text-sm mt-1">İletişim bilgileri ve duyuru bannerı ayarları</p>
                </div>
                <button
                    onClick={handleSave}
                    className="btn-admin btn-admin-primary gap-2"
                >
                    <SlCheck /> Değişiklikleri Kaydet
                </button>
            </div>

            {/* GLOBAL SETTINGS (Banner Aktif/Pasif) */}
            <div className="bg-[var(--admin-bg)] p-4 rounded-lg border border-[var(--admin-border)] mb-6 flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--admin-fg)]">
                    Banner Alanını Göster
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={isBannerActive}
                        onChange={(e) => setIsBannerActive(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-[var(--admin-muted)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--admin-primary)]"></div>
                </label>
            </div>

            {/* DİL SEKMELERİ (TABS) */}
            <div className="flex gap-1 mb-6 border-b border-[var(--admin-border)]">
                {(["tr", "en", "de"] as Language[]).map((lang) => (
                    <button
                        key={lang}
                        onClick={() => setActiveTab(lang)}
                        className={`px-6 py-2.5 font-medium text-sm transition-all rounded-t-lg flex items-center gap-2 border-t border-x border-b-0 ${activeTab === lang
                                ? "bg-[var(--admin-bg)] border-[var(--admin-border)] text-[var(--admin-primary)] translate-y-[1px]"
                                : "bg-transparent border-transparent text-[var(--admin-muted)] hover:text-[var(--admin-fg)]"
                            }`}
                    >
                        <FaGlobe /> {lang === "tr" ? "Türkçe" : lang === "en" ? "English" : "Deutsch"}
                    </button>
                ))}
            </div>

            {/* FORM ALANI (2 Sütunlu Grid) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* SOL: İletişim Bilgileri */}
                <div className="border border-[var(--admin-border)] rounded-xl p-5 bg-[var(--admin-bg)]/30">
                    <h3 className="text-md font-bold text-[var(--admin-fg)] mb-4 flex items-center gap-2 pb-2 border-b border-[var(--admin-border)]">
                        <FaPhone className="text-[var(--admin-primary)]" /> İletişim Bilgileri ({activeTab.toUpperCase()})
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--admin-muted)] mb-1">Telefon Numarası</label>
                            <input
                                type="text"
                                value={formData[activeTab].phone}
                                onChange={(e) => handleChange("phone", e.target.value)}
                                className="admin-input w-full"
                                placeholder="+90 555..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--admin-muted)] mb-1">E-Posta Adresi</label>
                            <input
                                type="email"
                                value={formData[activeTab].email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                className="admin-input w-full"
                                placeholder="info@..."
                            />
                        </div>
                        <div className="pt-4 mt-4 border-t border-[var(--admin-border)]">
                            <label className="block text-sm font-medium text-[var(--admin-muted)] mb-1 flex items-center gap-2">
                                <FaMapMarkerAlt /> Konum Buton Metni
                            </label>
                            <input
                                type="text"
                                value={formData[activeTab].location_label}
                                onChange={(e) => handleChange("location_label", e.target.value)}
                                className="admin-input w-full"
                                placeholder="Örn: Mağaza Konumu"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--admin-muted)] mb-1">Harita Linki (URL)</label>
                            <input
                                type="text"
                                value={formData[activeTab].location_url}
                                onChange={(e) => handleChange("location_url", e.target.value)}
                                className="admin-input w-full text-xs font-mono"
                                placeholder="https://maps.google..."
                            />
                        </div>
                    </div>
                </div>

                {/* SAĞ: Banner İçeriği */}
                <div className={`border border-[var(--admin-border)] rounded-xl p-5 bg-[var(--admin-bg)]/30 ${!isBannerActive ? 'opacity-60 grayscale' : ''}`}>
                    <h3 className="text-md font-bold text-[var(--admin-fg)] mb-4 flex items-center gap-2 pb-2 border-b border-[var(--admin-border)]">
                        <FaBullhorn className="text-[var(--admin-warning)]" /> Promosyon Banner ({activeTab.toUpperCase()})
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--admin-muted)] mb-1">Promosyon Metni</label>
                            <textarea
                                rows={2}
                                value={formData[activeTab].promo_text}
                                onChange={(e) => handleChange("promo_text", e.target.value)}
                                className="admin-input w-full resize-none"
                                placeholder="Örn: %50 İndirim Başladı!"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--admin-muted)] mb-1">Buton Metni (CTA)</label>
                                <input
                                    type="text"
                                    value={formData[activeTab].promo_cta}
                                    onChange={(e) => handleChange("promo_cta", e.target.value)}
                                    className="admin-input w-full"
                                    placeholder="Örn: İncele"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--admin-muted)] mb-1">Yönlendirme Linki</label>
                                <input
                                    type="text"
                                    value={formData[activeTab].promo_url}
                                    onChange={(e) => handleChange("promo_url", e.target.value)}
                                    className="admin-input w-full"
                                    placeholder="/blog/..."
                                />
                            </div>
                        </div>

                        {!isBannerActive && (
                            <div className="mt-4 p-3 bg-[var(--admin-warning)]/10 text-[var(--admin-warning)] rounded border border-[var(--admin-warning)]/20 text-xs flex items-center gap-2">
                                ⚠️ Banner şu an pasif. Çevirileri düzenleyebilirsiniz ancak sitede görünmez.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}