// app/admin/(protected)/social-settings/actions.ts
"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { adminSupabase } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// Yetki Kontrolü
async function checkAuth() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Oturum açmanız gerekiyor.");
  return user;
}

// 1. TOPLU KAYIT (Bulk Upsert)
export async function bulkSaveSocialLinksAction(links: any[]) {
  try {
    await checkAuth();

    // Veriyi temizle ve hazırlan
    const payload = links.map((link) => ({
      id:
        typeof link.id === "string" && link.id.startsWith("temp-")
          ? undefined
          : link.id, // Temp ID ise undefined yap ki yeni oluştursun
      settings_id: link.settings_id,
      code: link.code,
      url: link.url,
      active: link.active,
      sort: link.sort,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await adminSupabase
      .from("site_social_links")
      .upsert(payload);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/social-settings");
    return { success: true, message: "Tüm değişiklikler kaydedildi." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// 2. Link Sil
export async function deleteSocialLinkAction(id: number | string) {
  try {
    await checkAuth();
    const { error } = await adminSupabase
      .from("site_social_links")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/social-settings");
    return { success: true, message: "Silindi." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
