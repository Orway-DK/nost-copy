"use client";

import useSWR from "swr";
import { FaPhone, FaEnvelope } from "react-icons/fa6";
import Dropdown from "./LanguageDropdown";
import { useLanguage } from "@/components/LanguageProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useEffect, useRef } from "react";
import { useAppLoading } from "@/components/AppLoadingProvider";

/**
 * Types
 */
type SettingsRow = {
  phone: string | null;
  email: string | null;
  store_location_url: string | null;
  whatsapp_url?: string | null;
  address?: string | null;
} | null;

type BannerTranslation = {
  promo_text: string | null;
  promo_cta: string | null;
  promo_url: string | null;
} | null;

/**
 * Fetcher:
 * - site_settings tek satır
 * - banner_translations yeni modelde banner_id üzerinden (code='top_horizontal')
 */
const fetcher = async (lang: string) => {
  const supabase = createSupabaseBrowserClient();

  // Site settings
  const { data: settingsData, error: settingsError } = await supabase
    .from("site_settings")
    .select("phone,email,store_location_url,whatsapp_url,address")
    .limit(1)
    .maybeSingle();

  if (settingsError) throw settingsError;

  // Banner (via join)
  // Eğer Seçenek A'yı kullanıp sadece eski banner_translations tablosunu açtıysan:
  // .from('banner_translations').select('promo_text,promo_cta,promo_url').eq('lang_code', lang).maybeSingle();
  const { data: bannerJoin, error: bannerError } = await supabase
    .from("banner_translations")
    .select("promo_text,promo_cta,promo_url,banners!inner(code,active)")
    .eq("lang_code", lang)
    .eq("banners.code", "top_horizontal")
    .eq("banners.active", true)
    .maybeSingle();

  if (bannerError && bannerError.code !== "PGRST116") {
    // PGRST116: No rows found (join sonucu yok)
    throw bannerError;
  }

  const banner: BannerTranslation =
    bannerJoin && Array.isArray(bannerJoin.banners) && bannerJoin.banners[0]?.active ? bannerJoin : null;

  return {
    settings: (settingsData ?? null) as SettingsRow,
    banner,
  };
};

export default function TopHorizontalBanner() {
  const { lang } = useLanguage();
  const { start, stop } = useAppLoading();
  const registeredRef = useRef(false);

  const { data, isLoading, error } = useSWR(
    ["top-horizontal-banner", lang],
    () => fetcher(lang),
    {
      revalidateOnFocus: false,
    }
  );

  useEffect(() => {
    if (isLoading && !registeredRef.current) {
      start();
      registeredRef.current = true;
    }
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

  // Gösterilecek hiçbir şey yoksa
  if (!settings && !banner) return null;

  return (
    <div className="bg-linear-to-r from-blue-800 to-blue-300 px-4 py-2 h-10 w-full flex justify-center font-poppins font-medium text-foreground">
      <div className="flex flex-row justify-between items-center w-full max-w-7xl text-sm text-white">
        {/* Sol: Telefon / E-mail */}
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

        {/* Orta: Banner Promo */}
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

        {/* Sağ: Dil + Lokasyon */}
        <div className="flex flex-row items-center gap-2">
          <Dropdown />
          <span className="opacity-70">|</span>
          <a
            href={
              settings?.store_location_url ||
              settings?.whatsapp_url ||
              "#"
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            {settings?.store_location_url
              ? "Store Location"
              : settings?.whatsapp_url
                ? "WhatsApp"
                : "Location"}
          </a>
        </div>
      </div>
    </div>
  );
}