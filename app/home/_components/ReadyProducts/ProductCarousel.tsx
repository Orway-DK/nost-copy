"use client";

import { useMemo } from "react";
import Image from "next/image";
import useSWR from "swr";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import {
  IoIosArrowDroprightCircle ,
  IoIosArrowDropleftCircle
} from "react-icons/io";
import { FaArrowRight } from "react-icons/fa";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";

type RawTranslation = {
  name: string;
  personalize_url: string | null;
  lang_code: string;
};

type RawPrice = {
  currency_code: string;
  price_min: number;
  price_max: number;
};

type RawProductRow = {
  id: number;
  slug: string;
  image_url: string;
  image_alt: string;
  active: boolean;
  ready_products_carousel_translations?: RawTranslation[]; // Supabase nested
  ready_products_carousel_prices?: RawPrice[];
};

type ProductResolved = {
  id: number;
  slug: string;
  image_url: string;
  image_alt: string;
  name: string;
  personalize_url: string | null;
  price_min: number;
  price_max: number;
  currency_code: string;
  translation_found: boolean;
  price_found: boolean;
  fell_back: boolean;
};

const default_currency_by_lang: Record<string, string> = {
  tr: "TRY",
  en: "USD",
  de: "EUR"
};

function normalize_lang(raw?: string): string {
  if (!raw) return "en";
  const two = raw.slice(0, 2).toLowerCase();
  if (["tr", "en", "de"].includes(two)) return two;
  return "en";
}

function normalize_currency(raw?: string): string {
  if (!raw) return "";
  const up = raw.toUpperCase();
  if (up === "TL") return "TRY";
  if (["TRY", "USD", "EUR"].includes(up)) return up;
  return "";
}

function format_price_range(min: number, max: number, currency_code: string): string {
  if (min === 0 && max === 0) return "—";
  try {
    const f = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency_code
    });
    if (min === max) return f.format(min);
    return `${f.format(min)} – ${f.format(max)}`;
  } catch {
    return `${min} - ${max} ${currency_code}`;
  }
}

const fetch_products = async (): Promise<RawProductRow[]> => {
  const supabase = createSupabaseBrowserClient();
  // LEFT JOIN benzeri: alias kullanmadan diziler döner
  const { data, error } = await supabase
    .from("ready_products_carousel")
    .select(`
      id,
      slug,
      image_url,
      image_alt,
      active,
      ready_products_carousel_translations(name, personalize_url, lang_code),
      ready_products_carousel_prices(currency_code, price_min, price_max)
    `)
    .eq("active", true)
    .order("id", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
};

export default function ProductCarousel() {
  // Eski provider desteği
  const ctx = useLanguage() as unknown as {
    lang?: string;
    lang_code?: string;
    currency?: string;
    currency_code?: string;
  };

  const raw_lang = ctx.lang_code ?? ctx.lang;
  const lang_code = normalize_lang(raw_lang);
  const raw_currency = ctx.currency_code ?? ctx.currency;
  const user_currency = normalize_currency(raw_currency);
  const effective_currency =
    user_currency || default_currency_by_lang[lang_code] || "USD";

  const {
    data: raw_products,
    error,
    isLoading
  } = useSWR("ready_products_carousel_all", fetch_products, {
    revalidateOnFocus: false
  });

  const products: ProductResolved[] = useMemo(() => {
    if (!raw_products) return [];

    return raw_products.map((row) => {
      const translations = row.ready_products_carousel_translations || [];
      const prices = row.ready_products_carousel_prices || [];

      // Dil eşleşen çeviri
      const translationMatch = translations.find(
        (t) => t.lang_code === lang_code
      );
      const translation =
        translationMatch || translations[0] || null; // en azından birini al fallback

      const translation_found = Boolean(translationMatch);

      if (!translationMatch && typeof window !== "undefined") {
        console.warn(
          `[carousel] Çeviri bulunamadı (slug=${row.slug}, lang=${lang_code})`
        );
      }

      // Para birimi eşleşen fiyat
      let priceMatch = prices.find(
        (p) => p.currency_code === effective_currency
      );

      let fell_back = false;
      if (!priceMatch) {
        // USD fallback
        priceMatch = prices.find((p) => p.currency_code === "USD");
        if (!priceMatch) {
          // İlk fiyat neyse onu al
          priceMatch = prices[0];
        }
        fell_back = true;
        if (priceMatch && typeof window !== "undefined") {
          console.warn(
            `[carousel] Fiyat fallback kullanıldı (slug=${row.slug}, requested=${effective_currency}, used=${priceMatch.currency_code})`
          );
        }
      }

      const price_found = !fell_back;

      return {
        id: row.id,
        slug: row.slug,
        image_url: row.image_url,
        image_alt: row.image_alt,
        name: translation?.name || row.slug,
        personalize_url: translation?.personalize_url || null,
        price_min: priceMatch?.price_min ?? 0,
        price_max: priceMatch?.price_max ?? 0,
        currency_code: priceMatch?.currency_code || effective_currency,
        translation_found,
        price_found,
        fell_back
      };
    });
  }, [raw_products, lang_code, effective_currency]);

  if (typeof window !== "undefined") {
    console.debug("carousel context resolved:", {
      raw_lang,
      lang_code,
      raw_currency,
      effective_currency,
      products_count: products.length
    });
  }

  return (
    <div className="w-full h-auto relative">
      <div className="max-w-7xl mx-auto px-6 relative">
        <button
          className="carousel-prev absolute z-10 top-1/2 -translate-y-1/2 -left-16 xl:-left-32 text-[#5137ff] hover:text-[#3725b3] transition-colors"
          aria-label="previous"
        >
          <IoIosArrowDropleftCircle className="w-12 h-12 drop-shadow-md" />
        </button>
        <button
          className="carousel-next absolute z-10 top-1/2 -translate-y-1/2 -right-16 xl:-right-32 text-[#5137ff] hover:text-[#3725b3] transition-colors"
          aria-label="next"
        >
          <IoIosArrowDroprightCircle className="w-12 h-12 drop-shadow-md" />
        </button>

        {isLoading && (
          <div className="flex items-center justify-center h-full text-gray-500">
            yükleniyor...
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center h-full text-red-500">
            hata: {error.message}
          </div>
        )}
        {!isLoading && !error && products.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-400">
            ürün bulunamadı
          </div>
        )}

        {!isLoading && !error && products.length > 0 && (
          <Swiper
            modules={[Autoplay, Navigation]}
            slidesPerView={2}
            spaceBetween={20}
            loop
            autoplay={{
              delay: 3000,
              disableOnInteraction: true,
              pauseOnMouseEnter: true
            }}
            navigation={{
              prevEl: ".carousel-prev",
              nextEl: ".carousel-next"
            }}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 24 },
              768: { slidesPerView: 3, spaceBetween: 24 },
              1024: { slidesPerView: 4, spaceBetween: 28 },
              1280: { slidesPerView: 4, spaceBetween: 32 }
            }}
            className="product-carousel select-none"
          >
            {products.map((p) => {
              return (
                <SwiperSlide key={p.id}>
                  <div className="product-block group relative rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg my-8">
                    <div className="bg-white -z-10 w-full rounded-xl h-75 transition-all group-hover:h-full group-hover:bg-white absolute" />
                    <div className="product-transition relative">
                      <div className="product-image relative w-full aspect-square">
                        <a
                          href={`/product/${p.slug}`}
                          title={p.name}
                          className="block w-full h-full"
                        >
                          <Image
                            src={p.image_url}
                            alt={p.image_alt || p.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 300px"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </a>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                        {p.personalize_url && (
                          <a
                            href={p.personalize_url}
                            rel="nofollow"
                            className="button py-2 inline-flex items-center justify-center w-full 
                              rounded-full bg-white shadow-md text-black text-md 
                              hover:bg-[#5137ff] hover:text-white transition-colors"
                          >
                            <span className="flex flex-row items-center gap-4">
                              Personalize <FaArrowRight />
                            </span>
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="product-caption p-5 mt-5 flex flex-col gap-2 text-black">
                      <h3 className="text-lg font-semibold leading-snug flex justify-center transition-all group-hover:font-bold">
                        {p.name}
                      </h3>
                      <div className="mt-2 flex flex-col items-center text-blue-600 font-semibold">
                        <span className="price text-lg font-medium">
                          {format_price_range(
                            p.price_min,
                            p.price_max,
                            p.currency_code
                          )}
                          {!p.price_found ? " *" : ""}
                        </span>
                        {!p.translation_found && (
                          <span className="text-[10px] text-gray-400">
                            çeviri fallback
                          </span>
                        )}
                        {!p.price_found && (
                          <span className="text-[10px] text-gray-400">
                            fiyat fallback
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="product-hover absolute inset-0 pointer-events-none rounded-xl ring-0 group-hover:ring-2 group-hover:ring-blue-500/40 transition-all" />
                  </div>

                </SwiperSlide>
              );

            })}
          </Swiper>

        )
        }
      </div>

    </div>
  );
}