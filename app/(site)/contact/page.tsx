// /home/dorukhan/Desktop/NostCopy/nost-copy/app/(site)/contact/page.tsx

import ContactFormArea from "@/app/_components/Contact/ContactFormArea";
import WorldMapLocations from "@/app/_components/Contact/WorldMapLocations";
import Image from "next/image";

export const metadata = {
    title: "İletişim - Nost Copy",
    description: "Bize ulaşın ve mağazalarımızı ziyaret edin.",
};

export default function ContactPage() {
    return (
        // BU WRAPPER ÖNEMLİ: Ebeveyn container'dan taşarak tüm ekranı kaplar
        <div className="relative w-screen min-h-screen left-1/2 -translate-x-1/2 overflow-x-hidden">

            {/* --- BACKGROUND ELEMENTLERİ --- */}
            <div className="absolute inset-0 w-full h-full pointer-events-none z-0">

                {/* Sol Üst Gradient Şekil */}
                <div className="absolute top-0 left-0">
                    <Image
                        src="/h1-bg01.svg"
                        alt="Background Shape"
                        width={600}
                        height={600}
                        className="object-cover opacity-60 w-[300px] md:w-[600px]" // Mobilde küçültelim
                        priority
                    />
                </div>

                {/* Sağ Orta - Dönmüş Şekil */}
                <div className="absolute top-[30%] -right-[10%] rotate-90 opacity-40">
                    <Image
                        src="/h1-slider1.svg"
                        alt="Background Shape"
                        width={800}
                        height={800}
                        className="object-cover w-[400px] md:w-[800px]"
                    />
                </div>

                {/* Sağ Üst Köşe */}
                <div className="absolute top-0 right-0 opacity-50">
                    <Image
                        src="/h1-slider2.svg"
                        alt="Background Shape"
                        width={700}
                        height={700}
                        className="object-cover w-[300px] md:w-[700px]"
                    />
                </div>
            </div>

            {/* --- ANA İÇERİK --- */}
            {/* z-10 vererek arka planın üstüne çıkmasını sağlıyoruz */}
            <main className="relative z-10 w-full">

                {/* Banner */}
                <section className="py-20 md:py-28 text-center">
                    <div className="max-w-7xl mx-auto px-4">
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                            Bize Ulaşın
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            Sorularınız mı var? Projenizi hayata geçirmek için buradayız.
                            Aşağıdaki formu doldurun veya dünya çapındaki ofislerimizi ziyaret edin.
                        </p>
                    </div>
                </section>

                {/* Harita */}
                <WorldMapLocations />

                {/* Form ve Bilgiler */}
                <ContactFormArea />
            </main>
        </div>
    );
}