// @/app/_components/LandingSlider/LandingSlider.tsx
import Image from "next/image";
import SliderItem from "./_components/SliderItem";
import SocialPart from "./_components/SocialPart";

export default function LandingSlider() {
  return (
    <>
      <div className="flex justify-center items-center w-full mt-10">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <Image
            src="/h1-bg01.svg"
            alt="Landing Slider Background"
            width={500}
            height={500}
            className="object-cover object-center select-none"
            draggable={false}
            priority
          />
        </div>
        <div className="absolute top-0 right-0 -z-10 ">
          <Image
            src="/h1-slider1.svg"
            alt="Landing Slider Background"
            width={1000}
            height={1000}
            className="object-cover object-center select-none"
            draggable={false}
            priority
          />
        </div>
        <div className="absolute top-0 right-0 -z-10 ">
          <Image
            src="/h1-slider2.svg"
            alt="Landing Slider Background"
            width={700}
            height={700}
            className="object-cover object-center select-none"
            draggable={false}
            priority
          />
        </div>
        <div className="relative w-full">
          <section className="min-h-[50vh] flex items-center justify-center">
            <SliderItem />
          </section>
        </div>
        <SocialPart />
      </div>
    </>
  );
}
