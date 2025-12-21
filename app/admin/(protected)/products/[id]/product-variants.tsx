// C:\Projeler\nost-copy\app\admin\(protected)\products\[id]\product-variants.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { upsertVariantAction, deleteVariantAction } from '../actions'
import { IoAdd, IoTrash, IoClose } from 'react-icons/io5'

export default function ProductVariants ({
  productId,
  initialVariants
}: {
  productId: number
  initialVariants: any[]
}) {
  const router = useRouter()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [newVariant, setNewVariant] = useState({
    material_slug: '',
    grams: 0,
    side_code: '',
    lamination: false,
    lamination_type_slug: '',
    operations: '',
    attributes: '{}'
  })

  const handleSave = async () => {
    setSaving(true)

    let parsedAttributes = {}
    try {
      parsedAttributes = JSON.parse(newVariant.attributes)
    } catch (e) {
      alert('Attributes geçerli bir JSON formatında değil! Örn: {"Beden": "S"}')
      setSaving(false)
      return
    }

    const payload = {
      product_id: productId,
      ...newVariant,
      operations: newVariant.operations
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      attributes: parsedAttributes, // Parsed JSON
      lamination_type_slug: newVariant.lamination
        ? newVariant.lamination_type_slug
        : null
    }

    const res = await upsertVariantAction(payload)
    setSaving(false)

    if (res.success) {
      setIsFormOpen(false)
      setNewVariant({
        material_slug: '',
        grams: 0,
        side_code: '',
        lamination: false,
        lamination_type_slug: '',
        operations: '',
        attributes: '{}'
      })
      router.refresh() // Sayfayı yenile, yeni veri gelsin
    } else {
      alert('Hata: ' + res.message)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Silmek istediğine emin misin?')) return
    const res = await deleteVariantAction(id, productId)
    if (res.success) router.refresh()
    else alert(res.message)
  }

  return (
    <div className='card-admin p-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <h3
          className='text-lg font-semibold'
          style={{ color: 'var(--admin-fg)' }}
        >
          Varyasyonlar ({initialVariants.length})
        </h3>
        <button
          onClick={() => setIsFormOpen(true)}
          className='btn-admin btn-admin-primary flex items-center gap-2'
        >
          <IoAdd /> Yeni Ekle
        </button>
      </div>

      <div className='space-y-3'>
        {initialVariants.length === 0 && (
          <p className='opacity-50 text-center py-4'>Kayıt yok.</p>
        )}

        {initialVariants.map(v => (
          <div
            key={v.id}
            className='p-4 rounded-lg border flex justify-between items-start'
            style={{
              backgroundColor: 'var(--admin-input-bg)',
              borderColor: 'var(--admin-input-border)'
            }}
          >
            <div
              className='text-sm space-y-1'
              style={{ color: 'var(--admin-fg)' }}
            >
              <p>
                <strong>Malzeme:</strong> {v.material_slug}
              </p>
              <p>
                <strong>Özellikler:</strong> {v.grams}g | {v.side_code} |{' '}
                {v.lamination
                  ? `Laminasyon: ${v.lamination_type_slug}`
                  : 'Laminasyon Yok'}
              </p>
            </div>
            <button
              onClick={() => handleDelete(v.id)}
              className='text-[var(--admin-danger)] hover:bg-[var(--admin-danger)]/10 p-2 rounded'
            >
              <IoTrash size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* MODAL GÜNCELLEMESİ */}
      {isFormOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <div
            className='rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto'
            style={{
              backgroundColor: 'var(--admin-card)',
              color: 'var(--admin-fg)'
            }}
          >
            <h3 className='text-xl font-bold'>Yeni Varyasyon</h3>

            {/* MATBAA İÇİN ALANLAR (Opsiyonel bırakılabilir) */}
            <div
              className='p-3 border rounded border-dashed'
              style={{ borderColor: 'var(--admin-border)' }}
            >
              <p className='text-xs font-bold opacity-50 mb-2 uppercase'>
                Matbaa Özellikleri (Opsiyonel)
              </p>
              <div className='grid grid-cols-2 gap-3 mb-3'>
                <input
                  className='admin-input'
                  placeholder='Malzeme (örn: kuse)'
                  value={newVariant.material_slug}
                  onChange={e =>
                    setNewVariant({
                      ...newVariant,
                      material_slug: e.target.value
                    })
                  }
                />
                <input
                  className='admin-input'
                  placeholder='Gramaj (örn: 350)'
                  type='number'
                  value={newVariant.grams}
                  onChange={e =>
                    setNewVariant({
                      ...newVariant,
                      grams: Number(e.target.value)
                    })
                  }
                />
                <input
                  className='admin-input'
                  placeholder='Yön Kodu (örn: single/double)'
                  value={newVariant.side_code}
                  onChange={e =>
                    setNewVariant({ ...newVariant, side_code: e.target.value })
                  }
                />
              </div>
              <div className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  checked={newVariant.lamination}
                  onChange={e =>
                    setNewVariant({
                      ...newVariant,
                      lamination: e.target.checked
                    })
                  }
                />
                <span className='text-sm'>Laminasyon</span>
                {newVariant.lamination && (
                  <input
                    className='admin-input h-8 text-xs flex-1 ml-2'
                    placeholder='Tip (mat/parlak)'
                    value={newVariant.lamination_type_slug}
                    onChange={e =>
                      setNewVariant({
                        ...newVariant,
                        lamination_type_slug: e.target.value
                      })
                    }
                  />
                )}
              </div>
            </div>

            {/* DİĞER ÜRÜNLER İÇİN JSON ALANI */}
            <div
              className='p-3 border rounded border-dashed'
              style={{ borderColor: 'var(--admin-border)' }}
            >
              <p className='text-xs font-bold opacity-50 mb-2 uppercase'>
                Ekstra Özellikler (Tişört/Kupa vb.)
              </p>
              <label className='text-xs opacity-70 block mb-1'>
                JSON Formatında Giriniz: {'{"Beden": "S", "Renk": "Siyah"}'}
              </label>
              <textarea
                className='admin-textarea font-mono text-xs'
                rows={3}
                value={newVariant.attributes}
                onChange={e =>
                  setNewVariant({ ...newVariant, attributes: e.target.value })
                }
              />
            </div>

            <div className='flex justify-end gap-2 mt-4'>
              <button
                onClick={() => setIsFormOpen(false)}
                className='btn-admin btn-admin-secondary'
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className='btn-admin btn-admin-primary'
              >
                {saving ? '...' : 'Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
