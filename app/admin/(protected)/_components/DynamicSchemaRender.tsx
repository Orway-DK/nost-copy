'use client'

import { useState, useMemo } from 'react'
import { TemplateField, Material } from '@/types'

interface Props {
  schema: TemplateField[]
  values: Record<string, any>
  onChange: (values: Record<string, any>) => void
  materials?: Material[] // <--- YENİ PROP: Malzeme Listesi
}

export default function DynamicSchemaRender({
  schema,
  values,
  onChange,
  materials = []
}: Props) {
  const handleFieldChange = (key: string, val: any) => {
    onChange({ ...values, [key]: val })
  }

  // Kağıtları Grupla: { 'kuse': [Material1, Material2], 'bristol': [...] }
  const paperGroups = useMemo(() => {
    const groups: Record<string, Material[]> = {}
    
    // Sadece 'kagit' kategorisindeki aktif malzemeleri al
    const papers = materials.filter(m => m.category_slug === 'kagit' && m.is_active)
    
    papers.forEach(p => {
      const type = p.type_code || 'Genel'
      if (!groups[type]) groups[type] = []
      groups[type].push(p)
    })
    
    return groups
  }, [materials])

  if (!schema || schema.length === 0)
    return (
      <div className='text-xs opacity-50 italic'>
        Bu şablon için özel alan tanımlanmamış.
      </div>
    )

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in'>
      {schema.map(field => {
        // --- ÖZEL TİP: PAPER (Kağıt Seçimi) ---
        if (field.type === 'paper') {
            // Seçili ID'ye göre şu anki kağıdı bul
            const selectedId = values[field.key] ? Number(values[field.key]) : null
            const selectedMaterial = materials.find(m => m.id === selectedId)
            
            // Seçili Tip (Kuşe, Bristol vs.)
            const currentType = selectedMaterial?.type_code || ''

            return (
                <div key={field.key} className="col-span-1 md:col-span-2 p-3 border border-admin-accent/20 bg-admin-accent/5 rounded-xl space-y-3">
                    <label className='admin-label text-admin-accent font-bold'>
                        {field.label} {field.required && <span className='text-red-500'>*</span>}
                    </label>
                    
                    <div className="grid grid-cols-2 gap-4">
                        {/* 1. SEÇİM: Kağıt Cinsi */}
                        <div>
                             <label className="text-[10px] uppercase opacity-50 font-bold mb-1 block">Kağıt Türü</label>
                             <select 
                                className="admin-select bg-white"
                                value={currentType}
                                onChange={(e) => {
                                    // Tür değişince, o türün ilk gramajını otomatik seç (UX için)
                                    const newType = e.target.value
                                    if(newType && paperGroups[newType]?.length > 0) {
                                        // Varsayılan olarak ilkini seçelim
                                        handleFieldChange(field.key, paperGroups[newType][0].id)
                                    } else {
                                        handleFieldChange(field.key, null)
                                    }
                                }}
                             >
                                <option value="">-- Tür Seç --</option>
                                {Object.keys(paperGroups).map(type => (
                                    <option key={type} value={type} className="capitalize">
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </option>
                                ))}
                             </select>
                        </div>

                        {/* 2. SEÇİM: Gramaj ve Özellik */}
                        <div>
                             <label className="text-[10px] uppercase opacity-50 font-bold mb-1 block">Gramaj & Yüzey</label>
                             <select 
                                className="admin-select bg-white"
                                value={selectedId || ''}
                                onChange={(e) => handleFieldChange(field.key, Number(e.target.value))}
                                disabled={!currentType} // Tür seçilmeden burası açılmaz
                             >
                                {!currentType && <option>Önce tür seçiniz</option>}
                                {currentType && paperGroups[currentType]?.map(m => (
                                    <option key={m.id} value={m.id}>
                                        {m.weight_g}gr - {m.finish_type === 'mat' ? 'Mat' : m.finish_type === 'parlak' ? 'Parlak' : 'Standart'} 
                                        {/* Ekstra açıklama varsa ekle */}
                                        {m.name.includes('Sıvama') ? ' (Sıvama)' : ''}
                                    </option>
                                ))}
                             </select>
                        </div>
                    </div>
                    {/* Seçilen Malzemenin Tam Adı (Bilgi Amaçlı) */}
                    {selectedMaterial && (
                        <div className="text-xs text-admin-muted flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Seçilen: <strong>{selectedMaterial.name}</strong> (Stok Kodu: #{selectedMaterial.id})
                        </div>
                    )}
                </div>
            )
        }

        // --- DİĞER TİPLER (STANDART) ---
        return (
          <div key={field.key} className='space-y-1'>
            <label className='admin-label'>
              {field.label}{' '}
              {field.required && <span className='text-red-500'>*</span>}
            </label>

            {(field.type === 'text' || field.type === 'number') && (
              <div className='relative'>
                <input
                  type={field.type}
                  className='admin-input'
                  value={values[field.key] || ''}
                  onChange={e => handleFieldChange(field.key, e.target.value)}
                  placeholder={field.label}
                  required={field.required}
                />
              </div>
            )}

            {field.type === 'textarea' && (
              <textarea
                className='admin-textarea'
                rows={3}
                value={values[field.key] || ''}
                onChange={e => handleFieldChange(field.key, e.target.value)}
              />
            )}

            {field.type === 'select' && (
              <select
                className='admin-select'
                value={values[field.key] || ''}
                onChange={e => handleFieldChange(field.key, e.target.value)}
                required={field.required}
              >
                <option value=''>Seçiniz</option>
                {field.options?.map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}

            {field.type === 'checkbox' && (
              <div
                className='flex items-center gap-3 h-[42px] border rounded-lg px-3 border-admin-input-border bg-admin-input-bg cursor-pointer hover:border-admin-accent transition-colors'
                onClick={() => handleFieldChange(field.key, !values[field.key])}
              >
                <input
                  type='checkbox'
                  className='w-5 h-5 accent-admin-accent cursor-pointer'
                  checked={!!values[field.key]}
                  onChange={e => handleFieldChange(field.key, e.target.checked)}
                />
                <span className='text-sm select-none'>{field.label}</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}