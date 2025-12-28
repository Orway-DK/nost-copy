'use client'

import { useState, useEffect } from 'react'
import { IoAdd } from 'react-icons/io5'
import { TemplateField, ProductTemplate } from '@/types'
import { upsertTemplateAction } from '@/app/admin/actions/template-actions'
import { toast } from 'react-hot-toast'

// --- DND KIT IMPORTS ---
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { SortableFieldRow } from './sortable-field-row'; // Yeni bileşeni import et

interface TemplateFormProps {
  initialData?: ProductTemplate | null
  onSuccess: () => void
  onCancel: () => void
}

export default function TemplateForm({
  initialData,
  onSuccess,
  onCancel
}: TemplateFormProps) {
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [fields, setFields] = useState<TemplateField[]>([])

  // --- DND SENSORS ---
  // PointerSensor (Mouse/Touch) ve Keyboard (Erişilebilirlik) tanımları
  const sensors = useSensors(
    useSensor(PointerSensor, {
        // Butonlara tıklamayı engellememesi için 5px hareket şartı koyuyoruz
        activationConstraint: {
            distance: 5,
        },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // --- BAŞLANGIÇ VERİSİ ---
  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      // Eski verilerde ID yoksa, onlara geçici ID ata
      const migratedFields = (initialData.schema || []).map(f => ({
        ...f,
        id: f.id || crypto.randomUUID() // ID yoksa oluştur
      }))
      setFields(migratedFields)
    } else {
      setName('')
      setFields([])
    }
  }, [initialData])

  // --- DRAG END (SIRALAMA BİTTİĞİNDE) ---
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  // --- YENİ ALAN EKLEME ---
  const addField = () => {
    setFields([
      ...fields,
      { 
        id: crypto.randomUUID(), // Benzersiz ID oluştur
        key: '', 
        label: '', 
        type: 'text', 
        required: false, 
        options: [] 
      }
    ])
  }

  // --- GÜNCELLEME ---
  const updateField = (index: number, key: keyof TemplateField, value: any) => {
    const newFields = [...fields]
    // @ts-ignore
    newFields[index][key] = value
    setFields(newFields)
  }

  // --- SİLME ---
  const removeField = (index: number) => {
    if(!confirm('Bu alanı silmek istediğinize emin misiniz?')) return;
    setFields(fields.filter((_, i) => i !== index))
  }

  // --- KAYDETME ---
  const handleSave = async () => {
    if (!name) return toast.error('Şablon adı giriniz.')
    if (fields.some(f => !f.key || !f.label))
      return toast.error('Tüm alanların Etiket ve Key değerleri dolu olmalıdır.')

    setSaving(true)
    const res = await upsertTemplateAction({
      id: initialData?.id,
      name,
      schema: fields // Artık sıralanmış ve ID'li şekilde gidiyor
    })
    setSaving(false)

    if (res.success) {
      toast.success('Şablon kaydedildi.')
      onSuccess()
    } else {
      toast.error('Hata: ' + res.message)
    }
  }

  return (
    <div className='flex flex-col h-full'>
      {/* İÇERİK (Scrollable) */}
      <div className='flex-1 overflow-y-auto p-6 space-y-6'>
        
        {/* ŞABLON ADI */}
        <div className='bg-admin-input-bg p-4 rounded-admin border border-admin-input-border'>
          <label className='admin-label text-admin-base mb-2'>
            Şablon Adı
          </label>
          <input
            className='admin-input font-bold text-admin-base'
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder='Örn: Kartvizit, Kupa'
          />
        </div>

        {/* ALANLAR LİSTESİ */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between sticky top-0 bg-admin-card z-10 py-2'>
            <h4 className='font-semibold text-admin-muted text-admin-sm uppercase tracking-wide'>
              Özellik Alanları (Sıralanabilir)
            </h4>
            <button
              onClick={addField}
              className='btn-admin btn-admin-secondary text-admin-tiny gap-1 h-8'
            >
              <IoAdd /> Alan Ekle
            </button>
          </div>

          <div className='pb-20'>
            {/* DND CONTEXT WRAPPER */}
            <DndContext 
                sensors={sensors} 
                collisionDetection={closestCenter} 
                onDragEnd={handleDragEnd}
            >
                <SortableContext 
                    items={fields.map(f => f.id)} 
                    strategy={verticalListSortingStrategy}
                >
                    {fields.map((field, idx) => (
                        <SortableFieldRow 
                            key={field.id} 
                            field={field} 
                            index={idx}
                            onUpdate={updateField}
                            onRemove={removeField}
                        />
                    ))}
                </SortableContext>
            </DndContext>

            {fields.length === 0 && (
              <div className='text-center py-10 opacity-50 border-2 border-dashed border-admin-input-border rounded-admin bg-admin-bg'>
                <p className='text-admin-sm'>Henüz özellik alanı eklenmedi.</p>
                <p className='text-admin-tiny'>"Alan Ekle" butonuna basarak başlayın.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className='shrink-0 p-4 border-t border-admin-card-border bg-admin-card flex justify-end gap-3'>
         <button
            onClick={onCancel}
            className='btn-admin btn-admin-secondary text-admin-sm'
         >
            Vazgeç
         </button>
         <button
            onClick={handleSave}
            disabled={saving}
            className='btn-admin btn-admin-primary text-admin-sm w-32'
         >
            {saving ? '...' : 'Kaydet'}
         </button>
      </div>
    </div>
  )
}