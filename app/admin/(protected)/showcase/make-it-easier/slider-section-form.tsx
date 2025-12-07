"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { saveSliderPartAction } from "./actions";
import { translateTextAction } from "@/app/admin/actions"; // Çeviri action
import { IoSave, IoAdd, IoTrash, IoSparkles } from "react-icons/io5"; // İkonlar
import MediaPickerModal from "@/app/admin/(protected)/_components/MediaPickerModal";
import { toast } from "react-hot-toast";

const LANGS = ["tr", "en", "de"];

const getImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("/")) return path;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sliders/${path}`;
};

export default function SliderSectionForm({ initialData }: { initialData: any }) {
    const router = useRouter();
    const [activeLang, setActiveLang] = useState("tr");
    const [saving, setSaving] = useState(false);
    const [translating, setTranslating] = useState(false); // Çeviri durumu
    const [isMediaOpen, setIsMediaOpen] = useState(false);

    // Form State (Image links JSON array parse)
    const [form, setForm] = useState(() => {
        let links: string[] = [];
        try {
            links = typeof initialData?.image_links === "string" 
                ? JSON.parse(initialData.image_links) 
                : (initialData?.image_links || []);
        } catch { links = []; }

        const translations = LANGS.map(l => {
            const found = initialData?.make_it_easier_slider_translations?.find((t: any) => t.lang_code === l);
            return {
                lang_code: l,
                id: found?.id,
                title: found?.title || "",
                text: found?.text || "",
                button_name: found?.button_name || "",
                button_link: found?.button_link || "",
            };
        });

        return {
            id: initialData?.id,
            image_links: links,
            translations
        };
    });

    const currentTrans = form.translations.find(t => t.lang_code === activeLang)!;

    const updateTrans = (key: string, val: any) => {
        setForm(prev => ({
            ...prev,
            translations: prev.translations.map(t => 
                t.lang_code === activeLang ? { ...t, [key]: val } : t
            )
        }));
    };

    const addImage = (url: string) => {
        setForm(prev => ({ ...prev, image_links: [...prev.image_links, url] }));
    };

    const removeImage = (index: number) => {
        setForm(prev => ({ ...prev, image_links: prev.image_links.filter((_, i) => i !== index) }));
    };

    // --- OTOMATİK ÇEVİRİ ---
    const handleAutoTranslate = async () => {
        // Kaynak veri kontrolü
        if (!currentTrans.title && !currentTrans.text) {
            toast.error(`Lütfen önce ${activeLang.toUpperCase()} içeriğini doldurun.`);
            return;
        }

        if (!confirm(`Mevcut (${activeLang.toUpperCase()}) içerik kaynak alınarak diğer diller otomatik doldurulacak. Onaylıyor musunuz?`)) return;

        setTranslating(true);
        const loadingToast = toast.loading("Çeviriler yapılıyor...");

        try {
            const newTranslations = [...form.translations];
            
            // Çevrilecek metin alanları
            const textFields = ['title', 'text', 'button_name'];

            const tasks = newTranslations.map(async (target, index) => {
                if (target.lang_code === activeLang) return;

                for (const field of textFields) {
                    // @ts-ignore
                    const sourceText = currentTrans[field];
                    if (sourceText && sourceText.trim() !== "") {
                        const res = await translateTextAction(sourceText, target.lang_code, activeLang);
                        if (res.success && res.text) {
                            // @ts-ignore
                            newTranslations[index][field] = res.text;
                        }
                    }
                }
                
                // Linkler genellikle çevrilmez ama kopyalanmasını istersen:
                if (currentTrans.button_link && !newTranslations[index].button_link) {
                    newTranslations[index].button_link = currentTrans.button_link;
                }
            });

            await Promise.all(tasks);

            setForm(prev => ({ ...prev, translations: newTranslations }));
            toast.success("Çeviriler tamamlandı!", { id: loadingToast });
        } catch (error) {
            console.error(error);
            toast.error("Çeviri sırasında hata oluştu.", { id: loadingToast });
        } finally {
            setTranslating(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        const promise = saveSliderPartAction(form);
        
        toast.promise(promise, {
            loading: 'Kaydediliyor...',
            success: (res) => {
                if (!res.success) throw new Error(res.message);
                router.refresh();
                return res.message;
            },
            error: (err) => err.message
        });

        try { await promise; } finally { setSaving(false); }
    };

    return (
        <div className="card-admin p-6 space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center border-b pb-4 gap-4" style={{ borderColor: "var(--admin-card-border)" }}>
                <h3 className="font-semibold text-lg" style={{ color: "var(--admin-fg)" }}>Kampanya & Slider İçeriği</h3>
                
                <div className="flex items-center gap-3">
                    {/* AUTO TRANSLATE BUTONU (Header'a da koyabiliriz veya dil tablarının yanına) */}
                    {/* Burada dil tablarının hemen üstünde veya yanında durabilir, aşağıda dil tablarının yanına koydum */}
                </div>

                <button onClick={handleSave} disabled={saving} className="btn-admin btn-admin-primary px-6 gap-2">
                    <IoSave /> Kaydet
                </button>
            </div>

            {/* Çeviri Alanı */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                        {LANGS.map(l => (
                            <button key={l} onClick={() => setActiveLang(l)}
                                className={`px-4 py-2 text-sm font-bold rounded transition-colors ${
                                    activeLang === l 
                                        ? "bg-[var(--admin-accent)] text-[var(--admin-bg)]" 
                                        : "bg-[var(--admin-input-bg)] text-[var(--admin-muted)]"
                                }`}>
                                {l.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    {/* AUTO TRANSLATE BUTONU */}
                    <button 
                        onClick={handleAutoTranslate} 
                        disabled={translating}
                        className="btn-admin btn-admin-secondary text-xs py-2 px-3 flex items-center gap-2"
                        title={`Mevcut (${activeLang.toUpperCase()}) içeriği diğer dillere çevir`}
                    >
                        <IoSparkles className={translating ? "animate-spin text-yellow-500" : "text-yellow-500"} />
                        {translating ? "Çevriliyor..." : "Diğerlerine Dağıt"}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="admin-label">Başlık</label>
                            <input className="admin-input" value={currentTrans.title} onChange={e => updateTrans("title", e.target.value)} />
                        </div>
                        <div>
                            <label className="admin-label">Metin</label>
                            <textarea className="admin-textarea h-32" value={currentTrans.text} onChange={e => updateTrans("text", e.target.value)} />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="admin-label">Buton Metni</label>
                            <input className="admin-input" value={currentTrans.button_name} onChange={e => updateTrans("button_name", e.target.value)} />
                        </div>
                        <div>
                            <label className="admin-label">Buton Linki</label>
                            <input className="admin-input" value={currentTrans.button_link} onChange={e => updateTrans("button_link", e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Slider Görselleri */}
            <div className="pt-6 border-t" style={{ borderColor: "var(--admin-card-border)" }}>
                <div className="flex justify-between items-center mb-4">
                    <label className="admin-label text-base font-semibold">Slider Görselleri</label>
                    <button onClick={() => setIsMediaOpen(true)} className="btn-admin btn-admin-secondary text-sm gap-2">
                        <IoAdd /> Görsel Ekle
                    </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                    {form.image_links.map((link, idx) => {
                        const url = getImageUrl(link);
                        return (
                            <div key={idx} className="relative aspect-square rounded-lg border overflow-hidden group bg-[var(--admin-input-bg)]"
                                 style={{ borderColor: "var(--admin-input-border)" }}>
                                {url ? (
                                    <Image src={url} alt="slider" fill className="object-cover" unoptimized />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs opacity-50">Hata</div>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button onClick={() => removeImage(idx)} className="text-white hover:text-red-400 p-2">
                                        <IoTrash size={20} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {form.image_links.length === 0 && (
                        <div className="col-span-full py-8 text-center text-[var(--admin-muted)] border border-dashed rounded-lg"
                             style={{ borderColor: "var(--admin-input-border)" }}>
                            Henüz görsel eklenmemiş.
                        </div>
                    )}
                </div>
            </div>

            <MediaPickerModal
                isOpen={isMediaOpen}
                onClose={() => setIsMediaOpen(false)}
                onSelect={(url) => addImage(url)}
                bucketName="sliders" // veya "homepage"
            />
        </div>
    );
}