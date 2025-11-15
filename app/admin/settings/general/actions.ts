// @/app/admin/settings/general/actions.ts
"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function str(v: FormDataEntryValue | null | undefined): string {
  return typeof v === "string" ? v.trim() : "";
}
function nullIfEmpty(v: FormDataEntryValue | null | undefined): string | null {
  const s = str(v);
  return s ? s : null;
}

export async function updateSiteSettings(formData: FormData) {
  const site_name = str(formData.get("site_name"));
  if (!site_name) throw new Error("site_name zorunlu.");

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: uerr,
  } = await supabase.auth.getUser();
  if (uerr || !user) throw new Error("Oturum bulunamadı.");

  const payload = {
    id: 1,
    site_name,
    logo_url: nullIfEmpty(formData.get("logo_url")),
    favicon_url: nullIfEmpty(formData.get("favicon_url")),
    phone: nullIfEmpty(formData.get("phone")),
    email: nullIfEmpty(formData.get("email")),
    address: nullIfEmpty(formData.get("address")),
    store_location_url: nullIfEmpty(formData.get("store_location_url")),
    facebook_url: nullIfEmpty(formData.get("facebook_url")),
    instagram_url: nullIfEmpty(formData.get("instagram_url")),
    twitter_url: nullIfEmpty(formData.get("twitter_url")),
    linkedin_url: nullIfEmpty(formData.get("linkedin_url")),
    whatsapp_url: nullIfEmpty(formData.get("whatsapp_url")),
    working_hours: nullIfEmpty(formData.get("working_hours")),
    footer_text: str(formData.get("footer_text")),
    updated_by: user.id,
  };

  const { error } = await supabase
    .from("site_settings")
    .upsert(payload, { onConflict: "id" });

  if (error) throw new Error(error.message);
  return { ok: true };
}
