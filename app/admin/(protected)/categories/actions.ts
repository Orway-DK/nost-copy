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

        // Önce kategori bilgilerini al (slug'ını bulmak için)
        const { data: category, error: fetchError } = await adminSupabase
            .from("categories")
            .select("slug")
            .eq("id", id)
            .single();

        if (fetchError) throw new Error("Kategori bulunamadı: " + fetchError.message);

        // 1. Bu kategoriye bağlı ürünlerin category_slug'unu NULL yap
        const { error: productsError } = await adminSupabase
            .from("products")
            .update({ category_slug: null })
            .eq("category_slug", category.slug);

        if (productsError) {
            console.warn("Ürünler güncellenemedi (category_slug NULL yapılamadı):", productsError.message);
            // Hata olsa bile devam et, belki ürün yoktur
        }

        // 2. Alt kategorilerin parent_id'sini NULL yap (yetim kalmasınlar)
        const { error: childrenError } = await adminSupabase
            .from("categories")
            .update({ parent_id: null })
            .eq("parent_id", id);

        if (childrenError) {
            console.warn("Alt kategoriler güncellenemedi:", childrenError.message);
        }

        // 3. Kategoriyi sil
        const { error } = await adminSupabase
            .from("categories")
            .delete()
            .eq("id", id);

        if (error) throw new Error(error.message);

        revalidatePath("/admin/categories");
        return { success: true, message: "Kategori silindi. Bağlı ürünlerin kategorisi NULL yapıldı, alt kategoriler yetim kaldı." };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

// 3. Kategori Detaylarını Getir (Silme öncesi modal için)
export async function getCategoryDetailsAction(id: number) {
    try {
        await checkAuth();

        // Kategori bilgilerini al
        const { data: category, error: categoryError } = await adminSupabase
            .from("categories")
            .select("id, name, slug")
            .eq("id", id)
            .single();

        if (categoryError) throw new Error("Kategori bulunamadı: " + categoryError.message);

        // Alt kategorileri getir
        const { data: subcategories, error: subcategoriesError } = await adminSupabase
            .from("categories")
            .select("id, name, slug")
            .eq("parent_id", id)
            .order("name");

        if (subcategoriesError) throw new Error("Alt kategoriler getirilemedi: " + subcategoriesError.message);

        // Bu kategoriye bağlı ürün sayısını getir (product_category_map tablosundan)
        const { count: productCount, error: countError } = await adminSupabase
            .from("product_category_map")
            .select("*", { count: "exact", head: true })
            .eq("category_slug", category.slug);

        if (countError) {
            // Eski sistem için fallback: products tablosundan say
            const { count: oldProductCount } = await adminSupabase
                .from("products")
                .select("*", { count: "exact", head: true })
                .eq("category_slug", category.slug);
            
            return {
                success: true,
                data: {
                    category,
                    subcategories: subcategories || [],
                    productCount: oldProductCount || 0,
                    usesProductCategoryMap: false
                }
            };
        }

        return {
            success: true,
            data: {
                category,
                subcategories: subcategories || [],
                productCount: productCount || 0,
                usesProductCategoryMap: true
            }
        };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

// 4. Seçeneklerle Kategori Sil
export async function deleteCategoryWithOptionsAction(
    id: number, 
    options: { deleteProducts: boolean }
) {
    try {
        await checkAuth();

        // Önce kategori bilgilerini al (slug'ını bulmak için)
        const { data: category, error: fetchError } = await adminSupabase
            .from("categories")
            .select("slug")
            .eq("id", id)
            .single();

        if (fetchError) throw new Error("Kategori bulunamadı: " + fetchError.message);

        // 0. product_category_map tablosundaki ilişkileri sil (foreign key constraint için)
        const { error: mapDeleteError } = await adminSupabase
            .from("product_category_map")
            .delete()
            .eq("category_slug", category.slug);

        if (mapDeleteError) {
            console.warn("product_category_map tablosundan silinemedi:", mapDeleteError.message);
            // Devam et, belki tablo yoktur veya başka bir hata
        }

        // 1. Alt kategorileri sil (önce ürünlerini işle)
        const { data: subcategories, error: subError } = await adminSupabase
            .from("categories")
            .select("id, slug")
            .eq("parent_id", id);

        if (subError) throw new Error("Alt kategoriler getirilemedi: " + subError.message);

        // Her bir alt kategori için işlem yap
        for (const subcat of subcategories || []) {
            // Alt kategorinin product_category_map ilişkilerini sil
            const { error: subMapDeleteError } = await adminSupabase
                .from("product_category_map")
                .delete()
                .eq("category_slug", subcat.slug);

            if (subMapDeleteError) {
                console.warn(`Alt kategori ${subcat.id} product_category_map silinemedi:`, subMapDeleteError.message);
            }

            if (options.deleteProducts) {
                // Alt kategoriye bağlı ürünleri sil (products tablosundan)
                const { error: deleteProductsError } = await adminSupabase
                    .from("products")
                    .delete()
                    .eq("category_slug", subcat.slug);
                
                if (deleteProductsError) {
                    console.warn(`Alt kategori ${subcat.id} ürünleri silinemedi:`, deleteProductsError.message);
                }
            } else {
                // Alt kategoriye bağlı ürünlerin category_slug'unu NULL yap (eski sistem)
                const { error: updateProductsError } = await adminSupabase
                    .from("products")
                    .update({ category_slug: null })
                    .eq("category_slug", subcat.slug);
                
                if (updateProductsError) {
                    console.warn(`Alt kategori ${subcat.id} ürünleri güncellenemedi:`, updateProductsError.message);
                }
            }

            // Alt kategoriyi sil
            const { error: deleteSubError } = await adminSupabase
                .from("categories")
                .delete()
                .eq("id", subcat.id);

            if (deleteSubError) {
                console.warn(`Alt kategori ${subcat.id} silinemedi:`, deleteSubError.message);
            }
        }

        // 2. Ana kategoriye bağlı ürünleri işle
        if (options.deleteProducts) {
            // Ürünleri sil (products tablosundan)
            const { error: deleteProductsError } = await adminSupabase
                .from("products")
                .delete()
                .eq("category_slug", category.slug);
            
            if (deleteProductsError) {
                console.warn("Ana kategori ürünleri silinemedi:", deleteProductsError.message);
            }
        } else {
            // Ürünlerin category_slug'unu NULL yap (eski sistem)
            const { error: updateProductsError } = await adminSupabase
                .from("products")
                .update({ category_slug: null })
                .eq("category_slug", category.slug);
            
            if (updateProductsError) {
                console.warn("Ana kategori ürünleri güncellenemedi:", updateProductsError.message);
            }
        }

        // 3. Ana kategoriyi sil
        const { error } = await adminSupabase
            .from("categories")
            .delete()
            .eq("id", id);

        if (error) throw new Error(error.message);

        revalidatePath("/admin/categories");
        return { 
            success: true, 
            message: `Kategori silindi. ${options.deleteProducts ? 'Ürünler de silindi.' : 'Ürünlerin kategori bağlantısı kaldırıldı.'}` 
        };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

// 5. Çevirileri Kaydet
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
