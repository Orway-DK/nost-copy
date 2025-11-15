// @/app/admin/login/submit/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const AUTH_COOKIE = "auth";

export async function POST(req: Request) {
  const reqUrl = new URL(req.url);

  // redirect paramını normalize et → absolute URL’e çevir
  const redirectParam = reqUrl.searchParams.get("redirect") || "/admin";
  const targetUrl = redirectParam.startsWith("/")
    ? new URL(redirectParam, req.url)
    : new URL("/admin", req.url);

  const form = await req.formData();
  const email = String(form.get("email") || "");
  const password = String(form.get("password") || "");
 // test
  // Supabase JS client (SSR cookie helper KULLANMADAN)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

  // Başarılı → kendi admin çerezi
  const res = NextResponse.redirect(targetUrl);
  const isProd = process.env.NODE_ENV === "production";

  res.cookies.set(
    AUTH_COOKIE,
    JSON.stringify({ email: data.user.email, id: data.user.id }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd, // localhost’ta false, prod’da true
      path: "/",
      maxAge: 60 * 60 * 8, // 8 saat
    }
  );

  return res;
}
