// app/(site)/home/page.tsx
'use client'
import dynamic from 'next/dynamic'
import HeroBackground from '@/app/_components/HeroBackground'

/*
    import WhyUs from '@/app/_components/WhyUsBanner/WhyUsBanner'
    import DualScrollingCategories from '@/app/_components/slidingBand/DualScrollingCategories'
    import MakeItEasier from '@/app/_components/MakeItEasier/makeItEasier'
    import ReadyProducts from '@/app/_components/ReadyProducts'
    import TestimonialsCarousel from '@/app/_components/Testimonials/TestimonialsSection'
    import HomeBlogArea from '@/app/_components/Blog/BlogArea'
*/

const LandingPlaceholder = () => (
  <div className='w-full min-h-[500px] md:min-h-[60vh] bg-transparent'></div>
)

const LandingSlider = dynamic(
  () => import('@/app/_components/LandingSlider/LandingSlider'),
  { ssr: false, loading: () => <LandingPlaceholder /> }
)
const ServicesSlider = dynamic(
  () => import('@/app/_components/ServicesSlider'),
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
      <HeroBackground />
      <LandingSlider />
      <ServicesSlider />
      <DualScrollingCategories />
      <WhyUs />
      <MakeItEasier />
      <ReadyProducts />
      <TestimonialsCarousel />
      <HomeBlogArea />
    </div>
  )
}
