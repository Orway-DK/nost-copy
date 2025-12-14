// C:\Projeler\nost-copy\app\_components\HeroBackground.tsx
import Image from 'next/image'

export default function HeroBackground () {
  return (
    // absolute top-0: Sayfanın en tepesine yapışır.
    // -z-10: İçeriğin arkasında kalır.
    // h-[100vh] veya h-[1200px]: Yeterince uzunluk veriyoruz ki görseller kesilmesin.
    // overflow-hidden: Sayfada scrollbar çıkmasını engeller ama görselleri geniş gösterir.
    <div className='absolute top-0 left-0 w-full h-[120vh] min-h-[800px] -z-10 overflow-hidden pointer-events-none'>
      {/* Sol Arka Plan */}
      <div className='absolute top-0 left-0 w-[200px] md:w-auto'>
        <Image
          src='/h1-bg01.svg'
          alt='bg'
          width={500}
          height={500}
          className='object-cover opacity-30 md:opacity-100 select-none'
          draggable={false}
          priority
        />
      </div>

      {/* Sağ Üst Büyük Desen */}
      <div className='absolute top-0 right-0 hidden md:block'>
        <Image
          src='/h1-slider1.svg'
          alt='bg'
          width={1000}
          height={1000}
          className='object-cover w-auto select-none'
          draggable={false}
          priority
        />
      </div>

      {/* Sağ Üst Küçük Desen */}
      <div className='absolute top-0 right-0 w-[150px] md:w-auto'>
        <Image
          src='/h1-slider2.svg'
          alt='bg'
          width={700}
          height={700}
          className='object-cover opacity-40 md:opacity-100 select-none'
          draggable={false}
          priority
        />
      </div>
    </div>
  )
}
