// @/app/admin/login/submit/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const AUTH_COOKIE = "auth";

export async function POST(req: Request) {
  const reqUrl = new URL(req.url);

  const redirectParam = reqUrl.searchParams.get("redirect") || "/admin";
  const targetUrl = redirectParam.startsWith("/")
    ? new URL(redirectParam, req.url)
    : new URL("/admin", req.url);

  const form = await req.formData();
  const email = String(form.get("email") || "");
  const password = String(form.get("password") || "");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Redirect response; Supabase auth çerezlerini bunun üzerine yazacağız
  const res = NextResponse.redirect(targetUrl);

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        res.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        res.cookies.set({ name, value: "", ...options });
      },
    },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data?.user) {
    const fail = new URL("/admin/login", req.url);
    fail.searchParams.set("redirect", redirectParam);
    fail.searchParams.set("error", "invalid");
    return NextResponse.redirect(fail);
  }

  // İsterseniz mevcut custom çerezinizi de tutabilirsiniz
  const isProd = process.env.NODE_ENV === "production";
  res.cookies.set(
    AUTH_COOKIE,
    JSON.stringify({ email: data.user.email, id: data.user.id }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: "/",
      maxAge: 60 * 60 * 8,
    }
  );

  return res;
}
