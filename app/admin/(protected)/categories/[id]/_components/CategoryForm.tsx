// orway-dk/nost-copy/nost-copy-d541a3f124d8a8bc7c3eeea745918156697a239e/app/admin/(protected)/categories/[id]/_components/CategoryForm.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";
import CategoryLocalizations from "./CategoryLocalizations";
import { IoCubeOutline, IoLanguageOutline } from "react-icons/io5";

type CategoryData = {
    id?: number;
    name: string;
    description: string | null;
    slug: string;
    parent_id: number | null;
    active: boolean;
    sort: number;
};

const emptyForm: CategoryData = {
    name: "",
    description: "",
    slug: "",
    parent_id: null,
    active: true,
    sort: 0,
};

export default function CategoryForm({ categoryId, isNew }: { categoryId: number | null, isNew: boolean }) {
    const router = useRouter();
    const [form, setForm] = useState<CategoryData>(emptyForm);
    const [allCategories, setAllCategories] = useState<{ id: number, name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<"general" | "localizations">("general");

    useEffect(() => {
        fetch("/api/admin/categories")
            .then(res => res.json())
            .then(json => {
                if (json.data) setAllCategories(json.data);
            });
    }, []);

    useEffect(() => {
        if (isNew) {
            setLoading(false);
            return;
        }
        if (categoryId) {
            fetch(`/api/admin/categories/${categoryId}`)
                .then(res => res.json())
                .then(json => {
                    if (json.data) setForm({
                        ...json.data,
                        description: json.data.description || ""
                    });
                    setLoading(false);
                });
        }
    }, [categoryId, isNew]);

    const onChange = (key: keyof CategoryData, val: any) => {
        setForm(prev => {
            const next = { ...prev, [key]: val };
            if (key === "name" && isNew) {
                next.slug = slugify(val);
            }
            return next;
        });
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = isNew ? "/api/admin/categories" : `/api/admin/categories/${categoryId}`;
            const method = isNew ? "POST" : "PATCH";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error);

            if (isNew && json.data?.id) {
                router.replace(`/admin/categories/${json.data.id}`);
            } else {
                alert("Kaydedildi.");
            }
        } catch (e: any) {
            alert(e.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-admin-muted p-10 text-center">Yükleniyor...</div>;

    return (
        <div className="grid gap-6">
            {/* TABS */}
            <div className="flex space-x-6 border-b border-admin-border mb-2">
                <button
                    type="button"
                    onClick={() => setActiveTab("general")}
                    className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${activeTab === "general" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"}`}
                >
                    <IoCubeOutline /> Genel Bilgiler
                </button>
                <button
                    type="button"
                    // disabled={isNew} // Artık tıklanabilir, içeride uyarı vereceğiz
                    onClick={() => setActiveTab("localizations")}
                    className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${activeTab === "localizations" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                >
                    <IoLanguageOutline /> Çeviriler
                </button>
            </div>

            {/* GENERAL TAB */}
            {activeTab === "general" && (
                <form onSubmit={onSubmit} className="card-admin grid gap-6 animate-in fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="admin-label">Kategori Adı *</label>
                            <input className="admin-input" value={form.name} onChange={e => onChange("name", e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <label className="admin-label">Slug</label>
                            <input className="admin-input" value={form.slug} onChange={e => onChange("slug", e.target.value)} required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="admin-label">Kategori Açıklaması</label>
                        <textarea
                            className="admin-textarea min-h-[100px]"
                            value={form.description || ""}
                            onChange={e => onChange("description", e.target.value)}
                            placeholder="Kategori hakkında kısa bilgi..."
                        />
                        <p className="admin-help">Çeviriler için kaynak olarak kullanılır.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="admin-label">Üst Kategori (Parent)</label>
                            <select
                                className="admin-select"
                                value={form.parent_id || ""}
                                onChange={e => onChange("parent_id", e.target.value ? parseInt(e.target.value) : null)}
                            >
                                <option value="">-- Ana Kategori --</option>
                                {allCategories
                                    .filter(c => c.id !== categoryId)
                                    .map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="admin-label">Sıra (Sort Order)</label>
                            <input
                                type="number"
                                className="admin-input"
                                value={form.sort}
                                onChange={e => onChange("sort", parseInt(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="admin-label">Durum</label>
                            <select
                                className="admin-select"
                                value={form.active ? "true" : "false"}
                                onChange={e => onChange("active", e.target.value === "true")}
                            >
                                <option value="true">Aktif</option>
                                <option value="false">Pasif</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={saving} className="btn-admin btn-admin-primary px-8">
                            {saving ? "Kaydediliyor..." : "Kaydet"}
                        </button>
                    </div>
                </form>
            )}

            {/* LOCALIZATIONS TAB */}
            {activeTab === "localizations" && (
                <div className="animate-in fade-in">
                    {categoryId ? (
                        <CategoryLocalizations
                            categoryId={categoryId}
                            defaultName={form.name}
                            defaultDescription={form.description || ""}
                        />
                    ) : (
                        <div className="card-admin p-12 text-center">
                            <div className="text-red-500 font-medium mb-2">Önce kategoriyi kaydedin.</div>
                            <p className="text-admin-muted text-sm">Çeviri ekleyebilmek için kategorinin oluşturulması gerekmektedir.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}