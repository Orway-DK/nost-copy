// components/LoadingCompleter.tsx
'use client'

import { useEffect } from 'react'

export default function LoadingCompleter ({
  onComplete
}: {
  onComplete: () => void
}) {
  useEffect(() => {
    onComplete()
  }, [onComplete])

  return null
}
