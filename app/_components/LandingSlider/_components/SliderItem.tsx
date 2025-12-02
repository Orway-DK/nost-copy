// C:\Projects\soner\app\_components\LandingSlider\_components\SliderItem.tsx
"use client";

import useSWR from "swr";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import SliderCard from "./SliderCard";
import { useLanguage } from "@/components/LanguageProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Yeni şema uyarlaması:
 * Eski tablo: landing_carousel (her dil ayrı satır)
 * Yeni tablo: landing_slides (base) + landing_slide_translations (çok dilli)
 *
 * landing_slide_translations alanları:
 * - title1, title2, text, button_link, tips (jsonb)
 *
 * Bu bileşen stilleri aynen korur; sadece veri kaynağı değişti.
 */

type RawTranslation = {
  title1: string | null;
  title2: string | null;
  text: string | null;
  button_link: string | null;
  tips: string[] | null;
  lang_code: string;
};

type RawSlide = {
  id: number;
  order_no: number;
  image_link: string;
  landing_slide_translations: RawTranslation[];
};

type Slide = {
  id: number;
  title1: string;
  title2: string;
  description: string;
  image_link: string;
  button_link: string | null;
  tips: string[];
};

const fetchSlides = async (lang: string): Promise<Slide[]> => {
  const supabase = createSupabaseBrowserClient();

  // Nested select + dil filtresi
  const { data, error } = await supabase
    .from("landing_slides")
    .select(
      "id, order_no, image_link, landing_slide_translations(title1,title2,text,button_link,tips,lang_code)"
    )
    .eq("active", true)
    .eq("landing_slide_translations.lang_code", lang)
    .order("order_no", { ascending: true });

  if (error) throw new Error(error.message);

  const rows: RawSlide[] = (data ?? []) as RawSlide[];

  // Her slide için doğru dil çevirisini seç
  return rows.map((row) => {
    const tr = row.landing_slide_translations.find(
      (t) => t.lang_code === lang
    );
    return {
      id: row.id,
      title1: tr?.title1 ?? "",
      title2: tr?.title2 ?? "",
      description: tr?.text ?? "",
      image_link: row.image_link,
      button_link: tr?.button_link ?? null,
      tips: tr?.tips ?? [],
    };
  });
};

export default function SliderItem() {
  const { lang } = useLanguage();

  const {
    data: slides,
    error,
    isLoading,
  } = useSWR<Slide[]>(["landing-slides", lang], () => fetchSlides(lang), {
    revalidateOnFocus: false,
  });

  if (isLoading) return <div className="py-8">Yükleniyor…</div>;
  if (error)
    return <div className="py-8 text-red-500">Bir hata oluştu.</div>;
  if (!slides?.length)
    return <div className="py-8">İçerik bulunamadı.</div>;

  const ctaDefault =
    lang === "tr" ? "Devamı" : lang === "de" ? "Mehr" : "Learn more";

  return (
    <section className="w-full h-full pb-10">
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={30}
        slidesPerView={1}
        loop
        autoplay={{ delay: 8000, disableOnInteraction: false }}
        breakpoints={{ 1024: { spaceBetween: 40 } }}
      >
        {slides.map((s, i) => (
          <SwiperSlide key={`slide-${s.id}-${i}`}>
            {({ isActive }) => (
              <div className="py-8 w-full">
                <SliderCard
                  isActive={isActive}
                  title={s.title1}
                  title2={s.title2}
                  description={s.description}
                  ctaText={ctaDefault}
                  imageSrc={s.image_link}
                  imageAlt={`${s.title1} ${s.title2}`}
                  href={s.button_link ?? "#"}
                  tips={s.tips}
                />
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}