// @/lib/dbTypes.ts

// #################################################################
// Languages
export type Language = { code: string; name: string; is_default: boolean };
export type LanguagesDb = { languages: Language[] };

// #################################################################

export type NavItem = {
  label: string;
  href?: string | null;
  children?: NavItem[];
};

export type NavigationDb = {
  navigation: Record<string, NavItem[]>;
};

// #################################################################

export type Banner = {
  lang_code: string;
  promo_text: string;
  promo_cta: string;
  promo_url: string | null;
};

export type BannersDb = { banners: Banner[] };

// #################################################################

export type CarouselSlide = {
  title1: string;
  title2: string;
  imageLink: string;
  subText: string;
  tips: string[];
  buttonLink: string;
};

export type CarouselDb = { landingCarousel: Record<string, CarouselSlide[]> };

// #################################################################

export type SiteSettings = {
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
  working_hours: string | null;
  footer_text: string | null;
  updated_at?: string | null;
};

export type SiteSettingsDb = { site_settings: SiteSettings };

// #################################################################

export type Ad = {
  text: string;
  icon: string;
};

export type AdsDb = Record<string, Ad[]>;
