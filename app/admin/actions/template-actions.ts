'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server-client'
import { revalidatePath } from 'next/cache'
import { ProductTemplate } from '@/types'

// Yardımcı: Yetki Kontrolü
async function checkAuth () {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Oturum açmanız gerekiyor.')
  return supabase
}

/**
 * Yeni bir Ürün Şablonu (Class) oluşturur veya günceller.
 */
export async function upsertTemplateAction (data: Partial<ProductTemplate>) {
  try {
    const supabase = await checkAuth()

    const payload = {
      name: data.name,
      schema: data.schema // JSON Array olarak gelecek
    }

    let result
    if (data.id) {
      // Güncelleme
      result = await supabase
        .from('product_templates')
        .update(payload)
        .eq('id', data.id)
        .select()
        .single()
    } else {
      // Yeni Ekleme
      result = await supabase
        .from('product_templates')
        .insert(payload)
        .select()
        .single()
    }

    if (result.error) throw new Error(result.error.message)

    revalidatePath('/admin/templates')
    return { success: true, message: 'Şablon kaydedildi.', data: result.data }
  } catch (error: any) {
    console.error('Template Error:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Şablon listesini çeker.
 */
export async function getTemplatesAction () {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('product_templates')
    .select('*')
    .order('name')

  if (error) return []
  return data as ProductTemplate[]
}

/**
 * Şablon siler.
 */
export async function deleteTemplateAction (id: number) {
  try {
    const supabase = await checkAuth()

    // Önce bu şablonu kullanan ürün var mı kontrol et
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('template_id', id)

    if (count && count > 0) {
      throw new Error(
        `Bu şablonu kullanan ${count} adet ürün var. Önce onları silmelisiniz.`
      )
    }

    const { error } = await supabase
      .from('product_templates')
      .delete()
      .eq('id', id)
    if (error) throw new Error(error.message)

    revalidatePath('/admin/templates')
    return { success: true, message: 'Şablon silindi.' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}
