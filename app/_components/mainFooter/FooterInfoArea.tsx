"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// Sosyal ikonlar (isteğe göre azalt / değiştir)
import { FaFacebookF, FaTwitter, FaInstagram, FaPinterest, FaLinkedinIn, FaWhatsapp } from "react-icons/fa6";

type SiteSettings = {
    id: number;
    site_name: string | null;
    logo_url: string | null;
    favicon_url: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    store_location_url: string | null;
    facebook_url: string | null;
    instagram_url: string | null;
    twitter_url: string | null;
    linkedin_url: string | null;
    whatsapp_url: string | null;
    pinterest_url: string | null;
    working_hours: string | null;
    footer_text: string | null;
    updated_at: string | null;
    updated_by: string | null;
};

const INFORMATION_LINKS: { title: string; href: string; external?: boolean }[] = [
    { title: "About Us", href: "/about" },
    { title: "Our Blog", href: "/blog" },
    { title: "Start A Return", href: "/returns" },
    { title: "Contact Us", href: "/contact" },
    { title: "FAQs Page", href: "/faq" }
];

const USEFUL_LINKS: { title: string; href: string }[] = [
    { title: "My Account", href: "/account" },
    { title: "Shipping", href: "/shipping" },
    { title: "Contact & Support", href: "/support" },
    { title: "All Products", href: "/shop" }
];

const ABOUT_US_LINKS: { title: string; href?: string }[] = [
    { title: "Our Story" },
    { title: "Affiliate Program" },
    { title: "Referral Program" },
    { title: "Careers" }
];

export default function FooterInfoArea() {
    const [data, setData] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        const run = async () => {
            try {
                const supabase = createSupabaseBrowserClient();
                // Tek satır varsayımı: en güncelini getir (id lowest veya updated_at latest)
                const { data, error } = await supabase
                    .from("site_settings")
                    .select("*")
                    .order("updated_at", { ascending: false })
                    .limit(1)
                    .maybeSingle(); // maybeSingle: 0 veya 1 satır

                if (error) throw error;
                setData(data as SiteSettings);
            } catch (e: any) {
                setErr(e.message || "Failed to load settings");
            } finally {
                setLoading(false);
            }
        };
        run();
    }, []);

    return (
        <footer className="bg-[#212529] text-[#ecf2ff] w-full pt-10 flex flex-col items-center">
            {/* Top Divider */}
            <hr className="w-full max-w-7xl border-2 border-white/15 mb-8" />

            <div className="w-full max-w-7xl px-6 flex flex-row justify-between gap-4">
                {/* 1. Logo + Text + Social */}
                <div className="space-y-5">
                    <div className="h-12 flex items-center">
                        {loading && <div className="animate-pulse h-10 w-32 bg-white/10 rounded" />}
                        {!loading && data?.logo_url && (
                            <Image
                                src={data.logo_url}
                                alt={data.site_name || "logo"}
                                width={180}
                                height={60}
                                className="object-contain h-auto w-auto max-h-12"
                            />
                        )}
                        {!loading && !data?.logo_url && (
                            <span className="text-xl font-semibold tracking-wide">
                                {data?.site_name || "Site Name"}
                            </span>
                        )}
                    </div>
                    <p className="text-sm leading-relaxed text-white/80 min-h-[56px]">
                        {loading
                            ? "Loading settings..."
                            : data?.footer_text ||
                            "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium."}
                    </p>

                    <ul className="flex flex-row flex-wrap gap-3" aria-label="Social media">
                        {[
                            { url: data?.facebook_url, icon: <FaFacebookF size={18} />, label: "Facebook" },
                            { url: data?.twitter_url, icon: <FaTwitter size={18} />, label: "Twitter / X" },
                            { url: data?.instagram_url, icon: <FaInstagram size={18} />, label: "Instagram" },
                            { url: data?.pinterest_url, icon: <FaPinterest size={18} />, label: "Pinterest" }, // Eğer schema’ya eklersen
                            { url: data?.linkedin_url, icon: <FaLinkedinIn size={18} />, label: "LinkedIn" },
                            { url: data?.whatsapp_url, icon: <FaWhatsapp size={18} />, label: "WhatsApp" }
                        ]
                            .filter((s) => !!s.url)
                            .map((s) => (
                                <li key={s.label}>
                                    <a
                                        href={s.url!}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={s.label}
                                        className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                    >
                                        {s.icon}
                                    </a>
                                </li>
                            ))}
                        {!loading &&
                            ![
                                data?.facebook_url,
                                data?.twitter_url,
                                data?.instagram_url,
                                data?.linkedin_url,
                                data?.whatsapp_url
                            ].some(Boolean) && (
                                <li className="text-xs opacity-50">No social links configured</li>
                            )}
                    </ul>
                </div>

                {/* 2. Information */}
                <div>
                    <h6 className="text-lg font-semibold mb-4">Information</h6>
                    <ul className="space-y-2 text-sm">
                        {INFORMATION_LINKS.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className="hover:text-white transition-colors"
                                    target={item.external ? "_blank" : undefined}
                                >
                                    {item.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 3. Useful Links */}
                <div>
                    <h6 className="text-lg font-semibold mb-4">Useful Links</h6>
                    <ul className="space-y-2 text-sm">
                        {USEFUL_LINKS.map((item) => (
                            <li key={item.href}>
                                <Link href={item.href} className="hover:text-white transition-colors">
                                    {item.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 4. About Us */}
                <div>
                    <h6 className="text-lg font-semibold mb-4">About Us</h6>
                    <ul className="space-y-2 text-sm">
                        {ABOUT_US_LINKS.map((item, idx) => (
                            <li key={idx} className="text-white/80">
                                {item.href ? (
                                    <Link href={item.href} className="hover:text-white transition-colors">
                                        {item.title}
                                    </Link>
                                ) : (
                                    item.title
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
                {/* 5. Keep In Touch */}
                <div className="space-y-6">

                    <div>
                        <h6 className="text-lg font-semibold mb-2">Keep In Touch</h6>
                        <address className="not-italic text-sm leading-relaxed text-white/80 space-y-2">
                            <div>
                                {loading
                                    ? "Loading address..."
                                    : data?.address || "2972 Westheimer Rd. Santa Ana, Illinois 85486"}
                            </div>
                            <div>
                                {data?.email ? (
                                    <a
                                        href={`mailto:${data.email}`}
                                        className="hover:text-white transition-colors underline underline-offset-4"
                                    >
                                        {data.email}
                                    </a>
                                ) : (
                                    "support@example.com"
                                )}
                            </div>
                            <div>
                                {data?.phone ? (
                                    <a
                                        href={`tel:${data.phone.replace(/\s+/g, "")}`}
                                        className="hover:text-white transition-colors"
                                    >
                                        {data.phone}
                                    </a>
                                ) : (
                                    "+ (406) 555-0120"
                                )}
                            </div>
                            {data?.working_hours && (
                                <div className="opacity-75">Working Hours: {data.working_hours}</div>
                            )}
                            {data?.store_location_url && (
                                <div>
                                    <Link
                                        href={data.store_location_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-300 hover:text-blue-200 underline underline-offset-4"
                                    >
                                        View on Map
                                    </Link>
                                </div>
                            )}
                        </address>
                    </div>
                </div>
            </div>

            {/* Error / Loading feedback */}
            {err && (
                <div className="mt-6 text-sm text-red-400">
                    Failed to load site settings: {err}
                </div>
            )}

            {/* Divider */}
            <hr className="w-full max-w-7xl border-2 border-white/15 my-8" />

            {/* Bottom Row */}
            <div className="w-full max-w-7xl px-6 pb-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <span className="text-gray-400 text-sm md:text-base font-medium text-center md:text-left">
                    © {new Date().getFullYear()}{" "}
                    <b className="text-white">{data?.site_name || "YourBrand"}</b>. All rights reserved.
                </span>
                <Image
                    src="/payment.png"
                    width={400}
                    height={100}
                    alt="Payment methods"
                    className="w-auto h-8 object-contain"
                    loading="lazy"
                />
            </div>
        </footer>
    );
}