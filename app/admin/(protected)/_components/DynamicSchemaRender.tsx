'use client'

import { TemplateField } from '@/types'

interface Props {
  schema: TemplateField[] // Formun yapısı (Template'den gelir)
  values: Record<string, any> // Formun değerleri (Product'tan gelir)
  onChange: (values: Record<string, any>) => void
}

export default function DynamicSchemaRender ({
  schema,
  values,
  onChange
}: Props) {
  const handleFieldChange = (key: string, val: any) => {
    onChange({ ...values, [key]: val })
  }

  if (!schema || schema.length === 0)
    return (
      <div className='text-xs opacity-50 italic'>
        Bu şablon için özel alan tanımlanmamış.
      </div>
    )

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in'>
      {schema.map(field => (
        <div key={field.key} className='space-y-1'>
          <label className='admin-label'>
            {field.label}{' '}
            {field.required && <span className='text-red-500'>*</span>}
          </label>

          {/* 1. TEXT / NUMBER INPUT */}
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
              {field.suffix && (
                <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-50 pointer-events-none'>
                  {field.suffix}
                </span>
              )}
            </div>
          )}

          {/* 2. SELECT (DROPDOWN) */}
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

          {/* 3. CHECKBOX */}
          {field.type === 'checkbox' && (
            <div
              className='flex items-center gap-3 h-[42px] border rounded-lg px-3 border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] cursor-pointer hover:border-[var(--admin-accent)] transition-colors'
              onClick={() => handleFieldChange(field.key, !values[field.key])}
            >
              <input
                type='checkbox'
                className='w-5 h-5 accent-[var(--admin-accent)] cursor-pointer'
                checked={!!values[field.key]}
                onChange={e => handleFieldChange(field.key, e.target.checked)}
              />
              <span className='text-sm select-none'>{field.label}</span>
            </div>
          )}

          {/* 4. TEXTAREA (Eğer tip textarea ise) */}
          {field.type === 'textarea' && (
            <textarea
              className='admin-textarea'
              rows={3}
              value={values[field.key] || ''}
              onChange={e => handleFieldChange(field.key, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  )
}
