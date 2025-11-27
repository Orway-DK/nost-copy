import TopHorizontalBanner from "./_components/TopHorizontalBanner/topHorizontalBanner";
import NavigationBar from "./_components/NavigationBar/NavigationBar";
import LandingSlider from "./_components/LandingSlider/LandingSlider";
import AdsBanner from "./_components/AdsBannerBelowSlider/AdsBelowLanding";
import WhyUs from "./_components/WhyUsBanner/WhyUsBanner";
import DualScrollingCategories from "./_components/slidingBand/DualScrollingCategories";
import MakeItEasier from "./_components/MakeItEasier/makeItEasier";
import MainFooter from "./_components/mainFooter/mainFooter";
import ReadyProducts from "./_components/ReadyProducts";
import TestimonialsCarousel from "./_components/Testimonials/TestimonialsCarousel";
import KeywordMarquee from "./_components/Testimonials/KeywordMarquee";

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center w-full">
      <TopHorizontalBanner />
      <NavigationBar />
      <LandingSlider />
      <AdsBanner />
      <WhyUs />
      <DualScrollingCategories />
      <MakeItEasier />
      <ReadyProducts />
      <KeywordMarquee />
      <TestimonialsCarousel />
      <MainFooter />
    </div>
  );
}
