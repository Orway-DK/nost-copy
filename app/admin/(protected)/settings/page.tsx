// orway-dk/nost-copy/nost-copy-d541a3f124d8a8bc7c3eeea745918156697a239e/app/admin/(protected)/settings/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
// DÜZELTME: Ortak istemci importu
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type SiteSettingsRow = {
    id: number | string;
    site_name: string;
    logo_url: string | null;
    favicon_url: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    whatsapp_url: string | null;
    working_hours: string | null;
    store_location_url: string | null;
    created_at: string;
    updated_at: string;
};

const emptyForm = {
    site_name: "",
    logo_url: "",
    favicon_url: "",
    email: "",
    phone: "",
    address: "",
    whatsapp_url: "",
    working_hours: "",
    store_location_url: "",
};

export default function SettingsForm() {
    // DÜZELTME: createClient yerine ortak fonksiyon kullanımı
    const supabase = createSupabaseBrowserClient();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(null);

    const [row, setRow] = useState<SiteSettingsRow | null>(null);
    const [form, setForm] = useState({ ...emptyForm });

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                setOk(null);

                const { data, error } = await supabase
                    .from("site_settings")
                    .select("*")
                    .order("id", { ascending: true })
                    .limit(1)
                    .maybeSingle();

                if (!mounted) return;

                if (error) {
                    setError(error.message || "Ayarlar yüklenemedi.");
                } else if (data) {
                    setRow(data as SiteSettingsRow);
                    setForm({
                        site_name: data.site_name ?? "",
                        logo_url: data.logo_url ?? "",
                        favicon_url: data.favicon_url ?? "",
                        email: data.email ?? "",
                        phone: data.phone ?? "",
                        address: data.address ?? "",
                        whatsapp_url: data.whatsapp_url ?? "",
                        working_hours: data.working_hours ?? "",
                        store_location_url: data.store_location_url ?? "",
                    });
                } else {
                    setRow(null);
                    setForm({ ...emptyForm });
                }
            } catch (e: any) {
                if (!mounted) return;
                setError(e?.message || "Ayarlar yüklenirken hata oluştu.");
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [supabase]); // Düzeltme: dependency'e supabase eklendi (gerçi referans değişmez)

    function onChange<K extends keyof typeof form>(key: K, value: string) {
        setForm(f => ({ ...f, [key]: value }));
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setOk(null);

        try {
            if (!form.site_name.trim()) {
                setError("Site adı zorunludur.");
                setSaving(false);
                return;
            }

            const res = await fetch("/api/admin/site-settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const json = await res.json();
            if (!res.ok) {
                throw new Error(json?.error || "Kaydetme sırasında hata");
            }

            setOk("Ayarlar kaydedildi.");
            if (json?.data) {
                const updated = json.data as SiteSettingsRow;
                setRow(updated);
                setForm({
                    site_name: updated.site_name ?? "",
                    logo_url: updated.logo_url ?? "",
                    favicon_url: updated.favicon_url ?? "",
                    email: updated.email ?? "",
                    phone: updated.phone ?? "",
                    address: updated.address ?? "",
                    whatsapp_url: updated.whatsapp_url ?? "",
                    working_hours: updated.working_hours ?? "",
                    store_location_url: updated.store_location_url ?? "",
                });
            }
        } catch (err: any) {
            setError(err?.message || "Kaydetme sırasında bir hata oluştu.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="grid gap-6">
            <div className="flex items-start justify-between gap-4">
                <div className="text-sm text-admin-muted">
                    {loading ? "Yükleniyor..." : row ? `Kayıt ID: ${row.id}` : "Yeni kayıt oluşturulacak"}
                </div>
                <div className="flex-1">
                    {error && <div className="alert-admin alert-admin-error">{error}</div>}
                    {ok && <div className="alert-admin alert-admin-success">{ok}</div>}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        className="btn-admin btn-admin-secondary"
                        onClick={() => location.reload()}
                        disabled={loading}
                    >
                        Yenile
                    </button>
                </div>
            </div>

            <form onSubmit={onSubmit} className="card-admin grid gap-8">
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="admin-label">Site Adı</label>
                        <input
                            className="admin-input"
                            value={form.site_name}
                            onChange={(e) => onChange("site_name", e.target.value)}
                            required
                            placeholder="Örn: Nost Copy"
                        />
                        <p className="admin-help">Başlık ve bazı meta alanlarda kullanılır.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="admin-label">E-posta</label>
                        <input
                            className="admin-input"
                            type="email"
                            value={form.email}
                            onChange={(e) => onChange("email", e.target.value)}
                            placeholder="Örn: info@example.com"
                        />
                        <p className="admin-help">İletişim sayfası ve footer’da gösterilir.</p>
                    </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="admin-label">Telefon</label>
                        <input
                            className="admin-input"
                            value={form.phone}
                            onChange={(e) => onChange("phone", e.target.value)}
                            placeholder="Örn: +90 555 555 55 55"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="admin-label">WhatsApp URL</label>
                        <input
                            className="admin-input"
                            value={form.whatsapp_url}
                            onChange={(e) => onChange("whatsapp_url", e.target.value)}
                            placeholder="Örn: https://wa.me/905555555555"
                        />
                    </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="admin-label">Çalışma Saatleri</label>
                        <input
                            className="admin-input"
                            value={form.working_hours}
                            onChange={(e) => onChange("working_hours", e.target.value)}
                            placeholder="Örn: Hafta içi 09:00 - 18:00"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="admin-label">Mağaza Konum URL</label>
                        <input
                            className="admin-input"
                            value={form.store_location_url}
                            onChange={(e) => onChange("store_location_url", e.target.value)}
                            placeholder="Örn: Google Maps paylaşım linki"
                        />
                    </div>
                </section>

                <section className="space-y-2">
                    <label className="admin-label">Adres</label>
                    <textarea
                        className="admin-textarea"
                        value={form.address}
                        onChange={(e) => onChange("address", e.target.value)}
                        placeholder="Adresinizi girin"
                    />
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="admin-label">Logo URL</label>
                        <div className="flex items-center gap-3">
                            <input
                                className="admin-input flex-1"
                                value={form.logo_url}
                                onChange={(e) => onChange("logo_url", e.target.value)}
                                placeholder="Örn: https://site.com/logo.png"
                            />
                            {form.logo_url ? (
                                <Image
                                    src={form.logo_url}
                                    alt="Logo preview"
                                    width={40}
                                    height={40}
                                    unoptimized
                                    className="w-10 h-10 rounded-md border border-admin-border object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-md border border-admin-border bg-admin-input-bg" />
                            )}
                        </div>
                        <p className="admin-help">PNG/SVG tercih edilir.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="admin-label">Favicon URL</label>
                        <div className="flex items-center gap-3">
                            <input
                                className="admin-input flex-1"
                                value={form.favicon_url}
                                onChange={(e) => onChange("favicon_url", e.target.value)}
                                placeholder="Örn: https://site.com/favicon.ico"
                            />
                            {form.favicon_url ? (
                                <Image
                                    src={form.favicon_url}
                                    alt="Favicon preview"
                                    width={40}
                                    height={40}
                                    unoptimized
                                    className="w-10 h-10 rounded-md border border-admin-border object-contain"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-md border border-admin-border bg-admin-input-bg" />
                            )}
                        </div>
                        <p className="admin-help">ICO veya PNG dosyası.</p>
                    </div>
                </section>

                <section className="flex items-center gap-2">
                    <button type="submit" className="btn-admin btn-admin-primary" disabled={saving}>
                        {saving ? "Kaydediliyor..." : row ? "Güncelle" : "Ekle"}
                    </button>
                    <button
                        type="button"
                        className="btn-admin btn-admin-secondary"
                        onClick={async () => {
                            setError(null);
                            setOk(null);
                            try {
                                const { data, error } = await supabase
                                    .from("site_settings")
                                    .select("*")
                                    .order("id", { ascending: true })
                                    .limit(1)
                                    .maybeSingle();

                                if (error) {
                                    setError(error.message || "Ayarlar alınamadı.");
                                    return;
                                }

                                if (!data) {
                                    setRow(null);
                                    setForm({ ...emptyForm });
                                } else {
                                    setRow(data as SiteSettingsRow);
                                    setForm({
                                        site_name: data.site_name ?? "",
                                        logo_url: data.logo_url ?? "",
                                        favicon_url: data.favicon_url ?? "",
                                        email: data.email ?? "",
                                        phone: data.phone ?? "",
                                        address: data.address ?? "",
                                        whatsapp_url: data.whatsapp_url ?? "",
                                        working_hours: data.working_hours ?? "",
                                        store_location_url: data.store_location_url ?? "",
                                    });
                                }
                            } catch (e: any) {
                                setError(e?.message || "Yenileme sırasında hata oluştu.");
                            }
                        }}
                        disabled={saving}
                    >
                        Sıfırla
                    </button>
                </section>
            </form>
        </div>
    );
}