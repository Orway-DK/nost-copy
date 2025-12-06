// app/admin/(protected)/why-us/why-us-form.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { IoSave, IoLanguage, IoImageOutline, IoInformationCircle } from "react-icons/io5";
import { updateWhyUsAction } from "./actions";

type Props = {
    initialBase: any;
    initialTranslations: any;
};

const defaultTransData = {
    badge_label: "",
    headline_prefix: "",
    headline_emphasis: "",
    headline_suffix: "",
    description: "",
    item1_title: "", item1_text: "",
    item2_title: "", item2_text: "",
    item3_title: "", item3_text: "",
};

export default function WhyUsForm({ initialBase, initialTranslations }: Props) {
    const [saving, setSaving] = useState(false);
    const [selectedLang, setSelectedLang] = useState<"tr" | "en" | "de">("tr");

    // State tanımları (Aynı)
    const [baseData, setBaseData] = useState({
        id: initialBase?.id,
        image1_url: initialBase?.image1_url || "",
        image2_url: initialBase?.image2_url || "",
        years_experience: initialBase?.years_experience || 1,
        badge_code: initialBase?.badge_code || "",
    });

    const [translations, setTranslations] = useState(() => {
        const state: any = {
            tr: { ...defaultTransData },
            en: { ...defaultTransData },
            de: { ...defaultTransData },
        };
        if (Array.isArray(initialTranslations)) {
            initialTranslations.forEach((t: any) => {
                if (["tr", "en", "de"].includes(t.lang_code)) {
                    state[t.lang_code] = { ...defaultTransData, ...t };
                }
            });
        }
        return state;
    });

    // Kaydetme Fonksiyonu
    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await updateWhyUsAction({ base: baseData, translations });
            if (res.success) {
                alert("✅ Güncellendi!");
                if (res.data?.id) setBaseData(prev => ({ ...prev, id: res.data.id }));
            } else {
                alert("❌ Hata: " + res.message);
            }
        } catch (e: any) {
            alert("Hata: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleBaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setBaseData((prev) => ({ ...prev, [name]: name === "years_experience" ? Number(value) : value }));
    };

    const handleTransChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setTranslations((prev: any) => ({
            ...prev,
            [selectedLang]: { ...prev[selectedLang], [name]: value },
        }));
    };

    return (
        <div className="grid gap-6 pb-20">
            {/* --- Header --- */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold" style={{ color: "var(--admin-fg)" }}>Why Us Yönetimi</h2>
                    <p className="text-sm" style={{ color: "var(--admin-muted)" }}>Anasayfa "Neden Biz" bölümünü düzenleyin.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-admin btn-admin-primary gap-2"
                >
                    <IoSave size={18} />
                    {saving ? "Kaydediliyor..." : "Kaydet"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* --- SOL KOLON: Görseller --- */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="card-admin space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2 border-b pb-2"
                            style={{ borderColor: "var(--admin-card-border)", color: "var(--admin-fg)" }}>
                            <IoImageOutline /> Genel Görseller
                        </h3>

                        <div>
                            <label className="admin-label">Deneyim Yılı</label>
                            <input
                                type="number"
                                name="years_experience"
                                value={baseData.years_experience}
                                onChange={handleBaseChange}
                                className="admin-input"
                            />
                        </div>

                        <div>
                            <label className="admin-label">Büyük Resim URL</label>
                            <input
                                type="text"
                                name="image1_url"
                                value={baseData.image1_url}
                                onChange={handleBaseChange}
                                className="admin-input mb-2"
                                placeholder="/images/..."
                            />
                            {baseData.image1_url && (
                                <div className="relative w-full h-32 rounded-lg overflow-hidden border"
                                    style={{ borderColor: "var(--admin-card-border)", backgroundColor: "var(--admin-input-bg)" }}>
                                    <Image src={baseData.image1_url} alt="p" fill className="object-contain" unoptimized />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="admin-label">Küçük Resim URL</label>
                            <input
                                type="text"
                                name="image2_url"
                                value={baseData.image2_url}
                                onChange={handleBaseChange}
                                className="admin-input mb-2"
                                placeholder="/images/..."
                            />
                            {baseData.image2_url && (
                                <div className="relative w-full h-32 rounded-lg overflow-hidden border"
                                    style={{ borderColor: "var(--admin-card-border)", backgroundColor: "var(--admin-input-bg)" }}>
                                    <Image src={baseData.image2_url} alt="p" fill className="object-contain" unoptimized />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="admin-label">Badge Kodu</label>
                            <input
                                type="text"
                                name="badge_code"
                                value={baseData.badge_code}
                                onChange={handleBaseChange}
                                className="admin-input"
                            />
                        </div>
                    </div>
                </div>

                {/* --- SAĞ KOLON: Çeviriler --- */}
                <div className="lg:col-span-2">
                    <div className="card-admin h-full">
                        <div className="flex items-center justify-between mb-6 border-b pb-4"
                            style={{ borderColor: "var(--admin-card-border)" }}>
                            <h3 className="text-lg font-medium flex items-center gap-2" style={{ color: "var(--admin-fg)" }}>
                                <IoLanguage /> İçerik Çevirileri
                            </h3>
                            <div className="flex gap-2">
                                {(["tr", "en", "de"] as const).map(lang => (
                                    <button
                                        key={lang}
                                        onClick={() => setSelectedLang(lang)}
                                        className="px-3 py-1 rounded text-sm font-medium transition-colors border"
                                        style={{
                                            backgroundColor: selectedLang === lang ? "var(--admin-accent)" : "var(--admin-input-bg)",
                                            color: selectedLang === lang ? "var(--admin-bg)" : "var(--admin-muted)", // Text-white yerine admin-bg (genelde açık renk)
                                            borderColor: selectedLang === lang ? "var(--admin-accent)" : "var(--admin-card-border)"
                                        }}
                                    >
                                        {lang.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="admin-label">Badge Label</label>
                                <input
                                    name="badge_label"
                                    value={translations[selectedLang].badge_label}
                                    onChange={handleTransChange}
                                    className="admin-input"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="admin-label">Ana Başlık</label>
                                <div className="flex flex-col md:flex-row gap-2">
                                    <input name="headline_prefix" value={translations[selectedLang].headline_prefix} onChange={handleTransChange} className="admin-input flex-1" placeholder="Prefix" />
                                    <input
                                        name="headline_emphasis"
                                        value={translations[selectedLang].headline_emphasis}
                                        onChange={handleTransChange}
                                        className="admin-input flex-1 font-bold"
                                        style={{ color: "var(--admin-accent)" }}
                                        placeholder="Emphasis"
                                    />
                                    <input name="headline_suffix" value={translations[selectedLang].headline_suffix} onChange={handleTransChange} className="admin-input flex-1" placeholder="Suffix" />
                                </div>
                            </div>

                            <div>
                                <label className="admin-label">Açıklama</label>
                                <textarea
                                    name="description"
                                    rows={3}
                                    value={translations[selectedLang].description}
                                    onChange={handleTransChange}
                                    className="admin-textarea"
                                />
                            </div>

                            <div className="pt-4 border-t" style={{ borderColor: "var(--admin-card-border)" }}>
                                <div className="flex items-center gap-2 font-medium mb-4" style={{ color: "var(--admin-accent)" }}>
                                    <IoInformationCircle />
                                    <span>Özellik Maddeleri</span>
                                </div>

                                <div className="grid gap-4">
                                    {[1, 2, 3].map(num => (
                                        <div key={num} className="p-4 rounded-lg border"
                                            style={{ backgroundColor: "var(--admin-input-bg)", borderColor: "var(--admin-input-border)" }}>
                                            <span className="text-xs font-semibold uppercase mb-2 block" style={{ color: "var(--admin-muted)" }}>Madde {num}</span>
                                            <div className="grid gap-3">
                                                {/* @ts-ignore */}
                                                <input name={`item${num}_title`} value={translations[selectedLang][`item${num}_title`]} onChange={handleTransChange} className="admin-input font-medium" placeholder="Başlık" />
                                                {/* @ts-ignore */}
                                                <input name={`item${num}_text`} value={translations[selectedLang][`item${num}_text`]} onChange={handleTransChange} className="admin-input text-sm" placeholder="Açıklama" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}