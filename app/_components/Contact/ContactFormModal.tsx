'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useLanguage } from '@/components/LanguageProvider'
import { FaPaperPlane, FaTimes } from 'react-icons/fa'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const FALLBACK_DEFAULTS: Record<string, any> = {
  tr: {
    heading: 'Mesaj Gönderin',
    sub: 'Sorularınız veya projeleriniz için aşağıdaki formu doldurabilirsiniz.',
    label_name: 'Adınız Soyadınız',
    ph_name: 'Örn: Ahmet Yılmaz',
    label_email: 'E-posta Adresi',
    ph_email: 'ornek@mail.com',
    label_phone: 'Telefon (Opsiyonel)',
    ph_phone: '+90 555...',
    label_msg: 'Mesajınız',
    ph_msg: 'Size nasıl yardımcı olabiliriz?',
    btn: 'Mesajı Gönder',
    btn_sending: 'Gönderiliyor...',
    success: 'Mesajınız başarıyla bize ulaştı.',
    error: 'Bir hata oluştu.'
  }
}

type TranslationRow = {
  key_name: string
  text_tr: string
  text_en: string
  text_de: string
}

// Modal Props
type Props = {
  isOpen: boolean
  onClose: () => void
}

export default function ContactFormModal ({ isOpen, onClose }: Props) {
  const { lang } = useLanguage()
  const [dbTranslations, setDbTranslations] = useState<TranslationRow[]>([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    async function fetchTranslations () {
      const { data, error } = await supabase
        .from('ui_translations')
        .select('*')
        .eq('section', 'contact_form')

      if (data && !error) {
        setDbTranslations(data)
      }
    }
    fetchTranslations()
  }, [])

  const t = useMemo(() => {
    const currentTexts = { ...FALLBACK_DEFAULTS.tr }
    if (dbTranslations.length > 0) {
      dbTranslations.forEach(row => {
        const langKey = `text_${lang}` as keyof TranslationRow
        const value = row[langKey] || row.text_tr
        if (value) currentTexts[row.key_name] = value
      })
    }
    return currentTexts
  }, [dbTranslations, lang])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStatus('success')
      setTimeout(() => {
        setStatus('idle')
        onClose() // Başarılı olunca kapat
      }, 2000)
    }, 1500)
  }

  // Modal Kapalıysa Render Etme
  if (!isOpen) return null

  return (
    // Overlay (Arkaplan)
    <div
      className='fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300'
      onClick={onClose} // Dışarı tıklayınca kapat
    >
      {/* Modal Content */}
      <div
        className='w-full max-w-4xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative animate-in zoom-in-95 duration-300'
        onClick={e => e.stopPropagation()} // İçeri tıklayınca kapanmasın
      >
        {/* Kapatma Butonu */}
        <button
          onClick={onClose}
          className='absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 hover:bg-destructive hover:text-white transition-colors text-foreground'
        >
          <FaTimes />
        </button>

        {/* Sol Taraf: Bilgi */}
        <div className='w-full md:w-5/12 bg-muted/30 p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-border'>
          <div className='mb-6'>
            <span className='inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-6'>
              <FaPaperPlane className='text-xl' />
            </span>
            <h2 className='text-2xl font-bold tracking-tight text-foreground mb-3'>
              {t.heading}
            </h2>
            <p className='text-muted-foreground text-sm leading-relaxed'>
              {t.sub}
            </p>
          </div>
        </div>

        {/* Sağ Taraf: Form */}
        <div className='w-full md:w-7/12 p-8 bg-card'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-1'>
              <label className='text-xs font-semibold text-muted-foreground uppercase ml-1'>
                {t.label_name}
              </label>
              <input
                type='text'
                required
                placeholder={t.ph_name}
                className='w-full h-10 px-4 rounded-lg bg-background border border-border text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm'
              />
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='space-y-1'>
                <label className='text-xs font-semibold text-muted-foreground uppercase ml-1'>
                  {t.label_email}
                </label>
                <input
                  type='email'
                  required
                  placeholder={t.ph_email}
                  className='w-full h-10 px-4 rounded-lg bg-background border border-border text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm'
                />
              </div>
              <div className='space-y-1'>
                <label className='text-xs font-semibold text-muted-foreground uppercase ml-1'>
                  {t.label_phone}
                </label>
                <input
                  type='tel'
                  placeholder={t.ph_phone}
                  className='w-full h-10 px-4 rounded-lg bg-background border border-border text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm'
                />
              </div>
            </div>

            <div className='space-y-1'>
              <label className='text-xs font-semibold text-muted-foreground uppercase ml-1'>
                {t.label_msg}
              </label>
              <textarea
                rows={3}
                required
                placeholder={t.ph_msg}
                className='w-full p-4 rounded-lg bg-background border border-border text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm resize-none'
              ></textarea>
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full h-12 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded-lg transition-all shadow-md disabled:opacity-70 flex items-center justify-center gap-2 text-sm mt-2'
            >
              {loading ? t.btn_sending : t.btn}
            </button>

            {status === 'success' && (
              <div className='text-center text-xs text-green-600 font-medium'>
                {t.success}
              </div>
            )}
            {status === 'error' && (
              <div className='text-center text-xs text-red-600 font-medium'>
                {t.error}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
