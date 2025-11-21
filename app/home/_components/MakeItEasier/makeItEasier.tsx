// @/app/_components/MakeItEasier/makeItEasier.tsx

"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function MakeItEasier() {
    const imageRef = useRef<HTMLDivElement>(null);
    const circleRef = useRef<HTMLDivElement>(null);
    const [imageVisible, setImageVisible] = useState(false);
    const [circleVisible, setCircleVisible] = useState(false);

    useEffect(() => {
        const imageEl = imageRef.current;
        const circleEl = circleRef.current;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.target === imageEl) {
                        setImageVisible(entry.isIntersecting);
                    }
                    if (entry.target === circleEl) {
                        setCircleVisible(entry.isIntersecting);
                    }
                });
            },
            { threshold: 0.2 }
        );

        if (imageEl) observer.observe(imageEl);
        if (circleEl) observer.observe(circleEl);

        //return () => observer.disconnect();
    }, []);

    return (
        <div className="mt-10 w-full overflow-hidden">
            <div className="block border-none rotate-180 w-[calc(100%)] overflow-hidden ">
                <svg className="bg-[#212529] h-[90px] w-[calc(100%+2px)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" preserveAspectRatio="none">
                    <path className="fill-[#ecf2ff] " d="M500,97C126.7,96.3,0.8,19.8,0,0v100l1000,0V1C1000,19.4,873.3,97.8,500,97z"></path>
                </svg>
            </div>

            <div className="bg-[#212529] w-full flex flex-wrap justify-center items-center gap-8">
                <div className="w-full max-w-xl h-[50vh] flex flex-col justify-center text-[#ecf2ff] px-6">
                    <h2 className="text-4xl sm:text-5xl font-semibold">PrintBe Make It Easier With 03 Steps</h2>
                    <p className="text-lg sm:text-xl mt-6 max-w-prose">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis.</p>
                </div>
                <div className="relative h-[50vh] flex items-center justify-center px-6 ">
                    <div
                        ref={circleRef}
                        className="absolute overflow-hidden bg-[#47597b] rounded-full w-100 h-100 top-60 -right-70 -translate-x-1/2 -translate-y-1/2 z-0 transition-all duration-2000 ease-out"
                        style={{
                            transform: circleVisible ? 'translateX(0)' : 'translateX(-100px)',
                            opacity: circleVisible ? 1 : 0,
                        }}
                    />

                    <div
                        ref={imageRef}
                        className="z-10 transition-all duration-1000 ease-out"
                        style={{
                            transform: imageVisible ? 'translateX(0)' : 'translateX(750px)',
                            opacity: imageVisible ? 1 : 0,
                        }}
                    >
                        <Image
                            src={"/h1-banner3.png"}
                            alt="broshure-sample"
                            width={1000}
                            height={1000}
                            className="w-150 h-auto object-contain z-50"
                            loading="lazy"
                        />
                    </div>
                </div>
            </div>

            <div className="w-full bg-[#212529]">
                <div className="max-w-6xl mx-auto pb-20 px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8 items-start">
                    <div className="flex items-start gap-4">
                        <span className="flex-shrink-0 bg-[#ecf2ff] text-[#212529] rounded-full w-20 h-20 flex items-center justify-center">
                            <i aria-hidden className="printbe-icon- printbe-icon-product-box"></i>
                        </span>
                        <div>
                            <h3 className="text-white text-lg font-semibold">Pick products</h3>
                            <p className="text-sm text-[#d1d7e6]">Print on 100% quality cotton for a vibrant finish and all-day comfort.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <span className="flex-shrink-0 bg-[#ecf2ff] text-[#212529] rounded-full w-20 h-20 flex items-center justify-center">
                            <i aria-hidden className="printbe-icon- printbe-icon-tshirt"></i>
                        </span>
                        <div>
                            <h3 className="text-white text-lg font-semibold">Custom &amp; review</h3>
                            <p className="text-sm text-[#d1d7e6]">Choose colors, sizes and preview your design before ordering.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <span className="flex-shrink-0 bg-[#ecf2ff] text-[#212529] rounded-full w-20 h-20 flex items-center justify-center">
                            <i aria-hidden className="printbe-icon- printbe-icon-delivery"></i>
                        </span>
                        <div>
                            <h3 className="text-white text-lg font-semibold">Ship for you</h3>
                            <p className="text-sm text-[#d1d7e6]">Fast, tracked shipping so your prints arrive safe and on time.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="block border-none w-[calc(100%)] overflow-hidden">
                <svg className="bg-[#212529] h-[90px] w-[calc(100%+2px)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" preserveAspectRatio="none">
                    <path className="fill-[#ecf2ff] " d="M500,97C126.7,96.3,0.8,19.8,0,0v100l1000,0V1C1000,19.4,873.3,97.8,500,97z"></path>
                </svg>
            </div>
        </div>
    );
}
