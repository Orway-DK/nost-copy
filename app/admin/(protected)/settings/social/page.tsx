// C:\Projeler\nost-copy\app\admin\(protected)\social\page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import {
  SlPlus,
  SlTrash,
  SlMenu,
  SlCheck,
  SlSocialFacebook,
  SlSocialInstagram,
  SlSocialTwitter,
  SlSocialLinkedin,
  SlSocialYoutube,
  SlLink
} from 'react-icons/sl'
import { FaWhatsapp, FaPinterest, FaTiktok } from 'react-icons/fa'

// --- DND KIT IMPORTS ---
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const PLATFORMS = [
  'facebook',
  'instagram',
  'twitter',
  'linkedin',
  'youtube',
  'whatsapp',
  'pinterest',
  'tiktok'
]

type SocialLink = {
  id: string
  settings_id?: number
  code: string
  url: string | null
  active: boolean
  sort: number
}

// Platform İkon Helper
const getPlatformIcon = (code: string) => {
  switch (code) {
    case 'facebook':
      return <SlSocialFacebook className='text-blue-600' />
    case 'instagram':
      return <SlSocialInstagram className='text-pink-600' />
    case 'twitter':
      return <SlSocialTwitter className='text-sky-500' />
    case 'linkedin':
      return <SlSocialLinkedin className='text-blue-700' />
    case 'youtube':
      return <SlSocialYoutube className='text-red-600' />
    case 'whatsapp':
      return <FaWhatsapp className='text-green-500' />
    case 'pinterest':
      return <FaPinterest className='text-red-500' />
    case 'tiktok':
      return <FaTiktok className='text-black dark:text-white' />
    default:
      return <SlLink className='text-gray-500' />
  }
}

// --- SORTABLE ROW COMPONENT ---
function SortableRow ({
  link,
  onDelete,
  onChange
}: {
  link: SocialLink
  onDelete: (id: string) => void
  onChange: (id: string, field: keyof SocialLink, value: any) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: link.id })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
    position: isDragging ? ('relative' as const) : undefined,
    boxShadow: isDragging ? '0 10px 30px rgba(0,0,0,0.1)' : 'none',
    backgroundColor: isDragging ? 'var(--admin-input-bg)' : undefined
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`group transition-colors hover:bg-[var(--admin-input-bg)] h-12 ${
        isDragging ? 'opacity-90' : ''
      }`}
    >
      {/* 1. Sürükle (Handle) */}
      <td
        {...attributes}
        {...listeners}
        className='py-1.5 px-4 text-center cursor-grab active:cursor-grabbing text-[var(--admin-muted)] hover:text-[var(--admin-fg)] touch-none'
      >
        <SlMenu className='mx-auto' />
      </td>

      {/* 2. Aktif/Pasif Toggle */}
      <td className='py-1.5 px-4 text-center align-middle'>
        <div className='flex justify-center'>
          <label className='relative inline-flex items-center cursor-pointer'>
            <input
              type='checkbox'
              className='sr-only peer'
              checked={link.active}
              onChange={e => onChange(link.id, 'active', e.target.checked)}
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-[var(--admin-success)]"></div>
          </label>
        </div>
      </td>

      {/* 3. Platform Select */}
      <td className='py-1.5 px-4 align-middle'>
        <div className='relative w-full'>
          <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-lg z-10'>
            {getPlatformIcon(link.code)}
          </div>
          <select
            className='w-full pl-11 pr-8 py-2 text-sm capitalize bg-transparent border border-transparent rounded hover:border-[var(--admin-input-border)] focus:bg-[var(--admin-bg)] focus:border-[var(--admin-accent)] outline-none transition-all cursor-pointer appearance-none'
            value={link.code}
            onChange={e => onChange(link.id, 'code', e.target.value)}
          >
            {PLATFORMS.map(p => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
            <option value='other'>Diğer</option>
          </select>
        </div>
      </td>

      {/* 4. URL Input */}
      <td className='py-1.5 px-4 align-middle'>
        <input
          className='w-full py-2 px-3 text-sm bg-transparent border border-transparent rounded hover:border-[var(--admin-input-border)] focus:bg-[var(--admin-bg)] focus:border-[var(--admin-accent)] outline-none transition-all placeholder:text-[var(--admin-muted)]/50'
          placeholder='https://...'
          value={link.url || ''}
          onChange={e => onChange(link.id, 'url', e.target.value)}
        />
      </td>

      {/* 5. Sil Butonu */}
      <td className='py-1.5 px-4 text-center align-middle'>
        <button
          onClick={() => onDelete(link.id)}
          // DÜZELTME: Opacity sınıfları kaldırıldı, artık her zaman görünür.
          className='p-2 rounded text-[var(--admin-muted)] hover:bg-[var(--admin-bg)] hover:text-[var(--admin-danger)] transition-colors'
          title='Sil'
        >
          <SlTrash />
        </button>
      </td>
    </tr>
  )
}

// --- ANA SAYFA ---
export default function SocialSettingsPage () {
  const supabase = createSupabaseBrowserClient()
  const [links, setLinks] = useState<SocialLink[]>([])
  const [loading, setLoading] = useState(true)
  const [settingsId, setSettingsId] = useState<number | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data: settings } = await supabase
        .from('site_settings')
        .select('id')
        .limit(1)
        .maybeSingle()
      if (!settings) {
        toast.error('Lütfen önce Genel Ayarları kaydedin.')
        setLoading(false)
        return
      }
      setSettingsId(settings.id)
      const { data: socialData } = await supabase
        .from('site_social_links')
        .select('*')
        .eq('settings_id', settings.id)
        .order('sort', { ascending: true })
      if (socialData) {
        const formattedLinks = socialData.map((link: any) => ({
          ...link,
          id: link.id.toString()
        }))
        setLinks(formattedLinks)
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setLinks(items => {
        const oldIndex = items.findIndex(item => item.id === active.id)
        const newIndex = items.findIndex(item => item.id === over.id)
        const newArray = arrayMove(items, oldIndex, newIndex)
        return newArray.map((item, index) => ({ ...item, sort: index }))
      })
    }
  }

  const handleAdd = () => {
    const newSort =
      links.length > 0 ? Math.max(...links.map(l => l.sort)) + 1 : 0
    const newLink: SocialLink = {
      id: `temp-${Date.now()}`,
      code: 'instagram',
      url: '',
      active: true,
      sort: newSort
    }
    setLinks([...links, newLink])
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Silmek istediğinize emin misiniz?')) return
    if (!id.startsWith('temp-'))
      await supabase.from('site_social_links').delete().eq('id', id)
    setLinks(prev => prev.filter(l => l.id !== id))
  }

  const handleChange = (id: string, field: keyof SocialLink, value: any) => {
    setLinks(prev =>
      prev.map(l => (l.id === id ? { ...l, [field]: value } : l))
    )
  }

  const handleSaveAll = async () => {
    if (!settingsId) return
    const toastId = toast.loading('Kaydediliyor...')
    const cleanLinks = links.map(l => ({
      id: l.id.startsWith('temp-') ? undefined : parseInt(l.id),
      settings_id: settingsId,
      code: l.code,
      url: l.url,
      active: l.active,
      sort: l.sort
    }))
    const { error } = await supabase
      .from('site_social_links')
      .upsert(cleanLinks)
    if (error) toast.error(error.message, { id: toastId })
    else {
      toast.success('Güncellendi!', { id: toastId })
    }
  }

  if (loading)
    return (
      <div className='text-center p-10 text-[var(--admin-muted)]'>
        Yükleniyor...
      </div>
    )

  return (
    <div className='w-full space-y-6 pb-20'>
      {/* HEADER */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--admin-card-border)] pb-4'>
        <div>
          <h1 className='text-2xl font-bold text-[var(--admin-fg)]'>
            Sosyal Medya
          </h1>
          <p className='text-sm text-[var(--admin-muted)]'>
            Site genelinde kullanılacak sosyal medya bağlantıları.
          </p>
        </div>
        <button
          onClick={handleSaveAll}
          className='btn-admin btn-admin-primary gap-2 shadow-sm'
        >
          <SlCheck /> Kaydet
        </button>
      </div>

      {/* TABLO ALANI */}
      <div className='bg-[var(--admin-card)] border border-[var(--admin-card-border)] rounded-xl shadow-sm overflow-hidden'>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className='w-full text-left border-collapse'>
            <thead className='bg-[var(--admin-input-bg)] text-xs uppercase font-semibold text-[var(--admin-muted)] border-b border-[var(--admin-card-border)]'>
              <tr>
                <th className='py-2 px-4 w-12 text-center'>#</th>
                <th className='py-2 px-4 w-20 text-center'>Durum</th>
                <th className='py-2 px-4 w-64'>Platform</th>
                <th className='py-2 px-4'>Bağlantı (URL)</th>
                <th className='py-2 px-4 w-16 text-center'>Sil</th>
              </tr>
            </thead>

            <tbody className='divide-y divide-[var(--admin-card-border)] text-sm'>
              <SortableContext
                items={links.map(l => l.id)}
                strategy={verticalListSortingStrategy}
              >
                {links.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className='p-8 text-center text-[var(--admin-muted)] italic'
                    >
                      Henüz hesap eklenmemiş.
                    </td>
                  </tr>
                )}

                {links.map(link => (
                  <SortableRow
                    key={link.id}
                    link={link}
                    onDelete={handleDelete}
                    onChange={handleChange}
                  />
                ))}
              </SortableContext>
            </tbody>
          </table>
        </DndContext>

        <button
          onClick={handleAdd}
          className='w-full py-2.5 flex items-center justify-center gap-2 text-sm font-medium text-[var(--admin-muted)] hover:text-[var(--admin-primary)] hover:bg-[var(--admin-bg)] transition-colors border-t border-[var(--admin-card-border)] border-dashed'
        >
          <SlPlus /> Yeni Hesap Ekle
        </button>
      </div>
    </div>
  )
}
