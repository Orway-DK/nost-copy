"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

// --- LOGIN ACTION ---
export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email ve şifre zorunludur." };
  }

  // Supabase sunucu istemcisini oluştur (Cookie yönetimi burada yapılır)
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Login hatası:", error.message);
    return { error: "Giriş başarısız. Bilgilerinizi kontrol edin." };
  }

  // Başarılı giriş sonrası:
  revalidatePath("/", "layout"); // Tüm site verisini tazele
  redirect("/admin"); // Yönlendir (Try-catch bloğu dışında olmalı)
}

// --- LOGOUT ACTION ---
export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  
  revalidatePath("/", "layout");
  redirect("/admin/login");
}