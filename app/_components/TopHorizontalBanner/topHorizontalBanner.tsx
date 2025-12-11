"use client";

import useSWR from "swr";
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa"; // Map ikonu eklendi
import Dropdown from "./LanguageDropdown";
import { useLanguage } from "@/components/LanguageProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useEffect, useRef } from "react";
import { useAppLoading } from "@/components/AppLoadingProvider";

/**
 * Types
 */
type ContactInfoRow = {
  phone: string | null;
  email: string | null;
  location_url: string | null;
  location_label: string | null;
} | null;

type BannerTranslation = {
  promo_text: string | null;
  promo_cta: string | null;
  promo_url: string | null;
} | null;

/**
 * Fetcher
 */
const fetcher = async (lang: string) => {
  const supabase = createSupabaseBrowserClient();

  // 1. İletişim Bilgilerini Çek (Dile göre)
  const { data: contactData, error: contactError } = await supabase
    .from("site_contact_info")
    .select("phone, email, location_url, location_label")
    .eq("lang_code", lang)
    .maybeSingle();

  if (contactError) throw contactError;

  // 2. Banner Çevirisini Çek
  const { data: bannerJoin, error: bannerError } = await supabase
    .from("banner_translations")
    .select("promo_text,promo_cta,promo_url,banners!inner(code,active)")
    .eq("lang_code", lang)
    .eq("banners.code", "top_horizontal")
    .eq("banners.active", true)
    .maybeSingle();

  if (bannerError && bannerError.code !== "PGRST116") {
    throw bannerError;
  }

  const banner: BannerTranslation = bannerJoin ? {
    promo_text: bannerJoin.promo_text,
    promo_cta: bannerJoin.promo_cta,
    promo_url: bannerJoin.promo_url
  } : null;

  return {
    contact: contactData as ContactInfoRow,
    banner,
  };
};

export default function TopHorizontalBanner() {
  const { lang } = useLanguage();
  const { start, stop } = useAppLoading();
  const registeredRef = useRef(false);

  const { data, isLoading, error } = useSWR(
    ["top-horizontal-banner-v2", lang],
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
    return null;
  }

  const contact = data?.contact;
  const banner = data?.banner;

  if (!contact && !banner) return null;

  return (
    <div className="bg-gradient-to-r from-blue-800 to-blue-300 px-4 py-2 min-h-[40px] w-full flex justify-center font-poppins font-medium text-foreground relative z-[60]">
      <div className="flex flex-row justify-between items-center w-full max-w-7xl text-xs md:text-sm text-white">

        {/* --- SOL KISIM --- */}
        <div className="flex flex-row gap-4 md:gap-8 items-center">
          {/* Telefon: Her zaman görünür, mobilde ikon+numara */}
          {contact?.phone && (
            <a
              href={`tel:${contact.phone.replace(/\s/g, "")}`}
              className="flex flex-row items-center gap-2 hover:text-blue-100 transition-colors"
            >
              <FaPhone className="text-xs" />
              {/* Çok dar ekranlar için numarayı gizleyip sadece ikon bırakabiliriz, şimdilik gösteriyoruz */}
              <span className="whitespace-nowrap">{contact.phone}</span>
            </a>
          )}

          {/* E-mail: Mobilde gizlenir (hidden sm:flex) */}
          {contact?.email && (
            <a
              href={`mailto:${contact.email}`}
              className="hidden sm:flex flex-row items-center gap-2 hover:text-blue-100 transition-colors"
            >
              <FaEnvelope />
              <span>{contact.email}</span>
            </a>
          )}
        </div>

        {/* --- ORTA KISIM: Banner --- */}
        {/* Mobilde tamamen gizlenir (hidden md:flex), sadece tablet ve masaüstünde görünür */}
        <div className="hidden md:flex flex-row gap-2 items-center">
          {banner?.promo_text && (
            <a href={banner.promo_url ?? "#"} className="hover:underline text-center">
              {banner.promo_text}
            </a>
          )}
          {banner?.promo_text && banner?.promo_cta && (
            <span className="opacity-70 mx-1">|</span>
          )}
          {banner?.promo_cta && (
            <a href={banner.promo_url ?? "#"} className="font-bold underline decoration-white/50 hover:decoration-white transition-all whitespace-nowrap">
              {banner.promo_cta}
            </a>
          )}
        </div>

        {/* --- SAĞ KISIM: Dil & Konum --- */}
        <div className="flex flex-row items-center gap-3 md:gap-4">

          {/* Dil Seçici */}
          <Dropdown />

          {/* Konum Linki */}
          {contact?.location_url && (
            <>
              <span className="opacity-50">|</span>
              <a
                href={contact.location_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-100 transition-colors flex items-center gap-1"
                title={contact.location_label || "Location"}
              >
                {/* Mobilde sadece ikon görünür */}
                <FaMapMarkerAlt className="sm:hidden text-sm" />

                {/* Masaüstünde metin görünür */}
                <span className="hidden sm:inline whitespace-nowrap">
                  {contact.location_label || "Location"}
                </span>
              </a>
            </>
          )}
        </div>

      </div>
    </div>
  );
}