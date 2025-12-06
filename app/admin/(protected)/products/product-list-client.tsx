// app/admin/(protected)/products/product-list-client.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { deleteProductAction } from "./actions";
import { IoPencil, IoTrash, IoImageOutline, IoClose } from "react-icons/io5";

export default function ProductListClient({ initialProducts }: { initialProducts: any[] }) {
    const [products, setProducts] = useState(initialProducts);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<number | null>(null);

    const handleDelete = async (id: number) => {
        if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
        setBusyId(id);

        const res = await deleteProductAction(id);
        if (res.success) {
            setProducts(prev => prev.filter(p => p.id !== id));
        } else {
            alert("Hata: " + res.message);
        }
        setBusyId(null);
    };

    return (
        <>
            <div className="table-admin overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead style={{ backgroundColor: "var(--admin-input-bg)", color: "var(--admin-muted)" }}>
                        <tr className="border-b" style={{ borderColor: "var(--admin-card-border)" }}>
                            <th className="py-3 px-4 w-16">ID</th>
                            <th className="py-3 px-4 w-20 text-center">Görsel</th>
                            <th className="py-3 px-4">Ürün Adı</th>
                            <th className="py-3 px-4">SKU</th>
                            <th className="py-3 px-4">Kategori</th>
                            <th className="py-3 px-4">Durum</th>
                            <th className="py-3 px-4 w-32 text-center">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: "var(--admin-card-border)" }}>
                        {products.length === 0 ? (
                            <tr><td colSpan={7} className="py-8 text-center" style={{ color: "var(--admin-muted)" }}>Kayıt yok.</td></tr>
                        ) : (
                            products.map((p) => (
                                <tr key={p.id} className="hover:bg-[var(--admin-bg)] transition-colors">
                                    <td className="py-3 px-4 text-xs font-mono opacity-50">{p.id}</td>

                                    {/* GÖRSEL ALANI - Senin çalışan kodundaki gibi */}
                                    <td className="py-3 px-4 text-center">
                                        {p.main_image_url ? (
                                            <button
                                                onClick={() => setPreviewImage(p.main_image_url)}
                                                className="w-10 h-10 relative rounded overflow-hidden border hover:scale-110 transition-transform block mx-auto"
                                                style={{ borderColor: "var(--admin-card-border)" }}
                                            >
                                                <Image
                                                    src={p.main_image_url}
                                                    alt="img"
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            </button>
                                        ) : (
                                            <div className="w-10 h-10 mx-auto rounded border flex items-center justify-center opacity-30" style={{ borderColor: "var(--admin-card-border)" }}>
                                                <IoImageOutline />
                                            </div>
                                        )}
                                    </td>

                                    <td className="py-3 px-4 font-medium" style={{ color: "var(--admin-fg)" }}>{p.name}</td>
                                    <td className="py-3 px-4 text-sm opacity-70">{p.sku || "-"}</td>
                                    <td className="py-3 px-4 text-sm">
                                        <span className="px-2 py-1 rounded text-xs border"
                                            style={{ backgroundColor: "var(--admin-input-bg)", borderColor: "var(--admin-card-border)" }}>
                                            {p.category_slug}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        {p.active ? (
                                            <span className="badge-admin badge-admin-success">Aktif</span>
                                        ) : (
                                            <span className="badge-admin badge-admin-default opacity-60">Pasif</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Link href={`/admin/products/${p.id}`} className="p-2 rounded hover:bg-[var(--admin-input-bg)]" style={{ color: "var(--admin-accent)" }}>
                                                <IoPencil size={18} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(p.id)}
                                                disabled={busyId === p.id}
                                                className="p-2 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                                            >
                                                <IoTrash size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {previewImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in" onClick={() => setPreviewImage(null)}>
                    <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
                        <Image
                            src={previewImage}
                            alt="preview"
                            fill
                            className="object-contain rounded-lg"
                            unoptimized
                        />
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-2"
                        >
                            <IoClose size={32} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}