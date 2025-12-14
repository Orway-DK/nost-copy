// C:\Projeler\nost-copy\app\admin\(protected)\locations\page.tsx
'use client'

import { useState, useEffect } from 'react'
import LocationsForm from './locations-form'
import LocationsCard from './locations-card'
import {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation
} from './actions'
import { Toaster, toast } from 'react-hot-toast'

// Başlangıç değerleri
const INITIAL_FORM = {
  title: '',
  address: '',
  phone: '',
  email: '',
  lat: '',
  lng: '',
  map_url: ''
}

export default function AdminLocationsPage () {
  const [locations, setLocations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(INITIAL_FORM)

  // Sayfa açılınca verileri çek
  useEffect(() => {
    loadLocations()
  }, [])

  const loadLocations = async () => {
    try {
      const data = await getLocations()
      setLocations(data || [])
    } catch (error) {
      console.error(error)
      toast.error('Veriler yüklenirken hata oluştu.')
    }
  }

  // --- HANDLERS ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    let res
    if (editingId) {
      res = await updateLocation(editingId, form)
    } else {
      res = await createLocation(form)
    }

    if (res.error) {
      toast.error('Hata: ' + res.error)
    } else {
      toast.success(
        editingId ? 'Lokasyon güncellendi.' : 'Yeni lokasyon eklendi.'
      )
      handleCancel() // Formu temizle
      loadLocations() // Listeyi güncelle
    }
    setLoading(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bu lokasyonu silmek istediğinize emin misiniz?')) return

    const res = await deleteLocation(id)
    if (res.error) {
      toast.error('Silinemedi: ' + res.error)
    } else {
      toast.success('Lokasyon silindi.')
      if (editingId === id) handleCancel()
      loadLocations()
    }
  }

  const handleEdit = (loc: any) => {
    setEditingId(loc.id)
    setForm({
      title: loc.title,
      address: loc.address || '',
      phone: loc.phone || '',
      email: loc.email || '',
      lat: loc.lat?.toString() || '',
      lng: loc.lng?.toString() || '',
      map_url: loc.map_url || ''
    })
    // Mobilde formu görebilmek için yukarı kaydır
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancel = () => {
    setForm(INITIAL_FORM)
    setEditingId(null)
  }

  // --- RENDER ---
  return (
    <div className='space-y-6 pb-20'>
      {/* Header */}
      <div className='admin-page-header'>
        <div>
          <h1 className='admin-page-title'>Lokasyon Yönetimi</h1>
          <p className='text-[var(--admin-muted)] text-sm'>
            Haritada ve iletişim sayfasında görünecek ofisleri yönetin.
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Sol: Form (Sticky on Desktop) */}
        <div className='lg:col-span-1'>
          <div className='sticky top-4'>
            <LocationsForm
              form={form}
              setForm={setForm}
              loading={loading}
              editingId={editingId}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </div>
        </div>

        {/* Sağ: Liste */}
        <div className='lg:col-span-2'>
          <LocationsCard
            locations={locations}
            editingId={editingId}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  )
}
