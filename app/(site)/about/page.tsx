import React from "react";
import Image from "next/image";
import AboutContent from "@/app/_components/About/AboutContent";

export const metadata = {
    title: "Hakkımızda - Nost Copy",
    description: "Nost Copy'nin hikayesi, vizyonu ve misyonu.",
};

export default function AboutPage() {
    return (
        <div className="relative w-screen min-h-screen left-1/2 -translate-x-1/2 overflow-x-hidden bg-gray-50/30">

            {/* --- ARKAPLAN DESENLERİ (Contact Page ile uyumlu) --- */}
            <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-0 left-0 rotate-0">
                    <Image
                        src="/h1-bg01.svg"
                        alt="bg"
                        width={600}
                        height={600}
                        className="object-cover opacity-40 w-[300px] md:w-[600px]"
                        priority
                    />
                </div>
                <div className="absolute top-[20%] -right-[10%] rotate-90 opacity-30">
                    <Image
                        src="/h1-slider1.svg"
                        alt="bg"
                        width={800}
                        height={800}
                        className="object-cover w-[400px] md:w-[800px]"
                    />
                </div>
            </div>

            {/* --- ANA İÇERİK --- */}
            <main className="relative z-10 w-full pt-20">
                <AboutContent />
            </main>
        </div>
    );
}