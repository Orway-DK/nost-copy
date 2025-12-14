// C:\Projeler\nost-copy\app\admin\(protected)\settings\social\page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { SlPlus, SlTrash, SlMenu, SlCheck } from 'react-icons/sl'

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

export default function SocialSettingsPage () {
  const supabase = createSupabaseBrowserClient()
  const [links, setLinks] = useState<SocialLink[]>([])
  const [loading, setLoading] = useState(true)
  const [settingsId, setSettingsId] = useState<number | null>(null)

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
      window.location.reload()
    }
  }

  if (loading)
    return (
      <div className='text-center p-10 text-[var(--admin-muted)]'>
        Yükleniyor...
      </div>
    )

  return (
    <div className='card-admin w-full pb-20'>
      <div className='flex justify-between items-center mb-6'>
        <h3 className='text-lg font-bold text-[var(--admin-fg)]'>
          Sosyal Medya Hesapları
        </h3>
        <button
          onClick={handleSaveAll}
          className='btn-admin btn-admin-primary gap-2'
        >
          <SlCheck /> Kaydet
        </button>
      </div>

      <div className='table-responsive border border-[var(--admin-card-border)] rounded-lg'>
        <table className='w-full text-left'>
          <thead className='bg-[var(--admin-input-bg)] text-[var(--admin-muted)] border-b border-[var(--admin-card-border)]'>
            <tr>
              <th className='p-3 w-10 text-center'>#</th>
              <th className='p-3 w-20 text-center'>Aktif</th>
              <th className='p-3 w-40'>Platform</th>
              <th className='p-3'>URL</th>
              <th className='p-3 w-16 text-center'>Sil</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-[var(--admin-card-border)]'>
            {links.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className='p-6 text-center text-[var(--admin-muted)]'
                >
                  Hesap eklenmemiş.
                </td>
              </tr>
            )}
            {links.map(link => (
              <tr key={link.id} className='hover:bg-[var(--admin-bg)]'>
                <td className='p-3 text-center'>
                  <SlMenu className='mx-auto text-[var(--admin-muted)] cursor-move' />
                </td>
                <td className='p-3 text-center'>
                  <input
                    type='checkbox'
                    checked={link.active}
                    onChange={e =>
                      handleChange(link.id, 'active', e.target.checked)
                    }
                    className='w-5 h-5 accent-[var(--admin-success)]'
                  />
                </td>
                <td className='p-3'>
                  <select
                    className='admin-select capitalize'
                    value={link.code}
                    onChange={e =>
                      handleChange(link.id, 'code', e.target.value)
                    }
                  >
                    {PLATFORMS.map(p => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                    <option value='other'>Diğer</option>
                  </select>
                </td>
                <td className='p-3'>
                  <input
                    className='admin-input'
                    placeholder='https://...'
                    value={link.url || ''}
                    onChange={e => handleChange(link.id, 'url', e.target.value)}
                  />
                </td>
                <td className='p-3 text-center'>
                  <button
                    onClick={() => handleDelete(link.id)}
                    className='btn-admin btn-admin-danger p-2'
                  >
                    <SlTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={handleAdd}
        className='mt-4 btn-admin btn-admin-secondary w-full border-dashed gap-2'
      >
        <SlPlus /> Yeni Hesap Ekle
      </button>
    </div>
  )
}
