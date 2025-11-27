import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
// import type { Database } from "@/types/supabase";

/**
 * Server Component içinde kullanıcı session'ını taşıyan client.
 * NOT: Burada publishable key kullanıyoruz (secret değil).
 * Cookie yazımı Server Component render'ında engellendiği için setAll no-op.
 *
 * Eğer cookie yazman gereken nokta varsa (login, logout), bunu
 * Server Action veya Route Handler içinde secret/publishable kombinasyonuyla yap.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        _cookies: { name: string; value: string; options: CookieOptions }[]
      ) {
        // Server Component render aşamasında mutasyon yapılamaz.
        // Login/Logout gibi işlemler için Server Action veya Route Handler kullan.
        console.warn(
          "[Supabase] Cookie setAll çağrısı Server Component içinde engellendi. " +
            "Cookie yazımı için Server Action veya Route Handler kullanın."
        );
      },
    },
  });
}
