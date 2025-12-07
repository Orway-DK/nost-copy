// /home/dorukhan/Desktop/NostCopy/nost-copy/app/admin/(protected)/settings/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SlSettings, SlShare, SlList } from "react-icons/sl";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const tabs = [
        { name: "Genel Ayarlar", href: "/admin/settings", icon: <SlSettings /> },
        { name: "Sosyal Medya", href: "/admin/settings/social", icon: <SlShare /> },
        { name: "Footer Menüleri", href: "/admin/settings/footer", icon: <SlList /> },
    ];

    return (
        <div className="admin-root p-6 w-full max-w-[1600px] mx-auto min-h-screen">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Site Yapılandırması</h1>
                <p className="admin-help mt-1">Sitenizin genel kimliğini, bağlantılarını ve menülerini yönetin.</p>
            </div>

            <div className="flex border-b border-[var(--admin-card-border)] mb-8 overflow-x-auto gap-1">
                {tabs.map((tab) => {
                    // Tam eşleşme veya alt yol kontrolü
                    const isActive = pathname === tab.href;
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors whitespace-nowrap ${isActive
                                    ? "border-[var(--admin-info)] text-[var(--admin-info)] font-medium bg-[var(--admin-input-bg)] rounded-t-lg"
                                    : "border-transparent text-[var(--admin-muted)] hover:text-[var(--admin-fg)] hover:bg-[var(--admin-bg)]"
                                }`}
                        >
                            <span className="text-lg">{tab.icon}</span>
                            {tab.name}
                        </Link>
                    );
                })}
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {children}
            </div>
        </div>
    );
}