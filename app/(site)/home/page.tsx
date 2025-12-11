import LandingSlider from "@/app/_components/LandingSlider/LandingSlider";
import WhyUs from "@/app/_components/WhyUsBanner/WhyUsBanner";
import DualScrollingCategories from "@/app/_components/slidingBand/DualScrollingCategories";
import MakeItEasier from "@/app/_components/MakeItEasier/makeItEasier";
import ReadyProducts from "@/app/_components/ReadyProducts";
import TestimonialsCarousel from "@/app/_components/Testimonials/TestimonialsSection";
import ServicesSlider from "@/app/_components/ServicesSlider";
import HomeBlogArea from "@/app/_components/Blog/BlogArea";

export const dynamic = "force-dynamic";

export default function HomeWorking() {
    return (
        <div className="flex flex-col w-full items-center">
            <LandingSlider />
            <ServicesSlider />
            <WhyUs />
            <DualScrollingCategories />
            <MakeItEasier />
            <ReadyProducts />
            <TestimonialsCarousel />
            <HomeBlogArea />
        </div>
    );
}