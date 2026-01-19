'use client'

import { useState, useEffect } from 'react'
import { IoClose, IoAdd, IoPencil, IoTrash } from 'react-icons/io5'
import { toast } from 'react-hot-toast'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

type Template = {
  id?: number
  name: string
  slug: string
  component_path: string
  active: boolean
}

type Props = {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate?: (slug: string) => void
}

export default function TemplateManagerModal ({ isOpen, onClose, onSelectTemplate }: Props) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [form, setForm] = useState<Template>({ name: '', slug: '', component_path: '', active: true })
  const [loading, setLoading] = useState(false)
  const supabase = createSupabaseBrowserClient()

  // Modal açıldığında verileri çek
  useEffect(() => {
    if (!isOpen) return

    const fetchTemplates = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('manual_page_templates')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        toast.error('Template\'ler yüklenemedi: ' + error.message)
      } else {
        setTemplates(data || [])
      }
      setLoading(false)
    }

    fetchTemplates()
    setEditingTemplate(null)
    setForm({ name: '', slug: '', component_path: '', active: true })
  }, [isOpen, supabase])

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim() || !form.component_path.trim()) {
      toast.error('Lütfen tüm alanları doldurun.')
      return
    }

    setLoading(true)
    try {
      if (editingTemplate && editingTemplate.id) {
        // Düzenleme
        const { error } = await supabase
          .from('manual_page_templates')
          .update({
            name: form.name,
            slug: form.slug,
            component_path: form.component_path,
            active: form.active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingTemplate.id)

        if (error) throw error
        toast.success('Template güncellendi.')
      } else {
        // Yeni ekle
        const { error } = await supabase
          .from('manual_page_templates')
          .insert({
            name: form.name,
            slug: form.slug,
            component_path: form.component_path,
            active: form.active
          })

        if (error) throw error
        toast.success('Template eklendi.')
      }

      // Listeyi yenile
      const { data } = await supabase
        .from('manual_page_templates')
        .select('*')
        .order('created_at', { ascending: false })
      setTemplates(data || [])

      setEditingTemplate(null)
      setForm({ name: '', slug: '', component_path: '', active: true })
    } catch (error: any) {
      toast.error('Hata: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bu template\'i silmek istediğinize emin misiniz?')) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('manual_page_templates')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Listeyi güncelle
      setTemplates(prev => prev.filter(t => t.id !== id))
      toast.success('Template silindi.')
    } catch (error: any) {
      toast.error('Hata: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (slug: string) => {
    if (onSelectTemplate) {
      onSelectTemplate(slug)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-[200]'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={onClose} />

      {/* Modal */}
      <div className='absolute inset-0 flex items-center justify-center p-4'>
        <div className='w-full max-w-4xl bg-[var(--admin-card)] rounded-2xl shadow-2xl border border-[var(--admin-card-border)] flex flex-col max-h-[90vh]'>
          {/* Header */}
          <div className='p-6 border-b border-[var(--admin-card-border)] flex justify-between items-center'>
            <h2 className='text-xl font-bold'>Template Yönetimi</h2>
            <button onClick={onClose} className='p-2 hover:bg-[var(--admin-input-bg)] rounded-lg'>
              <IoClose size={24} />
            </button>
          </div>

          {/* Content */}
          <div className='flex-1 overflow-y-auto p-6'>
            {/* Form */}
            <div className='bg-[var(--admin-input-bg)] p-6 rounded-xl mb-8'>
              <h3 className='font-bold mb-4'>{editingTemplate ? 'Template Düzenle' : 'Yeni Template Ekle'}</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='text-xs font-bold uppercase opacity-60 mb-1 block'>Template Adı</label>
                  <input
                    type='text'
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className='admin-input w-full'
                    placeholder='Örn: Grafik Tasarım'
                  />
                </div>
                <div>
                  <label className='text-xs font-bold uppercase opacity-60 mb-1 block'>Slug (Teknik Ad)</label>
                  <input
                    type='text'
                    value={form.slug}
                    onChange={e => setForm({ ...form, slug: e.target.value })}
                    className='admin-input w-full'
                    placeholder='Örn: grafik-tasarim'
                  />
                </div>
                <div className='md:col-span-2'>
                  <label className='text-xs font-bold uppercase opacity-60 mb-1 block'>Component Path</label>
                  <input
                    type='text'
                    value={form.component_path}
                    onChange={e => setForm({ ...form, component_path: e.target.value })}
                    className='admin-input w-full'
                    placeholder='Örn: app/(site)/[slug]/manual_pages/graphic-design/page'
                  />
                  <p className='text-[10px] mt-1 text-[var(--admin-muted)]'>
                    Bu path, template component'inin dosya yoludur. Dynamic import için kullanılır.
                  </p>
                </div>
                <div className='flex items-center gap-3'>
                  <input
                    type='checkbox'
                    id='active'
                    checked={form.active}
                    onChange={e => setForm({ ...form, active: e.target.checked })}
                    className='w-4 h-4'
                  />
                  <label htmlFor='active' className='text-sm'>Aktif</label>
                </div>
              </div>
              <div className='flex justify-end gap-3 mt-6'>
                {editingTemplate && (
                  <button
                    type='button'
                    onClick={() => {
                      setEditingTemplate(null)
                      setForm({ name: '', slug: '', component_path: '', active: true })
                    }}
                    className='btn-admin btn-admin-secondary'
                  >
                    İptal
                  </button>
                )}
                <button
                  type='button'
                  onClick={handleSave}
                  className='btn-admin btn-admin-primary'
                >
                  {editingTemplate ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </div>

            {/* Liste */}
            <div>
              <h3 className='font-bold mb-4'>Mevcut Template'ler</h3>
              <div className='space-y-3'>
                {templates.map(t => (
                  <div
                    key={t.id}
                    className='bg-[var(--admin-card)] border border-[var(--admin-card-border)] rounded-xl p-4 flex justify-between items-center'
                  >
                    <div>
                      <div className='font-bold'>{t.name}</div>
                      <div className='text-xs text-[var(--admin-muted)] font-mono'>{t.slug}</div>
                      <div className='text-xs text-[var(--admin-muted)]'>{t.component_path}</div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${t.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {t.active ? 'AKTİF' : 'PASİF'}
                      </span>
                    </div>
                    <div className='flex gap-2'>
                      <button
                        type='button'
                        onClick={() => handleSelect(t.slug)}
                        className='p-2 text-blue-500 hover:bg-blue-50 rounded-lg'
                        title="Bu template'i seç"
                      >
                        Seç
                      </button>
                      <button
                        type='button'
                        onClick={() => {
                          setEditingTemplate(t)
                          setForm(t)
                        }}
                        className='p-2 text-yellow-500 hover:bg-yellow-50 rounded-lg'
                        title='Düzenle'
                      >
                        <IoPencil size={18} />
                      </button>
                      <button
                        type='button'
                        onClick={() => t.id && handleDelete(t.id)}
                        className='p-2 text-red-500 hover:bg-red-50 rounded-lg'
                        title='Sil'
                      >
                        <IoTrash size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className='p-6 border-t border-[var(--admin-card-border)] flex justify-end'>
            <button
              type='button'
              onClick={onClose}
              className='btn-admin btn-admin-secondary'
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
