"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

// Yeni oluşturduğumuz component ve tipi import ediyoruz
import ServiceCard, { ServiceItem } from "./ServiceCard";

import "swiper/css";
import "swiper/css/pagination";

// Veriler (İstersen bunu da ayrı bir data.ts dosyasına taşıyabilirsin)
const SERVICES: ServiceItem[] = [
    {
        id: 1,
        title: "POD For Online Stores",
        slug: "pod-for-online-stores",
        image: "/services/h1-service1.jpg",
        index: "01"
    },
    {
        id: 2,
        title: "Digital Scanning",
        slug: "digital-scanning",
        image: "/services/h1-service2.jpg",
        index: "02"
    },
    {
        id: 3,
        title: "Stickers And Labels",
        slug: "stickers-and-labels",
        image: "/services/h1-service3.jpg",
        index: "03"
    },
    {
        id: 4,
        title: "Printing Service",
        slug: "printing-service",
        image: "/services/h1-service4.jpg",
        index: "04"
    },
    {
        id: 5,
        title: "Brand Strategy",
        slug: "brand-strategy",
        image: "/services/h1-service1.jpg",
        index: "05"
    }
];

export default function ServicesSlider() {
    return (
        // bg-background: Tema ana rengi
        <section className=" py-24 w-full max-w-full overflow-x-hidden">
            <div className="ml-[16vw]">
                <div className="mb-12">
                    <div className="text-sm font-bold tracking-widest text-muted uppercase mb-2">
                        OUR BEST SERVICES
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                        Premier One-Stop Custom <span className="text-primary">Print Solutions</span>
                    </h2>
                </div>

                <Swiper
                    modules={[Autoplay, Pagination]}
                    spaceBetween={24}
                    slidesPerView={1}
                    loop={true}
                    autoplay={{
                        delay: 5000,
                        disableOnInteraction: false,
                    }}
                    breakpoints={{
                        640: { slidesPerView: 2 },
                        1024: { slidesPerView: 3 },
                        1280: { slidesPerView: 4 },
                        1400: { slidesPerView: 4 },
                    }}
                    className="pb-16"
                >
                    {SERVICES.map((service) => (
                        <SwiperSlide key={service.id}>
                            <ServiceCard service={service} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
}