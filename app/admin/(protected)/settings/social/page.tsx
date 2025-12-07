"use client";

import React, { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";
import { SlPlus, SlTrash, SlMenu, SlCheck } from "react-icons/sl";

const PLATFORMS = ["facebook", "instagram", "twitter", "linkedin", "youtube", "whatsapp", "pinterest", "tiktok"];

type SocialLink = {
    id: string; // State içinde her zaman string (örn: "1" veya "temp-123")
    settings_id?: number;
    code: string;
    url: string | null;
    active: boolean;
    sort: number;
};

export default function SocialSettingsPage() {
    const supabase = createSupabaseBrowserClient();
    const [links, setLinks] = useState<SocialLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [settingsId, setSettingsId] = useState<number | null>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const { data: settings } = await supabase.from("site_settings").select("id").limit(1).maybeSingle();

            if (!settings) {
                toast.error("Lütfen önce Genel Ayarları kaydedin.");
                setLoading(false);
                return;
            }
            setSettingsId(settings.id);

            const { data: socialData } = await supabase
                .from("site_social_links")
                .select("*")
                .eq("settings_id", settings.id)
                .order("sort", { ascending: true });

            if (socialData) {
                // --- DÜZELTME BURADA ---
                // Gelen verideki ID (number) değerini String'e çeviriyoruz.
                const formattedLinks = socialData.map((link: any) => ({
                    ...link,
                    id: link.id.toString()
                }));
                setLinks(formattedLinks);
            }
            setLoading(false);
        };
        load();
    }, []);

    const handleAdd = () => {
        const newSort = links.length > 0 ? Math.max(...links.map(l => l.sort)) + 1 : 0;
        const newLink: SocialLink = {
            id: `temp-${Date.now()}`,
            code: "instagram",
            url: "",
            active: true,
            sort: newSort
        };
        setLinks([...links, newLink]);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Silmek istediğinize emin misiniz?")) return;

        // id string olduğu için startsWith güvenle çalışır
        if (!id.startsWith("temp-")) {
            await supabase.from("site_social_links").delete().eq("id", id);
        }
        setLinks(prev => prev.filter(l => l.id !== id));
    };

    const handleChange = (id: string, field: keyof SocialLink, value: any) => {
        setLinks(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
    };

    const handleSaveAll = async () => {
        if (!settingsId) return;
        const toastId = toast.loading("Kaydediliyor...");

        const cleanLinks = links.map(l => ({
            // Temp ise undefined (yeni kayıt), değilse int'e çevir (güncelleme)
            id: l.id.startsWith("temp-") ? undefined : parseInt(l.id),
            settings_id: settingsId,
            code: l.code,
            url: l.url,
            active: l.active,
            sort: l.sort
        }));

        const { error } = await supabase.from("site_social_links").upsert(cleanLinks);

        if (error) toast.error(error.message, { id: toastId });
        else {
            toast.success("Güncellendi!", { id: toastId });
            window.location.reload();
        }
    };

    if (loading) return <div className="text-center p-10 text-[var(--admin-muted)]">Yükleniyor...</div>;

    return (
        <div className="card-admin w-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold border-b border-[var(--admin-card-border)] pb-2 pr-4 inline-block">
                    Sosyal Medya Hesapları
                </h3>
                <button onClick={handleSaveAll} className="btn-admin btn-admin-primary gap-2">
                    <SlCheck /> Değişiklikleri Kaydet
                </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-[var(--admin-card-border)]">
                <table className="table-admin border-none">
                    <thead className="thead-admin">
                        <tr>
                            <th className="th-admin w-10">#</th>
                            <th className="th-admin w-24 text-center">Aktif</th>
                            <th className="th-admin w-48">Platform</th>
                            <th className="th-admin">URL</th>
                            <th className="th-admin w-16 text-center">Sil</th>
                        </tr>
                    </thead>
                    <tbody>
                        {links.length === 0 && (
                            <tr><td colSpan={5} className="td-admin text-center py-6 text-[var(--admin-muted)]">Henüz hesap eklenmemiş.</td></tr>
                        )}
                        {links.map((link, idx) => (
                            <tr key={link.id} className="tr-admin hover:bg-[var(--admin-input-bg)] transition-colors">
                                <td className="td-admin text-center text-[var(--admin-muted)]">
                                    <SlMenu className="mx-auto cursor-move opacity-50" />
                                </td>
                                <td className="td-admin text-center">
                                    <input
                                        type="checkbox"
                                        checked={link.active}
                                        onChange={e => handleChange(link.id, "active", e.target.checked)}
                                        className="w-5 h-5 accent-[var(--admin-success)] cursor-pointer"
                                    />
                                </td>
                                <td className="td-admin">
                                    <select
                                        className="admin-select capitalize"
                                        value={link.code}
                                        onChange={e => handleChange(link.id, "code", e.target.value)}
                                    >
                                        {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                                        <option value="other">Diğer</option>
                                    </select>
                                </td>
                                <td className="td-admin">
                                    <input
                                        className="admin-input"
                                        placeholder="https://..."
                                        // Controlled component null olamaz hatası için || ""
                                        value={link.url || ""}
                                        onChange={e => handleChange(link.id, "url", e.target.value)}
                                    />
                                </td>
                                <td className="td-admin text-center">
                                    <button
                                        onClick={() => handleDelete(link.id)}
                                        className="text-[var(--admin-muted)] hover:text-[var(--admin-danger)] hover:bg-[var(--admin-input-bg)] p-2 rounded transition"
                                    >
                                        <SlTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <button onClick={handleAdd} className="mt-4 btn-admin btn-admin-secondary w-full border-dashed gap-2">
                <SlPlus /> Yeni Hesap Ekle
            </button>
        </div>
    );
}