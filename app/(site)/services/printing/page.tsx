// app/services/printing/page.tsx
import React from "react";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Özel Baskı Hizmetleri - Nost Copy",
    description: "En gelişmiş ofset ve dijital baskı çözümlerimizle tanışın.",
};

export default async function PrintingPage() {
    return (
        // bg-background: Temanın ana zemin rengi
        <div className="w-full min-h-screen bg-background">

            {/* --- HERO BÖLÜMÜ --- */}
            {/* bg-secondary: Temadaki koyu ikincil renk (Slate 800)
         text-background: Temadaki zemin rengi (Genelde beyaz), koyu zemin üstünde okunaklı olur.
      */}
            <section className="relative h-[600px] w-full bg-secondary text-background flex items-center justify-center overflow-hidden">

                {/* Görsel Opaklığı */}
                <div className="absolute inset-0 opacity-40">
                    <Image
                        src="/images/printing-hero-special.jpg"
                        alt="Printing"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                <div className="relative z-10 text-center px-4">
                    <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tighter">
                        SINIRSIZ BASKI
                    </h1>
                    {/* opacity-90: Rengi değiştirmeden hafif şeffaflıkla ton farkı yaratıyoruz */}
                    <p className="text-xl md:text-2xl font-light opacity-90">
                        Hayal ettiğiniz her şeyi kağıda döküyoruz.
                    </p>

                    {/* Buton:
                bg-background -> Beyaz zemin
                text-secondary -> Koyu metin
                hover:bg-card -> Hover'da hafif grileşme
            */}
                    <button className="mt-8 px-8 py-3 bg-background text-secondary font-bold rounded-full hover:bg-card transition-colors">
                        Hemen Teklif Al
                    </button>
                </div>
            </section>

            {/* --- ÖZEL İÇERİK BÖLÜMÜ --- */}
            <section className="py-20 max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                    {/* text-foreground: Ana metin rengi */}
                    <h2 className="text-4xl font-bold mb-6 text-foreground">Neden Bizim Baskı Çözümlerimiz?</h2>

                    {/* text-muted: Açıklama metni rengi */}
                    <p className="text-lg text-muted mb-4">
                        Diğer hizmetlerimizden farklı olarak, baskı departmanımızda
                        Heidelberg XL-75 makineleri kullanıyoruz. Bu sayfa özel olarak tasarlandı
                        çünkü baskı bizim amiral gemimiz.
                    </p>

                    <ul className="space-y-3 mt-6 text-foreground">
                        <li className="flex items-center gap-2">
                            <span className="text-primary">✅</span> 24 Saatte Teslim
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-primary">✅</span> Pantone Renk Garantisi
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-primary">✅</span> Ücretsiz Numune
                        </li>
                    </ul>
                </div>

                {/* bg-card: Kart arkaplan rengi */}
                <div className="bg-card p-8 rounded-2xl h-[400px] border border-muted-light)]/20">
                    <div className="w-full h-full flex items-center justify-center text-muted border-2 border-dashed border-muted-light rounded-xl">
                        Özel Baskı Videoları Alanı
                    </div>
                </div>
            </section>

            {/* --- SÜREÇ BÖLÜMÜ --- */}
            {/* bg-foreground: Temanın en koyu rengi (Genelde siyah/çok koyu gri)
          text-background: Üzerine açık renk yazı
      */}
            <section className="bg-foreground text-background py-20 text-center">
                <h3 className="text-3xl font-bold mb-8">Baskı Sürecimiz Nasıl İşliyor?</h3>

                <div className="flex flex-wrap justify-center gap-8">
                    {/* border-[var(--muted)]: Kenarlık için muted rengini kullandık */}
                    <div className="w-64 p-6 border border-muted)] rounded-xl hover:bg-secondary/50 transition-colors">
                        <div className="text-primary font-bold text-xl mb-2">01</div>
                        Dosyanı Yükle
                    </div>
                    <div className="w-64 p-6 border border-muted)] rounded-xl hover:bg-secondary/50 transition-colors">
                        <div className="text-primary font-bold text-xl mb-2">02</div>
                        Onayla
                    </div>
                    <div className="w-64 p-6 border border-muted)] rounded-xl hover:bg-secondary/50 transition-colors">
                        <div className="text-primary font-bold text-xl mb-2">03</div>
                        Teslim Al
                    </div>
                </div>
            </section>
        </div>
    );
}