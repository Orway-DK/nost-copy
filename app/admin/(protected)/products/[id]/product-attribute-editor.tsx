'use client'

import { useState, useEffect } from 'react'
import { IoAdd, IoClose } from 'react-icons/io5'

interface Props {
  // Gelen veri: { "Renk": ["Mavi", "Kırmızı"], "Beden": ["S", "M"] }
  initialAttributes: Record<string, any>
  onChange: (newAttributes: Record<string, any>) => void
}

export default function ProductAttributeEditor ({
  initialAttributes,
  onChange
}: Props) {
  // Local state for UI
  const [attributes, setAttributes] = useState<Record<string, string[]>>({})

  // Yeni ekleme state'leri
  const [newKey, setNewKey] = useState('')
  const [newValues, setNewValues] = useState('')

  useEffect(() => {
    // Gelen veriyi formatla (Eğer string değilse diziye çevir)
    const formatted: Record<string, string[]> = {}
    Object.entries(initialAttributes || {}).forEach(([k, v]) => {
      formatted[k] = Array.isArray(v) ? v : [String(v)]
    })
    setAttributes(formatted)
  }, []) // Sadece ilk yüklemede çalışsın, loop'a girmesin.

  const handleAdd = () => {
    if (!newKey.trim() || !newValues.trim()) return

    const valuesArray = newValues
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    const updated = { ...attributes, [newKey.trim()]: valuesArray }
    setAttributes(updated)
    onChange(updated) // Parent'a bildir

    setNewKey('')
    setNewValues('')
  }

  const handleRemove = (key: string) => {
    const updated = { ...attributes }
    delete updated[key]
    setAttributes(updated)
    onChange(updated)
  }

  return (
    <div
      className='space-y-4 p-4 border rounded-xl'
      style={{
        borderColor: 'var(--admin-card-border)',
        backgroundColor: 'var(--admin-input-bg)'
      }}
    >
      <h4 className='text-sm font-bold opacity-80 mb-2'>
        Filtreleme Özellikleri (Sidebar)
      </h4>

      {/* Liste */}
      <div className='space-y-2'>
        {Object.entries(attributes).map(([key, values]) => (
          <div
            key={key}
            className='flex items-center justify-between p-2 bg-[var(--admin-card)] border border-[var(--admin-card-border)] rounded'
          >
            <div className='flex flex-col text-sm'>
              <span className='font-bold text-[var(--admin-accent)]'>
                {key}
              </span>
              <span className='opacity-60 text-xs'>{values.join(', ')}</span>
            </div>
            <button
              type='button'
              onClick={() => handleRemove(key)}
              className='text-red-500 hover:bg-red-500/10 p-1 rounded'
            >
              <IoClose />
            </button>
          </div>
        ))}
      </div>

      {/* Yeni Ekle */}
      <div className='grid grid-cols-1 md:grid-cols-5 gap-2 pt-2 border-t border-[var(--admin-card-border)]'>
        <div className='md:col-span-2'>
          <input
            className='admin-input text-sm'
            placeholder='Özellik (Örn: Renk)'
            value={newKey}
            onChange={e => setNewKey(e.target.value)}
          />
        </div>
        <div className='md:col-span-2'>
          <input
            className='admin-input text-sm'
            placeholder='Değerler (Virgülle ayır: Kırmızı, Mavi)'
            value={newValues}
            onChange={e => setNewValues(e.target.value)}
            onKeyDown={e =>
              e.key === 'Enter' && (e.preventDefault(), handleAdd())
            }
          />
        </div>
        <button
          type='button'
          onClick={handleAdd}
          className='btn-admin btn-admin-secondary flex items-center justify-center gap-1 text-xs'
        >
          <IoAdd /> Ekle
        </button>
      </div>
      <p className='text-[10px] opacity-50 mt-1'>
        * Bu özellikler sol menüdeki filtrelerde görünecektir.
      </p>
    </div>
  )
}
