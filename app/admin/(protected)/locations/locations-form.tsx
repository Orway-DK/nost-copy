// C:\Projeler\nost-copy\app\admin\(protected)\locations\locations-form.tsx
'use client'

import {
  SlLocationPin,
  SlMap,
  SlPhone,
  SlEnvolope,
  SlCompass,
  SlCheck,
  SlClose
} from 'react-icons/sl'

interface LocationsFormProps {
  form: any
  setForm: (form: any) => void
  loading: boolean
  editingId: number | null
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export default function LocationsForm ({
  form,
  setForm,
  loading,
  editingId,
  onSubmit,
  onCancel
}: LocationsFormProps) {
  return (
    <div className='card-admin shadow-lg'>
      <div className='flex items-center justify-between mb-6 border-b border-[var(--admin-card-border)] pb-3'>
        <h2 className='font-bold text-lg flex items-center gap-2 text-[var(--admin-fg)]'>
          <SlLocationPin className='text-[var(--admin-accent)]' />
          {editingId ? 'Ofisi Düzenle' : 'Yeni Ofis Ekle'}
        </h2>
        {editingId && (
          <span className='badge-admin badge-admin-info'>Düzenleniyor</span>
        )}
      </div>

      <form onSubmit={onSubmit} className='flex flex-col gap-5'>
        {/* Ofis Adı */}
        <div>
          <label className='admin-label flex items-center gap-2'>
            Ofis Adı <span className='text-red-500'>*</span>
          </label>
          <input
            className='admin-input'
            placeholder='Örn: Nost Copy Berlin'
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>

        {/* Adres */}
        <div>
          <label className='admin-label flex items-center gap-2'>
            <SlMap className='text-[var(--admin-muted)]' /> Açık Adres
          </label>
          <textarea
            className='admin-textarea min-h-[80px]'
            placeholder='Cadde, sokak, kapı no...'
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
          />
        </div>

        {/* İletişim */}
        <div className='grid grid-cols-1 gap-4'>
          <div>
            <label className='admin-label flex items-center gap-2'>
              <SlPhone className='text-[var(--admin-muted)]' /> Telefon
            </label>
            <input
              className='admin-input'
              placeholder='+90 555...'
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <label className='admin-label flex items-center gap-2'>
              <SlEnvolope className='text-[var(--admin-muted)]' /> E-Posta
            </label>
            <input
              type='email'
              className='admin-input'
              placeholder='info@...'
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>

        {/* Harita Linki */}
        <div>
          <label className='admin-label flex items-center gap-2'>
            <SlMap className='text-[var(--admin-muted)]' /> Google Maps Linki
          </label>
          <input
            className='admin-input'
            placeholder='https://goo.gl/maps/...'
            value={form.map_url || ''}
            onChange={e => setForm({ ...form, map_url: e.target.value })}
          />
          <p className='text-[11px] text-[var(--admin-muted)] mt-1'>
            Haritada "Yol Tarifi Al" butonu için kullanılır.
          </p>
        </div>

        {/* Koordinatlar */}
        <div className='p-4 bg-[var(--admin-input-bg)] rounded-lg border border-[var(--admin-card-border)]'>
          <label className='admin-label flex items-center gap-2 mb-3 font-semibold'>
            <SlCompass className='text-[var(--admin-accent)]' /> Koordinatlar
          </label>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='text-xs text-[var(--admin-muted)] mb-1 block'>
                Enlem (Lat)
              </label>
              <input
                type='number'
                step='any'
                className='admin-input'
                placeholder='41.0082'
                value={form.lat}
                onChange={e => setForm({ ...form, lat: e.target.value })}
                required
              />
            </div>
            <div>
              <label className='text-xs text-[var(--admin-muted)] mb-1 block'>
                Boylam (Lng)
              </label>
              <input
                type='number'
                step='any'
                className='admin-input'
                placeholder='28.9784'
                value={form.lng}
                onChange={e => setForm({ ...form, lng: e.target.value })}
                required
              />
            </div>
          </div>
          <p className='text-[10px] text-[var(--admin-info)] mt-2 flex items-center gap-1'>
            ℹ️ Google Maps'te sağ tıklayarak koordinatları alabilirsiniz.
          </p>
        </div>

        {/* Butonlar */}
        <div className='flex gap-3 mt-2'>
          {editingId && (
            <button
              type='button'
              onClick={onCancel}
              className='btn-admin btn-admin-secondary flex-1 gap-2'
            >
              <SlClose /> Vazgeç
            </button>
          )}
          <button
            type='submit'
            disabled={loading}
            className={`btn-admin btn-admin-primary flex-1 gap-2 ${
              editingId ? 'bg-[var(--admin-info)]' : ''
            }`}
          >
            <SlCheck />{' '}
            {loading ? 'İşleniyor...' : editingId ? 'Güncelle' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  )
}
