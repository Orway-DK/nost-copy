"use client";

import React, { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";
import { SlPlus, SlTrash, SlCheck, SlGlobe, SlRefresh } from "react-icons/sl";
// Çeviri aksiyonunu import ediyoruz
import { translateTextAction } from "@/app/admin/actions";

const SECTIONS = [
    { key: "information", label: "Information (Sol Kolon)" },
    { key: "useful", label: "Useful Links (Orta Kolon)" },
    { key: "about", label: "About Us (Sağ Kolon)" },
];

const LANGUAGES = ["tr", "en", "de"] as const;
type LangCode = typeof LANGUAGES[number];

type FooterLink = {
    id: string; // State içinde ID her zaman string olacak
    section: string;
    url: string;
    sort_order: number;
    active: boolean;
    titles: Record<LangCode, string>;
};

export default function FooterSettingsPage() {
    const supabase = createSupabaseBrowserClient();
    const [links, setLinks] = useState<FooterLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeLang, setActiveLang] = useState<LangCode>("tr");

    // Çeviri işlemi durumunu takip eden state
    const [translating, setTranslating] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            // 1. Linkleri Çek
            const { data: rawLinks } = await supabase
                .from("footer_links")
                .select("*")
                .order("sort_order", { ascending: true });

            if (rawLinks) {
                // 2. Çevirileri Çek
                const { data: translations } = await supabase.from("footer_links_translations").select("*");

                // 3. Veriyi Birleştir
                const merged = rawLinks.map((l: any) => {
                    const tMap: Record<string, string> = { tr: "", en: "", de: "" };

                    translations?.filter((t: any) => t.link_id === l.id).forEach((t: any) => {
                        tMap[t.lang_code] = t.title || "";
                    });

                    // Fallback
                    if (!tMap.tr && l.title) tMap.tr = l.title;
                    if (!tMap.en && l.title) tMap.en = l.title;

                    return {
                        ...l,
                        id: l.id.toString(), // <--- KRİTİK DÜZELTME: ID'yi string yapıyoruz
                        titles: tMap
                    };
                });
                setLinks(merged);
            }
            setLoading(false);
        };
        load();
    }, []);

    const handleAdd = (section: string) => {
        const sectionLinks = links.filter(l => l.section === section);
        const newSort = sectionLinks.length > 0 ? Math.max(...sectionLinks.map(l => l.sort_order)) + 1 : 0;

        const newLink: FooterLink = {
            id: `temp-${Date.now()}`,
            section,
            url: "/",
            sort_order: newSort,
            active: true,
            titles: { tr: "", en: "", de: "" }
        };
        setLinks([...links, newLink]);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Silmek istediğinize emin misiniz?")) return;

        // id artık kesinlikle string olduğu için startsWith hata vermez
        if (!id.startsWith("temp-")) {
            await supabase.from("footer_links").delete().eq("id", id);
        }
        setLinks(prev => prev.filter(l => l.id !== id));
    };

    const handleGlobalChange = (id: string, field: keyof FooterLink, value: any) => {
        setLinks(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
    };

    const handleTitleChange = (id: string, value: string) => {
        setLinks(prev => prev.map(l =>
            l.id === id ? { ...l, titles: { ...l.titles, [activeLang]: value } } : l
        ));
    };

    // --- ÇEVİR & DAĞIT (Loading ikonlu) ---
    const handleDistributeLanguage = async () => {
        if (!confirm(`Şu anki (${activeLang.toUpperCase()}) başlıkları Google Translate ile diğer dillere çevirip dağıtmak istiyor musunuz?`)) return;

        setTranslating(true);
        const toastId = toast.loading("Çeviriler yapılıyor, lütfen bekleyin...");

        try {
            const updatedLinks = await Promise.all(links.map(async (link) => {
                const sourceText = link.titles[activeLang];
                // Başlık boşsa çeviri yapma
                if (!sourceText) return link;

                const newTitles = { ...link.titles };

                // Diğer diller için döngü
                for (const lang of LANGUAGES) {
                    if (lang !== activeLang) {
                        const res = await translateTextAction(sourceText, lang, activeLang);
                        newTitles[lang] = res.success ? res.text : sourceText;
                    }
                }

                return { ...link, titles: newTitles };
            }));

            setLinks(updatedLinks);
            toast.success("Çeviriler tamamlandı. Kaydetmeyi unutmayın!", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error("Çeviri sırasında bir hata oluştu.", { id: toastId });
        } finally {
            setTranslating(false);
        }
    };

    const handleSaveAll = async () => {
        const toastId = toast.loading("Kaydediliyor...");

        try {
            // 1. Ana Tabloyu Kaydet
            const globalUpserts = links.map(l => ({
                // String ID'yi kontrol et: "temp-" ise undefined, değilse int'e çevir
                id: l.id.startsWith("temp-") ? undefined : parseInt(l.id),
                section: l.section,
                title: l.titles.tr || l.titles.en,
                url: l.url,
                sort_order: l.sort_order,
                active: l.active
            }));

            const { data: savedLinks, error: linkError } = await supabase
                .from("footer_links")
                .upsert(globalUpserts)
                .select();

            if (linkError) throw linkError;

            // 2. Çevirileri Kaydet
            const translationUpserts: any[] = [];

            savedLinks.forEach(saved => {
                // Kaydedilen veriyi state'teki orijinal veriyle eşleştir
                const original = links.find(l =>
                    l.section === saved.section &&
                    l.sort_order === saved.sort_order &&
                    l.url === saved.url
                );

                if (original) {
                    LANGUAGES.forEach(lang => {
                        const title = original.titles[lang];
                        if (title) {
                            translationUpserts.push({
                                link_id: saved.id,
                                lang_code: lang,
                                title: title
                            });
                        }
                    });
                }
            });

            const { error: transError } = await supabase
                .from("footer_links_translations")
                .upsert(translationUpserts, { onConflict: "link_id, lang_code" });

            if (transError) throw transError;

            toast.success("Menüler güncellendi!", { id: toastId });
            window.location.reload();

        } catch (e: any) {
            toast.error(e.message, { id: toastId });
        }
    };

    if (loading) return <div className="text-center p-10 text-[var(--admin-muted)]">Yükleniyor...</div>;

    return (
        <div className="pb-20">
            {/* Header ve Dil Seçimi */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-[var(--admin-card)] p-4 rounded-xl border border-[var(--admin-card-border)] sticky top-2 z-20 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <SlGlobe /> Footer Menüleri
                    </h2>
                    <p className="admin-help">Linkleri ve çevirilerini buradan yönetin.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Dil Butonları */}
                    <div className="flex bg-[var(--admin-input-bg)] border border-[var(--admin-card-border)] rounded-lg p-1">
                        {LANGUAGES.map(lang => (
                            <button
                                key={lang}
                                onClick={() => setActiveLang(lang)}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold uppercase transition-all ${activeLang === lang
                                        ? "bg-[var(--admin-info)] text-white shadow-sm"
                                        : "text-[var(--admin-muted)] hover:text-[var(--admin-fg)]"
                                    }`}
                            >
                                {lang}
                            </button>
                        ))}
                    </div>

                    {/* Çevir & Dağıt Butonu */}
                    <button
                        onClick={handleDistributeLanguage}
                        disabled={translating}
                        className={`btn-admin border border-[var(--admin-card-border)] text-[var(--admin-accent)] hover:bg-[var(--admin-input-bg)] px-3 py-2 text-sm gap-2 transition-all ${translating ? 'opacity-70 cursor-wait' : ''}`}
                        title={`${activeLang.toUpperCase()} başlıklarını diğer dillere çevirip dağıt`}
                    >
                        <SlRefresh className={translating ? "animate-spin" : ""} />
                        <span className="hidden sm:inline">
                            {translating ? "Çevriliyor..." : "Çevir & Dağıt"}
                        </span>
                    </button>

                    <button onClick={handleSaveAll} disabled={translating} className="btn-admin btn-admin-primary gap-2 px-6">
                        <SlCheck /> Kaydet
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {SECTIONS.map((sec) => (
                    <div key={sec.key} className="card-admin flex flex-col h-full">
                        <h3 className="font-semibold border-b border-[var(--admin-card-border)] pb-3 mb-4 text-lg flex justify-between">
                            {sec.label}
                        </h3>

                        <div className="flex-1 space-y-3">
                            {links
                                .filter(l => l.section === sec.key)
                                .map((link, idx) => (
                                    <div key={link.id} className="flex flex-col gap-2 bg-[var(--admin-input-bg)] p-3 rounded-lg border border-[var(--admin-card-border)] group">

                                        {/* Başlık (Localized) */}
                                        <div className="flex items-center gap-2">
                                            <div className="relative flex-1">
                                                <input
                                                    className="admin-input py-1.5 px-3 text-sm font-semibold w-full pr-10"
                                                    placeholder={`Başlık (${activeLang.toUpperCase()})`}
                                                    value={link.titles[activeLang] || ""}
                                                    onChange={e => handleTitleChange(link.id, e.target.value)}
                                                />
                                                <span className="absolute right-2 top-2 text-[10px] uppercase font-bold text-[var(--admin-muted)] bg-[var(--admin-card)] border px-1 rounded pointer-events-none">
                                                    {activeLang}
                                                </span>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={link.active}
                                                onChange={e => handleGlobalChange(link.id, "active", e.target.checked)}
                                                className="w-5 h-5 accent-[var(--admin-success)] cursor-pointer"
                                                title="Aktif/Pasif"
                                            />
                                        </div>

                                        {/* URL (Global) */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono text-[var(--admin-muted)] bg-[var(--admin-card)] px-1.5 py-1 rounded border border-[var(--admin-card-border)]">
                                                URL
                                            </span>
                                            <input
                                                className="admin-input py-1 px-2 text-xs text-[var(--admin-muted)] flex-1 font-mono"
                                                placeholder="/sayfa-linki"
                                                value={link.url}
                                                onChange={e => handleGlobalChange(link.id, "url", e.target.value)}
                                            />
                                            <button
                                                onClick={() => handleDelete(link.id)}
                                                className="text-[var(--admin-muted)] hover:text-[var(--admin-danger)] p-1.5 rounded hover:bg-[var(--admin-bg)] transition"
                                                title="Sil"
                                            >
                                                <SlTrash />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                            {links.filter(l => l.section === sec.key).length === 0 && (
                                <div className="text-center text-sm text-[var(--admin-muted)] py-8 border-2 border-dashed border-[var(--admin-input-border)] rounded-lg">
                                    Bu alanda henüz link yok.
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => handleAdd(sec.key)}
                            className="mt-4 w-full py-2.5 border border-dashed border-[var(--admin-card-border)] rounded-lg text-[var(--admin-muted)] hover:bg-[var(--admin-input-bg)] hover:text-[var(--admin-fg)] transition text-sm flex items-center justify-center gap-2 font-medium"
                        >
                            <SlPlus /> Link Ekle
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}