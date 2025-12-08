"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";

const ARTWORKS = [
    {
        id: 1,
        title: "Abstract Flow",
        src: "https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=1000&auto=format&fit=crop",
        desc: "Akışkan Sanat"
    },
    {
        id: 2,
        title: "Geometric Harmony",
        src: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop",
        desc: "Geometrik Düzen"
    },
    {
        id: 3,
        title: "Minimalist Lines",
        src: "https://images.unsplash.com/photo-1717748347101-0bbee4b75fd5?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        desc: "Minimal Çizgiler"
    }
];

export default function TiltGallery() {
    return (
        <section className="py-20 w-full min-h-screen bg-background flex flex-col justify-center items-center overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 w-full">

                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-black text-foreground mb-4">
                        Etkileşimli <span className="text-primary">Galeri</span>
                    </h2>
                    <p className="text-muted text-lg">
                        Görsellerin üzerine gelerek 3D derinliği hissedin.
                    </p>
                </div>

                {/* GRID YAPISI */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 justify-items-center">
                    {ARTWORKS.map((art) => (
                        <TiltCard key={art.id} art={art} />
                    ))}
                </div>

            </div>
        </section>
    );
}

// --- TILT CARD BİLEŞENİ ---
function TiltCard({ art }: { art: typeof ARTWORKS[0] }) {
    const cardRef = useRef<HTMLDivElement>(null);

    // Rotasyon ve Parlama (Glare) State'leri
    const [rotate, setRotate] = useState({ x: 0, y: 0 });
    const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

    // Mouse hareket ederken animasyon süresini sıfırlıyoruz (anlık tepki için)
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();

        // Mouse'un kart içindeki konumu (0 ile width/height arası)
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Merkezi hesapla
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Merkezden uzaklık (-1 ile 1 arası değerler elde etmek için normalize et)
        // Örn: Mouse en soldaysa -1, en sağdaysa 1
        const posX = (x - centerX) / centerX;
        const posY = (y - centerY) / centerY;

        // DÖNÜŞ HESABI (TILT)
        // Mouse sağa (X artıyor) giderse, kartın sağı size yaklaşmalı -> rotateY POZİTİF olmalı
        // Mouse aşağı (Y artıyor) giderse, kartın altı size yaklaşmalı -> rotateX NEGATİF olmalı
        const rotationX = posY * -20; // Max 20 derece yatay eksende dönme (Yukarı/Aşağı bakma)
        const rotationY = posX * 20;  // Max 20 derece dikey eksende dönme (Sağa/Sola bakma)

        setRotate({ x: rotationX, y: rotationY });

        // PARLAMA (GLARE) HESABI
        // Parlama mouse'un olduğu yerde olmalı
        setGlare({
            x: (x / rect.width) * 100,
            y: (y / rect.height) * 100,
            opacity: 1 // Mouse içerideyken parlamayı aç
        });
    };

    const handleMouseEnter = () => {
        setIsHovering(true);
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
        // Mouse çıkınca kartı düzelt ve parlamayı kapat
        setRotate({ x: 0, y: 0 });
        setGlare((prev) => ({ ...prev, opacity: 0 }));
    };

    return (
        // PERSPECTIVE CONTAINER: 3D derinlik algısı için şart
        <div
            className="relative w-full max-w-[350px] aspect-[3/4] group perspective-1000"
            style={{ perspective: "1000px" }}
        >
            <div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="relative w-full h-full bg-card rounded-xl shadow-xl overflow-hidden transform-style-3d border border-white/10"
                style={{
                    // Değişkenleri CSS transform'a bağlıyoruz
                    transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1.05, 1.05, 1.05)`,
                    // Mouse üzerindeyken transition'ı kaldırıyoruz ki takılmadan hareket etsin (ease-out). 
                    // Mouse çıkınca yumuşakça (500ms) yerine otursun.
                    transition: isHovering ? "none" : "all 0.5s ease-out",
                }}
            >
                {/* --- GÖRSEL --- */}
                <div className="relative w-full h-full">
                    <Image
                        src={art.src}
                        alt={art.title}
                        fill
                        className="object-cover pointer-events-none" // Resim mouse eventlerini çalmasın
                        sizes="(max-width: 768px) 100vw, 33vw"
                    />

                    {/* Hafif karartma (Derinlik hissi için) */}
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300"></div>
                </div>

                {/* --- GLARE (PARLAMA EFEKTİ) --- */}
                {/* Mouse'un olduğu yerde beyaz bir ışık huzmesi oluşturur */}
                <div
                    className="absolute inset-0 pointer-events-none mix-blend-overlay"
                    style={{
                        background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 80%)`,
                        opacity: glare.opacity,
                        transition: "opacity 0.3s ease" // Sadece opacity transition olsun, pozisyon anlık değişmeli
                    }}
                />

                {/* --- METİN KISMI (3D GİBİ HAVADA DURAN) --- */}
                {/* translateZ(60px): Yazıyı karttan 60px öne çıkarır, böylece kart dönerken yazı daha çok hareket eder */}
                <div
                    className="absolute bottom-8 left-8 right-8 text-white pointer-events-none transform-style-3d"
                    style={{ transform: "translateZ(60px)" }}
                >
                    <h3 className="text-2xl font-bold tracking-wider drop-shadow-lg">{art.title}</h3>
                    <p className="text-sm opacity-90 drop-shadow-md mt-1">{art.desc}</p>
                </div>

                {/* --- ÇERÇEVE KENARLIĞI (İçeriye doğru derinlik) --- */}
                <div className="absolute inset-0 border-[12px] border-white/10 rounded-xl pointer-events-none"></div>

            </div>

            {/* --- GÖLGE (Dinamik) --- */}
            {/* Kart havaya kalktıkça gölge uzaklaşır */}
            <div
                className="absolute -bottom-10 left-10 right-10 h-10 bg-black/30 blur-2xl rounded-full transition-all duration-300 transform translate-z-[-50px]"
                style={{
                    opacity: isHovering ? 0.6 : 0.3,
                    transform: isHovering ? "scale(0.9)" : "scale(1)"
                }}
            ></div>

        </div>
    );
}