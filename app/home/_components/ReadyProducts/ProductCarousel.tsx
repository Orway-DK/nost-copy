"use client";

import { useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { IoIosArrowDroprightCircle, IoIosArrowDropleftCircle } from "react-icons/io";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";

type RawLocalization = { lang_code: string; name: string | null };
type RawMedia = { kind: string | null; url: string; alt: string | null };

type RawItemRow = {
  id: number;
  order_no: number;
  image_override: string | null;
  products: {
    id: number;
    slug: string;
    active: boolean;
    product_localizations: RawLocalization[] | null;
    product_media: RawMedia[] | null;
  } | null;
  ready_products_showcase_prices: { currency_code: string; price_min: number; price_max: number }[] | null;
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
};

const default_currency_by_lang: Record<string, string> = { tr: "TRY", en: "USD", de: "EUR" };

function normalize_lang(raw?: string) {
  const two = (raw || "en").slice(0, 2).toLowerCase();
  return ["tr", "en", "de"].includes(two) ? two : "en";
}
function normalize_currency(raw?: string) {
  const up = (raw || "").toUpperCase();
  if (up === "TL") return "TRY";
  return ["TRY", "USD", "EUR"].includes(up) ? up : "";
}
function format_price_range(min: number, max: number, currency_code: string) {
  if (min === 0 && max === 0) return "—";
  try {
    const f = new Intl.NumberFormat(undefined, { style: "currency", currency: currency_code });
    return min === max ? f.format(min) : `${f.format(min)} – ${f.format(max)}`;
  } catch {
    return `${min} - ${max} ${currency_code}`;
  }
}

// Dil kodu normalize edip localizations karşılaştırmak için
function normalizeLocalizationLang(code: string | null | undefined) {
  if (!code) return "";
  return normalize_lang(code);
}

async function fetch_showcase_items(): Promise<RawItemRow[]> {
  const supabase = createSupabaseBrowserClient();

  // Section id tek sorgu
  const { data: sectionRow, error: sectionErr } = await supabase
    .from("ready_products_showcase_sections")
    .select("id")
    .eq("code", "home_featured")
    .maybeSingle();

  if (sectionErr) throw new Error(sectionErr.message);
  const sectionId = sectionRow?.id;
  if (!sectionId) return [];

  const { data, error } = await supabase
    .from("ready_products_showcase_items")
    .select(`
      id,
      order_no,
      image_override,
      products:product_id (
        id,
        slug,
        active,
        product_localizations (lang_code, name),
        product_media (kind, url, alt)
      ),
      ready_products_showcase_prices (currency_code, price_min, price_max)
    `)
    .eq("active", true)
    .eq("section_id", sectionId)
    .order("order_no", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

interface ProductCarouselProps {
  title?: string; // üst başlık
  showTitle?: boolean; // default true
  className?: string;
}

export default function ProductCarousel({ title = "Öne Çıkan Ürünler", showTitle = false, className = "" }: ProductCarouselProps) {
  const ctx = useLanguage() as { lang?: string; lang_code?: string; currency?: string; currency_code?: string };
  const lang_code = normalize_lang(ctx.lang_code ?? ctx.lang);
  const user_currency = normalize_currency(ctx.currency_code ?? ctx.currency);
  const effective_currency = user_currency || default_currency_by_lang[lang_code] || "USD";

  const { data: raw_items, error, isLoading } = useSWR("ready_products_showcase_home_featured", fetch_showcase_items, {
    revalidateOnFocus: false,
  });

  const products: ProductResolved[] = useMemo(() => {
    if (!raw_items) return [];
    return raw_items
      .map((row) => {
        const p = row.products;
        if (!p || !p.active) return null;

        // Görsel seçimi
        const overrideUrl = row.image_override || undefined;
        const mediaArr = p.product_media || [];
        const mainMedia =
          mediaArr.find((m) => (m.kind || "").toUpperCase() === "MAIN") ||
          mediaArr[0] ||
          null;
        const image_url = overrideUrl || mainMedia?.url || "/placeholder.png";
        const image_alt = mainMedia?.alt || p.slug || "";

        // İsim lokalizasyon fallback sırası
        const locs = p.product_localizations || [];
        const preferredOrder = [lang_code, "tr", "en", "de"];
        let chosenName: string | null = null;
        for (const code of preferredOrder) {
          const found = locs.find(
            (l) => normalizeLocalizationLang(l.lang_code) === code && l.name && l.name.trim().length > 0
          );
          if (found) {
            chosenName = found.name!;
            break;
          }
        }
        const name = chosenName || p.slug || "(Ürün)";

        // Fiyat seçimi
        const prices = row.ready_products_showcase_prices || [];
        let priceMatch =
          prices.find((pr) => pr.currency_code === effective_currency) ||
          prices.find((pr) => pr.currency_code === "USD") ||
          prices[0] ||
          null;
        const price_min = priceMatch?.price_min ?? 0;
        const price_max = priceMatch?.price_max ?? 0;
        const currency_code = priceMatch?.currency_code || effective_currency;

        return {
          id: p.id,
          slug: p.slug,
          image_url,
          image_alt,
          name,
          personalize_url: null,
          price_min,
          price_max,
          currency_code,
        };
      })
      .filter(Boolean) as ProductResolved[];
  }, [raw_items, lang_code, effective_currency]);

  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  const initialSlidesPerView = 2;
  const shouldLoop = products.length > initialSlidesPerView;

  return (
    <div className={`w-full h-auto relative ${className}`}>
      <div className="max-w-7xl mx-auto px-6 relative">
        {showTitle && (
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              {title}
            </h2>
            {/* İstersen buraya “Tümünü Gör” linki koyabilirsin */}
          </div>
        )}

        <button
          ref={prevRef}
          className="absolute z-10 top-1/2 -translate-y-1/2 -left-10 xl:-left-16 text-[#5137ff] hover:text-[#3725b3] transition-colors"
          aria-label="previous"
          type="button"
        >
          <IoIosArrowDropleftCircle className="w-11 h-11 drop-shadow-md" />
        </button>
        <button
          ref={nextRef}
          className="absolute z-10 top-1/2 -translate-y-1/2 -right-10 xl:-right-16 text-[#5137ff] hover:text-[#3725b3] transition-colors"
          aria-label="next"
          type="button"
        >
          <IoIosArrowDroprightCircle className="w-11 h-11 drop-shadow-md" />
        </button>

        {isLoading && (
          <div className="flex items-center justify-center h-40 text-gray-500">
            yükleniyor...
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center h-40 text-red-500">
            hata: {error.message}
          </div>
        )}
        {!isLoading && !error && products.length === 0 && (
          <div className="flex items-center justify-center h-40 text-gray-400">
            ürün bulunamadı
          </div>
        )}

        {!isLoading && !error && products.length > 0 && (
          <Swiper
            modules={[Autoplay, Navigation]}
            slidesPerView={initialSlidesPerView}
            spaceBetween={20}
            loop={shouldLoop}
            autoplay={{
              delay: 3000,
              disableOnInteraction: true,
              pauseOnMouseEnter: true,
            }}
            navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
            onBeforeInit={(swiper) => {
              const nav = swiper.params.navigation as any;
              nav.prevEl = prevRef.current;
              nav.nextEl = nextRef.current;
            }}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 24 },
              768: { slidesPerView: 3, spaceBetween: 24 },
              1024: { slidesPerView: 4, spaceBetween: 28 },
              1280: { slidesPerView: 4, spaceBetween: 32 },
            }}
            className="product-carousel select-none"
          >
            {products.map((p) => (
              <SwiperSlide key={p.id}>
                <div className="group relative rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg my-8 bg-white min-h-[420px] flex flex-col">
                  {/* Görsel */}
                  <div className="relative w-full aspect-square">
                    <Link
                      href={`/product/${p.slug}`}
                      title={p.name}
                      className="block w-full h-full relative"
                    >
                      <Image
                        src={p.image_url}
                        alt={p.image_alt || p.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 300px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>
                  </div>

                  {/* Caption */}
                  <div className="flex flex-col gap-3 p-5 pt-6 flex-grow">
                    <h3 className="text-lg font-semibold leading-snug text-center line-clamp-2">
                      {p.name}
                    </h3>
                    <div className="mt-auto flex flex-col items-center text-blue-600 font-semibold">
                      <span className="text-lg font-medium">
                        {format_price_range(p.price_min, p.price_max, p.currency_code)}
                      </span>
                    </div>
                  </div>

                  {/* Hover ring */}
                  <div className="absolute inset-0 pointer-events-none rounded-xl ring-0 group-hover:ring-2 group-hover:ring-blue-500/40 transition-all" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </div>
  );
}