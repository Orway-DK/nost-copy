// C:\Projeler\nost-copy\app\admin\(protected)\products\[id]\product-localizations.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveLocalizationsAction } from "../actions";
import { translateTextAction } from "@/app/admin/actions";
import { IoLanguage, IoSparkles, IoSave } from "react-icons/io5";

const LANGUAGES = [
    { code: "tr", label: "Türkçe" },
    { code: "en", label: "English" },
    { code: "de", label: "Deutsch" },
];

type LocalizationData = {
    id?: number;
    lang_code: string;
    name: string;
    description: string;
};

export default function ProductLocalizations({ productId, defaultName, defaultDescription, initialLocalizations }: any) {
    const router = useRouter();
    
    // --- STATE TANIMLARI (Eksik olanlar eklendi) ---
    const [saving, setSaving] = useState(false);
    const [translating, setTranslating] = useState(false); // EKLENDİ
    const [activeLang, setActiveLang] = useState("tr");
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null); // EKLENDİ

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
        setMsg(null);
        const payload = Object.values(data);
        const res = await saveLocalizationsAction(productId, payload);
        setSaving(false);
        
        if (res.success) {
            setMsg({ type: "success", text: "✅ " + res.message });
            router.refresh();
        } else {
            setMsg({ type: "error", text: "❌ " + res.message });
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
            setMsg({ type: "success", text: "Çeviri tamamlandı. Kaydetmeyi unutmayın." });
        } catch (e) {
            setMsg({ type: "error", text: "Çeviri sırasında hata oluştu." });
        } finally {
            setTranslating(false);
        }
    };

    // --- OTOMATİK DOLDURMA (Opsiyonel Buton) ---
    const handleAutoTranslate = async () => {
        if (!confirm("Mevcut dili kaynak alarak diğerlerini dolduracak. Emin misin?")) return;
        setTranslating(true);
        setMsg(null);

        const source = data[activeLang];
        const newData = { ...data };

        const targets = LANGUAGES.filter(l => l.code !== activeLang);

        try {
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
            setMsg({ type: "success", text: "Otomatik doldurma tamamlandı." });
        } catch (e) {
            setMsg({ type: "error", text: "Hata oluştu." });
        } finally {
            setTranslating(false);
        }
    };

    const current = data[activeLang];

    return (
        <div className="card-admin p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold" style={{ color: "var(--admin-fg)" }}>Çeviriler</h3>
                
                <div className="flex gap-2">
                    {/* Manuel Tetikleme Butonu */}
                    <button 
                        onClick={handleManualTranslate} 
                        disabled={translating}
                        className="btn-admin btn-admin-secondary text-xs flex items-center gap-2"
                        title="Aktif dilden diğerlerine çevir"
                    >
                        <IoSparkles className={translating ? "animate-spin text-yellow-500" : "text-yellow-500"} />
                        {translating ? "Çevriliyor..." : "Diğerlerine Dağıt"}
                    </button>
                </div>
            </div>

            {/* Mesaj Alanı */}
            {msg && (
                <div className={`p-3 rounded text-sm border ${
                    msg.type === 'success' 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                    {msg.text}
                </div>
            )}

            {/* TABS */}
            <div className="flex border-b" style={{ borderColor: "var(--admin-card-border)" }}>
                {LANGUAGES.map(l => (
                    <button
                        key={l.code}
                        onClick={() => setActiveLang(l.code)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            activeLang === l.code ? "border-[var(--admin-accent)] bg-[var(--admin-input-bg)]" : "border-transparent opacity-60"
                        }`}
                        style={{ color: activeLang === l.code ? "var(--admin-accent)" : "var(--admin-muted)" }}
                    >
                        {l.label}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                <div>
                    <label className="admin-label">Ürün Adı ({activeLang.toUpperCase()})</label>
                    <input 
                        className="admin-input" 
                        value={current.name || ""} 
                        onChange={e => handleChange("name", e.target.value)} 
                        placeholder="Ürün adı giriniz..."
                    />
                </div>
                <div>
                    <label className="admin-label">Açıklama ({activeLang.toUpperCase()})</label>
                    <textarea 
                        className="admin-textarea" 
                        rows={4} 
                        value={current.description || ""} 
                        onChange={e => handleChange("description", e.target.value)} 
                        placeholder="Açıklama giriniz..."
                    />
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t" style={{ borderColor: "var(--admin-card-border)" }}>
                <button onClick={handleSave} disabled={saving || translating} className="btn-admin btn-admin-primary px-6 flex items-center gap-2">
                    <IoSave />
                    {saving ? "Kaydediliyor..." : "Tümünü Kaydet"}
                </button>
            </div>
        </div>
    );
}