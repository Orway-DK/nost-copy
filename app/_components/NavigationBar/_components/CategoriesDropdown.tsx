// /home/dorukhan/Desktop/NostCopy/nost-copy/app/_components/NavigationBar/_components/CategoriesDropdown.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

/**
 * Kategoriler için basit dropdown.
 * Props:
 *  - label: Üst buton yazısı (Kategoriler / Categories / Kategorien)
 *  - items: { label, href }[]
 *  - loading: yükleniyor mu
 *  - error: hata oldu mu
 */
export default function CategoriesDropdown({
    label,
    items,
    loading,
    error,
}: {
    label: string;
    items: { label: string; href: string }[];
    loading: boolean;
    error: boolean;
}) {
    const [open, setOpen] = useState(false);
    const btnRef = useRef<HTMLButtonElement | null>(null);
    const popRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open) return;
        const handleDown = (e: MouseEvent) => {
            const t = e.target as Node;
            if (popRef.current?.contains(t)) return;
            if (btnRef.current?.contains(t)) return;
            setOpen(false);
        };
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", handleDown);
        document.addEventListener("keydown", handleEsc);
        return () => {
            document.removeEventListener("mousedown", handleDown);
            document.removeEventListener("keydown", handleEsc);
        };
    }, [open]);

    return (
        <div className="relative inline-block">
            <button
                ref={btnRef}
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="inline-flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors"
                aria-haspopup="true"
                aria-expanded={open}
            >
                <span>{label}</span>
                <svg
                    className={`w-2.5 h-2.5 transition-transform ${open ? "rotate-180" : ""
                        }`}
                    viewBox="0 0 10 6"
                    aria-hidden="true"
                >
                    <path
                        d="m1 1 4 4 4-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
            {open && (
                <div
                    ref={popRef}
                    className="absolute left-0 mt-2 bg-white rounded-lg shadow-lg ring-1 ring-black/5 z-50 min-w-[12rem]"
                >
                    <ul className="py-2 max-h-72 overflow-auto">
                        {loading && (
                            <li className="px-4 py-2 text-xs text-gray-400">
                                Yükleniyor...
                            </li>
                        )}
                        {error && !loading && (
                            <li className="px-4 py-2 text-xs text-red-600">
                                Kategoriler alınamadı
                            </li>
                        )}
                        {!loading &&
                            !error &&
                            items.map((it) => (
                                <li key={it.href}>
                                    <Link
                                        href={it.href}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setOpen(false)}
                                    >
                                        {it.label}
                                    </Link>
                                </li>
                            ))}
                        {!loading && !error && items.length === 0 && (
                            <li className="px-4 py-2 text-xs text-gray-400">
                                Kategori Yok
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}