// app/admin/(protected)/settings/settings-form.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { IoSave, IoRefresh, IoGlobeOutline, IoMailOutline, IoCallOutline, IoLocationOutline, IoLogoWhatsapp, IoTimeOutline, IoImageOutline } from "react-icons/io5";
import { updateSettingsAction } from "./actions";

type Props = {
    initialData: any;
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

export default function SettingsForm({ initialData }: Props) {
    const [form, setForm] = useState(initialData?.id ? initialData : emptyForm);
    const [saving, setSaving] = useState(false);

    // --- HANDLERS ---
    const handleChange = (key: string, value: string) => {
        setForm((prev: any) => ({ ...prev, [key]: value }));
    };

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setSaving(true);

        const res = await updateSettingsAction(form);
        setSaving(false);

        if (res.success) {
            alert("✅ " + res.message);
            if (res.data) setForm(res.data);
        } else {
            alert("❌ " + res.message);
        }
    };

    return (
        <div className="grid gap-6 pb-20">
            {/* --- HEADER --- */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold flex items-center gap-2" style={{ color: "var(--admin-fg)" }}>
                        Genel Ayarlar
                    </h2>
                    <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
                        Site kimliği, iletişim bilgileri ve logoları yönetin.
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="btn-admin border"
                        style={{
                            color: "var(--admin-muted)",
                            borderColor: "var(--admin-input-border)",
                            backgroundColor: "var(--admin-input-bg)"
                        }}
                        title="Yenile"
                    >
                        <IoRefresh size={20} />
                    </button>
                    <button
                        onClick={() => handleSave()}
                        disabled={saving}
                        className="btn-admin btn-admin-primary gap-2 px-6"
                    >
                        <IoSave size={18} />
                        {saving ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                </div>
            </div>

            {/* --- FORM ALANI --- */}
            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* SOL KOLON: Kimlik & Görseller */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="card-admin space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2 border-b pb-2"
                            style={{ borderColor: "var(--admin-card-border)", color: "var(--admin-fg)" }}>
                            <IoImageOutline /> Kimlik & Logo
                        </h3>

                        <div>
                            {/* DÜZELTME: flex-row ve items-center ile tek satır */}
                            <label className="admin-label flex flex-row items-center gap-2">
                                <IoGlobeOutline className="opacity-50 flex-shrink-0" />
                                <span>Site Adı</span>
                            </label>
                            <input
                                className="admin-input"
                                value={form.site_name}
                                onChange={(e) => handleChange("site_name", e.target.value)}
                                placeholder="Örn: Nost Copy"
                                required
                            />
                        </div>

                        <div>
                            <label className="admin-label flex flex-row items-center gap-2">
                                <IoImageOutline className="opacity-50 flex-shrink-0" />
                                <span>Logo URL</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    className="admin-input flex-1"
                                    value={form.logo_url || ""}
                                    onChange={(e) => handleChange("logo_url", e.target.value)}
                                    placeholder="https://..."
                                />
                                <div className="w-10 h-10 flex-shrink-0 rounded border overflow-hidden flex items-center justify-center"
                                    style={{ borderColor: "var(--admin-input-border)", backgroundColor: "var(--admin-input-bg)" }}>
                                    {form.logo_url ? (
                                        <Image src={form.logo_url} alt="Logo" width={32} height={32} className="object-contain" unoptimized />
                                    ) : (
                                        <span className="text-xs text-center opacity-50">-</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="admin-label flex flex-row items-center gap-2">
                                <IoImageOutline className="opacity-50 flex-shrink-0" />
                                <span>Favicon URL</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    className="admin-input flex-1"
                                    value={form.favicon_url || ""}
                                    onChange={(e) => handleChange("favicon_url", e.target.value)}
                                    placeholder="https://..."
                                />
                                <div className="w-10 h-10 flex-shrink-0 rounded border overflow-hidden flex items-center justify-center"
                                    style={{ borderColor: "var(--admin-input-border)", backgroundColor: "var(--admin-input-bg)" }}>
                                    {form.favicon_url ? (
                                        <Image src={form.favicon_url} alt="Favicon" width={24} height={24} className="object-contain" unoptimized />
                                    ) : (
                                        <span className="text-xs text-center opacity-50">-</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SAĞ KOLON: İletişim Bilgileri */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card-admin space-y-6">
                        <h3 className="text-lg font-medium flex items-center gap-2 border-b pb-2"
                            style={{ borderColor: "var(--admin-card-border)", color: "var(--admin-fg)" }}>
                            <IoCallOutline /> İletişim Bilgileri
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="admin-label flex flex-row items-center gap-2">
                                    <IoMailOutline className="opacity-50 flex-shrink-0" />
                                    <span>E-posta</span>
                                </label>
                                <input
                                    type="email"
                                    className="admin-input"
                                    value={form.email || ""}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    placeholder="info@example.com"
                                />
                            </div>
                            <div>
                                <label className="admin-label flex flex-row items-center gap-2">
                                    <IoCallOutline className="opacity-50 flex-shrink-0" />
                                    <span>Telefon</span>
                                </label>
                                <input
                                    className="admin-input"
                                    value={form.phone || ""}
                                    onChange={(e) => handleChange("phone", e.target.value)}
                                    placeholder="+90 555 ..."
                                />
                            </div>
                            <div>
                                <label className="admin-label flex flex-row items-center gap-2">
                                    <IoLogoWhatsapp className="opacity-50 flex-shrink-0" />
                                    <span>WhatsApp URL</span>
                                </label>
                                <input
                                    className="admin-input"
                                    value={form.whatsapp_url || ""}
                                    onChange={(e) => handleChange("whatsapp_url", e.target.value)}
                                    placeholder="https://wa.me/..."
                                />
                            </div>
                            <div>
                                <label className="admin-label flex flex-row items-center gap-2">
                                    <IoTimeOutline className="opacity-50 flex-shrink-0" />
                                    <span>Çalışma Saatleri</span>
                                </label>
                                <input
                                    className="admin-input"
                                    value={form.working_hours || ""}
                                    onChange={(e) => handleChange("working_hours", e.target.value)}
                                    placeholder="Hafta içi 09:00 - 18:00"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="admin-label flex flex-row items-center gap-2">
                                <IoLocationOutline className="opacity-50 flex-shrink-0" />
                                <span>Açık Adres</span>
                            </label>
                            <textarea
                                className="admin-textarea"
                                value={form.address || ""}
                                onChange={(e) => handleChange("address", e.target.value)}
                                rows={3}
                                placeholder="Firma adresi..."
                            />
                        </div>

                        <div>
                            <label className="admin-label flex flex-row items-center gap-2">
                                <IoLocationOutline className="opacity-50 flex-shrink-0" />
                                <span>Harita/Konum URL</span>
                            </label>
                            <input
                                className="admin-input"
                                value={form.store_location_url || ""}
                                onChange={(e) => handleChange("store_location_url", e.target.value)}
                                placeholder="Google Maps linki..."
                            />
                        </div>
                    </div>
                </div>

            </form>
        </div>
    );
}