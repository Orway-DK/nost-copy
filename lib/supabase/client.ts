// lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

/**
 * Tarayıcı tarafında kullanılacak Supabase client.
 * @supabase/ssr kullanarak cookie'leri otomatik yönetir.
 */
export const createSupabaseBrowserClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
