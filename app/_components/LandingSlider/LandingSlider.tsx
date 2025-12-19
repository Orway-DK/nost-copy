// C:\Projeler\nost-copy\app\_components\LandingSlider\LandingSlider.tsx

import SliderItem from './_components/SliderItem'
import SocialPart from './_components/SocialPart'
import LandingHighlights from './_components/LandingHighlights'

export default function LandingSlider () {
  return (
    <section className='relative w-full flex flex-col items-center mt-0 md:mt-10 min-h-[500px] md:min-h-[60vh]'>
      <div className='relative w-full z-10 px-0 flex-grow flex flex-col justify-center'>
        <section className='h-auto md:h-full flex items-center justify-center w-full py-12 md:py-0 pb-8'>
          <SliderItem />
        </section>
      </div>

      <div className='hidden lg:block'>
        <SocialPart />
      </div>

      <div className='w-full flex justify-center px-4 md:px-0 mt-4 md:mt-0 relative z-20'>
        <LandingHighlights />
      </div>
    </section>
  )
}
