"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
    searchProductsAction, 
    addReadyProductAction, 
    bulkUpdateReadyProductsAction, 
    deleteReadyProductAction 
} from "./actions";
import { IoTrash, IoAdd, IoSearch, IoClose, IoCubeOutline, IoSave } from "react-icons/io5";
import { toast } from "react-hot-toast";

// --- YARDIMCI FONKSİYON: URL OLUŞTURUCU ---
const getImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("/")) return path;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${path}`;
};

type ReadyProductItem = {
    id: number;
    product_id: number;
    active: boolean;
    sort_order: number;
    price_try: number | null;
    price_usd: number | null;
    price_eur: number | null;
    custom_url: string | null;
    product_name: string;
    product_sku: string;
    main_image_url: string | null;
};

export default function ReadyProductsList({ initialItems }: { initialItems: ReadyProductItem[] }) {
    const router = useRouter();
    const [items, setItems] = useState(initialItems);
    const [isDirty, setIsDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [busyId, setBusyId] = useState<number | null>(null);

    // HANDLERS
    const handleLocalUpdate = (id: number, field: string, value: any) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
        setIsDirty(true);
    };

    const handleBulkSave = async () => {
        setSaving(true);
        const promise = bulkUpdateReadyProductsAction(items);
        
        toast.promise(promise, {
            loading: "Kaydediliyor...",
            success: (res) => {
                if (!res.success) throw new Error(res.message);
                setIsDirty(false);
                router.refresh();
                return res.message;
            },
            error: (err) => err.message
        });

        try { await promise; } finally { setSaving(false); }
    };

    const handleAdd = async (productId: number) => {
        const res = await addReadyProductAction(productId, items.length);
        if (res.success) {
            toast.success(res.message);
            setIsModalOpen(false);
            setSearchTerm("");
            setSearchResults([]);
            router.refresh();
        } else {
            toast.error(res.message);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Silmek istediğinize emin misiniz?")) return;
        setBusyId(id);
        const res = await deleteReadyProductAction(id);
        setBusyId(null);
        
        if (res.success) {
            toast.success(res.message);
            setItems(prev => prev.filter(i => i.id !== id));
            router.refresh();
        } else {
            toast.error(res.message);
        }
    };

    const handleSearch = async (term: string) => {
        setSearchTerm(term);
        if (term.length < 2) {
            setSearchResults([]);
            return;
        }
        setSearching(true);
        const existingIds = items.map(i => i.product_id);
        const res = await searchProductsAction(term, existingIds);
        setSearching(false);
        if (res.success) setSearchResults(res.data);
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-semibold flex items-center gap-2" style={{ color: "var(--admin-fg)" }}>
                        Hazır Ürünler
                        <span className="text-sm font-normal px-2 py-0.5 rounded-full border"
                              style={{
                                  backgroundColor: "var(--admin-input-bg)",
                                  color: "var(--admin-muted)",
                                  borderColor: "var(--admin-card-border)"
                              }}>
                            {items.length}
                        </span>
                    </h2>
                    <p className="text-sm" style={{ color: "var(--admin-muted)" }}>Anasayfada listelenen özel fiyatlı ürünler.</p>
                </div>
                
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-admin border hover:border-[var(--admin-accent)] transition-colors"
                        style={{ backgroundColor: "var(--admin-card)", color: "var(--admin-fg)", borderColor: "var(--admin-card-border)" }}
                    >
                        <IoAdd size={18} className="mr-2" /> Ürün Seç
                    </button>

                    <button
                        onClick={handleBulkSave}
                        disabled={saving || !isDirty}
                        className={`btn-admin flex items-center gap-2 px-6 transition-all ${
                            isDirty 
                                ? "btn-admin-primary shadow-lg scale-105" 
                                : "btn-admin-secondary opacity-50 cursor-not-allowed"
                        }`}
                    >
                        <IoSave size={18} />
                        {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                    </button>
                </div>
            </div>

            <div className="card-admin overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead style={{ backgroundColor: "var(--admin-input-bg)", borderBottom: "1px solid var(--admin-card-border)" }}>
                            <tr className="text-xs uppercase font-semibold" style={{ color: "var(--admin-muted)" }}>
                                <th className="py-4 pl-4 w-16 text-center">Sıra</th>
                                <th className="py-4 px-2 w-20 text-center">Görsel</th>
                                <th className="py-4 px-4">Ürün Bilgisi</th>
                                <th className="py-4 px-2 w-28">TRY</th>
                                <th className="py-4 px-2 w-28">USD</th>
                                <th className="py-4 px-2 w-28">EUR</th>
                                <th className="py-4 px-4 w-24 text-center">Durum</th>
                                <th className="py-4 px-4 w-16 text-center">Sil</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: "var(--admin-card-border)" }}>
                            {items.map((item) => {
                                const imgUrl = getImageUrl(item.main_image_url);
                                return (
                                    <tr key={item.id} className="group transition-colors hover:bg-[var(--admin-bg)]/50">
                                        <td className="py-3 pl-4">
                                            <input
                                                type="number"
                                                className="admin-input text-center h-8 text-sm"
                                                value={item.sort_order}
                                                onChange={(e) => handleLocalUpdate(item.id, "sort_order", parseInt(e.target.value))}
                                            />
                                        </td>
                                        <td className="py-3 px-2 text-center">
                                            <div className="relative w-10 h-10 rounded border mx-auto overflow-hidden flex items-center justify-center bg-[var(--admin-input-bg)]"
                                                 style={{ borderColor: "var(--admin-input-border)" }}>
                                                {imgUrl ? (
                                                    <Image src={imgUrl} alt="" fill className="object-cover" unoptimized />
                                                ) : (
                                                    <IoCubeOutline className="opacity-30" size={20} />
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-medium" style={{ color: "var(--admin-fg)" }}>{item.product_name}</div>
                                            <div className="text-xs font-mono opacity-60" style={{ color: "var(--admin-muted)" }}>{item.product_sku}</div>
                                        </td>
                                        <td className="py-3 px-2">
                                            <input
                                                type="number"
                                                className="admin-input h-8 text-sm text-right"
                                                value={item.price_try || ""}
                                                onChange={(e) => handleLocalUpdate(item.id, "price_try", parseFloat(e.target.value))}
                                                placeholder="0"
                                            />
                                        </td>
                                        <td className="py-3 px-2">
                                            <input
                                                type="number"
                                                className="admin-input h-8 text-sm text-right"
                                                value={item.price_usd || ""}
                                                onChange={(e) => handleLocalUpdate(item.id, "price_usd", parseFloat(e.target.value))}
                                                placeholder="0"
                                            />
                                        </td>
                                        <td className="py-3 px-2">
                                            <input
                                                type="number"
                                                className="admin-input h-8 text-sm text-right"
                                                value={item.price_eur || ""}
                                                onChange={(e) => handleLocalUpdate(item.id, "price_eur", parseFloat(e.target.value))}
                                                placeholder="0"
                                            />
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <div className="flex justify-center">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        className="sr-only peer"
                                                        checked={item.active}
                                                        onChange={(e) => handleLocalUpdate(item.id, "active", e.target.checked)}
                                                    />
                                                    <div className="w-9 h-5 rounded-full peer-focus:outline-none peer transition-colors"
                                                         style={{ backgroundColor: item.active ? "var(--admin-success)" : "var(--admin-input-border)" }}>
                                                    </div>
                                                    <div className="absolute top-[2px] left-[2px] bg-[var(--admin-card)] rounded-full h-4 w-4 transition-all border border-[var(--admin-input-border)] peer-checked:translate-x-full peer-checked:border-white"></div>
                                                </label>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <button 
                                                onClick={() => handleDelete(item.id)}
                                                disabled={busyId === item.id}
                                                className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:bg-[var(--admin-danger)]/10 text-[var(--admin-muted)] hover:text-[var(--admin-danger)]"
                                            >
                                                <IoTrash size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="py-8 text-center opacity-50" style={{ color: "var(--admin-muted)" }}>
                                        Henüz ekli ürün yok.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4"
                         style={{ backgroundColor: "var(--admin-card)", color: "var(--admin-fg)" }}>
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold">Ürün Ekle</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ color: "var(--admin-muted)" }}>
                                <IoClose size={24} />
                            </button>
                        </div>

                        <div className="relative">
                            <IoSearch className="absolute left-3 top-3 opacity-50" />
                            <input
                                className="admin-input pl-10"
                                placeholder="Ürün adı veya SKU ara..."
                                autoFocus
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>

                        <div className="max-h-60 overflow-y-auto space-y-2 border-t pt-2" style={{ borderColor: "var(--admin-card-border)" }}>
                            {searching && <p className="text-center py-2 text-sm opacity-50">Aranıyor...</p>}
                            
                            {!searching && searchResults.map(prod => {
                                const prodImg = getImageUrl(prod.image_key);
                                return (
                                    <button
                                        key={prod.id}
                                        onClick={() => handleAdd(prod.id)}
                                        className="w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors hover:bg-[var(--admin-input-bg)] group"
                                    >
                                        <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0 border"
                                             style={{ backgroundColor: "var(--admin-input-bg)", borderColor: "var(--admin-input-border)" }}>
                                            {prodImg ? (
                                                <Image src={prodImg} alt="" fill className="object-cover" unoptimized />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs opacity-50">Yok</div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm">{prod.name}</div>
                                            <div className="text-xs opacity-60 font-mono">{prod.sku}</div>
                                        </div>
                                        <div className="ml-auto text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--admin-info)" }}>
                                            Seç
                                        </div>
                                    </button>
                                );
                            })}
                            {!searching && searchTerm.length > 1 && searchResults.length === 0 && (
                                <div className="text-center py-4 text-sm opacity-50">Sonuç bulunamadı.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}