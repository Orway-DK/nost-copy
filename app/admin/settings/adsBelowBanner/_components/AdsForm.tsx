"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { upsertAds } from "../actions";

type Language = { code: string; name: string; is_default: boolean };
export type Ads = {
    id?: number;
    lang_code: string;
    text: string;
    icon: string;
    order_no?: number;
};

export default function AdsForm({
    languages,
    initialAds,
}: {
    languages: Language[];
    initialAds: Ads[];
}) {
    const router = useRouter();
    const safeInitial = (initialAds ?? []) as Ads[];
    const [rows, setRows] = useState<Ads[]>(
        // ensure rows are sorted by order_no for the initial UI
        [...safeInitial].sort((a, b) => (a.order_no ?? 0) - (b.order_no ?? 0))
    );
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // normalize and sort languages by custom order: TR -> EN -> DE -> others
    const customOrder = ["TR", "EN", "DE"];
    const safeLanguages = (languages ?? [])
        .map((l) => ({ ...l, code: String(l.code) }))
        .sort((a, b) => {
            const ia = customOrder.indexOf(a.code.toUpperCase());
            const ib = customOrder.indexOf(b.code.toUpperCase());
            if (ia === -1 && ib === -1) return a.code.localeCompare(b.code);
            if (ia === -1) return 1;
            if (ib === -1) return -1;
            return ia - ib;
        });

    // default selection: prefer TR, then is_default flag, then first item, then "TR"
    const trLang = safeLanguages.find((l) => l.code.toUpperCase() === "TR")?.code;
    const defaultByFlag = safeLanguages.find((l) => l.is_default === true)?.code;
    const initialDefaultLang = (trLang ?? defaultByFlag ?? safeLanguages[0]?.code ?? "TR") as string;
    const [selectedLang, setSelectedLang] = useState<string>(initialDefaultLang);

    // Eğer languages prop değişirse selectedLang geçerli değilse default'a çek
    useEffect(() => {
        const codes = safeLanguages.map((l) => String(l.code));
        if (codes.length === 0) return;
        const tr = safeLanguages.find((l) => String(l.code).toUpperCase() === "TR")?.code;
        const def = tr ?? safeLanguages.find((l) => l.is_default === true)?.code ?? codes[0];
        setSelectedLang((prev) => (codes.includes(prev) ? prev : def));
    }, [languages]);

    // Helpers
    const updateRow = (index: number, patch: Partial<Ads>) => {
        setRows((prev) => {
            const newRows = [...prev];
            newRows[index] = { ...newRows[index], ...patch };
            return newRows;
        });
    };

    const addRow = () => {
        const defaultLang = selectedLang || safeLanguages[0]?.code || "TR";
        const newRow: Ads = {
            lang_code: defaultLang,
            text: "",
            icon: "",
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
            // renumber globally to keep order_no deterministic
            return newRows.map((r, idx) => ({ ...r, order_no: idx }));
        });
    };

    // move within the filtered (same-language) items
    const moveUp = (origIdx: number) => {
        setRows((prev) => {
            const indexed = prev.map((r, i) => ({ r, i }));
            const filtered = indexed.filter(({ r }) => r.lang_code === selectedLang);
            const pos = filtered.findIndex((f) => f.i === origIdx);
            if (pos <= 0) return prev;
            const prevIdx = filtered[pos - 1].i;
            const newRows = [...prev];
            const tmp = newRows[prevIdx];
            newRows[prevIdx] = newRows[origIdx];
            newRows[origIdx] = tmp;
            return newRows.map((r, idx) => ({ ...r, order_no: idx }));
        });
    };

    const moveDown = (origIdx: number) => {
        setRows((prev) => {
            const indexed = prev.map((r, i) => ({ r, i }));
            const filtered = indexed.filter(({ r }) => r.lang_code === selectedLang);
            const pos = filtered.findIndex((f) => f.i === origIdx);
            if (pos === -1 || pos >= filtered.length - 1) return prev;
            const nextIdx = filtered[pos + 1].i;
            const newRows = [...prev];
            const tmp = newRows[nextIdx];
            newRows[nextIdx] = newRows[origIdx];
            newRows[origIdx] = tmp;
            return newRows.map((r, idx) => ({ ...r, order_no: idx }));
        });
    };

    const saveAll = async () => {
        setSaving(true);
        setError(null);
        setSuccess(null);
        try {
            // ensure order_no stable (global index)
            const payload = rows.map((r, idx) => ({
                ...r,
                order_no: typeof r.order_no === "number" ? r.order_no : idx,
            }));
            const fd = new FormData();
            fd.append("items", JSON.stringify(payload));
            await upsertAds(fd);
            setSuccess("Ads öğeleri kaydedildi.");
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
                <h2 className="text-lg font-medium">Ads Items (Sadece üst 4 görünür)</h2>

                <div className="flex gap-2 items-center">
                    <label className="text-sm mr-1">Dil</label>
                    <select
                        value={selectedLang}
                        onChange={(e) => setSelectedLang(e.target.value)}
                        className="rounded border px-2 py-1 text-sm"
                    >
                        {/* Eğer languages varsa onlardan üret, yoksa fallback üç seçenek */}
                        {safeLanguages.length > 0 ? (
                            safeLanguages.map((l) => (
                                <option key={l.code} value={l.code}>
                                    {l.name} ({l.code})
                                </option>
                            ))
                        ) : (
                            <>
                                <option value="TR">TR</option>
                                <option value="EN">EN</option>
                                <option value="DE">DE</option>
                            </>
                        )}
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
                {filtered.length === 0 && (
                    <p className="text-sm italic text-gray-600">Seçili dil için öğe yok.</p>
                )}

                {filtered.map(({ row, idx: origIdx }, localIdx) => (
                    <div
                        key={origIdx}
                        className="border rounded p-3 grid grid-cols-1 md:grid-cols-6 gap-2 justify-items-stretch text-sm"
                    >

                        <div className="md:col-span-2">
                            <label className="block text-xs mb-1">Text</label>
                            <input
                                className="w-full rounded border px-2 py-1 text-sm admin-input"
                                value={row.text}
                                onChange={(e) => updateRow(origIdx, { text: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs mb-1">Icon ( REACT ICONS )</label>
                            <input
                                className="w-full rounded border px-2 py-1 text-sm admin-input"
                                value={row.icon}
                                onChange={(e) => updateRow(origIdx, { icon: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-1 flex flex-col gap-1">
                            <label className="block text-xs mb-1">Sıra</label>
                            <div className="flex gap-1">
                                <button
                                    type="button"
                                    onClick={() => moveUp(origIdx)}
                                    disabled={localIdx === 0}
                                    className="rounded bg-gray-200 px-2 text-sm"
                                >
                                    ↑
                                </button>
                                <button
                                    type="button"
                                    onClick={() => moveDown(origIdx)}
                                    disabled={localIdx === filtered.length - 1}
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
                    </div>
                ))}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
        </div>
    );
}