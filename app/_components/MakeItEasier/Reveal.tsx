// app\_components\MakeItEasier\Reveal.tsx
'use client'

import { useEffect, useRef } from 'react'

type RevealProps = {
  children?: React.ReactNode
  className?: string
  delayMs?: number
  durationMs?: number
  once?: boolean
  direction?: 'left' | 'right'
}

export default function Reveal ({
  children,
  className = '',
  delayMs = 0,
  durationMs = 700,
  once = true,
  direction = 'right'
}: RevealProps) {
  const innerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = innerRef.current
    if (!el) return

    el.style.setProperty('--rv-duration', `${durationMs}ms`)
    el.style.setProperty('--rv-delay', `${delayMs}ms`)

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            el.classList.add('reveal-visible')
            if (once) observer.unobserve(el)
          } else {
            if (!once) el.classList.remove('reveal-visible')
          }
        })
      },
      { threshold: 0.15 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delayMs, durationMs, once])

  const dirClass =
    direction === 'left' ? 'reveal-from-left' : 'reveal-from-right'

  return (
    <div className={`reveal ${className}`}>
      <div ref={innerRef} className={`reveal-inner ${dirClass}`}>
        {children}
      </div>
    </div>
  )
}
