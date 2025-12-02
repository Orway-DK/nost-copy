// orway-dk/nost-copy/nost-copy-d541a3f124d8a8bc7c3eeea745918156697a239e/app/admin/(protected)/_components/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { IoChevronDown } from "react-icons/io5";

// --- TİP TANIMLAMALARI ---

type Match = "exact" | "startsWith";
type Lang = "tr" | "en";

// Çeviri anahtarları
type TranslationKey =
    | "site_settings"
    | "general"
    | "social_links"
    | "categories"
    | "all_categories"
    | "add_category"
    | "products"
    | "all_products"
    | "add_product"
    | "showcase"
    | "ready_products"
    | "management"
    | "users"
    | "homepage_settings"
    | "landing_page";

type ChildItem = {
    labelKey: TranslationKey; // label yerine labelKey kullanıyoruz
    href: string;
    match?: Match;
};

type Section = {
    key: string;
    labelKey: TranslationKey; // label yerine labelKey kullanıyoruz
    href?: string;
    match?: Match;
    children?: ChildItem[];
};

// --- ÇEVİRİ SÖZLÜĞÜ ---

const DICTIONARY: Record<TranslationKey, { tr: string; en: string }> = {
    site_settings: { tr: "Site Ayarları", en: "Site Settings" },
    general: { tr: "Genel", en: "General" },
    social_links: { tr: "Sosyal Medya", en: "Social Links" },
    categories: { tr: "Kategoriler", en: "Categories" },
    all_categories: { tr: "Tüm Kategoriler", en: "All Categories" },
    add_category: { tr: "Kategori Ekle", en: "Add New Category" },
    products: { tr: "Ürünler", en: "Products" },
    all_products: { tr: "Tüm Ürünler", en: "All Products" },
    add_product: { tr: "Ürün Ekle", en: "Add New Product" },
    showcase: { tr: "Vitrin", en: "Showcase" },
    ready_products: { tr: "Hazır Ürünler", en: "Ready Products" },
    management: { tr: "Yönetim", en: "Management" },
    users: { tr: "Kullanıcılar", en: "Users" },
    homepage_settings: { tr: "Anasayfa Ayarları", en: "Homepage Settings" },
    landing_page: { tr: "Açılış Sayfası", en: "Landing Page" }
};

const STORAGE_KEY = "admin.sidebar.expanded";

export default function AdminSidebar() {
    const pathname = usePathname();
    const [lang, setLang] = useState<Lang>("en"); // Varsayılan İngilizce
    const [mounted, setMounted] = useState(false);

    // Tarayıcı dilini algıla
    useEffect(() => {
        setMounted(true);
        if (typeof window !== "undefined" && navigator.language) {
            const browserLang = navigator.language.split("-")[0]; // "tr-TR" -> "tr"
            if (browserLang === "tr") {
                setLang("tr");
            }
        }
    }, []);

    // Çeviri yardımcı fonksiyonu
    const t = (key: TranslationKey) => DICTIONARY[key][lang];

    // Sidebar yapısı
    const sections = useMemo<Section[]>(
        () => [
            {
                key: "site",
                labelKey: "site_settings",
                href: "/admin/settings",
                match: "startsWith",
                children: [
                    { labelKey: "general", href: "/admin/settings", match: "exact" },
                    { labelKey: "social_links", href: "/admin/settings-social", match: "startsWith" },
                ],
            },
            {
                key: "categories",
                labelKey: "categories",
                href: "/admin/categories",
                match: "startsWith",
                children: [
                    { labelKey: "all_categories", href: "/admin/categories", match: "exact" },
                    { labelKey: "add_category", href: "/admin/categories/new", match: "exact" },
                ],
            },
            {
                key: "products",
                labelKey: "products",
                href: "/admin/products",
                match: "startsWith",
                children: [
                    { labelKey: "all_products", href: "/admin/products", match: "exact" },
                    { labelKey: "add_product", href: "/admin/products/new", match: "exact" },
                ],
            },
            {
                key: "homepage_components",
                labelKey: "homepage_settings",
                href: "/admin/products",
                match: "startsWith",
                children: [
                    { labelKey: "landing_page", href: "/admin/landing", match: "exact" },
                    { labelKey: "ready_products", href: "/admin/ready-products", match: "exact" },
                ],

            },
        ],
        []
    );

    const defaultExpanded = useMemo<Record<string, boolean>>(
        () =>
            sections.reduce((acc, s) => {
                if (s.children && s.children.length > 0) {
                    acc[s.key] = true;
                }
                return acc;
            }, {} as Record<string, boolean>),
        [sections]
    );

    const [expanded, setExpanded] = useState<Record<string, boolean>>(defaultExpanded);

    // LocalStorage yükle
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw) as Record<string, boolean>;
                setExpanded({ ...defaultExpanded, ...parsed });
            } else {
                setExpanded(defaultExpanded);
            }
        } catch {
            setExpanded(defaultExpanded);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Aktif route kontrolü
    useEffect(() => {
        setExpanded((prev) => {
            const next = { ...prev };
            let changed = false;

            for (const section of sections) {
                if (section.children && section.children.length > 0) {
                    const hasActiveChild = section.children.some((c) =>
                        c.match === "exact" ? pathname === c.href : pathname.startsWith(c.href)
                    );

                    if (hasActiveChild && !next[section.key]) {
                        next[section.key] = true;
                        changed = true;
                    }
                }
            }

            if (changed) {
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
                } catch { }
                return next;
            }
            return prev;
        });
    }, [pathname, sections]);

    // State kaydet
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(expanded));
        } catch { }
    }, [expanded]);

    function toggle(key: string) {
        setExpanded((prev) => {
            const next = { ...prev, [key]: !prev[key] };
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch { }
            return next;
        });
    }

    const isActive = (href: string, match: Match = "startsWith") =>
        match === "exact" ? pathname === href : pathname.startsWith(href);

    // Stiller
    const itemBase = "group flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-input-focus";
    const parentInactive = "text-admin-fg/80 hover:bg-admin-input-bg hover:text-admin-fg";
    const parentActive = "bg-admin-input-bg text-admin-fg border border-admin-border font-medium";
    const singleLinkInactive = "text-admin-fg/80 hover:bg-admin-input-bg hover:text-admin-fg";
    const singleLinkActive = "bg-admin-input-bg text-blue-600 font-medium border border-blue-200";
    const childLinkBase = "block px-3 py-2 rounded-md text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-input-focus";
    const childInactive = "text-admin-fg/75 hover:bg-admin-input-bg hover:text-admin-fg";
    const childActive = "bg-admin-input-bg text-admin-fg border border-admin-border";

    // Hydration mismatch önlemek için mounted kontrolü (İsteğe bağlı, ama temiz görüntü için iyi)
    if (!mounted) return null;

    return (
        <aside
            className="fixed top-0 left-0 z-20 w-64 mt-[6vh] h-[94vh] overflow-y-auto bg-admin-fg/10 border-r border-admin-border"
            aria-label="Admin sidebar"
        >
            <nav className="p-3 text-admin-fg/90">
                <ul className="space-y-2">
                    {sections.map((section) => {
                        // 1. Durum: SINGLE LINK (Eğer children yoksa)
                        if (!section.children || section.children.length === 0) {
                            const active = section.href ? isActive(section.href, section.match || "startsWith") : false;

                            return (
                                <li key={section.key}>
                                    <Link
                                        href={section.href || "#"}
                                        className={`${itemBase} ${active ? singleLinkActive : singleLinkInactive}`}
                                        title={t(section.labelKey)}
                                    >
                                        <span className="truncate">{t(section.labelKey)}</span>
                                    </Link>
                                </li>
                            );
                        }

                        // 2. Durum: DROPDOWN MENU
                        const activeParent =
                            (section.href && isActive(section.href, section.match || "startsWith")) ||
                            section.children.some((c) => isActive(c.href, c.match || "startsWith"));

                        const open = expanded[section.key];
                        const submenuId = `submenu-${section.key}`;

                        return (
                            <li key={section.key}>
                                <div className={`${itemBase} ${activeParent ? parentActive : parentInactive}`}>
                                    {/* Sol Taraf: Başlık */}
                                    {section.href ? (
                                        <Link
                                            href={section.href}
                                            className="inline-flex items-center gap-2 truncate flex-1"
                                            title={t(section.labelKey)}
                                        >
                                            <span className="truncate">{t(section.labelKey)}</span>
                                        </Link>
                                    ) : (
                                        <span className="inline-flex items-center gap-2 truncate flex-1 cursor-default">
                                            {t(section.labelKey)}
                                        </span>
                                    )}

                                    {/* Sağ Taraf: Aç/Kapa Oku */}
                                    <button
                                        type="button"
                                        aria-expanded={open}
                                        aria-controls={submenuId}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggle(section.key);
                                        }}
                                        className="p-1 hover:bg-black/5 rounded transition-colors"
                                    >
                                        <IoChevronDown
                                            size={16}
                                            className={`transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"}`}
                                        />
                                    </button>
                                </div>

                                {/* Submenu */}
                                <ul
                                    id={submenuId}
                                    className={`mt-1 pl-2 border-l border-admin-border/60 space-y-1 ${!open ? "hidden" : ""}`}
                                >
                                    {section.children.map((child) => {
                                        const active = isActive(child.href, child.match || "startsWith");
                                        return (
                                            <li key={child.href}>
                                                <Link
                                                    href={child.href}
                                                    className={`${childLinkBase} ${active ? childActive : childInactive}`}
                                                    title={t(child.labelKey)}
                                                >
                                                    {t(child.labelKey)}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </li>
                        );
                    })}

                    {/* Statik Linkler */}
                    <li className="mt-2 pt-2 border-t border-admin-border/50">
                        <span className="block px-3 py-2 text-xs font-semibold text-admin-muted uppercase tracking-wider">
                            {t("management")}
                        </span>
                    </li>
                    <li>
                        <Link href="/admin/users" className={`${itemBase} ${singleLinkInactive} opacity-50 cursor-not-allowed`}>
                            {t("users")}
                        </Link>
                    </li>
                </ul>
            </nav>
        </aside>
    );
}