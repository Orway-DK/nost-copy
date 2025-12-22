'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { upsertVariantAction, deleteVariantAction } from '../actions'
import { IoAdd, IoTrash, IoSave, IoAlertCircle } from 'react-icons/io5'
import { ProductTemplate } from '@/types'
import DynamicSchemaRender from '@/app/admin/(protected)/_components/DynamicSchemaRender' // Reusable bileşeni kullan

interface Props {
  productId: number
  initialVariants: any[]
  template: ProductTemplate | null
}

export default function ProductVariantsDynamic ({
  productId,
  initialVariants,
  template
}: Props) {
  const router = useRouter()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form State
  const [attributes, setAttributes] = useState<Record<string, any>>({})
  const [price, setPrice] = useState<number>(0)

  if (!template) {
    return (
      <div className='p-6 bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-200 flex flex-col items-center justify-center text-center gap-2'>
        <IoAlertCircle size={32} />
        <h4 className='font-bold'>Şablon Seçilmedi</h4>
        <p className='text-sm'>
          Varyasyon ekleyebilmek için lütfen "Genel Bilgiler" sekmesinden bir
          Ürün Şablonu seçip kaydedin.
        </p>
      </div>
    )
  }

  const handleSave = async () => {
    // Basit Validasyon: En azından fiyat girilmeli
    if (price <= 0) return alert('Lütfen geçerli bir fiyat giriniz.')

    setSaving(true)

    const payload = {
      product_id: productId,
      attributes: attributes,
      price: price
    }

    const res = await upsertVariantAction(payload)
    setSaving(false)

    if (res.success) {
      setIsFormOpen(false)
      setAttributes({}) // Formu sıfırla ama fiyat kalsın, seri giriş için kolaylık olabilir
      // setPrice(0);
      router.refresh()
    } else {
      alert('Hata: ' + res.message)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bu varyantı silmek istediğinize emin misiniz?')) return
    await deleteVariantAction(id, productId)
    router.refresh()
  }

  return (
    <div className='card-admin p-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h3
            className='text-lg font-semibold'
            style={{ color: 'var(--admin-fg)' }}
          >
            Varyasyonlar ({initialVariants.length})
          </h3>
          <p className='text-xs opacity-50'>
            Şablon: <strong>{template.name}</strong>
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className='btn-admin btn-admin-primary flex items-center gap-2'
        >
          <IoAdd /> Yeni Ekle
        </button>
      </div>

      {/* LİSTELEME */}
      <div className='space-y-3'>
        {initialVariants.length === 0 && (
          <div className='text-center py-8 opacity-50'>
            Henüz varyant eklenmemiş.
          </div>
        )}

        {initialVariants.map(v => (
          <div
            key={v.id}
            className='p-4 rounded-lg border flex justify-between items-center group hover:border-[var(--admin-accent)] transition-colors'
            style={{
              backgroundColor: 'var(--admin-input-bg)',
              borderColor: 'var(--admin-input-border)'
            }}
          >
            <div className='text-sm'>
              <div className='flex gap-2 flex-wrap mb-2'>
                {/* Varyant Özellikleri (Objeyi dolaş) */}
                {Object.entries(v.attributes || {}).map(([key, val]: any) => (
                  <span
                    key={key}
                    className='bg-[var(--admin-card)] px-2 py-1 rounded border border-[var(--admin-border)] text-xs shadow-sm'
                  >
                    <strong className='opacity-70 mr-1 capitalize'>
                      {key}:
                    </strong>
                    {val}
                  </span>
                ))}
              </div>
              <div className='font-mono font-bold text-lg text-[var(--admin-accent)]'>
                {/* Fiyat product_prices dizisinden gelir */}
                {v.product_prices?.[0]?.amount
                  ? new Intl.NumberFormat('tr-TR', {
                      style: 'currency',
                      currency: 'TRY'
                    }).format(v.product_prices[0].amount)
                  : 'Fiyat Yok'}
              </div>
            </div>
            <button
              onClick={() => handleDelete(v.id)}
              className='text-[var(--admin-danger)] p-2 hover:bg-[var(--admin-danger)]/10 rounded transition-colors opacity-0 group-hover:opacity-100'
            >
              <IoTrash size={20} />
            </button>
          </div>
        ))}
      </div>

      {/* EKLEME MODALI */}
      {isFormOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in'>
          <div
            className='rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto'
            style={{
              backgroundColor: 'var(--admin-card)',
              color: 'var(--admin-fg)'
            }}
          >
            <div className='flex justify-between items-center border-b pb-3 border-[var(--admin-border)]'>
              <h3 className='text-xl font-bold'>Yeni Varyasyon Ekle</h3>
              <button onClick={() => setIsFormOpen(false)}>
                <IoAdd className='rotate-45 text-2xl opacity-50 hover:opacity-100' />
              </button>
            </div>

            <div className='space-y-6'>
              {/* REUSABLE BILESEN BURADA! */}
              {/* Şablondaki kurallara göre inputları oluşturur */}
              <DynamicSchemaRender
                schema={template.schema}
                values={attributes}
                onChange={setAttributes}
              />

              {/* FİYAT ALANI (Her varyantın olmazsa olmazı) */}
              <div className='pt-4 border-t border-[var(--admin-border)]'>
                <label className='admin-label text-[var(--admin-accent)] text-lg'>
                  Satış Fiyatı (TRY)
                </label>
                <input
                  type='number'
                  className='admin-input text-2xl font-bold py-3'
                  value={price}
                  onChange={e => setPrice(Number(e.target.value))}
                  placeholder='0.00'
                />
              </div>
            </div>

            <div className='flex justify-end gap-3 pt-4'>
              <button
                onClick={() => setIsFormOpen(false)}
                className='btn-admin btn-admin-secondary'
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className='btn-admin btn-admin-primary px-6'
              >
                {saving ? 'Kaydediliyor...' : 'Varyantı Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
