// lib/queries/site-settings.ts
// ✅ Supabase yok. Yerel JSON dosyalarını okuyor.

import path from "path";
import { promises as fs } from "fs";
import { readSiteSettings, readBanners } from "@/lib/db";
import type { SiteSettingsDb, BannersDb, Language } from "@/lib/dbTypes";

/** --- Tipler --- */
export type SiteSettings = {
  id?: string; // JSON'da yoksa undefined kalabilir
  site_name: string;
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
  working_hours: string | null;
  footer_text: string | null;
  created_at?: string | null; // JSON'da yoksa undefined
  updated_at?: string | null; // JSON'da yoksa undefined
};

export type BannerRow = {
  // Site settings alanlarının alt kümesi (banner bar’da ihtiyaç olanlar)
  site_name: string;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  store_location_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  whatsapp_url: string | null;
  footer_text: string | null;
  working_hours: string | null;

  // Banner alanları
  lang_code: string;
  promo_text: string;
  promo_cta: string;
  promo_url: string | null;
};

/** --- Dahili yardımcılar --- */
const DATA_DIR = path.join(process.cwd(), "data");

async function readLanguagesJson(): Promise<Language[] | null> {
  try {
    const raw = await fs.readFile(
      path.join(DATA_DIR, "languages.json"),
      "utf-8"
    );
    const parsed = JSON.parse(raw) as { languages?: Language[] };
    return parsed.languages ?? null;
  } catch {
    return null;
  }
}

/** boş/eksik değerleri güvenli şekilde normalize et */
function normalizeSettings(
  s: SiteSettingsDb["site_settings"] | undefined | null
): SiteSettings | null {
  if (!s) return null;
  return {
    id: (s as any).id,
    site_name: s.site_name ?? "",
    logo_url: s.logo_url ?? null,
    favicon_url: s.favicon_url ?? null,
    phone: s.phone ?? null,
    email: s.email ?? null,
    address: s.address ?? null,
    store_location_url: s.store_location_url ?? null,
    facebook_url: s.facebook_url ?? null,
    instagram_url: s.instagram_url ?? null,
    twitter_url: s.twitter_url ?? null,
    linkedin_url: s.linkedin_url ?? null,
    whatsapp_url: s.whatsapp_url ?? null,
    working_hours: s.working_hours ?? null,
    footer_text: s.footer_text ?? null,
    created_at: (s as any).created_at ?? null,
    updated_at: s.updated_at ?? null,
  };
}

/** --- API eşleniği fonksiyonlar (Supabase'siz) --- */

/** Varsayılan dili getir (languages.json → is_default=true). Yoksa 'en'. */
export async function getDefaultLang(): Promise<string> {
  const langs = await readLanguagesJson();
  const def = langs?.find((l) => l.is_default);
  return def?.code ?? "en";
}

/** site_settings.json → tek satır genel ayarlar */
export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const data = await readSiteSettings(); // { site_settings: {...} }
    return normalizeSettings(data?.site_settings) ?? null;
  } catch (e) {
    console.error("[getSiteSettings]", (e as Error).message);
    return null;
  }
}

/**
 * Banner'ı istenen dilde getir, yoksa varsayılana düş.
 * Kaynak: /data/banners.json
 */
export async function getBanner(lang?: string): Promise<BannerRow | null> {
  try {
    const wantLang = lang || (await getDefaultLang());
    const settings = await getSiteSettings();
    const { banners = [] } = (await readBanners()) as BannersDb;

    // Önce istenen dilde ara
    let b = banners.find((x) => x.lang_code === wantLang);

    // Bulamazsak varsayılan dile düş
    if (!b) {
      const fallback = await getDefaultLang();
      b = banners.find((x) => x.lang_code === fallback);
    }
    if (!b) return null;

    const s = settings ?? {
      site_name: "",
      logo_url: null,
      phone: null,
      email: null,
      store_location_url: null,
      facebook_url: null,
      instagram_url: null,
      twitter_url: null,
      linkedin_url: null,
      whatsapp_url: null,
      footer_text: null,
      working_hours: null,
    };

    const row: BannerRow = {
      site_name: s.site_name,
      logo_url: s.logo_url,
      phone: s.phone,
      email: s.email,
      store_location_url: s.store_location_url,
      facebook_url: s.facebook_url,
      instagram_url: s.instagram_url,
      twitter_url: s.twitter_url,
      linkedin_url: s.linkedin_url,
      whatsapp_url: s.whatsapp_url,
      footer_text: s.footer_text,
      working_hours: s.working_hours,

      lang_code: b.lang_code,
      promo_text: b.promo_text,
      promo_cta: b.promo_cta,
      promo_url: b.promo_url,
    };

    return row;
  } catch (e) {
    console.error("[getBanner]", (e as Error).message);
    return null;
  }
}

/** Ergonomi: tek çağrıda hem ayarlar hem banner */
export async function getSiteSettingsWithBanner(lang?: string) {
  const [settings, banner] = await Promise.all([
    getSiteSettings(),
    getBanner(lang),
  ]);
  return { settings, banner };
}
