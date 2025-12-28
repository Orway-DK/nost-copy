'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IoAdd, IoCube, IoPencil, IoTrash, IoBuildOutline } from 'react-icons/io5'
import SlideOver from '@/app/admin/_components/SlideOver'
import { DataTable } from '@/app/admin/_components/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { upsertMaterialAction, deleteMaterialAction } from './actions'

interface Material {
  id: number
  name: string
  category_slug: string
  type_code: string
  weight_g: number
  finish_type: string
  unit: string
  cost_per_unit: number
  is_active: boolean
}

export default function MaterialManager({ materials }: { materials: Material[] }) {
  const router = useRouter()
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Material | null>(null)
  
  // FORM STATE
  const [form, setForm] = useState<Partial<Material>>({})
  const [saving, setSaving] = useState(false)

  // --- TABLO KOLONLARI ---
  const columns: ColumnDef<Material>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <span className="opacity-50 text-xs font-mono">#{row.original.id}</span>
    },
    {
      accessorKey: 'name',
      header: 'Malzeme Adı',
      cell: ({ row }) => <span className="font-bold text-admin-fg">{row.original.name}</span>
    },
    {
      accessorKey: 'category_slug',
      header: 'Kategori',
      cell: ({ row }) => (
        <span className="badge-admin badge-admin-default uppercase text-[10px]">
          {row.original.category_slug}
        </span>
      )
    },
    {
        accessorKey: 'type_code',
        header: 'Tip / Gramaj',
        cell: ({ row }) => (
          <div className="text-xs">
            <span className="font-semibold text-admin-accent">{row.original.type_code}</span>
            <span className="opacity-60 mx-1">|</span>
            <span>{row.original.weight_g} gr</span>
          </div>
        )
      },
    {
      id: 'actions',
      header: 'İşlem',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button 
            onClick={() => handleEdit(row.original)}
            className="p-1.5 rounded hover:bg-admin-info hover:text-white text-admin-info transition-colors"
          >
            <IoPencil />
          </button>
          <button 
            onClick={() => handleDelete(row.original.id)}
            className="p-1.5 rounded hover:bg-admin-danger hover:text-white text-admin-muted hover:opacity-100 transition-colors"
          >
            <IoTrash />
          </button>
        </div>
      )
    }
  ]

  // --- ACTIONS ---
  const handleEdit = (item: Material) => {
    setEditingItem(item)
    setForm(item)
    setIsPanelOpen(true)
  }

  const handleNew = () => {
    setEditingItem(null)
    setForm({ 
        category_slug: 'kagit', 
        unit: 'tabaka', 
        is_active: true,
        type_code: '',
        finish_type: 'mat'
    })
    setIsPanelOpen(true)
  }

  const handleDelete = async (id: number) => {
    if(!confirm('Silmek istediğine emin misin?')) return
    await deleteMaterialAction(id)
    router.refresh()
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    // Otomatik İsimlendirme (Eğer boşsa)
    const finalForm = { ...form }
    if (!finalForm.name && finalForm.category_slug === 'kagit') {
        finalForm.name = `${finalForm.weight_g}gr ${finalForm.finish_type === 'mat' ? 'Mat' : 'Parlak'} ${finalForm.type_code?.toUpperCase()}`
    }

    const res = await upsertMaterialAction(finalForm)
    setSaving(false)
    
    if (res.success) {
        setIsPanelOpen(false)
        router.refresh()
    } else {
        alert(res.message)
    }
  }

  return (
    <div className="h-full flex flex-col gap-4">
      {/* HEADER */}
      <div className="shrink-0 flex justify-between items-center bg-admin-card p-3 rounded-admin border border-admin-card-border shadow-sm">
        <h1 className="text-admin-lg font-bold flex items-center gap-2">
          <IoCube className="text-admin-accent" /> Malzeme Yönetimi
        </h1>
        <button onClick={handleNew} className="btn-admin btn-admin-primary text-admin-tiny gap-2">
          <IoAdd size={16} /> Yeni Malzeme
        </button>
      </div>

      {/* LISTE */}
      <div className="flex-1 bg-admin-card rounded-admin border border-admin-card-border overflow-hidden flex flex-col">
        <DataTable columns={columns} data={materials} searchKey="name" />
      </div>

      {/* FORM (SLIDEOVER) */}
      <SlideOver
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        title={editingItem ? 'Malzemeyi Düzenle' : 'Yeni Malzeme Girişi'}
        width="lg"
      >
        <form onSubmit={handleSave} className="space-y-6 p-1">
            
            {/* Kategori Seçimi */}
            <div>
                <label className="admin-label">Malzeme Kategorisi</label>
                <select 
                    className="admin-select"
                    value={form.category_slug}
                    onChange={(e) => setForm({...form, category_slug: e.target.value})}
                >
                    <option value="kagit">Kağıt (Tabaka)</option>
                    <option value="selefon">Selefon / Laminasyon</option>
                    <option value="baski-boyasi">Baskı Boyası</option>
                    <option value="diger">Diğer Sarf Malzeme</option>
                </select>
            </div>

            {/* Kağıt Detayları (Sadece Kağıt seçiliyse göster) */}
            {form.category_slug === 'kagit' && (
                <div className="p-4 border border-dashed border-admin-accent/30 bg-admin-accent/5 rounded-xl space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="admin-label">Kağıt Tipi (Kod)</label>
                            <select 
                                className="admin-select"
                                value={form.type_code}
                                onChange={(e) => setForm({...form, type_code: e.target.value})}
                            >
                                <option value="">Seçiniz</option>
                                <option value="kuse">Kuşe</option>
                                <option value="bristol">Amerikan Bristol</option>
                                <option value="1.hamur">1. Hamur</option>
                                <option value="tuale">Tuale Fantazi</option>
                                <option value="kraft">Kraft</option>
                                <option value="otokopi">Otokopi</option>
                            </select>
                        </div>
                        <div>
                            <label className="admin-label">Gramaj (gr/m²)</label>
                            <input 
                                type="number" 
                                className="admin-input"
                                placeholder="350"
                                value={form.weight_g || ''}
                                onChange={(e) => setForm({...form, weight_g: Number(e.target.value)})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="admin-label">Yüzey / Doku</label>
                        <select 
                             className="admin-select"
                             value={form.finish_type}
                             onChange={(e) => setForm({...form, finish_type: e.target.value})}
                        >
                            <option value="mat">Mat</option>
                            <option value="parlak">Parlak</option>
                            <option value="diger">Diğer / Dokulu</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Genel İsimlendirme */}
            <div>
                <label className="admin-label">
                    Malzeme Adı (Etiket)
                    <span className="opacity-50 text-[10px] ml-2 font-normal">Boş bırakılırsa otomatik oluşur.</span>
                </label>
                <input 
                    className="admin-input font-bold"
                    placeholder="Örn: 350gr Mat Kuşe (Özel)"
                    value={form.name || ''}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                />
            </div>

            {/* Maliyet ve Stok */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                     <label className="admin-label">Birim</label>
                     <select 
                        className="admin-select"
                        value={form.unit}
                        onChange={(e) => setForm({...form, unit: e.target.value})}
                     >
                        <option value="tabaka">Tabaka</option>
                        <option value="top">Top (Paket)</option>
                        <option value="kg">Kilogram</option>
                        <option value="m2">Metrekare</option>
                        <option value="adet">Adet</option>
                     </select>
                </div>
                <div>
                     <label className="admin-label">Birim Maliyet (TL)</label>
                     <input 
                        type="number" step="0.01"
                        className="admin-input"
                        value={form.cost_per_unit || ''}
                        onChange={(e) => setForm({...form, cost_per_unit: Number(e.target.value)})}
                     />
                </div>
            </div>

            {/* Kaydet Butonu */}
            <div className="pt-4 border-t border-admin-card-border flex justify-end">
                <button type="submit" disabled={saving} className="btn-admin btn-admin-primary px-8">
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
            </div>

        </form>
      </SlideOver>
    </div>
  )
}