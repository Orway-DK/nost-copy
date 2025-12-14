'use client'

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef
} from 'react'

type LoadingCtx = {
  register: (id: string) => void
  unregister: (id: string) => void
  isLoading: boolean
  progress: number
}

const LoadingContext = createContext<LoadingCtx>({
  register: () => {},
  unregister: () => {},
  isLoading: true,
  progress: 0
})

export function LoadingProvider ({ children }: { children: React.ReactNode }) {
  // Hangi bileşenlerin yüklendiğini takip eden Set
  const [activeTasks, setActiveTasks] = useState<Set<string>>(new Set())

  // Progress hesabı için sayaçlar
  const [totalRegistered, setTotalRegistered] = useState(0)
  const [finishedCount, setFinishedCount] = useState(0)

  const [isLoading, setIsLoading] = useState(true)
  const isLocked = useRef(true) // Minimum süre kilidi

  // 1. Görev Kayıt
  const register = useCallback((id: string) => {
    setActiveTasks(prev => {
      const newSet = new Set(prev)
      if (!newSet.has(id)) {
        newSet.add(id)
        setTotalRegistered(t => t + 1)
      }
      return newSet
    })
    setIsLoading(true)
  }, [])

  // 2. Görev Silme
  const unregister = useCallback((id: string) => {
    setActiveTasks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
        setFinishedCount(f => f + 1)
      }
      return newSet
    })
  }, [])

  // 3. Minimum Süre (800ms) - Logo görünsün diye
  useEffect(() => {
    isLocked.current = true
    const timer = setTimeout(() => {
      isLocked.current = false
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  // 4. Bitiş Kontrolü
  useEffect(() => {
    const checkDone = setInterval(() => {
      // Eğer aktif görev kalmadıysa VE süre kilidi açıldıysa
      if (activeTasks.size === 0 && !isLocked.current) {
        setIsLoading(false)
      }
    }, 100)
    return () => clearInterval(checkDone)
  }, [activeTasks])

  // Progress yüzdesi
  const progress =
    totalRegistered === 0
      ? 0
      : Math.min(100, Math.round((finishedCount / totalRegistered) * 100))

  return (
    <LoadingContext.Provider
      value={{ register, unregister, isLoading, progress }}
    >
      {children}
      <LoadingOverlay visible={isLoading} progress={progress} />
    </LoadingContext.Provider>
  )
}

// --- GÖRSEL ---
function LoadingOverlay ({
  visible,
  progress
}: {
  visible: boolean
  progress: number
}) {
  const [shouldRender, setShouldRender] = useState(true)

  useEffect(() => {
    if (visible) setShouldRender(true)
    else {
      const timer = setTimeout(() => setShouldRender(false), 500)
      return () => clearTimeout(timer)
    }
  }, [visible])

  if (!shouldRender) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out
            bg-[#ecf2ff] dark:bg-[#0f172a] text-slate-900 dark:text-white
            ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div className='relative w-24 h-24 mb-8'>
        <div className='absolute inset-0 rounded-full border-4 border-slate-300 dark:border-slate-700 opacity-30'></div>
        <div className='absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin'></div>
        <div className='absolute inset-0 flex items-center justify-center font-bold text-3xl font-[oswald] animate-pulse'>
          N
        </div>
      </div>

      <h2 className='text-lg font-medium tracking-[0.2em] mb-4 font-[oswald]'>
        YÜKLENİYOR
      </h2>

      <div className='w-64 h-1 bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden'>
        <div
          className='h-full bg-blue-600 transition-all duration-300 ease-out'
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className='text-xs text-slate-500 mt-2 font-mono'>%{progress}</p>
    </div>
  )
}

export function useLoading () {
  return useContext(LoadingContext)
}
