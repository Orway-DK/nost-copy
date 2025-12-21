'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FaChevronDown, FaChevronUp, FaFilter, FaCheck } from 'react-icons/fa'

// --- TİP GÜNCELLEMESİ ---
interface FilterOption {
  name: string
  count: number
}

interface CollectionFilterProps {
  // Artık sadece string array değil, obje array alıyoruz
  dynamicFilters: Record<string, FilterOption[]>
}

export default function CollectionFilter ({
  dynamicFilters
}: CollectionFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // --- YEREL STATE'LER ---
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string[]>
  >({})

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    price: true,
    ...Object.keys(dynamicFilters).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    )
  })

  // --- SENKRONİZASYON ---
  useEffect(() => {
    setMinPrice(searchParams.get('min') || '')
    setMaxPrice(searchParams.get('max') || '')

    const initialAttrs: Record<string, string[]> = {}
    searchParams.forEach((value, key) => {
      if (['min', 'max', 'lang'].includes(key)) return
      initialAttrs[key] = value.split(',')
    })
    setSelectedAttributes(initialAttrs)
  }, [searchParams])

  // --- HANDLERS ---
  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleCheckboxChange = (key: string, value: string) => {
    setSelectedAttributes(prev => {
      const currentValues = prev[key] || []
      const exists = currentValues.includes(value)

      let newValues
      if (exists) {
        newValues = currentValues.filter(v => v !== value)
      } else {
        newValues = [...currentValues, value]
      }

      if (newValues.length === 0) {
        const { [key]: deleted, ...rest } = prev
        return rest
      } else {
        return { ...prev, [key]: newValues }
      }
    })
  }

  const isChecked = (key: string, value: string) => {
    return selectedAttributes[key]?.includes(value) || false
  }

  // --- APPLY ---
  const applyFilters = () => {
    const params = new URLSearchParams()

    if (minPrice && Number(minPrice) > 0) params.set('min', minPrice)
    if (maxPrice && Number(maxPrice) > 0) params.set('max', maxPrice)

    Object.entries(selectedAttributes).forEach(([key, values]) => {
      if (values.length > 0) {
        params.set(key, values.join(','))
      }
    })

    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <aside className='w-full space-y-4'>
      {/* --- MASTER BUTON --- */}
      <div className='bg-card border border-border rounded-lg p-4 sticky top-4 z-10 shadow-sm'>
        <button
          onClick={applyFilters}
          className='w-full py-3 bg-primary text-primary-foreground text-sm font-bold rounded-md hover:brightness-110 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-md'
        >
          <FaCheck /> Filtreleri Uygula
        </button>
        <p className='text-[10px] text-muted-foreground text-center mt-2'>
          Seçimlerinizi yaptıktan sonra butona basınız.
        </p>
      </div>

      <div className='flex items-center gap-2 font-bold text-lg mb-4 lg:hidden px-1'>
        <FaFilter /> Seçenekler
      </div>

      {/* --- FİYAT FİLTRESİ --- */}
      <div className='border border-border rounded-lg bg-card overflow-hidden'>
        <button
          onClick={() => toggleSection('price')}
          className='w-full flex items-center justify-between p-4 bg-muted/30 font-semibold text-sm hover:bg-muted/50 transition-colors'
        >
          <span>Fiyat Aralığı</span>
          {openSections['price'] ? (
            <FaChevronUp size={10} />
          ) : (
            <FaChevronDown size={10} />
          )}
        </button>

        {openSections['price'] && (
          <div className='p-4 space-y-3 animate-in slide-in-from-top-2 duration-200'>
            <div className='flex items-center gap-2'>
              <input
                type='number'
                placeholder='Min TL'
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                className='w-full p-2 text-sm border border-input rounded bg-background focus:ring-1 focus:ring-primary outline-none transition-shadow'
              />
              <span className='text-muted-foreground'>-</span>
              <input
                type='number'
                placeholder='Max TL'
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                className='w-full p-2 text-sm border border-input rounded bg-background focus:ring-1 focus:ring-primary outline-none transition-shadow'
              />
            </div>
          </div>
        )}
      </div>

      {/* --- DİNAMİK FİLTRELER (SAYILI) --- */}
      {Object.entries(dynamicFilters).map(([key, options]) => (
        <div
          key={key}
          className='border border-border rounded-lg bg-card overflow-hidden'
        >
          <button
            onClick={() => toggleSection(key)}
            className='w-full flex items-center justify-between p-4 bg-muted/30 font-semibold text-sm capitalize hover:bg-muted/50 transition-colors'
          >
            <span>{key}</span>
            {openSections[key] ? (
              <FaChevronUp size={10} />
            ) : (
              <FaChevronDown size={10} />
            )}
          </button>

          {openSections[key] && (
            <div className='p-4 space-y-2 max-h-48 overflow-y-auto custom-scrollbar animate-in slide-in-from-top-2 duration-200'>
              {options.map(option => (
                <label
                  key={option.name}
                  className='flex items-center gap-2 cursor-pointer hover:bg-muted/20 p-1.5 rounded select-none transition-colors group'
                >
                  <input
                    type='checkbox'
                    checked={isChecked(key, option.name)}
                    onChange={() => handleCheckboxChange(key, option.name)}
                    className='w-4 h-4 rounded border-border text-primary focus:ring-primary'
                  />
                  <div className='flex items-center justify-between w-full text-sm'>
                    <span className='text-foreground/80 group-hover:text-foreground'>
                      {option.name}
                    </span>
                    {/* SAYI GÖSTERGESİ */}
                    <span className='text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full'>
                      {option.count}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
    </aside>
  )
}
