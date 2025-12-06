// app/login/page.tsx
"use client";

import { useActionState } from "react"; // Next.js 15 (veya useFormState)
// Eğer Next.js 14 kullanıyorsan: import { useFormState } from "react-dom";
import { loginAction } from "@/app/auth/actions";
import { IoLogInOutline } from "react-icons/io5";

const initialState = {
    error: "",
};

export default function LoginPage() {
    // useActionState ile form durumunu yönetiyoruz
    const [state, formAction, isPending] = useActionState(async (prev: any, formData: FormData) => {
        const res = await loginAction(formData);
        // Eğer loginAction redirect yapmazsa (hata varsa) buraya düşer
        return res || { error: "" };
    }, initialState);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Admin Giriş</h1>
                    <p className="text-gray-500 mt-2">Yönetim paneline erişmek için giriş yapın.</p>
                </div>

                <form action={formAction} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-posta</label>
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="admin@example.com"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Şifre</label>
                        <input
                            name="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>

                    {state?.error && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm text-center border border-red-200">
                            {state.error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isPending ? "Giriş yapılıyor..." : <><IoLogInOutline size={20} /> Giriş Yap</>}
                    </button>
                </form>
            </div>
        </div>
    );
}