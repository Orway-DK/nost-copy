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

// 1. Kategorileri Çek (Mevcut kodun)
export async function getScrollingCategoriesAction () {
  // ... (Mevcut kodun aynısı kalsın) ...
  try {
    await checkAuth()
    const { data, error } = await adminSupabase
      .from('categories')
      .select(
        `id, slug, active, sort, category_translations!inner (name, lang_code)`
      )
      .eq('category_translations.lang_code', 'tr')
      .order('sort', { ascending: true })

    if (error) throw new Error(error.message)

    const formatted = data.map((c: any) => ({
      id: c.id,
      slug: c.slug,
      active: c.active,
      sort: c.sort,
      name: c.category_translations[0]?.name || c.slug
    }))

    return { success: true, data: formatted }
  } catch (error: any) {
    return { success: false, message: error.message, data: [] }
  }
}

// 2. Toplu Güncelleme (Mevcut kodun)
export async function updateScrollingCategoriesAction (items: any[]) {
  // ... (Mevcut kodun aynısı kalsın) ...
  try {
    await checkAuth()
    const payload = items.map(item => ({
      id: item.id,
      slug: item.slug,
      active: item.active,
      sort: item.sort,
      updated_at: new Date().toISOString()
    }))

    const { error } = await adminSupabase.from('categories').upsert(payload)
    if (error) throw new Error(error.message)

    revalidatePath('/admin/showcase/scrolling-categories')
    revalidatePath('/')
    return { success: true, message: 'Sıralama ve durumlar güncellendi.' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// --- YENİ EKLENENLER: SLIDER AYARLARI ---

// 3. Ayarları Getir
export async function getSliderSettingsAction () {
  try {
    await checkAuth()
    const { data, error } = await adminSupabase
      .from('slider_settings')
      .select('*')
      .eq('section_key', 'scrolling_categories')
      .single()

    if (error) throw new Error(error.message)
    return { success: true, data }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// 4. Ayarları Güncelle
export async function updateSliderSettingsAction (
  desktop: number,
  mobile: number
) {
  try {
    await checkAuth()
    const { error } = await adminSupabase
      .from('slider_settings')
      .update({
        duration_desktop: desktop,
        duration_mobile: mobile
      })
      .eq('section_key', 'scrolling_categories')

    if (error) throw new Error(error.message)

    revalidatePath('/admin/showcase/scrolling-categories')
    revalidatePath('/') // Anasayfa cache temizlensin
    return { success: true, message: 'Hız ayarları güncellendi.' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}
