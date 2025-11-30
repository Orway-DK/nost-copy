import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import React from "react";

import "../admin-theme.css";

import AdminNavbar from "./_components/navbar";
import AdminSidebar from "./_components/sidebar";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll().map(c => ({ name: c.name, value: c.value })); },
                setAll() { },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/admin/login");
    return (
        <div className="admin-root overflow-x-hidden bg-admin-bg">
            <header className="fixed top-0 left-0 right-0 z-30">
                <AdminNavbar />
            </header>
            <AdminSidebar />
            <main className="bg-admin-bg text-admin-fg min-h-screen w-[calc(screen-64)] ml-64 px-8 pt-20">
                {children}
            </main>
        </div>
    )
}