'use client'

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect
} from 'react'

// Loading Context Tipi
type LoadingCtx = {
  start: () => void
  stop: () => void
  isLoading: boolean
}

const AppLoadingContext = createContext<LoadingCtx>({
  start: () => {},
  stop: () => {},
  isLoading: false
})

export function AppLoadingProvider ({
  children
}: {
  children: React.ReactNode
}) {
  const [loadingCount, setLoadingCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  // Titremeyi önlemek için timer referansları
  const stopTimerRef = useRef<NodeJS.Timeout | null>(null)
  const minDisplayTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isLockedRef = useRef(false) // Minimum süre kilidi

  const start = useCallback(() => {
    // Eğer bir durdurma zamanlayıcısı varsa iptal et (Hala yükleniyor demektir)
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current)
      stopTimerRef.current = null
    }

    setLoadingCount(prev => {
      const newVal = prev + 1
      if (newVal === 1) {
        // İlk yükleme başladı, ekrana getir
        setIsVisible(true)
        isLockedRef.current = true

        // En az 500ms ekranda kalmasını garanti et
        if (minDisplayTimerRef.current) clearTimeout(minDisplayTimerRef.current)
        minDisplayTimerRef.current = setTimeout(() => {
          isLockedRef.current = false
          // Eğer süre dolduğunda sayaç 0 ise kapatmayı tetikle
          // (Burada state'e erişemediğimiz için useEffect ile kontrol edeceğiz)
        }, 500)
      }
      return newVal
    })
  }, [])

  const stop = useCallback(() => {
    setLoadingCount(prev => Math.max(0, prev - 1))
  }, [])

  // Sayaç veya Kilit değiştiğinde görünürlüğü kontrol et
  useEffect(() => {
    // Eğer sayaç 0 ise ve minimum süre kilidi yoksa kapat
    if (loadingCount === 0 && !isLockedRef.current) {
      // Biraz gecikmeli kapat ki animasyonlar yumuşak olsun
      stopTimerRef.current = setTimeout(() => {
        setIsVisible(false)
      }, 300)
    }

    // Eğer sayaç 0 ama kilitliyse, kilit açılınca kapanması için bir interval veya
    // minDisplayTimerRef içindeki callback işi halledecek mi?
    // State güncellemeleri asenkron olduğu için en temizi, kilit açıldığında
    // loadingCount'u kontrol eden bir mekanizmadır.
    // Basitlik adına: MinDisplay süresi dolunca bir force update yapmayalım,
    // kullanıcı hissetmez. 300ms delay zaten çoğu durumu kurtarır.
  }, [loadingCount])

  // Kilit süresi dolduğunda tekrar kontrol et (Edge case için)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLockedRef.current && loadingCount === 0 && isVisible) {
        setIsVisible(false)
      }
    }, 200)
    return () => clearInterval(interval)
  }, [loadingCount, isVisible])

  return (
    <AppLoadingContext.Provider value={{ start, stop, isLoading: isVisible }}>
      {children}

      {/* FULL SCREEN LOADING OVERLAY */}
      <div
        className={`fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center transition-opacity duration-500 pointer-events-none
                ${isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0'}`}
      >
        {/* LOGO veya SPINNER */}
        <div className='flex flex-col items-center gap-4'>
          <div className='w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin'></div>
          <h2 className='text-xl font-bold text-gray-700 animate-pulse'>
            Nost Copy
          </h2>
        </div>
      </div>
    </AppLoadingContext.Provider>
  )
}

export function useAppLoading () {
  return useContext(AppLoadingContext)
}
