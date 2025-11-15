import TopHorizontalBanner from "./_components/TopHorizontalBanner/topHorizontalBanner";
import NavigationBar from "./_components/NavigationBar/NavigationBar";
import LandingSlider from "./_components/LandingSlider/LandingSlider";
import AdsBanner from "./_components/AdsBannerBelowSlider/AdsBelowLanding";

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center w-full">
      <TopHorizontalBanner />
      <NavigationBar />
      <LandingSlider />
      <AdsBanner />
    </div>
  );
}
