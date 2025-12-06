import { createClient } from "@supabase/supabase-js";
// import type { Database } from "@/types/supabase";

/**
 * Admin / Service client:
 * - RLS’i BYPASS eder (secret key)
 * - Sadece Server Action, Route Handler veya arka plan joblarında kullan.
 * - Asla client bundle içine girmemeli.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!secretKey) {
  console.warn(
    "[Supabase] SUPABASE_SERVICE_ROLE_KEY tanımlı değil. Admin client devre dışı."
  );
}

export const adminSupabase = createClient(url, secretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
