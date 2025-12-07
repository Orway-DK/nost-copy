"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateScrollingCategoriesAction } from "./actions";
import { IoSave, IoRefresh, IoEye, IoEyeOff } from "react-icons/io5";
import { toast } from "react-hot-toast";

type CategoryItem = {
    id: number;
    slug: string;
    active: boolean;
    sort: number;
    name: string;
};

export default function ScrollingCategoriesList({ initialItems }: { initialItems: CategoryItem[] }) {
    const router = useRouter();
    const [items, setItems] = useState(initialItems);
    const [isDirty, setIsDirty] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleLocalUpdate = (id: number, field: keyof CategoryItem, value: any) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
        setIsDirty(true);
    };

    const handleSave = async () => {
        setSaving(true);
        const promise = updateScrollingCategoriesAction(items);

        toast.promise(promise, {
            loading: 'Kaydediliyor...',
            success: (res) => {
                if (!res.success) throw new Error(res.message);
                setIsDirty(false);
                router.refresh();
                return res.message || 'Başarıyla güncellendi!';
            },
            error: (err) => err.message || 'Bir hata oluştu.',
        });

        try {
            await promise;
        } catch {
            // Hata toast.promise içinde handle edildi
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 pb-20">
            {/* TOOLBAR */}
            <div className="flex justify-between items-center bg-[var(--admin-card)] p-4 rounded-xl border" style={{ borderColor: "var(--admin-card-border)" }}>
                <div className="text-sm font-medium" style={{ color: "var(--admin-muted)" }}>
                    Toplam {items.length} kategori listeleniyor.
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => router.refresh()}
                        className="btn-admin btn-admin-secondary"
                        title="Yenile"
                    >
                        <IoRefresh size={18} />
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !isDirty}
                        className={`btn-admin flex items-center gap-2 px-6 transition-all ${
                            isDirty 
                                ? "btn-admin-primary shadow-lg scale-105" 
                                : "btn-admin-secondary opacity-50 cursor-not-allowed"
                        }`}
                    >
                        <IoSave size={18} />
                        {saving ? "Kaydediliyor..." : "Sıralamayı Kaydet"}
                    </button>
                </div>
            </div>

            {/* LISTE */}
            <div className="card-admin overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead style={{ backgroundColor: "var(--admin-input-bg)", borderBottom: "1px solid var(--admin-card-border)" }}>
                            <tr className="text-xs uppercase font-semibold" style={{ color: "var(--admin-muted)" }}>
                                <th className="py-4 pl-6 w-20 text-center">Sıra</th>
                                <th className="py-4 px-4 w-24 text-center">Durum</th>
                                <th className="py-4 px-4">Kategori Adı</th>
                                <th className="py-4 px-4">Slug</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: "var(--admin-card-border)" }}>
                            {items.map((item) => (
                                <tr key={item.id} className={`group transition-colors hover:bg-[var(--admin-bg)]/50 ${!item.active ? "opacity-60 bg-gray-50 dark:bg-gray-900/20" : ""}`}>
                                    
                                    {/* SIRA INPUT */}
                                    <td className="py-3 pl-6">
                                        <input
                                            type="number"
                                            className="admin-input text-center h-9 font-medium"
                                            value={item.sort}
                                            onChange={(e) => handleLocalUpdate(item.id, "sort", parseInt(e.target.value))}
                                        />
                                    </td>

                                    {/* AKTİFLİK TOGGLE */}
                                    <td className="py-3 px-4 text-center">
                                        <button
                                            onClick={() => handleLocalUpdate(item.id, "active", !item.active)}
                                            className={`p-2 rounded-lg transition-colors flex items-center justify-center mx-auto ${
                                                item.active 
                                                    ? "text-[var(--admin-success)] bg-[var(--admin-success)]/10" 
                                                    : "text-[var(--admin-muted)] bg-[var(--admin-input-bg)]"
                                            }`}
                                            title={item.active ? "Yayında" : "Gizli"}
                                        >
                                            {item.active ? <IoEye size={20} /> : <IoEyeOff size={20} />}
                                        </button>
                                    </td>

                                    {/* BİLGİLER */}
                                    <td className="py-3 px-4 font-medium" style={{ color: "var(--admin-fg)" }}>
                                        {item.name}
                                    </td>
                                    <td className="py-3 px-4 text-sm font-mono opacity-60" style={{ color: "var(--admin-muted)" }}>
                                        {item.slug}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}