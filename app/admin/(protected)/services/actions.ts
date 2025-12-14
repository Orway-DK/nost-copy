"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { adminSupabase } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils"; // Slugify fonksiyonun yoksa basit bir tane aşağıya ekledim

// Yetki Kontrolü
async function checkAuth() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Oturum açmanız gerekiyor.");
    return user;
}

// Basit Slugify (Eğer utils içinde yoksa bunu kullanabilirsin)
function generateSlug(text: string) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Boşlukları tire yap
        .replace(/[^\w\-]+/g, '')       // Alfanümerik olmayanları at
        .replace(/\-\-+/g, '-')         // Tekrar eden tireleri at
        .replace(/^-+/, '')             // Baştaki tireleri at
        .replace(/-+$/, '');            // Sondaki tireleri at
}

// 1. Hizmetleri Getir
export async function getServicesAction() {
    try {
        await checkAuth();
        const { data, error } = await adminSupabase
            .from("services")
            .select(`
                *,
                service_translations (*)
            `)
            .order("id", { ascending: true });

        if (error) throw new Error(error.message);
        return { success: true, data };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

// 2. Ekle / Güncelle (Upsert)
export async function upsertServiceAction(data: any) {
    try {
        await checkAuth();

        // Slug oluştur (Yoksa Title'dan, o da yoksa rastgele)
        let slug = data.slug;
        if (!slug && data.translations) {
            const trTitle = data.translations.find((t: any) => t.lang_code === 'tr')?.title;
            const enTitle = data.translations.find((t: any) => t.lang_code === 'en')?.title;
            slug = generateSlug(trTitle || enTitle || `service-${Date.now()}`);
        }

        // 1. Ana Tablo
        const mainPayload = {
            slug: slug,
            image_url: data.image_url,
            active: data.active,
            // updated_at: new Date().toISOString() // Tablonda trigger varsa gerek yok
        };

        let serviceId = data.id;

        if (serviceId) {
            // Update
            const { error } = await adminSupabase.from("services").update(mainPayload).eq("id", serviceId);
            if (error) throw error;
        } else {
            // Insert
            const { data: inserted, error } = await adminSupabase.from("services").insert(mainPayload).select().single();
            if (error) throw error;
            serviceId = inserted.id;
        }

        // 2. Çeviriler Upsert
        if (data.translations && Array.isArray(data.translations)) {
            const transPayload = data.translations.map((t: any) => ({
                service_id: serviceId,
                lang_code: t.lang_code,
                title: t.title,
                description: t.description,
                content: t.content,
                ...(t.id ? { id: t.id } : {})
            }));

            const { error: transError } = await adminSupabase
                .from("service_translations")
                .upsert(transPayload, { onConflict: "service_id, lang_code" as any });

            if (transError) throw transError;
        }

        revalidatePath("/admin/services");
        return { success: true, message: "Hizmet kaydedildi." };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

// 3. Sil
export async function deleteServiceAction(id: number) {
    try {
        await checkAuth();
        const { error } = await adminSupabase.from("services").delete().eq("id", id);
        if (error) throw new Error(error.message);
        revalidatePath("/admin/services");
        return { success: true, message: "Hizmet silindi." };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}