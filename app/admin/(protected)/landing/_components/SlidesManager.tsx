"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { IoAdd, IoPencil, IoTrash, IoClose, IoSave } from "react-icons/io5";
import MediaPickerModal from "@/app/admin/(protected)/_components/MediaPickerModal";

const LANGS = ["tr", "en", "de"];

export default function SlidesManager() {
    const [slides, setSlides] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<any | null>(null); // Düzenlenen slide
    const [isMediaOpen, setIsMediaOpen] = useState(false);
    const [activeLang, setActiveLang] = useState("tr");

    // Fetch
    const loadData = async () => {
        setLoading(true);
        const res = await fetch("/api/admin/landing/slides");
        const json = await res.json();
        setSlides(json.data || []);
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    // Helper: Boş form oluştur
    const createEmpty = () => ({
        id: null,
        image_link: "",
        order_no: slides.length + 1,
        active: true,
        translations: LANGS.map(l => ({ lang_code: l, title1: "", title2: "", text: "", button_link: "", tips: [] }))
    });

    // Helper: Mevcut datayı form formatına çevir (API'den gelen veriyi işle)
    const prepareForEdit = (slide: any) => {
        const transMap: any = {};
        slide.landing_slide_translations.forEach((t: any) => transMap[t.lang_code] = t);

        const translations = LANGS.map(l => ({
            lang_code: l,
            id: transMap[l]?.id,
            title1: transMap[l]?.title1 || "",
            title2: transMap[l]?.title2 || "",
            text: transMap[l]?.text || "",
            button_link: transMap[l]?.button_link || "",
            // Tips DB'de JSON, formda string array olarak kalsın ama inputta textarea kullanacağız
            tips: transMap[l]?.tips || []
        }));

        setEditing({ ...slide, translations });
    };

    const handleSave = async () => {
        if (!editing) return;

        const method = editing.id ? "PATCH" : "POST";
        const url = editing.id ? `/api/admin/landing/slides/${editing.id}` : "/api/admin/landing/slides";

        await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editing)
        });

        setEditing(null);
        loadData();
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Silmek istediğinize emin misiniz?")) return;
        await fetch(`/api/admin/landing/slides/${id}`, { method: "DELETE" });
        loadData();
    };

    // Form Update Helpers
    const updateMain = (k: string, v: any) => setEditing({ ...editing, [k]: v });

    const updateTrans = (lang: string, k: string, v: any) => {
        const newTrans = editing.translations.map((t: any) =>
            t.lang_code === lang ? { ...t, [k]: v } : t
        );
        setEditing({ ...editing, translations: newTrans });
    };

    // Tips (String Array) yönetimi için textarea kullanımı
    const updateTips = (lang: string, val: string) => {
        // Newline ile ayırıp array yap
        const arr = val.split("\n").filter(x => x.trim() !== "");
        updateTrans(lang, "tips", arr);
    };

    if (loading) return <div>Yükleniyor...</div>;

    if (editing) {
        const tData = editing.translations.find((t: any) => t.lang_code === activeLang);
        return (
            <div className="card-admin p-6 space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                    <h3 className="text-lg font-bold">{editing.id ? "Slayt Düzenle" : "Yeni Slayt"}</h3>
                    <button onClick={() => setEditing(null)}><IoClose size={24} /></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Görsel Seçimi */}
                    <div className="space-y-2">
                        <label className="admin-label">Görsel (Image Link)</label>
                        <div className="flex gap-2">
                            <input className="admin-input" value={editing.image_link} readOnly />
                            <button onClick={() => setIsMediaOpen(true)} className="btn-admin btn-admin-secondary">Seç</button>
                        </div>
                        {editing.image_link && (
                            <div className="relative h-40 w-full bg-gray-100 rounded border mt-2">
                                <Image src={editing.image_link} alt="preview" fill className="object-cover" unoptimized />
                            </div>
                        )}
                    </div>

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

                {/* Çeviri Alanı */}
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                    <div className="flex gap-2 border-b mb-4">
                        {LANGS.map(l => (
                            <button key={l} onClick={() => setActiveLang(l)}
                                className={`px-4 py-2 text-sm font-bold ${activeLang === l ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}>
                                {l.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="admin-label">Başlık 1 (Büyük)</label>
                            <input className="admin-input" value={tData.title1}
                                onChange={e => updateTrans(activeLang, "title1", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="admin-label">Başlık 2 (İnce)</label>
                            <input className="admin-input" value={tData.title2}
                                onChange={e => updateTrans(activeLang, "title2", e.target.value)} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="admin-label">Açıklama Metni</label>
                            <textarea className="admin-textarea h-20" value={tData.text}
                                onChange={e => updateTrans(activeLang, "text", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="admin-label">Buton Linki</label>
                            <input className="admin-input" value={tData.button_link}
                                onChange={e => updateTrans(activeLang, "button_link", e.target.value)} />
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

                <div className="flex justify-end pt-4">
                    <button onClick={handleSave} className="btn-admin btn-admin-primary px-8 flex gap-2">
                        <IoSave /> Kaydet
                    </button>
                </div>

                <MediaPickerModal
                    isOpen={isMediaOpen}
                    onClose={() => setIsMediaOpen(false)}
                    onSelect={(url) => updateMain("image_link", url)}
                    bucketName="sliders" // Slider için ayrı bucket olabilir veya products
                />
            </div>
        );
    }

    // LIST VIEW
    return (
        <div className="space-y-4">
            <button onClick={() => { setEditing(createEmpty()); }} className="btn-admin btn-admin-primary flex items-center gap-2">
                <IoAdd /> Yeni Slayt Ekle
            </button>

            <div className="grid gap-4">
                {slides.map(slide => (
                    <div key={slide.id} className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm">
                        <div className="relative w-24 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                            <Image src={slide.image_link} alt="" fill className="object-cover" unoptimized />
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-sm">Sıra: {slide.order_no}</div>
                            <div className="text-xs text-gray-500 truncate max-w-md">
                                {slide.landing_slide_translations?.find((t: any) => t.lang_code === 'tr')?.title1 || "(Başlık Yok)"}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => prepareForEdit(slide)} className="btn-admin btn-admin-secondary p-2"><IoPencil /></button>
                            <button onClick={() => handleDelete(slide.id)} className="btn-admin btn-admin-danger p-2"><IoTrash /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}