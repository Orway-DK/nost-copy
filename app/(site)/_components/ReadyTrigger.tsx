// C:\Projeler\nost-copy\app\(site)\_components\ReadyTrigger.tsx
'use client'

import { useEffect } from 'react'

export default function ReadyTrigger ({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady()
  }, [onReady])

  return null
}
