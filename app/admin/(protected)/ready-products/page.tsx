"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { IoTrash, IoAdd, IoSave, IoSearch } from "react-icons/io5";
import Image from "next/image";

type ReadyProduct = {
    id: number;
    product_id: number;
    active: boolean;
    sort_order: number;
    price_try: number | null;
    price_usd: number | null;
    price_eur: number | null;
    custom_url: string | null;
    products: {
        name: string;
        sku: string;
        product_media: { image_key: string }[];
    };
};

export default function ReadyProductsPage() {
    const supabase = createSupabaseBrowserClient();
    const [items, setItems] = useState<ReadyProduct[]>([]);
    const [loading, setLoading] = useState(true);

    // Ürün Ekleme Modalı için State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);

    const fetchItems = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("homepage_ready_products")
            .select(`
                *,
                products (
                    id, name, sku,
                    product_media (image_key)
                )
            `)
            .order("sort_order", { ascending: true });

        if (!error && data) setItems(data as any);
        setLoading(false);
    };

    useEffect(() => {
        fetchItems();
    }, []);

    // Ürün Arama
    const handleSearch = async (term: string) => {
        setSearchTerm(term);
        if (term.length < 2) {
            setSearchResults([]);
            return;
        }

        // Zaten listede olanları hariç tutmak için ID'leri al
        const existingIds = items.map(i => i.product_id);

        const { data } = await supabase
            .from("products")
            .select("id, name, sku, product_media(image_key)")
            .ilike("name", `%${term}%`)
            .not("id", "in", `(${existingIds.length ? existingIds.join(',') : '0'})`) // Zaten ekli olanları getirme
            .limit(10);

        if (data) setSearchResults(data);
    };

    // Listeye Ekleme
    const addProduct = async (productId: number) => {
        const { error } = await supabase
            .from("homepage_ready_products")
            .insert({
                product_id: productId,
                active: true,
                sort_order: items.length + 1,
                price_try: 0, // Varsayılan değerler
                price_usd: 0,
                price_eur: 0
            });

        if (!error) {
            fetchItems();
            setIsModalOpen(false);
            setSearchTerm("");
            setSearchResults([]);
        }
    };

    // Güncelleme (Fiyat, Sıra vb.)
    const updateItem = async (id: number, field: string, value: any) => {
        // Optimistic update
        setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));

        await supabase
            .from("homepage_ready_products")
            .update({ [field]: value })
            .eq("id", id);
    };

    // Silme
    const deleteItem = async (id: number) => {
        if (!confirm("Listeden çıkarmak istediğine emin misin?")) return;

        await supabase.from("homepage_ready_products").delete().eq("id", id);
        setItems(prev => prev.filter(i => i.id !== id));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Anasayfa Hazır Ürünler</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-admin btn-admin-primary flex items-center gap-2"
                >
                    <IoAdd /> Ürün Ekle
                </button>
            </div>

            {/* LİSTE */}
            <div className="card-admin overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="p-3">Sıra</th>
                            <th className="p-3">Görsel</th>
                            <th className="p-3">Ürün Adı</th>
                            <th className="p-3">Fiyat (TRY)</th>
                            <th className="p-3">Fiyat (USD)</th>
                            <th className="p-3">Fiyat (EUR)</th>
                            <th className="p-3">Durum</th>
                            <th className="p-3 text-right">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {items.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="p-3 w-16">
                                    <input
                                        type="number"
                                        className="admin-input w-16 text-center py-1"
                                        value={item.sort_order}
                                        onChange={(e) => updateItem(item.id, "sort_order", parseInt(e.target.value))}
                                    />
                                </td>
                                <td className="p-3 w-16">
                                    <div className="relative w-12 h-12 rounded border bg-white overflow-hidden">
                                        {item.products.product_media?.[0]?.image_key ? (
                                            <Image
                                                src={item.products.product_media[0].image_key}
                                                alt={item.products.name}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-xs">No img</div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-3 font-medium">
                                    {item.products.name}
                                    <div className="text-xs text-gray-400">{item.products.sku}</div>
                                </td>
                                <td className="p-3 w-28">
                                    <input
                                        type="number"
                                        className="admin-input py-1"
                                        value={item.price_try || ""}
                                        placeholder="0.00"
                                        onChange={(e) => updateItem(item.id, "price_try", parseFloat(e.target.value))}
                                    />
                                </td>
                                <td className="p-3 w-28">
                                    <input
                                        type="number"
                                        className="admin-input py-1"
                                        value={item.price_usd || ""}
                                        placeholder="0.00"
                                        onChange={(e) => updateItem(item.id, "price_usd", parseFloat(e.target.value))}
                                    />
                                </td>
                                <td className="p-3 w-28">
                                    <input
                                        type="number"
                                        className="admin-input py-1"
                                        value={item.price_eur || ""}
                                        placeholder="0.00"
                                        onChange={(e) => updateItem(item.id, "price_eur", parseFloat(e.target.value))}
                                    />
                                </td>
                                <td className="p-3">
                                    <button
                                        onClick={() => updateItem(item.id, "active", !item.active)}
                                        className={`px-2 py-1 rounded text-xs font-medium ${item.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                                    >
                                        {item.active ? 'Aktif' : 'Pasif'}
                                    </button>
                                </td>
                                <td className="p-3 text-right">
                                    <button onClick={() => deleteItem(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded">
                                        <IoTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && !loading && (
                            <tr><td colSpan={8} className="p-4 text-center text-gray-500">Henüz ekli ürün yok.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ÜRÜN SEÇME MODALI */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg p-6">
                        <h3 className="text-lg font-bold mb-4">Ürün Seç</h3>

                        <div className="relative mb-4">
                            <IoSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                                className="admin-input pl-10"
                                placeholder="Ürün adı veya SKU ara..."
                                autoFocus
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>

                        <div className="max-h-60 overflow-y-auto space-y-2 border-t border-gray-100 pt-2">
                            {searchResults.map(prod => (
                                <button
                                    key={prod.id}
                                    onClick={() => addProduct(prod.id)}
                                    className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-left transition-colors"
                                >
                                    <div className="relative w-10 h-10 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                        {prod.product_media?.[0]?.image_key && (
                                            <Image src={prod.product_media[0].image_key} alt="" fill className="object-cover" unoptimized />
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm">{prod.name}</div>
                                        <div className="text-xs text-gray-400">{prod.sku}</div>
                                    </div>
                                    <div className="ml-auto text-blue-600 text-sm font-medium">Ekle</div>
                                </button>
                            ))}
                            {searchTerm.length > 1 && searchResults.length === 0 && (
                                <div className="text-center text-gray-500 py-4">Sonuç bulunamadı.</div>
                            )}
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button onClick={() => setIsModalOpen(false)} className="btn-admin btn-admin-secondary">Kapat</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}