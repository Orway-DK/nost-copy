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

// 1. Tüm Sayfaları Listele
export async function getPagesListAction () {
  try {
    await checkAuth()
    const { data, error } = await adminSupabase
      .from('nost-corporate-pages')
      .select('*')
      .order('id', { ascending: true })

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// 2. Tek Bir Sayfayı Detaylı Getir (Çevirileriyle)
export async function getPageDetailAction (slug: string) {
  try {
    await checkAuth()
    const { data, error } = await adminSupabase
      .from('nost-corporate-pages')
      .select('*, nost_corporate_page_translations(*)')
      .eq('slug', slug)
      .single()

    if (error) throw error

    // Veriyi form yapısına uygun hale getiriyoruz
    const formattedData = {
      id: data.id,
      slug: data.slug,
      image_url: data.image_url,
      active: data.active,
      page_type: data.page_type || 'standard',
      template: data.template || '',
      // Çevirileri { tr: {title, content, slug}, en: {title, content, slug} } formatına çevir
      translations: data.nost_corporate_page_translations.reduce((acc: any, curr: any) => {
        acc[curr.lang_code] = {
          title: curr.title || '',
          content: curr.content || '',
          slug: curr.slug || ''
        }
        return acc
      }, {})
    }

    return { success: true, data: formattedData }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// 3. Sayfayı Güncelle
export async function updatePageAction (pageId: number, formData: any) {
  try {
    await checkAuth()

    // 1. Ana Tabloyu (Resim/Durum/Page Type/Template) Güncelle
    const { error: mainError } = await adminSupabase
      .from('nost-corporate-pages')
      .update({
        image_url: formData.image_url,
        active: formData.active,
        page_type: formData.page_type || 'standard',
        template: formData.template || ''
      })
      .eq('id', pageId)

    if (mainError) throw mainError

    // 2. Çevirileri Güncelle (slug dahil)
    const languages = ['tr', 'en', 'de']
    const translationUpdates = languages.map(lang => ({
      page_id: pageId,
      lang_code: lang,
      title: formData.translations[lang]?.title || '',
      content: formData.translations[lang]?.content || '',
      slug: formData.translations[lang]?.slug || ''
    }))

    const { error: transError } = await adminSupabase
      .from('nost_corporate_page_translations')
      .upsert(translationUpdates, { onConflict: 'page_id, lang_code' })

    if (transError) throw transError

    // 3. Ana tablo slug'ını güncelle (Türkçe slug)
    const { error: slugError } = await adminSupabase
      .from('nost-corporate-pages')
      .update({
        slug: formData.translations.tr?.slug || formData.slug
      })
      .eq('id', pageId)

    if (slugError) throw slugError

    revalidatePath('/admin/pages')
    revalidatePath(`/${formData.translations.tr?.slug || formData.slug}`) // Frontend'deki sayfayı da yenile

    return { success: true, message: 'Sayfa başarıyla güncellendi.' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}
