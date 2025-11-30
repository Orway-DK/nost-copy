// orway-dk/nost-copy/nost-copy-d541a3f124d8a8bc7c3eeea745918156697a239e/app/_components/ReadyProducts/ProductCarousel.tsx
"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { IoIosArrowDroprightCircle, IoIosArrowDropleftCircle } from "react-icons/io";
import { useLanguage } from "@/components/LanguageProvider";

// Anasayfadan (index.tsx) gelen veri tipi
export type CarouselProduct = {
  id: string;
  name: string;
  image: string;
  price: {
    try: number | null;
    usd: number | null;
    eur: number | null;
  };
  url: string;
};

interface ProductCarouselProps {
  title?: string;
  showTitle?: boolean;
  className?: string;
  products: CarouselProduct[]; // Artık veriyi dışarıdan alıyoruz
}

// Para birimi formatlayıcı
function formatPrice(amount: number | null, currency: string) {
  if (!amount) return "—";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export default function ProductCarousel({
  title = "",
  showTitle = true,
  className = "",
  products = []
}: ProductCarouselProps) {

  // Dil ve Para birimi kontrolü
  const ctx = useLanguage() as { currency?: string; currency_code?: string };

  // Varsayılan para birimi belirle (USD fallback)
  const currencyCode = (ctx.currency_code || ctx.currency || "USD").toUpperCase();

  // TRY, USD, EUR dışında bir şey gelirse USD yap
  const effectiveCurrency = ["TRY", "USD", "EUR"].includes(currencyCode) ? currencyCode : "USD";

  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  const initialSlidesPerView = 2;
  const shouldLoop = products.length > initialSlidesPerView;

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className={`w-full h-auto relative ${className}`}>
      <div className="max-w-7xl mx-auto px-6 relative">
        {showTitle && (
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              {title}
            </h2>
          </div>
        )}

        {/* Navigasyon Butonları */}
        <button
          ref={prevRef}
          className="absolute z-10 top-1/2 -translate-y-1/2 -left-4 md:-left-10 xl:-left-16 text-[#5137ff] hover:text-[#3725b3] transition-colors disabled:opacity-30"
          aria-label="previous"
          type="button"
        >
          <IoIosArrowDropleftCircle className="w-8 h-8 md:w-11 md:h-11 drop-shadow-md" />
        </button>
        <button
          ref={nextRef}
          className="absolute z-10 top-1/2 -translate-y-1/2 -right-4 md:-right-10 xl:-right-16 text-[#5137ff] hover:text-[#3725b3] transition-colors disabled:opacity-30"
          aria-label="next"
          type="button"
        >
          <IoIosArrowDroprightCircle className="w-8 h-8 md:w-11 md:h-11 drop-shadow-md" />
        </button>

        <Swiper
          modules={[Autoplay, Navigation]}
          slidesPerView={initialSlidesPerView}
          spaceBetween={20}
          loop={shouldLoop}
          autoplay={{
            delay: 3500,
            disableOnInteraction: true,
            pauseOnMouseEnter: true,
          }}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onBeforeInit={(swiper) => {
            // @ts-ignore
            if (typeof swiper.params.navigation !== 'boolean') {
              // @ts-ignore
              swiper.params.navigation.prevEl = prevRef.current;
              // @ts-ignore
              swiper.params.navigation.nextEl = nextRef.current;
            }
          }}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 24 },
            768: { slidesPerView: 3, spaceBetween: 24 },
            1024: { slidesPerView: 4, spaceBetween: 28 },
            1280: { slidesPerView: 4, spaceBetween: 32 },
          }}
          className="product-carousel select-none !pb-10" // Gölge kesilmesin diye padding
        >
          {products.map((p) => {
            // Seçili kura göre fiyatı al
            let priceVal: number | null = 0;
            if (effectiveCurrency === "TRY") priceVal = p.price.try;
            else if (effectiveCurrency === "EUR") priceVal = p.price.eur;
            else priceVal = p.price.usd;

            return (
              <SwiperSlide key={p.id} className="h-auto">
                <div className="group relative rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl bg-white border border-transparent hover:border-blue-100 flex flex-col h-full">
                  {/* Görsel */}
                  <div className="relative w-full aspect-square bg-gray-50">
                    <Link
                      href={p.url}
                      title={p.name}
                      className="block w-full h-full relative"
                    >
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 300px"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        unoptimized // Supabase bucket için
                      />
                    </Link>
                    {/* Hızlı Bakış / Sepet vb. butonlar buraya gelebilir */}
                  </div>

                  {/* İçerik */}
                  <div className="flex flex-col gap-2 p-5 flex-grow">
                    <h3 className="text-base md:text-lg font-semibold leading-tight text-center line-clamp-2 text-gray-800 group-hover:text-blue-600 transition-colors">
                      <Link href={p.url}>
                        {p.name}
                      </Link>
                    </h3>

                    <div className="mt-auto pt-2 flex flex-col items-center">
                      <span className="text-lg md:text-xl font-bold text-blue-600">
                        {formatPrice(priceVal, effectiveCurrency)}
                      </span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
}