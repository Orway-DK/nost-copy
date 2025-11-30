// orway-dk/nost-copy/nost-copy-d541a3f124d8a8bc7c3eeea745918156697a239e/app/admin/(protected)/_components/navbar.tsx
"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { CgProfile } from "react-icons/cg";
// DÜZELTME: Doğrudan createClient yerine ortak istemciyi kullan
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminNavbar() {
    const [open, setOpen] = useState(false);
    const btnRef = useRef<HTMLButtonElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const router = useRouter();
    const [loggingOut, setLoggingOut] = useState(false);

    // DÜZELTME: İstemciyi bileşen içinde veya dışında bu şekilde oluşturun
    const supabase = createSupabaseBrowserClient();

    const toggle = () => setOpen(o => !o);
    const close = useCallback(() => setOpen(false), []);

    useEffect(() => {
        if (!open) return;
        function handleClick(e: MouseEvent) {
            const t = e.target as Node;
            if (
                menuRef.current &&
                !menuRef.current.contains(t) &&
                btnRef.current &&
                !btnRef.current.contains(t)
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

    // Menü ok tuşları
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

    async function handleLogout() {
        if (loggingOut) return;
        setLoggingOut(true);
        try {
            const res = await fetch("/api/admin/logout", { method: "POST" });
            await supabase.auth.signOut().catch(() => { });
            if (!res.ok) {
                console.warn("Logout route error:", await res.json().catch(() => null));
            }
        } catch (e) {
            console.error("Logout fetch error:", e);
            await supabase.auth.signOut().catch(() => { });
        } finally {
            try {
                Object.keys(localStorage)
                    .filter(k => k.startsWith("sb-"))
                    .forEach(k => localStorage.removeItem(k));
            } catch { }
            router.replace("/admin/login");
            setLoggingOut(false);
        }
    }

    function handleSettings() {
        router.push("/admin/settings");
        close();
    }

    return (
        <header
            className="w-full flex flex-row justify-between items-center px-4 py-2
        bg-admin-input-bg text-admin-fg border border-admin-border font-admin-sans
        sticky top-0 z-30
      "
        >
            <h1 className="text-xl font-semibold">
                <Link href={"/admin"}>Nost Copy</Link>{" "}
                <span className="text-sm font-normal opacity-80">Admin Panel</span>
            </h1>

            <div className="relative">
                <button
                    ref={btnRef}
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={open}
                    onClick={toggle}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggle();
                        }
                    }}
                    className="
            inline-flex items-center justify-center
            w-10 h-10 rounded-full
            bg-admin-card text-admin-fg
            border border-admin-border
            transition
            focus:outline-none focus:ring-2 focus:ring-admin-input-focus
            hover:bg-admin-bg
          "
                >
                    <CgProfile size={22} aria-hidden="true" />
                    <span className="sr-only">Account menu</span>
                </button>

                {open && (
                    <div
                        ref={menuRef}
                        role="menu"
                        aria-label="Profile menu"
                        className="
              absolute right-0 mt-2 w-48
              bg-admin-card text-admin-fg
              border border-admin-border rounded-md
              shadow overflow-hidden
              z-50
            "
                        style={{
                            animation: "admin-reveal 160ms cubic-bezier(0.33, 1, 0.68, 1) both",
                        }}
                    >
                        <div className="py-1 flex flex-col">
                            <button
                                data-menu-item="true"
                                role="menuitem"
                                onClick={handleSettings}
                                className="
                  text-left px-4 py-2 text-sm
                  bg-transparent
                  hover:bg-admin-input-bg
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-input-focus
                  transition
                "
                            >
                                Settings
                            </button>
                            <button
                                data-menu-item="true"
                                role="menuitem"
                                onClick={handleLogout}
                                disabled={loggingOut}
                                className="
                  text-left px-4 py-2 text-sm
                  bg-transparent
                  hover:bg-admin-input-bg
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-input-focus
                  transition
                  disabled:opacity-50
                "
                            >
                                {loggingOut ? "Logging out..." : "Logout"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}