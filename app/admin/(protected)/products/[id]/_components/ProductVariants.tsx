// app/admin/(protected)/products/[id]/_components/ProductVariants.tsx
"use client";

import { useEffect, useState } from "react";
import { IoAdd, IoTrash, IoClose } from "react-icons/io5";

type Variant = {
    id: number;
    material_slug: string | null;
    grams: number | null;
    side_code: string | null;
    lamination: boolean;
    lamination_type_slug: string | null;
    operations: string[] | null;
    attributes: any;
    product_prices?: { amount: number; currency: string }[];
};

const emptyVariant = {
    material_slug: "",
    grams: 0,
    side_code: "",
    lamination: false,
    lamination_type_slug: "",
    operations: "", // Virgülle ayrılmış string olarak alacağız
    attributes: "{}", // JSON string olarak
};

export default function ProductVariants({ productId }: { productId: number }) {
    const [variants, setVariants] = useState<Variant[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [form, setForm] = useState(emptyVariant);
    const [saving, setSaving] = useState(false);

    const fetchVariants = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/products/${productId}/variants`);
            const json = await res.json();
            if (json.data) setVariants(json.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVariants();
    }, [productId]);

    const handleDelete = async (id: number) => {
        if (!confirm("Bu varyasyonu silmek istediğinize emin misiniz?")) return;
        try {
            const res = await fetch(`/api/admin/products/${productId}/variants/${id}`, { method: "DELETE" });
            if (res.ok) {
                setVariants(prev => prev.filter(v => v.id !== id));
            } else {
                alert("Silinemedi");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Veri hazırlığı
            const payload = {
                ...form,
                grams: Number(form.grams),
                operations: form.operations.split(",").map(s => s.trim()).filter(Boolean),
                attributes: JSON.parse(form.attributes || "{}"),
                // Eğer lamination false ise type null olmalı
                lamination_type_slug: form.lamination ? form.lamination_type_slug : null
            };

            const res = await fetch(`/api/admin/products/${productId}/variants`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Hata");

            // Listeye ekle
            setVariants(prev => [...prev, json.data]);
            setIsFormOpen(false);
            setForm(emptyVariant);

        } catch (e: any) {
            alert("Hata: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Yükleniyor...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Ürün Varyasyonları ({variants.length})</h3>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="btn-admin btn-admin-primary flex items-center gap-2"
                >
                    <IoAdd /> Yeni Ekle
                </button>
            </div>

            {/* LİSTE */}
            <div className="space-y-4">
                {variants.length === 0 && <p className="text-gray-500">Henüz varyasyon yok.</p>}
                {variants.map(v => (
                    <div key={v.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex justify-between items-start">
                        <div className="text-sm space-y-1">
                            <p><strong className="text-gray-600 dark:text-gray-400">Malzeme:</strong> {v.material_slug || "-"}</p>
                            <p><strong className="text-gray-600 dark:text-gray-400">Gramaj:</strong> {v.grams}g</p>
                            <p><strong className="text-gray-600 dark:text-gray-400">Yön:</strong> {v.side_code}</p>
                            <p>
                                <strong className="text-gray-600 dark:text-gray-400">Laminasyon:</strong>
                                {v.lamination ? ` Evet (${v.lamination_type_slug})` : " Hayır"}
                            </p>
                            {v.product_prices && v.product_prices.length > 0 && (
                                <p className="text-green-600 font-medium mt-2">
                                    Fiyat: {v.product_prices[0].amount} {v.product_prices[0].currency}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => handleDelete(v.id)}
                            className="text-red-500 hover:bg-red-50 p-2 rounded"
                            title="Sil"
                        >
                            <IoTrash size={18} />
                        </button>
                    </div>
                ))}
            </div>

            {/* EKLEME FORMU (Basit Modal/Inline) */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Yeni Varyasyon</h3>
                            <button onClick={() => setIsFormOpen(false)}><IoClose size={24} /></button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="admin-label">Malzeme Slug</label>
                                <input
                                    className="admin-input"
                                    value={form.material_slug}
                                    onChange={e => setForm({ ...form, material_slug: e.target.value })}
                                    placeholder="örn: kuşe, 1.hamur"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="admin-label">Gramaj (g)</label>
                                <input
                                    className="admin-input"
                                    type="number"
                                    value={form.grams}
                                    onChange={e => setForm({ ...form, grams: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="admin-label">Yön Kodu (Side)</label>
                                <input
                                    className="admin-input"
                                    value={form.side_code}
                                    onChange={e => setForm({ ...form, side_code: e.target.value })}
                                    placeholder="örn: on, on-arka"
                                />
                            </div>

                            <div className="space-y-1 border p-2 rounded">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.lamination}
                                        onChange={e => setForm({ ...form, lamination: e.target.checked })}
                                    />
                                    <span className="font-medium">Laminasyon Var mı?</span>
                                </label>
                                {form.lamination && (
                                    <input
                                        className="admin-input mt-2"
                                        value={form.lamination_type_slug}
                                        onChange={e => setForm({ ...form, lamination_type_slug: e.target.value })}
                                        placeholder="Tip slug (mat, parlak)"
                                    />
                                )}
                            </div>

                            <div className="space-y-1 md:col-span-2">
                                <label className="admin-label">Operasyonlar (Virgülle ayırın)</label>
                                <input
                                    className="admin-input"
                                    value={form.operations}
                                    onChange={e => setForm({ ...form, operations: e.target.value })}
                                    placeholder="örn: selefon, kırım"
                                />
                            </div>

                            <div className="space-y-1 md:col-span-2">
                                <label className="admin-label">Ek Özellikler (JSON)</label>
                                <textarea
                                    className="admin-textarea font-mono text-xs"
                                    rows={4}
                                    value={form.attributes}
                                    onChange={e => setForm({ ...form, attributes: e.target.value })}
                                    placeholder='{"binding": "tel-dikis"}'
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setIsFormOpen(false)} className="btn-admin btn-admin-secondary">İptal</button>
                            <button onClick={handleSave} disabled={saving} className="btn-admin btn-admin-primary">
                                {saving ? "Kaydediliyor..." : "Kaydet"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}