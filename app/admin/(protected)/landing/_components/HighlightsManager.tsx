"use client";

import { useState, useEffect } from "react";
import { IoAdd, IoPencil, IoTrash, IoClose, IoSave } from "react-icons/io5";

const LANGS = ["tr", "en", "de"];

export default function HighlightsManager() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<any | null>(null);
    const [activeLang, setActiveLang] = useState("tr");

    const loadData = async () => {
        setLoading(true);
        const res = await fetch("/api/admin/landing/highlights");
        const json = await res.json();
        setItems(json.data || []);
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    const createEmpty = () => ({
        id: null,
        icon: "fa6-solid:truck-fast",
        order_no: items.length + 1,
        active: true,
        translations: LANGS.map(l => ({ lang_code: l, text: "" }))
    });

    const prepareForEdit = (item: any) => {
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
        const method = editing.id ? "PATCH" : "POST";
        const url = editing.id ? `/api/admin/landing/highlights/${editing.id}` : "/api/admin/landing/highlights";

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
        await fetch(`/api/admin/landing/highlights/${id}`, { method: "DELETE" });
        loadData();
    };

    const updateMain = (k: string, v: any) => setEditing({ ...editing, [k]: v });
    const updateTrans = (lang: string, v: string) => {
        const newTrans = editing.translations.map((t: any) =>
            t.lang_code === lang ? { ...t, text: v } : t
        );
        setEditing({ ...editing, translations: newTrans });
    };

    if (loading) return <div>Yükleniyor...</div>;

    if (editing) {
        const tData = editing.translations.find((t: any) => t.lang_code === activeLang);
        return (
            <div className="card-admin p-6 space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                    <h3 className="text-lg font-bold">{editing.id ? "Highlight Düzenle" : "Yeni Highlight"}</h3>
                    <button onClick={() => setEditing(null)}><IoClose size={24} /></button>
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

                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                    <div className="flex gap-2 border-b mb-4">
                        {LANGS.map(l => (
                            <button key={l} onClick={() => setActiveLang(l)}
                                className={`px-4 py-2 text-sm font-bold ${activeLang === l ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}>
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

                <div className="flex justify-end pt-4">
                    <button onClick={handleSave} className="btn-admin btn-admin-primary px-8 flex gap-2">
                        <IoSave /> Kaydet
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <button onClick={() => setEditing(createEmpty())} className="btn-admin btn-admin-primary flex items-center gap-2">
                <IoAdd /> Yeni Ekle
            </button>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map(item => (
                    <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg text-2xl font-bold">
                            {/* Iconify componentini burada da kullanabilirsin, şimdilik text */}
                            <span className="iconify" data-icon={item.icon}></span>
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-bold truncate">
                                {item.landing_highlight_translations?.find((t: any) => t.lang_code === 'tr')?.text || "-"}
                            </div>
                            <div className="text-xs text-gray-400 font-mono">{item.icon}</div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button onClick={() => prepareForEdit(item)} className="text-blue-600"><IoPencil /></button>
                            <button onClick={() => handleDelete(item.id)} className="text-red-500"><IoTrash /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}