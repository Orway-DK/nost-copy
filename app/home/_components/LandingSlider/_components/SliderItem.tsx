"use client";

import useSWR from "swr";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import SliderCard from "./SliderCard";
import { useLanguage } from "@/components/LanguageProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type ApiSlide = {
  id: number;
  lang_code: string;
  title1: string;
  title2: string;
  image_link: string;
  sub_text: string;
  tips: string[];
  button_link: string;
};

const fetcher = async (lang: string): Promise<ApiSlide[]> => {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("landing_carousel")
    .select("id, lang_code, title1, title2, image_link, sub_text, tips, button_link")
    .eq("lang_code", lang)
    .order("id", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
};

export default function SliderItem() {
  const { lang } = useLanguage();
  const { data: slides, error, isLoading } = useSWR(`carousel-${lang}`, () => fetcher(lang), {
    revalidateOnFocus: false,
  });

  if (isLoading) return <div className="py-8">Yükleniyor…</div>;
  if (error) return <div className="py-8 text-red-500">Bir hata oluştu.</div>;
  if (!slides?.length) return <div className="py-8">İçerik bulunamadı.</div>;
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
        {slides.map((s, i) => {
          const mapped = {
            title: s.title1,
            title2: s.title2,
            description: s.sub_text,
            ctaText: lang === "tr" ? "Devamı" : "Learn more",
            imageSrc: s.image_link,
            imageAlt: `${s.title1} ${s.title2}`,
            href: s.button_link,
            tips: s.tips ?? [],            // ✅ EKLENDİ
          };
          return (
            <SwiperSlide key={`slide-${i}`}>
              {({ isActive }) => (
                <div className="py-8 w-full">
                  <SliderCard key={`card-${i}-${isActive}`} isActive={isActive} {...mapped} />
                </div>
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}