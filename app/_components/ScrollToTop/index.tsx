// C:\Projeler\nost-copy\app\_components\ScrollToTop\ScrollToTop.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IoIosArrowUp } from 'react-icons/io'

export default function ScrollToTop () {
  const [isVisible, setIsVisible] = useState(false)

  // Sayfa kaydırıldığında butonu göster/gizle
  useEffect(() => {
    const toggleVisibility = () => {
      // 300px'den fazla kaydırılırsa butonu göster
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          onClick={scrollToTop}
          // Pozisyon ayarları: Sağ alt köşede sabit.
          // Mobilde (bottom-4 right-4), Tablet/Masaüstü (bottom-8 right-8)
          className='fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[100] 
                     p-3 md:p-4 rounded-full shadow-2xl 
                     bg-primary text-primary-foreground
                     hover:bg-primary-hover hover:-translate-y-1 
                     transition-all duration-300 border border-white/10
                     flex items-center justify-center group'
          aria-label='Scroll to top'
        >
          <IoIosArrowUp className='w-6 h-6 md:w-7 md:h-7 transition-transform duration-300 group-hover:scale-110' />

          {/* Arka planda hafif bir parlama efekti (opsiyonel) */}
          <span className='absolute inset-0 rounded-full bg-primary animate-ping opacity-20 group-hover:hidden' />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
