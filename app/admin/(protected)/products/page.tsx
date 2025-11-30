// orway-dk/nost-copy/nost-copy-d541a3f124d8a8bc7c3eeea745918156697a239e/app/admin/(protected)/products/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { IoAdd, IoPencil, IoTrash, IoImageOutline, IoClose } from "react-icons/io5";

type ProductRow = {
    id: number;
    name: string | null;
    slug: string | null;
    sku: string | null;
    active: boolean;
    category_slug: string | null;
    size: string | null;
    main_image_url?: string | null; // Görsel alanı
};

export default function ProductsPage() {
    const [products, setProducts] = useState<ProductRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<number | null>(null);

    // Görsel Önizleme State'i
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const supabase = createSupabaseBrowserClient();

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            // GET isteği artık görseli de döndürüyor
            const res = await fetch("/api/admin/products");
            const json = await res.json();

            if (!res.ok) throw new Error(json.error || "Ürünler yüklenemedi.");

            setProducts(json.data || []);
        } catch (e: any) {
            setError(e?.message || "Ürünler yüklenemedi.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const deleteProduct = async (id: number) => {
        if (!confirm("Bu ürünü ve tüm varyasyonlarını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
            return;
        }

        setBusyId(id);
        setError(null);

        try {
            const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
            const json = await res.json();

            if (!res.ok) {
                throw new Error(json?.error || "Silme işlemi başarısız oldu.");
            }

            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (e: any) {
            setError(e?.message || "Silme sırasında hata oluştu.");
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="grid gap-6">
            <h2 className="text-2xl font-semibold">All Products ({products.length})</h2>

            {/* Header actions */}
            <div className="flex items-start justify-between gap-4">
                <div className="text-sm text-admin-muted">
                    {loading ? "Yükleniyor..." : `Toplam ${products.length} ürün`}
                </div>
                <div className="flex-1">
                    {error && <div className="alert-admin alert-admin-error">{error}</div>}
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/admin/products/new" className="btn-admin btn-admin-primary">
                        <IoAdd size={18} /> New Product
                    </Link>
                    <button className="btn-admin btn-admin-secondary" onClick={fetchProducts} disabled={loading}>
                        Yenile
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="table-admin overflow-x-auto">
                <table className="w-full">
                    <thead className="thead-admin">
                        <tr>
                            <th className="th-admin w-16">ID</th>
                            <th className="th-admin w-20 text-center">Image</th>
                            <th className="th-admin">Product Name</th>
                            <th className="th-admin">SKU</th>
                            <th className="th-admin">Category</th>
                            <th className="th-admin">Status</th>
                            <th className="th-admin w-56">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr className="tr-admin">
                                <td className="td-admin" colSpan={7}>Yükleniyor...</td>
                            </tr>
                        ) : products.length === 0 ? (
                            <tr className="tr-admin">
                                <td className="td-admin" colSpan={7}>Hiç ürün yok.</td>
                            </tr>
                        ) : (
                            products.map((p) => (
                                <tr key={p.id} className="tr-admin row-admin-hover">
                                    <td className="td-admin font-mono text-xs text-admin-muted">{p.id}</td>

                                    {/* IMAGE COLUMN */}
                                    <td className="td-admin">
                                        <div className="flex justify-center">
                                            {p.main_image_url ? (
                                                <button
                                                    onClick={() => setPreviewImage(p.main_image_url!)}
                                                    className="relative w-10 h-10 rounded-md overflow-hidden border border-admin-border bg-white hover:scale-110 hover:shadow-md transition-transform cursor-zoom-in group"
                                                    title="Büyüt"
                                                >
                                                    <Image
                                                        src={p.main_image_url}
                                                        alt={p.name || "product"}
                                                        fill
                                                        className="object-cover"
                                                        unoptimized // Supabase storage URL'leri için
                                                    />
                                                </button>
                                            ) : (
                                                <div className="w-10 h-10 rounded-md bg-admin-input-bg border border-admin-border flex items-center justify-center text-admin-muted">
                                                    <IoImageOutline />
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    <td className="td-admin font-medium text-admin-accent">{p.name || "(No Name)"}</td>
                                    <td className="td-admin text-xs">{p.sku || "—"}</td>
                                    <td className="td-admin text-xs">
                                        <span className="bg-admin-input-bg px-2 py-1 rounded text-admin-fg/80 border border-admin-border">
                                            {p.category_slug || "—"}
                                        </span>
                                    </td>
                                    <td className="td-admin">
                                        <span className={`badge-admin ${p.active ? 'badge-admin-success' : 'badge-admin-default'}`}>
                                            {p.active ? 'Active' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="td-admin">
                                        <div className="flex items-center gap-2">
                                            <Link href={`/admin/products/${p.id}`} className="btn-admin btn-admin-secondary p-2 leading-none" title="Edit">
                                                <IoPencil size={16} />
                                            </Link>
                                            <button
                                                className="btn-admin btn-admin-danger p-2 leading-none"
                                                onClick={() => deleteProduct(p.id)}
                                                disabled={busyId === p.id}
                                                title="Delete"
                                            >
                                                <IoTrash size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* FULL SCREEN IMAGE MODAL */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setPreviewImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-2 transition-colors"
                        onClick={() => setPreviewImage(null)}
                    >
                        <IoClose size={32} />
                    </button>

                    <div
                        className="relative w-full h-full max-w-5xl max-h-[85vh] flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()} // Resme tıklayınca kapanmasın
                    >
                        <Image
                            src={previewImage}
                            alt="Full Preview"
                            fill
                            className="object-contain drop-shadow-2xl"
                            unoptimized
                        />
                    </div>
                </div>
            )}
        </div>
    );
}