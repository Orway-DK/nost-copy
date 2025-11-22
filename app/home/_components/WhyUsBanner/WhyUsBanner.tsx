"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { BiWorld } from "react-icons/bi";

export default function WhyUs() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    const [years, setYears] = useState(1);

    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.target === el && entry.isIntersecting && !visible) {
                        setVisible(true);
                        observer.unobserve(el); // Sadece bir kez
                    }
                });
            },
            {
                threshold: 0.5, // Biraz daha içeri girince tetiklensin
            }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [visible]);

    useEffect(() => {
        if (!visible) return;

        const duration = 1000; // 1 saniye
        const startValue = 1;
        const endValue = 24;
        const diff = endValue - startValue;
        let startTime: number | null = null;
        let rafId: number;

        const tick = (now: number) => {
            if (startTime === null) startTime = now;
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1); // 0..1
            const current = Math.round(startValue + diff * progress);
            setYears(current);
            if (progress < 1) {
                rafId = requestAnimationFrame(tick);
            } else {
                setYears(endValue); // garanti
            }
        };

        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, [visible]);

    return (
        <div
            ref={sectionRef}
            className="flex flex-row w-full max-w-7xl h-[60vh] my-20"
        >
            {/* Sol blok */}
            <div className="w-4xl relative">
                <div
                    className="z-10 transition-transform duration-1000 ease-out"
                    style={{
                        transform: visible ? "translateX(0)" : "translateX(-750px)",
                        opacity: visible ? 1 : 0,
                    }}
                >
                    <Image
                        src="/h1-banner01.jpg"
                        alt="bannerImage1"
                        width={500}
                        height={500}
                        className="rounded-3xl w-auto absolute"
                        loading="lazy"
                    />
                </div>

                <div
                    className="z-10 transition-transform duration-1000 ease-out"
                    style={{
                        transform: visible ? "translateY(0)" : "translateY(300px)",
                        opacity: visible ? 1 : 0,
                    }}
                >
                    <Image
                        src="/h1-banner02.jpg"
                        alt="bannerImage2"
                        width={400}
                        height={400}
                        className="rounded-3xl w-auto absolute top-50 right-0"
                        loading="eager"
                    />
                </div>

                <div className="absolute bottom-15 flex flex-col ml-10">
                    <span className="text-5xl text-blue-700">
                        {years}+
                    </span>
                    <span className="text-lg">Years Of Experience</span>
                </div>
            </div>

            {/* Sağ blok */}
            <div className="w-4xl">
                <div className="flex flex-col ml-5">
                    <span className="rounded-full bg-blue-100 w-fit py-1 px-2 text-blue-700 font-semibold uppercase ml-2">
                        BEST PRINTING COMPANY
                    </span>
                    <span className="text-5xl mt-2">
                        Reason To <span className="text-blue-700">Get Printing</span> Started With Us
                    </span>
                </div>
                <div className="flex flex-col text-xl font-normal mt-8 ml-20">
                    <span>
                        We are 100+ professional printing with more than 10 years of experience in create product
                        design. Believe it because you’ve seen it. Here are real numbers.
                    </span>
                    <ul className="gap-2 mt-2">
                        <li className="flex flex-row px-4 py-2 gap-4">
                            <BiWorld className="text-6xl text-blue-700" />
                            <div className="flex flex-col">
                                <span className="font-bold text-xl">High Profit Margin</span>
                                <span className="font-normal text-md">
                                    Effective optimization of cost and quality that makes you highly profitable.
                                </span>
                            </div>
                        </li>
                        <li className="flex flex-row px-4 py-2 gap-4">
                            <BiWorld className="text-6xl text-blue-700" />
                            <div className="flex flex-col">
                                <span className="font-bold text-xl">Global Shipping</span>
                                <span className="font-normal text-md">
                                    Reaching global market easily with our fast and flexible shipping solution.
                                </span>
                            </div>
                        </li>
                        <li className="flex flex-row px-4 py-2 gap-4">
                            <BiWorld className="text-6xl text-blue-700" />
                            <div className="flex flex-col">
                                <span className="font-bold text-xl">Trending Products</span>
                                <span className="font-normal text-md">
                                    Maximize your sale volume with our high market demanding products.
                                </span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}