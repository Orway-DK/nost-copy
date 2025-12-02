// C:\Projects\soner\app\_components\LandingSlider\_components\SliderCard.tsx

"use client";

import Image from "next/image";
import Reveal from "./Reveal";
import CircularText from "./CircularText/CircularText";

type SliderCardProps = {
  title: string;
  title2: string;
  description: string;
  ctaText?: string;
  imageSrc: string;
  imageAlt?: string;
  isActive?: boolean;
  href?: string;
  tips?: string[];
};

export default function SliderCard({
  title,
  title2,
  description,
  ctaText = "Detaylar",
  imageSrc,
  imageAlt = "",
  isActive = false,
  href = "#",
  tips = [],
}: SliderCardProps) {
  return (
    <section className="w-full flex justify-center px-4">
      <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 items-center gap-4">
        {/* SOL METİN */}
        <div className="flex flex-col gap-6">
          <Reveal direction="down" delayMs={200} once={false}>
            <h2 className="text-3xl md:text-8xl leading-tight font-[onest] font-semibold -mb-8">
              {title}
            </h2>
          </Reveal>

          <div className="flex flex-row items-center gap-4">
            <div>
              <CircularText text="- PRINTING SERVICE - PRINTING SERVICE " />
            </div>
            <Reveal direction="left" delayMs={600} once={false}>
              <h2 className="text-3xl md:text-8xl font-semibold leading-tight font-[onest]">
                {title2}
              </h2>
            </Reveal>
          </div>

          <Reveal direction="up" delayMs={1000} once={false}>
            <p className="text-base md:text-lg text-black/70">{description}</p>
          </Reveal>

          <Reveal
            direction="up"
            delayMs={1320}
            once={false}
            className="flex flex-row gap-4 w-full items-center"
          >
            <a
              href={href}
              className="mt-2 min-w-32 inline-flex items-center justify-center rounded-full border px-5 py-2
              text-sm font-medium hover:bg-black hover:text-white transition-colors"
            >
              {ctaText}
            </a>

            <ul className="flex flex-row gap-4 w-full mt-2 justify-evenly items-center">
              {tips.map((tip, idx) => (
                <Reveal
                  key={`${tip}-${idx}`}
                  direction="up"
                  delayMs={1500 + idx * 300}
                  once={false}
                  className="flex flex-row gap-4 w-full items-center"
                >
                  <li className="bg-white w-full px-5 py-2 rounded-xl flex justify-center">
                    {tip}
                  </li>
                </Reveal>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* SAĞ GÖRSEL */}
        <Reveal direction="right" delayMs={0} once={false} className="w-full">
          <div className="relative w-full aspect-[4/3] md:aspect-auto md:h-[min(60vh,40rem)] min-h-full min-w-0 flex items-center justify-center">
            <div className="z-0 absolute bg-white/40 w-[600px] h-[600px] rounded-full origin-center animate-pulse-scale"></div>
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain w-auto"
              priority={isActive}
              draggable={false}
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}