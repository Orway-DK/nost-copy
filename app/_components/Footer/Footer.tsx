"use client";

import useSWR from "swr";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa6";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const fetcher = async () => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
};

export default function Footer() {
    const { data: settings } = useSWR("footer-settings", fetcher, {
        revalidateOnFocus: false,
    });

    if (!settings) return null;

    return (
        <footer className="w-full bg-gray-900 text-gray-300 py-8">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between gap-6">
                <div>
                    <p className="text-xl font-bold text-white">{settings.site_name}</p>
                    <p className="text-sm mt-2">{settings.address}</p>
                    <p className="text-sm mt-1">{settings.phone}</p>
                    <p className="text-sm">{settings.email}</p>
                </div>
                <div className="flex gap-4 text-xl">
                    {settings.facebook_url && <a href={settings.facebook_url} target="_blank"><FaFacebook /></a>}
                    {settings.instagram_url && <a href={settings.instagram_url} target="_blank"><FaInstagram /></a>}
                    {settings.twitter_url && <a href={settings.twitter_url} target="_blank"><FaTwitter /></a>}
                    {settings.linkedin_url && <a href={settings.linkedin_url} target="_blank"><FaLinkedin /></a>}
                </div>
            </div>
            <div className="mt-6 text-center text-xs text-gray-500">
                {settings.footer_text}
            </div>
        </footer>
    );
}
