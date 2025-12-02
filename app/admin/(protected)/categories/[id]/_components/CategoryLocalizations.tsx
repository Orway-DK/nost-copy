// orway-dk/nost-copy/nost-copy-d541a3f124d8a8bc7c3eeea745918156697a239e/app/admin/(protected)/categories/[id]/_components/CategoryLocalizations.tsx
"use client";

import { useEffect, useState, useRef } from "react";
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

export default function CategoryLocalizations({
    categoryId,
    defaultName,
    defaultDescription // EKLENDİ
}: {
    categoryId: number;
    defaultName: string;
    defaultDescription: string;
}) {
    const [data, setData] = useState<Record<string, LocalizationData>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [translating, setTranslating] = useState(false);
    const [activeLang, setActiveLang] = useState("tr");
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const initRef = useRef(false);

    useEffect(() => {
        if (initRef.current) return;
        initRef.current = true;

        const initLoad = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/admin/categories/${categoryId}/localizations`);
                const json = await res.json();

                const dbData: Record<string, LocalizationData> = {};
                let hasDbEntry = false;

                if (json.data && Array.isArray(json.data) && json.data.length > 0) {
                    hasDbEntry = true;
                    json.data.forEach((item: any) => {
                        dbData[item.lang_code] = {
                            id: item.id,
                            lang_code: item.lang_code,
                            name: item.name || "",
                            description: item.description || ""
                        };
                    });
                    setData(dbData);
                }

                // Otomatik Çeviri Başlat
                if (!hasDbEntry && defaultName) {
                    setTranslating(true);
                    setMsg({ type: 'success', text: "Sistemde kayıt yok, otomatik çeviri yapılıyor..." });

                    const autoData: Record<string, LocalizationData> = {};

                    const promises = LANGUAGES.map(async (lang) => {
                        let translatedName = defaultName;
                        let translatedDesc = defaultDescription || "";

                        try {
                            // İsim Çevirisi
                            const resName = await fetch("/api/admin/translate", {
                                method: "POST",
                                body: JSON.stringify({ text: defaultName, targetLang: lang.code, sourceLang: "auto" })
                            });
                            const jsonName = await resName.json();
                            if (jsonName.text) translatedName = jsonName.text;

                            // Açıklama Çevirisi
                            if (defaultDescription) {
                                const resDesc = await fetch("/api/admin/translate", {
                                    method: "POST",
                                    body: JSON.stringify({ text: defaultDescription, targetLang: lang.code, sourceLang: "auto" })
                                });
                                const jsonDesc = await resDesc.json();
                                if (jsonDesc.text) translatedDesc = jsonDesc.text;
                            }

                        } catch (err) {
                            console.error(`Auto translate error for ${lang.code}:`, err);
                        }

                        return {
                            lang_code: lang.code,
                            name: translatedName,
                            description: translatedDesc
                        };
                    });

                    const results = await Promise.all(promises);
                    results.forEach(item => {
                        autoData[item.lang_code] = item;
                    });

                    setData(autoData);
                    setTranslating(false);
                    setMsg({ type: 'success', text: "Otomatik çeviri tamamlandı. Kaydetmeyi unutmayın." });
                }

            } catch (e) {
                console.error(e);
                setMsg({ type: 'error', text: "Veriler yüklenirken hata oluştu." });
            } finally {
                setLoading(false);
            }
        };

        initLoad();
    }, [categoryId, defaultName, defaultDescription]);

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

            for (const lang of targets) {
                const current = newData[lang.code] || { lang_code: lang.code, name: "", description: "" };

                if (sourceData.name) {
                    const res = await fetch("/api/admin/translate", {
                        method: "POST",
                        body: JSON.stringify({ text: sourceData.name, targetLang: lang.code, sourceLang: activeLang })
                    });
                    const j = await res.json();
                    if (j.text) current.name = j.text;
                }

                if (sourceData.description) {
                    const res = await fetch("/api/admin/translate", {
                        method: "POST",
                        body: JSON.stringify({ text: sourceData.description, targetLang: lang.code, sourceLang: activeLang })
                    });
                    const j = await res.json();
                    if (j.text) current.description = j.text;
                }

                newData[lang.code] = current;
            }

            setData(newData);
            setMsg({ type: "success", text: "Çeviri tamamlandı." });
        } catch (e) {
            setMsg({ type: "error", text: "Çeviri hatası." });
        } finally {
            setTranslating(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMsg(null);

        const payload = LANGUAGES.map(lang => {
            const existing = data[lang.code];
            return {
                lang_code: lang.code,
                name: existing?.name || "",
                description: existing?.description || "",
                id: existing?.id
            };
        });

        try {
            const res = await fetch(`/api/admin/categories/${categoryId}/localizations`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ localizations: payload }),
            });

            if (!res.ok) throw new Error("Kaydedilemedi");

            const json = await res.json();
            if (json.data) {
                const map: Record<string, LocalizationData> = {};
                json.data.forEach((item: any) => {
                    map[item.lang_code] = { ...item };
                });
                setData(map);
            }
            setMsg({ type: 'success', text: "Tüm değişiklikler kaydedildi." });

        } catch (e: any) {
            setMsg({ type: 'error', text: e.message || "Hata oluştu." });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field: 'name' | 'description', val: string) => {
        setData(prev => ({
            ...prev,
            [activeLang]: {
                ...prev[activeLang],
                lang_code: activeLang,
                [field]: val
            }
        }));
    };

    if (loading) return <div className="p-6 text-center text-admin-muted">Veriler kontrol ediliyor...</div>;

    const currentData = data[activeLang] || { name: "", description: "" };

    return (
        <div className="card-admin p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <IoLanguage /> Çeviri Yönetimi
                </h3>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleManualTranslate}
                        disabled={translating}
                        className="btn-admin btn-admin-secondary text-xs py-2 px-3 flex items-center gap-2"
                    >
                        <IoSparkles className={translating ? "animate-spin" : "text-yellow-500"} />
                        {translating ? "İşleniyor..." : "Diğerlerine Dağıt"}
                    </button>
                </div>
            </div>

            {msg && (
                <div className={`text-sm font-medium px-4 py-2 rounded border ${msg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                    {msg.text}
                </div>
            )}

            <div className="flex space-x-2 border-b border-admin-border pb-1">
                {LANGUAGES.map(lang => (
                    <button
                        key={lang.code}
                        onClick={() => setActiveLang(lang.code)}
                        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${activeLang === lang.code
                                ? "bg-admin-input-bg text-blue-600 border-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        {lang.label}
                    </button>
                ))}
            </div>

            <div className="space-y-4 animate-in fade-in">
                <div className="space-y-2">
                    <label className="admin-label">Kategori Adı ({activeLang.toUpperCase()})</label>
                    <input
                        className="admin-input"
                        value={currentData.name || ""}
                        onChange={e => handleChange("name", e.target.value)}
                        placeholder={`${activeLang.toUpperCase()} kategori adı`}
                    />
                </div>
                <div className="space-y-2">
                    <label className="admin-label">Açıklama / Meta ({activeLang.toUpperCase()})</label>
                    <textarea
                        className="admin-textarea min-h-[100px]"
                        value={currentData.description || ""}
                        onChange={e => handleChange("description", e.target.value)}
                        placeholder="Opsiyonel açıklama"
                    />
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-admin-border">
                <button
                    onClick={handleSave}
                    disabled={saving || translating}
                    className="btn-admin btn-admin-primary px-6 flex items-center gap-2"
                >
                    <IoSave />
                    {saving ? "Kaydediliyor..." : "Tüm Dilleri Kaydet"}
                </button>
            </div>
        </div>
    );
}