'use client'

import React, { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@supabase/supabase-js'
import { useLanguage } from '@/components/LanguageProvider'
import {
  FaWhatsapp,
  FaTelegramPlane,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkedAlt,
  FaArrowRight
} from 'react-icons/fa'

// Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Leaflet (SSR Kapalı)
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
)
const CircleMarker = dynamic(
  () => import('react-leaflet').then(mod => mod.CircleMarker),
  { ssr: false }
)
const Tooltip = dynamic(
  () => import('react-leaflet').then(mod => mod.Tooltip),
  { ssr: false }
)

// --- DİL SÖZLÜĞÜ ---
const TRANSLATIONS: Record<string, any> = {
  tr: {
    header: 'İletişim & Lokasyonlar',
    sub: 'Bize dilediğiniz kanaldan ulaşabilir veya ofislerimizi ziyaret edebilirsiniz.',
    btn_map_open: 'Haritayı Göster',
    btn_map_close: 'İletişim Kanallarına Dön',
    loading: 'Harita yükleniyor...',
    card_wp: 'WhatsApp',
    card_wp_desc: 'Hızlı mesajlaşma için tıklayın',
    card_tg: 'Telegram',
    card_tg_desc: 'Kanalımıza katılın veya yazın',
    card_phone: 'Telefon',
    card_phone_desc: 'Hafta içi 09:00 - 18:00',
    card_mail: 'E-Posta',
    card_mail_desc: 'Teklif ve önerileriniz için',
    map_btn: 'Haritada Git'
  },
  en: {
    header: 'Contact & Locations',
    sub: 'Reach us via any channel or visit our global offices.',
    btn_map_open: 'Show Map',
    btn_map_close: 'Back to Contact Channels',
    loading: 'Loading map...',
    card_wp: 'WhatsApp',
    card_wp_desc: 'Click for instant messaging',
    card_tg: 'Telegram',
    card_tg_desc: 'Join channel or chat',
    card_phone: 'Phone',
    card_phone_desc: 'Weekdays 09:00 - 18:00',
    card_mail: 'Email',
    card_mail_desc: 'For offers and suggestions',
    map_btn: 'Open Map'
  },
  de: {
    header: 'Kontakt & Standorte',
    sub: 'Erreichen Sie uns über jeden Kanal oder besuchen Sie unsere Büros.',
    btn_map_open: 'Karte Anzeigen',
    btn_map_close: 'Zurück zu Kontakten',
    loading: 'Karte wird geladen...',
    card_wp: 'WhatsApp',
    card_wp_desc: 'Klicken für Sofortnachrichten',
    card_tg: 'Telegram',
    card_tg_desc: 'Kanal beitreten oder chatten',
    card_phone: 'Telefon',
    card_phone_desc: 'Werktags 09:00 - 18:00',
    card_mail: 'E-Mail',
    card_mail_desc: 'Für Angebote und Vorschläge',
    map_btn: 'Karte Öffnen'
  }
}

type LocationData = {
  id: number
  title: string
  address: string
  phone: string
  email: string
  lat: number
  lng: number
  map_url?: string
  title_de?: string
  address_de?: string
  title_en?: string
  address_en?: string
}

export default function WorldMapLocations () {
  const { lang } = useLanguage()
  const [locations, setLocations] = useState<LocationData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeLoc, setActiveLoc] = useState<number | null>(null)
  const [showMap, setShowMap] = useState(false) // HARİTA TOGGLE STATE
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const t = TRANSLATIONS[lang] || TRANSLATIONS.tr

  useEffect(() => {
    async function fetchLocations () {
      const { data, error } = await supabase
        .from('contact_locations')
        .select('*')
      if (data && !error) setLocations(data)
      setLoading(false)
    }
    fetchLocations()
  }, [])

  // --- Harita Eventleri ---
  const handleMouseEnter = (id: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setActiveLoc(id)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveLoc(null)
    }, 2000)
  }

  const getLocalizedContent = (loc: LocationData) => {
    let title = loc.title
    let address = loc.address
    if (lang === 'de') {
      title = loc.title_de || loc.title
      address = loc.address_de || loc.address
    } else if (lang === 'en') {
      title = loc.title_en || loc.title
      address = loc.address_en || loc.address
    }
    return { title, address, email: loc.email, phone: loc.phone }
  }

  const mapStyle = {
    height: '100%',
    width: '100%',
    borderRadius: '0',
    zIndex: 0
  }

  return (
    <div className='w-full pt-24 pb-24 bg-background text-foreground relative'>
      {/* BAŞLIK & TOGGLE BUTONU */}
      <div className='w-full max-w-7xl lg:max-w-screen-xl 2xl:max-w-[1800px] mx-auto px-6 text-center mb-10'>
        <h2 className='text-3xl lg:text-4xl 2xl:text-6xl font-bold text-foreground'>
          {t.header}
        </h2>
        <p className='text-muted-foreground mt-2 2xl:mt-4 text-lg 2xl:text-2xl mb-8'>
          {t.sub}
        </p>

        {/* Harita Aç/Kapa Butonu */}
        <button
          onClick={() => setShowMap(!showMap)}
          className={`
                        inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-lg
                        ${
                          showMap
                            ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                            : 'bg-primary text-primary-foreground hover:bg-primary/90'
                        }
                    `}
        >
          {showMap ? (
            <FaArrowRight className='rotate-180' />
          ) : (
            <FaMapMarkedAlt />
          )}
          <span>{showMap ? t.btn_map_close : t.btn_map_open}</span>
        </button>
      </div>

      {/* ANA ALAN (Grid veya Harita) */}
      {/* Yüksekliği sabitledik (min-h) ki geçişlerde sayfa zıplamasın */}
      <div className='relative w-full max-w-7xl lg:max-w-screen-xl 2xl:max-w-[1800px] mx-auto min-h-[450px] md:min-h-[550px] 2xl:min-h-[800px] rounded-2xl overflow-hidden shadow-sm border border-border bg-card transition-all duration-500'>
        {/* 1. İLETİŞİM KANALLARI (HARİTA KAPALIYKEN) */}
        <div
          className={`absolute inset-0 z-10 bg-card p-6 md:p-12 transition-opacity duration-500 ${
            showMap
              ? 'opacity-0 pointer-events-none'
              : 'opacity-100 pointer-events-auto'
          }`}
        >
          <div className='h-full flex flex-col justify-center'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full'>
              {/* WhatsApp Card */}
              <a
                href='https://wa.me/905551234567'
                target='_blank'
                rel='noopener noreferrer'
                className='group flex flex-col items-center justify-center p-8 rounded-xl border border-border/50 bg-background hover:border-green-500/50 hover:bg-green-500/5 transition-all cursor-pointer'
              >
                <div className='w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-4 text-3xl group-hover:scale-110 transition-transform'>
                  <FaWhatsapp />
                </div>
                <h3 className='text-xl font-bold text-foreground mb-2'>
                  {t.card_wp}
                </h3>
                <p className='text-muted-foreground text-center text-sm'>
                  {t.card_wp_desc}
                </p>
              </a>

              {/* Telegram Card */}
              <a
                href='https://t.me/nostcopy'
                target='_blank'
                rel='noopener noreferrer'
                className='group flex flex-col items-center justify-center p-8 rounded-xl border border-border/50 bg-background hover:border-blue-400/50 hover:bg-blue-400/5 transition-all cursor-pointer'
              >
                <div className='w-16 h-16 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center mb-4 text-3xl group-hover:scale-110 transition-transform'>
                  <FaTelegramPlane />
                </div>
                <h3 className='text-xl font-bold text-foreground mb-2'>
                  {t.card_tg}
                </h3>
                <p className='text-muted-foreground text-center text-sm'>
                  {t.card_tg_desc}
                </p>
              </a>

              {/* Phone Card */}
              <a
                href='tel:+902121234567'
                className='group flex flex-col items-center justify-center p-8 rounded-xl border border-border/50 bg-background hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer'
              >
                <div className='w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 text-3xl group-hover:scale-110 transition-transform'>
                  <FaPhoneAlt />
                </div>
                <h3 className='text-xl font-bold text-foreground mb-2'>
                  {t.card_phone}
                </h3>
                <p className='text-muted-foreground text-center text-sm'>
                  {t.card_phone_desc}
                </p>
              </a>

              {/* Mail Card */}
              <a
                href='mailto:info@nostcopy.com'
                className='group flex flex-col items-center justify-center p-8 rounded-xl border border-border/50 bg-background hover:border-purple-500/50 hover:bg-purple-500/5 transition-all cursor-pointer'
              >
                <div className='w-16 h-16 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-4 text-3xl group-hover:scale-110 transition-transform'>
                  <FaEnvelope />
                </div>
                <h3 className='text-xl font-bold text-foreground mb-2'>
                  {t.card_mail}
                </h3>
                <p className='text-muted-foreground text-center text-sm'>
                  {t.card_mail_desc}
                </p>
              </a>
            </div>
          </div>
        </div>

        {/* 2. HARİTA ALANI (HARİTA AÇIKKEN) */}
        <div
          className={`absolute inset-0 z-0 h-full w-full transition-opacity duration-500 ${
            showMap ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Harita bileşenini showMap true ise yükle (Performans için) veya CSS ile gizle */}
          {/* CSS gizleme, harita konumunu korur. Conditional render (&&) haritayı sıfırlar. */}
          <div className='h-full w-full'>
            {loading ? (
              <div className='flex h-full items-center justify-center text-muted-foreground 2xl:text-2xl'>
                {t.loading}
              </div>
            ) : (
              <MapContainer
                center={[25, 10]}
                zoom={2}
                scrollWheelZoom={false}
                style={mapStyle}
                // @ts-ignore
                worldCopyJump={true}
              >
                <TileLayer
                  attribution='&copy; CARTO'
                  url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
                  className='dark:filter dark:invert dark:grayscale dark:contrast-75'
                />

                {locations.map(loc => {
                  const content = getLocalizedContent(loc)
                  return (
                    <CircleMarker
                      key={loc.id}
                      center={[loc.lat, loc.lng]}
                      pathOptions={{
                        color: 'var(--primary)',
                        fillColor: 'var(--primary)',
                        fillOpacity: 0.6,
                        weight: 2
                      }}
                      radius={8}
                      eventHandlers={{
                        mouseover: () => handleMouseEnter(loc.id),
                        mouseout: handleMouseLeave,
                        click: () => handleMouseEnter(loc.id)
                      }}
                    >
                      {activeLoc === loc.id && (
                        <Tooltip
                          permanent={true}
                          direction='top'
                          offset={[0, -10]}
                          opacity={1}
                          interactive={true}
                          eventHandlers={{
                            mouseover: () => handleMouseEnter(loc.id),
                            mouseout: handleMouseLeave
                          }}
                        >
                          <div className='text-center px-2 py-1 flex flex-col items-center gap-2 min-w-[150px] 2xl:min-w-[200px]'>
                            <div>
                              <p className='font-bold text-sm 2xl:text-lg text-foreground mb-0.5'>
                                {content.title}
                              </p>
                              <p className='text-xs 2xl:text-sm text-muted-foreground max-w-[200px] whitespace-normal leading-snug'>
                                {content.address}
                              </p>
                              <p className='text-xs 2xl:text-sm mt-2 text-muted-foreground'>
                                {content.phone}
                              </p>
                              <p className='text-xs 2xl:text-sm text-muted-foreground'>
                                {content.email}
                              </p>
                            </div>
                            {loc.map_url && (
                              <a
                                href={loc.map_url}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='mt-1 text-xs 2xl:text-sm font-semibold bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors no-underline flex items-center justify-center gap-1.5 w-full shadow-sm'
                                onClick={e => e.stopPropagation()}
                              >
                                <span>{t.map_btn}</span>
                                <FaArrowRight size={10} />
                              </a>
                            )}
                          </div>
                        </Tooltip>
                      )}
                    </CircleMarker>
                  )
                })}
              </MapContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
