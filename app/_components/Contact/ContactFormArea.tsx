"use client";

import { useState } from "react";
import useSWR from "swr";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { SlLocationPin, SlPhone, SlEnvolope, SlSocialFacebook, SlSocialTwitter, SlSocialInstagram, SlSocialLinkedin } from "react-icons/sl";
import { toast } from "react-hot-toast";

// Fetcher
const fetchSettings = async () => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
    return data;
};

export default function ContactFormArea() {
    const { data: settings } = useSWR("contact-settings", fetchSettings);

    const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase.from("contact_messages").insert([formData]);

        if (error) {
            toast.error("Mesaj gönderilemedi.");
        } else {
            toast.success("Mesajınız alındı, teşekkürler!");
            setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
        }
        setLoading(false);
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="flex flex-col lg:flex-row gap-16">

                {/* SOL: İLETİŞİM BİLGİLERİ */}
                <div className="lg:w-1/3 space-y-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">İletişime Geçin</h3>
                        <p className="text-gray-500 leading-relaxed">
                            Projeleriniz hakkında konuşmak veya sadece merhaba demek için bize ulaşın.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xl flex-shrink-0"><SlLocationPin /></div>
                            <div>
                                <h4 className="font-bold text-gray-900">Adres</h4>
                                <p className="text-gray-500 text-sm mt-1">{settings?.address || "Yükleniyor..."}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xl flex-shrink-0"><SlPhone /></div>
                            <div>
                                <h4 className="font-bold text-gray-900">Telefon</h4>
                                <p className="text-gray-500 text-sm mt-1">{settings?.phone || "..."}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xl flex-shrink-0"><SlEnvolope /></div>
                            <div>
                                <h4 className="font-bold text-gray-900">E-Posta</h4>
                                <p className="text-gray-500 text-sm mt-1">{settings?.email || "..."}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SAĞ: FORM */}
                <div className="lg:w-2/3 bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Mesaj Gönderin</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-semibold text-gray-700">Adınız</label>
                                <input required type="text" className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-700">E-Posta</label>
                                <input required type="email" className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700">Konu</label>
                            <input type="text" className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700">Mesaj</label>
                            <textarea required rows={5} className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all resize-none" value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })}></textarea>
                        </div>
                        <button type="submit" disabled={loading} className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-lg disabled:opacity-70">
                            {loading ? "Gönderiliyor..." : "Mesajı Gönder"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}