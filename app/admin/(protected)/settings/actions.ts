// app/admin/(protected)/settings/actions.ts
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

// Site Ayarlarını Güncelle (Singleton)
export async function updateSettingsAction(data: any) {
  try {
    await checkAuth();

    // Zorunlu alan kontrolü
    if (!data.site_name?.trim()) {
      throw new Error("Site adı zorunludur.");
    }

    const payload = {
      site_name: data.site_name.trim(),
      logo_url: data.logo_url || null,
      favicon_url: data.favicon_url || null,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      whatsapp_url: data.whatsapp_url || null,
      working_hours: data.working_hours || null,
      store_location_url: data.store_location_url || null,
      updated_at: new Date().toISOString(),
    };

    // 1. Mevcut kaydı bul (Singleton Pattern)
    let targetId = data.id;
    if (!targetId) {
      const { data: existing } = await adminSupabase
        .from("site_settings")
        .select("id")
        .limit(1)
        .maybeSingle();
      if (existing) targetId = existing.id;
    }

    // 2. Upsert işlemi
    const { data: saved, error } = await adminSupabase
      .from("site_settings")
      .upsert({
        ...(targetId ? { id: targetId } : {}), // ID varsa güncelle, yoksa yeni
        ...payload,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    revalidatePath("/admin/settings"); // Admin sayfasını yenile
    revalidatePath("/", "layout"); // Site genelinde (örn: footer) kullanılan ayarları yenile

    return { success: true, message: "Ayarlar kaydedildi.", data: saved };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
