import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
import LoginForm from "./_components/LoginForm";

export default async function AdminLoginPage() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll().map(c => ({ name: c.name, value: c.value }));
                },
                setAll() { },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        redirect("/admin");
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
            <div className="w-full max-w-md rounded-2xl px-6 py-5 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
                <h1 className="text-lg font-semibold mb-4">Admin Login</h1>
                <LoginForm />
            </div>
        </div>
    );
}