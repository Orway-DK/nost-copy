// app/admin/(protected)/profile/profile-form.tsx
"use client";

import { useState } from "react";
import { updateProfileAction } from "./actions";
import { IoSave, IoPerson, IoKey } from "react-icons/io5";

export default function ProfileForm({ user }: { user: any }) {
    const [fullName, setFullName] = useState(user.user_metadata?.full_name || "");
    const [password, setPassword] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const res = await updateProfileAction({ 
            fullName, 
            password: password || undefined 
        });

        setSaving(false);

        if (res.success) {
            alert("✅ " + res.message);
            setPassword(""); // Şifre alanını temizle
        } else {
            alert("❌ " + res.message);
        }
    };

    return (
        <form onSubmit={handleSave} className="max-w-2xl">
            <div className="card-admin p-6 space-y-6">
                
                {/* Email (Read Only) */}
                <div className="space-y-2">
                    <label className="admin-label">E-posta Adresi</label>
                    <input 
                        className="admin-input opacity-60 cursor-not-allowed" 
                        value={user.email} 
                        disabled 
                    />
                    <p className="admin-help">E-posta adresi güvenlik nedeniyle buradan değiştirilemez.</p>
                </div>

                <div className="h-px bg-[var(--admin-card-border)]" />

                {/* İsim */}
                <div className="space-y-2">
                    <label className="admin-label flex items-center gap-2">
                        <IoPerson className="opacity-50" /> Ad Soyad
                    </label>
                    <input 
                        className="admin-input" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Adınız Soyadınız"
                    />
                </div>

                {/* Şifre */}
                <div className="space-y-2">
                    <label className="admin-label flex items-center gap-2">
                        <IoKey className="opacity-50" /> Yeni Şifre
                    </label>
                    <input 
                        type="password"
                        className="admin-input" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Değiştirmek istemiyorsanız boş bırakın"
                        autoComplete="new-password"
                    />
                </div>

                <div className="pt-4 flex justify-end">
                    <button 
                        type="submit" 
                        disabled={saving} 
                        className="btn-admin btn-admin-primary px-6 gap-2"
                    >
                        <IoSave />
                        {saving ? "Kaydediliyor..." : "Güncelle"}
                    </button>
                </div>
            </div>
        </form>
    );
}