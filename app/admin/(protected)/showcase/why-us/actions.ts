// app/admin/(protected)/why-us/actions.ts
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

export async function updateWhyUsAction(data: {
  base: any;
  translations: any;
}) {
  try {
    await checkAuth();
    const { base, translations } = data;

    let targetId = base.id;

    if (!targetId) {
      const { data: existingRow } = await adminSupabase
        .from("why_us")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (existingRow) {
        targetId = existingRow.id;
      }
    }

    const { data: savedBase, error: baseError } = await adminSupabase
      .from("why_us")
      .upsert({
        ...(targetId ? { id: targetId } : {}),
        image1_url: base.image1_url,
        image2_url: base.image2_url,
        years_experience: base.years_experience,
        badge_code: base.badge_code,
        active: true,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (baseError) throw new Error("Ana veri hatası: " + baseError.message);

    const translationsArray = Object.entries(translations).map(
      ([lang, transData]: [string, any]) => ({
        why_us_id: savedBase.id,
        lang_code: lang,
        badge_label: transData.badge_label || "",
        headline_prefix: transData.headline_prefix || "",
        headline_emphasis: transData.headline_emphasis || "",
        headline_suffix: transData.headline_suffix || "",
        description: transData.description || "",
        item1_title: transData.item1_title || "",
        item1_text: transData.item1_text || "",
        item2_title: transData.item2_title || "",
        item2_text: transData.item2_text || "",
        item3_title: transData.item3_title || "",
        item3_text: transData.item3_text || "",
      })
    );

    const { error: transError } = await adminSupabase
      .from("why_us_translations")
      .upsert(translationsArray, { onConflict: "why_us_id, lang_code" });

    if (transError) throw new Error("Çeviri hatası: " + transError.message);

    revalidatePath("/");
    revalidatePath("/admin/why-us");

    return { success: true, message: "Güncellendi!", data: savedBase };
  } catch (error: any) {
    console.error("Action Error:", error);
    return { success: false, message: error.message };
  }
}
