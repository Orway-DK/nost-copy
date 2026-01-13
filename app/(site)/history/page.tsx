// app/(site)/history/page.tsx
import Image from 'next/image'
import {
  FaPrint,
  FaLaptopCode,
  FaHandshake,
  FaRocket,
  FaMedal
} from 'react-icons/fa'

// --- ZAMAN ÇİZELGESİ VERİSİ ---
const TIMELINE = [
  {
    year: '2015',
    title: 'Temellerin Atılması',
    description:
      'Matbaa ve baskı sektörüne ilk adımımızı attık. Klasik ofset baskı teknikleri, renk yönetimi ve kağıt türleri konusundaki uzmanlığımızın temelleri bu yıllarda atıldı.',
    image:
      'https://fdhmxyqxkezkfmcjaanz.supabase.co/storage/v1/object/public/history/CMYK%20color%20chart.avif',
    icon: <FaPrint size={20} />
  },
  {
    year: '2018',
    title: 'Teknoloji ve Dijitalleşme',
    description:
      'Geleneksel baskı yöntemlerini modern dijital çözümlerle birleştirmeye başladık. Grafik tasarım ve baskı öncesi hazırlık süreçlerinde en son teknolojileri bünyemize kattık.',
    image:
      'https://fdhmxyqxkezkfmcjaanz.supabase.co/storage/v1/object/public/history/Graphic%20designer%20workspace.avif',
    icon: <FaLaptopCode size={20} />
  },
  {
    year: '2021',
    title: 'Hizmet Ağının Genişlemesi',
    description:
      'Sadece kağıt baskı değil; etiket, ambalaj, kurumsal kimlik ve promosyon ürünleri gibi geniş bir yelpazede hizmet vermeye başladık.',
    image:
      'https://fdhmxyqxkezkfmcjaanz.supabase.co/storage/v1/object/public/history/Cardboard%20boxes%20stack.avif',
    icon: <FaHandshake size={20} />
  },
  {
    year: '2024 - Günümüz',
    title: 'Nost Copy & E-Ticaret Dönemi',
    description:
      'Edindiğimiz tecrübeyi "Nost Copy" markası altında dijital dünyaya taşıdık. Artık kullanıcı dostu web sitemiz üzerinden tüm Türkiye\'ye hizmet veriyoruz.',
    image:
      'https://fdhmxyqxkezkfmcjaanz.supabase.co/storage/v1/object/public/history/Modern%20clean%20office.avif',
    icon: <FaRocket size={20} />
  }
]

// --- İSTATİSTİK VERİSİ ---
const STATS = [
  { value: '10+', label: 'Yıllık Tecrübe', icon: <FaMedal /> },
  { value: '5K+', label: 'Tamamlanan Proje', icon: <FaPrint /> },
  { value: '%100', label: 'Müşteri Memnuniyeti', icon: <FaHandshake /> }
]

export default function HistoryPage () {
  return (
    // DEĞİŞİKLİK 1: bg-background yerine bg-transparent
    <div className='min-h-screen bg-transparent py-10'>
      {/* 1. HERO SECTION */}
      {/* bg-black yerine bg-transparent, yüksekliği koruduk */}
      <div className='relative w-full h-[40vh] flex items-center justify-center overflow-hidden rounded-3xl mx-auto max-w-[95%] shadow-2xl border border-white/10'>
        {/* Görsel Katmanı */}
        <div className='absolute inset-0'>
          <Image
            src='https://fdhmxyqxkezkfmcjaanz.supabase.co/storage/v1/object/public/history/Offset%20printing%20machine.avif'
            alt='Printing History'
            fill
            className='object-cover'
            priority
          />
          {/* Görselin üzerine hafif siyah perde (yazı okunsun diye) */}
          <div className='absolute inset-0 bg-black/50 mix-blend-multiply'></div>
        </div>

        <div className='relative z-10 text-center px-4'>
          <span className='block text-primary font-bold tracking-[0.2em] mb-2 uppercase text-sm md:text-base animate-in fade-in slide-in-from-bottom-4 duration-700'>
            Yolculuğumuz
          </span>
          <h1 className='text-4xl md:text-6xl font-black text-white mb-4 tracking-tight drop-shadow-xl animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100'>
            Geçmişten Geleceğe
          </h1>
          <p className='text-white/90 max-w-xl mx-auto text-lg md:text-xl font-light leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200'>
            2015'ten beri mürekkebin kağıtla buluştuğu her noktada kalite ve
            güvenin adresi olmaya devam ediyoruz.
          </p>
        </div>
      </div>

      {/* 2. ZAMAN ÇİZELGESİ (TIMELINE) */}
      <div className='container mx-auto px-4 py-16 md:py-24 max-w-6xl relative'>
        {/* Çizgi Rengi Yumuşatıldı */}
        <div className='absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-white/10 transform md:-translate-x-1/2 hidden md:block' />
        <div className='absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-white/10 md:hidden' />

        <div className='space-y-12 md:space-y-24'>
          {TIMELINE.map((item, index) => {
            const isEven = index % 2 === 0
            return (
              <div
                key={index}
                className={`relative flex flex-col md:flex-row items-center ${
                  isEven ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* İkon: Kenarlık (ring) rengi yumuşatıldı */}
                <div className='absolute left-8 md:left-1/2 transform -translate-x-1/2 z-10 flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white shadow-lg border-4 border-gray-100 dark:border-[#212529] ring-4 ring-primary/20'>
                  {item.icon}
                </div>

                <div className='w-full md:w-1/2 pl-20 md:pl-0 md:px-12 mb-8 md:mb-0'>
                  {/* DEĞİŞİKLİK 2: KART TASARIMI (Glassmorphism) */}
                  <div
                    className={`
                      p-6 md:p-8 rounded-2xl 
                      bg-white/60 dark:bg-[#212529]/40 backdrop-blur-md 
                      border border-black/5 dark:border-white/5 shadow-sm 
                      hover:shadow-xl hover:border-primary/30 transition-all duration-300 group
                      ${isEven ? 'md:text-right' : 'md:text-left'}
                    `}
                  >
                    <span className='block text-4xl font-black text-black/10 dark:text-white/10 mb-2 group-hover:text-primary transition-colors duration-300'>
                      {item.year}
                    </span>
                    <h3 className='text-2xl font-bold text-foreground mb-3'>
                      {item.title}
                    </h3>
                    <p className='text-gray-600 dark:text-gray-300 leading-relaxed'>
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className='w-full md:w-1/2 pl-20 md:pl-0 md:px-12'>
                  <div className='relative aspect-video rounded-2xl overflow-hidden shadow-lg border border-black/5 dark:border-white/5 group'>
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className='object-cover transition-transform duration-700 group-hover:scale-110'
                    />
                    <div className='absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300' />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 3. İSTATİSTİKLER */}
      {/* DEĞİŞİKLİK 3: Arkaplan kaldırıldı */}
      <div className='border-t border-black/5 dark:border-white/5 bg-transparent'>
        <div className='container mx-auto px-4 py-16'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 text-center'>
            {STATS.map((stat, i) => (
              // İsteğe bağlı: İstatistik kutularına da hafif bir glass effect eklenebilir
              <div
                key={i}
                className='p-6 rounded-2xl bg-white/30 dark:bg-white/5 backdrop-blur-sm border border-transparent hover:border-primary/20 transition-all'
              >
                <div className='text-primary text-4xl md:text-5xl flex justify-center mb-4 opacity-90'>
                  {stat.icon}
                </div>
                <div className='text-5xl font-black text-gray-900 dark:text-white mb-2 tracking-tight'>
                  {stat.value}
                </div>
                <div className='text-gray-600 dark:text-gray-400 uppercase tracking-widest font-medium text-sm'>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
