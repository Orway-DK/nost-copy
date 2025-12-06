// app/admin/(protected)/categories/[id]/category-localizations.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveCategoryLocalizationsAction } from "../actions";
import { autoTranslateAction } from "@/app/admin/(protected)/products/actions"; // Mock translate'i buradan kullanabiliriz
import { IoLanguage, IoSparkles, IoSave } from "react-icons/io5";

const LANGUAGES = [
    { code: "tr", label: "Türkçe" },
    { code: "en", label: "English" },
    { code: "de", label: "Deutsch" },
];

export default function CategoryLocalizations({ categoryId, defaultName, defaultDescription, initialLocalizations }: any) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [activeLang, setActiveLang] = useState("tr");

    // Veriyi hazırla
    const [data, setData] = useState<any>(() => {
        const map: any = {};
        LANGUAGES.forEach(l => {
            const found = initialLocalizations.find((x: any) => x.lang_code === l.code);
            map[l.code] = found || { lang_code: l.code, name: "", description: "" };
        });
        return map;
    });

    const handleChange = (field: string, val: string) => {
        setData((prev: any) => ({
            ...prev,
            [activeLang]: { ...prev[activeLang], [field]: val }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        const payload = Object.values(data);
        const res = await saveCategoryLocalizationsAction(categoryId, payload);
        setSaving(false);
        if (res.success) {
            alert("✅ " + res.message);
            router.refresh();
        } else {
            alert("❌ " + res.message);
        }
    };

    const handleAutoTranslate = async () => {
        if (!confirm("Mevcut dili kaynak alarak diğerlerini dolduracak. Emin misin?")) return;
        const source = data[activeLang];
        const newData = { ...data };

        for (const lang of LANGUAGES) {
            if (lang.code === activeLang) continue;
            // Mock translation action (daha önce product için yazdığımızı kullanıyoruz)
            if (source.name) {
                const tName = await autoTranslateAction(source.name, lang.code);
                newData[lang.code].name = tName.text;
            }
            if (source.description) {
                const tDesc = await autoTranslateAction(source.description, lang.code);
                newData[lang.code].description = tDesc.text;
            }
        }
        setData(newData);
    };

    const current = data[activeLang];

    return (
        <div className="card-admin p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold" style={{ color: "var(--admin-fg)" }}>Kategori Çevirileri</h3>
                <button onClick={handleAutoTranslate} className="btn-admin btn-admin-secondary text-xs flex items-center gap-2">
                    <IoSparkles className="text-yellow-500" /> Otomatik Doldur
                </button>
            </div>

            {/* Dil Sekmeleri */}
            <div className="flex border-b" style={{ borderColor: "var(--admin-card-border)" }}>
                {LANGUAGES.map(l => (
                    <button
                        key={l.code}
                        onClick={() => setActiveLang(l.code)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeLang === l.code ? "border-[var(--admin-accent)] bg-[var(--admin-input-bg)]" : "border-transparent opacity-60"
                            }`}
                        style={{ color: activeLang === l.code ? "var(--admin-accent)" : "var(--admin-muted)" }}
                    >
                        {l.label}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="admin-label">Kategori Adı</label>
                    <input
                        className="admin-input"
                        value={current.name}
                        onChange={e => handleChange("name", e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <label className="admin-label">Açıklama</label>
                    <textarea
                        className="admin-textarea"
                        rows={3}
                        value={current.description}
                        onChange={e => handleChange("description", e.target.value)}
                    />
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t" style={{ borderColor: "var(--admin-card-border)" }}>
                <button onClick={handleSave} disabled={saving} className="btn-admin btn-admin-primary px-6">
                    {saving ? "..." : "Tümünü Kaydet"}
                </button>
            </div>
        </div>
    );
}