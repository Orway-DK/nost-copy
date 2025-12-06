// app/admin/(protected)/ready-products/actions.ts
"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { adminSupabase } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function checkAuth() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Oturum açmanız gerekiyor.");
  return user;
}

// 1. Ürün Arama
export async function searchProductsAction(
  term: string,
  existingIds: number[]
) {
  try {
    await checkAuth();
    let query = adminSupabase
      .from("products")
      .select("id, name, sku, product_media(image_key)")
      .ilike("name", `%${term}%`)
      .limit(10);

    if (existingIds.length > 0) {
      query = query.not("id", "in", `(${existingIds.join(",")})`);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const formatted = data.map((p: any) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      image_key: p.product_media?.[0]?.image_key || null,
    }));

    return { success: true, data: formatted };
  } catch (error: any) {
    return { success: false, message: error.message, data: [] };
  }
}

// 2. Ekleme (Immediate)
export async function addReadyProductAction(
  productId: number,
  currentCount: number
) {
  try {
    await checkAuth();
    const { error } = await adminSupabase
      .from("homepage_ready_products")
      .insert({
        product_id: productId,
        active: true,
        sort_order: currentCount + 1,
        price_try: 0,
        price_usd: 0,
        price_eur: 0,
      });

    if (error) throw new Error(error.message);
    revalidatePath("/admin/ready-products");
    return { success: true, message: "Eklendi." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// 3. TOPLU GÜNCELLEME (Bulk Update)
export async function bulkUpdateReadyProductsAction(items: any[]) {
  try {
    await checkAuth();

    // Sadece güncellenebilir alanları alalım
    const payload = items.map((item) => ({
      id: item.id,
      product_id: item.product_id, // İlişki bozulmasın diye
      active: item.active,
      sort_order: item.sort_order,
      price_try: item.price_try,
      price_usd: item.price_usd,
      price_eur: item.price_eur,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await adminSupabase
      .from("homepage_ready_products")
      .upsert(payload);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/ready-products");
    return { success: true, message: "Değişiklikler kaydedildi." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// 4. Silme (Immediate)
export async function deleteReadyProductAction(id: number) {
  try {
    await checkAuth();
    const { error } = await adminSupabase
      .from("homepage_ready_products")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/admin/ready-products");
    return { success: true, message: "Silindi." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
