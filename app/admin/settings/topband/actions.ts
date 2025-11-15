// app/admin/settings/topband/actions.ts
"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function str(v: FormDataEntryValue | null | undefined): string {
  return typeof v === "string" ? v.trim() : "";
}
function nullIfEmpty(v: FormDataEntryValue | null | undefined): string | null {
  const s = str(v);
  return s ? s : null;
}

export async function upsertBannerTranslation(formData: FormData) {
  const lang_code = str(formData.get("lang_code"));
  if (!lang_code) throw new Error("lang_code zorunludur.");

  const payload = {
    lang_code,
    promo_text: str(formData.get("promo_text")),
    promo_cta: str(formData.get("promo_cta")),
    promo_url: nullIfEmpty(formData.get("promo_url")),
  };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: uerr,
  } = await supabase.auth.getUser();
  if (uerr || !user) throw new Error("Oturum bulunamadı.");

  const { error } = await supabase
    .from("banner_translations")
    .upsert({ ...payload, updated_by: user.id }, { onConflict: "lang_code" });

  if (error) throw new Error(error.message);
  return { ok: true };
}
