"use client";

import React, { useEffect, useMemo, useState } from "react";

type SocialLink = {
    id: number | string;
    settings_id: number | string;
    code: string;
    url: string | null;
    active: boolean;
    sort: number;
};

type ListResponse = {
    settingsId: number | string;
    links: SocialLink[];
};

const COMMON_CODES = [
    "instagram",
    "facebook",
    "twitter",
    "x",
    "youtube",
    "tiktok",
    "linkedin",
    "github",
    "whatsapp",
    "pinterest",
    "telegram",
];

export default function SocialSettings() {
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<number | string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(null);

    const [settingsId, setSettingsId] = useState<number | string | null>(null);
    const [links, setLinks] = useState<SocialLink[]>([]);

    const [newLink, setNewLink] = useState<{ code: string; url: string; active: boolean; sort?: number }>({
        code: "",
        url: "",
        active: true,
    });

    const nextSort = useMemo(() => {
        if (links.length === 0) return 0;
        return Math.max(...links.map((l) => l.sort ?? 0)) + 1;
    }, [links]);

    async function load() {
        setLoading(true);
        setError(null);
        setOk(null);
        try {
            const res = await fetch("/api/admin/site-social-links", { method: "GET" });
            const json = (await res.json()) as { error?: string } & ListResponse;
            if (!res.ok) throw new Error(json.error || "Sosyal bağlantılar alınamadı.");
            setSettingsId(json.settingsId);
            setLinks(json.links || []);
        } catch (e: any) {
            setError(e?.message || "Yüklenemedi.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function saveLink(upd: Partial<SocialLink> & { id?: number | string; code?: string }) {
        if (!settingsId) {
            setError("Önce Site Settings kaydı oluşturun.");
            return;
        }
        setBusyId(upd.id ?? "new");
        setError(null);
        setOk(null);

        try {
            const res = await fetch("/api/admin/site-social-links", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: upd.id ?? undefined,
                    code: upd.code,
                    url: upd.url ?? null,
                    active: typeof upd.active === "boolean" ? upd.active : undefined,
                    sort: typeof upd.sort === "number" ? upd.sort : undefined,
                }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json?.error || "Kaydetme hatası.");

            const saved: SocialLink = json.data;
            setLinks((prev) => {
                const idx = prev.findIndex((p) => p.id === saved.id);
                if (idx === -1) return [...prev, saved].sort((a, b) => a.sort - b.sort || Number(a.id) - Number(b.id));
                const copy = [...prev];
                copy[idx] = saved;
                return copy.sort((a, b) => a.sort - b.sort || Number(a.id) - Number(b.id));
            });
            setOk("Kaydedildi.");
        } catch (e: any) {
            setError(e?.message || "Kaydetme sırasında hata oluştu.");
        } finally {
            setBusyId(null);
        }
    }

    async function deleteLink(id: number | string) {
        if (!confirm("Bu bağlantıyı silmek istiyor musunuz?")) return;
        setBusyId(id);
        setError(null);
        setOk(null);
        try {
            const res = await fetch(`/api/admin/site-social-links?id=${id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json?.error || "Silme hatası.");
            setLinks((prev) => prev.filter((l) => l.id !== id));
            setOk("Silindi.");
        } catch (e: any) {
            setError(e?.message || "Silme sırasında hata oluştu.");
        } finally {
            setBusyId(null);
        }
    }

    function move(link: SocialLink, dir: -1 | 1) {
        // Komşuyu bul, sort değerlerini değiştir, sırayla kaydet.
        const sorted = [...links].sort((a, b) => a.sort - b.sort || Number(a.id) - Number(b.id));
        const idx = sorted.findIndex((l) => l.id === link.id);
        const targetIdx = idx + dir;
        if (targetIdx < 0 || targetIdx >= sorted.length) return;

        const a = sorted[idx];
        const b = sorted[targetIdx];
        // Swap sort
        const aSort = a.sort ?? 0;
        const bSort = b.sort ?? 0;
        a.sort = bSort;
        b.sort = aSort;

        // Optimistic update
        setLinks(sorted);

        // Persist sequentially
        saveLink({ id: a.id, sort: a.sort });
        saveLink({ id: b.id, sort: b.sort });
    }

    return (
        <div className="grid gap-6">
            {/* Header actions */}
            <div className="flex items-start justify-between gap-4">
                <div className="text-sm text-admin-muted">
                    {loading ? "Yükleniyor..." : `Toplam ${links.length} bağlantı`}
                </div>
                <div className="flex-1">
                    {error && <div className="alert-admin alert-admin-error">{error}</div>}
                    {ok && <div className="alert-admin alert-admin-success">{ok}</div>}
                </div>
                <div className="flex items-center gap-2">
                    <button className="btn-admin btn-admin-secondary" onClick={load} disabled={loading}>
                        Yenile
                    </button>
                </div>
            </div>

            {/* Add new link */}
            <div className="card-admin grid gap-4">
                <h3 className="text-lg font-medium">Yeni Bağlantı Ekle</h3>
                {!settingsId && (
                    <div className="alert-admin alert-admin-info">
                        Önce Site Settings kaydı oluşturulmalı. Site ayarlarını kaydettiğinizde bu alan aktif olur.
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <label className="admin-label">Code</label>
                        <input
                            list="social-codes"
                            className="admin-input"
                            value={newLink.code}
                            onChange={(e) => setNewLink((s) => ({ ...s, code: e.target.value.trim() }))}
                            placeholder="örn. instagram"
                        />
                        <datalist id="social-codes">
                            {COMMON_CODES.map((c) => (
                                <option key={c} value={c} />
                            ))}
                        </datalist>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="admin-label">URL</label>
                        <input
                            className="admin-input"
                            value={newLink.url}
                            onChange={(e) => setNewLink((s) => ({ ...s, url: e.target.value }))}
                            placeholder="https://example.com/profile"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="admin-label">Durum</label>
                        <div className="flex items-center gap-3 h-[38px]">
                            <input
                                id="new-active"
                                type="checkbox"
                                className="h-4 w-4"
                                checked={newLink.active}
                                onChange={(e) => setNewLink((s) => ({ ...s, active: e.target.checked }))}
                            />
                            <label htmlFor="new-active" className="text-sm">Active</label>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        className="btn-admin btn-admin-primary"
                        disabled={!settingsId || !newLink.code.trim() || busyId === "new"}
                        onClick={async () => {
                            if (!newLink.code.trim()) return;
                            await saveLink({
                                code: newLink.code.trim(),
                                url: newLink.url || null,
                                active: newLink.active,
                                sort: nextSort,
                            });
                            setNewLink({ code: "", url: "", active: true });
                        }}
                    >
                        Ekle
                    </button>
                    <button
                        className="btn-admin btn-admin-secondary"
                        onClick={() => setNewLink({ code: "", url: "", active: true })}
                        disabled={busyId === "new"}
                    >
                        Temizle
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="table-admin">
                <table className="w-full">
                    <thead className="thead-admin">
                        <tr>
                            <th className="th-admin w-16">Sıra</th>
                            <th className="th-admin">Code</th>
                            <th className="th-admin">URL</th>
                            <th className="th-admin w-24">Aktif</th>
                            <th className="th-admin w-40">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr className="tr-admin">
                                <td className="td-admin" colSpan={5}>Yükleniyor...</td>
                            </tr>
                        ) : links.length === 0 ? (
                            <tr className="tr-admin">
                                <td className="td-admin" colSpan={5}>Bağlantı yok.</td>
                            </tr>
                        ) : (
                            [...links]
                                .sort((a, b) => a.sort - b.sort || Number(a.id) - Number(b.id))
                                .map((l, index, arr) => {
                                    const isBusy = busyId === l.id;
                                    return (
                                        <tr key={String(l.id)} className="tr-admin row-admin-hover">
                                            <td className="td-admin">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        className="btn-admin btn-admin-secondary"
                                                        onClick={() => move(l, -1)}
                                                        disabled={isBusy || index === 0}
                                                        title="Yukarı"
                                                    >
                                                        ↑
                                                    </button>
                                                    <button
                                                        className="btn-admin btn-admin-secondary"
                                                        onClick={() => move(l, +1)}
                                                        disabled={isBusy || index === arr.length - 1}
                                                        title="Aşağı"
                                                    >
                                                        ↓
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="td-admin">
                                                <input
                                                    className="admin-input"
                                                    value={l.code}
                                                    onChange={(e) => {
                                                        const v = e.target.value;
                                                        setLinks((prev) =>
                                                            prev.map((x) => (x.id === l.id ? { ...x, code: v } : x))
                                                        );
                                                    }}
                                                    onBlur={() => {
                                                        if (!l.code.trim()) return;
                                                        saveLink({ id: l.id, code: l.code.trim() });
                                                    }}
                                                />
                                            </td>
                                            <td className="td-admin">
                                                <input
                                                    className="admin-input"
                                                    value={l.url ?? ""}
                                                    placeholder="https://..."
                                                    onChange={(e) => {
                                                        const v = e.target.value;
                                                        setLinks((prev) =>
                                                            prev.map((x) => (x.id === l.id ? { ...x, url: v } : x))
                                                        );
                                                    }}
                                                    onBlur={() => saveLink({ id: l.id, url: l.url ?? "" })}
                                                />
                                            </td>
                                            <td className="td-admin">
                                                <input
                                                    type="checkbox"
                                                    checked={!!l.active}
                                                    onChange={(e) => {
                                                        const v = e.target.checked;
                                                        setLinks((prev) =>
                                                            prev.map((x) => (x.id === l.id ? { ...x, active: v } : x))
                                                        );
                                                        saveLink({ id: l.id, active: v });
                                                    }}
                                                />
                                            </td>
                                            <td className="td-admin">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        className="btn-admin btn-admin-secondary"
                                                        onClick={() => saveLink({ id: l.id, code: l.code.trim(), url: l.url ?? null, active: l.active, sort: l.sort })}
                                                        disabled={isBusy}
                                                    >
                                                        Kaydet
                                                    </button>
                                                    <button
                                                        className="btn-admin btn-admin-danger"
                                                        onClick={() => deleteLink(l.id)}
                                                        disabled={isBusy}
                                                    >
                                                        Sil
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}