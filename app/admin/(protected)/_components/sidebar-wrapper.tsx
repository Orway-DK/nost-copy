'use client'

import { useState } from 'react'
import AdminSidebar from './sidebar'

export default function AdminSidebarWrapper ({
  mainMenus
}: {
  mainMenus: any[]
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const toggleCollapse = () => setIsCollapsed(!isCollapsed)

  return (
    <AdminSidebar
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      isCollapsed={isCollapsed}
      toggleCollapse={toggleCollapse}
      mainMenus={mainMenus}
    />
  )
}
