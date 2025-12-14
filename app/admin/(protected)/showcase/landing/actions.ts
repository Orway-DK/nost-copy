// C:\Projeler\nost-copy\app\admin\(protected)\showcase\landing\actions.ts
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

// --- SLIDER İŞLEMLERİ ---

export async function upsertSlideAction(data: any) {
  try {
    await checkAuth();

    // 1. Ana Slide Upsert
    const payload = {
      image_link: data.image_link,
      order_no: data.order_no,
      active: data.active,
      updated_at: new Date().toISOString(),
    };

    let slideId = data.id;
    let savedSlide;

    if (slideId) {
      const { data: updated, error } = await adminSupabase
        .from("landing_slides")
        .update(payload)
        .eq("id", slideId)
        .select()
        .single();
      if (error) throw new Error(error.message);
      savedSlide = updated;
    } else {
      const { data: inserted, error } = await adminSupabase
        .from("landing_slides")
        .insert(payload)
        .select()
        .single();
      if (error) throw new Error(error.message);
      savedSlide = inserted;
      slideId = inserted.id;
    }

    // 2. Çevirileri Upsert Et
    if (data.translations && Array.isArray(data.translations)) {
      const transPayload = data.translations.map((t: any) => ({
        slide_id: slideId,
        lang_code: t.lang_code,
        title1: t.title1,
        title2: t.title2,
        text: t.text,
        button_link: t.button_link,
        tips: t.tips, // JSON array
        ...(t.id ? { id: t.id } : {}), // ID varsa update
      }));

      const { error: transError } = await adminSupabase
        .from("landing_slide_translations")
        .upsert(transPayload, { onConflict: "slide_id, lang_code" as any });

      if (transError) throw new Error(transError.message);
    }

    revalidatePath("/admin/landing");
    return { success: true, message: "Slayt kaydedildi." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteSlideAction(id: number) {
  try {
    await checkAuth();
    const { error } = await adminSupabase
      .from("landing_slides")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/admin/landing");
    return { success: true, message: "Slayt silindi." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// --- HIGHLIGHT İŞLEMLERİ ---

export async function upsertHighlightAction(data: any) {
  try {
    await checkAuth();

    // 1. Ana Highlight Upsert
    const payload = {
      icon: data.icon,
      order_no: data.order_no,
      active: data.active,
      updated_at: new Date().toISOString(),
    };

    let hlId = data.id;
    let savedHl;

    if (hlId) {
      const { data: updated, error } = await adminSupabase
        .from("landing_highlights")
        .update(payload)
        .eq("id", hlId)
        .select()
        .single();
      if (error) throw new Error(error.message);
      savedHl = updated;
    } else {
      const { data: inserted, error } = await adminSupabase
        .from("landing_highlights")
        .insert(payload)
        .select()
        .single();
      if (error) throw new Error(error.message);
      savedHl = inserted;
      hlId = inserted.id;
    }

    // 2. Çevirileri Upsert Et
    if (data.translations && Array.isArray(data.translations)) {
      const transPayload = data.translations.map((t: any) => ({
        highlight_id: hlId,
        lang_code: t.lang_code,
        text: t.text,
        ...(t.id ? { id: t.id } : {}),
      }));

      const { error: transError } = await adminSupabase
        .from("landing_highlight_translations")
        .upsert(transPayload, { onConflict: "highlight_id, lang_code" as any });

      if (transError) throw new Error(transError.message);
    }

    revalidatePath("/admin/landing");
    return { success: true, message: "Highlight kaydedildi." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteHighlightAction(id: number) {
  try {
    await checkAuth();
    const { error } = await adminSupabase
      .from("landing_highlights")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/admin/landing");
    return { success: true, message: "Highlight silindi." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
