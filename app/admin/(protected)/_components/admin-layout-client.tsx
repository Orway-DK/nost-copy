"use client";

import React, { useState } from "react";
import AdminNavbar from "./navbar";
import AdminSidebar from "./sidebar";
import { SlMenu } from "react-icons/sl";

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[var(--admin-bg)] flex text-[var(--admin-fg)] font-sans selection:bg-[var(--admin-accent)] selection:text-white">

            {/* SIDEBAR (Props ile state kontrolü) */}
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* ANA İÇERİK SARMALAYICI */}
            {/* lg:pl-64 -> Masaüstünde sidebar genişliği kadar soldan boşluk bırak */}
            <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">

                {/* MOBİL HEADER (Sadece mobilde görünür - lg:hidden) */}
                {/* Sidebar'ı açmak için hamburger menü burada */}
                <div className="lg:hidden h-16 bg-[var(--admin-card)] border-b border-[var(--admin-card-border)] flex items-center px-4 sticky top-0 z-20 shadow-sm">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-[var(--admin-fg)] p-2 hover:bg-[var(--admin-input-bg)] rounded-lg transition-colors"
                    >
                        <SlMenu size={24} />
                    </button>
                    <span className="ml-4 font-bold text-lg">Admin Panel</span>
                </div>

                {/* DESKTOP NAVBAR */}
                {/* Mobilde gizleyebilirsin veya tutabilirsin. Genelde admin panellerde üstte User Profile kalır. */}
                <div className="sticky top-0 z-10 lg:z-30">
                    <AdminNavbar />
                </div>

                {/* SAYFA İÇERİĞİ */}
                <main className="p-4 md:p-8 flex-1 w-full max-w-[1600px] mx-auto overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}