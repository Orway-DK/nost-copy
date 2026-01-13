// app/(site)/personnel-policy/page.tsx
import Image from 'next/image'
import Link from 'next/link'
import {
  FaUserTie,
  FaHandsHelping,
  FaChalkboardTeacher,
  FaBalanceScale,
  FaHeartbeat,
  FaSearch,
  FaFileContract,
  FaUserCheck
} from 'react-icons/fa'

export default function PersonnelPolicyPage () {
  return (
    // DEĞİŞİKLİK 1: bg-background yerine bg-transparent
    <div className='min-h-screen bg-transparent py-10'>
      {/* 1. HERO SECTION */}
      {/* Container yapısı HistoryPage ile aynı standarda getirildi (Rounded, Shadow, Border) */}
      <div className='relative w-full h-[40vh] md:h-[50vh] flex items-center justify-center overflow-hidden rounded-3xl mx-auto max-w-[95%] shadow-2xl border border-white/10'>
        {/* Arkaplan Resmi */}
        <div className='absolute inset-0'>
          <Image
            src='https://fdhmxyqxkezkfmcjaanz.supabase.co/storage/v1/object/public/personnel-policy/personnel-policy.webp'
            alt='Human Resources'
            fill
            className='object-cover'
            priority
          />
          {/* Görsel üzerine hafif karartma (yazı okunabilirliği için) */}
          <div className='absolute inset-0 bg-black/50 mix-blend-multiply'></div>
        </div>

        <div className='relative z-10 text-center px-4 max-w-4xl'>
          <span className='block text-primary font-bold tracking-[0.2em] mb-3 uppercase text-sm md:text-base animate-in fade-in slide-in-from-bottom-4 duration-700'>
            İnsan Kaynakları
          </span>
          <h1 className='text-4xl md:text-6xl font-black text-white mb-6 tracking-tight drop-shadow-xl animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100'>
            En Değerli Sermayemiz: <br /> Çalışanlarımız
          </h1>
          <p className='text-white/90 text-lg md:text-xl font-light leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200'>
            Nost Copy olarak başarımızın arkasındaki asıl gücün, mutlu ve
            kendini geliştiren bir ekip olduğuna inanıyoruz.
          </p>
        </div>
      </div>

      {/* 2. MİSYON VE VİZYON (Giriş Metni) */}
      <div className='container mx-auto px-4 py-16 md:py-24 max-w-5xl'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-12 items-center'>
          <div>
            <h2 className='text-3xl font-bold mb-6 text-foreground'>
              Önce İnsan, Sonra İş.
            </h2>
            <div className='w-20 h-1.5 bg-primary mb-6 rounded-full'></div>
            <p className='text-muted-foreground leading-relaxed mb-4'>
              Personel politikamızın temelinde "insana saygı" yatar.
              Çalışanlarımızın yeteneklerini keşfetmelerine olanak sağlayan,
              fikirlerin özgürce paylaşıldığı ve sürekli gelişimin desteklendiği
              bir çalışma ortamı yaratmayı hedefleriz.
            </p>
            <p className='text-muted-foreground leading-relaxed'>
              Adil, şeffaf ve katılımcı bir yönetim anlayışıyla,
              çalışanlarımızın hem bireysel hem de profesyonel hedeflerine
              ulaşmalarında yanlarında oluruz.
            </p>
          </div>

          {/* Dekoratif İkonlar / Görsel Alanı */}
          <div className='grid grid-cols-2 gap-4'>
            {/* DEĞİŞİKLİK 2: İkon Kutuları Glassmorphism */}
            <div className='bg-white/60 dark:bg-[#212529]/40 backdrop-blur-md p-6 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-white/80 dark:hover:bg-[#212529]/60 transition-colors border border-black/5 dark:border-white/5 aspect-square shadow-sm'>
              <FaUserTie className='text-4xl text-primary mb-3' />
              <span className='font-bold text-foreground'>Profesyonellik</span>
            </div>
            <div className='bg-white/60 dark:bg-[#212529]/40 backdrop-blur-md p-6 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-white/80 dark:hover:bg-[#212529]/60 transition-colors border border-black/5 dark:border-white/5 aspect-square mt-8 shadow-sm'>
              <FaHandsHelping className='text-4xl text-primary mb-3' />
              <span className='font-bold text-foreground'>Takım Ruhu</span>
            </div>
            <div className='bg-white/60 dark:bg-[#212529]/40 backdrop-blur-md p-6 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-white/80 dark:hover:bg-[#212529]/60 transition-colors border border-black/5 dark:border-white/5 aspect-square -mt-8 shadow-sm'>
              <FaChalkboardTeacher className='text-4xl text-primary mb-3' />
              <span className='font-bold text-foreground'>Gelişim</span>
            </div>
            <div className='bg-white/60 dark:bg-[#212529]/40 backdrop-blur-md p-6 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-white/80 dark:hover:bg-[#212529]/60 transition-colors border border-black/5 dark:border-white/5 aspect-square shadow-sm'>
              <FaBalanceScale className='text-4xl text-primary mb-3' />
              <span className='font-bold text-foreground'>Adalet</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TEMEL İLKELERİMİZ (Kartlar) */}
      {/* DEĞİŞİKLİK 3: Section bg-muted/20 kaldırıldı */}
      <div className='py-16 md:py-24 border-y border-black/5 dark:border-white/5 bg-transparent'>
        <div className='container mx-auto px-4 max-w-6xl'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-black mb-4'>
              Temel İlkelerimiz
            </h2>
            <p className='text-muted-foreground max-w-2xl mx-auto'>
              Çalışma kültürümüzü oluşturan ve bizi bir arada tutan vazgeçilmez
              değerlerimiz.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {/* İlke 1 */}
            {/* DEĞİŞİKLİK 4: Kart Arkaplanları Glassmorphism */}
            <div className='bg-white/60 dark:bg-[#212529]/40 backdrop-blur-md p-8 rounded-2xl shadow-sm border border-black/5 dark:border-white/5 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-300'>
              <div className='w-14 h-14 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-xl flex items-center justify-center mb-6'>
                <FaBalanceScale size={28} />
              </div>
              <h3 className='text-xl font-bold mb-3 text-foreground'>
                Adil Yönetim & Fırsat Eşitliği
              </h3>
              <p className='text-muted-foreground text-sm leading-relaxed'>
                İşe alımdan terfi süreçlerine kadar tüm değerlendirmelerde dil,
                din, ırk ve cinsiyet ayrımı gözetmeksizin sadece yetkinlik ve
                performansı esas alırız.
              </p>
            </div>

            {/* İlke 2 */}
            <div className='bg-white/60 dark:bg-[#212529]/40 backdrop-blur-md p-8 rounded-2xl shadow-sm border border-black/5 dark:border-white/5 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-300'>
              <div className='w-14 h-14 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-xl flex items-center justify-center mb-6'>
                <FaChalkboardTeacher size={28} />
              </div>
              <h3 className='text-xl font-bold mb-3 text-foreground'>
                Sürekli Eğitim & Gelişim
              </h3>
              <p className='text-muted-foreground text-sm leading-relaxed'>
                Teknolojinin hızla değiştiği matbaa sektöründe geri kalmamak
                için çalışanlarımızın mesleki ve kişisel gelişimlerini
                eğitimlerle destekleriz.
              </p>
            </div>

            {/* İlke 3 */}
            <div className='bg-white/60 dark:bg-[#212529]/40 backdrop-blur-md p-8 rounded-2xl shadow-sm border border-black/5 dark:border-white/5 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-300'>
              <div className='w-14 h-14 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-xl flex items-center justify-center mb-6'>
                <FaHeartbeat size={28} />
              </div>
              <h3 className='text-xl font-bold mb-3 text-foreground'>
                İş Sağlığı ve Güvenliği
              </h3>
              <p className='text-muted-foreground text-sm leading-relaxed'>
                Güvenli bir çalışma ortamı en öncelikli konumuzdur. Yasal
                mevzuatlara tam uyum sağlar, riskleri minimize etmek için
                proaktif önlemler alırız.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. İŞE ALIM SÜRECİ (Adımlar) */}
      <div className='container mx-auto px-4 py-16 md:py-24 max-w-5xl'>
        <div className='flex flex-col md:flex-row items-start gap-12'>
          <div className='md:w-1/3 sticky top-24'>
            <h2 className='text-3xl font-bold mb-4 text-foreground'>
              Bize Katılın
            </h2>
            <p className='text-muted-foreground mb-8'>
              Nost Copy ailesinin bir parçası olmak için izlediğimiz işe alım
              süreci şeffaf ve standarttır.
            </p>
            <Link
              href='/contact'
              className='inline-flex items-center justify-center px-8 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition shadow-lg shadow-primary/25'
            >
              Başvuru Yap / İletişim
            </Link>
          </div>

          <div className='md:w-2/3 space-y-8'>
            {/* Adım 1 */}
            <div className='flex gap-6 group'>
              {/* DEĞİŞİKLİK 5: Adım Numarası Arkaplanı */}
              <div className='flex-shrink-0 w-12 h-12 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center font-bold text-muted-foreground group-hover:bg-primary group-hover:text-white transition-colors border border-transparent group-hover:border-primary'>
                1
              </div>
              <div>
                <h3 className='text-lg font-bold flex items-center gap-2 mb-2 text-foreground'>
                  <FaSearch className='text-primary' /> Başvuru ve Değerlendirme
                </h3>
                <p className='text-muted-foreground text-sm'>
                  Kariyer portalları veya web sitemiz üzerinden gelen
                  başvurular, pozisyonun gerekliliklerine göre titizlikle
                  incelenir.
                </p>
              </div>
            </div>

            {/* Bağlantı Çizgisi */}
            <div className='w-0.5 h-8 bg-black/10 dark:bg-white/10 ml-6 -my-4'></div>

            {/* Adım 2 */}
            <div className='flex gap-6 group'>
              <div className='flex-shrink-0 w-12 h-12 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center font-bold text-muted-foreground group-hover:bg-primary group-hover:text-white transition-colors border border-transparent group-hover:border-primary'>
                2
              </div>
              <div>
                <h3 className='text-lg font-bold flex items-center gap-2 mb-2 text-foreground'>
                  <FaUserCheck className='text-primary' /> Mülakat Süreci
                </h3>
                <p className='text-muted-foreground text-sm'>
                  Uygun görülen adaylar, İnsan Kaynakları ve ilgili departman
                  yöneticisi ile teknik ve yetkinlik bazlı mülakata davet
                  edilir.
                </p>
              </div>
            </div>

            {/* Bağlantı Çizgisi */}
            <div className='w-0.5 h-8 bg-black/10 dark:bg-white/10 ml-6 -my-4'></div>

            {/* Adım 3 */}
            <div className='flex gap-6 group'>
              <div className='flex-shrink-0 w-12 h-12 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center font-bold text-muted-foreground group-hover:bg-primary group-hover:text-white transition-colors border border-transparent group-hover:border-primary'>
                3
              </div>
              <div>
                <h3 className='text-lg font-bold flex items-center gap-2 mb-2 text-foreground'>
                  <FaFileContract className='text-primary' /> Teklif ve
                  Oryantasyon
                </h3>
                <p className='text-muted-foreground text-sm'>
                  Süreci olumlu tamamlanan adaya iş teklifi yapılır. Aramıza
                  katılan yeni arkadaşımız için kapsamlı bir oryantasyon
                  programı başlatılır.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
