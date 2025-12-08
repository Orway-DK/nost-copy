"use client";

import React from "react";
import Image from "next/image";

// --- ÖRNEK GÖRSELLER (3 Adet) ---
const ARTWORKS = [
    {
        id: 1,
        title: "Abstract Flow",
        src: "https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=1000&auto=format&fit=crop",
        color: "bg-blue-500" // Dekoratif etiket rengi
    },
    {
        id: 2,
        title: "Geometric Harmony",
        src: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop",
        color: "bg-purple-500"
    },
    {
        id: 3,
        title: "Minimalist Lines",
        src: "https://images.unsplash.com/photo-1717748347101-0bbee4b75fd5?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        color: "bg-orange-500"
    }
];

export default function HangingGallery() {
    return (
        <section className="py-32 w-full min-h-screen bg-background overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">

                <div className="text-center mb-24">
                    <h2 className="text-4xl md:text-6xl font-black text-foreground mb-4">
                        Duvarlarımızdaki <span className="text-primary">Sanat</span>
                    </h2>
                    <p className="text-muted text-lg">
                        İşçiliğimizin kalitesini inceleyin. (Resimlerin üzerine gelin)
                    </p>
                </div>

                {/* GALERİ GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 mt-12">
                    {ARTWORKS.map((art, index) => (
                        <HangingFrame key={art.id} art={art} index={index} />
                    ))}
                </div>

            </div>
        </section>
    );
}

// --- ASILI ÇERÇEVE BİLEŞENİ ---
function HangingFrame({ art, index }: { art: typeof ARTWORKS[0], index: number }) {
    // Animasyon gecikmesi (Hepsi aynı anda sallanmasın)
    const delayClass = index === 0 ? "delay-0" : index === 1 ? "delay-150" : "delay-300";

    return (
        // Wrapper: Çerçevenin sallanma alanını sınırlar
        <div className="relative group w-full flex justify-center h-[500px]">

            {/* PIVOT NOKTASI (Görünmez Dönüş Merkezi) 
         transform-origin-top: Dönüşü en tepeden (çividen) başlatır.
      */}
            <div className={`relative w-[300px] origin-top transition-transform duration-[2000ms] ease-in-out group-hover:rotate-6 group-hover:duration-500 ${delayClass} will-change-transform`}>

                {/* --- ÇİVİ VE İPLER --- */}
                <div className="absolute -top-[60px] left-1/2 -translate-x-1/2 w-full h-[60px] z-10">
                    {/* Çivi */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#333] rounded-full shadow-sm z-20 border border-[#555]"></div>

                    {/* Sol İp */}
                    <div className="absolute top-1.5 left-1/2 w-[1px] h-[70px] bg-gradient-to-b from-[#888] to-transparent origin-top -rotate-[25deg] -translate-x-full"></div>
                    {/* Sağ İp */}
                    <div className="absolute top-1.5 left-1/2 w-[1px] h-[70px] bg-gradient-to-b from-[#888] to-transparent origin-top rotate-[25deg]"></div>
                </div>

                {/* --- ÇERÇEVE (FRAME) --- */}
                <div className="relative bg-card p-4 pb-12 shadow-2xl rounded-sm border-4 border-white/10 overflow-hidden transform-style-3d">

                    {/* Resim */}
                    <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-200 shadow-inner">
                        <Image
                            src={art.src}
                            alt={art.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />

                        {/* Cam Yansıması Efekti */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    </div>

                    {/* Alt Etiket (Müze Kartı Gibi) */}
                    <div className="absolute bottom-4 left-0 w-full text-center px-4">
                        <h3 className="font-oswald text-xl text-foreground uppercase tracking-widest">{art.title}</h3>
                        <div className={`w-8 h-1 ${art.color} mx-auto mt-2 rounded-full`}></div>
                    </div>

                    {/* Bant Efekti (Süsleme) */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-white/20 backdrop-blur-sm rotate-1 shadow-sm border border-white/10"></div>

                </div>

                {/* --- GÖLGE (Hareketle değişen) --- */}
                {/* Çerçeve döndüğünde gölge ters yöne giderek derinlik katar */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-[80%] h-4 bg-black/40 blur-xl rounded-[100%] transition-all duration-500 group-hover:translate-x-8 group-hover:opacity-20"></div>

            </div>
        </div>
    );
}