'use client'

import { useEffect, useState } from 'react'
import NextTopLoader from 'nextjs-toploader'

export function AdminProgressBar() {
  // Varsayılan renk (CSS yüklenemezse bunu kullanır)
  const [accentColor, setAccentColor] = useState('#0f172a') 

  useEffect(() => {
    // .admin-root sınıfına sahip elementi bul
    const adminRoot = document.querySelector('.admin-root')
    
    if (adminRoot) {
      // O elementin üzerindeki --admin-accent değişkenini oku
      const style = getComputedStyle(adminRoot)
      const color = style.getPropertyValue('--admin-accent').trim()
      
      // Eğer renk bulunduysa state'i güncelle
      if (color) setAccentColor(color)
    }
  }, [])

  return (
    <NextTopLoader
      color={accentColor}
      initialPosition={0.08}
      crawlSpeed={200}
      height={3}
      crawl={true}
      showSpinner={false}
      easing="ease"
      speed={200}
      shadow={`0 0 10px ${accentColor},0 0 5px ${accentColor}`}
      zIndex={99999}
    />
  )
}