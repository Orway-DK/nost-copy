// C:\Projeler\nost-copy\app\admin\(protected)\products\actions.ts
'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server-client'
import { adminSupabase } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { slugify } from '@/lib/utils'

// Yetki Kontrolü
async function checkAuth () {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Oturum açmanız gerekiyor.')
  return user
}

// --- ÜRÜN İŞLEMLERİ (UPSERT) ---
export async function upsertProductAction (data: any) {
  try {
    await checkAuth()

    const slug = data.slug || slugify(data.name)

    const productPayload = {
      sku: data.sku,
      category_slug: data.category_slug,
      name: data.name,
      description: data.description,
      size: data.size,
      min_quantity: data.min_quantity,
      media_base_path: data.media_base_path,
      active: data.active,
      slug: slug,
      // YENİ EKLENEN: Attributes (JSONB)
      attributes: data.attributes || {}
    }

    let productId = data.id
    let savedProduct

    if (productId) {
      const { data: updated, error } = await adminSupabase
        .from('products')
        .update(productPayload)
        .eq('id', productId)
        .select()
        .single()
      if (error) throw new Error(error.message)
      savedProduct = updated
    } else {
      const { data: inserted, error } = await adminSupabase
        .from('products')
        .insert(productPayload)
        .select()
        .single()
      if (error) throw new Error(error.message)
      savedProduct = inserted
      productId = inserted.id
    }

    // ... (Medya kaydetme kısmı AYNI kalsın) ...

    revalidatePath('/admin/products')
    return { success: true, message: 'Ürün kaydedildi.', data: savedProduct }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// --- ÜRÜN SİLME ---
export async function deleteProductAction (id: number) {
  try {
    await checkAuth()
    // Cascade sayesinde media ve varyasyonlar otomatik silinir
    const { error } = await adminSupabase.from('products').delete().eq('id', id)
    if (error) throw new Error(error.message)

    revalidatePath('/admin/products')
    return { success: true, message: 'Ürün silindi.' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// --- VARYASYON İŞLEMLERİ ---
export async function upsertVariantAction (data: any) {
  try {
    await checkAuth()
    const payload = {
      product_id: data.product_id,
      material_slug: data.material_slug,
      grams: data.grams,
      side_code: data.side_code,
      lamination: data.lamination,
      lamination_type_slug: data.lamination_type_slug,
      operations: data.operations,
      attributes: data.attributes
    }

    const { error } = await adminSupabase
      .from('product_variants')
      .insert(payload)
    if (error) throw new Error(error.message)

    revalidatePath(`/admin/products/${data.product_id}`)
    return { success: true, message: 'Varyasyon eklendi.' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function deleteVariantAction (
  variantId: number,
  productId: number
) {
  try {
    await checkAuth()
    const { error } = await adminSupabase
      .from('product_variants')
      .delete()
      .eq('id', variantId)
    if (error) throw new Error(error.message)

    revalidatePath(`/admin/products/${productId}`)
    return { success: true, message: 'Varyasyon silindi.' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// --- ÇEVİRİ İŞLEMLERİ ---
export async function saveLocalizationsAction (
  productId: number,
  localizations: any[]
) {
  try {
    await checkAuth()
    const payload = localizations.map(loc => ({
      id: loc.id,
      product_id: productId,
      lang_code: loc.lang_code,
      name: loc.name,
      description: loc.description
    }))

    const { error } = await adminSupabase
      .from('product_localizations')
      .upsert(payload, { onConflict: 'product_id, lang_code' as any })

    if (error) throw new Error(error.message)

    revalidatePath(`/admin/products/${productId}`)
    return { success: true, message: 'Çeviriler kaydedildi.' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// --- MOCK TRANSLATE ---
export async function autoTranslateAction (text: string, targetLang: string) {
  await new Promise(resolve => setTimeout(resolve, 500))
  return { success: true, text: `[${targetLang.toUpperCase()}] ${text}` }
}
