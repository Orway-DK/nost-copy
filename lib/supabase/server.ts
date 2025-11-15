// lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies(); // ❗ Yeni Next.js standardı

  const getCookie = (name: string): string | undefined => {
    const all = cookieStore.getAll(); // artık getAll kesin çalışır
    const found = all.find((c) => c.name === name);
    return found?.value;
  };

  const setCookie = (name: string, value: string, options: CookieOptions) => {
    try {
      cookieStore.set({ name, value, ...options });
    } catch {
      // RSC’de set yasak → sessizce geç
    }
  };

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return getCookie(name);
        },
        set(name: string, value: string, options: CookieOptions) {
          setCookie(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          setCookie(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );
}
