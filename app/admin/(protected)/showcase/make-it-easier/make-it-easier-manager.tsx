// C:\Projeler\nost-copy\app\admin\(protected)\showcase\make-it-easier\make-it-easier-manager.tsx
'use client'

import { useState } from 'react'
import MainSectionForm from './main-section-form'
import SliderSectionForm from './slider-section-form'
import { IoFlashOutline, IoImagesOutline } from 'react-icons/io5'

export default function MakeItEasierManager ({
  initialSection,
  initialSlider
}: any) {
  const [activeTab, setActiveTab] = useState<'main' | 'slider'>('main')

  return (
    <div className='space-y-6 pb-20'>
      {/* TABS (Mobil Scrollable) */}
      <div className='border-b border-[var(--admin-card-border)] overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0'>
        <div className='flex space-x-6 min-w-max'>
          <button
            onClick={() => setActiveTab('main')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors font-medium ${
              activeTab === 'main'
                ? 'border-[var(--admin-accent)] text-[var(--admin-accent)]'
                : 'border-transparent text-[var(--admin-muted)] hover:text-[var(--admin-fg)]'
            }`}
          >
            <IoFlashOutline size={18} /> 3 Adım (Ana Bölüm)
          </button>
          <button
            onClick={() => setActiveTab('slider')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors font-medium ${
              activeTab === 'slider'
                ? 'border-[var(--admin-accent)] text-[var(--admin-accent)]'
                : 'border-transparent text-[var(--admin-muted)] hover:text-[var(--admin-fg)]'
            }`}
          >
            <IoImagesOutline size={18} /> Kampanya Slider
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className='animate-in fade-in slide-in-from-bottom-2 duration-300'>
        {activeTab === 'main' ? (
          <MainSectionForm initialData={initialSection} />
        ) : (
          <SliderSectionForm initialData={initialSlider} />
        )}
      </div>
    </div>
  )
}
