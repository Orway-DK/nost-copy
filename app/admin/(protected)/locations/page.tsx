'use client'

import { useState, useEffect } from 'react'
import LocationsForm from './locations-form'
import LocationsCard from './locations-card'
import { getLocations, createLocation, updateLocation, deleteLocation } from './actions'

const INITIAL_FORM = {
    title: '',
    address: '',
    phone: '',
    email: '',
    lat: '',
    lng: ''
}

export default function AdminLocationsPage() {
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
            alert("Veriler yüklenirken hata oluştu.")
        }
    }

    // --- HANDLERS ---

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        let res;
        if (editingId) {
            res = await updateLocation(editingId, form)
        } else {
            res = await createLocation(form)
        }

        if (res.error) {
            alert('Hata: ' + res.error)
        } else {
            handleCancel() // Formu temizle
            loadLocations() // Listeyi güncelle
        }
        setLoading(false)
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Bu lokasyonu silmek istediğinize emin misiniz?')) return

        const res = await deleteLocation(id)
        if (res.error) {
            alert('Silinemedi: ' + res.error)
        } else {
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
            lat: loc.lat.toString(),
            lng: loc.lng.toString()
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleCancel = () => {
        setForm(INITIAL_FORM)
        setEditingId(null)
    }

    // --- RENDER ---
    return (
        <div className="admin-root p-6 md:p-10">
            <div className="max-w-7xl mx-auto">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Lokasyon Yönetimi</h1>
                    <p className="opacity-70 mt-2">Haritada ve iletişim sayfasında görünecek ofisleri yönetin.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sol: Form */}
                    <div className="lg:col-span-1">
                        <LocationsForm
                            form={form}
                            setForm={setForm}
                            loading={loading}
                            editingId={editingId}
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                        />
                    </div>

                    {/* Sağ: Liste */}
                    <div className="lg:col-span-2">
                        <LocationsCard
                            locations={locations}
                            editingId={editingId}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    </div>
                </div>

            </div>
        </div>
    )
}