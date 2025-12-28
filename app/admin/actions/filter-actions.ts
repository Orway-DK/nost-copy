// app/admin/actions/filter-actions.ts
"use server"

import { createSupabaseServerClient } from '@/lib/supabase/server-client'
import { revalidatePath } from 'next/cache'

export async function updateCategorySettingsAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  // FormData booleans'ı string olarak gönderir ("true" veya "false").
  // Bunu tekrar boolean'a çevirmemiz gerekir.
  const is_filters_active = formData.get("is_category_filters_active") === "true";
  const is_sorting_active = formData.get("is_category_sorting_active") === "true";

  // Veritabanını güncelle
  const { error } = await supabase
    .from("site_settings")
    .update({
      is_category_filters_active: is_filters_active,
      is_category_sorting_active: is_sorting_active,
    })
    .eq("id", 2); 

  if (error) {
    console.error("Kategori ayarları güncellenirken hata:", error);
    return { success: false, message: "Veritabanı hatası: " + error.message };
  }

  // Önbelleği temizle ki değişiklik anında siteye yansısın
  revalidatePath("/", "layout");
  
  return { success: true };
}