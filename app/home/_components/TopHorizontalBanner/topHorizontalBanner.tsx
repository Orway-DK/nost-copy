"use client";

import useSWR from "swr";
import { FaPhone, FaEnvelope } from "react-icons/fa6";
import Dropdown from "./LanguageDropdown";
import { useLanguage } from "@/components/LanguageProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import { useEffect, useRef } from "react";
import { useAppLoading } from "@/components/AppLoadingProvider";

type Settings = {
  phone: string | null;
  email: string | null;
  store_location_url: string | null;
} | null;

type Banner = {
  lang_code: string;
  promo_text: string | null;
  promo_cta: string | null;
  promo_url: string | null;
} | null;

const fetcher = async (lang: string) => {
  const supabase = createSupabaseBrowserClient();

  const { data: settingsData, error: settingsError } = await supabase
    .from("site_settings")
    .select("phone,email,store_location_url")
    .limit(1)
    .maybeSingle();

  if (settingsError) throw settingsError;

  const { data: bannerData, error: bannerError } = await supabase
    .from("banner_translations")
    .select("lang_code,promo_text,promo_cta,promo_url")
    .eq("lang_code", lang)
    .maybeSingle();

  if (bannerError) throw bannerError;

  return {
    settings: (settingsData ?? null) as Settings,
    banner: (bannerData ?? null) as Banner,
  };
};

export default function TopHorizontalBanner() {
  const { lang } = useLanguage();

  const { start, stop } = useAppLoading();
  const registeredRef = useRef(false);

  const { data, isLoading, error } = useSWR(
    `top-banner-${lang}`,
    () => fetcher(lang),
    {
      revalidateOnFocus: false,
    }
  );

  // 🔹 Global loading overlay yönetimi
  useEffect(() => {
    // İlk kez loading’e girdiğinde global counter’ı artır
    if (isLoading && !registeredRef.current) {
      start();
      registeredRef.current = true;
    }

    // Loading bittiğinde (ve daha önce register olduysa) counter’ı azalt
    if (!isLoading && registeredRef.current) {
      stop();
      registeredRef.current = false;
    }
  }, [isLoading, start, stop]);

  if (error) {
    return (
      <div className="w-full bg-red-600 text-white text-center py-2 text-sm">
        Üst banner yüklenirken bir hata oluştu.
      </div>
    );
  }

  const settings = data?.settings;
  const banner = data?.banner;

  if (!settings && !banner) return null;

  return (
    <div className="bg-linear-to-r from-blue-800 to-blue-300 px-4 py-2 h-10 w-full flex justify-center font-poppins font-medium text-foreground">
      <div className="flex flex-row justify-between items-center w-full max-w-7xl text-sm text-white">
        <div className="flex flex-row gap-8">
          {settings?.phone && (
            <a
              href={`tel:${settings.phone}`}
              className="flex flex-row items-center gap-2"
            >
              <FaPhone /> {settings.phone}
            </a>
          )}
          {settings?.email && (
            <a
              href={`mailto:${settings.email}`}
              className="flex flex-row items-center gap-2"
            >
              <FaEnvelope /> {settings.email}
            </a>
          )}
        </div>

        <div className="flex flex-row gap-2">
          {banner?.promo_text && (
            <a href={banner.promo_url ?? "#"}>{banner.promo_text}</a>
          )}
          {banner?.promo_text && banner?.promo_cta && (
            <span className="opacity-70">|</span>
          )}
          {banner?.promo_cta && (
            <a href={banner.promo_url ?? "#"}>{banner.promo_cta}</a>
          )}
        </div>

        <div className="flex flex-row items-center gap-2">
          <Dropdown />
          <span className="opacity-70">|</span>
          <a href={settings?.store_location_url ?? "#"}>Store Location</a>
        </div>
      </div>
    </div>
  );
}
