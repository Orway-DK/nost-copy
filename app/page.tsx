"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export const dynamic = "force-dynamic";

const heroImages: string[] = (() => {
    try {
        return JSON.parse(process.env.NEXT_PUBLIC_HERO_IMAGES || "[]");
    } catch {
        return [];
    }
})();

export default function Home() {
    // SSR'da rastgelelik yok → mismatch yok
    const [picked, setPicked] = useState<string | null>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (heroImages.length > 0) {
            const idx = Math.floor(Math.random() * heroImages.length);
            setPicked(heroImages[idx]);
        }
    }, []);

    return (
        <div className="w-screen h-screen bg-black">
            <div className="absolute flex flex-col justify-center items-center w-full h-screen text-white z-20">
                <Image src="/nost.png" width={200} height={200} alt="Logo" className="spin-slow" />
                <p className="text-4xl font-poppins mt-10">Sitemiz yapım aşamasındadır.</p>
                <p className="text-xl font-poppins mt-5">Kısa süre içinde yayında olacağız.</p>
            </div>

            <div>
                <div className="absolute inset-0 z-10 bg-black/50" />
                {picked && (
                    <Image
                        src={picked}
                        alt="Background"
                        fill
                        priority
                        placeholder="empty"
                        className={`select-none object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"
                            }`}
                        sizes="100vw"
                        onLoad={() => setLoaded(true)}
                    />
                )}
            </div>
        </div>
    );
}
