// app/admin/(protected)/profile/actions.ts
"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(data: { fullName?: string, password?: string }) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: "Oturum bulunamadı." };

    try {
        const updateData: any = {};
        
        // Şifre değişikliği varsa
        if (data.password && data.password.trim().length > 0) {
            updateData.password = data.password;
        }

        // Meta veri (isim) değişikliği varsa
        if (data.fullName) {
            updateData.data = { full_name: data.fullName };
        }

        if (Object.keys(updateData).length === 0) {
            return { success: true, message: "Değişiklik yapılmadı." };
        }

        const { error } = await supabase.auth.updateUser(updateData);

        if (error) throw error;

        revalidatePath("/admin/profile");
        return { success: true, message: "Profil güncellendi." };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}