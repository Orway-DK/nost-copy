// app/admin/(protected)/social-settings/social-settings-form.tsx
"use client";

import React, { useState } from "react";
import {
    bulkSaveSocialLinksAction,
    deleteSocialLinkAction
} from "./actions";
import { IoSave, IoAdd, IoClose, IoReorderTwo } from "react-icons/io5";

type SocialLink = {
    id: number | string;
    settings_id: number | string;
    code: string;
    url: string | null;
    active: boolean;
    sort: number;
};

const COMMON_CODES = [
    "instagram", "facebook", "twitter", "x", "youtube",
    "tiktok", "linkedin", "github", "whatsapp", "pinterest", "telegram",
];

type Props = {
    initialLinks: SocialLink[];
    settingsId: number | string | null;
};

export default function SocialSettingsForm({ initialLinks, settingsId }: Props) {
    const [links, setLinks] = useState<SocialLink[]>(initialLinks);
    const [saving, setSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // --- HANDLERS (Aynı mantık) ---
    const handleChange = (id: number | string, field: keyof SocialLink, value: any) => {
        setLinks(prev => prev.map(link =>
            link.id === id ? { ...link, [field]: value } : link
        ));
        setIsDirty(true);
    };

    const handleAddNew = () => {
        if (!settingsId) return alert("Önce site ayarları oluşturulmalı.");
        const newSort = links.length > 0 ? Math.max(...links.map(l => l.sort)) + 1 : 0;
        const tempId = `temp-${Date.now()}`;
        const newRow: SocialLink = {
            id: tempId,
            settings_id: settingsId,
            code: "",
            url: "",
            active: true,
            sort: newSort
        };
        setLinks([...links, newRow]);
        setIsDirty(true);
    };

    const handleDelete = async (id: number | string) => {
        if (!confirm("Bu satırı silmek istediğine emin misin?")) return;
        if (typeof id === "string" && id.startsWith("temp-")) {
            setLinks(prev => prev.filter(l => l.id !== id));
            return;
        }
        const res = await deleteSocialLinkAction(id);
        if (res.success) {
            setLinks(prev => prev.filter(l => l.id !== id));
        } else {
            alert(res.message);
        }
    };

    const handleBulkSave = async () => {
        setSaving(true);
        const res = await bulkSaveSocialLinksAction(links);
        setSaving(false);
        if (res.success) {
            alert("✅ " + res.message);
            setIsDirty(false);
            window.location.reload();
        } else {
            alert("❌ " + res.message);
        }
    };

    const handleMove = (index: number, direction: -1 | 1) => {
        const newLinks = [...links];
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= newLinks.length) return;
        [newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]];
        newLinks.forEach((link, idx) => { link.sort = idx; });
        setLinks(newLinks);
        setIsDirty(true);
    };

    return (
        <div className="grid gap-6 pb-20">
            {/* --- HEADER --- */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold flex items-center gap-2">
                        Sosyal Bağlantılar
                        {/* Badge: CSS Variable kullanımı */}
                        <span className="text-sm font-normal px-2 py-0.5 rounded-full border"
                            style={{
                                backgroundColor: "var(--admin-input-bg)",
                                color: "var(--admin-muted)",
                                borderColor: "var(--admin-card-border)"
                            }}>
                            {links.length}
                        </span>
                    </h2>
                    <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
                        Footer ve iletişim alanlarındaki linkleri yönetin.
                    </p>
                </div>

                <button
                    onClick={handleBulkSave}
                    disabled={saving || !isDirty}
                    // btn-admin-primary class'ı zaten CSS'te tanımlı, onu kullanıyoruz
                    className={`btn-admin gap-2 px-6 py-2.5 transition-all ${isDirty
                            ? "btn-admin-primary shadow-lg scale-105"
                            : "btn-admin-secondary opacity-50 cursor-not-allowed"
                        }`}
                >
                    <IoSave size={18} />
                    {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                </button>
            </div>

            {/* --- TABLO KARTI --- */}
            <div className="card-admin overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        {/* THEAD:
                            bg-gray-50 yerine -> var(--admin-input-bg)
                            text-gray-400 yerine -> var(--admin-fg) + opacity
                        */}
                        <thead style={{ backgroundColor: "var(--admin-input-bg)", borderBottom: "1px solid var(--admin-card-border)" }}>
                            <tr className="text-xs uppercase font-semibold" style={{ color: "var(--admin-muted)" }}>
                                <th className="py-4 pl-6 w-12 text-center">#</th>
                                <th className="py-4 w-16 text-center">Aktif</th>
                                <th className="py-4 px-4 w-64">Platform (Kod)</th>
                                <th className="py-4 px-4">URL Bağlantısı</th>
                                <th className="py-4 px-6 w-16 text-center">Sil</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y" style={{ borderColor: "var(--admin-card-border)" }}>
                            {links.map((link, index) => (
                                <tr key={link.id} className="group transition-colors hover:bg-[var(--admin-bg)]/50">

                                    {/* SIRA / HANDLE */}
                                    <td className="py-3 pl-6 text-center">
                                        <div className="flex flex-col items-center justify-center gap-0.5" style={{ color: "var(--admin-input-placeholder)" }}>
                                            <button
                                                onClick={() => handleMove(index, -1)}
                                                disabled={index === 0}
                                                className="hover:text-[var(--admin-fg)] disabled:opacity-0 transition-colors"
                                            >
                                                ▲
                                            </button>
                                            <IoReorderTwo size={16} />
                                            <button
                                                onClick={() => handleMove(index, 1)}
                                                disabled={index === links.length - 1}
                                                className="hover:text-[var(--admin-fg)] disabled:opacity-0 transition-colors"
                                            >
                                                ▼
                                            </button>
                                        </div>
                                    </td>

                                    {/* AKTİFLİK TOGGLE (CSS Var Tabanlı) */}
                                    <td className="py-3 text-center">
                                        <div className="flex justify-center">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={link.active}
                                                    onChange={(e) => handleChange(link.id, "active", e.target.checked)}
                                                />
                                                {/* Switch Arkaplanı: Pasifken Input Border rengi, Aktifken Success rengi */}
                                                <div className="w-9 h-5 rounded-full peer-focus:outline-none peer transition-colors"
                                                    style={{ backgroundColor: link.active ? "var(--admin-success)" : "var(--admin-input-border)" }}>
                                                </div>
                                                {/* Switch Yuvarlağı: Kart rengi */}
                                                <div className="absolute top-[2px] left-[2px] bg-[var(--admin-card)] rounded-full h-4 w-4 transition-all border border-[var(--admin-input-border)] peer-checked:translate-x-full peer-checked:border-white"></div>
                                            </label>
                                        </div>
                                    </td>

                                    {/* PLATFORM CODE */}
                                    <td className="py-3 px-4">
                                        <input
                                            list="social-codes"
                                            value={link.code}
                                            onChange={(e) => handleChange(link.id, "code", e.target.value)}
                                            className="admin-input font-medium"
                                            placeholder="örn. instagram"
                                        />
                                        <datalist id="social-codes">
                                            {COMMON_CODES.map(c => <option key={c} value={c} />)}
                                        </datalist>
                                    </td>

                                    {/* URL INPUT */}
                                    <td className="py-3 px-4">
                                        <input
                                            type="text"
                                            value={link.url || ""}
                                            onChange={(e) => handleChange(link.id, "url", e.target.value)}
                                            className="admin-input w-full text-sm"
                                            style={{ color: "var(--admin-muted)" }}
                                            placeholder="https://..."
                                        />
                                    </td>

                                    {/* SİL BUTONU (X) */}
                                    <td className="py-3 px-6 text-center">
                                        <button
                                            onClick={() => handleDelete(link.id)}
                                            className="w-8 h-8 flex items-center justify-center rounded-full transition-all"
                                            style={{ color: "var(--admin-muted)" }}
                                        >
                                            {/* Hover efektini CSS class ile değil inline style manipulation zor olduğu için Tailwind group-hover veya class ile yapıyoruz ama renkler variable */}
                                            <IoClose size={20} className="hover:text-[var(--admin-danger)]" />
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {/* BOŞ STATE */}
                            {links.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center" style={{ color: "var(--admin-muted)" }}>
                                        Henüz hiç bağlantı eklenmemiş.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* YENİ EKLE BUTONU */}
                <div className="p-4 border-t flex justify-center"
                    style={{
                        backgroundColor: "var(--admin-input-bg)",
                        borderColor: "var(--admin-card-border)"
                    }}>
                    <button
                        onClick={handleAddNew}
                        // Özel dashed stil, renkler CSS değişkenlerinden
                        className="w-full py-3 flex items-center justify-center gap-2 transition-colors rounded-lg border border-dashed hover:border-solid"
                        style={{
                            backgroundColor: "var(--admin-card)",
                            borderColor: "var(--admin-input-border)",
                            color: "var(--admin-muted)",
                        }}
                    >
                        {/* Hover durumunda renk değişimi için group/hover class'ı daha pratik olurdu ama inline style istendiği için base style bu */}
                        <IoAdd size={18} /> Yeni Bağlantı Ekle
                    </button>
                </div>
            </div>
        </div>
    );
}