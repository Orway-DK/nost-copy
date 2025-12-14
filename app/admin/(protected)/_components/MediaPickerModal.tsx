'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import {
  IoCloudUpload,
  IoImages,
  IoLink,
  IoClose,
  IoCheckmark
} from 'react-icons/io5'
import Image from 'next/image'

type MediaPickerProps = {
  isOpen: boolean
  onClose: () => void
  onSelect: (url: string) => void
  bucketName?: string
}

export default function MediaPickerModal ({
  isOpen,
  onClose,
  onSelect,
  bucketName = 'products'
}: MediaPickerProps) {
  const [activeTab, setActiveTab] = useState<'library' | 'upload' | 'link'>(
    'upload'
  )
  const [libraryImages, setLibraryImages] = useState<
    { name: string; url: string }[]
  >([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [linkInput, setLinkInput] = useState('')

  const containerRef = useRef<HTMLDivElement>(null)
  const supabase = createSupabaseBrowserClient()

  const fetchLibrary = async () => {
    setLoading(true)
    const { data, error } = await supabase.storage.from(bucketName).list('', {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' }
    })

    if (data) {
      const urls = data.map(file => {
        const { data: publicUrl } = supabase.storage
          .from(bucketName)
          .getPublicUrl(file.name)
        return { name: file.name, url: publicUrl.publicUrl }
      })
      setLibraryImages(urls)
    } else {
      console.error('Storage error:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (isOpen && activeTab === 'library') {
      fetchLibrary()
    }
  }, [isOpen, activeTab])

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    try {
      const fileName = `${Date.now()}-${slugifyFileName(file.name)}`
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file)

      if (error) throw error

      const { data: publicUrl } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName)
      onSelect(publicUrl.publicUrl)
      onClose()
    } catch (e: any) {
      alert('Yükleme hatası: ' + e.message)
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!isOpen) return
      const items = e.clipboardData?.items
      if (!items) return

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile()
          if (blob) handleFileUpload(blob)
        }
      }
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [isOpen])

  function slugifyFileName (name: string) {
    const parts = name.split('.')
    const ext = parts.pop()
    const base = parts.join('.').replace(/[^a-zA-Z0-9]/g, '-')
    return `${base}.${ext}`
  }

  // ENTER TUŞUNU YAKALA (Form submitini engelle)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
      if (activeTab === 'link' && linkInput) {
        onSelect(linkInput)
        onClose()
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200'>
      <div
        ref={containerRef}
        onKeyDown={handleKeyDown}
        className='bg-[var(--admin-card)] rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-[var(--admin-card-border)]'
      >
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-[var(--admin-card-border)] bg-[var(--admin-bg)]'>
          <h3 className='text-lg font-bold text-[var(--admin-fg)]'>
            Medya Yöneticisi
          </h3>
          <button
            type='button'
            onClick={onClose}
            className='p-2 hover:bg-[var(--admin-input-bg)] rounded-full transition-colors'
          >
            <IoClose size={24} className='text-[var(--admin-muted)]' />
          </button>
        </div>

        {/* Tabs */}
        <div className='flex border-b border-[var(--admin-card-border)] bg-[var(--admin-card)]'>
          <button
            type='button'
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-[var(--admin-accent)] text-[var(--admin-fg)] bg-[var(--admin-input-bg)]'
                : 'border-transparent text-[var(--admin-muted)] hover:bg-[var(--admin-bg)]'
            }`}
          >
            <IoCloudUpload size={18} /> Yükle
          </button>
          <button
            type='button'
            onClick={() => setActiveTab('library')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'library'
                ? 'border-[var(--admin-accent)] text-[var(--admin-fg)] bg-[var(--admin-input-bg)]'
                : 'border-transparent text-[var(--admin-muted)] hover:bg-[var(--admin-bg)]'
            }`}
          >
            <IoImages size={18} /> Kütüphane
          </button>
          <button
            type='button'
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'link'
                ? 'border-[var(--admin-accent)] text-[var(--admin-fg)] bg-[var(--admin-input-bg)]'
                : 'border-transparent text-[var(--admin-muted)] hover:bg-[var(--admin-bg)]'
            }`}
          >
            <IoLink size={18} /> Bağlantı
          </button>
        </div>

        {/* Content */}
        <div className='p-6 overflow-y-auto flex-1 bg-[var(--admin-bg)]'>
          {/* 1. UPLOAD TAB */}
          {activeTab === 'upload' && (
            <div className='h-full flex flex-col items-center justify-center border-2 border-dashed border-[var(--admin-input-border)] rounded-xl p-8 bg-[var(--admin-card)] text-center transition-colors hover:border-[var(--admin-accent)]'>
              <IoCloudUpload className='text-6xl text-[var(--admin-muted)] mb-4 opacity-50' />
              <p className='text-[var(--admin-fg)] font-medium mb-1'>
                Dosya Yükle
              </p>
              <p className='text-[var(--admin-muted)] text-sm mb-6'>
                Sürükleyip bırakın veya seçin (Ctrl+V)
              </p>
              <label className='btn-admin btn-admin-primary cursor-pointer'>
                <span>Bilgisayardan Seç</span>
                <input
                  type='file'
                  className='hidden'
                  accept='image/*'
                  onChange={e =>
                    e.target.files?.[0] && handleFileUpload(e.target.files[0])
                  }
                  disabled={uploading}
                />
              </label>
              {uploading && (
                <p className='mt-4 text-sm text-[var(--admin-info)] animate-pulse'>
                  Yükleniyor...
                </p>
              )}
            </div>
          )}

          {/* 2. LIBRARY TAB */}
          {activeTab === 'library' && (
            <div>
              {loading ? (
                <div className='text-center py-12 text-[var(--admin-muted)]'>
                  Görseller yükleniyor...
                </div>
              ) : libraryImages.length === 0 ? (
                <div className='text-center py-12 text-[var(--admin-muted)]'>
                  Henüz görsel yok.
                </div>
              ) : (
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
                  {libraryImages.map(img => (
                    <div
                      key={img.name}
                      onClick={() => {
                        onSelect(img.url)
                        onClose()
                      }}
                      className='group relative aspect-square bg-[var(--admin-card)] border border-[var(--admin-card-border)] rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-[var(--admin-accent)] transition-all'
                    >
                      <Image
                        src={img.url}
                        alt={img.name}
                        fill
                        className='object-cover'
                        sizes='200px'
                      />
                      <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center'>
                        <IoCheckmark className='text-white opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100 transition-all text-3xl drop-shadow-md' />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. LINK TAB */}
          {activeTab === 'link' && (
            <div className='flex flex-col gap-4 max-w-lg mx-auto mt-8'>
              <label className='admin-label'>Görsel Bağlantısı (URL)</label>
              <div className='flex gap-2'>
                <input
                  className='admin-input flex-1'
                  placeholder='https://example.com/image.png'
                  value={linkInput}
                  onChange={e => setLinkInput(e.target.value)}
                />
                <button
                  type='button'
                  className='btn-admin btn-admin-primary'
                  onClick={() => {
                    if (linkInput) {
                      onSelect(linkInput)
                      onClose()
                    }
                  }}
                >
                  Ekle
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
