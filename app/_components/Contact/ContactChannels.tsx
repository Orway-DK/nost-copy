'use client'

import React from 'react'
import {
  FaWhatsapp,
  FaTelegramPlane,
  FaPhoneAlt,
  FaEnvelope,
  FaCommentDots // Yeni ikon
} from 'react-icons/fa'
import { useLanguage } from '@/components/LanguageProvider'

const UI_TEXT = {
  tr: {
    card_wp: 'WhatsApp',
    card_wp_desc: 'Hızlı mesajlaşma için tıklayın',
    card_tg: 'Telegram',
    card_tg_desc: 'Kanalımıza katılın veya yazın',
    card_phone: 'Telefon',
    card_phone_desc: 'Hafta içi 09:00 - 18:00',
    card_mail: 'E-Posta',
    card_mail_desc: 'Teklif ve önerileriniz için',
    card_form: 'Bize Yazın',
    card_form_desc: 'Formu doldurun, biz dönelim'
  },
  en: {
    card_wp: 'WhatsApp',
    card_wp_desc: 'Click for instant messaging',
    card_tg: 'Telegram',
    card_tg_desc: 'Join channel or chat',
    card_phone: 'Phone',
    card_phone_desc: 'Weekdays 09:00 - 18:00',
    card_mail: 'Email',
    card_mail_desc: 'For offers and suggestions',
    card_form: 'Write to Us',
    card_form_desc: 'Fill the form, we will reply'
  },
  de: {
    card_wp: 'WhatsApp',
    card_wp_desc: 'Klicken für Sofortnachrichten',
    card_tg: 'Telegram',
    card_tg_desc: 'Kanal beitreten oder chatten',
    card_phone: 'Telefon',
    card_phone_desc: 'Werktags 09:00 - 18:00',
    card_mail: 'E-Mail',
    card_mail_desc: 'Für Angebote und Vorschläge',
    card_form: 'Schreiben Sie uns',
    card_form_desc: 'Formular ausfüllen'
  }
}

// Props: Modal açma fonksiyonunu alıyoruz
export default function ContactChannels ({
  onOpenForm
}: {
  onOpenForm: () => void
}) {
  const { lang } = useLanguage()
  const t = UI_TEXT[lang as keyof typeof UI_TEXT] || UI_TEXT.tr
  return (
    <div className='w-full flex flex-col justify-center px-4 md:px-6 py-4 animate-in fade-in zoom-in duration-500'>
      {/* Grid: Mobilde 1, Tablette 2, Laptopta 3, Geniş Ekranda 5 kolon */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 lg:gap-6 justify-center items-center'>
        {/* 1. WhatsApp */}
        <a
          href='https://wa.me/905551234567'
          target='_blank'
          rel='noopener noreferrer'
          className='group relative flex flex-col items-center justify-center min-h-[260px] p-6 rounded-3xl bg-card border border-border/50 transition-all duration-500 ease-out hover:-translate-y-2 hover:border-green-500/50 hover:shadow-[0_10px_40px_-10px_rgba(34,197,94,0.3)]'
        >
          <div className='w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-4 text-4xl text-green-600 dark:text-green-400 transition-transform duration-500 group-hover:scale-110 group-hover:bg-green-500/20 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]'>
            <FaWhatsapp />
          </div>
          <h3 className='text-xl font-bold text-foreground mb-1 group-hover:text-green-600 transition-colors'>
            {t.card_wp}
          </h3>
          <p className='text-muted-foreground text-center text-xs font-medium leading-relaxed'>
            {t.card_wp_desc}
          </p>
        </a>

        {/* 2. Telegram */}
        <a
          href='https://t.me/nostcopy'
          target='_blank'
          rel='noopener noreferrer'
          className='group relative flex flex-col items-center justify-center min-h-[260px] p-6 rounded-3xl bg-card border border-border/50 transition-all duration-500 ease-out hover:-translate-y-2 hover:border-blue-500/50 hover:shadow-[0_10px_40px_-10px_rgba(59,130,246,0.3)]'
        >
          <div className='w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 text-4xl text-blue-600 dark:text-blue-400 transition-transform duration-500 group-hover:scale-110 group-hover:bg-blue-500/20 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]'>
            <FaTelegramPlane className='mr-1' />
          </div>
          <h3 className='text-xl font-bold text-foreground mb-1 group-hover:text-blue-600 transition-colors'>
            {t.card_tg}
          </h3>
          <p className='text-muted-foreground text-center text-xs font-medium leading-relaxed'>
            {t.card_tg_desc}
          </p>
        </a>

        {/* 3. Phone */}
        <a
          href='tel:+902121234567'
          className='group relative flex flex-col items-center justify-center min-h-[260px] p-6 rounded-3xl bg-card border border-border/50 transition-all duration-500 ease-out hover:-translate-y-2 hover:border-primary/50 hover:shadow-[0_10px_40px_-10px_rgba(37,99,235,0.3)]'
        >
          <div className='w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-4xl text-primary transition-transform duration-500 group-hover:scale-110 group-hover:bg-primary/20 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]'>
            <FaPhoneAlt />
          </div>
          <h3 className='text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors'>
            {t.card_phone}
          </h3>
          <p className='text-muted-foreground text-center text-xs font-medium leading-relaxed'>
            {t.card_phone_desc}
          </p>
        </a>

        {/* 4. Mail */}
        <a
          href='mailto:info@nostcopy.com'
          className='group relative flex flex-col items-center justify-center min-h-[260px] p-6 rounded-3xl bg-card border border-border/50 transition-all duration-500 ease-out hover:-translate-y-2 hover:border-purple-500/50 hover:shadow-[0_10px_40px_-10px_rgba(168,85,247,0.3)]'
        >
          <div className='w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 text-4xl text-purple-600 dark:text-purple-400 transition-transform duration-500 group-hover:scale-110 group-hover:bg-purple-500/20 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]'>
            <FaEnvelope />
          </div>
          <h3 className='text-xl font-bold text-foreground mb-1 group-hover:text-purple-600 transition-colors'>
            {t.card_mail}
          </h3>
          <p className='text-muted-foreground text-center text-xs font-medium leading-relaxed'>
            {t.card_mail_desc}
          </p>
        </a>

        {/* 5. FORM MODAL BUTONU (YENİ) */}
        <button
          onClick={onOpenForm}
          className='group relative flex flex-col items-center justify-center min-h-[260px] p-6 rounded-3xl bg-card border border-border/50 transition-all duration-500 ease-out hover:-translate-y-2 hover:border-orange-500/50 hover:shadow-[0_10px_40px_-10px_rgba(249,115,22,0.3)]'
        >
          {/* Turuncu Glow */}
          <div className='w-20 h-20 rounded-full bg-orange-500/10 flex items-center justify-center mb-4 text-4xl text-orange-600 dark:text-orange-400 transition-transform duration-500 group-hover:scale-110 group-hover:bg-orange-500/20 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.4)]'>
            <FaCommentDots />
          </div>
          <h3 className='text-xl font-bold text-foreground mb-1 group-hover:text-orange-600 transition-colors'>
            {t.card_form}
          </h3>
          <p className='text-muted-foreground text-center text-xs font-medium leading-relaxed'>
            {t.card_form_desc}
          </p>
        </button>
      </div>
    </div>
  )
}
