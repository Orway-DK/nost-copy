// app/admin/(protected)/landing/_components/HighlightsManager.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upsertHighlightAction, deleteHighlightAction } from "../actions";
import { IoAdd, IoPencil, IoTrash, IoClose, IoSave, IoFlash } from "react-icons/io5";

const LANGS = ["tr", "en", "de"];

export default function HighlightsManager({ initialItems }: { initialItems: any[] }) {
    const router = useRouter();
    const [editing, setEditing] = useState<any | null>(null);
    const [activeLang, setActiveLang] = useState("tr");
    const [saving, setSaving] = useState(false);

    const handleAddNew = () => {
        setEditing({
            id: null,
            icon: "fa6-solid:truck-fast",
            order_no: initialItems.length + 1,
            active: true,
            translations: LANGS.map(l => ({ lang_code: l, text: "" }))
        });
    };

    const handleEdit = (item: any) => {
        const transMap: any = {};
        item.landing_highlight_translations.forEach((t: any) => transMap[t.lang_code] = t);

        const translations = LANGS.map(l => ({
            lang_code: l,
            id: transMap[l]?.id,
            text: transMap[l]?.text || ""
        }));

        setEditing({ ...item, translations });
    };

    const handleSave = async () => {
        if (!editing) return;
        setSaving(true);
        const res = await upsertHighlightAction(editing);
        setSaving(false);

        if (res.success) {
            setEditing(null);
            router.refresh();
        } else {
            alert("Hata: " + res.message);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Silmek istediğinize emin misiniz?")) return;
        const res = await deleteHighlightAction(id);
        if (res.success) router.refresh();
        else alert(res.message);
    };

    const updateMain = (k: string, v: any) => setEditing({ ...editing, [k]: v });
    const updateTrans = (lang: string, v: string) => {
        const newTrans = editing.translations.map((t: any) =>
            t.lang_code === lang ? { ...t, text: v } : t
        );
        setEditing({ ...editing, translations: newTrans });
    };

    // --- FORM VIEW ---
    if (editing) {
        const tData = editing.translations.find((t: any) => t.lang_code === activeLang);
        return (
            <div className="card-admin p-6 space-y-6 animate-in fade-in">
                <div className="flex justify-between items-center border-b pb-4" style={{ borderColor: "var(--admin-card-border)" }}>
                    <h3 className="text-lg font-bold" style={{ color: "var(--admin-fg)" }}>
                        {editing.id ? "Highlight Düzenle" : "Yeni Highlight"}
                    </h3>
                    <button onClick={() => setEditing(null)} style={{ color: "var(--admin-muted)" }}>
                        <IoClose size={24} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="admin-label">Icon (Iconify Kodu)</label>
                        <input className="admin-input font-mono text-sm" value={editing.icon}
                            onChange={e => updateMain("icon", e.target.value)}
                            placeholder="fa6-solid:truck-fast" />
                    </div>
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

                    <div className="space-y-2">
                        <label className="admin-label">Metin ({activeLang.toUpperCase()})</label>
                        <input className="admin-input" value={tData.text}
                            onChange={e => updateTrans(activeLang, e.target.value)}
                            placeholder="Örn: Ücretsiz Kargo" />
                    </div>
                </div>

                <div className="flex justify-end pt-4 gap-3">
                    <button onClick={() => setEditing(null)} className="btn-admin btn-admin-secondary">İptal</button>
                    <button onClick={handleSave} disabled={saving} className="btn-admin btn-admin-primary px-8 flex items-center gap-2">
                        <IoSave /> {saving ? "..." : "Kaydet"}
                    </button>
                </div>
            </div>
        );
    }

    // --- LIST VIEW ---
    return (
        <div className="space-y-4">
            <button onClick={handleAddNew} className="btn-admin btn-admin-primary flex items-center gap-2">
                <IoAdd /> Yeni Ekle
            </button>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {initialItems.map(item => (
                    <div key={item.id} className="card-admin p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="p-3 rounded-lg text-2xl font-bold flex items-center justify-center w-12 h-12"
                            style={{ backgroundColor: "var(--admin-input-bg)", color: "var(--admin-accent)" }}>
                            <IoFlash /> {/* Iconify yerine geçici */}
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-bold truncate" style={{ color: "var(--admin-fg)" }}>
                                {item.landing_highlight_translations?.find((t: any) => t.lang_code === 'tr')?.text || "-"}
                            </div>
                            <div className="text-xs font-mono" style={{ color: "var(--admin-muted)" }}>{item.icon}</div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button onClick={() => handleEdit(item)} className="text-[var(--admin-accent)] hover:bg-[var(--admin-input-bg)] p-1 rounded"><IoPencil /></button>
                            <button onClick={() => handleDelete(item.id)} className="text-[var(--admin-danger)] hover:bg-[var(--admin-input-bg)] p-1 rounded"><IoTrash /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}