'use client'

import { useState, useCallback, useEffect } from 'react'
import { IoClose, IoCloudUploadOutline, IoLinkOutline } from 'react-icons/io5'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'

export default function ImageUploadModal ({
  onClose,
  onSelect,
  bucket
}: {
  onClose: () => void
  onSelect: (url: string) => void
  bucket: 'products' | 'services'
}) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState('')

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/'))
      return toast.error('Sadece görsel yüklenebilir.')

    setUploading(true)
    const supabase = createSupabaseBrowserClient()
    const fileName = `${Date.now()}-${file.name}`

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file)

    if (error) {
      toast.error('Yükleme hatası: ' + error.message)
      setUploading(false)
      return
    }

    const {
      data: { publicUrl }
    } = supabase.storage.from(bucket).getPublicUrl(data.path)
    onSelect(publicUrl)
    toast.success('Görsel yüklendi!')
    onClose()
  }

  const uploadFromUrl = async (url: string) => {
    setUploading(true)
    const supabase = createSupabaseBrowserClient()
    
    try {
      // Fetch the image from URL with CORS handling
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }).catch(() => {
        throw new Error('CORS hatası: Görsel sunucusu erişime izin vermiyor. Lütfen görseli bilgisayarınıza indirip yükleyin.')
      })
      
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      
      const blob = await response.blob()
      if (!blob.type.startsWith('image/')) {
        throw new Error('URL bir görsele işaret etmiyor.')
      }
      
      // Extract filename from URL or generate
      const urlObj = new URL(url)
      const filename = urlObj.pathname.split('/').pop() || `image-${Date.now()}`
      const fileExt = filename.split('.').pop() || 'jpg'
      const fileName = `${Date.now()}-${filename.substring(0, 50)}.${fileExt}`
      
      // Convert blob to File
      const file = new File([blob], fileName, { type: blob.type })
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file)

      if (error) throw error

      const {
        data: { publicUrl }
      } = supabase.storage.from(bucket).getPublicUrl(data.path)
      
      onSelect(publicUrl)
      toast.success('Görsel URL\'den yüklendi!')
      onClose()
    } catch (err: any) {
      toast.error('URL\'den yükleme hatası: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files?.[0]) handleUpload(e.dataTransfer.files[0])
  }

  // Clipboard paste handler
  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    // Look for image in clipboard
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) {
          handleUpload(file)
          return
        }
      }
    }

    // Look for text (URL) in clipboard
    for (const item of items) {
      if (item.type === 'text/plain') {
        item.getAsString(async (text) => {
          // Check if text is a URL
          try {
            new URL(text)
            // It's a URL, set to input
            setUrlInput(text)
            toast('URL clipboard\'dan alındı. "URL\'den Yükle" butonuna tıklayın.', { icon: '📋' })
          } catch {
            // Not a URL, ignore
          }
        })
        break
      }
    }
  }, [handleUpload])

  useEffect(() => {
    // Add paste event listener
    document.addEventListener('paste', handlePaste)
    return () => {
      document.removeEventListener('paste', handlePaste)
    }
  }, [handlePaste])

  return (
    <div className='fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in'>
      <div className='bg-[var(--admin-card)] w-full max-w-md rounded-2xl shadow-2xl border border-[var(--admin-card-border)] overflow-hidden'>
        <div className='p-4 border-b border-[var(--admin-card-border)] flex justify-between items-center bg-[var(--admin-input-bg)]'>
          <h3 className='font-bold'>Görsel Yükle ({bucket})</h3>
          <button
            onClick={onClose}
            className='p-1 hover:bg-black/10 rounded-full'
          >
            <IoClose size={20} />
          </button>
        </div>

        <div className='p-6 space-y-4'>
          {/* Drag & Drop Area */}
          <div
            onDragOver={e => {
              e.preventDefault()
              setDragActive(true)
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              dragActive
                ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                : 'border-[var(--admin-card-border)]'
            }`}
          >
            {uploading ? (
              <div className='animate-pulse text-[var(--primary)] font-bold'>
                Yükleniyor...
              </div>
            ) : (
              <label className='cursor-pointer'>
                <IoCloudUploadOutline
                  size={40}
                  className='mx-auto mb-2 opacity-50'
                />
                <p className='text-sm font-medium'>
                  Dosyayı buraya sürükleyin veya{' '}
                  <span className='text-[var(--primary)]'>seçin</span>
                </p>
                <input
                  type='file'
                  className='hidden'
                  onChange={e =>
                    e.target.files?.[0] && handleUpload(e.target.files[0])
                  }
                />
              </label>
            )}
          </div>

          <div className='relative flex items-center gap-2'>
            <div className='h-[1px] flex-1 bg-[var(--admin-card-border)]'></div>
            <span className='text-[10px] font-bold opacity-30'>VEYA</span>
            <div className='h-[1px] flex-1 bg-[var(--admin-card-border)]'></div>
          </div>

          <p className='text-[9px] text-center text-[var(--admin-muted)]'>
            💡 <strong>Ctrl+V</strong> ile clipboard'dan resim veya URL yapıştırabilirsiniz.
          </p>

          {/* URL Input */}
          <div className='flex gap-2'>
            <div className='flex-1 relative'>
              <IoLinkOutline className='absolute left-3 top-1/2 -translate-y-1/2 opacity-40' />
              <input
                className='admin-input w-full pl-10 text-xs'
                placeholder='Görsel URL yapıştır...'
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && urlInput) {
                    uploadFromUrl(urlInput)
                  }
                }}
              />
            </div>
            <button
              onClick={() => {
                if (urlInput) {
                  // Eğer URL zaten Supabase storage'dan ise direkt kullan
                  if (urlInput.includes('supabase.co/storage/v1/object/public/')) {
                    onSelect(urlInput)
                    onClose()
                  } else {
                    // Değilse URL'den yükle
                    uploadFromUrl(urlInput)
                  }
                }
              }}
              disabled={uploading}
              className='bg-[var(--admin-fg)] text-[var(--admin-card)] px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50'
            >
              {uploading ? 'Yükleniyor...' : 'URL\'den Yükle'}
            </button>
          </div>
          <p className='text-[9px] text-[var(--admin-muted)] text-center'>
            URL'den yüklenen görseller Supabase Storage'a yüklenir ve Next.js Image ile uyumlu hale gelir.
          </p>
        </div>
      </div>
    </div>
  )
}
