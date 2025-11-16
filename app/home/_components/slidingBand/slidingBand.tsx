"use client";

import Link from "next/link";
import "./slidingBand.css";

const CATEGORIES = [
    "Dress shirt",
    "New Products",
    "Infants & toddlers",
    "Tank tops",
    "Men's shirts",
    "Women's shirts",
    "Bags & accessories",
];

export default function ScrollingCategories() {
    return (
        // Yatay taşmayı gizle, dikeyde alan bırak
        <div className="relative w-full overflow-hidden py-16">
            {/* Bant: hafif rotate + kenarları taşsın diye negatif margin */}
            <div className="bg-neutral-900 text-neutral-50 py-3 rotate-[3deg] -mx-10">
                <div className="px-6 group marquee-mask">
                    <div className="marquee-track animate-marquee">
                        {/* 3 tekrar: boşluk ihtimalini azaltır */}
                        <div className="marquee-strip">
                            <CategoryStrip />
                        </div>
                        <div className="marquee-strip" aria-hidden="true">
                            <CategoryStrip />
                        </div>
                        <div className="marquee-strip" aria-hidden="true">
                            <CategoryStrip />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CategoryStrip() {
    return (
        <div className="flex gap-10 items-center">
            {CATEGORIES.map((label) => (
                <Link
                    key={label}
                    href="#"
                    title={label}
                    className="
            text-xs sm:text-sm
            tracking-wide 
            uppercase 
            hover:underline 
            hover:text-amber-300 
            transition-colors 
            inline-block
          "
                >
                    {label}
                </Link>
            ))}
        </div>
    );
}
