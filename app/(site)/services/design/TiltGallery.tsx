'use client'

import React, { useRef, useState } from 'react'
import Image from 'next/image'

const ARTWORKS = [
  {
    id: 1,
    title: 'Abstract Flow',
    src: 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=1000&auto=format&fit=crop',
    desc: 'Akışkan Sanat'
  },
  {
    id: 2,
    title: 'Geometric Harmony',
    src: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop',
    desc: 'Geometrik Düzen'
  },
  {
    id: 3,
    title: 'Minimalist Lines',
    src: 'https://images.unsplash.com/photo-1717748347101-0bbee4b75fd5?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    desc: 'Minimal Çizgiler'
  }
]

export default function TiltGallery () {
  return (
    <section className='py-24 w-full min-h-screen bg-background transition-colors duration-300 flex flex-col justify-center items-center overflow-hidden'>
      <div className='max-w-7xl mx-auto px-6 w-full'>
        <div className='text-center mb-20'>
          <span className='inline-block text-primary font-bold text-xs md:text-sm tracking-[0.3em] uppercase mb-4'>
            Deneyimleyin
          </span>
          <h2 className='text-4xl md:text-6xl font-black text-foreground mb-6 tracking-tight'>
            Etkileşimli <span className='text-primary italic'>Galeri</span>
          </h2>
          <p className='text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-medium'>
            Görsellerin üzerine gelerek{' '}
            <span className='text-foreground'>3D derinliği</span> ve dinamik
            ışık yansımalarını hissedin.
          </p>
        </div>

        {/* GRID YAPISI */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-10 justify-items-center'>
          {ARTWORKS.map(art => (
            <TiltCard key={art.id} art={art} />
          ))}
        </div>
      </div>
    </section>
  )
}

function TiltCard ({ art }: { art: typeof ARTWORKS[0] }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 })
  const [isHovering, setIsHovering] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const posX = (x - centerX) / centerX
    const posY = (y - centerY) / centerY

    const rotationX = posY * -15
    const rotationY = posX * 15

    setRotate({ x: rotationX, y: rotationY })
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.6
    })
  }

  const handleMouseEnter = () => setIsHovering(true)
  const handleMouseLeave = () => {
    setIsHovering(false)
    setRotate({ x: 0, y: 0 })
    setGlare(prev => ({ ...prev, opacity: 0 }))
  }

  return (
    <div
      className='relative w-full max-w-[320px] aspect-[3/4] group'
      style={{ perspective: '1200px' }}
    >
      {/* ANA KART GÖVDESİ */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className='relative w-full h-full bg-card rounded-[2rem] shadow-2xl overflow-hidden transform-style-3d border border-border/40 transition-colors duration-300'
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) ${
            isHovering ? 'scale3d(1.05, 1.05, 1.05)' : 'scale3d(1, 1, 1)'
          }`,
          transition: isHovering
            ? 'none'
            : 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)'
        }}
      >
        {/* GÖRSEL KATMANI */}
        <div className='relative w-full h-full'>
          <Image
            src={art.src}
            alt={art.title}
            fill
            className='object-cover pointer-events-none transition-transform duration-700 group-hover:scale-110'
            sizes='(max-width: 768px) 100vw, 33vw'
          />
          {/* Dark mode derinlik overlay'i */}
          <div className='absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500'></div>
        </div>

        {/* DİNAMİK PARLAMA (GLARE) */}
        <div
          className='absolute inset-0 pointer-events-none mix-blend-overlay z-20'
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 70%)`,
            opacity: glare.opacity,
            transition: 'opacity 0.4s ease'
          }}
        />

        {/* 3D HAVADA DURAN METİN */}
        <div
          className='absolute bottom-10 left-8 right-8 text-white pointer-events-none transform-style-3d z-30'
          style={{ transform: 'translateZ(80px)' }}
        >
          <h3 className='text-2xl font-black tracking-tight drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]'>
            {art.title}
          </h3>
          <div className='w-10 h-1 bg-primary my-3 rounded-full shadow-lg'></div>
          <p className='text-sm font-bold opacity-90 tracking-widest uppercase drop-shadow-md'>
            {art.desc}
          </p>
        </div>

        {/* İÇ ÇERÇEVE DERİNLİĞİ */}
        <div className='absolute inset-0 border-[1px] border-white/20 rounded-[2rem] pointer-events-none z-10'></div>
      </div>

      {/* DİNAMİK ZEMİN GÖLGESİ */}
      <div
        className='absolute -bottom-12 left-8 right-8 h-8 bg-black/40 dark:bg-black/70 blur-3xl rounded-[100%] transition-all duration-500 z-[-1]'
        style={{
          opacity: isHovering ? 0.8 : 0.4,
          transform: isHovering
            ? 'scale(1.1) translateY(10px)'
            : 'scale(1) translateY(0px)',
          filter: 'blur(40px)'
        }}
      ></div>
    </div>
  )
}
