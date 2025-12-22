'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server-client'
import { revalidatePath } from 'next/cache'
import { slugify } from '@/lib/utils' // Slugify fonksiyonun lib/utils içinde olduğunu varsayıyorum

async function checkAuth () {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Oturum açmanız gerekiyor.')
  return supabase
}

// --- ÜRÜN İŞLEMLERİ ---

export async function upsertProductAction (data: any) {
  try {
    const supabase = await checkAuth()
    const slug = data.slug || slugify(data.name)

    // DİNAMİK YAPI: Sabit kolonlar yerine template_id ve attributes var.
    const productPayload = {
      template_id: data.template_id || null, // Seçilen şablon
      category_slug: data.category_slug,
      name: data.name,
      sku: data.sku,
      description: data.description,
      active: data.active,
      slug: slug,
      attributes: data.attributes || {} // Genel özellikler JSON
    }

    let productId = data.id
    let savedData

    if (productId) {
      // Update
      const { data: updated, error } = await supabase
        .from('products')
        .update(productPayload)
        .eq('id', productId)
        .select()
        .single()
      if (error) throw new Error(error.message)
      savedData = updated
    } else {
      // Insert
      const { data: inserted, error } = await supabase
        .from('products')
        .insert(productPayload)
        .select()
        .single()
      if (error) throw new Error(error.message)
      savedData = inserted
      productId = inserted.id
    }

    // Görsel Kaydetme (Değişmedi, aynı mantık)
    if (data.main_image_url) {
      const { data: existingMedia } = await supabase
        .from('product_media')
        .select('id')
        .eq('product_id', productId)
        .eq('sort_order', 0)
        .maybeSingle()

      if (existingMedia) {
        await supabase
          .from('product_media')
          .update({ image_key: data.main_image_url })
          .eq('id', existingMedia.id)
      } else {
        await supabase
          .from('product_media')
          .insert({
            product_id: productId,
            image_key: data.main_image_url,
            sort_order: 0
          })
      }
    }

    revalidatePath('/admin/products')
    return {
      success: true,
      message: 'Ürün başarıyla kaydedildi.',
      data: savedData
    }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function deleteProductAction (id: number) {
  // ... (Eski kodunun aynısı kalabilir) ...
  try {
    const supabase = await checkAuth()
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath('/admin/products')
    return { success: true, message: 'Ürün silindi.' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// --- VARYANT İŞLEMLERİ (ÖNEMLİ KISIM) ---

export async function upsertVariantAction (data: {
  id?: number
  product_id: number
  attributes: any
  price: number
}) {
  try {
    const supabase = await checkAuth()

    // 1. Varyantı Kaydet (JSON attributes ile)
    const variantPayload = {
      product_id: data.product_id,
      attributes: data.attributes // {"Beden": "S", "Renk": "Mavi"} veya {"Adet": 1000}
    }

    let variantId = data.id

    if (variantId) {
      // Update
      const { error } = await supabase
        .from('product_variants')
        .update(variantPayload)
        .eq('id', variantId)
      if (error) throw new Error(error.message)
    } else {
      // Insert
      const { data: inserted, error } = await supabase
        .from('product_variants')
        .insert(variantPayload)
        .select()
        .single()
      if (error) throw new Error(error.message)
      variantId = inserted.id
    }

    // 2. Fiyatı Kaydet (Product Prices tablosuna)
    // Her varyantın 1 adet TRY fiyatı olduğunu varsayıyoruz.
    if (data.price !== undefined) {
      const { error: priceError } = await supabase
        .from('product_prices')
        .upsert(
          {
            variant_id: variantId,
            currency: 'TRY',
            amount: data.price,
            computed: false // Artık hesaplanan değil, direkt girilen fiyat
          },
          { onConflict: 'variant_id, currency' }
        )

      if (priceError)
        throw new Error('Fiyat kaydedilemedi: ' + priceError.message)
    }

    revalidatePath(`/admin/products/${data.product_id}`)
    return { success: true, message: 'Varyasyon ve fiyat kaydedildi.' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function deleteVariantAction (id: number, productId: number) {
  try {
    const supabase = await checkAuth()
    const { error } = await supabase
      .from('product_variants')
      .delete()
      .eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath(`/admin/products/${productId}`)
    return { success: true, message: 'Varyasyon silindi.' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}
