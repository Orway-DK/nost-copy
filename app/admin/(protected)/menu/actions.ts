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

// 1. TÜM MENÜYÜ GETİR
export async function getMenuItemsAction () {
  try {
    await checkAuth()
    const { data, error } = await adminSupabase
      .from('classic_navigation_items')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// 2. TEK BİR MENÜ ÖĞESİ GETİR (Düzenleme için)
export async function getMenuItemByIdAction (id: number) {
  try {
    await checkAuth()
    const { data, error } = await adminSupabase
      .from('classic_navigation_items')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// 3. EKLE / GÜNCELLE (Upsert)
export async function upsertMenuItemAction (formData: any) {
  try {
    await checkAuth()

    const payload = {
      parent_id: formData.parent_id === 0 ? null : formData.parent_id, // 0 gelirse null yap
      type: formData.type,
      label: formData.label, // JSONB {tr:..., en:...}
      url: formData.url,
      sort_order: parseInt(formData.sort_order),
      is_active: formData.is_active
    }

    if (formData.id) {
      // Update
      const { error } = await adminSupabase
        .from('classic_navigation_items')
        .update(payload)
        .eq('id', formData.id)
      if (error) throw error
    } else {
      // Insert
      const { error } = await adminSupabase
        .from('classic_navigation_items')
        .insert(payload)
      if (error) throw error
    }

    revalidatePath('/admin/menu')
    revalidatePath('/') // Siteyi de yenile
    return { success: true, message: 'Menü öğesi kaydedildi.' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// 4. SİL
export async function deleteMenuItemAction (id: number) {
  try {
    await checkAuth()
    const { error } = await adminSupabase
      .from('classic_navigation_items')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/menu')
    revalidatePath('/')
    return { success: true, message: 'Menü öğesi silindi.' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}
