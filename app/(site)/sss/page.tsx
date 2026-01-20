'use client'

import React, { useState } from 'react'
import {
  HiOutlineChevronDown,
  HiOutlinePrinter,
  HiOutlineTruck,
  HiOutlineCreditCard,
  HiOutlineClock,
  HiOutlineDocumentText
} from 'react-icons/hi'

const faqData = [
  {
    question: 'Siparişimi ne kadar sürede teslim alabilirim?',
    answer:
      'Standart baskı işleriniz genellikle 24 saat içinde hazırlanır. İstanbul içi kurye ile aynı gün, şehir dışı siparişler ise anlaşmalı kargolarımızla 1-3 iş günü içerisinde adresinize teslim edilir.',
    icon: <HiOutlineTruck size={24} />
  },
  {
    question: 'Hangi dosya formatlarında gönderim yapmalıyım?',
    answer:
      'En kaliteli baskı sonucu için PDF, AI, PSD veya yüksek çözünürlüklü (300 DPI) JPEG/PNG formatlarını tercih ediyoruz. Baskı öncesi ekiplerimiz dosyalarınızı ücretsiz olarak kontrol etmektedir.',
    icon: <HiOutlineDocumentText size={24} />
  },
  {
    question: 'Toplu siparişlerde indirim uygulanıyor mu?',
    answer:
      'Evet, Nost Copy olarak yüksek adetli kurumsal siparişlerinizde özel fiyatlandırma yapıyoruz. Teklif almak için bizimle iletişime geçebilirsiniz.',
    icon: <HiOutlinePrinter size={24} />
  },
  {
    question: 'Ödeme seçenekleriniz nelerdir?',
    answer:
      'Kredi kartı, banka kartı ve EFT/Havale yöntemiyle ödeme yapabilirsiniz. Online ödemelerimizde 3D Secure güvenli ödeme altyapısı kullanılmaktadır.',
    icon: <HiOutlineCreditCard size={24} />
  },
  {
    question: 'Acil baskı hizmetiniz var mı?',
    answer:
      "Evet, 'Express Baskı' seçeneğimizle acil işlerinizi önceliklendiriyoruz. Detaylı bilgi için lütfen sipariş öncesi canlı destek veya telefon hattımızdan bize ulaşın.",
    icon: <HiOutlineClock size={24} />
  }
]

const FAQItem = ({ question, answer, icon, isOpen, onClick }: any) => {
  return (
    <div className='border-b border-[var(--border)] last:border-none'>
      <button
        onClick={onClick}
        className='flex w-full items-center justify-between py-6 text-left transition-all hover:bg-[var(--card-hover)]/50 px-6 rounded-xl group'
      >
        <div className='flex items-center gap-6'>
          <span className='text-[var(--info)] transition-transform group-hover:scale-110'>
            {icon}
          </span>
          <span className='text-xl font-semibold text-[var(--foreground)]'>
            {question}
          </span>
        </div>
        <HiOutlineChevronDown
          className={`transform transition-transform duration-300 text-[var(--muted-foreground)] ${
            isOpen ? 'rotate-180 text-[var(--primary)]' : ''
          }`}
          size={24}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className='pl-[72px] pr-6 pb-8'>
          <p className='text-lg text-[var(--muted-foreground)] leading-relaxed border-l-4 border-[var(--primary)]/30 pl-6'>
            {answer}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function FAQPage () {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className='w-full py-16 px-4 sm:px-8'>
      <div className='mx-auto max-w-7xl'>
        {/* Header Section */}
        <div className='mb-16'>
          <div className='inline-block px-4 py-1.5 mb-4 rounded-md bg-[var(--secondary)] border border-[var(--primary)]/10'>
            <span className='text-sm font-bold uppercase tracking-[0.2em] text-[var(--secondary-foreground)]'>
              Yardım Merkezi
            </span>
          </div>
          <h1 className='text-5xl font-black text-[var(--foreground)] sm:text-7xl tracking-tighter mb-6'>
            Sıkça Sorulan Sorular
          </h1>
          <p className='text-xl text-[var(--muted-foreground)] max-w-3xl'>
            Nost Copy baskı süreçleri, teslimat ve teknik detaylar hakkında
            merak ettiğiniz soruları aşağıda bulabilirsiniz.
          </p>
        </div>

        {/* FAQ List - No Background */}
        <div className='space-y-2'>
          {faqData.map((faq, index) => (
            <FAQItem
              key={index}
              {...faq}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>

        {/* CTA Section */}
        <div className='mt-20 flex flex-col md:flex-row items-center justify-between gap-8 p-10 rounded-3xl border-2 border-dashed border-[var(--border)] bg-transparent'>
          <div className='text-left'>
            <h3 className='text-2xl font-bold text-[var(--foreground)] mb-2'>
              Daha fazla yardıma mı ihtiyacınız var?
            </h3>
            <p className='text-[var(--muted-foreground)]'>
              Ekibimiz her türlü özel baskı talebiniz için hazır bekliyor.
            </p>
          </div>
          <button className='whitespace-nowrap rounded-full bg-[var(--primary)] px-10 py-4 font-bold text-[var(--primary-foreground)] transition-all hover:bg-[var(--primary-hover)] hover:shadow-xl active:scale-95'>
            Bize Ulaşın
          </button>
        </div>
      </div>
    </div>
  )
}
