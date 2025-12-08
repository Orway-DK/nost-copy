// app/services/design/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import TiltGallery from "./TiltGallery";
// --- SCROLL REVEAL COMPONENT (Aynı kaldı) ---
function Reveal({
    children,
    className = "",
    direction = "up",
    delay = 0,
    duration = 0.8
}: {
    children?: React.ReactNode,
    className?: string,
    direction?: "up" | "down" | "left" | "right",
    delay?: number,
    duration?: number
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.unobserve(entry.target);
            }
        }, { threshold: 0.15 });

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    const transforms = {
        up: "translate-y-12",
        down: "-translate-y-12",
        left: "-translate-x-12",
        right: "translate-x-12"
    };

    return (
        <div
            ref={ref}
            className={`transition-all ease-out ${className}`}
            style={{
                transitionDuration: `${duration}s`,
                transitionDelay: `${delay}ms`,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translate(0,0)" : transforms[direction]
            }}
        >
            {children}
        </div>
    );
}

// --- YENİ: GEOMETRİK AYIRAÇ (Marquee Yerine) ---
// Bauhaus tarzı, dönen sanat şekilleri
function CreativeSeparator() {
    return (
        <div className="w-full py-24 flex justify-center items-center gap-12 md:gap-32 overflow-hidden opacity-80">

            {/* Daire */}
            <div className="relative w-20 h-20 md:w-32 md:h-32 border-[1px] border-foreground rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite]">
                <div className="w-4 h-4 bg-primary rounded-full"></div>
            </div>

            {/* Kare */}
            <div className="w-20 h-20 md:w-32 md:h-32 border-[1px] border-primary bg-primary/10 rotate-12 animate-[pulse_4s_ease-in-out_infinite]"></div>

            {/* Üçgen (CSS ile) */}
            <div className="w-0 h-0 
            border-l-[40px] md:border-l-[60px] border-l-transparent
            border-b-[70px] md:border-b-[100px] border-b-foreground/80
            border-r-[40px] md:border-r-[60px] border-r-transparent
            animate-[bounce_3s_infinite]
       "></div>
        </div>
    );
}

export default function DesignPage() {
    return (
        <div className="w-full min-h-screen bg-background text-foreground overflow-x-hidden">
            {/* --- HERO SECTION --- */}
            <section className="relative min-h-[90vh] flex flex-col justify-center px-4 pt-20">
                <div className="max-w-[1400px] mx-auto w-full relative z-10">

                    <Reveal direction="right" delay={100} className="w-24 h-2 bg-primary mb-8" />

                    <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter leading-[0.85] mb-8">
                        <Reveal direction="up" delay={200}>
                            <span className="block text-foreground">VISUAL</span>
                        </Reveal>
                        <Reveal direction="up" delay={400}>
                            {/* GÜNCELLEME: "ALCHEMY" artık görünür (text-primary). Hover'da blur efekti var. */}
                            <span className="block text-primary transition-all duration-700 hover:blur-[4px] hover:scale-[1.02] cursor-default mix-blend-hard-light">
                                ALCHEMY
                            </span>
                        </Reveal>
                    </h1>
                    <TiltGallery />

                    <Reveal direction="up" delay={600} className="flex flex-col md:flex-row gap-8 mt-12 items-start">
                        <p className="text-xl md:text-2xl text-muted max-w-xl font-light leading-relaxed">
                            Tasarım, zekanın görünür halidir. Markanızın ruhunu, <strong className="text-foreground border-b-2 border-primary">sanatsal bir dille</strong> tercüme ediyoruz.
                        </p>
                        <div className="w-16 h-16 rounded-full border border-primary flex items-center justify-center animate-[spin_8s_linear_infinite]">
                            <span className="text-2xl font-light">↓</span>
                        </div>
                    </Reveal>
                </div>

                {/* Arkaplan Soyut Görsel */}
                <div className="absolute top-0 right-0 w-full md:w-2/3 h-full -z-10 opacity-30 pointer-events-none">
                    <div className="relative w-full h-full gradient-mask-l">
                        <Image
                            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
                            alt="Abstract Fluid Art"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                </div>
            </section>

            {/* --- GEOMETRİK AYIRAÇ (Marquee yerine geldi) --- */}
            <Reveal delay={200}>
                <CreativeSeparator />
            </Reveal>

            {/* --- GALLERY SECTION (Masonry) --- */}
            <section className="py-20 px-4">
                <div className="max-w-[1400px] mx-auto">
                    <Reveal direction="up" className="mb-16 flex justify-between items-end">
                        <h2 className="text-sm font-bold tracking-[0.5em] text-muted uppercase">Selected Works</h2>
                        <div className="hidden md:block w-32 h-[1px] bg-foreground/20"></div>
                    </Reveal>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-[400px]">

                        {/* Kart 1: Büyük */}
                        <Reveal delay={100} className="lg:col-span-2 group relative overflow-hidden rounded-2xl bg-card">
                            <Image
                                src="https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=2000&auto=format&fit=crop"
                                alt="Minimalist Branding"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <h3 className="text-4xl font-bold text-white tracking-tighter">BRANDING</h3>
                            </div>
                        </Reveal>

                        {/* Kart 2: Dikey */}
                        <Reveal delay={200} className="group relative overflow-hidden rounded-2xl bg-card">
                            <Image
                                src="https://images.unsplash.com/vector-1742739891335-8c946e23aa48?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                alt="Graphic Design"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:rotate-6 group-hover:scale-125"
                            />
                            <div className="absolute bottom-6 left-6 bg-background/90 px-4 py-2 rounded-full backdrop-blur-md">
                                <span className="text-foreground font-bold text-sm">GRAPHIC ART</span>
                            </div>
                        </Reveal>

                        {/* Kart 3: Dikey */}
                        <Reveal delay={300} className="group relative overflow-hidden rounded-2xl bg-card">
                            <Image
                                src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop"
                                alt="Tech UI"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                            />
                            <div className="absolute top-6 right-6 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold animate-pulse">
                                UI
                            </div>
                        </Reveal>

                        {/* Kart 4: Yatay Geniş (Metin) */}
                        <Reveal delay={400} className="lg:col-span-2 group relative overflow-hidden rounded-2xl bg-secondary text-background flex flex-col justify-center p-12">
                            <div className="absolute right-0 top-0 w-64 h-64 bg-primary blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity" />
                            <h3 className="text-4xl font-bold mb-4 relative z-10">Digital Experiences</h3>
                            <p className="text-lg opacity-80 max-w-md relative z-10">
                                Kullanıcı deneyimini (UX) merkeze alan, estetik ve fonksiyonelliği birleştiren web arayüzleri.
                            </p>
                            <Link href="/contact" className="mt-8 inline-flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all relative z-10">
                                Projeyi İncele <span>→</span>
                            </Link>
                        </Reveal>

                    </div>
                </div>
            </section>

            {/* --- SERVICES LIST (Accordion Style) --- */}
            <section className="py-20 bg-card text-card-foreground">
                <div className="max-w-5xl mx-auto px-4">
                    <Reveal>
                        <h2 className="text-5xl md:text-7xl font-bold mb-16 text-center tracking-tighter">
                            WHAT WE <span className="text-transparent text-stroke text-stroke-foreground">CRAFT</span>
                        </h2>
                    </Reveal>

                    <div className="divide-y divide-muted/20 border-t border-muted/20 border-b">
                        {[
                            { id: "01", title: "Visual Identity", desc: "Logo, Renk Paleti, Tipografi" },
                            { id: "02", title: "Web & Mobile UI", desc: "Arayüz Tasarımı, Prototipleme" },
                            { id: "03", title: "Print & Packaging", desc: "Ambalaj, Katalog, Dergi" },
                            { id: "04", title: "Motion Graphics", desc: "Animasyon, Video Kurgu" }
                        ].map((item, i) => (
                            <Reveal key={item.id} delay={i * 100} className="group py-12 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-background/50 transition-all px-4 cursor-pointer">
                                <div className="flex items-baseline gap-8">
                                    <span className="text-sm font-mono text-muted group-hover:text-primary transition-colors">/{item.id}</span>
                                    <h3 className="text-3xl md:text-5xl font-bold group-hover:translate-x-4 transition-transform duration-300">
                                        {item.title}
                                    </h3>
                                </div>
                                <p className="mt-4 md:mt-0 text-muted group-hover:text-foreground text-right font-light">
                                    {item.desc}
                                </p>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- FOOTER CTA --- */}
            <section className="py-32 px-4 relative overflow-hidden">
                {/* Arkaplan Efekti */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <Reveal direction="up">
                        <h2 className="text-5xl md:text-8xl font-black mb-8 leading-tight">
                            LET'S MAKE <br />
                            <span className="text-primary blur-sm hover:blur-none transition-all duration-500 cursor-pointer">MAGIC.</span>
                        </h2>
                        <Link
                            href="/contact"
                            className="group relative inline-flex items-center justify-center px-12 py-5 text-lg font-bold text-background bg-foreground rounded-full overflow-hidden transition-all hover:scale-105"
                        >
                            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-primary rounded-full group-hover:w-96 group-hover:h-96 opacity-20"></span>
                            <span className="relative">Start a Project</span>
                        </Link>
                    </Reveal>
                </div>
            </section>

            {/* --- Page Specific Styles --- */}
            <style jsx global>{`
        .gradient-mask-l {
          mask-image: linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
          -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%);
        }
      `}</style>

        </div>
    );
}