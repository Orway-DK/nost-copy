// C:\Projeler\nost-copy\app\_components\ReadyProducts\SectionHeading.tsx
'use client'

import React from 'react'

type SectionHeadingProps = {
  text: string
  highlight?: string
  highlightColor?: string
  as?: React.ElementType
  align?: 'left' | 'center' | 'right'
  className?: string
}

export default function SectionHeading ({
  text,
  highlight,
  highlightColor = 'var(--primary)',
  as: HeadingComponent = 'h2',
  align = 'center',
  className = ''
}: SectionHeadingProps) {
  const idx = highlight ? text.indexOf(highlight) : -1
  const before = idx >= 0 ? text.slice(0, idx) : text
  const highlighted = idx >= 0 ? highlight! : ''
  const after = idx >= 0 ? text.slice(idx + highlight!.length) : ''

  return (
    <div
      className={`w-full mb-6 md:mb-10 ${className}`}
      style={{ textAlign: align }}
    >
      {/* Mobil: text-2xl, Tablet: text-4xl, Desktop: text-5xl */}
      <HeadingComponent className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-foreground font-poppins'>
        {before}
        {highlighted && (
          <span
            style={{ color: highlightColor }}
            className='transition-colors duration-300'
          >
            {highlighted}
          </span>
        )}
        {after}
      </HeadingComponent>
    </div>
  )
}
