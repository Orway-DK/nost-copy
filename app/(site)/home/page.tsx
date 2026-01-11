// app/(site)/home/page.tsx
'use client'
import dynamic from 'next/dynamic'
import HeroBackground from '@/app/_components/HeroBackground'

const LandingPlaceholder = () => (
  <div className='w-full min-h-[500px] md:min-h-[60vh] bg-transparent'></div>
)

const ScrollToTop = dynamic(() => import('@/app/_components/ScrollToTop'), {
  ssr: false,
  loading: () => <LandingPlaceholder />
})
const LandingSlider = dynamic(
  () => import('@/app/_components/LandingSlider/LandingSlider'),
  { ssr: false, loading: () => <LandingPlaceholder /> }
)
const ServicesSlider = dynamic(
  () => import('@/app/_components/FeaturedCategories'),
  { ssr: false, loading: () => <LandingPlaceholder /> }
)
const WhyUs = dynamic(
  () => import('@/app/_components/WhyUsBanner/WhyUsBanner'),
  { ssr: false, loading: () => <LandingPlaceholder /> }
)
const DualScrollingCategories = dynamic(
  () => import('@/app/_components/slidingBand/DualScrollingCategories'),
  { ssr: false, loading: () => <LandingPlaceholder /> }
)
const MakeItEasier = dynamic(
  () => import('@/app/_components/MakeItEasier/makeItEasier'),
  { ssr: false, loading: () => <LandingPlaceholder /> }
)
const ReadyProducts = dynamic(() => import('@/app/_components/ReadyProducts'), {
  ssr: false,
  loading: () => <LandingPlaceholder />
})
const TestimonialsCarousel = dynamic(
  () => import('@/app/_components/Testimonials/TestimonialsSection'),
  { ssr: false, loading: () => <LandingPlaceholder /> }
)
const HomeBlogArea = dynamic(() => import('@/app/_components/Blog/BlogArea'), {
  ssr: false,
  loading: () => <LandingPlaceholder />
})

export const dynamicMode = 'force-dynamic'

export default function HomeWorking () {
  return (
    <div className='flex flex-col w-full items-center relative'>
      {/* 1. GİRİŞ: Büyük Banner */}
      <HeroBackground />
      <LandingSlider />
      {/* 2. KEŞİF: Recycle ettiğimiz "Öne Çıkan Kategoriler" */}
      {/* Kullanıcı hemen ne sattığını görsün ve görsel olarak tatmin olsun */}
      <ServicesSlider />
      {/* Adını FeaturedCategories olarak değiştirebilirsin */}
      {/* 3. AKSİYON: Hazır Ürünler / Vitrin */}
      {/* İnsanlar kategoriye girmeden "aa bu güzelmiş" deyip tıklasın. Yukarı taşıdık. */}
      <ReadyProducts />
      {/* 4. GÜVEN & BİLGİ: Neden Biz? */}
      {/* Ürünleri gördü, peki neden senden alsın? */}
      <MakeItEasier /> {/* Süreci anlatan kısım */}
      <WhyUs /> {/* Kalite vurgusu */}
      {/* 5. GEÇİŞ: Kayan Bant */}
      {/* Sayfanın ortasında görsel bir nefes alma alanı */}
      <DualScrollingCategories />
      {/* 6. SOSYAL KANIT & SEO */}
      <TestimonialsCarousel />
      <HomeBlogArea />
      <ScrollToTop />
    </div>
  )
}
