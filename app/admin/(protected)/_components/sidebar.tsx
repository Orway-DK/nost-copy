"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
    IoChevronDown, IoLogOutOutline, IoSettingsOutline,
    IoFolderOpenOutline, IoGridOutline, IoLayersOutline,
    IoSpeedometerOutline, IoPeopleOutline
} from "react-icons/io5";
import { logoutAction } from "@/app/auth/actions";

// --- TİP TANIMLAMALARI ---
type Match = "exact" | "startsWith";
type Lang = "tr" | "en";

type TranslationKey =
    | "dashboard" // YENİ
    | "components" // YENİ (Eski homepage_settings yerine)
    | "site_settings" | "general" | "social_links"
    | "categories" | "all_categories" | "add_category"
    | "products" | "all_products" | "add_product"
    | "ready_products" | "management" | "users"
    | "landing_page" | "why_us" | "logout";

type MenuItem = {
    key: string;
    labelKey: TranslationKey;
    icon?: any;
    href?: string;
    match?: Match;
    children?: MenuItem[];
};

// --- ÇEVİRİ SÖZLÜĞÜ ---
const DICTIONARY: Record<TranslationKey, { tr: string; en: string }> = {
    dashboard: { tr: "Kontrol Paneli", en: "Dashboard" },
    components: { tr: "Site Bileşenleri", en: "Components" }, // İsim değişti
    site_settings: { tr: "Site Ayarları", en: "Site Settings" },
    general: { tr: "Genel", en: "General" },
    social_links: { tr: "Sosyal Medya", en: "Social Links" },
    categories: { tr: "Kategoriler", en: "Categories" },
    all_categories: { tr: "Tüm Kategoriler", en: "All Categories" },
    add_category: { tr: "Kategori Ekle", en: "Add New Category" },
    products: { tr: "Ürünler", en: "Products" },
    all_products: { tr: "Tüm Ürünler", en: "All Products" },
    add_product: { tr: "Ürün Ekle", en: "Add New Product" },
    ready_products: { tr: "Hazır Ürünler", en: "Ready Products" },
    management: { tr: "Yönetim", en: "Management" },
    users: { tr: "Kullanıcılar", en: "Users" },
    landing_page: { tr: "Açılış Sayfası", en: "Landing Page" },
    why_us: { tr: "Neden Biz", en: "Why Us" },
    logout: { tr: "Çıkış Yap", en: "Logout" }
};

const STORAGE_KEY = "admin.sidebar.expanded";

export default function AdminSidebar() {
    const pathname = usePathname();
    const [lang, setLang] = useState<Lang>("en");
    const [mounted, setMounted] = useState(false);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    useEffect(() => {
        setMounted(true);
        if (typeof window !== "undefined" && navigator.language?.startsWith("tr")) {
            setLang("tr");
        }
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) setExpanded(JSON.parse(stored));
        } catch { }
    }, []);

    const menuItems = useMemo<MenuItem[]>(() => [
        // 1. DASHBOARD (En Üstte)
        {
            key: "dashboard",
            labelKey: "dashboard",
            icon: IoSpeedometerOutline,
            href: "/admin",
            match: "exact"
        },
        // 2. COMPONENTS (Eski Anasayfa)
        {
            key: "components",
            labelKey: "components",
            icon: IoLayersOutline, // İkon değişti
            match: "startsWith",
            children: [
                { key: "landing", labelKey: "landing_page", href: "/admin/landing", match: "exact" },
                { key: "ready", labelKey: "ready_products", href: "/admin/ready-products", match: "exact" },
                { key: "whyus", labelKey: "why_us", href: "/admin/why-us", match: "exact" },
            ]
        },
        // 3. PRODUCTS
        {
            key: "products",
            labelKey: "products",
            icon: IoGridOutline,
            href: "/admin/products",
            match: "startsWith",
            children: [
                { key: "prod_all", labelKey: "all_products", href: "/admin/products", match: "exact" },
                { key: "prod_add", labelKey: "add_product", href: "/admin/products/new", match: "exact" },
            ]
        },
        // 4. CATEGORIES
        {
            key: "categories",
            labelKey: "categories",
            icon: IoFolderOpenOutline,
            href: "/admin/categories",
            match: "startsWith",
            children: [
                { key: "cat_all", labelKey: "all_categories", href: "/admin/categories", match: "exact" },
                { key: "cat_add", labelKey: "add_category", href: "/admin/categories/new", match: "exact" },
            ]
        },
        // 5. SETTINGS
        {
            key: "settings",
            labelKey: "site_settings",
            icon: IoSettingsOutline,
            match: "startsWith",
            children: [
                { key: "set_gen", labelKey: "general", href: "/admin/settings", match: "exact" },
                { key: "set_soc", labelKey: "social_links", href: "/admin/social-settings", match: "exact" },
            ]
        },
    ], []);

    // ... (Geri kalan toggle, useEffect ve render mantığı aynı, sadece CSS variable'ları kullanmaya devam ediyoruz)

    const toggle = (key: string) => {
        setExpanded(prev => {
            const next = { ...prev, [key]: !prev[key] };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    };

    const t = (key: TranslationKey) => DICTIONARY[key][lang];
    const isActive = (href?: string, match: Match = "startsWith") =>
        href ? (match === "exact" ? pathname === href : pathname.startsWith(href)) : false;

    if (!mounted) return null;

    return (
        <aside className="fixed top-0 left-0 z-20 w-64 h-screen bg-[var(--admin-card)] border-r" style={{ borderColor: "var(--admin-card-border)" }}>
            <div className="h-16 flex items-center px-6 border-b" style={{ borderColor: "var(--admin-card-border)" }}>
                <span className="font-bold text-lg" style={{ color: "var(--admin-fg)" }}>Admin Panel</span>
            </div>

            <nav className="p-3 overflow-y-auto h-[calc(100vh-8rem)]">
                <ul className="space-y-1">
                    {menuItems.map((item) => {
                        const hasChildren = item.children && item.children.length > 0;
                        const active = isActive(item.href, item.match);
                        const open = expanded[item.key];
                        const Icon = item.icon;

                        return (
                            <li key={item.key}>
                                <div
                                    className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer ${active && !hasChildren // Sadece tekil link ise aktif stil uygula
                                        ? "bg-[var(--admin-input-bg)] text-[var(--admin-accent)] font-medium border border-[var(--admin-card-border)]"
                                        : open // Açık parent
                                            ? "text-[var(--admin-fg)] font-medium"
                                            : "text-[var(--admin-muted)] hover:bg-[var(--admin-input-bg)] hover:text-[var(--admin-fg)]"
                                        }`}
                                    onClick={() => hasChildren ? toggle(item.key) : null}
                                >
                                    {/* Link varsa tıkla, yoksa (dropdown ise) sadece görsel */}
                                    {item.href && !hasChildren ? (
                                        <Link href={item.href} className="flex items-center gap-3 flex-1">
                                            {Icon && <Icon size={18} className={active ? "text-[var(--admin-accent)]" : "opacity-70"} />}
                                            <span>{t(item.labelKey)}</span>
                                        </Link>
                                    ) : (
                                        <div className="flex items-center gap-3 flex-1">
                                            {Icon && <Icon size={18} className="opacity-70" />}
                                            <span>{t(item.labelKey)}</span>
                                        </div>
                                    )}

                                    {hasChildren && (
                                        <IoChevronDown
                                            size={14}
                                            className={`transition-transform duration-200 opacity-50 ${open ? "rotate-180" : ""}`}
                                        />
                                    )}
                                </div>

                                {hasChildren && open && (
                                    <ul className="mt-1 ml-4 pl-3 border-l space-y-1" style={{ borderColor: "var(--admin-input-border)" }}>
                                        {item.children!.map((child) => {
                                            const childActive = isActive(child.href, child.match);
                                            return (
                                                <li key={child.key}>
                                                    <Link
                                                        href={child.href || "#"}
                                                        className={`block px-3 py-2 rounded-md text-sm transition-colors ${childActive
                                                            ? "text-[var(--admin-accent)] font-medium bg-[var(--admin-input-bg)]"
                                                            : "text-[var(--admin-muted)] hover:text-[var(--admin-fg)]"
                                                            }`}
                                                    >
                                                        {t(child.labelKey)}
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </li>
                        );
                    })}

                    <li className="pt-4 pb-2">
                        <span className="px-3 text-xs font-bold uppercase tracking-wider opacity-40" style={{ color: "var(--admin-muted)" }}>
                            {t("management")}
                        </span>
                    </li>
                    <li>
                        <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--admin-muted)] hover:bg-[var(--admin-input-bg)] opacity-50 cursor-not-allowed">
                            <IoPeopleOutline size={18} />
                            <span>{t("users")}</span>
                        </Link>
                    </li>
                </ul>
            </nav>

            <div className="absolute bottom-0 left-0 w-full p-4 border-t" style={{ borderColor: "var(--admin-card-border)", backgroundColor: "var(--admin-card)" }}>
                <form action={logoutAction}>
                    <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                        <IoLogOutOutline size={18} />
                        <span>{t("logout")}</span>
                    </button>
                </form>
            </div>
        </aside>
    );
}