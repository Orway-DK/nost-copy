// app/auth/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

// --- LOGIN ACTION ---
export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email ve şifre zorunludur." };
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Giriş başarısız. Bilgilerinizi kontrol edin." };
  }

  revalidatePath("/", "layout");
  redirect("/admin"); // Başarılıysa yönlendir
}

// --- LOGOUT ACTION ---
export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/login"); // Çıkış yapınca login'e at
}
