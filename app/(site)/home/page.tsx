// app/(site)/home/page.tsx
'use client'
import dynamic from 'next/dynamic'
import HeroBackground from '@/app/_components/HeroBackground'

// Yükleme sırasında yer tutacak boş alan (Layout Shift'i önlemek için)
const LandingPlaceholder = () => (
  <div className='w-full min-h-[500px] md:min-h-[60vh] bg-transparent'></div>
)

// --- DYNAMIC IMPORTS ---
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

// ReadyProducts import'u SİLİNDİ.

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
      {/* 1. GİRİŞ: Arkaplan ve Ana Slider */}
      <HeroBackground />
      <LandingSlider />

      {/* 2. HİZMETLERİMİZ: Kategoriler (Ne yapıyoruz?) */}
      <ServicesSlider />

      {/* 3. SÜREÇ: İşleri Nasıl Kolaylaştırıyoruz? */}
      {/* ReadyProducts buradan kaldırıldı, akış direkt sürece geçiyor */}
      <MakeItEasier />

      {/* 4. NEDEN BİZ: Kurumsal Güçlü Yanlar */}
      <WhyUs />

      {/* 6. GÜVEN: Müşteri Yorumları */}
      <TestimonialsCarousel />
      
      {/* 5. GÖRSEL ŞÖLEN: Kayan Yazılar/Kategoriler */}
      <DualScrollingCategories />

      {/* 7. BİLGİ: Blog */}
      <HomeBlogArea />

      {/* 8. FONKSİYON: Yukarı Çık */}
      <ScrollToTop />
    </div>
  )
}
