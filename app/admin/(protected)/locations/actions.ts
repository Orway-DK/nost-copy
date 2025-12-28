'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server-client'
import { revalidatePath } from 'next/cache'

export async function getLocations() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('contact_locations')
    .select('*')
    .order('lang_code', { ascending: true }) // Dile göre grupla
    .order('is_default', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function createLocation(formData: any) {
  const supabase = await createSupabaseServerClient()

  // Eğer bu kayıt kendi dilinde varsayılan (HQ) yapılacaksa:
  // Aynı dildeki diğerlerinin is_default değerini false yap.
  if (formData.is_default) {
    await supabase
      .from('contact_locations')
      .update({ is_default: false })
      .eq('lang_code', formData.lang_code) // SADECE BU DİLDEKİLERİ
  }

  const { error } = await supabase.from('contact_locations').insert(formData)

  if (error) return { error: error.message }
  revalidatePath('/admin/locations')
  return { success: true }
}

export async function updateLocation(id: number, formData: any) {
  const supabase = await createSupabaseServerClient()

  if (formData.is_default) {
    await supabase
      .from('contact_locations')
      .update({ is_default: false })
      .eq('lang_code', formData.lang_code) // SADECE BU DİLDEKİLERİ
      .neq('id', id)
  }

  const { error } = await supabase
    .from('contact_locations')
    .update(formData)
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/admin/locations')
  return { success: true }
}

export async function deleteLocation(id: number) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('contact_locations').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/locations')
  return { success: true }
}