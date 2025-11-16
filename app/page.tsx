"use client";

import { useState } from "react";
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
    const [picked] = useState<string | null>(() => {
        if (heroImages.length > 0) {
            const idx = Math.floor(Math.random() * heroImages.length);
            return heroImages[idx];
        }
        return null;
    });
    const [loaded, setLoaded] = useState(false);

    return (
        <div className="w-screen h-screen bg-black">
            <div className="absolute flex flex-col justify-center items-center w-full h-screen text-white z-20">
                <Image src="/nost.png" width={200} height={200} alt="Logo" className="spin-slow z-50 select-none" />
                <div className="bg-black rounded-full w-50 h-50 absolute top-78"></div>
                <p className="text-4xl font-poppins mt-10 select-none">Sitemiz yapım aşamasındadır.</p>
                <p className="text-xl font-poppins mt-5 select-none">Kısa süre içinde yayında olacağız.</p>
            </div>

            <div>
                <div className="absolute inset-0 z-10 bg-black/60" />
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
            <div className="absolute bottom-0 w-full text-center text-white p-2 select-none bg-black/60 z-20">© 2024 NostCopy | All rights reserved.</div>
        </div>
    );
}
