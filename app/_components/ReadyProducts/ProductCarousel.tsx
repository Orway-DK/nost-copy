"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { IoIosArrowDroprightCircle, IoIosArrowDropleftCircle } from "react-icons/io";
import { useLanguage } from "@/components/LanguageProvider";

export type CarouselProduct = {
  id: string;
  names: Record<string, string>;
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
  products: CarouselProduct[];
}

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

  // --- HYDRATION FIX: MOUNTED STATE ---
  const [mounted, setMounted] = useState(false);

  const { lang, currency } = useLanguage(); 
  
  const currencyCode = (currency || "USD").toUpperCase();
  const effectiveCurrency = ["TRY", "USD", "EUR"].includes(currencyCode) ? currencyCode : "USD";

  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  const initialSlidesPerView = 2;
  const shouldLoop = products.length > initialSlidesPerView;

  // Component tarayıcıda yüklendiğinde mounted true olur
  useEffect(() => {
    setMounted(true);
  }, []);

  // Ürün yoksa gösterme
  if (!products || products.length === 0) return null;

  // --- HYDRATION FIX: YÜKLENMEDEN ÖNCE RENDER YOK ---
  // Sunucu ve istemci arasındaki HTML farkını önlemek için,
  // tarayıcı tam yüklenene kadar boş (veya skeleton) döndür.
  if (!mounted) {
     return (
       <div className={`w-full h-auto relative ${className} py-10`}>
          {/* Layout Shift'i (zıplamayı) önlemek için basit bir yer tutucu */}
          <div className="max-w-7xl mx-auto px-6">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 {[1, 2, 3, 4].map(i => (
                     <div key={i} className="bg-gray-100 rounded-xl aspect-[4/5] animate-pulse"></div>
                 ))}
             </div>
          </div>
       </div>
     );
  }

  return (
    <div className={`w-full h-auto relative ${className}`}>
      <div className="max-w-7xl mx-auto px-6 relative group/carousel">
        {showTitle && title && (
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              {title}
            </h2>
          </div>
        )}

        <button
          ref={prevRef}
          className="absolute z-20 top-1/2 -translate-y-1/2 -left-4 md:-left-12 text-[#5137ff] hover:text-[#3725b3] transition-all disabled:opacity-0 scale-0 group-hover/carousel:scale-100"
          type="button"
        >
          <IoIosArrowDropleftCircle className="w-10 h-10 md:w-12 md:h-12 drop-shadow-md bg-white rounded-full" />
        </button>
        <button
          ref={nextRef}
          className="absolute z-20 top-1/2 -translate-y-1/2 -right-4 md:-right-12 text-[#5137ff] hover:text-[#3725b3] transition-all disabled:opacity-0 scale-0 group-hover/carousel:scale-100"
          type="button"
        >
          <IoIosArrowDroprightCircle className="w-10 h-10 md:w-12 md:h-12 drop-shadow-md bg-white rounded-full" />
        </button>

        <Swiper
          modules={[Autoplay, Navigation]}
          slidesPerView={initialSlidesPerView}
          spaceBetween={20}
          loop={shouldLoop}
          autoplay={{ delay: 4000, disableOnInteraction: true, pauseOnMouseEnter: true }}
          navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
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
          className="product-carousel select-none !pb-10 !px-1"
        >
          {products.map((p) => {
            // 1. Dile göre ismi seç
            const displayName = p.names[lang] || p.names['en'] || p.names['tr'] || "Product";
            
            // 2. Kura göre fiyatı seç
            let priceVal: number | null = 0;
            if (effectiveCurrency === "TRY") priceVal = p.price.try;
            else if (effectiveCurrency === "EUR") priceVal = p.price.eur;
            else priceVal = p.price.usd;

            return (
              <SwiperSlide key={p.id} className="h-auto !flex"> 
                
                <div className="group relative w-full flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
                  
                  {/* Görsel Alanı */}
                  <div className="relative w-full aspect-[4/5] bg-gray-50 overflow-hidden">
                    <Link href={p.url} title={displayName} className="block w-full h-full relative">
                      <Image
                        src={p.image}
                        alt={displayName}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 300px"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        unoptimized
                      />
                    </Link>
                  </div>

                  {/* İçerik Alanı */}
                  <div className="flex flex-col flex-grow p-5 text-center">
                    <h3 className="text-base font-semibold leading-snug text-gray-800 group-hover:text-[#5137ff] transition-colors line-clamp-2 min-h-[2.8rem] flex items-center justify-center mb-1">
                      <Link href={p.url}>
                        {displayName}
                      </Link>
                    </h3>

                    {/* Fiyat Alanı */}
                    <div className="mt-auto pt-3 border-t border-gray-50 w-full">
                      <span className="text-lg font-bold text-[#5137ff] block">
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