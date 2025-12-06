// app/admin/(protected)/categories/[id]/category-form.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { upsertCategoryAction } from "../actions";
import CategoryLocalizations from "./category-localizations";
import { IoCubeOutline, IoLanguageOutline, IoSave } from "react-icons/io5";

export default function CategoryForm({ isNew, categoryId, initialData, allCategories, initialLocalizations }: any) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"general" | "localizations">("general");
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        id: initialData?.id,
        name: initialData?.name || "",
        slug: initialData?.slug || "",
        description: initialData?.description || "",
        parent_id: initialData?.parent_id || null,
        active: initialData?.active ?? true,
        sort: initialData?.sort || 0,
    });

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setSaving(true);
        const res = await upsertCategoryAction(form);
        setSaving(false);

        if (res.success) {
            alert("✅ " + res.message);
            if (isNew && res.data?.id) {
                router.replace(`/admin/categories/${res.data.id}`);
            } else {
                router.refresh();
            }
        } else {
            alert("❌ " + res.message);
        }
    };

    return (
        <div className="grid gap-6 pb-20">
            {/* TABS */}
            <div className="border-b" style={{ borderColor: "var(--admin-card-border)" }}>
                <nav className="flex space-x-6">
                    <button
                        onClick={() => setActiveTab("general")}
                        className={`pb-3 flex items-center gap-2 font-medium transition-colors border-b-2 ${activeTab === "general" ? "border-[var(--admin-accent)]" : "border-transparent opacity-60"
                            }`}
                        style={{ color: activeTab === "general" ? "var(--admin-accent)" : "var(--admin-muted)" }}
                    >
                        <IoCubeOutline /> Genel Bilgiler
                    </button>
                    <button
                        onClick={() => setActiveTab("localizations")}
                        disabled={isNew}
                        className={`pb-3 flex items-center gap-2 font-medium transition-colors border-b-2 ${activeTab === "localizations" ? "border-[var(--admin-accent)]" : "border-transparent opacity-60"
                            }`}
                        style={{
                            color: activeTab === "localizations" ? "var(--admin-accent)" : "var(--admin-muted)",
                            cursor: isNew ? "not-allowed" : "pointer"
                        }}
                    >
                        <IoLanguageOutline /> Çeviriler
                    </button>
                </nav>
            </div>

            {/* GENERAL TAB */}
            {activeTab === "general" && (
                <form onSubmit={handleSave} className="card-admin grid gap-6 animate-in fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="admin-label">Kategori Adı *</label>
                            <input
                                className="admin-input"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="admin-label">Slug</label>
                            <input
                                className="admin-input"
                                value={form.slug}
                                onChange={e => setForm({ ...form, slug: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="admin-label">Açıklama</label>
                        <textarea
                            className="admin-textarea"
                            rows={3}
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="admin-label">Üst Kategori</label>
                            <select
                                className="admin-select"
                                value={form.parent_id || ""}
                                onChange={e => setForm({ ...form, parent_id: e.target.value ? Number(e.target.value) : null })}
                            >
                                <option value="">-- Ana Kategori --</option>
                                {allCategories
                                    .filter((c: any) => c.id !== categoryId) // Kendisini seçemesin
                                    .map((c: any) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="admin-label">Sıra</label>
                            <input
                                type="number"
                                className="admin-input"
                                value={form.sort}
                                onChange={e => setForm({ ...form, sort: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="admin-label">Durum</label>
                            <div className="flex items-center gap-3 border p-3 rounded" style={{ borderColor: "var(--admin-input-border)" }}>
                                <input
                                    type="checkbox"
                                    checked={form.active}
                                    onChange={e => setForm({ ...form, active: e.target.checked })}
                                    className="w-5 h-5 accent-[var(--admin-accent)]"
                                />
                                <label>Aktif</label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t" style={{ borderColor: "var(--admin-card-border)" }}>
                        <button type="submit" disabled={saving} className="btn-admin btn-admin-primary px-8">
                            <IoSave size={18} className="mr-2" />
                            {saving ? "Kaydediliyor..." : "Kaydet"}
                        </button>
                    </div>
                </form>
            )}

            {/* LOCALIZATIONS TAB */}
            {activeTab === "localizations" && (
                <div className="animate-in fade-in">
                    <CategoryLocalizations
                        categoryId={categoryId!}
                        defaultName={form.name}
                        defaultDescription={form.description}
                        initialLocalizations={initialLocalizations}
                    />
                </div>
            )}
        </div>
    );
}