"use client";

import * as React from "react"; // React.Fragment için gerekli
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
    SlPencil, SlTrash, SlCheck, SlClose, SlPlus, SlRefresh, SlPicture,
    SlArrowDown, SlArrowUp, SlCalender
} from "react-icons/sl";
import Image from "next/image";
import { toast } from "react-hot-toast";

// --- TİPLER ---
type Translation = {
    id?: number;
    lang_code: string;
    content: string;
};

type Testimonial = {
    id: number;
    section_code: string;
    order_no: number;
    active: boolean;
    stars: number;
    image_url: string | null;
    image_alt: string | null;
    author_name: string | null;
    author_job: string | null;
    created_at: string;
    testimonial_translations: Translation[];
};

const DEFAULT_FORM: Partial<Testimonial> = {
    section_code: "home_testimonials",
    order_no: 0,
    active: false,
    stars: 5,
    image_url: "",
    image_alt: "",
    author_name: "",
    author_job: "",
    testimonial_translations: [
        { lang_code: "tr", content: "" },
        { lang_code: "en", content: "" },
        { lang_code: "de", content: "" },
    ],
};

export default function AdminTestimonials() {
    const supabase = createSupabaseBrowserClient();

    // State
    const [items, setItems] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"approved" | "pending">("approved");

    // Tablo genişletme state'i (Hangi ID açık?)
    const [expandedRowId, setExpandedRowId] = useState<number | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<Testimonial>>(DEFAULT_FORM);
    const [isSaving, setIsSaving] = useState(false);
    const [translationTab, setTranslationTab] = useState("tr");

    // --- VERİ ÇEKME ---
    const fetchItems = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("testimonials")
            .select(`
        *,
        testimonial_translations (id, lang_code, content)
      `)
            .order("order_no", { ascending: true })
            .order("created_at", { ascending: false });

        if (error) {
            toast.error("Veriler yüklenirken hata oluştu.");
        } else {
            setItems(data as Testimonial[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchItems();
    }, []);

    // Filtreleme
    const filteredItems = items.filter((item) =>
        activeTab === "approved" ? item.active : !item.active
    );

    // --- TABLO FONKSİYONLARI ---
    const toggleRow = (id: number) => {
        if (expandedRowId === id) {
            setExpandedRowId(null);
        } else {
            setExpandedRowId(id);
        }
    };

    // --- CRUD İŞLEMLERİ ---
    const handleCreateNew = () => {
        setEditingItem(JSON.parse(JSON.stringify(DEFAULT_FORM)));
        setIsModalOpen(true);
    };

    const handleEdit = (item: Testimonial) => {
        const existingTrans = item.testimonial_translations || [];
        const mergedTrans = ["tr", "en", "de"].map((code) => {
            const found = existingTrans.find((t) => t.lang_code === code);
            return found ? found : { lang_code: code, content: "" };
        });

        setEditingItem({ ...item, testimonial_translations: mergedTrans });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Bu yorumu kalıcı olarak silmek istiyor musunuz?")) return;
        const { error } = await supabase.from("testimonials").delete().eq("id", id);
        if (error) toast.error("Hata: " + error.message);
        else {
            toast.success("Silindi.");
            fetchItems();
        }
    };

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        const { error } = await supabase
            .from("testimonials")
            .update({ active: !currentStatus })
            .eq("id", id);
        if (error) toast.error("Hata oluştu");
        else {
            toast.success(currentStatus ? "Pasife alındı" : "Yayına alındı");
            fetchItems();
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const baseData = {
                section_code: editingItem.section_code,
                order_no: editingItem.order_no,
                active: editingItem.active,
                stars: editingItem.stars,
                image_url: editingItem.image_url || null,
                image_alt: editingItem.image_alt || editingItem.author_name,
                author_name: editingItem.author_name,
                author_job: editingItem.author_job,
            };

            let testimonialId = editingItem.id;
            if (testimonialId) {
                const { error } = await supabase.from("testimonials").update(baseData).eq("id", testimonialId);
                if (error) throw error;
            } else {
                const { data, error } = await supabase.from("testimonials").insert(baseData).select().single();
                if (error) throw error;
                testimonialId = data.id;
            }

            if (editingItem.testimonial_translations && testimonialId) {
                const translationsToUpsert = editingItem.testimonial_translations
                    .filter((t) => t.content.trim() !== "")
                    .map((t) => ({
                        testimonial_id: testimonialId,
                        lang_code: t.lang_code,
                        content: t.content,
                        ...(t.id ? { id: t.id } : {}),
                    }));

                if (translationsToUpsert.length > 0) {
                    const { error: transError } = await supabase
                        .from("testimonial_translations")
                        .upsert(translationsToUpsert, { onConflict: "testimonial_id, lang_code" });
                    if (transError) throw transError;
                }
            }
            toast.success("Kaydedildi!");
            setIsModalOpen(false);
            fetchItems();
        } catch (err: any) {
            toast.error("Hata: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAutoTranslate = () => {
        const trText = editingItem.testimonial_translations?.find((t) => t.lang_code === "tr")?.content;
        if (!trText) { toast.error("Türkçe içerik giriniz."); return; }
        const newTrans = editingItem.testimonial_translations?.map(t =>
            (t.lang_code !== "tr" && t.content.length < 3) ? { ...t, content: `[${t.lang_code.toUpperCase()}] ${trText}` } : t
        );
        setEditingItem({ ...editingItem, testimonial_translations: newTrans });
        toast.success("Taslak çeviri yapıldı.");
    };

    const updateTranslation = (lang: string, val: string) => {
        const updated = editingItem.testimonial_translations?.map((t) =>
            t.lang_code === lang ? { ...t, content: val } : t
        );
        setEditingItem({ ...editingItem, testimonial_translations: updated });
    };

    return (
        /* Ana Kapsayıcı: admin-root ile tema değişkenlerini yükler */
        <div className="admin-root p-6">
            <div className="max-w-7xl mx-auto">

                {/* BAŞLIK VE AKSİYON */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Yorum Yönetimi</h1>
                        <p className="admin-help mt-1">Müşteri yorumlarını listeleyin ve yönetin.</p>
                    </div>
                    <button
                        onClick={handleCreateNew}
                        className="btn-admin btn-admin-primary gap-2"
                    >
                        <SlPlus /> Yeni Ekle
                    </button>
                </div>

                {/* TABS (Navbar stili veya buton grubu kullanılabilir, burada buton grubu yaptık) */}
                <div className="flex gap-2 mb-6 border-b border-[color:var(--admin-card-border)] pb-1">
                    <button
                        onClick={() => { setActiveTab("approved"); setExpandedRowId(null); }}
                        className={`btn-admin ${activeTab === "approved"
                            ? "btn-admin-primary"
                            : "btn-admin-secondary border-transparent shadow-none"
                            }`}
                    >
                        Yayındakiler <span className="ml-2 badge-admin badge-admin-success bg-white/20 text-current">{items.filter(i => i.active).length}</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab("pending"); setExpandedRowId(null); }}
                        className={`btn-admin ${activeTab === "pending"
                            ? "btn-admin-primary"
                            : "btn-admin-secondary border-transparent shadow-none"
                            }`}
                    >
                        Pasif / Taslaklar <span className="ml-2 badge-admin badge-admin-default bg-black/10">{items.filter(i => !i.active).length}</span>
                    </button>
                </div>

                {/* --- TABLO ALANI --- */}
                <div className="card-admin p-0 overflow-hidden">
                    {loading ? (
                        <div className="p-10 text-center admin-help">Yükleniyor...</div>
                    ) : filteredItems.length === 0 ? (
                        <div className="p-10 text-center admin-help">Kayıt bulunamadı.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table-admin border-none">
                                <thead className="thead-admin">
                                    <tr>
                                        <th className="th-admin w-16 text-center">#ID</th>
                                        <th className="th-admin">Kişi / Yazar</th>
                                        <th className="th-admin">Meslek / Ünvan</th>
                                        <th className="th-admin w-24">Puan</th>
                                        <th className="th-admin w-24 text-center">Sıra</th>
                                        <th className="th-admin w-32 text-center">Durum</th>
                                        <th className="th-admin w-16 text-center">Detay</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredItems.map((item) => {
                                        const isExpanded = expandedRowId === item.id;
                                        const trContent = item.testimonial_translations.find((t) => t.lang_code === "tr")?.content;

                                        return (
                                            <React.Fragment key={item.id}>
                                                {/* ANA SATIR */}
                                                <tr
                                                    className={`tr-admin row-admin-hover cursor-pointer transition-colors ${isExpanded ? "bg-[var(--admin-input-bg)]" : ""
                                                        }`}
                                                    onClick={() => toggleRow(item.id)}
                                                >
                                                    <td className="td-admin text-center font-mono opacity-50">{item.id}</td>
                                                    <td className="td-admin">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-[var(--admin-input-bg)] overflow-hidden flex-shrink-0 relative border border-[var(--admin-card-border)]">
                                                                {item.image_url ? (
                                                                    <Image src={item.image_url} alt="" fill className="object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center font-bold opacity-40">
                                                                        {item.author_name?.charAt(0)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className="font-semibold">{item.author_name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="td-admin opacity-80">{item.author_job}</td>
                                                    <td className="td-admin text-[var(--admin-info)] font-bold tracking-wide">{item.stars} ★</td>
                                                    <td className="td-admin text-center font-mono opacity-60">{item.order_no}</td>
                                                    <td className="td-admin text-center">
                                                        <span
                                                            className={`badge-admin ${item.active
                                                                ? "badge-admin-success"
                                                                : "badge-admin-default"
                                                                }`}
                                                        >
                                                            {item.active ? "Aktif" : "Pasif"}
                                                        </span>
                                                    </td>
                                                    <td className="td-admin text-center opacity-50">
                                                        {isExpanded ? <SlArrowUp /> : <SlArrowDown />}
                                                    </td>
                                                </tr>

                                                {/* AÇILAN DETAY SATIRI */}
                                                {isExpanded && (
                                                    <tr className="bg-[var(--admin-bg)]">
                                                        <td colSpan={7} className="p-0">
                                                            <div className="p-6 border-b border-[var(--admin-card-border)]">
                                                                <div className="flex flex-col md:flex-row gap-6">
                                                                    {/* Sol: İçerik Önizleme */}
                                                                    <div className="flex-1">
                                                                        <h4 className="admin-label uppercase mb-2">
                                                                            Yorum İçeriği (TR)
                                                                        </h4>
                                                                        <div className="card-admin p-4 italic opacity-80 shadow-none bg-[var(--admin-input-bg)]">
                                                                            "{trContent || <span className="opacity-40">İçerik girilmemiş</span>}"
                                                                        </div>
                                                                        <div className="mt-2 admin-help flex items-center gap-1">
                                                                            <SlCalender className="mb-0.5" /> Eklenme Tarihi:{" "}
                                                                            {new Date(item.created_at).toLocaleDateString("tr-TR")}
                                                                        </div>
                                                                    </div>

                                                                    {/* Sağ: Aksiyonlar */}
                                                                    <div className="flex flex-col gap-3 min-w-[200px] md:border-l md:pl-6 border-[var(--admin-card-border)]">
                                                                        <h4 className="admin-label uppercase">İşlemler</h4>

                                                                        <button
                                                                            onClick={() => handleEdit(item)}
                                                                            className="btn-admin btn-admin-info gap-2 text-white"
                                                                        >
                                                                            <SlPencil /> Düzenle / Çevir
                                                                        </button>

                                                                        <button
                                                                            onClick={() => handleToggleStatus(item.id, item.active)}
                                                                            className={`btn-admin gap-2 ${item.active
                                                                                ? "btn-admin-secondary border-[var(--admin-danger)] text-[var(--admin-danger)]"
                                                                                : "btn-admin-success text-white"
                                                                                }`}
                                                                        >
                                                                            {item.active ? (
                                                                                <><SlClose /> Yayından Kaldır</>
                                                                            ) : (
                                                                                <><SlCheck /> Yayına Al</>
                                                                            )}
                                                                        </button>

                                                                        <button
                                                                            onClick={() => handleDelete(item.id)}
                                                                            className="btn-admin btn-admin-danger gap-2 mt-auto"
                                                                        >
                                                                            <SlTrash /> Tamamen Sil
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* --- MODAL (EKLEME / DÜZENLEME) --- */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        {/* Modal Container: card-admin kullanıyoruz */}
                        <div className="card-admin w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 shadow-2xl relative bg-[var(--admin-card)]">

                            {/* Modal Header */}
                            <div className="p-5 border-b border-[var(--admin-card-border)] flex justify-between items-center bg-[var(--admin-input-bg)]">
                                <h2 className="text-xl font-bold">{editingItem.id ? "Düzenle" : "Yeni Ekle"}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="opacity-50 hover:opacity-100">
                                    <SlClose size={24} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 overflow-y-auto flex-1">
                                <form id="formModal" onSubmit={handleSave} className="grid-admin">
                                    <div className="grid-admin-2">
                                        <div>
                                            <label className="admin-label">Ad Soyad</label>
                                            <input
                                                required
                                                className="admin-input"
                                                value={editingItem.author_name || ""}
                                                onChange={e => setEditingItem({ ...editingItem, author_name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="admin-label">Ünvan</label>
                                            <input
                                                className="admin-input"
                                                value={editingItem.author_job || ""}
                                                onChange={e => setEditingItem({ ...editingItem, author_job: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid-admin-3">
                                        <div>
                                            <label className="admin-label">Puan</label>
                                            <select
                                                className="admin-select"
                                                value={editingItem.stars}
                                                onChange={e => setEditingItem({ ...editingItem, stars: Number(e.target.value) })}
                                            >
                                                {[5, 4, 3, 2, 1].map(s => <option key={s} value={s}>{s} Yıldız</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="admin-label">Sıra</label>
                                            <input
                                                type="number"
                                                className="admin-input"
                                                value={editingItem.order_no}
                                                onChange={e => setEditingItem({ ...editingItem, order_no: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-center pt-6">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 accent-[var(--admin-info)]"
                                                    checked={editingItem.active}
                                                    onChange={e => setEditingItem({ ...editingItem, active: e.target.checked })}
                                                />
                                                <span className="admin-label mb-0">Yayında</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="admin-label">Profil Resmi URL</label>
                                        <input
                                            type="text"
                                            className="admin-input"
                                            placeholder="https://..."
                                            value={editingItem.image_url || ""}
                                            onChange={e => setEditingItem({ ...editingItem, image_url: e.target.value })}
                                        />
                                    </div>

                                    <div className="border-t border-[var(--admin-card-border)] pt-4 mt-2">
                                        <div className="flex gap-2 mb-2 items-center">
                                            {["tr", "en", "de"].map(l => (
                                                <button
                                                    type="button"
                                                    key={l}
                                                    onClick={() => setTranslationTab(l)}
                                                    className={`badge-admin cursor-pointer ${translationTab === l
                                                        ? "badge-admin-info"
                                                        : "badge-admin-default"
                                                        } uppercase text-xs`}
                                                >
                                                    {l}
                                                </button>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={handleAutoTranslate}
                                                className="ml-auto text-xs text-[var(--admin-info)] hover:underline"
                                            >
                                                Otomatik Çevir (Taslak)
                                            </button>
                                        </div>
                                        <textarea
                                            className="admin-textarea"
                                            placeholder={`${translationTab.toUpperCase()} içeriği...`}
                                            value={editingItem.testimonial_translations?.find(t => t.lang_code === translationTab)?.content || ""}
                                            onChange={e => updateTranslation(translationTab, e.target.value)}
                                        />
                                    </div>
                                </form>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-5 border-t border-[var(--admin-card-border)] bg-[var(--admin-input-bg)] flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="btn-admin btn-admin-secondary"
                                >
                                    İptal
                                </button>
                                <button
                                    form="formModal"
                                    type="submit"
                                    disabled={isSaving}
                                    className="btn-admin btn-admin-primary"
                                >
                                    {isSaving ? '...' : 'Kaydet'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}