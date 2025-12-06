// app/admin/(protected)/landing/_components/SlidesManager.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { upsertSlideAction, deleteSlideAction } from "../actions";
import { IoAdd, IoPencil, IoTrash, IoClose, IoSave, IoImageOutline } from "react-icons/io5";
import MediaPickerModal from "@/app/admin/(protected)/_components/MediaPickerModal";

const LANGS = ["tr", "en", "de"];

// YARDIMCI: Image URL
const getImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("/")) return path;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sliders/${path}`;
};

export default function SlidesManager({ initialSlides }: { initialSlides: any[] }) {
    const router = useRouter();
    const [editing, setEditing] = useState<any | null>(null);
    const [isMediaOpen, setIsMediaOpen] = useState(false);
    const [activeLang, setActiveLang] = useState("tr");
    const [saving, setSaving] = useState(false);

    // Yeni Ekleme
    const handleAddNew = () => {
        setEditing({
            id: null,
            image_link: "",
            order_no: initialSlides.length + 1,
            active: true,
            translations: LANGS.map(l => ({ lang_code: l, title1: "", title2: "", text: "", button_link: "", tips: [] }))
        });
    };

    // Düzenleme Moduna Geç
    const handleEdit = (slide: any) => {
        const transMap: any = {};
        slide.landing_slide_translations.forEach((t: any) => transMap[t.lang_code] = t);

        const translations = LANGS.map(l => ({
            lang_code: l,
            id: transMap[l]?.id,
            title1: transMap[l]?.title1 || "",
            title2: transMap[l]?.title2 || "",
            text: transMap[l]?.text || "",
            button_link: transMap[l]?.button_link || "",
            tips: transMap[l]?.tips || []
        }));

        setEditing({ ...slide, translations });
    };

    // Kaydet
    const handleSave = async () => {
        if (!editing) return;
        setSaving(true);

        const res = await upsertSlideAction(editing);
        setSaving(false);

        if (res.success) {
            setEditing(null);
            router.refresh();
        } else {
            alert("Hata: " + res.message);
        }
    };

    // Sil
    const handleDelete = async (id: number) => {
        if (!confirm("Silmek istediğinize emin misiniz?")) return;
        const res = await deleteSlideAction(id);
        if (res.success) router.refresh();
        else alert(res.message);
    };

    // Form Helper
    const updateMain = (k: string, v: any) => setEditing({ ...editing, [k]: v });
    const updateTrans = (lang: string, k: string, v: any) => {
        const newTrans = editing.translations.map((t: any) =>
            t.lang_code === lang ? { ...t, [k]: v } : t
        );
        setEditing({ ...editing, translations: newTrans });
    };
    const updateTips = (lang: string, val: string) => {
        const arr = val.split("\n"); // Boş satırları koruyabiliriz veya filter ile atabiliriz
        updateTrans(lang, "tips", arr);
    };

    // --- FORM VIEW ---
    if (editing) {
        const tData = editing.translations.find((t: any) => t.lang_code === activeLang);
        const imgUrl = getImageUrl(editing.image_link);

        return (
            <div className="card-admin p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center border-b pb-4" style={{ borderColor: "var(--admin-card-border)" }}>
                    <h3 className="text-lg font-bold" style={{ color: "var(--admin-fg)" }}>
                        {editing.id ? "Slayt Düzenle" : "Yeni Slayt"}
                    </h3>
                    <button onClick={() => setEditing(null)} style={{ color: "var(--admin-muted)" }}>
                        <IoClose size={24} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Görsel */}
                    <div className="space-y-2">
                        <label className="admin-label">Görsel</label>
                        <div className="flex gap-2">
                            <input className="admin-input flex-1" value={editing.image_link} readOnly placeholder="Dosya seçin..." />
                            <button onClick={() => setIsMediaOpen(true)} className="btn-admin btn-admin-secondary">Seç</button>
                        </div>
                        <div className="relative h-48 w-full rounded-lg border mt-2 flex items-center justify-center bg-[var(--admin-input-bg)] overflow-hidden"
                            style={{ borderColor: "var(--admin-input-border)" }}>
                            {imgUrl ? (
                                <Image src={imgUrl} alt="preview" fill className="object-cover" unoptimized />
                            ) : (
                                <IoImageOutline size={40} className="opacity-20" />
                            )}
                        </div>
                    </div>

                    {/* Ayarlar */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="admin-label">Sıra</label>
                                <input type="number" className="admin-input" value={editing.order_no}
                                    onChange={e => updateMain("order_no", parseInt(e.target.value))} />
                            </div>
                            <div>
                                <label className="admin-label">Durum</label>
                                <select className="admin-select" value={editing.active ? "true" : "false"}
                                    onChange={e => updateMain("active", e.target.value === "true")}>
                                    <option value="true">Aktif</option>
                                    <option value="false">Pasif</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Çeviri */}
                <div className="border rounded-lg p-4" style={{ backgroundColor: "var(--admin-input-bg)", borderColor: "var(--admin-card-border)" }}>
                    <div className="flex gap-2 border-b mb-4" style={{ borderColor: "var(--admin-card-border)" }}>
                        {LANGS.map(l => (
                            <button key={l} onClick={() => setActiveLang(l)}
                                className={`px-4 py-2 text-sm font-bold transition-colors border-b-2 ${activeLang === l ? "border-[var(--admin-accent)] text-[var(--admin-accent)]" : "border-transparent text-[var(--admin-muted)]"
                                    }`}>
                                {l.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="admin-label">Başlık 1 (Büyük)</label>
                            <input className="admin-input" value={tData.title1} onChange={e => updateTrans(activeLang, "title1", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="admin-label">Başlık 2 (İnce)</label>
                            <input className="admin-input" value={tData.title2} onChange={e => updateTrans(activeLang, "title2", e.target.value)} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="admin-label">Açıklama</label>
                            <textarea className="admin-textarea h-20" value={tData.text} onChange={e => updateTrans(activeLang, "text", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="admin-label">Buton Linki</label>
                            <input className="admin-input" value={tData.button_link} onChange={e => updateTrans(activeLang, "button_link", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="admin-label">İpuçları (Her satıra bir tane)</label>
                            <textarea className="admin-textarea h-24 font-mono text-sm"
                                value={tData.tips.join("\n")}
                                onChange={e => updateTips(activeLang, e.target.value)}
                                placeholder="Örn: Hızlı Kargo&#10;Kaliteli Baskı"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 gap-3">
                    <button onClick={() => setEditing(null)} className="btn-admin btn-admin-secondary">İptal</button>
                    <button onClick={handleSave} disabled={saving} className="btn-admin btn-admin-primary px-8 flex items-center gap-2">
                        <IoSave /> {saving ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                </div>

                <MediaPickerModal
                    isOpen={isMediaOpen}
                    onClose={() => setIsMediaOpen(false)}
                    onSelect={(url) => updateMain("image_link", url)}
                    bucketName="sliders"
                />
            </div>
        );
    }

    // --- LIST VIEW ---
    return (
        <div className="space-y-4">
            <button onClick={handleAddNew} className="btn-admin btn-admin-primary flex items-center gap-2">
                <IoAdd /> Yeni Slayt Ekle
            </button>

            <div className="grid gap-4">
                {initialSlides.map(slide => {
                    const imgUrl = getImageUrl(slide.image_link);
                    return (
                        <div key={slide.id} className="flex items-center gap-4 card-admin p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="relative w-32 h-20 bg-[var(--admin-input-bg)] rounded overflow-hidden flex-shrink-0 border"
                                style={{ borderColor: "var(--admin-card-border)" }}>
                                {imgUrl ? (
                                    <Image src={imgUrl} alt="" fill className="object-cover" unoptimized />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center opacity-20"><IoImageOutline size={24} /></div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-sm" style={{ color: "var(--admin-fg)" }}>Sıra: {slide.order_no}</div>
                                <div className="text-xs truncate max-w-md" style={{ color: "var(--admin-muted)" }}>
                                    {slide.landing_slide_translations?.find((t: any) => t.lang_code === 'tr')?.title1 || "(Başlık Yok)"}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(slide)} className="btn-admin btn-admin-secondary p-2"><IoPencil /></button>
                                <button onClick={() => handleDelete(slide.id)} className="btn-admin btn-admin-danger p-2"><IoTrash /></button>
                            </div>
                        </div>
                    );
                })}
                {initialSlides.length === 0 && <p className="text-center py-8 opacity-50">Henüz slayt yok.</p>}
            </div>
        </div>
    );
}