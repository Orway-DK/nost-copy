// C:\Projeler\nost-copy\app\_components\LandingSlider\_components\Reveal.tsx
'use client'

import React, {
  type ReactNode,
  type CSSProperties,
  type HTMLAttributes,
  useState,
  useEffect
} from 'react'
import clsx from 'clsx'
import { useIntersectOnce } from '@/app/_hooks/useIntersectOnce'

type Direction = 'up' | 'down' | 'left' | 'right'

/**
 * Sadece yaygın HTML tag'leriyle sınırlandırıldı
 * (SVG hariç tutuldu, çünkü ref tipi farklı)
 */
type HtmlTagName =
  | 'div'
  | 'section'
  | 'article'
  | 'aside'
  | 'header'
  | 'footer'
  | 'main'
  | 'nav'
  | 'span'
  | 'p'
  | 'ul'
  | 'ol'
  | 'li'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'

type Props = {
  children: ReactNode
  as?: HtmlTagName
  direction?: Direction
  delayMs?: number
  durationMs?: number
  once?: boolean
  priority?: boolean
} & HTMLAttributes<HTMLElement>

export default function Reveal ({
  children,
  as: Tag = 'div',
  direction = 'up',
  delayMs = 0,
  durationMs,
  once = true,
  priority = false,
  className,
  style,
  ...rest
}: Props) {
  const { ref, visible: hookVisible } = useIntersectOnce<HTMLElement>({ once })

  const [priorityVisible, setPriorityVisible] = useState(false)

  useEffect(() => {
    if (priority) {
      // Animasyonun tetiklenmesi için minik bir render gecikmesi
      const timer = setTimeout(() => {
        setPriorityVisible(true)
      }, 30)
      return () => clearTimeout(timer)
    }
  }, [priority])

  // Priority varsa hook sonucunu bekleme, manuel state'i kullan
  const isVisible = priority ? priorityVisible : hookVisible

  const mergedStyle: CSSProperties = {
    ...style,
    ['--rv-delay' as any]: `${delayMs}ms`,
    ...(durationMs != null
      ? { ['--rv-duration' as any]: `${durationMs}ms` }
      : {})
  }

  return (
    <Tag
      ref={ref as unknown as React.Ref<any>}
      style={mergedStyle}
      className={clsx(
        'reveal-base',
        direction === 'up' && 'reveal-up',
        direction === 'down' && 'reveal-down',
        direction === 'left' && 'reveal-left',
        direction === 'right' && 'reveal-right',
        isVisible && 'reveal-visible',
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}
