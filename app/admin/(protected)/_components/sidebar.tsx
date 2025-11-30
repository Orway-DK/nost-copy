// orway-dk/nost-copy/nost-copy-d541a3f124d8a8bc7c3eeea745918156697a239e/app/admin/(protected)/_components/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { IoChevronDown } from "react-icons/io5";

type Match = "exact" | "startsWith";

type ChildItem = {
    label: string;
    href: string;
    match?: Match;
};

type Section = {
    key: string;
    label: string;
    href?: string; // Parent sayfa yolunuz varsa (örn: /admin/settings)
    match?: Match; // Parent için aktiflik kontrolü
    children?: ChildItem[];
};

const STORAGE_KEY = "admin.sidebar.expanded";

export default function AdminSidebar() {
    const pathname = usePathname();

    // Sidebar yapısı: Site Settings bir parent, Social Links child olarak
    const sections = useMemo<Section[]>(
        () => [
            {
                key: "site",
                label: "Site Settings",
                href: "/admin/settings",
                match: "startsWith",
                children: [
                    { label: "General", href: "/admin/settings", match: "exact" },
                    { label: "Social Links", href: "/admin/settings-social", match: "startsWith" },
                    // İleride ekleyebileceğin diğer alt menüler:
                    // { label: "Footer", href: "/admin/settings/footer", match: "startsWith" },
                    // { label: "Theme", href: "/admin/settings/theme", match: "startsWith" },
                ],
            },
            {
                key: "products",
                label: "Products",
                href: "/admin/products",
                match: "startsWith",
                children: [
                    { label: "All Products", href: "/admin/products", match: "exact" },
                    { label: "Add New Product", href: "/admin/products/new", match: "exact" },
                    { label: "Ready Products", href: "/admin/ready-products", match: "exact" },
                    // Not: Categories, Attributes gibi sayfalar ileride eklenebilir.
                ],
            },
            // Diğer üst menüler (şimdilik örnek, route ekleyince aktif hale getir)
            // {
            //   key: "users",
            //   label: "Users",
            //   href: "/admin/users",
            //   match: "startsWith",
            // },
        ],
        []
    );

    // Varsayılan: tüm bölümler açık
    const defaultExpanded = useMemo<Record<string, boolean>>(
        () =>
            sections.reduce((acc, s) => {
                acc[s.key] = true;
                return acc;
            }, {} as Record<string, boolean>),
        [sections]
    );

    const [expanded, setExpanded] = useState<Record<string, boolean>>(defaultExpanded);

    // localStorage'dan açık/kapalı durumlarını yükle
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

    // Aktif route bir child'a denk geliyorsa, o parent'ı otomatik açık tut
    useEffect(() => {
        setExpanded((prev) => {
            const next = { ...prev };
            let changed = false;

            for (const section of sections) {
                const hasActiveChild =
                    (section.children || []).some((c) =>
                        c.match === "exact" ? pathname === c.href : pathname.startsWith(c.href)
                    ) || (section.href ? pathname.startsWith(section.href) : false);

                if (hasActiveChild && !next[section.key]) {
                    next[section.key] = true;
                    changed = true;
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

    // expanded değişince kaydet
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

    // Aktiflik yardımcıları
    const isActive = (href: string, match: Match = "startsWith") =>
        match === "exact" ? pathname === href : pathname.startsWith(href);

    const parentRowBase =
        "group flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-input-focus";
    const parentInactive = "text-admin-fg/80 hover:bg-admin-input-bg hover:text-admin-fg";
    const parentActive = "bg-admin-input-bg text-admin-fg border border-admin-border font-medium";

    const childLinkBase =
        "block px-3 py-2 rounded-md text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-input-focus";
    const childInactive = "text-admin-fg/75 hover:bg-admin-input-bg hover:text-admin-fg";
    const childActive = "bg-admin-input-bg text-admin-fg border border-admin-border";

    return (
        <aside
            className="fixed top-0 left-0 z-20 w-64 mt-[6vh] h-[94vh] overflow-y-auto bg-admin-fg/10 border-r border-admin-border" aria-label="Admin sidebar">
            <nav className="p-3 text-admin-fg/90">
                <ul className="space-y-2">
                    {sections.map((section) => {
                        const activeParent =
                            (section.href && isActive(section.href, section.match || "startsWith")) ||
                            (section.children || []).some((c) => isActive(c.href, c.match || "startsWith"));

                        const open = expanded[section.key];

                        const submenuId = `submenu-${section.key}`;

                        return (
                            <li key={section.key}>
                                <div
                                    className={`${parentRowBase} ${activeParent ? parentActive : parentInactive
                                        }`}
                                >
                                    {/* Sol tarafta "başlık + opsiyonel link" */}
                                    {section.href ? (
                                        <Link
                                            href={section.href}
                                            className="inline-flex items-center gap-2 truncate"
                                            aria-current={activeParent ? "page" : undefined}
                                            title={section.label}
                                        >
                                            <span className="truncate">{section.label}</span>
                                        </Link>
                                    ) : (
                                        <span className="inline-flex items-center gap-2 truncate">{section.label}</span>
                                    )}

                                    {/* Sağda aç/kapa düğmesi */}
                                    <button
                                        type="button"
                                        aria-expanded={open}
                                        aria-controls={submenuId}
                                        onClick={() => toggle(section.key)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                toggle(section.key);
                                            }
                                        }}
                                        className="
                      inline-flex items-center justify-center
                      w-8 h-8 rounded-md
                      hover:bg-admin-bg
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-input-focus
                    "
                                        title={open ? "Daralt" : "Genişlet"}
                                    >
                                        <IoChevronDown
                                            size={18}
                                            className={`transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"
                                                }`}
                                            aria-hidden="true"
                                        />
                                        <span className="sr-only">{open ? "Collapse" : "Expand"}</span>
                                    </button>
                                </div>

                                {/* Submenu */}
                                {section.children && section.children.length > 0 && (
                                    <ul
                                        id={submenuId}
                                        className={`mt-1 pl-2 border-l border-admin-border/60 space-y-1`}
                                        aria-hidden={!open}
                                    >
                                        {open &&
                                            section.children.map((child) => {
                                                const active = isActive(child.href, child.match || "startsWith");
                                                return (
                                                    <li key={child.href}>
                                                        <Link
                                                            href={child.href}
                                                            className={`${childLinkBase} ${active ? childActive : childInactive
                                                                }`}
                                                            aria-current={active ? "page" : undefined}
                                                            title={child.label}
                                                        >
                                                            {child.label}
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                    </ul>
                                )}
                            </li>
                        );
                    })}

                    {/* Örnek statik öğeler (route ekleyince sections'a taşı) */}
                    <li className="mt-2">
                        <span className="block px-3 py-2 text-sm text-admin-fg/60 rounded-md cursor-not-allowed">
                            Users
                        </span>
                    </li>
                </ul>
            </nav>
        </aside>
    );
}