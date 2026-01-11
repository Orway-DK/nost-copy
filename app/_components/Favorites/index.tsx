// app\_components\Favorites\index.tsx
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface FavoritesContextType {
  favoriteIds: number[]
  toggleFavorite: (id: number) => void
  isFavorite: (id: number) => boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
)

export function FavoritesProvider ({ children }: { children: React.ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([])
  const [mounted, setMounted] = useState(false)

  // Sayfa yüklendiğinde LocalStorage'dan veriyi çek
  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('myFavorites')
    if (stored) {
      try {
        setFavoriteIds(JSON.parse(stored))
      } catch (e) {
        console.error('Favoriler ayrıştırılamadı:', e)
      }
    }
  }, [])

  // State değiştiğinde LocalStorage'ı güncelle
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('myFavorites', JSON.stringify(favoriteIds))
    }
  }, [favoriteIds, mounted])

  const toggleFavorite = (id: number) => {
    setFavoriteIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(favId => favId !== id) // Çıkar
      } else {
        return [...prev, id] // Ekle
      }
    })
  }

  const isFavorite = (id: number) => favoriteIds.includes(id)

  return (
    <FavoritesContext.Provider
      value={{ favoriteIds, toggleFavorite, isFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

// Hook olarak dışa aktar
export function useFavorites () {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
