'use client'

import { useEffect, useState } from 'react'
import { IoClose } from 'react-icons/io5'

interface Props {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  width?: 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

export default function SlideOver ({
  isOpen,
  onClose,
  title,
  children,
  width = 'xl'
}: Props) {
  const [show, setShow] = useState(isOpen)

  // Animasyon için mount/unmount kontrolü
  useEffect(() => {
    if (isOpen) setShow(true)
    else setTimeout(() => setShow(false), 300) // Kapanış animasyonu süresi
  }, [isOpen])

  if (!show) return null

  // Genişlik sınıfları
  const widthClasses = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl', // %50 civarı
    '2xl': 'max-w-4xl', // %70 civarı (istediğin bu)
    full: 'max-w-full'
  }

  return (
    <div className='fixed inset-0 z-50 overflow-hidden'>
      <div className='absolute inset-0 overflow-hidden'>
        {/* Arkaplan Karartma (Backdrop) */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onClose}
        />

        {/* Panel */}
        <div
          className={`pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 transform transition-transform duration-300 ease-in-out sm:pl-16 ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div
            className={`pointer-events-auto w-screen ${widthClasses[width]}`}
          >
            <div className='flex h-full flex-col overflow-y-scroll bg-[var(--admin-card)] shadow-2xl border-l border-[var(--admin-border)]'>
              {/* Header */}
              <div className='px-4 py-6 sm:px-6 border-b border-[var(--admin-border)] flex items-center justify-between sticky top-0 z-10 bg-[var(--admin-card)]/95 backdrop-blur'>
                <h2 className='text-xl font-bold leading-6 text-[var(--admin-fg)]'>
                  {title}
                </h2>
                <button
                  type='button'
                  className='rounded-md text-[var(--admin-muted)] hover:text-[var(--admin-fg)] focus:outline-none'
                  onClick={onClose}
                >
                  <span className='sr-only'>Kapat</span>
                  <IoClose size={24} />
                </button>
              </div>

              {/* Content */}
              <div className='relative mt-6 flex-1 px-4 sm:px-6 pb-20'>
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
