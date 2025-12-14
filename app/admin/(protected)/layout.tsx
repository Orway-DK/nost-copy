// C:\Projeler\nost-copy\app\admin\(protected)\layout.tsx

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import React from 'react'
import { Toaster } from 'react-hot-toast'
import '../admin-theme.css'

// Client Wrapper'ı import ediyoruz
import AdminLayoutClient from './_components/admin-layout-client'

export default async function ProtectedAdminLayout ({
  children
}: {
  children: React.ReactNode
}) {
  // 1. Auth Kontrolü (Server Side)
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll () {
          return cookieStore.getAll()
        },
        setAll (cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component'ten cookie set edilemez uyarısını yoksay (Middleware halleder)
          }
        }
      }
    }
  )

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  // 2. Render (Client Wrapper içine children gönderilir)
  return (
    <div className='admin-root'>
      <Toaster
        position='top-right'
        toastOptions={{
          className: 'text-sm font-medium shadow-md',
          duration: 4000,
          style: {
            background: 'var(--admin-card)',
            color: 'var(--admin-fg)',
            border: '1px solid var(--admin-card-border)'
          }
        }}
      />

      {/* State ve UI mantığı burada */}
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </div>
  )
}
