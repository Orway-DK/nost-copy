// @/app/admin/settings/general/actions.ts
"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function updateSiteSettings(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("🔎 Supabase user in updateSiteSettings:", { user, userError });

  const payload = {
    id: 1, // tek satır config için sabit
    site_name: formData.get("site_name")?.toString() || null,
    logo_url: formData.get("logo_url")?.toString() || null,
    favicon_url: formData.get("favicon_url")?.toString() || null,
    phone: formData.get("phone")?.toString() || null,
    email: formData.get("email")?.toString() || null,
    address: formData.get("address")?.toString() || null,
    store_location_url: formData.get("store_location_url")?.toString() || null,
    facebook_url: formData.get("facebook_url")?.toString() || null,
    instagram_url: formData.get("instagram_url")?.toString() || null,
    twitter_url: formData.get("twitter_url")?.toString() || null,
    linkedin_url: formData.get("linkedin_url")?.toString() || null,
    whatsapp_url: formData.get("whatsapp_url")?.toString() || null,
    working_hours: formData.get("working_hours")?.toString() || null,
    footer_text: formData.get("footer_text")?.toString() || null,
    updated_at: new Date().toISOString(),
  };

  console.log("updateSiteSettings payload:", payload);

  const { data, error } = await supabase
    .from("site_settings")
    .upsert(payload, {
      onConflict: "id",
    })
    .select()
    .single();

  console.log("updateSiteSettings result:", { data, error });

  if (error) {
    console.error("site_settings upsert error:", error.message);
    throw new Error(error.message);
  }

  return { ok: true, updated_at: data.updated_at };
}
