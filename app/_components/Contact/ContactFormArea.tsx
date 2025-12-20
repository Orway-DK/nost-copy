// C:\Projeler\nost-copy\app\_components\Contact\ContactFormArea.tsx
'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useLanguage } from '@/components/LanguageProvider'
import { FaPaperPlane } from 'react-icons/fa'

// Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// --- YEDEK METİNLER ---
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

export default function ContactFormArea () {
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
    // Simülasyon
    setTimeout(() => {
      setLoading(false)
      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)
    }, 1500)
  }

  return (
    <section className='py-16 md:py-24 bg-background text-foreground relative z-10'>
      {/* Arkaplan için hafif bir dekoratif gradient (Opsiyonel) */}
      <div className='absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-full bg-primary/5 blur-[120px] pointer-events-none rounded-full' />

      <div className='w-full max-w-4xl mx-auto px-4 sm:px-6 relative'>
        {/* Form Kartı */}
        <div className='bg-card border border-border/60 rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row'>
          {/* Sol Taraf: Estetik Başlık Alanı (Mobilde Üstte) */}
          <div className='w-full md:w-5/12 bg-muted/30 p-8 md:p-12 flex flex-col justify-center border-b md:border-b-0 md:border-r border-border/60'>
            <div className='mb-6'>
              <span className='inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-6'>
                <FaPaperPlane className='text-xl' />
              </span>
              <h2 className='text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-3'>
                {t.heading}
              </h2>
              <p className='text-muted-foreground text-sm md:text-base leading-relaxed'>
                {t.sub}
              </p>
            </div>

            {/* Dekoratif Çizgiler veya Ek Bilgi */}
            <div className='mt-auto hidden md:block'>
              <div className='h-1 w-12 bg-primary rounded-full opacity-20 mb-2'></div>
              <div className='h-1 w-8 bg-primary rounded-full opacity-20'></div>
            </div>
          </div>

          {/* Sağ Taraf: Form Alanı */}
          <div className='w-full md:w-7/12 p-8 md:p-12 bg-card'>
            <form onSubmit={handleSubmit} className='space-y-5'>
              {/* İsim */}
              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1'>
                  {t.label_name}
                </label>
                <input
                  type='text'
                  required
                  placeholder={t.ph_name}
                  className='w-full h-12 px-4 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm'
                />
              </div>

              {/* Email & Telefon (Yan Yana) */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1'>
                    {t.label_email}
                  </label>
                  <input
                    type='email'
                    required
                    placeholder={t.ph_email}
                    className='w-full h-12 px-4 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm'
                  />
                </div>
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1'>
                    {t.label_phone}
                  </label>
                  <input
                    type='tel'
                    placeholder={t.ph_phone}
                    className='w-full h-12 px-4 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm'
                  />
                </div>
              </div>

              {/* Mesaj */}
              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1'>
                  {t.label_msg}
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder={t.ph_msg}
                  className='w-full p-4 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm resize-none'
                ></textarea>
              </div>

              {/* Buton ve Mesajlar */}
              <div className='pt-2'>
                <button
                  type='submit'
                  disabled={loading}
                  className='w-full h-12 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm'
                >
                  {loading ? (
                    <>
                      <svg
                        className='animate-spin h-4 w-4 text-current'
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                      >
                        <circle
                          className='opacity-25'
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'
                        ></circle>
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        ></path>
                      </svg>
                      {t.btn_sending}
                    </>
                  ) : (
                    <>
                      {t.btn}
                      <FaPaperPlane className='text-xs' />
                    </>
                  )}
                </button>
              </div>

              {/* Durum Bildirimleri (Minimal) */}
              {status === 'success' && (
                <div className='p-3 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg text-center text-sm font-medium border border-green-500/20'>
                  {t.success}
                </div>
              )}
              {status === 'error' && (
                <div className='p-3 bg-destructive/10 text-destructive rounded-lg text-center text-sm font-medium border border-destructive/20'>
                  {t.error}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
