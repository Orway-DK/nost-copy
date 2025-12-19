// C:\Projeler\nost-copy\app\_components\ServicesSlider\ServiceCard.tsx
'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

export interface ServiceItem {
  id: number
  title: string
  slug: string
  image: string
  index: string
}

export default function ServiceCard ({ service }: { service: ServiceItem }) {
  return (
    <Link
      // GÜNCELLEME: Link yapısı /services/ olarak değiştirildi
      href={`/services/${service.slug}`}
      className='group block relative w-full aspect-square overflow-hidden rounded-xl bg-card'
    >
      <div className='absolute inset-0 w-full h-full'>
        <div className='relative w-full h-full'>
          <Image
            src={service.image}
            alt={service.title}
            fill
            className='object-cover transition-transform duration-700 group-hover:scale-110'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          />
          {/* Gradient overlay */}
          <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300' />
        </div>
      </div>

      {/* Dikey Yazı */}
      <div className='absolute top-0 right-0 hidden md:flex flex-col items-center justify-center pointer-events-none'>
        <div className='bg-white rounded-bl-full rounded-tl-full rounded-br-full p-4 m-4 shadow-md'>
          <span className='text-black font-bold text-2xl'>{service.index}</span>
        </div>
      </div>

      {/* Alt İçerik Alanı */}
      <div className='absolute bottom-0 left-0 w-full p-8 z-10 translate-y-2 group-hover:translate-y-0 transition-transform duration-300'>
        <h3 className='text-2xl font-bold text-white group-hover:text-primary-light transition-colors'>
          {service.title}
        </h3>

        <div className='w-12 h-1 bg-primary mt-4 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300' />
      </div>
    </Link>
  )
}
