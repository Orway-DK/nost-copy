// app/admin/(protected)/products/[id]/product-localizations.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveLocalizationsAction } from "../actions";
import { translateTextAction } from "@/app/admin/actions"; // YENİ ACTION
import { IoLanguage, IoSparkles, IoSave } from "react-icons/io5";

const LANGUAGES = [
    { code: "tr", label: "Türkçe" },
    { code: "en", label: "English" },
    { code: "de", label: "Deutsch" },
];

export default function ProductLocalizations({ productId, defaultName, defaultDescription, initialLocalizations }: any) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [activeLang, setActiveLang] = useState("tr");

    // Veriyi state'e alıp düzenlenebilir yapıyoruz
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
        const res = await saveLocalizationsAction(productId, payload);
        setSaving(false);
        if (res.success) {
            alert("✅ " + res.message);
            router.refresh();
        } else {
            alert("❌ " + res.message);
        }
    };

    const handleManualTranslate = async () => {
        const sourceData = data[activeLang];
        if (!sourceData || (!sourceData.name && !sourceData.description)) {
            alert(`Lütfen önce ${activeLang.toUpperCase()} verilerini doldurun.`);
            return;
        }

        if (!confirm(`${activeLang.toUpperCase()} içeriği baz alınarak diğer diller doldurulacak.`)) return;

        setTranslating(true);
        setMsg(null);

        try {
            const newData = { ...data };
            const targets = LANGUAGES.filter(l => l.code !== activeLang);

            // Paralel çeviri için Promise.all kullanıyoruz (Daha hızlı)
            await Promise.all(targets.map(async (lang) => {
                const current = newData[lang.code] || { lang_code: lang.code, name: "", description: "" };

                // İsim Çevirisi
                if (sourceData.name) {
                    const res = await translateTextAction(sourceData.name, lang.code, activeLang);
                    if (res.success && res.text) current.name = res.text;
                }

                // Açıklama Çevirisi
                if (sourceData.description) {
                    const res = await translateTextAction(sourceData.description, lang.code, activeLang);
                    if (res.success && res.text) current.description = res.text;
                }

                newData[lang.code] = current;
            }));

            setData(newData);
            setMsg({ type: "success", text: "Çeviri tamamlandı." });
        } catch (e) {
            setMsg({ type: "error", text: "Çeviri sırasında hata oluştu." });
        } finally {
            setTranslating(false);
        }
    };

    // --- OTOMATİK DOLDURMA (useEffect içindeki mantık veya buton) ---
    // Eğer "Otomatik Doldur" butonu kullanıyorsan:
    const handleAutoTranslate = async () => {
        if (!confirm("Mevcut dili kaynak alarak diğerlerini dolduracak. Emin misin?")) return;
        setTranslating(true);

        const source = data[activeLang];
        const newData = { ...data };

        const targets = LANGUAGES.filter(l => l.code !== activeLang);

        await Promise.all(targets.map(async (lang) => {
            // İsim
            if (source.name) {
                const res = await translateTextAction(source.name, lang.code, activeLang);
                if (res.success) newData[lang.code].name = res.text;
            }
            // Açıklama
            if (source.description) {
                const res = await translateTextAction(source.description, lang.code, activeLang);
                if (res.success) newData[lang.code].description = res.text;
            }
        }));

        setData(newData);
        setTranslating(false);
    };

    const current = data[activeLang];

    return (
        <div className="card-admin p-6 space-y-6">
            <div className="flex justify-between">
                <h3 className="text-lg font-semibold" style={{ color: "var(--admin-fg)" }}>Çeviriler</h3>
                <button onClick={handleAutoTranslate} className="btn-admin btn-admin-secondary text-xs flex items-center gap-2">
                    <IoSparkles className="text-yellow-500" /> Otomatik Doldur
                </button>
            </div>

            {/* TABS */}
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
                <div>
                    <label className="admin-label">Ürün Adı</label>
                    <input className="admin-input" value={current.name} onChange={e => handleChange("name", e.target.value)} />
                </div>
                <div>
                    <label className="admin-label">Açıklama</label>
                    <textarea className="admin-textarea" rows={4} value={current.description} onChange={e => handleChange("description", e.target.value)} />
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t" style={{ borderColor: "var(--admin-card-border)" }}>
                <button onClick={handleSave} disabled={saving} className="btn-admin btn-admin-primary px-6">
                    {saving ? "..." : "Kaydet"}
                </button>
            </div>
        </div>
    );
}