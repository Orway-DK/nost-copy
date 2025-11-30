import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Sunucu tarafı logout:
 * - Mevcut cookie'leri okur (await cookies())
 * - Supabase signOut çağrısı yapar
 * - SSR helper setAll ile expire cookie'leri toplar
 * - Response'a uygular + defensive silme
 */
export async function POST() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

  // Next.js 16: cookies() -> Promise
  const cookieStore = await cookies();

  // SSR helper'ın beklediği basit name/value listesi
  const existing = cookieStore.getAll().map((c) => ({
    name: c.name,
    value: c.value,
  }));

  const toSet: { name: string; value: string; options: CookieOptions }[] = [];

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return existing;
      },
      setAll(all) {
        all.forEach((c) => toSet.push(c));
      },
    },
  });

  let signOutError: any = null;
  try {
    const { error } = await supabase.auth.signOut();
    signOutError = error;
  } catch (e) {
    signOutError = e;
  }

  const res = NextResponse.json({
    ok: !signOutError,
    error: signOutError?.message || null,
  });

  // Supabase'in expire ettiği cookie'leri response'a yaz
  toSet.forEach(({ name, value, options }) => {
    res.cookies.set(name, value, options);
  });

  // Defensive silme (bazı varyantlar için)
  const defensiveNames = [
    "sb-access-token",
    "sb-refresh-token",
    // Bazı eski projelerde sb:token kullanılabilir; gerekiyorsa ekleyebilirsin.
    // "sb:token"
  ];

  defensiveNames.forEach((name) => {
    // Silmek yerine explicit boş yaz + maxAge:0 (delete bazı durumlarda path/flags uyuşmazlığında başarısız olabilir)
    try {
      res.cookies.set(name, "", {
        maxAge: 0,
        path: "/",
      });
    } catch {
      /* ignore */
    }
  });

  return res;
}
