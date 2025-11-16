"use client";

import Link from "next/link";
import "./slidingBands.css";

const CATEGORIES = [
    "Dress shirt",
    "New Products",
    "Infants & toddlers",
    "Tank tops",
    "Men's shirts",
    "Women's shirts",
    "Bags & accessories",
];

export default function DualScrollingCategories() {
    return (
        <div className="relative w-full overflow-hidden py-16">
            {/* ALT BANT – siyah, 3° sağdan sola */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 -mx-10 bg-neutral-900 text-neutral-50 py-3 rotate-[3deg]">
                <div className="px-6 group marquee-mask">
                    <div className="marquee-track dk-marquee">
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

            {/* ÜST BANT – beyaz, -2° soldan sağa */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 -mx-10 bg-white text-black py-3 rotate-[-2deg] z-10">
                <div className="px-6 group marquee-mask">
                    <div className="marquee-track dk-marquee-reverse">
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
            text-xs sm:text-sm font-semibold
            tracking-wide uppercase
            hover:underline hover:text-amber-500
            transition-colors inline-block
          "
                >
                    {label}
                </Link>
            ))}
        </div>
    );
}
