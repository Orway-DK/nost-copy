// @/app/admin/login/page.tx

"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
    const params = useSearchParams();
    const next = params.get("redirect") || "/admin";
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <form
                method="POST"
                action={`/admin/login/submit?redirect=${encodeURIComponent(next)}`} // ← güncellendi
                className="w-full max-w-sm space-y-4 border p-6 rounded"
            >
                <h1 className="text-xl font-semibold">Admin Login</h1>

                <label className="block text-sm">Email</label>
                <input name="email" type="email" required className="w-full border rounded px-3 py-2"
                    value={email} onChange={(e) => setEmail(e.target.value)} />

                <label className="block text-sm mt-3">Password</label>
                <input name="password" type="password" required className="w-full border rounded px-3 py-2"
                    value={password} onChange={(e) => setPassword(e.target.value)} />

                <button className="w-full bg-black text-white py-2 rounded mt-4" type="submit">
                    Sign in
                </button>
            </form>
        </div>
    );
}
