"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upsertCarousels } from "../actions";

type Language = { code: string; name: string; is_default: boolean };
export type Carousel = {
    id?: number;
    lang_code: string;
    title1: string;
    title2: string;
    image_link: string;
    sub_text: string;
    tips: string[]; // array of strings
    button_link: string;
    order_no?: number;
};

export default function CarouselForm({
    languages,
    initialBanners,
}: {
    languages: Language[];
    initialBanners: Carousel[];
}) {
    const router = useRouter();
    const [rows, setRows] = useState<Carousel[]>(
        // ensure rows are sorted by order_no for the initial UI
        [...initialBanners].sort((a, b) => (a.order_no ?? 0) - (b.order_no ?? 0))
    );
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Yeni: hangi dili filtreleyeceğimizi tutar (default TR)
    const [selectedLang, setSelectedLang] = useState<string>("TR");

    // Helpers
    const updateRow = (index: number, patch: Partial<Carousel>) => {
        setRows((prev) => {
            const newRows = [...prev];
            newRows[index] = { ...newRows[index], ...patch };
            return newRows;
        });
    };

    const addRow = () => {
        const defaultLang = selectedLang || languages[0]?.code || "en";
        const newRow: Carousel = {
            lang_code: defaultLang,
            title1: "",
            title2: "",
            image_link: "",
            sub_text: "",
            tips: [],
            button_link: "",
            order_no:
                rows.length > 0
                    ? Math.max(...rows.map((r) => r.order_no ?? 0)) + 1
                    : 0,
        };
        setRows((r) => [...r, newRow]);
    };

    const deleteRow = (index: number) => {
        setRows((prev) => {
            const newRows = [...prev];
            newRows.splice(index, 1);
            return newRows.map((r, idx) => ({ ...r, order_no: idx }));
        });
    };

    const moveUp = (index: number) => {
        if (index <= 0) return;
        setRows((prev) => {
            const newRows = [...prev];
            const tmp = newRows[index - 1];
            newRows[index - 1] = newRows[index];
            newRows[index] = tmp;
            return newRows.map((r, idx) => ({ ...r, order_no: idx }));
        });
    };

    const moveDown = (index: number) => {
        setRows((prev) => {
            if (index >= prev.length - 1) return prev;
            const newRows = [...prev];
            const tmp = newRows[index + 1];
            newRows[index + 1] = newRows[index];
            newRows[index] = tmp;
            return newRows.map((r, idx) => ({ ...r, order_no: idx }));
        });
    };

    const saveAll = async () => {
        setSaving(true);
        setError(null);
        setSuccess(null);
        try {
            const payload = rows.map((r) => ({
                ...r,
                tips: Array.isArray(r.tips) ? r.tips : ([] as string[]),
            }));
            const fd = new FormData();
            fd.append("items", JSON.stringify(payload));
            await upsertCarousels(fd);
            setSuccess("Carousel öğeleri kaydedildi.");
            router.refresh();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setSaving(false);
        }
    };

    // Filtrelenmiş satırlar: orijinal index'leri ile birlikte
    const filtered = rows
        .map((r, i) => ({ row: r, idx: i }))
        .filter(({ row }) => row.lang_code === selectedLang);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">Carousel Items</h2>

                <div className="flex gap-2 items-center">
                    <label className="text-sm mr-1">Dil</label>
                    <select
                        value={selectedLang}
                        onChange={(e) => setSelectedLang(e.target.value)}
                        className="rounded border px-2 py-1 text-sm"
                    >
                        <option value="DE">DE</option>
                        <option value="EN">EN</option>
                        <option value="TR">TR</option>
                    </select>

                    <button
                        type="button"
                        onClick={addRow}
                        className="rounded bg-green-600 text-white px-3 py-1 text-sm hover:bg-green-700"
                    >
                        Yeni Satır
                    </button>
                    <button
                        type="button"
                        onClick={saveAll}
                        disabled={saving}
                        className="rounded bg-blue-600 text-white px-4 py-1 text-sm hover:bg-blue-700 disabled:opacity-60"
                    >
                        {saving ? "Kaydediliyor..." : "Tümünü Kaydet"}
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {filtered.map(({ row, idx: origIdx }, localIdx) => (
                    <div
                        key={origIdx}
                        className="border rounded p-3 grid grid-cols-1 md:grid-cols-6 gap-2 items-start"
                    >
                        <div className="md:col-span-1">
                            <label className="block text-xs mb-1">Dil</label>
                            <select
                                value={row.lang_code}
                                onChange={(e) => updateRow(origIdx, { lang_code: e.target.value })}
                                className="w-full rounded border px-2 py-1 text-sm"
                            >
                                {languages.map((l) => (
                                    <option key={l.code} value={l.code}>
                                        {l.name} ({l.code})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs mb-1">Title 1</label>
                            <input
                                className="w-full rounded border px-2 py-1 text-sm"
                                value={row.title1}
                                onChange={(e) => updateRow(origIdx, { title1: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs mb-1">Title 2</label>
                            <input
                                className="w-full rounded border px-2 py-1 text-sm"
                                value={row.title2}
                                onChange={(e) => updateRow(origIdx, { title2: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-1 flex flex-col gap-1">
                            <label className="block text-xs mb-1">Sıra</label>
                            <div className="flex gap-1">
                                <button
                                    type="button"
                                    onClick={() => moveUp(origIdx)}
                                    disabled={origIdx === 0}
                                    className="rounded bg-gray-200 px-2 text-sm"
                                >
                                    ↑
                                </button>
                                <button
                                    type="button"
                                    onClick={() => moveDown(origIdx)}
                                    disabled={origIdx === rows.length - 1}
                                    className="rounded bg-gray-200 px-2 text-sm"
                                >
                                    ↓
                                </button>
                                <button
                                    type="button"
                                    onClick={() => deleteRow(origIdx)}
                                    className="rounded bg-red-600 text-white px-2 text-sm"
                                >
                                    Sil
                                </button>
                            </div>
                        </div>

                        <div className="md:col-span-3">
                            <label className="block text-xs mb-1">Image Link</label>
                            <input
                                className="w-full rounded border px-2 py-1 text-sm"
                                value={row.image_link}
                                onChange={(e) => updateRow(origIdx, { image_link: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-3">
                            <label className="block text-xs mb-1">Button Link</label>
                            <input
                                className="w-full rounded border px-2 py-1 text-sm"
                                value={row.button_link}
                                onChange={(e) => updateRow(origIdx, { button_link: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-6">
                            <label className="block text-xs mb-1">Sub Text</label>
                            <input
                                className="w-full rounded border px-2 py-1 text-sm"
                                value={row.sub_text}
                                onChange={(e) => updateRow(origIdx, { sub_text: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-6">
                            <label className="block text-xs mb-1">Tips (virgülle ayır)</label>
                            <input
                                className="w-full rounded border px-2 py-1 text-sm"
                                value={(row.tips || []).join(", ")}
                                onChange={(e) =>
                                    updateRow(origIdx, {
                                        tips: e.target.value
                                            .split(",")
                                            .map((s) => s.trim())
                                            .filter(Boolean),
                                    })
                                }
                            />
                        </div>
                    </div>
                ))}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
        </div>
    );
}