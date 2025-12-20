'use client'

import React, { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@supabase/supabase-js'
import { useLanguage } from '@/components/LanguageProvider'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Leaflet Dinamik Import
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

export default function MapArea () {
  const { lang } = useLanguage()
  const [locations, setLocations] = useState<LocationData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeLoc, setActiveLoc] = useState<number | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

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

  const handleMouseEnter = (id: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
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

  if (loading) {
    return (
      <div className='w-full h-full flex items-center justify-center bg-card text-muted-foreground animate-pulse'>
        Harita Verileri Yükleniyor...
      </div>
    )
  }

  return (
    <div className='w-full h-full relative z-0 animate-in fade-in duration-700'>
      <MapContainer
        center={[25, 10]}
        zoom={2}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
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
                  <div className='text-center px-2 py-1 flex flex-col items-center gap-2 min-w-[150px]'>
                    <p className='font-bold text-sm text-foreground mb-0.5'>
                      {content.title}
                    </p>
                    <p className='text-xs text-muted-foreground max-w-[200px] whitespace-normal'>
                      {content.address}
                    </p>
                  </div>
                </Tooltip>
              )}
            </CircleMarker>
          )
        })}
      </MapContainer>
    </div>
  )
}
