"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
    IoChevronDown, IoLogOutOutline, IoSettingsOutline,
    IoFolderOpenOutline, IoGridOutline, IoLayersOutline,
    IoSpeedometerOutline, IoPeopleOutline, IoLocationOutline, IoClose
} from "react-icons/io5";

// --- TİP TANIMLAMALARI ---
type Match = "exact" | "startsWith";
type Lang = "tr" | "en";

function getCookie(name: string) {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
    return null;
}

type TranslationKey =
    | "dashboard" | "components" | "site_settings" | "general" | "social_links"
    | "categories" | "all_categories" | "add_category"
    | "products" | "all_products" | "add_product"
    | "ready_products" | "management" | "users"
    | "landing_page" | "why_us" | "logout" | "showcase"
    | "scrolling_cats" | "testimonials_page"
    | "make_it_easier" | "footer" | "locations" | "top_info_bar";

type MenuItem = {
    key: string;
    labelKey: TranslationKey;
    icon?: any;
    href?: string;
    match?: Match;
    children?: MenuItem[];
};

const DICTIONARY: Record<TranslationKey, { tr: string; en: string }> = {
    dashboard: { tr: "Kontrol Paneli", en: "Dashboard" },
    components: { tr: "Site Bileşenleri", en: "Components" },
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
    logout: { tr: "Çıkış Yap", en: "Logout" },
    showcase: { tr: "Vitrin Yönetimi", en: "Showcase" },
    scrolling_cats: { tr: "Kayan Kategoriler", en: "Scrolling Categories" },
    testimonials_page: { tr: "Referanslar", en: "Testimonials" },
    make_it_easier: { tr: "Kolaylaştır", en: "Make It Easier" },
    footer: { tr: "Footer", en: "Footer" },
    locations: { tr: "Lokasyonlar", en: "Locations" },
    top_info_bar: { tr: "Üst Bilgi Çubuğu", en: "Top Info Bar" }
};

const STORAGE_KEY = "admin.sidebar.expanded";

// YENİ: Props ekledik (Mobil kontrolü için)
type AdminSidebarProps = {
    isOpen?: boolean;        // Mobilde açık mı?
    onClose?: () => void;    // Kapatma fonksiyonu
};

export default function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
    const pathname = usePathname();
    const [lang, setLang] = useState<Lang>("en");
    const [mounted, setMounted] = useState(false);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    useEffect(() => {
        setMounted(true);
        const cookieLang = getCookie("NEXT_LOCALE");
        if (cookieLang === "tr" || cookieLang === "en") {
            setLang(cookieLang as Lang);
        } else if (typeof window !== "undefined" && navigator.language?.startsWith("tr")) {
            setLang("tr");
        }

        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) setExpanded(JSON.parse(stored));
        } catch { }
    }, []);

    const t = (key: TranslationKey) => DICTIONARY[key][lang];

    const menuItems = useMemo<MenuItem[]>(() => [
        {
            key: "dashboard",
            labelKey: "dashboard",
            icon: IoSpeedometerOutline,
            href: "/admin",
            match: "exact"
        }, {
            key: "settings",
            labelKey: "site_settings",
            icon: IoSettingsOutline,
            href: "/admin/settings",
            match: "exact"
        }, {
            key: "locations",
            labelKey: "locations",
            icon: IoLocationOutline,
            href: "/admin/locations",
            match: "exact"
        }, {
            key: "products",
            labelKey: "products",
            icon: IoGridOutline,
            href: "/admin/products",
            match: "startsWith",
            children: [
                { key: "prod_all", labelKey: "all_products", href: "/admin/products", match: "exact" },
                { key: "prod_add", labelKey: "add_product", href: "/admin/products/new", match: "exact" },
            ]
        }, {
            key: "categories",
            labelKey: "categories",
            icon: IoFolderOpenOutline,
            href: "/admin/categories",
            match: "startsWith",
            children: [
                { key: "cat_all", labelKey: "all_categories", href: "/admin/categories", match: "exact" },
                { key: "cat_add", labelKey: "add_category", href: "/admin/categories/new", match: "exact" },
            ]
        }, {
            key: "components",
            labelKey: "components",
            icon: IoLayersOutline,
            match: "startsWith",
            children: [
                { key: "landing", labelKey: "landing_page", href: "/admin/showcase/landing", match: "exact" },
                { key: "scrolling", labelKey: "scrolling_cats", href: "/admin/showcase/scrolling-categories", match: "exact" },
                { key: "ready", labelKey: "ready_products", href: "/admin/showcase/ready-products", match: "exact" },
                { key: "whyus", labelKey: "why_us", href: "/admin/showcase/why-us", match: "exact" },
                { key: "makeiteasier", labelKey: "make_it_easier", href: "/admin/showcase/make-it-easier", match: "exact" },
                { key: "testimonials", labelKey: "testimonials_page", href: "/admin/showcase/testimonials", match: "exact" },
            ]
        },
    ], [lang]);

    const toggle = (key: string) => {
        setExpanded(prev => {
            const next = { ...prev, [key]: !prev[key] };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    };

    const isActive = (href?: string, match: Match = "startsWith") =>
        href ? (match === "exact" ? pathname === href : pathname.startsWith(href)) : false;

    // Linke tıklayınca mobilde menüyü kapat
    const handleLinkClick = () => {
        if (onClose) onClose();
    };

    if (!mounted) return null;

    return (
        <>
            {/* MOBİL İÇİN KARARTMA KATMANI (OVERLAY) */}
            <div
                className={`fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            />

            {/* SIDEBAR */}
            <aside
                className={`
                    fixed top-0 left-0 z-40 w-64 h-screen 
                    bg-[var(--admin-card)] border-r border-[var(--admin-card-border)]
                    transition-transform duration-300 ease-in-out
                    lg:translate-x-0
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--admin-card-border)]">
                    <span className="font-bold text-lg text-[var(--admin-fg)]">Admin Panel</span>

                    {/* Mobil Kapat Butonu */}
                    <button onClick={onClose} className="lg:hidden text-[var(--admin-muted)] hover:text-[var(--admin-fg)]">
                        <IoClose size={24} />
                    </button>
                </div>

                {/* Menu List */}
                <nav className="p-3 overflow-y-auto h-[calc(100vh-4rem)]">
                    <ul className="space-y-1">
                        {menuItems.map((item) => {
                            const hasChildren = item.children && item.children.length > 0;
                            const active = isActive(item.href, item.match);
                            const open = expanded[item.key];
                            const Icon = item.icon;

                            return (
                                <li key={item.key}>
                                    <div
                                        className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer ${active && !hasChildren
                                                ? "bg-[var(--admin-input-bg)] text-[var(--admin-accent)] font-medium border border-[var(--admin-card-border)]"
                                                : open
                                                    ? "text-[var(--admin-fg)] font-medium"
                                                    : "text-[var(--admin-muted)] hover:bg-[var(--admin-input-bg)] hover:text-[var(--admin-fg)]"
                                            }`}
                                        onClick={() => hasChildren ? toggle(item.key) : (item.href ? handleLinkClick() : null)}
                                    >
                                        {item.href && !hasChildren ? (
                                            <Link href={item.href} onClick={handleLinkClick} className="flex items-center gap-3 flex-1">
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
                                        <ul className="mt-1 ml-4 pl-3 border-l border-[var(--admin-input-border)] space-y-1">
                                            {item.children!.map((child) => {
                                                const childActive = isActive(child.href, child.match);
                                                return (
                                                    <li key={child.key}>
                                                        <Link
                                                            href={child.href || "#"}
                                                            onClick={handleLinkClick}
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
                            <span className="px-3 text-xs font-bold uppercase tracking-wider opacity-40 text-[var(--admin-muted)]">
                                {t("management")}
                            </span>
                        </li>
                        <li>
                            <Link href="/admin/users" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--admin-muted)] hover:bg-[var(--admin-input-bg)] opacity-50 cursor-not-allowed">
                                <IoPeopleOutline size={18} />
                                <span>{t("users")}</span>
                            </Link>
                        </li>
                    </ul>
                </nav>
            </aside>
        </>
    );
}