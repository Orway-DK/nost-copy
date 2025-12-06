// app/admin/(protected)/_components/navbar.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CgProfile } from "react-icons/cg";
import { IoSettingsOutline, IoLogOutOutline } from "react-icons/io5";
import { logoutAction } from "@/app/auth/actions"; // Server Action importu

export default function AdminNavbar() {
    const [open, setOpen] = useState(false);
    const btnRef = useRef<HTMLButtonElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const router = useRouter();
    const [loggingOut, setLoggingOut] = useState(false);

    const toggle = () => setOpen((o) => !o);
    const close = useCallback(() => setOpen(false), []);

    // --- LOGOUT HANDLER ---
    async function handleLogout() {
        if (loggingOut) return;
        setLoggingOut(true);

        // 1. Client tarafı temizliği (LocalStorage)
        try {
            if (typeof window !== "undefined") {
                Object.keys(localStorage)
                    .filter((k) => k.startsWith("sb-"))
                    .forEach((k) => localStorage.removeItem(k));
            }
        } catch { /* Ignore */ }

        // 2. Server Action Çağrısı (Cookie siler ve Redirect eder)
        try {
            await logoutAction();
        } catch (error) {
            console.error("Çıkış hatası:", error);
            setLoggingOut(false);
        }
    }

    function handleSettings() {
        router.push("/admin/settings");
        close();
    }

    // --- KLAVYE & MOUSE ETKİLEŞİMLERİ (Eski kod korundu) ---
    useEffect(() => {
        if (!open) return;
        function handleClick(e: MouseEvent) {
            const t = e.target as Node;
            if (
                menuRef.current && !menuRef.current.contains(t) &&
                btnRef.current && !btnRef.current.contains(t)
            ) {
                close();
            }
        }
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") {
                e.preventDefault();
                close();
                btnRef.current?.focus();
            }
        }
        document.addEventListener("mousedown", handleClick);
        document.addEventListener("keydown", handleKey);
        return () => {
            document.removeEventListener("mousedown", handleClick);
            document.removeEventListener("keydown", handleKey);
        };
    }, [open, close]);

    useEffect(() => {
        if (!open) return;
        const items = Array.from(
            menuRef.current?.querySelectorAll<HTMLButtonElement>('button[data-menu-item="true"]') || []
        );
        let idx = -1;
        function onKey(e: KeyboardEvent) {
            if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
            e.preventDefault();
            if (items.length === 0) return;
            if (idx === -1) {
                idx = 0;
                items[idx]?.focus();
                return;
            }
            if (e.key === "ArrowDown") idx = (idx + 1) % items.length;
            else if (e.key === "ArrowUp") idx = (idx - 1 + items.length) % items.length;
            else if (e.key === "Home") idx = 0;
            else if (e.key === "End") idx = items.length - 1;
            items[idx]?.focus();
        }
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open]);

    return (
        <header
            className="w-full flex flex-row justify-between items-center px-6 py-3
            bg-[var(--admin-card)] text-[var(--admin-fg)] border-b border-[var(--admin-card-border)]
            sticky top-0 z-30 shadow-sm"
        >
            <h1 className="text-xl font-semibold flex items-center gap-2">
                <Link href={"/admin"} className="hover:text-[var(--admin-accent)] transition-colors">
                    Nost Copy
                </Link>
                <span className="text-xs font-normal px-2 py-0.5 rounded bg-[var(--admin-input-bg)] text-[var(--admin-muted)] border border-[var(--admin-input-border)]">
                    Admin
                </span>
            </h1>

            <div className="relative">
                <button
                    ref={btnRef}
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={open}
                    onClick={toggle}
                    className="
                        inline-flex items-center justify-center
                        w-10 h-10 rounded-full
                        bg-[var(--admin-input-bg)] text-[var(--admin-fg)]
                        border border-[var(--admin-input-border)]
                        transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-[var(--admin-ring)]
                        hover:bg-[var(--admin-border)] hover:scale-105
                    "
                >
                    <CgProfile size={24} aria-hidden="true" className="opacity-80" />
                    <span className="sr-only">Account menu</span>
                </button>

                {open && (
                    <div
                        ref={menuRef}
                        role="menu"
                        aria-label="Profile menu"
                        className="
                            absolute right-0 mt-2 w-56
                            bg-[var(--admin-card)] text-[var(--admin-fg)]
                            border border-[var(--admin-card-border)] rounded-xl
                            shadow-xl overflow-hidden
                            z-50 ring-1 ring-black ring-opacity-5
                        "
                        style={{
                            animation: "admin-reveal 160ms cubic-bezier(0.33, 1, 0.68, 1) both",
                        }}
                    >
                        <div className="py-1 flex flex-col">
                            {/* SETTINGS ITEM */}
                            <button
                                data-menu-item="true"
                                role="menuitem"
                                onClick={handleSettings}
                                className="
                                    flex items-center gap-3 w-full
                                    text-left px-4 py-3 text-sm
                                    bg-transparent
                                    hover:bg-[var(--admin-input-bg)]
                                    focus:outline-none focus:bg-[var(--admin-input-bg)]
                                    transition-colors
                                "
                            >
                                <IoSettingsOutline size={18} className="text-[var(--admin-muted)]" />
                                <span>Site Ayarları</span>
                            </button>

                            <div className="h-px bg-[var(--admin-card-border)] my-1 mx-2" />

                            {/* LOGOUT ITEM */}
                            <button
                                data-menu-item="true"
                                role="menuitem"
                                onClick={handleLogout}
                                disabled={loggingOut}
                                className="
                                    flex items-center gap-3 w-full
                                    text-left px-4 py-3 text-sm font-medium
                                    bg-transparent
                                    text-[var(--admin-danger)]
                                    hover:bg-[var(--admin-danger)]/10
                                    focus:outline-none focus:bg-[var(--admin-danger)]/10
                                    transition-colors
                                    disabled:opacity-50
                                "
                            >
                                <IoLogOutOutline size={18} />
                                <span>{loggingOut ? "Çıkış Yapılıyor..." : "Güvenli Çıkış"}</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}