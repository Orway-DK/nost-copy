import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
// Eğer veritabanı tiplerini tanımladıysan import et:
// import type { Database } from "@/types/supabase";

/**
 * Tarayıcı tarafında (Client Component, useEffect, form submit, SWR vb.)
 * kullanılacak Supabase client.
 *
 * Yeni publishable key env:
 * NEXT_PUBLIC_SUPABASE_URL
 * NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 */
export const createSupabaseBrowserClient = () =>
  createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
