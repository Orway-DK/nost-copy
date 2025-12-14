// C:\Projeler\nost-copy\app\admin\(protected)\showcase\landing\landing-page-client.tsx
'use client'

import { useState } from 'react'
import SlidesManager from './_components/SlidesManager'
import HighlightsManager from './_components/HighlightsManager'
import { IoImagesOutline, IoFlashOutline } from 'react-icons/io5'

export default function LandingPageClient ({
  initialSlides,
  initialHighlights
}: {
  initialSlides: any[]
  initialHighlights: any[]
}) {
  const [activeTab, setActiveTab] = useState<'slides' | 'highlights'>('slides')

  return (
    <div className='space-y-6'>
      {/* TABS */}
      <div className='flex border-b border-[var(--admin-card-border)] overflow-x-auto scrollbar-hide'>
        <button
          onClick={() => setActiveTab('slides')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors font-medium whitespace-nowrap ${
            activeTab === 'slides'
              ? 'border-[var(--admin-accent)] text-[var(--admin-accent)] bg-[var(--admin-input-bg)] rounded-t-lg'
              : 'border-transparent text-[var(--admin-muted)] hover:text-[var(--admin-fg)] hover:bg-[var(--admin-bg)]'
          }`}
        >
          <IoImagesOutline size={18} /> Ana Slider
        </button>
        <button
          onClick={() => setActiveTab('highlights')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors font-medium whitespace-nowrap ${
            activeTab === 'highlights'
              ? 'border-[var(--admin-accent)] text-[var(--admin-accent)] bg-[var(--admin-input-bg)] rounded-t-lg'
              : 'border-transparent text-[var(--admin-muted)] hover:text-[var(--admin-fg)] hover:bg-[var(--admin-bg)]'
          }`}
        >
          <IoFlashOutline size={18} /> Öne Çıkanlar (Highlights)
        </button>
      </div>

      {/* CONTENT */}
      <div className='animate-in fade-in slide-in-from-bottom-2 duration-300'>
        {activeTab === 'slides' && (
          <SlidesManager initialSlides={initialSlides} />
        )}
        {activeTab === 'highlights' && (
          <HighlightsManager initialItems={initialHighlights} />
        )}
      </div>
    </div>
  )
}
