///home/dorukhan/Desktop/NostCopy/nost-copy/app/admin/login/_components/LoginForm.tsx

"use client";
import React, { useState } from "react";

export default function LoginForm() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const form = e.currentTarget;
        const email = (form.elements.namedItem("email") as HTMLInputElement)?.value ?? "";
        const password = (form.elements.namedItem("password") as HTMLInputElement)?.value ?? "";

        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const j = await res.json().catch(() => ({}));
                setError(j.error || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
                setLoading(false);
                return;
            }

            window.location.href = "/admin";
        } catch (err: any) {
            setError(err?.message || "Beklenmeyen bir hata oluştu.");
            setLoading(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm text-gray-700 dark:text-gray-300">E-posta</label>
                <input
                    name="email"
                    id="email"
                    type="email"
                    required
                    className="
            w-full rounded-lg px-3 py-2 text-sm
            bg-gray-50 text-gray-900 placeholder:text-gray-400
            border border-gray-300 outline-none
            focus:border-gray-500 focus:ring-2 focus:ring-gray-300
            dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400
            dark:border-gray-600 dark:focus:border-gray-400 dark:focus:ring-gray-500
            transition
          "
                    placeholder="Mail Adresi"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-sm text-gray-700 dark:text-gray-300">Şifre</label>
                <input
                    name="password"
                    id="password"
                    type="password"
                    required
                    className="
            w-full rounded-lg px-3 py-2 text-sm
            bg-gray-50 text-gray-900 placeholder:text-gray-400
            border border-gray-300 outline-none
            focus:border-gray-500 focus:ring-2 focus:ring-gray-300
            dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400
            dark:border-gray-600 dark:focus:border-gray-400 dark:focus:ring-gray-500
            transition
          "
                    placeholder="Şifre"
                />
            </div>

            {error && (
                <div
                    className="
            text-sm rounded-md px-3 py-2
            bg-red-100 text-red-700 border border-red-200
            dark:bg-red-900/40 dark:text-red-300 dark:border-red-800
          "
                    role="alert"
                >
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="
          rounded-md
          bg-gray-900 text-gray-100
          py-2 px-4
          text-sm font-medium
          shadow
          transition-all
          hover:bg-gray-800 hover:shadow-md
          focus:outline-none focus:ring-2 focus:ring-gray-400
          active:scale-[0.99]
          disabled:opacity-60 disabled:cursor-not-allowed
          dark:bg-gray-100 dark:text-gray-900
          dark:hover:bg-gray-200 dark:focus:ring-gray-300
        "
            >
                {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
        </form>
    );
}