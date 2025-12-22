'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IoAdd, IoTrash, IoSave, IoArrowBack } from 'react-icons/io5'
import { TemplateField, FieldType, ProductTemplate } from '@/types'
import { upsertTemplateAction } from '@/app/admin/actions/template-actions' 

export default function TemplateBuilder ({
  initialData
}: {
  initialData?: ProductTemplate
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState(initialData?.name || '')
  const [fields, setFields] = useState<TemplateField[]>(
    initialData?.schema || []
  )

  // Yeni Alan Ekleme
  const addField = () => {
    setFields([
      ...fields,
      { key: '', label: '', type: 'text', required: false, options: [] }
    ])
  }

  // Alan Güncelleme
  const updateField = (index: number, key: keyof TemplateField, value: any) => {
    const newFields = [...fields]
    // @ts-ignore
    newFields[index][key] = value
    setFields(newFields)
  }

  // Alan Silme
  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index))
  }

  // Kaydetme
  const handleSave = async () => {
    if (!name) return alert('Şablon adı giriniz.')
    // Key kontrolü: Boş key varsa uyar
    if (fields.some(f => !f.key || !f.label))
      return alert('Tüm alanların Etiket ve Key değerleri dolu olmalıdır.')

    setSaving(true)
    const res = await upsertTemplateAction({
      id: initialData?.id,
      name,
      schema: fields
    })
    setSaving(false)

    if (res.success) {
      alert('✅ Şablon kaydedildi.')
      router.push('/admin/templates') // Listeye dön
      router.refresh()
    } else {
      alert('❌ Hata: ' + res.message)
    }
  }

  return (
    <div className='card-admin p-6 space-y-6 max-w-4xl mx-auto'>
      <div className='flex justify-between items-center border-b pb-4 border-[var(--admin-border)]'>
        <div className='flex items-center gap-4'>
          <button
            onClick={() => router.back()}
            className='text-2xl opacity-50 hover:opacity-100'
          >
            <IoArrowBack />
          </button>
          <h3 className='text-xl font-bold'>
            {initialData ? 'Şablonu Düzenle' : 'Yeni Ürün Şablonu (Class)'}
          </h3>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className='btn-admin btn-admin-primary gap-2'
        >
          <IoSave /> {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      {/* ŞABLON ADI */}
      <div className='bg-[var(--admin-input-bg)] p-4 rounded-lg border border-[var(--admin-border)]'>
        <label className='admin-label text-lg'>
          Şablon Adı (Örn: Seramik Kupa, Tişört)
        </label>
        <input
          className='admin-input text-lg font-bold'
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder='Şablon Adı...'
        />
      </div>

      {/* ALANLAR LİSTESİ */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h4 className='font-semibold opacity-70'>
            Özellik Alanları (Schema)
          </h4>
          <button
            onClick={addField}
            className='btn-admin btn-admin-secondary text-xs gap-1'
          >
            <IoAdd /> Alan Ekle
          </button>
        </div>

        <div className='grid gap-3'>
          {fields.map((field, idx) => (
            <div
              key={idx}
              className='grid grid-cols-1 md:grid-cols-12 gap-3 items-start p-4 border rounded bg-[var(--admin-bg)] relative group hover:border-[var(--admin-accent)] transition-colors'
            >
              {/* 1. Label */}
              <div className='md:col-span-3'>
                <label className='text-[10px] opacity-50 uppercase font-bold'>
                  Görünecek Ad (Label)
                </label>
                <input
                  className='admin-input text-sm'
                  value={field.label}
                  onChange={e => {
                    // Otomatik Key oluşturucu (Label yazarken key'i de doldurur)
                    const val = e.target.value
                    updateField(idx, 'label', val)
                    if (!field.key) {
                      const slug = val
                        .toLowerCase()
                        .replace(/ /g, '_')
                        .replace(/ı/g, 'i')
                        .replace(/ğ/g, 'g')
                        .replace(/ü/g, 'u')
                        .replace(/ş/g, 's')
                        .replace(/ö/g, 'o')
                        .replace(/ç/g, 'c')
                        .replace(/[^a-z0-9_]/g, '')
                      updateField(idx, 'key', slug)
                    }
                  }}
                  placeholder='Örn: Kağıt Türü'
                />
              </div>

              {/* 2. Key (Otomatik ama düzenlenebilir) */}
              <div className='md:col-span-3'>
                <label className='text-[10px] opacity-50 uppercase font-bold'>
                  Veri Anahtarı (Key)
                </label>
                <input
                  className='admin-input text-sm font-mono text-[var(--admin-accent)]'
                  value={field.key}
                  onChange={e => updateField(idx, 'key', e.target.value)}
                  placeholder='örn: paper_type'
                />
              </div>

              {/* 3. Tip */}
              <div className='md:col-span-2'>
                <label className='text-[10px] opacity-50 uppercase font-bold'>
                  Veri Tipi
                </label>
                <select
                  className='admin-select text-sm h-10'
                  value={field.type}
                  onChange={e =>
                    updateField(idx, 'type', e.target.value as FieldType)
                  }
                >
                  <option value='text'>Yazı (Text)</option>
                  <option value='number'>Sayı (Number)</option>
                  <option value='select'>Seçim (Dropdown)</option>
                  <option value='checkbox'>Onay (Checkbox)</option>
                </select>
              </div>

              {/* 4. Seçenekler (Sadece Select ise görünür) */}
              <div className='md:col-span-3'>
                {field.type === 'select' ? (
                  <>
                    <label className='text-[10px] opacity-50 uppercase font-bold'>
                      Seçenekler (Virgülle)
                    </label>
                    <input
                      className='admin-input text-sm'
                      value={field.options?.join(',') || ''}
                      onChange={e =>
                        updateField(idx, 'options', e.target.value.split(','))
                      }
                      placeholder='Mat, Parlak, Tuale'
                    />
                  </>
                ) : (
                  <div className='flex items-center h-full pt-6 gap-2'>
                    <input
                      type='checkbox'
                      id={`req-${idx}`}
                      className='w-4 h-4'
                      checked={field.required}
                      onChange={e =>
                        updateField(idx, 'required', e.target.checked)
                      }
                    />
                    <label
                      htmlFor={`req-${idx}`}
                      className='text-xs cursor-pointer select-none'
                    >
                      Zorunlu Alan
                    </label>
                  </div>
                )}
              </div>

              {/* Sil Butonu */}
              <div className='absolute top-2 right-2 md:relative md:top-auto md:right-auto md:col-span-1 md:flex md:justify-end md:pt-6'>
                <button
                  onClick={() => removeField(idx)}
                  className='text-red-500 hover:bg-red-500/10 p-2 rounded transition-colors'
                >
                  <IoTrash size={18} />
                </button>
              </div>
            </div>
          ))}

          {fields.length === 0 && (
            <div className='text-center py-10 opacity-50 border-2 border-dashed rounded-lg bg-[var(--admin-bg)]'>
              <p>Henüz özellik alanı eklenmedi.</p>
              <p className='text-sm'>"Alan Ekle" butonuna basarak başlayın.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
