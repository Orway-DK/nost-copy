"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CgProfile } from "react-icons/cg";
import { IoSettingsOutline, IoLogOutOutline, IoLanguage, IoPersonCircleOutline } from "react-icons/io5";
import { logoutAction } from "@/app/auth/actions";

export default function AdminNavbar() {
    const [open, setOpen] = useState(false);
    const btnRef = useRef<HTMLButtonElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const router = useRouter();
    const [loggingOut, setLoggingOut] = useState(false);

    const toggle = () => setOpen((o) => !o);
    const close = useCallback(() => setOpen(false), []);

    // --- DİL DEĞİŞTİRME ---
    const handleLanguageChange = (lang: "tr" | "en") => {
        document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000`;
        window.location.reload();
    };

    // --- LOGOUT HANDLER ---
    async function handleLogout() {
        if (loggingOut) return;
        setLoggingOut(true);
        try {
            if (typeof window !== "undefined") {
                Object.keys(localStorage).filter((k) => k.startsWith("sb-")).forEach((k) => localStorage.removeItem(k));
            }
            await logoutAction();
        } catch (error) {
            console.error("Çıkış hatası:", error);
            setLoggingOut(false);
        }
    }

    // --- CLICK OUTSIDE & ESCAPE ---
    useEffect(() => {
        if (!open) return;
        function handleClick(e: MouseEvent) {
            const t = e.target as Node;
            if (menuRef.current && !menuRef.current.contains(t) && btnRef.current && !btnRef.current.contains(t)) {
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

    return (
        <header
            className="w-full flex flex-row justify-between items-center 
            px-4 md:px-6 py-3
            bg-[var(--admin-card)] text-[var(--admin-fg)] border-b border-[var(--admin-card-border)]
            sticky top-0 z-30 shadow-sm"
        >
            {/* SOL: Logo ve Badge */}
            <h1 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                <Link href={"/admin"} className="hover:text-[var(--admin-accent)] transition-colors">
                    Nost Copy
                </Link>
                <span className="text-[10px] md:text-xs font-normal px-1.5 md:px-2 py-0.5 rounded bg-[var(--admin-input-bg)] text-[var(--admin-muted)] border border-[var(--admin-input-border)]">
                    Admin
                </span>
            </h1>

            {/* SAĞ: Profil Menüsü */}
            <div className="relative">
                <button
                    ref={btnRef}
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={open}
                    onClick={toggle}
                    className="
                        inline-flex items-center justify-center
                        w-9 h-9 md:w-10 md:h-10 rounded-full
                        bg-[var(--admin-input-bg)] text-[var(--admin-fg)]
                        border border-[var(--admin-input-border)]
                        transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-[var(--admin-ring)]
                        hover:bg-[var(--admin-border)] hover:scale-105
                    "
                >
                    <CgProfile size={20} className="md:w-6 md:h-6 opacity-80" aria-hidden="true" />
                </button>

                {open && (
                    <div
                        ref={menuRef}
                        role="menu"
                        className="
                            absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)]
                            bg-[var(--admin-card)] text-[var(--admin-fg)]
                            border border-[var(--admin-card-border)] rounded-xl
                            shadow-xl overflow-hidden
                            z-50 ring-1 ring-black ring-opacity-5
                        "
                        style={{ animation: "admin-reveal 160ms cubic-bezier(0.33, 1, 0.68, 1) both" }}
                    >
                        <div className="py-2 flex flex-col">

                            {/* DİL SEÇİMİ BAŞLIĞI */}
                            <div className="px-4 py-2 text-xs font-semibold text-[var(--admin-muted)] uppercase tracking-wider flex items-center gap-2">
                                <IoLanguage /> Dil / Language
                            </div>

                            <div className="flex px-2 gap-2 mb-2">
                                <button
                                    onClick={() => handleLanguageChange("tr")}
                                    className="flex-1 py-1.5 text-sm rounded bg-[var(--admin-input-bg)] hover:bg-[var(--admin-border)] border border-[var(--admin-input-border)] transition-colors"
                                >
                                    🇹🇷 Türkçe
                                </button>
                                <button
                                    onClick={() => handleLanguageChange("en")}
                                    className="flex-1 py-1.5 text-sm rounded bg-[var(--admin-input-bg)] hover:bg-[var(--admin-border)] border border-[var(--admin-input-border)] transition-colors"
                                >
                                    🇬🇧 English
                                </button>
                            </div>

                            <div className="h-px bg-[var(--admin-card-border)] my-1 mx-2" />

                            {/* MENÜ LİNKLERİ */}

                            <Link
                                href="/admin/profile"
                                onClick={close}
                                className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[var(--admin-input-bg)] transition-colors"
                            >
                                <IoPersonCircleOutline size={18} className="text-[var(--admin-muted)]" />
                                <span>Kullanıcı Ayarları</span>
                            </Link>

                            <Link
                                href="/admin/settings"
                                onClick={close}
                                className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[var(--admin-input-bg)] transition-colors"
                            >
                                <IoSettingsOutline size={18} className="text-[var(--admin-muted)]" />
                                <span>Site Ayarları</span>
                            </Link>

                            <div className="h-px bg-[var(--admin-card-border)] my-1 mx-2" />

                            {/* LOGOUT */}
                            <button
                                onClick={handleLogout}
                                disabled={loggingOut}
                                className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-medium text-[var(--admin-danger)] hover:bg-[var(--admin-danger)]/10 transition-colors disabled:opacity-50"
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