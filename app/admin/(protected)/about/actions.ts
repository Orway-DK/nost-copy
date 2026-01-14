// app\admin\(protected)\about\actions.ts
'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server-client'
import { adminSupabase } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

async function checkAuth () {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Oturum açmanız gerekiyor.')
  return user
}

// 1. Verileri Getir
export async function getAboutContentAction () {
  try {
    await checkAuth()
    const { data, error } = await adminSupabase
      .from('ui_translations')
      .select('*')
      .eq('section', 'about_page')
      .order('key_name', { ascending: true }) // Sıralama önemli değil ama düzenli olsun

    if (error) throw new Error(error.message)

    // Veriyi frontend'de kolay işlenecek bir objeye çevirelim
    // Örn: { hero_title: { tr: '...', en: '...' }, ... }
    const formatted: Record<string, any> = {}
    data.forEach((item: any) => {
      formatted[item.key_name] = {
        id: item.id,
        tr: item.text_tr || '',
        en: item.text_en || '',
        de: item.text_de || ''
      }
    })

    return { success: true, data: formatted }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// 2. Güncelle (Toplu Update)
export async function updateAboutContentAction (formData: any) {
  try {
    await checkAuth()

    // formData: { hero_title: { id: 1, tr: '...', en: '...' }, ... }

    const updates = []

    for (const [key, val] of Object.entries(formData)) {
      const value = val as any
      if (value.id) {
        updates.push({
          id: value.id,
          text_tr: value.tr,
          text_en: value.en,
          text_de: value.de
          // updated_at trigger ile halledilir genelde
        })
      }
    }

    if (updates.length > 0) {
      const { error } = await adminSupabase
        .from('ui_translations')
        .upsert(updates)

      if (error) throw error
    }

    revalidatePath('/about') // Ön yüzü yenile
    revalidatePath('/admin/about') // Admini yenile

    return { success: true, message: 'İçerik güncellendi.' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}
