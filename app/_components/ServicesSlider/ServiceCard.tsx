"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

// Veri tipini burada tanımlayıp export ediyoruz
export interface ServiceItem {
    id: number;
    title: string;
    slug: string;
    image: string;
    index: string;
}

export default function ServiceCard({ service }: { service: ServiceItem }) {
    return (
        <Link
            href={`/service/${service.slug}`}
            // DEĞİŞİKLİK: 'h-[450px] w-[450px]' yerine 'w-full aspect-square' kullandık.
            // Bu sayede kart her zaman genişliği kadar yüksekliğe sahip olur (Tam Kare).
            className="group block relative w-full aspect-square overflow-hidden rounded-xl bg-card"
        >
            <div className="absolute inset-0 w-full h-full">
                <div className="relative w-full h-full">
                    <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                </div>
            </div>

            {/* Dikey Yazı */}
            <div className="absolute top-0 right-0 hidden md:flex flex-col items-center justify-center pointer-events-none">
                <div className="bg-white rounded-bl-full rounded-tl-full rounded-br-full p-4 m-4 shadow-md">
                    <span
                        className="text-black font-bold text-2xl"
                    >
                        {service.index}
                    </span>
                </div>
            </div>

            {/* Alt İçerik Alanı */}
            <div className="absolute bottom-0 left-0 w-full p-8 z-10 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                {/* İndex Numarası: Hover'da text-primary */}
                <div className="text-5xl font-bold text-transparent text-stroke mb-4 opacity-50 group-hover:opacity-100 group-hover:text-primary group-hover:text-stroke-0 transition-all duration-300">
                    {service.index}
                </div>

                {/* Başlık: Hover'da text-primary-light */}
                <h3 className="text-2xl font-bold text-white group-hover:text-primary-light transition-colors">
                    {service.title}
                </h3>

                {/* Alt Çizgi: bg-primary */}
                <div className="w-12 h-1 bg-primary mt-4 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
            </div>
        </Link>
    );
}