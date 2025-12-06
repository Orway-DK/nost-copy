"use client";

import { useActionState } from "react"; 
// NOT: Eğer Next.js 14 kullanıyorsan üstteki satırı silip şunu aç:
// import { useFormState as useActionState } from "react-dom";

import { loginAction } from "@/app/auth/actions";
import { IoLogInOutline, IoWarningOutline } from "react-icons/io5";

const initialState = {
    error: "",
};

export default function LoginPage() {
    // Form durumunu yönetiyoruz
    const [state, formAction, isPending] = useActionState(loginAction, initialState);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 font-sans">
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
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-200 animate-in fade-in">
                            <IoWarningOutline size={20} />
                            {state.error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isPending ? (
                            <span className="animate-pulse">Giriş yapılıyor...</span>
                        ) : (
                            <><IoLogInOutline size={20} /> Giriş Yap</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}