// orway-dk/nost-copy/nost-copy-d541a3f124d8a8bc7c3eeea745918156697a239e/app/admin/(protected)/products/[id]/_components/ProductForm.tsx
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import MediaPickerModal from "@/app/admin/(protected)/_components/MediaPickerModal";
import ProductLocalizations from "./ProductLocalizations";
import ProductVariants from "./ProductVariants";
import { IoImageOutline, IoConstructOutline, IoLanguageOutline, IoCubeOutline } from "react-icons/io5";

type ProductRow = {
    id: number;
    sku: string;
    category_slug: string;
    name: string;
    description: string | null;
    size: string;
    min_quantity: number;
    media_base_path: string;
    active: boolean;
    slug: string;
    main_image_url?: string;
};

type FormState = Omit<ProductRow, 'id'> & {
    slug_manually_changed: boolean;
    main_image_url: string;
};

const DEFAULT_IMAGE = "/nost.png";

const emptyForm: FormState = {
    sku: "",
    category_slug: "",
    name: "",
    description: "",
    size: "35x50",
    min_quantity: 20,
    media_base_path: "/public/media/products",
    active: true,
    slug: "",
    slug_manually_changed: false,
    main_image_url: DEFAULT_IMAGE,
};

interface ProductFormProps {
    productId: number | null;
    isNew: boolean;
}

export default function ProductForm({ productId, isNew }: ProductFormProps) {
    const router = useRouter();
    const supabase = createSupabaseBrowserClient();

    // -- State --
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(null);

    // Tab State
    const [activeTab, setActiveTab] = useState<"general" | "variants" | "localizations" | "media">("general");

    // Data State
    const [form, setForm] = useState<FormState>(emptyForm);
    const [categories, setCategories] = useState<string[]>([]);

    // Modal State
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

    // -- Effects --

    // 1. Kategorileri Çek
    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase.from("categories").select("slug");
            if (data) setCategories(data.map(c => c.slug));
        };
        fetchCategories();
    }, [supabase]);

    // 2. Ürün Yükle
    useEffect(() => {
        if (isNew) {
            setLoading(false);
            return;
        }

        if (productId === null || isNaN(productId)) {
            setError("Invalid Product ID format in URL path.");
            setLoading(false);
            return;
        }

        const fetchProduct = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/admin/products/${productId}`);
                const json = await res.json();

                if (!res.ok) throw new Error(json?.error || "Ürün detayları yüklenemedi.");

                const data = json.data;

                setForm({
                    sku: data.sku ?? "",
                    category_slug: data.category_slug ?? "",
                    name: data.name ?? "",
                    description: data.description ?? "",
                    size: data.size ?? "35x50",
                    min_quantity: data.min_quantity ?? 20,
                    media_base_path: data.media_base_path ?? "/public/media/products",
                    active: data.active,
                    slug: data.slug ?? "",
                    slug_manually_changed: true,
                    main_image_url: data.main_image_url || DEFAULT_IMAGE,
                });
            } catch (e: any) {
                setError(e?.message || "Ürün yüklenirken hata oluştu.");
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [isNew, productId]);

    // -- Handlers --

    function onChange<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm(prev => {
            const next = { ...prev, [key]: value };

            // İsim değişirse ve slug manuel değiştirilmediyse, slug'ı güncelle
            if (key === "name" && !prev.slug_manually_changed) {
                next.slug = slugify(value as string);
            }

            return next;
        });
    }

    function onSlugChange(val: string) {
        setForm(prev => ({
            ...prev,
            slug: slugify(val),
            slug_manually_changed: true
        }));
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setOk(null);

        try {
            if (!form.name.trim() || !form.category_slug.trim()) {
                throw new Error("Ürün adı ve kategori zorunludur.");
            }

            const method = isNew ? "POST" : "PATCH";
            const url = isNew ? "/api/admin/products" : `/api/admin/products?id=${productId}`;

            const payload = {
                ...form,
                min_quantity: Number(form.min_quantity),
                slug: form.slug,
                main_image_url: form.main_image_url,
            };

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const json = await res.json();

            if (!res.ok) throw new Error(json?.error || res.statusText);

            setOk(isNew ? "Ürün oluşturuldu." : "Güncellendi.");

            if (isNew && json.data?.id) {
                router.replace(`/admin/products/${json.data.id}`);
            }

        } catch (err: any) {
            setError(err?.message || "Bir hata oluştu.");
        } finally {
            setSaving(false);
        }
    }

    // -- Render Helpers --

    if (loading) return <div className="text-admin-muted py-10 text-center animate-pulse">Ürün bilgileri yükleniyor...</div>;

    if (!isNew && (productId === null || isNaN(productId))) {
        return <div className="alert-admin alert-admin-error">Geçersiz Ürün ID.</div>;
    }

    return (
        <div className="grid gap-6">

            {/* TABS HEADER */}
            <div className="border-b border-admin-border mb-2">
                <nav className="flex space-x-6 overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => setActiveTab("general")}
                        className={`pb-3 flex items-center gap-2 font-medium transition-colors border-b-2 ${activeTab === "general" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                    >
                        <IoCubeOutline /> Genel Bilgiler
                    </button>
                    <button
                        type="button"
                        disabled={isNew}
                        onClick={() => setActiveTab("variants")}
                        className={`pb-3 flex items-center gap-2 font-medium transition-colors border-b-2 ${activeTab === "variants" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"}`}
                    >
                        <IoConstructOutline /> Varyasyonlar
                    </button>
                    <button
                        type="button"
                        disabled={isNew}
                        onClick={() => setActiveTab("localizations")}
                        className={`pb-3 flex items-center gap-2 font-medium transition-colors border-b-2 ${activeTab === "localizations" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"}`}
                    >
                        <IoLanguageOutline /> Çeviriler
                    </button>
                    <button
                        type="button"
                        disabled={isNew}
                        onClick={() => setActiveTab("media")}
                        className={`pb-3 flex items-center gap-2 font-medium transition-colors border-b-2 ${activeTab === "media" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"}`}
                    >
                        <IoImageOutline /> Medya Galeri
                    </button>
                </nav>
            </div>

            {/* TAB CONTENTS */}
            {activeTab === "general" && (
                <form onSubmit={onSubmit} className="card-admin grid gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Status Bar */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-mono text-admin-muted uppercase tracking-wider">
                            {isNew ? "DRAFT MODE" : `SKU: ${form.sku || '---'}`}
                        </span>
                        <div className="space-x-2">
                            {error && <span className="text-sm text-red-500 font-medium">{error}</span>}
                            {ok && <span className="text-sm text-green-600 font-medium">{ok}</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LEFT COLUMN: Inputs */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="space-y-2">
                                <label className="admin-label">Ürün Adı *</label>
                                <input
                                    className="admin-input text-lg font-medium"
                                    value={form.name}
                                    onChange={(e) => onChange("name", e.target.value)}
                                    required
                                    placeholder="Örn: Kartvizit"
                                />
                            </div>

                            {/* YENİ: Açıklama Alanı */}
                            <div className="space-y-2">
                                <label className="admin-label">Ürün Açıklaması</label>
                                <textarea
                                    className="admin-textarea min-h-[120px]"
                                    value={form.description || ""}
                                    onChange={(e) => onChange("description", e.target.value)}
                                    placeholder="Ürün hakkında genel bilgi..."
                                />
                                <p className="admin-help">Bu metin diğer dillere çevrilirken kaynak olarak kullanılacaktır.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="admin-label">Slug (URL Yolu)</label>
                                <div className="flex items-center">
                                    <span className="bg-gray-100 dark:bg-gray-700 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg px-3 py-2 text-sm text-gray-500">
                                        /product/
                                    </span>
                                    <input
                                        className="admin-input rounded-l-none"
                                        value={form.slug}
                                        onChange={(e) => onSlugChange(e.target.value)}
                                        placeholder="otomatik-olusturulur"
                                    />
                                </div>
                                <p className="admin-help">Otomatik oluşturulur, gerekirse düzenleyebilirsiniz.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="admin-label">Kategori *</label>
                                    <select
                                        className="admin-select"
                                        value={form.category_slug}
                                        onChange={(e) => onChange("category_slug", e.target.value)}
                                        required
                                    >
                                        <option value="">-- Seçiniz --</option>
                                        {categories.map(slug => (
                                            <option key={slug} value={slug}>{slug}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="admin-label">SKU</label>
                                    <input
                                        className="admin-input"
                                        value={form.sku}
                                        onChange={(e) => onChange("sku", e.target.value)}
                                        placeholder="KOD-123"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="admin-label">Boyut</label>
                                    <input
                                        className="admin-input"
                                        value={form.size}
                                        onChange={(e) => onChange("size", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="admin-label">Min. Adet</label>
                                    <input
                                        className="admin-input"
                                        type="number"
                                        min="1"
                                        value={form.min_quantity}
                                        onChange={(e) => onChange("min_quantity", parseInt(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="admin-label">Durum</label>
                                    <select
                                        className="admin-select"
                                        value={form.active ? "true" : "false"}
                                        onChange={(e) => onChange("active", e.target.value === "true")}
                                    >
                                        <option value="true">Aktif</option>
                                        <option value="false">Pasif</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Media */}
                        <div className="space-y-6">
                            <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                                <label className="admin-label mb-3 block">Ana Görsel (Kapak)</label>
                                <div className="relative aspect-square w-full bg-white dark:bg-black rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 group">
                                    <Image
                                        src={form.main_image_url}
                                        alt="Main preview"
                                        fill
                                        className="object-contain p-2"
                                        unoptimized
                                    />
                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => setIsMediaModalOpen(true)}
                                            className="btn-admin btn-admin-secondary text-xs shadow-lg"
                                        >
                                            Değiştir
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-3 flex justify-between items-center">
                                    <span className="text-xs text-gray-400 truncate max-w-[200px]" title={form.main_image_url}>
                                        {form.main_image_url.split('/').pop()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-admin-border">
                        <button type="submit" className="btn-admin btn-admin-primary px-8" disabled={saving}>
                            {saving ? "İşleniyor..." : "Kaydet"}
                        </button>
                    </div>
                </form>
            )}

            {activeTab === "variants" && (
                <div className="card-admin p-6 animate-in fade-in">
                    {productId ? (
                        <ProductVariants productId={productId} />
                    ) : (
                        <div className="text-center text-red-500">Önce ürünü kaydedin.</div>
                    )}
                </div>
            )}

            {activeTab === "localizations" && (
                <div className="animate-in fade-in">
                    {productId ? (
                        <ProductLocalizations
                            productId={productId}
                            defaultName={form.name}
                            defaultDescription={form.description || ""}
                        />
                    ) : (
                        <div className="card-admin p-6 text-center text-red-500">Önce ürünü kaydedin.</div>
                    )}
                </div>
            )}

            {activeTab === "media" && (
                <div className="card-admin p-12 text-center text-gray-500">
                    <IoImageOutline className="mx-auto text-4xl mb-4 opacity-50" />
                    <p>Galeri yönetimi (ekstra görseller) henüz eklenmedi.</p>
                </div>
            )}

            {/* Media Picker Modal */}
            <MediaPickerModal
                isOpen={isMediaModalOpen}
                onClose={() => setIsMediaModalOpen(false)}
                onSelect={(url) => onChange("main_image_url", url)}
                bucketName="products"
            />
        </div>
    );
}