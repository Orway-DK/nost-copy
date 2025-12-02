// C:\Projects\soner\app\_components\LandingSlider\_components\SocialPart.tsx
"use client";

import useSWR from "swr";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import { FaFacebookF } from "react-icons/fa";
import { RiInstagramFill } from "react-icons/ri";
import { BsYoutube } from "react-icons/bs";
import { IconType } from "react-icons";

import { FaLinkedinIn } from "react-icons/fa";
const ICON_MAP: Record<string, IconType> = {
    facebook: FaFacebookF,
    instagram: RiInstagramFill,
    youtube: BsYoutube,
    linkedin: FaLinkedinIn,
};

type SocialRow = {
    code: string;
    url: string | null;
};



const fetchSocialLinks = async (): Promise<SocialRow[]> => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
        .from("site_social_links")
        .select("code,url,active")
        .eq("active", true)
        .order("sort", { ascending: true });

    if (error) throw error;
    return (data ?? [])
        .filter((r) => !!r.url)
        .map((r) => ({ code: r.code.toLowerCase(), url: r.url as string }));
};

export default function SocialPart() {
    const { data, isLoading, error } = useSWR<SocialRow[]>(
        "social-links",
        fetchSocialLinks,
        { revalidateOnFocus: false }
    );

    if (isLoading) {
        return (
            <ul className="absolute lg:right-50 xl:right-50 flex flex-col gap-4 z-50">
                {[...Array(6)].map((_, i) => (
                    <li
                        key={i}
                        className="w-12 h-12 rounded-full border-2 border-blue-200 bg-blue-50 animate-pulse"
                    />
                ))}
            </ul>
        );
    }

    if (error) {
        // Hata durumunda gizlemek yerine ufak bir uyarı göstermek istersen:
        return null;
    }

    const links = (data ?? []).filter((l) => ICON_MAP[l.code]);
    if (!links.length) return null;

    return (
        <ul className="absolute lg:right-50 xl:right-50 flex flex-col gap-4 z-50">
            {links.map(({ code, url }) => {
                const Icon = ICON_MAP[code];
                return (
                    <li key={code} className="group">
                        <Link
                            href={url || ""}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={code}
                            className="w-12 h-12 rounded-full flex items-center justify-center 
                border-2 border-blue-400 text-blue-500
                hover:text-white hover:bg-blue-400
                transition-colors"
                        >
                            <Icon size={20} />
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}