// lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const cookieStore = await cookies();

  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      // Don't call cookieStore.set during a Server Component render — Next.js disallows mutations.
      // No-op here to avoid the runtime error. If you need cookies written, call this helper
      // from a Server Action or Route Handler where cookie mutations are permitted.
      setAll() {
        console.warn(
          "Supabase attempted to set cookies during a Server Component render. " +
            "Cookie mutations are only allowed in Server Actions or Route Handlers. " +
            "Call createSupabaseServerClient from a Server Action / Route Handler to enable cookie writes."
        );
        // intentionally no-op
      },
    },
  });
}
