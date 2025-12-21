// C:\Projeler\nost-copy\app\admin\(protected)\products\product-list-client.tsx
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
            {/* Tablo Container: card-admin stiliyle sarmalayabiliriz veya direkt table-admin kullanabiliriz */}
            <div className="overflow-x-auto rounded-lg border border-[var(--admin-card-border)]">
                <table className="table-admin border-none">
                    <thead className="thead-admin">
                        <tr>
                            <th className="th-admin w-16">ID</th>
                            <th className="th-admin w-20 text-center">Görsel</th>
                            <th className="th-admin">Ürün Adı</th>
                            <th className="th-admin">SKU</th>
                            <th className="th-admin">Kategori</th>
                            <th className="th-admin">Durum</th>
                            <th className="th-admin w-32 text-center">İşlem</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="td-admin py-8 text-center text-[var(--admin-muted)]">
                                    Kayıt yok.
                                </td>
                            </tr>
                        ) : (
                            products.map((p) => (
                                <tr key={p.id} className="tr-admin row-admin-hover">
                                    {/* ID */}
                                    <td className="td-admin font-mono opacity-50 text-xs">
                                        {p.id}
                                    </td>

                                    {/* GÖRSEL */}
                                    <td className="td-admin text-center">
                                        {p.main_image_url ? (
                                            <button
                                                onClick={() => setPreviewImage(p.main_image_url)}
                                                className="w-10 h-10 relative rounded overflow-hidden border border-[var(--admin-card-border)] hover:scale-110 transition-transform block mx-auto group"
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
                                            <div className="w-10 h-10 mx-auto rounded border border-[var(--admin-card-border)] flex items-center justify-center opacity-30 bg-[var(--admin-bg)]">
                                                <IoImageOutline />
                                            </div>
                                        )}
                                    </td>

                                    {/* ÜRÜN ADI */}
                                    <td className="td-admin font-medium text-[var(--admin-fg)]">
                                        {p.name}
                                    </td>

                                    {/* SKU */}
                                    <td className="td-admin text-sm opacity-70">
                                        {p.sku || "-"}
                                    </td>

                                    {/* KATEGORİ */}
                                    <td className="td-admin">
                                        <span className="badge-admin badge-admin-default bg-[var(--admin-input-bg)] border border-[var(--admin-card-border)]">
                                            {p.category_slug}
                                        </span>
                                    </td>

                                    {/* DURUM */}
                                    <td className="td-admin">
                                        {p.active ? (
                                            <span className="badge-admin badge-admin-success">Aktif</span>
                                        ) : (
                                            <span className="badge-admin badge-admin-default opacity-60">Pasif</span>
                                        )}
                                    </td>

                                    {/* İŞLEM */}
                                    <td className="td-admin text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Link
                                                href={`/admin/products/${p.id}`}
                                                className="p-2 rounded-md hover:bg-[var(--admin-info)] hover:text-white text-[var(--admin-info)] transition-colors"
                                                title="Düzenle"
                                            >
                                                <IoPencil size={18} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(p.id)}
                                                disabled={busyId === p.id}
                                                className="p-2 rounded-md hover:bg-[var(--admin-danger)] hover:text-white text-[var(--admin-muted)] hover:opacity-100 transition-colors"
                                                title="Sil"
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
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
                        <Image
                            src={previewImage}
                            alt="preview"
                            fill
                            className="object-contain rounded-lg drop-shadow-2xl"
                            unoptimized
                        />
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-colors"
                        >
                            <IoClose size={32} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}