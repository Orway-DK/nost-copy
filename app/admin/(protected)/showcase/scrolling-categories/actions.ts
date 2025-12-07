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

// 1. Kategorileri Çek (Sıralı)
export async function getScrollingCategoriesAction() {
    try {
        await checkAuth();
        
        const { data, error } = await adminSupabase
            .from("categories")
            .select(`
                id, slug, active, sort,
                category_translations!inner (name, lang_code)
            `)
            .eq("category_translations.lang_code", "tr")
            .order("sort", { ascending: true });

        if (error) throw new Error(error.message);

        const formatted = data.map((c: any) => ({
            id: c.id,
            slug: c.slug,
            active: c.active,
            sort: c.sort,
            name: c.category_translations[0]?.name || c.slug
        }));

        return { success: true, data: formatted };
    } catch (error: any) {
        return { success: false, message: error.message, data: [] };
    }
}

// 2. Toplu Güncelleme (DÜZELTME: slug ve name eklendi)
export async function updateScrollingCategoriesAction(items: any[]) {
    try {
        await checkAuth();

        const payload = items.map(item => ({
            id: item.id,
            slug: item.slug,   // <-- KRİTİK EKLEME: Slug not-null olduğu için gönderilmeli
            // name: item.name, // Name tablosu farklı olduğu için buraya eklemeye gerek yok, sadece categories tablosunu güncelliyoruz
            active: item.active,
            sort: item.sort,
            // Eğer updated_at kolonunu eklemediysen aşağıdaki satırı sil!
            updated_at: new Date().toISOString() 
        }));

        const { error } = await adminSupabase
            .from("categories")
            .upsert(payload);

        if (error) throw new Error(error.message);

        revalidatePath("/admin/showcase/scrolling-categories");
        revalidatePath("/");
        
        return { success: true, message: "Sıralama ve durumlar güncellendi." };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}