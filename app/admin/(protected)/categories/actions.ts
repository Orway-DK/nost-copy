// C:\Projeler\nost-copy\app\admin\(protected)\categories\actions.ts
"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { adminSupabase } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";

// Yetki Kontrolü
async function checkAuth() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Oturum açmanız gerekiyor.");
    return user;
}

// 1. Kategori Ekle/Güncelle (Upsert)
export async function upsertCategoryAction(data: any) {
    try {
        await checkAuth();

        // Validasyon
        if (!data.name) throw new Error("Kategori adı zorunludur.");

        // Slug oluştur (Yeni ise veya boşsa)
        const slug = data.slug || slugify(data.name);

        // Döngü kontrolü (Kendi kendisinin ebeveyni olamaz)
        if (data.id && data.parent_id && Number(data.id) === Number(data.parent_id)) {
            throw new Error("Kategori kendi kendisinin ebeveyni olamaz.");
        }

        const payload = {
            name: data.name,
            slug: slug,
            description: data.description || null,
            parent_id: data.parent_id || null,
            active: data.active,
            sort: data.sort || 0,
            updated_at: new Date().toISOString(),
        };

        let result;
        if (data.id) {
            // Update
            result = await adminSupabase
                .from("categories")
                .update(payload)
                .eq("id", data.id)
                .select()
                .single();
        } else {
            // Insert
            result = await adminSupabase
                .from("categories")
                .insert(payload)
                .select()
                .single();
        }

        if (result.error) throw new Error(result.error.message);

        revalidatePath("/admin/categories");
        return { success: true, message: "Kategori kaydedildi.", data: result.data };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

// 2. Kategori Sil
export async function deleteCategoryAction(id: number) {
    try {
        await checkAuth();

        // Alt kategorileri ve çevirileri CASCADE silebilir veya hata verebilir.
        // Supabase şemasında CASCADE tanımlıysa sorun yok.
        const { error } = await adminSupabase
            .from("categories")
            .delete()
            .eq("id", id);

        if (error) throw new Error(error.message);

        revalidatePath("/admin/categories");
        return { success: true, message: "Kategori silindi." };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

// 3. Çevirileri Kaydet
export async function saveCategoryLocalizationsAction(categoryId: number, localizations: any[]) {
    try {
        await checkAuth();

        const payload = localizations.map(loc => ({
            category_id: categoryId,
            lang_code: loc.lang_code,
            name: loc.name,
            description: loc.description,
            ...(loc.id ? { id: loc.id } : {})
        }));

        const { error } = await adminSupabase
            .from("category_translations")
            .upsert(payload, { onConflict: "category_id, lang_code" as any });

        if (error) throw new Error(error.message);

        revalidatePath(`/admin/categories/${categoryId}`);
        return { success: true, message: "Çeviriler kaydedildi." };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}