// app\_components\AddToFavorites\index.tsx
'use client'

import { useFavorites } from '../Favorites'
import { FaHeart, FaRegHeart } from 'react-icons/fa'

interface AddToFavButtonProps {
  productId: number
  className?: string // Dışarıdan stil verebilmek için
  variant?: 'icon' | 'full' // Sadece ikon mu yoksa "Favorilere Ekle" yazılı buton mu?
}

export default function AddToFavButton ({
  productId,
  className = '',
  variant = 'icon'
}: AddToFavButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const isFav = isFavorite(productId)

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault() // Link varsa gitmesin
    e.stopPropagation()
    toggleFavorite(productId)
  }

  // --- 1. Sadece İkon Modu (Ürün kartları veya başlık yanı için) ---
  if (variant === 'icon') {
    return (
      <button
        onClick={handleToggle}
        className={`p-2 rounded-full transition-all duration-200 ${
          isFav
            ? 'text-red-500 bg-red-50 hover:bg-red-100'
            : 'text-gray-400 bg-gray-100 hover:text-red-500 hover:bg-white border border-transparent hover:border-gray-200'
        } ${className}`}
        title={isFav ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
      >
        {isFav ? <FaHeart size={20} /> : <FaRegHeart size={20} />}
      </button>
    )
  }

  // --- 2. Tam Buton Modu (Sepete Ekle yanındaki büyük buton için) ---
  return (
    <button
      onClick={handleToggle}
      className={`
        flex items-center gap-2 px-4 py-3 rounded-lg font-bold border transition-all
        ${
          isFav
            ? 'border-red-500 text-red-500 bg-red-50'
            : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
        } ${className}
      `}
    >
      {isFav ? <FaHeart /> : <FaRegHeart />}
      <span>{isFav ? 'Favorilerde' : 'Favorilere Ekle'}</span>
    </button>
  )
}
