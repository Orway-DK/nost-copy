// C:\Projeler\nost-copy\app\admin\(protected)\showcase\make-it-easier\actions.ts
"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { adminSupabase } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function checkAuth() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Oturum açmanız gerekiyor.");
    return user;
}

// --- BÖLÜM 1: MAKE IT EASIER (3 Adım) ---

export async function getMakeItEasierAction() {
    try {
        await checkAuth();

        // İlk aktif kaydı çek (Genelde tek kayıt olur)
        const { data, error } = await adminSupabase
            .from("make_it_easier_sections")
            .select(`
                *,
                make_it_easier_translations (*)
            `)
            .limit(1)
            .maybeSingle();

        if (error) throw new Error(error.message);
        return { success: true, data };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function saveMakeItEasierAction(data: any) {
    try {
        await checkAuth();

        // 1. Ana Tablo (Görsel ve ID)
        const mainPayload = {
            image_link: data.image_link,
            active: true, // Her zaman aktif kabul edelim
            updated_at: new Date().toISOString()
        };

        let sectionId = data.id;

        if (sectionId) {
            await adminSupabase.from("make_it_easier_sections").update(mainPayload).eq("id", sectionId);
        } else {
            const { data: inserted } = await adminSupabase.from("make_it_easier_sections").insert(mainPayload).select().single();
            sectionId = inserted.id;
        }

        // 2. Çeviriler
        if (data.translations) {
            const transPayload = data.translations.map((t: any) => ({
                section_id: sectionId,
                lang_code: t.lang_code,
                title: t.title,
                titletext: t.titletext,
                tip1_icon: t.tip1_icon, tip1_title: t.tip1_title, tip1_text: t.tip1_text,
                tip2_icon: t.tip2_icon, tip2_title: t.tip2_title, tip2_text: t.tip2_text,
                tip3_icon: t.tip3_icon, tip3_title: t.tip3_title, tip3_text: t.tip3_text,
                ...(t.id ? { id: t.id } : {})
            }));

            await adminSupabase
                .from("make_it_easier_translations")
                .upsert(transPayload, { onConflict: "section_id, lang_code" as any });
        }

        revalidatePath("/"); // Anasayfa yenilensin
        return { success: true, message: "Bölüm kaydedildi." };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}


// --- BÖLÜM 2: SLIDER PART (Kampanya) ---

export async function getSliderPartAction() {
    try {
        await checkAuth();
        const { data, error } = await adminSupabase
            .from("make_it_easier_slider_sections")
            .select(`
                *,
                make_it_easier_slider_translations (*)
            `)
            .limit(1)
            .maybeSingle();

        if (error) throw new Error(error.message);
        return { success: true, data };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function saveSliderPartAction(data: any) {
    try {
        await checkAuth();

        // 1. Ana Tablo
        const mainPayload = {
            image_links: data.image_links, // JSON array string veya object
            active: true,
            updated_at: new Date().toISOString()
        };

        let sectionId = data.id;

        if (sectionId) {
            await adminSupabase.from("make_it_easier_slider_sections").update(mainPayload).eq("id", sectionId);
        } else {
            const { data: inserted } = await adminSupabase.from("make_it_easier_slider_sections").insert(mainPayload).select().single();
            sectionId = inserted.id;
        }

        // 2. Çeviriler
        if (data.translations) {
            const transPayload = data.translations.map((t: any) => ({
                section_id: sectionId,
                lang_code: t.lang_code,
                title: t.title,
                text: t.text,
                button_name: t.button_name,
                button_link: t.button_link,
                ...(t.id ? { id: t.id } : {})
            }));

            await adminSupabase
                .from("make_it_easier_slider_translations")
                .upsert(transPayload, { onConflict: "section_id, lang_code" as any });
        }

        revalidatePath("/");
        return { success: true, message: "Slider bölümü kaydedildi." };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}