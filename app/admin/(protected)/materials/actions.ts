'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server-client'
import { adminSupabase } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function upsertMaterialAction(data: any) {
  const supabase = await createSupabaseServerClient()
  
  // Oturum kontrolü (Basit)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Yetkisiz işlem.' }

  const payload = {
    name: data.name,
    category_slug: data.category_slug,
    type_code: data.type_code,
    weight_g: data.weight_g || 0,
    finish_type: data.finish_type,
    unit: data.unit,
    cost_per_unit: data.cost_per_unit || 0,
    is_active: data.is_active
  }

  try {
    if (data.id) {
      // Güncelleme
      const { error } = await adminSupabase
        .from('materials')
        .update(payload)
        .eq('id', data.id)
      if (error) throw error
    } else {
      // Yeni Ekleme
      const { error } = await adminSupabase
        .from('materials')
        .insert(payload)
      if (error) throw error
    }

    revalidatePath('/admin/materials')
    return { success: true, message: 'Malzeme kaydedildi.' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function deleteMaterialAction(id: number) {
  const { error } = await adminSupabase.from('materials').delete().eq('id', id)
  if (error) return { success: false, message: error.message }
  
  revalidatePath('/admin/materials')
  return { success: true, message: 'Malzeme silindi.' }
}